import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, TokenPayload } from "./jwt";

export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  let token = req.cookies.get("auth_token")?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return null;
  }

  return await verifyJWT(token);
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: string[]
): Promise<{ user: TokenPayload; response?: undefined } | { user?: undefined; response: NextResponse }> {
  const user = await getAuthUser(req);

  if (!user) {
    return {
      response: NextResponse.json({ error: "არახ autorizirebuli mutxovna (Unauthorized)" }, { status: 401 })
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role) || user.role === "superadmin";
    if (!hasRole) {
      return {
        response: NextResponse.json({ error: "წვდომა უარყოფილია (Forbidden)" }, { status: 403 })
      };
    }
  }

  return { user };
}
