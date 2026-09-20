import { getDb } from '../src/lib/db';
import { ObjectId } from 'mongodb';

async function main() {
  const db = await getDb();
  
  // 1. Get all teachers
  const teachers = await db.collection('teachers').find({}).toArray();
  const teacherMap = new Map<string, any>();
  teachers.forEach(t => {
    const fullName = `${t.name || ''} ${t.surname || ''}`.trim();
    teacherMap.set(t._id.toString(), { fullName, teacherDoc: t });
  });

  // 2. Get all classes and match tutors
  const classes = await db.collection('class').find({}).toArray();
  console.log("=== CLASSES & TUTORS ===");
  classes.forEach(c => {
    let tutorName = "NO TUTOR";
    const tId = c.damrigebeli || c.tutor_id;
    if (tId && teacherMap.has(tId.toString())) {
      tutorName = teacherMap.get(tId.toString()).fullName;
    }
    console.log(`Class ID: ${c._id}, ID: "${c.ID}", classname: "${c.classname}", TutorID: ${tId}, TutorName: "${tutorName}"`);
  });

  // 3. Sample student doc
  const sampleStudent = await db.collection('students').findOne({});
  console.log("\n=== SAMPLE STUDENT DOC ===");
  console.log(JSON.stringify(sampleStudent, null, 2));

  // 4. Sample class doc students field
  const sampleClassWithStudents = classes.find(c => c.students && c.students.length > 0);
  console.log("\n=== SAMPLE CLASS STUDENTS FIELD ===");
  if (sampleClassWithStudents) {
    console.log(`Class ${sampleClassWithStudents.ID} students sample:`, JSON.stringify(sampleClassWithStudents.students.slice(0, 3), null, 2));
  }

  process.exit(0);
}

main().catch(console.error);
