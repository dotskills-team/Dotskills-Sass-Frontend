import { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/config/server-env";
import { setRefreshTokenCookie } from "@/features/auth/lib/refresh-cookie";

interface LoginRequestBody {
  email?: string;
  password?: string;
  deviceId?: string;
  loginType?: "company" | "staff";
}

/**
 * Browser → this route → NestJS /auth/login or /auth/staff/login.
 * refreshToken কখনো browser JS-এ যায় না — HttpOnly cookie-তে বসে এখানেই।
 */
export async function POST(request: NextRequest) {
  let body: LoginRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body", error: "Bad Request", statusCode: 400 },
      { status: 400 },
    );
  }

  const { email, password, deviceId, loginType } = body;

  if (!email || !password) {
    return NextResponse.json(
      { message: "email and password are required", error: "Bad Request", statusCode: 400 },
      { status: 400 },
    );
  }

  const backendPath = loginType === "staff" ? "/auth/staff/login" : "/auth/login";

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${serverEnv.backendInternalApiUrl}${backendPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, deviceId }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to reach the authentication service.",
        error: "Bad Gateway",
        statusCode: 502,
      },
      { status: 502 },
    );
  }

  const data = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(data, { status: backendResponse.status });
  }

  const { refreshToken, refreshTokenExpiresIn, ...clientSafeData } = data;

  const response = NextResponse.json(clientSafeData, { status: 200 });
  setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresIn);
  return response;
}
