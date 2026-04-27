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
  const mode = searchParams.get('mode');

  if (mode === 'catalog') {
    // Badge catalog
    const params: Record<string, string> = {};
    if (searchParams.get('category')) params.category = searchParams.get('category')!;
    if (searchParams.get('creator_id')) params.creator_id = searchParams.get('creator_id')!;

    const { data, status } = await bffRequest({ path: '/badges/catalog', token, params });
    return NextResponse.json(data, { status });
  }

  // User badges
  const params: Record<string, string> = {};
  if (searchParams.get('include_progress')) params.include_progress = searchParams.get('include_progress')!;
  if (searchParams.get('category')) params.category = searchParams.get('category')!;

  const { data, status } = await bffRequest({
    path: `/badges/users/${user.userId}`,
    token,
    params,
  });

  return NextResponse.json(data, { status });
}
