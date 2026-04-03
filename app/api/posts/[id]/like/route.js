import { NextResponse } from 'next/server';
import { getPostById, hasLiked, addLike, removeLike, updatePostLikes } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id }       = await params;
    const { username } = await request.json();

    if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 });

    const post = await getPostById(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    if (await hasLiked(id, username)) {
      await removeLike(id, username);
      const updated = await updatePostLikes(id, -1);
      return NextResponse.json({ liked: false, likes: updated.likes });
    }

    await addLike(id, username);
    const updated = await updatePostLikes(id, 1);
    return NextResponse.json({ liked: true, likes: updated.likes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
