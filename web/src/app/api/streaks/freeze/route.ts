import { NextRequest, NextResponse } from 'next/server';
import { bffRequest, getAuthToken, getAuthUser } from '@/lib/api/bff-client';

export async function POST(request: NextRequest) {
  const token = getAuthToken(request);
  const user = getAuthUser(request);

  if (!token || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { data, status } = await bffRequest({
    method: 'POST',
    path: `/streaks/users/${user.userId}/freeze`,
    token,
    body: {
      streak_type: body.streak_type,
      reason: body.reason,
    },
  });

  return NextResponse.json(data, { status });
}
