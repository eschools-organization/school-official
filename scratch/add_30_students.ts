import { getDb } from '../src/lib/db';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { invalidateCache } from '../src/lib/cache';

interface StudentData {
  num: number;
  name: string;
  surname: string;
  pn: string;
  tutorName: string;
  className: string;
  classObjectIdStr: string;
}

const STUDENTS_LIST: StudentData[] = [
  { num: 1, name: "დემეტრე", surname: "შეწირული", pn: "61350054404", tutorName: "მანანა გოგიბერიძე", className: "2ა", classObjectIdStr: "68c9b9b35ea88ebf2d9a16a3" },
  { num: 2, name: "ანდრია", surname: "ზოიძე", pn: "61550054058", tutorName: "თეა ქორჩილავა", className: "2დ", classObjectIdStr: "68c9b9bc5ea88ebf2d9a16af" },
  { num: 3, name: "ლილე", surname: "ჩხაიძე", pn: "61850051892", tutorName: "თეა ქორჩილავა", className: "2დ", classObjectIdStr: "68c9b9bc5ea88ebf2d9a16af" },
  { num: 4, name: "ელინა", surname: "ხალვაში", pn: "61650051217", tutorName: "თეა ქორჩილავა", className: "2დ", classObjectIdStr: "68c9b9bc5ea88ebf2d9a16af" },
  { num: 5, name: "მაქსიმე", surname: "ჩხაიძე", pn: "61950053210", tutorName: "თეა ქორჩილავა", className: "2დ", classObjectIdStr: "68c9b9bc5ea88ebf2d9a16af" },
  { num: 6, name: "ნინო", surname: "ბაგრატიონი", pn: "61950049242", tutorName: "თეა ქორჩილავა", className: "2დ", classObjectIdStr: "68c9b9bc5ea88ebf2d9a16af" },
  { num: 7, name: "ალექსანდრე", surname: "ფანჩულიძე", pn: "01850165779", tutorName: "ლამარა გოგიბერიძე", className: "3ბ", classObjectIdStr: "66e801f4bee5488ff377c0b0" },
  { num: 8, name: "ვივიანი", surname: "წულუკიძე", pn: "61750046734", tutorName: "ლამარა გოგიბერიძე", className: "3ბ", classObjectIdStr: "66e801f4bee5488ff377c0b0" },
  { num: 9, name: "ლილე", surname: "ქობულაძე", pn: "61750048560", tutorName: "ლამარა გოგიბერიძე", className: "3ბ", classObjectIdStr: "66e801f4bee5488ff377c0b0" },
  { num: 10, name: "გაბრიელ", surname: "ჭავჭანიძე", pn: "61550046029", tutorName: "ლამარა გოგიბერიძე", className: "3ბ", classObjectIdStr: "66e801f4bee5488ff377c0b0" },
  { num: 11, name: "ლილე", surname: "დიასამიძე", pn: "61350044169", tutorName: "ნინო თალაკვაძე", className: "3დ", classObjectIdStr: "66e801f9bee5488ff377c0b8" },
  { num: 12, name: "ბარბარე", surname: "ზოიძე", pn: "61350043652", tutorName: "თამრიკო მექვაბიშვილი", className: "4ა", classObjectIdStr: "65081226af243af8cdcc75b1" },
  { num: 13, name: "დავით", surname: "ბერიძე", pn: "61650038823", tutorName: "ირინე სევოსტიანოვა", className: "4დ", classObjectIdStr: "65086f01af243af8cdccc5de" },
  { num: 14, name: "ევა", surname: "ხალვაში", pn: "61550036235", tutorName: "ლუიზა სამსონია", className: "5ა", classObjectIdStr: "63289021c4862cf87e2598e4" },
  { num: 15, name: "ელენე", surname: "ვაშაყმაძე", pn: "61650035770", tutorName: "რუსუდან თოიძე", className: "5ბ", classObjectIdStr: "63289092c4862cf87e25991e" },
  { num: 16, name: "მარიამ", surname: "მიქელაძე", pn: "61250033275", tutorName: "რუსუდან თოიძე", className: "5ბ", classObjectIdStr: "63289092c4862cf87e25991e" },
  { num: 17, name: "ირაკლი", surname: "ედიგარაშვილი", pn: "61850036572", tutorName: "რუსუდან თოიძე", className: "5ბ", classObjectIdStr: "63289092c4862cf87e25991e" },
  { num: 18, name: "ბარბარე", surname: "აბრამიშვილი", pn: "61450032692", tutorName: "სოფიო თავაძე", className: "5გ", classObjectIdStr: "63289098c4862cf87e259922" },
  { num: 19, name: "ევდოკია", surname: "წულაძე", pn: "61550036295", tutorName: "სოფიო თავაძე", className: "5გ", classObjectIdStr: "63289098c4862cf87e259922" },
  { num: 20, name: "სერაფიმე", surname: "ჭავჭანიძე", pn: "61850036372", tutorName: "სოფიო თავაძე", className: "5გ", classObjectIdStr: "63289098c4862cf87e259922" },
  { num: 21, name: "ელისაბედ", surname: "გამჯაშვილი", pn: "01550114553", tutorName: "დარიკო შენგელია", className: "5დ", classObjectIdStr: "6328909cc4862cf87e259926" },
  { num: 22, name: "ანისია", surname: "ყალიჩავა", pn: "60550043279", tutorName: "დარიკო შენგელია", className: "5დ", classObjectIdStr: "6328909cc4862cf87e259926" },
  { num: 23, name: "ელისაბედ", surname: "ქობულაძე", pn: "61150026752", tutorName: "ირაკლი ხიტირი", className: "7ბ", classObjectIdStr: "6321e29683314d3175cf1dc3" },
  { num: 24, name: "გიორგი", surname: "გამჯაშვილი", pn: "01550058750", tutorName: "ლალი ბოლქვაძე", className: "7გ", classObjectIdStr: "6321e29683314d3175cf1dc5" },
  { num: 25, name: "ანდრია", surname: "კონცელიძე", pn: "61950023806", tutorName: "ლალი ბოლქვაძე", className: "7გ", classObjectIdStr: "6321e29683314d3175cf1dc5" },
  { num: 26, name: "სესილი", surname: "ყურაშვილი", pn: "61350025828", tutorName: "ნინო ქავჟარაძე", className: "8ბ", classObjectIdStr: "6321e29683314d3175cf1dd1" },
  { num: 27, name: "გიორგი", surname: "მურვანიძე", pn: "61350019785", tutorName: "ირინა ვიდულინა", className: "8დ", classObjectIdStr: "6321e29783314d3175cf1ddf" },
  { num: 28, name: "ნიკოლოზ", surname: "ფანჩულიძე", pn: "01650027731", tutorName: "ირინა ვიდულინა", className: "8დ", classObjectIdStr: "6321e29783314d3175cf1ddf" },
  { num: 29, name: "ანდრია", surname: "გოგიტიძე", pn: "61450018609", tutorName: "ირინა ვიდულინა", className: "8დ", classObjectIdStr: "6321e29783314d3175cf1ddf" },
  { num: 30, name: "დავით", surname: "ჯიბუტი", pn: "61701099527", tutorName: "თამარ ვაშაკიძე", className: "10ა", classObjectIdStr: "6321e29783314d3175cf1ddd" }
];

