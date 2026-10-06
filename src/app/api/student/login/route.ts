import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const studentId = (body.ID || body.user_ID || body.username || "").toString().trim();
    const password = body.password;

    if (!studentId || !password) {
      return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
    }

    const db = await getDb();
    const result = await db.collection("students").findOne({
      $or: [{ ID: studentId }, { user_ID: studentId }]
    });

    if (!result || !result.password) {
      return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, result.password);
    if (match) {
      const returnId = result.ID || result.user_ID || studentId;
      const token = await signJWT({ user_ID: returnId, role: "student", studentId: returnId });

      const responseObj: any = {
        message: "ავტორიზაცია წარმატებით დასრულდა",
        user_ID: returnId,
        ID: returnId,
        token,
      };
      if (result.class_id) {
        responseObj.class_id = result.class_id.toString();
      }

      const res = NextResponse.json(responseObj);
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
  } catch (error: any) {
    console.error("Student login error:", error);
    return NextResponse.json({ message: "სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით." }, { status: 500 });
  }
}

