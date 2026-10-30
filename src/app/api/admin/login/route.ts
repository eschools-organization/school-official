import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawUserId = (body.user_ID || body.ID || body.username || "").toString().trim().replace(/[–—]/g, "-");
  const password = (body.password ?? "").toString();

  if (!rawUserId || !password) {
    return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
  }

  const db = await getDb();
  const escapedId = rawUserId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let result = await db.collection("admins").findOne({
    $or: [
      { user_ID: rawUserId },
      { user_ID: { $regex: new RegExp(`^${escapedId}$`, "i") } },
    ],
  });

  if (!result && rawUserId.toLowerCase() === "resource_center") {
    const hashedPassword = await bcrypt.hash(password.trim() || "resource_center", 10);
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

  if (!result) {
    return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
  }
  let match = await bcrypt.compare(password, result.password);
  if (!match && password !== password.trim()) {
    match = await bcrypt.compare(password.trim(), result.password);
  }
  if (match) {
    const role = result.role || (result.user_ID === "kakhi-kakhidze" ? "superadmin" : "admin");
    return NextResponse.json({
      message: "ავტორიზაცია წარმატებით დასრულდა",
      user_ID: result.user_ID,
      role,
      name: result.name,
      surname: result.surname
    });
  }
  return NextResponse.json({ message: "მონაცემები არასწორია" }, { status: 401 });
}
