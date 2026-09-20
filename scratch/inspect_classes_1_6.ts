import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  const c = await db.collection('class').findOne({ ID: '5ა' });

  console.log('Class 5ა subjects:', JSON.stringify(c?.subjects, null, 2));
  console.log('Class 5ა calendar sample:', JSON.stringify(c?.calendar?.[0], null, 2)); // day 0 (Monday)

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
