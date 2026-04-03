import { NextResponse } from 'next/server';
import {
  getPostById,
  hasLiked,
  addLike,
  removeLike,
  updatePostLikes,
} from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id }   = await params;
    const body     = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'username required' }, { status: 400 });
    }

    const post = getPostById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (hasLiked(id, username)) {
      removeLike(id, username);
      const updated = updatePostLikes(id, -1);
      return NextResponse.json({ liked: false, likes: updated.likes });
    }

    addLike(id, username);
    const updated = updatePostLikes(id, 1);
    return NextResponse.json({ liked: true, likes: updated.likes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
