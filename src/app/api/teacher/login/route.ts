import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const teacherId = (body.ID || body.user_ID || body.username || "").toString().trim().replace(/[–—]/g, "-");
  const password = (body.password ?? "").toString();

  if (!teacherId || !password) {
    return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
  }

  const db = await getDb();
  const escapedId = teacherId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const result = await db.collection("teachers").findOne({
    $or: [
      { ID: teacherId },
      { user_ID: teacherId },
      { ID: { $regex: new RegExp(`^\\s*${escapedId}\\s*$`, "i") } },
      { user_ID: { $regex: new RegExp(`^\\s*${escapedId}\\s*$`, "i") } },
    ]
  });

  if (!result) {
    return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
  }

  let match = await bcrypt.compare(password, result.password);
  if (!match && password !== password.trim()) {
    match = await bcrypt.compare(password.trim(), result.password);
  }
  if (match) {
    const returnId = String(result.user_ID || result.ID || teacherId).trim();
    return NextResponse.json({ message: "ავტორიზაცია წარმატებით დასრულდა", user_ID: returnId, ID: returnId });
  }

  return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
}
