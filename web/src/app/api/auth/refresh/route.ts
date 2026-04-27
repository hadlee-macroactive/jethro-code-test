import { NextRequest, NextResponse } from 'next/server';
import { bffRequest, getAuthToken } from '@/lib/api/bff-client';

export async function POST(request: NextRequest) {
  const token = getAuthToken(request);

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } },
      { status: 401 }
    );
  }

  const { data, status } = await bffRequest({
    method: 'POST',
    path: '/auth/refresh',
    token,
  });

  if (status !== 200) {
    return NextResponse.json(data, { status });
  }

  const response = NextResponse.json(data, { status });
  const newToken = (data as any)?.data?.token;
  if (newToken) {
    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  }

  return response;
}
