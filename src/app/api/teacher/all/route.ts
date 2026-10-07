import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const results = await db.collection("teachers").find({}, { projection: { password: 0 } }).toArray();
    const excludedIds = new Set(["12", "14", "15"]);
    const formatted = results
      .filter(t => {
        const idVal = String(t.ID || t.user_ID || t._id || "").trim();
        const nameVal = String(t.name || "").trim();
        const surnameVal = String(t.surname || "").trim();
        if (excludedIds.has(idVal) || excludedIds.has(nameVal) || excludedIds.has(surnameVal)) return false;
        if (/^(12|14|15)$/i.test(idVal) || /^(12|14|15)$/i.test(nameVal) || /^(12|14|15)$/i.test(surnameVal)) return false;
        return true;
      })
      .map(t => {
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
