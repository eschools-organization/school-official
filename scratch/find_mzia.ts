import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  const teachers = await db.collection('teachers').find({}).toArray();
  console.log("Searching for Mzia Chanturia...");
  const mzia = teachers.filter(t => (t.name || '').includes('მზია') || (t.surname || '').includes('ჭანტურია'));
  console.log("Mzia search results:", mzia);

  const allClasses = await db.collection('class').find({}).toArray();
  console.log("\nAll class IDs in DB:", allClasses.map(c => ({ _id: c._id, ID: c.ID, classname: c.classname })));

  process.exit(0);
}

main().catch(console.error);
