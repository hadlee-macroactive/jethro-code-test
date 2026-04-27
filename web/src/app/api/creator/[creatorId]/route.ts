import { NextRequest, NextResponse } from 'next/server';
import { bffRequest, getAuthToken } from '@/lib/api/bff-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  const token = getAuthToken(request);
  const { creatorId } = await params;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const { data, status } = await bffRequest({
    path: `/creators/${creatorId}/config`,
    token,
  });

  return NextResponse.json(data, { status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  const token = getAuthToken(request);
  const { creatorId } = await params;
  const body = await request.json();

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const { data, status } = await bffRequest({
    method: 'PATCH',
    path: `/creators/${creatorId}/config`,
    token,
    body,
  });

  return NextResponse.json(data, { status });
}
