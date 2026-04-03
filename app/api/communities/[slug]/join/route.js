import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCommunityBySlug, isMember, addMember, removeMember } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { slug }           = await params;
    const { username, action } = await request.json();

    if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 });

    const community = await getCommunityBySlug(slug);
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

    if (action === 'leave') {
      await removeMember(community.id, username);
      return NextResponse.json({ joined: false });
    }

    if (!(await isMember(community.id, username))) {
      await addMember({ id: uuidv4(), community_id: community.id, username, joined_at: new Date().toISOString() });
    }
    return NextResponse.json({ joined: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to join/leave' }, { status: 500 });
  }
}
