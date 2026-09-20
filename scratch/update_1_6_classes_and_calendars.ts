import { getDb } from '../src/lib/db';
import { ObjectId } from 'mongodb';
import { invalidateCache } from '../src/lib/cache';

const RAW_DATA = `
1/1	ქართული ენა და ლიტერატურა	თეა ქორჩილავა
1/1	მათემატიკა	ნაირა ზოიძე
1/1	ბუნებისმეტყველება	მავილე მიქელაძე
1/1	ინგლისური ენა	ნათია არობელიძე
1/1	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
1/1	მუსიკა	მაია ჭანუყვაძე
1/1	ფიზიკური აღზრდა (სპორტი)	მიხეილ სალუქვაძე
1/1	ჭადრაკი	კარლო ტრაპაიძე
1/1	საღვრთო სჯული	მზია ჭანტურია
1/2	ქართული ენა და ლიტერატურა	თეონა ლორთქიფანიძე
1/2	მათემატიკა	ესმა ჭელიძე
1/2	ბუნებისმეტყველება	მავილე მიქელაძე
1/2	ინგლისური ენა	ნათია არობელიძე
1/2	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
1/2	მუსიკა	ლოლა ჯაფარიძე
1/2	ფიზიკური აღზრდა (სპორტი)	მიხეილ სალუქვაძე
1/2	ჭადრაკი	კარლო ტრაპაიძე
1/2	საღვრთო სჯული	მზია ჭანტურია
1/3	ქართული ენა და ლიტერატურა	მაია იმნაძე
1/3	მათემატიკა	ცისანა კლდიაშვილი
1/3	ბუნებისმეტყველება	მავილე მიქელაძე
1/3	ინგლისური ენა	ნათია არობელიძე
1/3	სახვითი და გამოყენებითი ხელოვნება	სოფო სანიკიძე
1/3	მუსიკა	ლოლა ჯაფარიძე
1/3	სპორტი	გივი კერესელიძე / მიხეილ სალუქვაძე
1/3	ჭადრაკი	კარლო ტრაპაიძე
1/3	საღვრთო სჯული	თამარ ნინიძე
1/4	ქართული ენა და ლიტერატურა	თეა ქორჩილავა
1/4	მათემატიკა	ესმა ჭელიძე
1/4	ბუნებისმეტყველება	მავილე მიქელაძე
1/4	ინგლისური ენა	ნათია არობელიძე
1/4	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
1/4	მუსიკა	მაია ჭანუყვაძე / ლოლა ჯაფარიძე
1/4	სპორტი	მიხეილ სალუქვაძე / კარლო ტრაპაიძე
1/4	ჭადრაკი	კარლო ტრაპაიძე
1/4	საღვრთო სჯული	თამარ ნინიძე
1/5	ქართული ენა და ლიტერატურა	რუსუდან თოიძე
1/5	მათემატიკა	ნაირა ზოიძე
1/5	ბუნებისმეტყველება	მავილე მიქელაძე
1/5	ინგლისური ენა	ნათია რუხაძე
1/5	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
1/5	მუსიკა	მაია ჭანუყვაძე
1/5	სპორტი	გივი კერესელიძე / კარლო ტრაპაიძე
1/5	ჭადრაკი	კარლო ტრაპაიძე
1/5	საღვრთო სჯული	თამარ ნინიძე
2/1	ქართული ენა და ლიტერატურა	ნინო უგულავა
2/1	მათემატიკა	ნინო თალაკვაძე
2/1	ბუნებისმეტყველება	მანანა გოგიბერიძე
2/1	ინგლისური ენა	ნინო კორძაძე
2/1	სახვითი და გამოყენებითი ხელოვნება	სოფო სანიკიძე
2/1	მუსიკა	მაია ჭანუყვაძე
2/1	სპორტი	კარლო ტრაპაიძე
2/1	ჭადრაკი	კარლო ტრაპაიძე
2/1	ისტ-ი	სოფო თავაძე
2/1	საღვრთო სჯული	თამარ ნინიძე
2/2	ქართული ენა და ლიტერატურა	თეონა ლორთქიფანიძე
2/2	მათემატიკა	ესმა ჭელიძე
2/2	ბუნებისმეტყველება	მანანა გოგიბერიძე
2/2	ინგლისური ენა	ნატალია ფრუიძე / ლიკა ხარებავა
2/2	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
2/2	მუსიკა	მაია ჭანუყვაძე
2/2	სპორტი	კარლო ტრაპაიძე
2/2	ჭადრაკი	კარლო ტრაპაიძე
2/2	ისტ-ი	სოფო თავაძე
2/2	საღვრთო სჯული	მზია ჭანტურია
2/3	ქართული ენა და ლიტერატურა	ნინო უგულავა
2/3	მათემატიკა	ესმა ჭელიძე
2/3	ბუნებისმეტყველება	მანანა გოგიბერიძე / ხათუნა მანჯგალაძე
2/3	ინგლისური ენა	ლიკა ხარებავა
2/3	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
2/3	მუსიკა	მაია ჭანუყვაძე
2/3	სპორტი	კარლო ტრაპაიძე
2/3	ჭადრაკი	კარლო ტრაპაიძე
2/3	ისტ-ი	სოფო თავაძე
2/3	საღვრთო სჯული	თამარ ნინიძე
2/4	ქართული ენა და ლიტერატურა	თეა ქორჩილავა
2/4	მათემატიკა	ცისანა კლდიაშვილი
2/4	ბუნებისმეტყველება	მანანა გოგიბერიძე
2/4	ინგლისური ენა	ნატალია ფრუიძე
2/4	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
2/4	მუსიკა	მაია ჭანუყვაძე
2/4	სპორტი	კარლო ტრაპაიძე
2/4	ჭადრაკი	კარლო ტრაპაიძე
2/4	ისტ-ი	სოფო თავაძე
2/4	საღვრთო სჯული	თამარ ნინიძე
3/1	ქართული ენა და ლიტერატურა	თეონა ლორთქიფანიძე
3/1	მათემატიკა	ცისანა კლდიაშვილი
3/1	ბუნებისმეტყველება	სალომე დანელია
3/1	მე და საზოგადოება	სალომე დანელია
3/1	ინგლისური ენა	ლიკა ხარებავა
3/1	სახვითი და გამოყენებითი ხელოვნება	სოფო სანიკიძე
3/1	მუსიკა	ლოლა ჯაფარიძე
3/1	სპორტი	კარლო ტრაპაიძე
3/1	ისტ-ი	სოფო თავაძე
3/1	საღვრთო სჯული	მზია ჭანტურია
3/2	ქართული ენა და ლიტერატურა	მაია იმნაძე
3/2	მათემატიკა	ნინო თალაკვაძე
3/2	ბუნებისმეტყველება	ლამარა გოგიბერიძე
3/2	მე და საზოგადოება	ლამარა გოგიბერიძე
3/2	ინგლისური ენა	ნინო კორძაძე
3/2	სახვითი და გამოყენებითი ხელოვნება	სოფო სანიკიძე
3/2	მუსიკა	ლოლა ჯაფარიძე
3/2	სპორტი	გივი კერესელიძე
3/2	ისტ-ი	სოფო თავაძე
3/2	საღვრთო სჯული	მზია ჭანტურია
3/3	ქართული ენა და ლიტერატურა	ნინო უგულავა
3/3	მათემატიკა	ნაირა ზოიძე
3/3	ბუნებისმეტყველება	სალომე დანელია
3/3	მე და საზოგადოება	სალომე დანელია
3/3	ინგლისური ენა	ნინო კორძაძე
3/3	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
3/3	მუსიკა	ლოლა ჯაფარიძე
3/3	სპორტი	გივი კერესელიძე
3/3	ისტ-ი	სოფო თავაძე
3/3	საღვრთო სჯული	რუსუდან ურუშაძე
3/4	ქართული ენა და ლიტერატურა	მაია იმნაძე
3/4	მათემატიკა	ნინო თალაკვაძე
3/4	ბუნებისმეტყველება	მანანა გოგიბერიძე
3/4	მე და საზოგადოება	ლამარა გოგიბერიძე
3/4	ინგლისური ენა	ნატალია ფრუიძე
3/4	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
3/4	მუსიკა	ლოლა ჯაფარიძე
3/4	სპორტი	კარლო ტრაპაიძე
3/4	ისტ-ი	სოფო თავაძე
3/4	საღვრთო სჯული	თამარ ნინიძე
4/1	ქართული ენა და ლიტერატურა	ლამარა გოგიბერიძე
4/1	მათემატიკა	ნინო თალაკვაძე
4/1	ბუნებისმეტყველება	თამუნა (თამრიკო) მექვაბიშვილი
4/1	მე და საზოგადოება	ლამარა გოგიბერიძე
4/1	ინგლისური ენა	ზეინაბ კონცელიძე
4/1	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
4/1	მუსიკა	მაია ჭანუყვაძე
4/1	ფიზიკური აღზრდა (სპორტი)	მიხეილ სალუქვაძე
4/1	ისტ-ი	სოფო თავაძე
4/1	საღვრთო სჯული	თამარ ნინიძე
4/2	ქართული ენა და ლიტერატურა	თეონა ლორთქიფანიძე
4/2	მათემატიკა	ნინო თალაკვაძე
4/2	ბუნებისმეტყველება	ლამარა გოგიბერიძე
4/2	მე და საზოგადოება	სალომე დანელია
4/2	ინგლისური ენა	ნინო კორძაძე
4/2	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
4/2	მუსიკა	მაია ჭანუყვაძე
4/2	სპორტი	გივი კერესელიძე
4/2	ისტ-ი	სოფო თავაძე
4/2	საღვრთო სჯული	მზია ჭანტურია
4/3	ქართული ენა და ლიტერატურა	მაია იმნაძე
4/3	მათემატიკა	ხათუნა მანჯგალაძე
4/3	ბუნებისმეტყველება	მანანა გოგიბერიძე
4/3	მე და საზოგადოება	ხათუნა მანჯგალაძე
4/3	ინგლისური ენა	ნატალია ფრუიძე
4/3	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
4/3	მუსიკა	ლოლა ჯაფარიძე
4/3	სპორტი	გივი კერესელიძე
4/3	ისტ-ი	სოფო თავაძე
4/3	საღვრთო სჯული	მზია ჭანტურია
4/4	ქართული ენა და ლიტერატურა	ნინო უგულავა
4/4	მათემატიკა	ცისანა კლდიაშვილი
4/4	ბუნებისმეტყველება	ლამარა გოგიბერიძე
4/4	მე და საზოგადოება	ხათუნა მანჯგალაძე
4/4	ინგლისური ენა	ნატალია ფრუიძე
4/4	სახვითი და გამოყენებითი ხელოვნება	ირინე სევოსტიანოვა
4/4	მუსიკა	ლოლა ჯაფარიძე
4/4	სპორტი	გივი კერესელიძე
4/4	ისტ-ი	სოფო თავაძე
4/4	საღვრთო სჯული	მზია ჭანტურია
5/1	ქართული ენა და ლიტერატურა	ლუიზა სამსონია
5/1	მათემატიკა	ლილი ჩხარტიშვილი
5/1	ბუნებისმეტყველება	თამუნა (თამრიკო) მექვაბიშვილი
5/1	ჩვენი საქართველო / ისტორია	ზვიად ჩხენკელი
5/1	ინგლისური ენა	ზეინაბ კონცელიძე / ნინო კორძაძე
5/1	გერმანული ენა	მაია ახალაძე
5/1	სახვითი ხელოვნება	ნინო როგავა
5/1	მუსიკა	ეკატერინე ბჟინავა
5/1	სპორტი	მადონა ხუხუნაიშვილი
5/1	ისტ-ი	სოფო თავაძე
5/1	საღვრთო სჯული	რუსუდან ურუშაძე
5/2	ქართული ენა და ლიტერატურა	რუსუდან თოიძე
5/2	მათემატიკა	დარიკო შენგელია
5/2	ბუნებისმეტყველება (ბიოლოგია)	მაია მშველიძე
5/2	ჩვენი საქართველო / ისტორია	ნატალია სირაბიძე
5/2	ინგლისური ენა	ზეინაბ კონცელიძე / ნინო კორძაძე
5/2	რუსული ენა	ნინო ქავჟარაძე
5/2	სახვითი ხელოვნება	რუსუდან ეგუტიძე
5/2	მუსიკა	ეკატერინე ბჟინავა
5/2	სპორტი	დავით ონიაშვილი
5/2	ისტ-ი	სოფო თავაძე
5/2	საღვრთო სჯული	ლელა ქორიძე
5/3	ქართული ენა და ლიტერატურა	რუსუდან თოიძე
5/3	მათემატიკა	ლილი ჩხარტიშვილი
5/3	ბუნებისმეტყველება (ბიოლოგია)	ნანა ჭელიძე
5/3	ჩვენი საქართველო / ისტორია	ნატალია სირაბიძე
5/3	ინგლისური ენა	ზეინაბ კონცელიძე
5/3	რუსული ენა	ნინო ქავჟარაძე
5/3	სახვითი ხელოვნება	თამარ წულაძე
5/3	მუსიკა	ეკატერინე ბჟინავა
5/3	სპორტი	დავით ონიაშვილი
5/3	ისტ-ი	სოფო თავაძე
5/3	საღვრთო სჯული	რუსუდან ურუშაძე
5/4	ქართული ენა და ლიტერატურა	ლუიზა სამსონია
5/4	მათემატიკა	დარიკო შენგელია
5/4	ბუნებისმეტყველება	თამუნა (თამრიკო) მექვაბიშვილი
5/4	ჩვენი საქართველო / ისტორია	ზვიად ჩხენკელი
5/4	ინგლისური ენა	ნათია რუხაძე
5/4	რუსული ენა	ევგენია (ევა) ლომაძე
5/4	სახვითი ხელოვნება	თამარ წულაძე
5/4	მუსიკა	ეკატერინე ბჟინავა
5/4	სპორტი	დავით ონიაშვილი
5/4	ისტ-ი	სოფო თავაძე
5/4	საღვრთო სჯული	ლელა ქორიძე
6/1	ქართული ენა და ლიტერატურა	რუსუდან თავხელიძე
6/1	მათემატიკა	დარიკო შენგელია
6/1	ბუნებისმეტყველება	თამუნა (თამრიკო) მექვაბიშვილი
6/1	ჩვენი საქართველო / ისტორია	ინგა მართალიშვილი
6/1	ინგლისური ენა	ნინო კორძაძე
6/1	რუსული ენა	ლალი ლომთათიძე
6/1	სახვითი ხელოვნება	რუსუდან ეგუტიძე
6/1	მუსიკა	ლოლა ჯაფარიძე
6/1	სპორტი	დავით ონიაშვილი
6/1	ისტ-ი	სოფო თავაძე
6/1	საღვრთო სჯული	ლელა ქორიძე
6/2	ქართული ენა და ლიტერატურა	სოფიკო ცეცხლაძე
6/2	მათემატიკა	დარიკო შენგელია
6/2	ბუნებისმეტყველება (ბიოლოგია)	ნანა ჭელიძე
6/2	ჩვენი საქართველო / ისტორია	ნატალია სირაბიძე
6/2	ინგლისური ენა	ლალი ბოლქვაძე
6/2	გერმანული ენა	მაია ახალაძე
6/2	სახვითი ხელოვნება	ნინო როგავა
6/2	მუსიკა	ლოლა ჯაფარიძე
6/2	სპორტი	დავით ონიაშვილი
6/2	ისტ-ი	სოფო თავაძე
6/2	საღვრთო სჯული	რუსუდან ურუშაძე
6/3	ქართული ენა და ლიტერატურა	სოფიკო ცეცხლაძე
6/3	მათემატიკა	ლილი ჩხარტიშვილი
6/3	ბუნებისმეტყველება	თამუნა (თამრიკო) მექვაბიშვილი
6/3	ჩვენი საქართველო / ისტორია	ზვიად ჩხენკელი
6/3	ინგლისური ენა	ზეინაბ კონცელიძე / ნინო კორძაძე
6/3	რუსული ენა	ევგენია (ევა) ლომაძე
6/3	სახვითი ხელოვნება	რუსუდან ეგუტიძე
6/3	მუსიკა	ლოლა ჯაფარიძე
6/3	სპორტი	დავით ონიაშვილი
6/3	ისტ-ი	სოფო თავაძე
6/3	საღვრთო სჯული	ლელა ქორიძე
6/4	ქართული ენა და ლიტერატურა	ლუიზა სამსონია
6/4	მათემატიკა	დარიკო შენგელია
6/4	ბუნებისმეტყველება (ბიოლოგია)	მაია მშველიძე
6/4	ჩვენი საქართველო / ისტორია	ნატალია სირაბიძე
6/4	ინგლისური ენა	ნათია რუხაძე
6/4	რუსული ენა	ნინო ქავჟარაძე
6/4	სახვითი ხელოვნება	თამარ წულაძე
6/4	მუსიკა	ლოლა ჯაფარიძე
6/4	სპორტი	დავით ონიაშვილი
6/4	ისტ-ი	სოფო თავაძე
6/4	საღვრთო სჯული	რუსუდან ურუშაძე
`;

