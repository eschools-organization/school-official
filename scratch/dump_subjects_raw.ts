import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  
  const subjects = await db.collection('subjects').find({}).toArray();

  console.log("=== ALL SUBJECT DOCUMENTS ===");
  console.log(JSON.stringify(subjects, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
