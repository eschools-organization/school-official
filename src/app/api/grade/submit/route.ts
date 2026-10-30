import { NextRequest, NextResponse } from "next/server";
import { getDb, getGradesCollectionName } from "@/lib/db";
import { ObjectId } from "mongodb";
import { invalidateCache } from "@/lib/cache";

export async function POST(req: NextRequest) {
  const grade = await req.json();

  // Convert string IDs to ObjectId
  if (grade.teacher_id && ObjectId.isValid(grade.teacher_id)) {
    grade.teacher_id = new ObjectId(grade.teacher_id);
  }
  if (grade.student_id && ObjectId.isValid(grade.student_id)) {
    grade.student_id = new ObjectId(grade.student_id);
  }
  if (grade.subject_id && ObjectId.isValid(grade.subject_id)) {
    grade.subject_id = new ObjectId(grade.subject_id);
  }
  if (grade.class_id && ObjectId.isValid(grade.class_id)) {
    grade.class_id = new ObjectId(grade.class_id);
  }

  const db = await getDb();
  let teacher = null;
  if (grade.teacher_id) {
    const teacherCollection = db.collection("teachers");
    teacher = await teacherCollection.findOne({ _id: grade.teacher_id });
  }

  // Date validation: Admin has no date limit; Teachers restricted to 2 weeks (14 days) or gradeEntryStartDate
  if (grade.isAdmin !== true) {
    const gradeDate = new Date(grade.date);
    gradeDate.setHours(0, 0, 0, 0);

    let minAllowedDate: Date;
    if (teacher && teacher.gradeEntryStartDate) {
      minAllowedDate = new Date(teacher.gradeEntryStartDate);
      minAllowedDate.setHours(0, 0, 0, 0);
    } else {
      minAllowedDate = new Date();
      minAllowedDate.setDate(minAllowedDate.getDate() - 14);
      minAllowedDate.setHours(0, 0, 0, 0);
    }

    if (gradeDate < minAllowedDate) {
      return NextResponse.json(
        { message: "მასწავლებელს ნიშნის შეტანა/ჩასწორება შეუძლია მხოლოდ 2 კვირის (14 დღის) ვადით. ჩასასწორებლად მიმართეთ ადმინისტრაციას." },
        { status: 403 }
      );
    }
  }

  // Clean up isAdmin property before saving
  if (grade && typeof grade === "object" && "isAdmin" in grade) {
    delete grade.isAdmin;
  }

  // Add timestamp
  grade.time = new Date().toTimeString().split(" ")[0];

  const targetId = grade.id || grade._id;
  delete grade.id;
  delete grade._id;

  // Determine how many lessons of this subject are scheduled for this class on this date
  let maxLessons = 1;
  if (grade.class_id && grade.subject_id && grade.date) {
    const [cls, evt] = await Promise.all([
      db.collection("class").findOne({ _id: grade.class_id }),
      db.collection("calendar_events").findOne({ date: grade.date }),
    ]);
    if (cls && Array.isArray(cls.calendar)) {
      let dayIdx = -1;
      if (evt && evt.type === "makeup" && typeof evt.replacementDayOfWeek === "number") {
        dayIdx = evt.replacementDayOfWeek;
      } else {
        const parts = String(grade.date).split("-").map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          const jsDay = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
          if (jsDay >= 1 && jsDay <= 5) dayIdx = jsDay - 1;
        }
      }
      if (dayIdx >= 0 && Array.isArray(cls.calendar[dayIdx])) {
        const count = cls.calendar[dayIdx].filter(
          (slot: any) => slot && String(slot.subject_id) === String(grade.subject_id)
        ).length;
        maxLessons = Math.max(1, count);
      }
    }
  }

  if (!grade.lesson_num || maxLessons <= 1 || grade.lesson_num > maxLessons) {
    grade.lesson_num = 1;
  }

  const collectionName = getGradesCollectionName(grade.date);

  // Check existing grades for this student, subject, and date so we update in-place and never duplicate
  if (grade.student_id && grade.subject_id && grade.date) {
    const sIdStr = String(grade.student_id);
    const subjIdStr = String(grade.subject_id);
    const studentIds: any[] = [sIdStr];
    if (ObjectId.isValid(sIdStr)) studentIds.push(new ObjectId(sIdStr));
    const subjectIds: any[] = [subjIdStr];
    if (ObjectId.isValid(subjIdStr)) subjectIds.push(new ObjectId(subjIdStr));

    const existingDocs = await db
      .collection(collectionName)
      .find({
        student_id: { $in: studentIds },
        subject_id: { $in: subjectIds },
        date: grade.date,
      })
      .toArray();

    let matchedDocs: any[] = [];
    if (maxLessons <= 1) {
      matchedDocs = existingDocs;
    } else {
      if (targetId) {
        matchedDocs = existingDocs.filter(
          (d) => String(d._id) === String(targetId) || (d.lesson_num || 1) === grade.lesson_num
        );
      }
      if (matchedDocs.length === 0) {
        if (grade.lesson_num === 1) {
          matchedDocs = existingDocs.filter(
            (d) => !d.lesson_num || d.lesson_num === 1 || d.lesson_num > maxLessons
          );
        } else {
          matchedDocs = existingDocs.filter((d) => d.lesson_num === grade.lesson_num);
        }
      }
    }

    if (matchedDocs.length > 0) {
      const targetDoc =
        (targetId && matchedDocs.find((d) => String(d._id) === String(targetId))) || matchedDocs[0];

      await db.collection(collectionName).updateOne({ _id: targetDoc._id }, { $set: grade });

      const duplicateIds = matchedDocs
        .filter((d) => String(d._id) !== String(targetDoc._id))
        .map((d) => d._id);

      if (duplicateIds.length > 0) {
        await db.collection(collectionName).deleteMany({ _id: { $in: duplicateIds } });
        await db.collection("students").updateOne(
          { _id: grade.student_id },
          { $pull: { points: { $in: duplicateIds } } as any }
        );
      }

      await db.collection("students").updateOne(
        { _id: grade.student_id },
        { $addToSet: { points: targetDoc._id } }
      );

      invalidateCache(["student_grades_", "top_students_api", "class_stats_", "class_grades_"]);
      return NextResponse.json({ message: "ნიშანი წარმატებით განახლდა!" });
    }
  }

  if (targetId && ObjectId.isValid(targetId)) {
    const objectId = new ObjectId(targetId);
    const updateResult = await db.collection(collectionName).updateOne(
      { _id: objectId },
      { $set: grade }
    );

    if (updateResult.matchedCount > 0) {
      if (grade.student_id) {
        await db.collection("students").updateOne(
          { _id: grade.student_id },
          { $addToSet: { points: objectId } }
        );
      }
      invalidateCache(["student_grades_", "top_students_api", "class_stats_", "class_grades_"]);
      return NextResponse.json({ message: "ნიშანი წარმატებით განახლდა!" });
    }
  }

  const insertResult = await db.collection(collectionName).insertOne(grade);

  if (insertResult.insertedId && grade.student_id) {
    await db.collection("students").updateOne(
      { _id: grade.student_id },
      { $addToSet: { points: insertResult.insertedId } }
    );
  }

  invalidateCache(["student_grades_", "top_students_api", "class_stats_", "class_grades_"]);

  return NextResponse.json({ message: "ნიშანი წარმატებით დაემატა ან განახლდა!" });
}
