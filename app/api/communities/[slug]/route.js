import { NextResponse } from 'next/server';
import { getCommunityBySlug, getPostsBySlug, getMembersByCommunity } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { slug }  = await params;
    const community = await getCommunityBySlug(slug);
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

    const posts   = await getPostsBySlug(slug);
    const members = await getMembersByCommunity(community.id);

    return NextResponse.json({ community, posts, members });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch community' }, { status: 500 });
  }
}
