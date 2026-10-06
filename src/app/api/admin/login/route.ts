import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { user_ID, password } = await req.json();
    if (!user_ID || !password) {
      return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
    }

    const db = await getDb();
    let result = await db.collection("admins").findOne({ user_ID });

    if (!result && user_ID === "resource_center") {
      const hashedPassword = await bcrypt.hash(password || "resource_center", 10);
      const defaultRcDoc = {
        name: "რესურსცენტრი",
        surname: "სისტემის",
        user_ID: "resource_center",
        password: hashedPassword,
        role: "resource_center",
        createdAt: new Date().toISOString()
      };
      await db.collection("admins").insertOne({ ...defaultRcDoc });
      await db.collection("users").insertOne({ ...defaultRcDoc });
      result = await db.collection("admins").findOne({ user_ID: "resource_center" });
    }

    if (!result || !result.password) {
      return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
    }
    const match = await bcrypt.compare(password, result.password);
    if (match) {
      const role = result.role || (result.user_ID === "kakhi-kakhidze" ? "superadmin" : "admin");
      const token = await signJWT({ user_ID: result.user_ID, role, name: result.name, surname: result.surname });

      const res = NextResponse.json({
        message: "ავტორიზაცია წარმატებით დასრულდა",
        user_ID: result.user_ID,
        role,
        name: result.name,
        surname: result.surname,
        token,
      });

      const isHttps = req.headers.get("x-forwarded-proto") === "https" || req.nextUrl.protocol === "https:";
      res.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: isHttps && process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
      return res;
    }
    return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ message: "სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით." }, { status: 500 });
  }
}

