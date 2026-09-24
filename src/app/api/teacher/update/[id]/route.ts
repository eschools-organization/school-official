import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

async function handleTeacherUpdate(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, surname, user_ID, ID, subjects, grades, gradeEntryStartDate } = body;
    const teacherId = ID || user_ID || body.id;

    if (!name || !surname) {
      return NextResponse.json({ message: "სახელი და გვარი აუცილებელია" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("teachers");

    const updateFields: any = {
      name: String(name).trim(),
      surname: String(surname).trim()
    };

    if (teacherId) {
      updateFields.ID = String(teacherId).trim();
      updateFields.user_ID = String(teacherId).trim();
    }
    if (subjects !== undefined) updateFields.subjects = subjects;
    if (grades !== undefined) updateFields.grades = grades;
    if (gradeEntryStartDate !== undefined) updateFields.gradeEntryStartDate = gradeEntryStartDate;

    const update = { $set: updateFields };

    if (ObjectId.isValid(id)) {
      const res = await collection.updateOne({ _id: new ObjectId(id) }, update);
      if (res.matchedCount > 0 || res.modifiedCount > 0) {
        return NextResponse.json({ message: "მასწავლებლის მონაცემები წარმატებით განახლდა" });
      }
    }

    // Try ID or user_ID matching
    let result = await collection.updateOne({ $or: [{ ID: id }, { user_ID: id }] }, update);
    if (result.matchedCount > 0 || result.modifiedCount > 0) {
      return NextResponse.json({ message: "მასწავლებლის მონაცემები წარმატებით განახლდა" });
    }

    // Try name+surname matching as fallback
    result = await collection.updateOne({ name: updateFields.name, surname: updateFields.surname }, update);
    if (result.matchedCount > 0 || result.modifiedCount > 0) {
      return NextResponse.json({ message: "მასწავლებლის მონაცემები წარმატებით განახლდა" });
    }

    return NextResponse.json({ message: "მასწავლებელი ვერ მოიძებნა" }, { status: 404 });
  } catch (err: any) {
    console.error("Error updating teacher:", err);
    return NextResponse.json({ message: err?.message || "სერვერის შეცდომა" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleTeacherUpdate(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleTeacherUpdate(req, context);
}
