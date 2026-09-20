import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  
  const teachers = await db.collection('teachers').find({}).toArray();
  const teacherMap: Record<string, string> = {};
  teachers.forEach(t => {
    const name = (t.name || '').trim();
    const surname = (t.surname || '').trim();
    const fullName = `${name} ${surname}`.trim();
    teacherMap[t._id.toString()] = fullName;
  });

  const classes = await db.collection('class').find({}).toArray();
  console.log("Class ID -> Class Name & Tutor:");
  classes.forEach(c => {
    const tId = c.damrigebeli || c.tutor_id;
    const tutorName = tId ? (teacherMap[tId.toString()] || tId.toString()) : 'NO TUTOR';
    console.log(`_id: ${c._id}, ID: "${c.ID}", classname: "${c.classname}", tutor: "${tutorName}"`);
  });

  process.exit(0);
}

main().catch(console.error);
