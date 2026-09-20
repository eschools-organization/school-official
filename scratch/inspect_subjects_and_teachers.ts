import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  const subjects = await db.collection('subjects').find({}).toArray();

  for (const s of subjects) {
    console.log(s._id.toString(), s);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
