import { NextRequest, NextResponse } from 'next/server';
import { bffRequest } from '@/lib/api/bff-client';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, status } = await bffRequest({
    method: 'POST',
    path: '/auth/login',
    body,
  });

  if (status !== 200) {
    return NextResponse.json(data, { status });
  }

  const response = NextResponse.json(data, { status });

  // Set httpOnly cookie with the token
  const token = (data as any)?.data?.token;
  if (token) {
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  }

  return response;
}
