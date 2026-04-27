import { NextRequest, NextResponse } from 'next/server';
import { bffRequest, getAuthToken } from '@/lib/api/bff-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const token = getAuthToken(request);
  const { type } = await params;
  const { searchParams } = new URL(request.url);

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const reqParams: Record<string, string> = {};
  if (searchParams.get('period_start')) reqParams.period_start = searchParams.get('period_start')!;
  if (searchParams.get('limit')) reqParams.limit = searchParams.get('limit')!;

  const { data, status } = await bffRequest({
    path: `/leaderboards/${type}`,
    token,
    params: reqParams,
  });

  return NextResponse.json(data, { status });
}
