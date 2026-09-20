import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  const classes = await db.collection('class').find({}).toArray();
  console.log("Existing class names in DB:");
  classes.forEach(c => {
    console.log(`_id: ${c._id}, ID: "${c.ID}", classname: "${c.classname}"`);
  });

  const subjects = await db.collection('subjects').find({}).toArray();
  console.log("\nExisting subjects in DB:");
  subjects.forEach(s => {
    console.log(`_id: ${s._id}, name: "${s.name || s.subject_name}"`);
  });

  process.exit(0);
}

main().catch(console.error);
