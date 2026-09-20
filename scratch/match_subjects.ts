import { getDb } from '../src/lib/db';

async function main() {
  const db = await getDb();
  
  const subjects = await db.collection('subjects').find({}).toArray();

  console.log("=== ALL SUBJECTS ===");
  subjects.forEach(s => {
    console.log(`ID: "${s._id.toString()}" | Name: "${s.name}" | is_project: ${s.is_project}`);
  });

  const subjectNamesNeeded = [
    "ქართული ენა და ლიტერატურა",
    "მათემატიკა",
    "სახვითი და გამოყენებითი ხელოვნება",
    "საღმრთო სჯული",
    "ბუნებისმეტყველება",
    "სპორტი",
    "ინგლისური",
    "მუსიკა",
    "ისტ",
    "მე და საზოგადოება"
  ];

  console.log("\n=== MATCHING NEEDED SUBJECTS ===");
  subjectNamesNeeded.forEach(needed => {
    const matched = subjects.filter(s => {
      if (!s.name) return false;
      const n = s.name.trim().toLowerCase();
      const req = needed.trim().toLowerCase();
      return n === req || n.includes(req) || req.includes(n);
    });
    console.log(`Needed: "${needed}" -> Matches:`, matched.map(m => ({ id: m._id.toString(), name: m.name })));
  });

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
