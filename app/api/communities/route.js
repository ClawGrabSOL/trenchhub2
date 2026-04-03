import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllCommunities, createCommunity, addMember, slugExists, totalCommunities,
} from '@/lib/db';

function slugify(str) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const communities = await getAllCommunities({
      search:   searchParams.get('search')   || '',
      category: searchParams.get('category') || '',
      sort:     searchParams.get('sort')     || 'newest',
    });
    const total = await totalCommunities();
    return NextResponse.json({ communities, total });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, category, rules, banner_color, banner_image, icon_image, owner } = body;

    if (!name || !owner) return NextResponse.json({ error: 'name and owner required' }, { status: 400 });
    if (name.trim().length < 3 || name.trim().length > 50) {
      return NextResponse.json({ error: 'Name must be 3–50 characters' }, { status: 400 });
    }

    let slug = slugify(name);
    const base = slug;
    let attempt = 0;
    while (await slugExists(slug)) { attempt++; slug = `${base}-${attempt}`; }

    const id  = uuidv4();
    const now = new Date().toISOString();

    const community = await createCommunity({
      id, name: name.trim(), slug,
      description:  (description || '').trim(),
      category:     category     || 'General',
      rules:        (rules       || '').trim(),
      banner_color: banner_color || '#7AB541',
      banner_image: banner_image || null,
      icon_image:   icon_image   || null,
      member_count: 0, post_count: 0,
      owner: owner.trim(), created_at: now,
    });

    await addMember({ id: uuidv4(), community_id: id, username: owner.trim(), joined_at: now });

    return NextResponse.json({ community }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create community' }, { status: 500 });
  }
}
