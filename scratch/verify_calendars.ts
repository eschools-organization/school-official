import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  
  const classNames = ["3ა", "3ბ", "3გ", "3დ"];
  const classes = await db.collection('class').find({ ID: { $in: classNames } }).toArray();
  const subjects = await db.collection('subjects').find({}).toArray();

  const subjMap = new Map();
  subjects.forEach(s => subjMap.set(s._id.toString(), s.subject_name || s.name));

  const days = ["ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი"];

  for (const c of classes) {
    console.log(`\n================= CLASS ${c.ID} (${c._id}) =================`);
    if (!c.calendar || !Array.isArray(c.calendar)) {
      console.log("No calendar!");
      continue;
    }
    c.calendar.forEach((day: any[], dayIdx: number) => {
      console.log(`\n--- ${days[dayIdx]} ---`);
      day.forEach((slot: any, slotIdx: number) => {
        if (slot && slot.subject_id && slot.subject_id.toString()) {
          const sName = subjMap.get(slot.subject_id.toString()) || slot.subject_id;
          console.log(`  ${slotIdx + 1}. ${sName} (Teacher: ${slot.teacher_id})`);
        }
      });
    });
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
