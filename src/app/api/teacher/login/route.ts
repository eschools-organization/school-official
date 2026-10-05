import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const teacherId = (body.ID || body.user_ID || body.username || "").toString().trim();
  const password = body.password;

  if (!teacherId || !password) {
    return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
  }

  const db = await getDb();
  const result = await db.collection("teachers").findOne({
    $or: [{ ID: teacherId }, { user_ID: teacherId }]
  });

  if (!result) {
    return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
  }

  const match = await bcrypt.compare(password, result.password);
  if (match) {
    const returnId = result.ID || result.user_ID || teacherId;
    const token = await signJWT({ user_ID: returnId, role: "teacher", teacherId: returnId });

    const res = NextResponse.json({
      message: "ავტორიზაცია წარმატებით დასრულდა",
      user_ID: returnId,
      ID: returnId,
      token,
    });

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  }

  return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
}

