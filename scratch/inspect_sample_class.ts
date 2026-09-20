import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  
  const sampleClass = await db.collection('class').findOne({ ID: '3ა' });
  console.log("3ა Class document:");
  console.log(JSON.stringify(sampleClass, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
