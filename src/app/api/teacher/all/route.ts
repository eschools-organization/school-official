import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const results = await db.collection("teachers").find({}, { projection: { password: 0 } }).toArray();
    const formatted = results.map(t => {
      const idVal = t.ID || t.user_ID || "";
      return {
        ...t,
        _id: t._id.toString(),
        ID: idVal,
        user_ID: idVal,
        role: t.role || "teacher",
        phone: t.phone || "",
        classes: t.classes || [],
      };
    });
    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error in GET /api/teacher/all:", error);
    return NextResponse.json([], { status: 500 });
  }
}
