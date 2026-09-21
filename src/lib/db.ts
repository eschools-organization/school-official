import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://kakhiweinrooneykakhidze_db_user:XnInXModwMkw2J3j@gimnazia.zbe8lqs.mongodb.net/school?appName=gimnazia";

const options = {
  maxPoolSize: 100,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("school");
}

export function getGradesCollectionName(dateInput?: string | Date): string {
  let date: Date;
  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === "string") {
    date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      date = new Date();
    }
  } else {
    date = dateInput;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-indexed (1-12)

  let startYear: number;
  let endYear: number;

  if (month >= 9) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }

  const startStr = String(startYear).slice(-2);
  const endStr = String(endYear).slice(-2);

  return `${startStr}${endStr}year`;
}

let cachedCollectionNames: { names: string[]; expiresAt: number } | null = null;

export async function getGradesCollectionNames(db: Db): Promise<string[]> {
  const now = Date.now();
  if (cachedCollectionNames && cachedCollectionNames.expiresAt > now) {
    return cachedCollectionNames.names;
  }

  try {
    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);
    
    const yearCollections = names.filter((name) => /^\d{4}year$/.test(name));
    
    if (names.includes("grades")) {
      yearCollections.push("grades");
    }
    
    if (yearCollections.length === 0) {
      yearCollections.push(getGradesCollectionName());
    }
    
    cachedCollectionNames = { names: yearCollections, expiresAt: now + 60000 };
    return yearCollections;
  } catch (e) {
    return ["grades", getGradesCollectionName()];
  }
}

export function formatYearToCollectionName(yearInput?: string | null): string | null {
  if (!yearInput) return null;

  const rangeMatch = yearInput.match(/^(\d{4})-(\d{4})$/);
  if (rangeMatch) {
    const startStr = rangeMatch[1].slice(-2);
    const endStr = rangeMatch[2].slice(-2);
    return `${startStr}${endStr}year`;
  }

  if (/^\d{4}$/.test(yearInput)) {
    return `${yearInput}year`;
  }

  if (/^\d{4}year$/.test(yearInput)) {
    return yearInput;
  }

  return null;
}

export function getAcademicYearDateRange(yearInput?: string | null): { $gte: string; $lt: string } | null {
  if (!yearInput) return null;

  let startYear: number | null = null;
  let endYear: number | null = null;

  const rangeMatch = yearInput.match(/^(\d{2,4})[-/](\d{2,4})$/);
  if (rangeMatch) {
    let s = parseInt(rangeMatch[1], 10);
    let e = parseInt(rangeMatch[2], 10);
    if (s < 100) s += 2000;
    if (e < 100) e += 2000;
    startYear = s;
    endYear = e;
  }

  if (!startYear) {
    const yearColMatch = yearInput.match(/^(\d{2})(\d{2})year$/);
    if (yearColMatch) {
      startYear = 2000 + parseInt(yearColMatch[1], 10);
      endYear = 2000 + parseInt(yearColMatch[2], 10);
    }
  }

  if (!startYear) {
    const singleMatch = yearInput.match(/^(\d{4})(year)?$/);
    if (singleMatch) {
      startYear = parseInt(singleMatch[1], 10);
      endYear = startYear + 1;
    }
  }

  if (startYear && endYear) {
    return {
      $gte: `${startYear}-09-01`,
      $lt: `${endYear}-07-01`,
    };
  }

  return null;
}

export async function findGrades(
  db: Db,
  filter: Record<string, any>,
  options?: { year?: string | null; date?: string | null }
): Promise<any[]> {
  let collectionName = "";
  const queryFilter: Record<string, any> = { ...filter };

  if (options?.year) {
    const resolved = formatYearToCollectionName(options.year);
    if (resolved) {
      collectionName = resolved;
    }
    const range = getAcademicYearDateRange(options.year);
    if (range && !queryFilter.date) {
      queryFilter.date = range;
    }
  }

  if (!collectionName && options?.date) {
    collectionName = getGradesCollectionName(options.date);
    if (!queryFilter.date) queryFilter.date = options.date;
  }

  if (!collectionName && filter.date && typeof filter.date === "string") {
    collectionName = getGradesCollectionName(filter.date);
  }

  if (collectionName) {
    ensureIndexes(db, collectionName);
    let results = await db.collection(collectionName).find(queryFilter).sort({ date: 1 }).toArray();
    if (results.length === 0 && collectionName !== "grades") {
      ensureIndexes(db, "grades");
      results = await db.collection("grades").find(queryFilter).sort({ date: 1 }).toArray();
    }
    return results;
  }

  // If no specific collection specified, query ALL grade collections in parallel
  const collectionNames = await getGradesCollectionNames(db);
  collectionNames.forEach((name) => ensureIndexes(db, name));

  const resultsArr = await Promise.all(
    collectionNames.map((name) => db.collection(name).find(queryFilter).sort({ date: 1 }).toArray())
  );

  const seenMap = new Map<string, any>();
  for (const list of resultsArr) {
    for (const item of list) {
      seenMap.set(item._id.toString(), item);
    }
  }

  const allGrades = Array.from(seenMap.values());
  allGrades.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return allGrades;
}

const indexedCollections = new Set<string>();
let globalIndexesCreated = false;

export function ensureIndexes(db: any, collectionName: string) {
  if (indexedCollections.has(collectionName)) return;
  indexedCollections.add(collectionName);

  // Background non-blocking execution
  (async () => {
    try {
      const indexPromises: Promise<any>[] = [
        db.collection(collectionName).createIndex({ class_id: 1, date: 1 }),
        db.collection(collectionName).createIndex({ class_id: 1, student_id: 1 }),
        db.collection(collectionName).createIndex({ student_id: 1, class_id: 1, date: 1 }),
        db.collection(collectionName).createIndex({ student_id: 1, class_id: 1, subject_id: 1, date: 1, lesson_num: 1 }),
        db.collection(collectionName).createIndex({ class_id: 1, subject_id: 1, date: 1 }),
        db.collection(collectionName).createIndex({ student_id: 1, date: 1 }),
      ];

      if (!globalIndexesCreated) {
        globalIndexesCreated = true;
        indexPromises.push(
          db.collection("students").createIndex({ user_ID: 1 }, { sparse: true }),
          db.collection("teachers").createIndex({ user_ID: 1 }, { sparse: true }),
          db.collection("assignments").createIndex({ class_id: 1, teacher_id: 1 }),
          db.collection("assignment_submissions").createIndex({ assignment_id: 1, student_id: 1 })
        );
      }

      await Promise.all(indexPromises);
    } catch (err) {
      console.error("Auto index creation failed:", err);
    }
  })();
}