async function main() {
  const db = await getDb();
  const studentsCol = db.collection('students');
  const classCol = db.collection('class');

  console.log(`Processing ${STUDENTS_LIST.length} students...`);

  for (const item of STUDENTS_LIST) {
    const classObjId = new ObjectId(item.classObjectIdStr);
    const studentIdStr = item.pn;

    // Check if student exists in students collection
    let studentDoc = await studentsCol.findOne({ $or: [{ ID: studentIdStr }, { user_ID: studentIdStr }] });

    let finalMongoId: ObjectId;

    if (studentDoc) {
      console.log(`[#${item.num}] Student ${item.name} ${item.surname} (${studentIdStr}) exists (_id: ${studentDoc._id}). Updating class_id to ${item.className} (${item.classObjectIdStr})...`);
      await studentsCol.updateOne(
        { _id: studentDoc._id },
        {
          $set: {
            name: item.name,
            surname: item.surname,
            class_id: classObjId
          }
        }
      );
      finalMongoId = studentDoc._id;
    } else {
      console.log(`[#${item.num}] Student ${item.name} ${item.surname} (${studentIdStr}) NEW. Creating record in class ${item.className}...`);
      const hashedPassword = await bcrypt.hash(studentIdStr, 10);
      const newStudent = {
        name: item.name,
        surname: item.surname,
        ID: studentIdStr,
        user_ID: studentIdStr,
        role: 'student',
        image: '',
        password: hashedPassword,
        class_id: classObjId,
        points: []
      };
      const res = await studentsCol.insertOne(newStudent);
      finalMongoId = res.insertedId;
    }

    // Update class document's students array
    const targetClass = await classCol.findOne({ _id: classObjId });
    if (targetClass) {
      const existingClassStudents = targetClass.students || [];
      const idStr = finalMongoId.toString();

      // Check if student is already linked to class
      let alreadyInClass = false;
      for (const cs of existingClassStudents) {
        if (typeof cs === 'string' && cs === idStr) alreadyInClass = true;
        else if (cs && typeof cs === 'object') {
          if (cs.student_id === idStr || String(cs._id) === idStr) alreadyInClass = true;
        }
      }

      if (!alreadyInClass) {
        // If class uses object entries vs string entries
        if (existingClassStudents.length > 0 && typeof existingClassStudents[0] === 'object' && existingClassStudents[0].student_id) {
          await classCol.updateOne(
            { _id: classObjId },
            {
              $push: {
                students: {
                  student_id: idStr,
                  _id: new ObjectId(),
                  choosedSubjects: []
                }
              }
            }
          );
        } else {
          await classCol.updateOne(
            { _id: classObjId },
            { $addToSet: { students: idStr } }
          );
        }
        console.log(`   Linked student ${idStr} to class ${item.className} (${targetClass.ID})`);
      } else {
        console.log(`   Student ${idStr} already present in class ${item.className} students list.`);
      }
    }
  }

  invalidateCache();
  console.log("\nAll 30 students processed and cache invalidated!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
