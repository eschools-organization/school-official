import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  
  const targetIDs = ['3ა', '3ბ', '3გ', '3დ'];
  const classes = await db.collection('class').find({ ID: { $in: targetIDs } }).toArray();
  const subjects = await db.collection('subjects').find({}).toArray();
  const teachers = await db.collection('teachers').find({}).toArray();

  const subjMap = new Map();
  subjects.forEach(s => subjMap.set(s._id.toString(), s.subject_name || s.name));

  const teacherMap = new Map();
  teachers.forEach(t => teacherMap.set(t._id.toString(), `${t.name} ${t.surname}`));

  for (const c of classes) {
    console.log(`\n================ CLASS ${c.ID} (${c._id}) ================`);
    console.log(`Tutor (damrigebeli): ${c.damrigebeli} (${teacherMap.get(c.damrigebeli?.toString()) || 'None'})`);
    console.log("Existing Subjects:");
    const existingSubjIDs = new Set();
    if (c.subjects) {
      c.subjects.forEach((s: any) => {
        existingSubjIDs.add(s.subject_id?.toString());
        console.log(`  - Subject: "${subjMap.get(s.subject_id?.toString())}" (${s.subject_id}), Teacher: "${teacherMap.get(s.teacher_id?.toString())}" (${s.teacher_id}), hours: ${s.hours_per_week}`);
      });
    }

    const requiredSubjects = [
      { id: "6321e8f129af49c19beb9aad", name: "ქართული ენა და ლიტერატურა" },
      { id: "6321e8f129af49c19beb9aa7", name: "მათემატიკა" },
      { id: "6321e8f329af49c19beb9abb", name: "სახვითი და გამოყენებითი ხელოვნება" },
      { id: "6321efac29af49c19beb9ae0", name: "საღმრთო სჯული" },
      { id: "6321e8f329af49c19beb9ab9", name: "ბუნებისმეტყველება" },
      { id: "6321e8f229af49c19beb9ab3", name: "სპორტი" },
      { id: "6321e8f229af49c19beb9ab5", name: "ინგლისური" },
      { id: "6321e8f229af49c19beb9aaf", name: "მუსიკა" },
      { id: "6321e8f329af49c19beb9ac1", name: "ისტ" },
      { id: "6321e8f329af49c19beb9abd", name: "მე და საზოგადოება" }
    ];

    console.log("Missing Subjects:");
    requiredSubjects.forEach(rs => {
      if (!existingSubjIDs.has(rs.id)) {
        console.log(`  MISSING: "${rs.name}" (${rs.id})`);
      }
    });
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
