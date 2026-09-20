import { getDb } from '../src/lib/db';
import { ObjectId } from 'mongodb';
import { invalidateCache } from '../src/lib/cache';

const SUBJECT_IDS: Record<string, string> = {
  "ქართული ენა და ლიტერატურა": "6321e8f129af49c19beb9aad",
  "მათემატიკა": "6321e8f129af49c19beb9aa7",
  "სახვითი და გამოყენებითი ხელოვნება": "6321e8f329af49c19beb9abb",
  "საღმრთო სჯული": "6321efac29af49c19beb9ae0",
  "ბუნებისმეტყველება": "6321e8f329af49c19beb9ab9",
  "სპორტი": "6321e8f229af49c19beb9ab3",
  "ინგლისური": "6321e8f229af49c19beb9ab5",
  "მუსიკა": "6321e8f229af49c19beb9aaf",
  "ისტ": "6321e8f329af49c19beb9ac1",
  "მე და საზოგადოება": "6321e8f329af49c19beb9abd"
};

const GRADE_3_SCHEDULES: Record<string, string[][]> = {
  "3ა": [
    // Mon
    ["მათემატიკა", "სახვითი და გამოყენებითი ხელოვნება", "საღმრთო სჯული", "ქართული ენა და ლიტერატურა", "ქართული ენა და ლიტერატურა"],
    // Tue
    ["საღმრთო სჯული", "ინგლისური", "მათემატიკა", "მე და საზოგადოება", "ქართული ენა და ლიტერატურა", "სპორტი"],
    // Wed
    ["ქართული ენა და ლიტერატურა", "სახვითი და გამოყენებითი ხელოვნება", "ბუნებისმეტყველება", "მათემატიკა", "მუსიკა"],
    // Thu
    ["მათემატიკა", "სპორტი", "ინგლისური", "ქართული ენა და ლიტერატურა", "მე და საზოგადოება"],
    // Fri
    ["მუსიკა", "ისტ", "ინგლისური", "მათემატიკა", "ქართული ენა და ლიტერატურა", "ბუნებისმეტყველება"]
  ],
  "3ბ": [
    // Mon
    ["ინგლისური", "მათემატიკა", "ქართული ენა და ლიტერატურა", "ქართული ენა და ლიტერატურა", "სპორტი"],
    // Tue
    ["ქართული ენა და ლიტერატურა", "სახვითი და გამოყენებითი ხელოვნება", "მათემატიკა", "საღმრთო სჯული", "ბუნებისმეტყველება", "სპორტი"],
    // Wed
    ["საღმრთო სჯული", "ქართული ენა და ლიტერატურა", "მუსიკა", "მათემატიკა", "ინგლისური", "მე და საზოგადოება"],
    // Thu
    ["მათემატიკა", "სახვითი და გამოყენებითი ხელოვნება", "ისტ", "ბუნებისმეტყველება", "ქართული ენა და ლიტერატურა"],
    // Fri
    ["ინგლისური", "მათემატიკა", "მე და საზოგადოება", "ქართული ენა და ლიტერატურა", "მუსიკა"]
  ],
  "3გ": [
    // Mon
    ["მუსიკა", "მათემატიკა", "ქართული ენა და ლიტერატურა", "სახვითი და გამოყენებითი ხელოვნება", "ინგლისური", "მე და საზოგადოება"],
    // Tue
    ["სპორტი", "ქართული ენა და ლიტერატურა", "საღმრთო სჯული", "მათემატიკა", "ბუნებისმეტყველება"],
    // Wed
    ["მათემატიკა", "ქართული ენა და ლიტერატურა", "ქართული ენა და ლიტერატურა", "სახვითი და გამოყენებითი ხელოვნება", "ისტ", "მუსიკა"],
    // Thu
    ["მათემატიკა", "ქართული ენა და ლიტერატურა", "ინგლისური", "სპორტი", "საღმრთო სჯული"],
    // Fri
    ["მე და საზოგადოება", "მათემატიკა", "ბუნებისმეტყველება", "ინგლისური", "ქართული ენა და ლიტერატურა"]
  ],
  "3დ": [
    // Mon
    ["ინგლისური", "სპორტი", "სახვითი და გამოყენებითი ხელოვნება", "ბუნებისმეტყველება", "მათემატიკა", "ქართული ენა და ლიტერატურა"],
    // Tue
    ["მათემატიკა", "საღმრთო სჯული", "ქართული ენა და ლიტერატურა", "მე და საზოგადოება", "ინგლისური"],
    // Wed
    ["მუსიკა", "მათემატიკა", "საღმრთო სჯული", "ბუნებისმეტყველება", "ქართული ენა და ლიტერატურა"],
    // Thu
    ["ინგლისური", "მე და საზოგადოება", "ქართული ენა და ლიტერატურა", "სახვითი და გამოყენებითი ხელოვნება", "მათემატიკა", "სპორტი"],
    // Fri
    ["ქართული ენა და ლიტერატურა", "ქართული ენა და ლიტერატურა", "მუსიკა", "ისტ", "მათემატიკა"]
  ]
};

