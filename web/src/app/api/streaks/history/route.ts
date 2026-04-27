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
  if (searchParams.get('streak_type')) params.streak_type = searchParams.get('streak_type')!;
  if (searchParams.get('limit')) params.limit = searchParams.get('limit')!;
  if (searchParams.get('offset')) params.offset = searchParams.get('offset')!;

  const { data, status } = await bffRequest({
    path: `/streaks/users/${user.userId}/history`,
    token,
    params,
  });

  return NextResponse.json(data, { status });
}
