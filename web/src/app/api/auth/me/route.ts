import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getAuthUser } from '@/lib/api/bff-client';

export async function GET(request: NextRequest) {
  const token = getAuthToken(request);
  const user = getAuthUser(request);

  if (!token || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      userId: user.userId,
      creatorId: user.creatorId,
      role: user.role,
      name: user.name,
      email: user.email,
    }
  });
}
