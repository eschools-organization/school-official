import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  const cols = await db.listCollections().toArray();
  console.log("Collections:", cols.map(c => c.name));

  const teacherCol = cols.some(c => c.name === 'teachers') ? 'teachers' : 'teacher';
  const teachers = await db.collection(teacherCol).find({}).toArray();
  console.log(`Teachers count (${teacherCol}):`, teachers.length);

  teachers.forEach(t => {
    console.log(`Teacher ID: ${t._id}, Name: "${t.name}", Surname: "${t.surname}"`);
  });

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
