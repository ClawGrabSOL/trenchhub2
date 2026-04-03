import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCommunityBySlug, createPost } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { slug }              = await params;
    const { title, content, author } = await request.json();

    if (!title || !author) return NextResponse.json({ error: 'title and author required' }, { status: 400 });
    if (title.trim().length < 3 || title.trim().length > 150) {
      return NextResponse.json({ error: 'Title must be 3–150 characters' }, { status: 400 });
    }

    const community = await getCommunityBySlug(slug);
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

    const post = await createPost({
      id:             uuidv4(),
      community_id:   community.id,
      community_slug: slug,
      title:          title.trim(),
      content:        (content || '').trim(),
      author:         author.trim(),
      likes:          0,
      created_at:     new Date().toISOString(),
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
