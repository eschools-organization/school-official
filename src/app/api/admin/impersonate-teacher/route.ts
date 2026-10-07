import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { requireAuth } from "@/lib/serverAuth";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["admin", "superadmin", "resource_center"]);
    if (authResult.response) {
      return authResult.response;
    }

    const body = await req.json();
    const rawId = (body.teacherId || body.ID || body.user_ID || body.id || "").toString().trim();

    if (!rawId) {
      return NextResponse.json({ message: "მასწავლებლის ID მითითებული არ არის" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("teachers");

    let teacher = null;
    if (ObjectId.isValid(rawId)) {
      teacher = await collection.findOne({ _id: new ObjectId(rawId) });
    }
    if (!teacher) {
      teacher = await collection.findOne({ _id: rawId as any });
    }
    if (!teacher) {
      teacher = await collection.findOne({ ID: rawId });
    }
    if (!teacher) {
      teacher = await collection.findOne({ user_ID: rawId });
    }

    if (!teacher) {
      return NextResponse.json({ message: "მასწავლებელი ვერ მოიძებნა" }, { status: 404 });
    }

    const returnId = teacher.ID || teacher.user_ID || rawId;
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
  } catch (error: any) {
    console.error("Teacher impersonation error:", error);
    return NextResponse.json({ message: "სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით." }, { status: 500 });
  }
}
