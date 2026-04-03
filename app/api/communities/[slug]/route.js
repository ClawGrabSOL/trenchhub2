import { NextResponse } from 'next/server';
import {
  getCommunityBySlug,
  getPostsBySlug,
  getMembersByCommunity,
} from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { slug }  = await params;
    const community = getCommunityBySlug(slug);
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const posts   = getPostsBySlug(slug);
    const members = getMembersByCommunity(community.id);

    return NextResponse.json({ community, posts, members });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch community' }, { status: 500 });
  }
}
