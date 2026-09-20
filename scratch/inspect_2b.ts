import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  const c = await db.collection('class').findOne({ ID: '2ბ' });

  console.log('2ბ subjects:', JSON.stringify(c?.subjects, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
