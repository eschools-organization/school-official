import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const studentId = (body.ID || body.user_ID || body.username || "").toString().trim().replace(/[–—]/g, "-");
  const password = (body.password ?? "").toString();

  if (!studentId || !password) {
    return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
  }

  const db = await getDb();
  const escapedId = studentId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const result = await db.collection("students").findOne({
    $or: [
      { ID: studentId },
      { user_ID: studentId },
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
    const returnId = String(result.ID || result.user_ID || studentId).trim();
    const response: { message: string; user_ID: string; ID: string; class_id?: string } = {
      message: "ავტორიზაცია წარმატებით დასრულდა",
      user_ID: returnId,
      ID: returnId,
    };
    if (result.class_id) {
      response.class_id = result.class_id.toString();
    } else if (result.classInfo?._id) {
      response.class_id = result.classInfo._id.toString();
    } else if (result.classInfo?.classname) {
      const cls = await db.collection("classes").findOne({ classname: result.classInfo.classname });
      if (cls?._id) response.class_id = cls._id.toString();
    }
    return NextResponse.json(response);
  }
  return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
}
