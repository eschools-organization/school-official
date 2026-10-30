import { NextRequest, NextResponse } from "next/server";
import { getDb, getGradesCollectionName } from "@/lib/db";
import { ObjectId } from "mongodb";
import { invalidateCache } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    const grades = await req.json();

    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json({ message: "მოთხოვნის ტანი არასწორია" }, { status: 400 });
    }

    const db = await getDb();
    const timeStr = new Date().toTimeString().split(" ")[0];

    // Check teacher date permissions unless request is marked as isAdmin
    const firstGrade = grades[0];
    const isAdmin = firstGrade && (firstGrade.isAdmin === true);

    if (!isAdmin) {
      let minAllowedDate: Date;
      if (firstGrade && firstGrade.teacher_id && ObjectId.isValid(firstGrade.teacher_id)) {
        const teacher = await db.collection("teachers").findOne({ _id: new ObjectId(firstGrade.teacher_id) });
        if (teacher && teacher.gradeEntryStartDate) {
          minAllowedDate = new Date(teacher.gradeEntryStartDate);
          minAllowedDate.setHours(0, 0, 0, 0);
        } else {
          minAllowedDate = new Date();
          minAllowedDate.setDate(minAllowedDate.getDate() - 14);
          minAllowedDate.setHours(0, 0, 0, 0);
        }
      } else {
        minAllowedDate = new Date();
        minAllowedDate.setDate(minAllowedDate.getDate() - 14);
        minAllowedDate.setHours(0, 0, 0, 0);
      }

      for (const g of grades) {
        const gDate = new Date(g.date);
        gDate.setHours(0, 0, 0, 0);
        if (gDate < minAllowedDate) {
          return NextResponse.json(
            { message: "მასწავლებელს ნიშნის შეტანა/ჩასწორება შეუძლია მხოლოდ 2 კვირის (14 დღის) ვადით. ჩასასწორებლად მიმართეთ ადმინისტრაციას." },
            { status: 403 }
          );
        }
      }
    }

    // Preload class calendars & makeup events to determine how many lessons a subject has on a date
    const classIds = Array.from(
      new Set(
        grades
          .map((g: any) => (g.class_id ? String(g.class_id) : ""))
          .filter((id: string) => ObjectId.isValid(id))
      )
    ).map((id) => new ObjectId(id));

    const datesSet = Array.from(new Set(grades.map((g: any) => g.date).filter(Boolean)));

    const [classDocs, calendarEvents] = await Promise.all([
      classIds.length > 0 ? db.collection("class").find({ _id: { $in: classIds } }).toArray() : Promise.resolve([]),
      datesSet.length > 0 ? db.collection("calendar_events").find({ date: { $in: datesSet } }).toArray() : Promise.resolve([]),
    ]);

    const classMap = new Map<string, any>();
    for (const c of classDocs) {
      classMap.set(String(c._id), c);
    }
    const eventByDate = new Map<string, any>();
    for (const evt of calendarEvents) {
      if (evt.date) eventByDate.set(evt.date, evt);
    }

    const getMaxLessonsOnDate = (classIdStr: string, subjectIdStr: string, dateStr: string): number => {
      const cls = classMap.get(classIdStr);
      if (!cls || !Array.isArray(cls.calendar) || !dateStr) return 1;
      const evt = eventByDate.get(dateStr);
      let dayIdx = -1;
      if (evt && evt.type === "makeup" && typeof evt.replacementDayOfWeek === "number") {
        dayIdx = evt.replacementDayOfWeek;
      } else {
        const parts = dateStr.split("-").map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          const jsDay = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
          if (jsDay >= 1 && jsDay <= 5) dayIdx = jsDay - 1;
        }
      }
      if (dayIdx < 0 || !Array.isArray(cls.calendar[dayIdx])) return 1;
      const count = cls.calendar[dayIdx].filter(
        (slot: any) => slot && String(slot.subject_id) === subjectIdStr
      ).length;
      return Math.max(1, count);
    };

    // Normalize and deduplicate incoming grades per (student_id, subject_id, date, lesson_num)
    const normalizedGradesMap = new Map<string, { grade: any; explicitId?: string; maxLessons: number }>();

    for (const rawGrade of grades) {
      const grade = { ...rawGrade };
      const explicitId = grade.id || grade._id ? String(grade.id || grade._id) : undefined;
      delete grade.id;
      delete grade._id;
      delete grade.isAdmin;

      grade.time = timeStr;

      const studentIdStr = grade.student_id ? String(grade.student_id) : "";
      const subjectIdStr = grade.subject_id ? String(grade.subject_id) : "";
      const classIdStr = grade.class_id ? String(grade.class_id) : "";
      const maxLessons = getMaxLessonsOnDate(classIdStr, subjectIdStr, grade.date);

      if (!grade.lesson_num || maxLessons <= 1 || grade.lesson_num > maxLessons) {
        grade.lesson_num = 1;
      }

      // Convert string IDs to ObjectId for consistent querying
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

      const dedupKey = `${studentIdStr}_${subjectIdStr}_${grade.date}_${grade.lesson_num}`;
      normalizedGradesMap.set(dedupKey, { grade, explicitId, maxLessons });
    }

    // Group items by target collection name
    const itemsByCollection: Record<string, Array<{ grade: any; explicitId?: string; maxLessons: number }>> = {};
    for (const item of normalizedGradesMap.values()) {
      const collectionName = getGradesCollectionName(item.grade.date);
      if (!itemsByCollection[collectionName]) {
        itemsByCollection[collectionName] = [];
      }
      itemsByCollection[collectionName].push(item);
    }

    const studentPointsToAdd = new Map<string, ObjectId[]>();
    const studentPointsToPull = new Map<string, ObjectId[]>();

    for (const [collectionName, items] of Object.entries(itemsByCollection)) {
      const colDates = Array.from(new Set(items.map((i) => i.grade.date).filter(Boolean)));
      const colSubjectIds: any[] = [];
      for (const sIdStr of new Set(items.map((i) => String(i.grade.subject_id)).filter(Boolean))) {
        colSubjectIds.push(sIdStr);
        if (ObjectId.isValid(sIdStr)) colSubjectIds.push(new ObjectId(sIdStr));
      }

      // Fetch all existing grades for these dates and subjects so we can update in-place without duplicating
      const existingDocs = await db
        .collection(collectionName)
        .find({
          date: { $in: colDates },
          subject_id: { $in: colSubjectIds },
        })
        .toArray();

      const existingByStudentSubjectDate = new Map<string, any[]>();
      for (const doc of existingDocs) {
        const key = `${String(doc.student_id)}_${String(doc.subject_id)}_${doc.date}`;
        if (!existingByStudentSubjectDate.has(key)) {
          existingByStudentSubjectDate.set(key, []);
        }
        existingByStudentSubjectDate.get(key)!.push(doc);
      }

      const ops: any[] = [];
      const duplicateIdsToDelete: ObjectId[] = [];

      for (const { grade, explicitId, maxLessons } of items) {
        const sIdStr = String(grade.student_id);
        const subjIdStr = String(grade.subject_id);
        const key = `${sIdStr}_${subjIdStr}_${grade.date}`;
        const candidates = existingByStudentSubjectDate.get(key) || [];

        let matchedDocs: any[] = [];

        if (maxLessons <= 1) {
          // Only 1 lesson of this subject on this date: all existing records for this student/subject/date belong to this lesson
          matchedDocs = candidates;
        } else {
          // Multiple lessons of this subject scheduled on the same date
          if (explicitId) {
            matchedDocs = candidates.filter(
              (d) => String(d._id) === explicitId || (d.lesson_num || 1) === grade.lesson_num
            );
          }
          if (matchedDocs.length === 0) {
            if (grade.lesson_num === 1) {
              matchedDocs = candidates.filter(
                (d) => !d.lesson_num || d.lesson_num === 1 || d.lesson_num > maxLessons
              );
            } else {
              matchedDocs = candidates.filter((d) => d.lesson_num === grade.lesson_num);
            }
          }
        }

        if (matchedDocs.length > 0) {
          // Prefer the document matching explicitId if provided, otherwise first existing document
          const targetDoc =
            (explicitId && matchedDocs.find((d) => String(d._id) === explicitId)) || matchedDocs[0];

          ops.push({
            updateOne: {
              filter: { _id: targetDoc._id },
              update: { $set: grade },
            },
          });

          if (grade.student_id instanceof ObjectId) {
            const list = studentPointsToAdd.get(sIdStr) || [];
            list.push(targetDoc._id);
            studentPointsToAdd.set(sIdStr, list);
          }

          // Clean up any accidental duplicate documents for this same lesson
          for (const doc of matchedDocs) {
            if (String(doc._id) !== String(targetDoc._id)) {
              duplicateIdsToDelete.push(doc._id);
              if (grade.student_id instanceof ObjectId) {
                const pullList = studentPointsToPull.get(sIdStr) || [];
                pullList.push(doc._id);
                studentPointsToPull.set(sIdStr, pullList);
              }
            }
          }
        } else {
          const newId = new ObjectId();
          ops.push({
            insertOne: {
              document: { _id: newId, ...grade },
            },
          });
          if (grade.student_id instanceof ObjectId) {
            const list = studentPointsToAdd.get(sIdStr) || [];
            list.push(newId);
            studentPointsToAdd.set(sIdStr, list);
          }
        }
      }

      if (ops.length > 0) {
        await db.collection(collectionName).bulkWrite(ops);
      }
      if (duplicateIdsToDelete.length > 0) {
        await db.collection(collectionName).deleteMany({ _id: { $in: duplicateIdsToDelete } });
      }
    }

    // Update student points array with grade ObjectIDs
    const studentOps: any[] = [];
    for (const [sIdStr, addIds] of studentPointsToAdd.entries()) {
      if (ObjectId.isValid(sIdStr) && addIds.length > 0) {
        studentOps.push({
          updateOne: {
            filter: { _id: new ObjectId(sIdStr) },
            update: { $addToSet: { points: { $each: addIds } } },
          },
        });
      }
    }
    for (const [sIdStr, pullIds] of studentPointsToPull.entries()) {
      if (ObjectId.isValid(sIdStr) && pullIds.length > 0) {
        studentOps.push({
          updateOne: {
            filter: { _id: new ObjectId(sIdStr) },
            update: { $pull: { points: { $in: pullIds } } as any },
          },
        });
      }
    }
    if (studentOps.length > 0) {
      await db.collection("students").bulkWrite(studentOps);
    }

    invalidateCache(["student_grades_", "top_students_api", "class_stats_", "class_grades_"]);

    return NextResponse.json({ message: "ნიშნები წარმატებით შეინახა!" });
  } catch (error) {
    console.error("Error in bulk write:", error);
    return NextResponse.json({ message: "შეცდომა შენახვისას" }, { status: 500 });
  }
}
