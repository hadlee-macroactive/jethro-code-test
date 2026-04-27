import { NextRequest, NextResponse } from 'next/server';
import { bffRequest, getAuthToken } from '@/lib/api/bff-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ badgeCode: string }> }
) {
  const token = getAuthToken(request);
  const { badgeCode } = await params;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const { data, status } = await bffRequest({
    path: `/badges/${badgeCode}`,
    token,
  });

  return NextResponse.json(data, { status });
}
