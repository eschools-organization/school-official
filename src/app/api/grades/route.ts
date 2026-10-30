import { NextRequest, NextResponse } from "next/server";
import { getDb, findGrades } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getCachedOrFetch } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const classID = req.nextUrl.searchParams.get("class_id");
  const subjectID = req.nextUrl.searchParams.get("subject_id");

  if (!classID) {
    return NextResponse.json({ error: "class_id is required" }, { status: 400 });
  }

  if (!ObjectId.isValid(classID)) {
    return NextResponse.json({ error: "Invalid class_id format" }, { status: 400 });
  }

  const db = await getDb();
  const filter: Record<string, any> = { class_id: new ObjectId(classID) };

  if (subjectID) {
    if (!ObjectId.isValid(subjectID)) {
      return NextResponse.json({ error: "Invalid subject_id format" }, { status: 400 });
    }
    filter.subject_id = new ObjectId(subjectID);
  }

  const year = req.nextUrl.searchParams.get("year");
  const date = req.nextUrl.searchParams.get("date");
  if (date) {
    filter.date = date;
  }

  const pointType = req.nextUrl.searchParams.get("pointType");
  if (pointType) {
    filter.pointType = parseInt(pointType, 10);
  }

  const lessonNum = req.nextUrl.searchParams.get("lesson_num");
  const requestedLessonNum = lessonNum ? parseInt(lessonNum, 10) : null;

  if (requestedLessonNum && !date) {
    if (requestedLessonNum === 1) {
      filter.lesson_num = { $in: [1, null, undefined] };
    } else {
      filter.lesson_num = requestedLessonNum;
    }
  }

  const cacheKey = `class_grades_${classID}_${subjectID || ""}_${year || ""}_${date || ""}_${pointType || ""}_${lessonNum || ""}`;
  const grades = await getCachedOrFetch(cacheKey, 30000, async () => {
    const rawGrades = await findGrades(db, filter, { year, date });

    if (!date || !requestedLessonNum) {
      return rawGrades;
    }

    let maxLessons = 1;
    if (subjectID) {
      const [cls, evt] = await Promise.all([
        db.collection("class").findOne({ _id: new ObjectId(classID) }),
        db.collection("calendar_events").findOne({ date }),
      ]);
      if (cls && Array.isArray(cls.calendar)) {
        let dayIdx = -1;
        if (evt && evt.type === "makeup" && typeof evt.replacementDayOfWeek === "number") {
          dayIdx = evt.replacementDayOfWeek;
        } else {
          const parts = date.split("-").map(Number);
          if (parts.length === 3 && !parts.some(isNaN)) {
            const jsDay = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
            if (jsDay >= 1 && jsDay <= 5) dayIdx = jsDay - 1;
          }
        }
        if (dayIdx >= 0 && Array.isArray(cls.calendar[dayIdx])) {
          const count = cls.calendar[dayIdx].filter(
            (slot: any) => slot && String(slot.subject_id) === String(subjectID)
          ).length;
          maxLessons = Math.max(1, count);
        }
      }
    }

    const effectiveNum = maxLessons <= 1 ? 1 : requestedLessonNum;
    const filtered = rawGrades.filter((g: any) => {
      if (maxLessons <= 1) return true;
      const gNum = g.lesson_num || 1;
      if (effectiveNum === 1) {
        return gNum === 1 || gNum > maxLessons;
      }
      return gNum === effectiveNum;
    });

    // Deduplicate per student_id, preferring a record with an actual mark/comment or latest time
    const scoreDocPriority = (g: any): number => {
      if (typeof g.point === "number" && g.point >= 0) return 3;
      if (g.point === -3 || (g.comment && String(g.comment).trim() !== "")) return 3;
      if (g.point === -2 || g.checked === false) return 2;
      return 1;
    };

    const byStudent = new Map<string, any>();
    for (const g of filtered) {
      const sKey = String(g.student_id);
      const prev = byStudent.get(sKey);
      if (!prev) {
        byStudent.set(sKey, g);
      } else {
        const pNew = scoreDocPriority(g);
        const pOld = scoreDocPriority(prev);
        if (pNew > pOld || (pNew === pOld && String(g.time || "") >= String(prev.time || ""))) {
          byStudent.set(sKey, g);
        }
      }
    }

    return Array.from(byStudent.values());
  });

  return NextResponse.json(grades);
}
