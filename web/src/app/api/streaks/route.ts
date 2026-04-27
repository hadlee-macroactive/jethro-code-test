import { NextRequest, NextResponse } from 'next/server';
import { bffRequest, getAuthToken, getAuthUser } from '@/lib/api/bff-client';

export async function GET(request: NextRequest) {
  const token = getAuthToken(request);
  const user = getAuthUser(request);

  if (!token || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  if (searchParams.get('include_history')) params.include_history = searchParams.get('include_history')!;

  const { data, status } = await bffRequest({
    path: `/streaks/users/${user.userId}`,
    token,
    params,
  });

  return NextResponse.json(data, { status });
}