const CLASS_MAP: Record<string, string> = {
  '1/1': '1ა', '1/2': '1ბ', '1/3': '1გ', '1/4': '1დ', '1/5': '1ე',
  '2/1': '2ა', '2/2': '2ბ', '2/3': '2გ', '2/4': '2დ',
  '3/1': '3ა', '3/2': '3ბ', '3/3': '3გ', '3/4': '3დ',
  '4/1': '4ა', '4/2': '4ბ', '4/3': '4გ', '4/4': '4დ',
  '5/1': '5ა', '5/2': '5ბ', '5/3': '5გ', '5/4': '5დ',
  '6/1': '6ა', '6/2': '6ბ', '6/3': '6გ', '6/4': '6დ',
};

async function main() {
  const db = await getDb();
  const classCol = db.collection('class');
  const subjectsCol = db.collection('subjects');
  const teachersCol = db.collection('teachers');

  // Load all subjects
  const allSubjects = await subjectsCol.find({}).toArray();
  const findSubjectId = (subjName: string): ObjectId => {
    const s = subjName.trim();
    let match = allSubjects.find(sub => {
      const name = sub.subject_name || sub.name || '';
      return name.trim() === s;
    });

    if (!match) {
      if (s.includes('ქართული')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('ქართული'));
      else if (s.includes('მათემატიკა')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('მათემატიკა'));
      else if (s.includes('ბუნებ')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('ბუნებ'));
      else if (s.includes('ინგლისურ')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('ინგლისურ'));
      else if (s.includes('სახვითი')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('სახვითი'));
      else if (s.includes('მუსიკა') && !s.includes('პროექტი')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '') === 'მუსიკა');
      else if (s.includes('სპორტ') || s.includes('ფიზიკურ')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('სპორტ'));
      else if (s.includes('ჭადრაკ')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('ჭადრაკ'));
      else if (s.includes('სჯულ')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('სჯულ'));
      else if (s.includes('საზოგადოებ')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('საზოგადოებ'));
      else if (s.includes('ისტ')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '') === 'ისტ');
      else if (s.includes('საქართველო')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('საქართველო'));
      else if (s.includes('რუსულ')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('რუსულ'));
      else if (s.includes('გერმანულ')) match = allSubjects.find(sub => (sub.subject_name || sub.name || '').includes('გერმანულ'));
    }

    if (!match) {
      throw new Error(`Subject not found in DB: "${subjName}"`);
    }
    return match._id;
  };

  // Load all teachers
  const allTeachers = await teachersCol.find({}).toArray();
  const findTeacherId = async (teacherName: string): Promise<ObjectId> => {
    let tName = teacherName.trim();
    // Handle multi-teachers like "გივი კერესელიძე / მიხეილ სალუქვაძე" -> take first teacher
    if (tName.includes('/')) {
      tName = tName.split('/')[0].trim();
    }
    if (tName === '-' || !tName) {
      return new ObjectId("000000000000000000000000");
    }

    // Direct match or surname match
    let match = allTeachers.find(t => {
      const full = `${t.name || ''} ${t.surname || ''}`.trim();
      return full === tName || full.includes(tName) || tName.includes(full);
    });

    if (!match) {
      // Partial match by parts
      const parts = tName.split(/\s+/);
      match = allTeachers.find(t => {
        const full = `${t.name || ''} ${t.surname || ''}`;
        return parts.every(p => full.includes(p));
      });
    }

    if (!match && tName.includes('მექვაბიშვილი')) {
      match = allTeachers.find(t => `${t.name} ${t.surname}`.includes('მექვაბიშვილი'));
    }
    if (!match && tName.includes('ლომაძე')) {
      match = allTeachers.find(t => `${t.name} ${t.surname}`.includes('ლომაძე'));
    }

    if (!match) {
      // Create teacher if missing
      console.warn(`Creating missing teacher: "${tName}"`);
      const parts = tName.split(/\s+/);
      const name = parts[0] || tName;
      const surname = parts.slice(1).join(' ') || '';
      const insertRes = await teachersCol.insertOne({
        ID: '9' + String(Math.floor(1000000000 + Math.random() * 9000000000)),
        name,
        surname,
        role: 'teacher',
        image: '/default/default.png',
        classes: [],
        calendar: Array.from({ length: 5 }, () =>
          Array.from({ length: 7 }, () => ({
            teacher_id: new ObjectId("000000000000000000000000"),
            subject_id: new ObjectId("000000000000000000000000")
          }))
        )
      });
      const newTeacher = { _id: insertRes.insertedId, name, surname, ID: '' };
      allTeachers.push(newTeacher as any);
      return insertRes.insertedId;
    }

    return match._id;
  };

  // Parse lines
  const lines = RAW_DATA.trim().split('\n').filter(l => l.trim().length > 0);
  const parsedByClass: Record<string, { subject: string; teacher: string }[]> = {};

  for (const line of lines) {
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length < 2) continue;
    const classCode = parts[0];
    const subjectName = parts[1];
    const teacherName = parts[2] || '';

    if (!parsedByClass[classCode]) parsedByClass[classCode] = [];
    parsedByClass[classCode].push({ subject: subjectName, teacher: teacherName });
  }

  console.log(`Parsed data for ${Object.keys(parsedByClass).length} classes.`);

  for (const [classCode, items] of Object.entries(parsedByClass)) {
    const classIDStr = CLASS_MAP[classCode];
    if (!classIDStr) {
      console.error(`Unknown class code: ${classCode}`);
      continue;
    }

    const classDoc = await classCol.findOne({ ID: classIDStr });
    if (!classDoc) {
      console.error(`Class ID not found in DB: ${classIDStr}`);
      continue;
    }

    // Build new subjects array
    const newSubjects: any[] = [];
    for (const item of items) {
      const subjId = findSubjectId(item.subject);
      const teacherId = await findTeacherId(item.teacher);
      newSubjects.push({
        subject_id: subjId,
        teacher_id: teacherId,
        hours_per_week: 0
      });
    }

    // Update class subjects
    await classCol.updateOne(
      { _id: classDoc._id },
      { $set: { subjects: newSubjects } }
    );

    // Update calendar: if class has calendar, update slots matching subjects
    let updatedCalendar = classDoc.calendar;
    if (!updatedCalendar || !Array.isArray(updatedCalendar) || updatedCalendar.length !== 5) {
      // Create empty 5x7 calendar matrix if none exists
      updatedCalendar = Array.from({ length: 5 }, () =>
        Array.from({ length: 7 }, () => ({
          subject_id: new ObjectId("000000000000000000000000"),
          teacher_id: new ObjectId("000000000000000000000000")
        }))
      );
    } else {
      // Update existing calendar slots with the new teacher_ids
      for (let dayIdx = 0; dayIdx < updatedCalendar.length; dayIdx++) {
        for (let slotIdx = 0; slotIdx < updatedCalendar[dayIdx].length; slotIdx++) {
          const slot = updatedCalendar[dayIdx][slotIdx];
          if (slot && slot.subject_id && slot.subject_id.toString() !== "000000000000000000000000") {
            const matchSubj = newSubjects.find(ns => ns.subject_id.toString() === slot.subject_id.toString());
            if (matchSubj) {
              slot.teacher_id = matchSubj.teacher_id;
            }
          }
        }
      }
    }

    await classCol.updateOne(
      { _id: classDoc._id },
      { $set: { calendar: updatedCalendar } }
    );

    console.log(`Updated class ${classIDStr} (${classCode}) with ${newSubjects.length} subjects.`);
  }

  // Rebuild all teacher calendars
  console.log('\nRebuilding teacher schedules...');
  const allClasses = await classCol.find({}).toArray();
  const teacherSchedules: Record<string, { teacher_id: ObjectId; subject_id: ObjectId }[][]> = {};

  for (const cls of allClasses) {
    if (!cls.calendar) continue;
    for (let dayIdx = 0; dayIdx < cls.calendar.length; dayIdx++) {
      for (let lessonIdx = 0; lessonIdx < cls.calendar[dayIdx].length; lessonIdx++) {
        const entry = cls.calendar[dayIdx][lessonIdx];
        if (entry && entry.teacher_id && entry.teacher_id.toString() !== "000000000000000000000000") {
          const tid = entry.teacher_id.toString();
          if (!teacherSchedules[tid]) {
            teacherSchedules[tid] = Array.from({ length: 5 }, () =>
              Array.from({ length: 7 }, () => ({
                teacher_id: new ObjectId("000000000000000000000000"),
                subject_id: new ObjectId("000000000000000000000000")
              }))
            );
          }
          teacherSchedules[tid][dayIdx][lessonIdx] = {
            teacher_id: entry.teacher_id,
            subject_id: entry.subject_id,
          };
        }
      }
    }
  }

  for (const [teacherID, cal] of Object.entries(teacherSchedules)) {
    await teachersCol.updateOne(
      { _id: new ObjectId(teacherID) },
      { $set: { calendar: cal } }
    );
  }

  invalidateCache();
  console.log('\nAll 1-6 classes and calendars updated successfully! Cache invalidated.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
