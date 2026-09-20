import { getDb } from '../src/lib/db';
import { ObjectId } from 'mongodb';
import { invalidateCache } from '../src/lib/cache';

const ZERO_A_CLASS_ID_STR = "6aada792c93d7b7595f15b46"; // 0ა

const STUDENTS_TO_MOVE = [
  { num: 1, name: "ლიზი მურჯიკნელი", pn: "01951007804" },
  { num: 2, name: "ლუკა მურჯიკნელი", pn: "61750009940" },
  { num: 3, name: "სოფიო ზოიძე", pn: "61150010611" },
  { num: 4, name: "ანდრია მახარაძე", pn: "61850011564" },
  { num: 5, name: "თომა  ჩაგანავა", pn: "61650008209" },
  { num: 6, name: "ანდრო სხვიტარიძე", pn: "18250002194" },
  { num: 7, name: "ელენე ნაკაშიძე", pn: "61701095646" },
  { num: 8, name: "დაჩი ჟოჟაძე", pn: "61552003249" },
  { num: 9, name: "საბა ჯინჭარაძე", pn: "61750009369" },
  { num: 10, name: "თამარ ტაკიძე", pn: "61450015296" },
  { num: 11, name: "ზურა შაშიკაძე", pn: "61750007154" },
  { num: 12, name: "აბელ კაპანაძე", pn: "61450018870" },
  { num: 13, name: "ანასტასია შაშიკაძე", pn: "01753011788" },
  { num: 14, name: "ნია ხარაძე", pn: "61450024323" },
  { num: 15, name: "ნიკოლოზ მიქელაძე", pn: "61650012337" },
  { num: 16, name: "გიორგი მეგრელიძე", pn: "61650013295" },
  { num: 17, name: "ნუცა ტაკიძე", pn: "61950024134" },
  { num: 18, name: "ინა ზოიძე", pn: "61650022482" },
  { num: 19, name: "ბარბარე ხარებავა", pn: "60450037814" },
  { num: 20, name: "სანდრო ცეცხლაძე", pn: "61401099911" },
  { num: 21, name: "ემილია წერეთელი", pn: "6140032172" },
  { num: 22, name: "ანა ახცხეციანი", pn: "61450037521" },
  { num: 23, name: "ანასტასია ანთიძე", pn: "61750037277" },
  { num: 24, name: "ანდრია ილიაძე", pn: "61450036803" },
  { num: 25, name: "გაბრიელი მამალაძე", pn: "61950037092" },
  { num: 26, name: "ლიზა ზაქარაძე", pn: "60850016886" },
  { num: 27, name: "სოლომონ ქიქავა", pn: "61350008813" },
  { num: 28, name: "საბა ქვარიანი", pn: "61250014454" },
  { num: 29, name: "სანდრო ქვარიანი", pn: "61950037792" },
  { num: 30, name: "ლილე დიოგიძე", pn: "61250032667" },
  { num: 31, name: "საბა რომანაძე", pn: "61850007396" },
  { num: 32, name: "ილია გოგიტიძე", pn: "61450018050" },
  { num: 33, name: "იოანა გოგიტიძე", pn: "61950027977" },
  { num: 34, name: "ეკატერინე გოგიტიძე", pn: "61950036044" },
  { num: 35, name: "ბუკა გირკელიძე", pn: "61950016165" },
  { num: 36, name: "მართა უნგიაძე", pn: "61650021224" },
  { num: 37, name: "ალექსანდრე ნაგერვაძე", pn: "61150031437" },
  { num: 38, name: "მარიამ მამულაშვილი", pn: "01250067339" },
  { num: 39, name: "ილია მკრტიჩიან", pn: "61650045954" },
  { num: 40, name: "მაშო  მამალძე", pn: "61150046251" },
  { num: 41, name: "ალექსანდრე ილიაძე", pn: "61350046875" },
  { num: 42, name: "შიო გოგიტიძე", pn: "61950047456" },
  { num: 43, name: "თომა გოგია", pn: "61350045967" },
  { num: 44, name: "ტასო ჩხაიძე", pn: "61650035490" },
  { num: 45, name: "ეთერი ჭყონია", pn: "61201100698" },
  { num: 46, name: "მაშო  ხუხუნაიშვილი", pn: "01450158939" },
  { num: 47, name: "მართა წულაძე", pn: "61450015126" },
  { num: 48, name: "ანამარია კალანდაძე", pn: "61150054189" },
  { num: 49, name: "ევა თებიძე", pn: "61250050681" },
  { num: 50, name: "დანიელ შაინიძე", pn: "61550052423" },
  { num: 51, name: "გაბრიელ სტამუსი", pn: "61150054170" },
  { num: 52, name: "მატილდა მინდაძე", pn: "61750053685" },
  { num: 53, name: "ქეთევან გოგუაძე", pn: "56750000779" }
];

async function main() {
  const db = await getDb();
  const studentsCol = db.collection('students');
  const classCol = db.collection('class');

  const zeroAObjId = new ObjectId(ZERO_A_CLASS_ID_STR);

  console.log(`Processing ${STUDENTS_TO_MOVE.length} students to move to 0ა...`);

  let movedCount = 0;
  let notFoundCount = 0;

  for (const item of STUDENTS_TO_MOVE) {
    const studentDoc = await studentsCol.findOne({ $or: [{ ID: item.pn }, { user_ID: item.pn }] });

    if (!studentDoc) {
      console.warn(`[#${item.num}] NOT FOUND: ${item.name} (${item.pn})`);
      notFoundCount++;
      continue;
    }

    const oldClassId = studentDoc.class_id;
    const studentMongoIdStr = studentDoc._id.toString();

    // 1. Remove from old class's students array
    if (oldClassId) {
      await classCol.updateOne(
        { _id: oldClassId },
        {
          $pull: {
            students: {
              $or: [
                { student_id: studentMongoIdStr },
                { _id: new ObjectId(studentMongoIdStr) }
              ]
            } as any
          }
        }
      ).catch(() => {});
      await classCol.updateOne(
        { _id: oldClassId },
        { $pull: { students: studentMongoIdStr as any } }
      ).catch(() => {});
    }

    // 2. Update student's class_id to 0ა
    await studentsCol.updateOne(
      { _id: studentDoc._id },
      { $set: { class_id: zeroAObjId } }
    );

    // 3. Add to 0ა class's students array
    const zeroAClass = await classCol.findOne({ _id: zeroAObjId });
    const existing0AStudents = zeroAClass?.students || [];

    let alreadyIn0A = false;
    for (const cs of existing0AStudents) {
      if (typeof cs === 'string' && cs === studentMongoIdStr) alreadyIn0A = true;
      else if (cs && typeof cs === 'object' && (cs.student_id === studentMongoIdStr || String(cs._id) === studentMongoIdStr)) alreadyIn0A = true;
    }

    if (!alreadyIn0A) {
      if (existing0AStudents.length > 0 && typeof existing0AStudents[0] === 'object' && existing0AStudents[0].student_id) {
        await classCol.updateOne(
          { _id: zeroAObjId },
          { $push: { students: { student_id: studentMongoIdStr, _id: new ObjectId(), choosedSubjects: [] } } }
        );
      } else {
        await classCol.updateOne(
          { _id: zeroAObjId },
          { $addToSet: { students: studentMongoIdStr } }
        );
      }
    }

    console.log(`[#${item.num}] Moved ${item.name} (${item.pn}) to class 0ა (Old Class: ${oldClassId})`);
    movedCount++;
  }

  invalidateCache();
  console.log(`\nDONE: Moved ${movedCount} students to 0ა. Not found: ${notFoundCount}. Cache invalidated!`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
