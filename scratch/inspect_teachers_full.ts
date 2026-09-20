import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  const teachers = await db.collection('teachers').find({}).toArray();

  const searchNames = [
    'ჯაფარიძე', 'სანიკიძე', 'რუხაძე', 'უგულავა', 'მანჯგალაძე',
    'ჩხარტიშვილი', 'მშველიძე', 'სირაბიძე', 'ქავჟარაძე', 'ონიაშვილი'
  ];

  for (const s of searchNames) {
    const matches = teachers.filter(t => `${t.name} ${t.surname}`.includes(s));
    console.log(`Search "${s}":`, matches.map(m => ({ id: m._id.toString(), name: `${m.name} ${m.surname}` })));
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
