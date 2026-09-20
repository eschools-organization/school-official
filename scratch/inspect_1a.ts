import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  const classIDs = [
    '1ა', '1ბ', '1გ', '1დ', '1ე',
    '2ა', '2ბ', '2გ', '2დ',
    '3ა', '3ბ', '3გ', '3დ',
    '4ა', '4ბ', '4გ', '4დ',
    '5ა', '5ბ', '5გ', '5დ',
    '6ა', '6ბ', '6გ', '6დ'
  ];

  for (const id of classIDs) {
    const c = await db.collection('class').findOne({ ID: id });
    console.log(`${id}: exists=${!!c}, subjectsCount=${c?.subjects?.length || 0}, calendarDays=${c?.calendar ? c.calendar.length : 0}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
