/**
 * Trenchhub — Upstash Redis store.
 * Works in Vercel serverless + local dev (with env vars set).
 * Stores the entire DB as one JSON key — same structure as before.
 */
import { Redis } from '@upstash/redis';

const DB_KEY = 'trenchhub:db';

const DEFAULT = () => ({
  communities: [],
  posts:       [],
  members:     [],
  post_likes:  [],
});

function getRedis() {
  // Vercel KV env vars OR direct Upstash env vars
  const url   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Redis env vars not set. Add KV_REST_API_URL + KV_REST_API_TOKEN to your environment.');
  }
  return new Redis({ url, token });
}

async function read() {
  try {
    const redis = getRedis();
    const data  = await redis.get(DB_KEY);
    return data || DEFAULT();
  } catch (err) {
    console.error('DB read error:', err);
    return DEFAULT();
  }
}

async function save(data) {
  const redis = getRedis();
  await redis.set(DB_KEY, JSON.stringify(data));
}

// ── Communities ────────────────────────────────────────────────

export async function getAllCommunities({ search = '', category = '', sort = 'newest' } = {}) {
  const { communities } = await read();
  let result = communities;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
    );
  }
  if (category) result = result.filter(c => c.category === category);

  if      (sort === 'popular') result = [...result].sort((a, b) => b.member_count - a.member_count);
  else if (sort === 'active')  result = [...result].sort((a, b) => b.post_count   - a.post_count);
  else                         result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return result;
}

export async function getCommunityBySlug(slug) {
  const { communities } = await read();
  return communities.find(c => c.slug === slug) || null;
}

export async function createCommunity(community) {
  const db = await read();
  community.banner_image = community.banner_image || null;
  community.icon_image   = community.icon_image   || null;
  db.communities.push(community);
  await save(db);
  return community;
}

export async function slugExists(slug) {
  const { communities } = await read();
  return communities.some(c => c.slug === slug);
}

export async function totalCommunities() {
  const { communities } = await read();
  return communities.length;
}

// ── Posts ──────────────────────────────────────────────────────

export async function getPostsBySlug(slug, limit = 50) {
  const { posts } = await read();
  return posts
    .filter(p => p.community_slug === slug)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

export async function getPostById(id) {
  const { posts } = await read();
  return posts.find(p => p.id === id) || null;
}

export async function createPost(post) {
  const db = await read();
  db.posts.push(post);
  const ci = db.communities.findIndex(c => c.id === post.community_id);
  if (ci !== -1) db.communities[ci].post_count = (db.communities[ci].post_count || 0) + 1;
  await save(db);
  return post;
}

export async function updatePostLikes(postId, delta) {
  const db    = await read();
  const index = db.posts.findIndex(p => p.id === postId);
  if (index === -1) return null;
  db.posts[index].likes = Math.max(0, (db.posts[index].likes || 0) + delta);
  await save(db);
  return db.posts[index];
}

// ── Post likes ─────────────────────────────────────────────────

export async function hasLiked(postId, username) {
  const { post_likes } = await read();
  return post_likes.some(l => l.post_id === postId && l.username === username);
}

export async function addLike(postId, username) {
  const db = await read();
  if (!db.post_likes.some(l => l.post_id === postId && l.username === username)) {
    db.post_likes.push({ post_id: postId, username });
  }
  await save(db);
}

export async function removeLike(postId, username) {
  const db = await read();
  db.post_likes = db.post_likes.filter(l => !(l.post_id === postId && l.username === username));
  await save(db);
}

// ── Members ────────────────────────────────────────────────────

export async function getMembersByCommunity(communityId, limit = 20) {
  const { members } = await read();
  return members
    .filter(m => m.community_id === communityId)
    .sort((a, b) => new Date(a.joined_at) - new Date(b.joined_at))
    .slice(0, limit);
}

export async function isMember(communityId, username) {
  const { members } = await read();
  return members.some(m => m.community_id === communityId && m.username === username);
}

export async function addMember(member) {
  const db = await read();
  if (!db.members.some(m => m.community_id === member.community_id && m.username === member.username)) {
    db.members.push(member);
    const ci = db.communities.findIndex(c => c.id === member.community_id);
    if (ci !== -1) db.communities[ci].member_count = (db.communities[ci].member_count || 0) + 1;
  }
  await save(db);
}

export async function removeMember(communityId, username) {
  const db     = await read();
  const before = db.members.length;
  db.members   = db.members.filter(m => !(m.community_id === communityId && m.username === username));
  if (db.members.length < before) {
    const ci = db.communities.findIndex(c => c.id === communityId);
    if (ci !== -1) db.communities[ci].member_count = Math.max(0, (db.communities[ci].member_count || 1) - 1);
  }
  await save(db);
}