async function main() {
  const db = await getDb();
  
  const classNames = ["3ა", "3ბ", "3გ", "3დ"];
  const classes = await db.collection('class').find({ ID: { $in: classNames } }).toArray();

  for (const classDoc of classes) {
    const classIDStr = classDoc.ID;
    const scheduleNames = GRADE_3_SCHEDULES[classIDStr];
    if (!scheduleNames) continue;

    // Create a subject_id -> teacher_id lookup map from class.subjects
    const teacherMap: Record<string, string> = {};
    if (classDoc.subjects && Array.isArray(classDoc.subjects)) {
      classDoc.subjects.forEach((cs: any) => {
        if (cs.subject_id && cs.teacher_id) {
          teacherMap[cs.subject_id.toString()] = cs.teacher_id.toString();
        }
      });
    }

    console.log(`\nUpdating calendar for class ${classIDStr} (${classDoc._id})...`);

    // Build 5 days x 7 slots array
    const newCalendar = [];
    for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
      const dayLessons = scheduleNames[dayIdx] || [];
      const daySlots = [];
      for (let slotIdx = 0; slotIdx < 7; slotIdx++) {
        const subjName = dayLessons[slotIdx];
        if (subjName && SUBJECT_IDS[subjName]) {
          const subId = SUBJECT_IDS[subjName];
          const teachId = teacherMap[subId] || "";
          daySlots.push({
            subject_id: new ObjectId(subId),
            teacher_id: teachId && ObjectId.isValid(teachId) ? new ObjectId(teachId) : teachId
          });
        } else {
          daySlots.push({
            subject_id: "",
            teacher_id: ""
          });
        }
      }
      newCalendar.push(daySlots);
    }

    // Update class document in database
    await db.collection('class').updateOne(
      { _id: classDoc._id },
      { $set: { calendar: newCalendar } }
    );
    console.log(`Successfully updated calendar for class ${classIDStr}`);
  }

  // Rebuild teacher calendars from all classes
  console.log("\nRebuilding teacher calendars across all classes...");
  const allClasses = await db.collection("class").find({}).toArray();
  const teacherSchedules: Record<string, { teacher_id: ObjectId; subject_id: ObjectId }[][]> = {};

  for (const cls of allClasses) {
    if (!cls.calendar) continue;
    for (let dayIdx = 0; dayIdx < cls.calendar.length; dayIdx++) {
      for (let lessonIdx = 0; lessonIdx < cls.calendar[dayIdx].length; lessonIdx++) {
        const entry = cls.calendar[dayIdx][lessonIdx];
        if (entry && entry.teacher_id && entry.teacher_id.toString() !== "" && entry.teacher_id.toString() !== "000000000000000000000000") {
          const tid = entry.teacher_id.toString();
          if (!teacherSchedules[tid]) {
            teacherSchedules[tid] = Array.from({ length: 5 }, () =>
              Array.from({ length: 7 }, () => ({
                teacher_id: new ObjectId("000000000000000000000000"),
                subject_id: new ObjectId("000000000000000000000000")
              }))
            );
          }
          teacherSchedules[tid][dayIdx][lessonIdx] = {
            teacher_id: new ObjectId(cls._id.toString()), // Note: teacher schedule stores class_id/subject_id or teacher_id/subject_id
            subject_id: entry.subject_id && ObjectId.isValid(entry.subject_id) ? new ObjectId(entry.subject_id) : entry.subject_id
          };
        }
      }
    }
  }

  const teacherCollection = db.collection("teachers");
  for (const [teacherID, cal] of Object.entries(teacherSchedules)) {
    if (ObjectId.isValid(teacherID)) {
      await teacherCollection.updateOne(
        { _id: new ObjectId(teacherID) },
        { $set: { calendar: cal } }
      );
    }
  }
  console.log("Teacher calendars rebuilt successfully.");

  invalidateCache("all_classes_formatted");
  console.log("All done!");

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
