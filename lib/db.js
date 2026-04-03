/**
 * Trenchmunity — JSON file store.
 * Pure JS, no native compilation, works everywhere.
 * Single-instance Next.js safe (synchronous R/W).
 */
import fs   from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'trenchmunity.json');

const DEFAULT = {
  communities: [],
  posts:       [],
  members:     [],
  post_likes:  [],
};

// ──────────────────────────────────────────────
// Core I/O
// ──────────────────────────────────────────────

function read() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return structuredClone(DEFAULT);
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ──────────────────────────────────────────────
// Communities
// ──────────────────────────────────────────────

export function getAllCommunities({ search = '', category = '', sort = 'newest' } = {}) {
  const { communities } = read();

  let result = communities;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
    );
  }

  if (category) {
    result = result.filter(c => c.category === category);
  }

  if (sort === 'popular') {
    result = [...result].sort((a, b) => b.member_count - a.member_count);
  } else if (sort === 'active') {
    result = [...result].sort((a, b) => b.post_count - a.post_count);
  } else {
    result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return result;
}

export function getCommunityBySlug(slug) {
  const { communities } = read();
  return communities.find(c => c.slug === slug) || null;
}

export function createCommunity(community) {
  const db = read();
  // ensure image fields exist
  community.banner_image = community.banner_image || null;
  community.icon_image   = community.icon_image   || null;
  db.communities.push(community);
  save(db);
  return community;
}

export function updateCommunity(id, patch) {
  const db    = read();
  const index = db.communities.findIndex(c => c.id === id);
  if (index === -1) return null;
  db.communities[index] = { ...db.communities[index], ...patch };
  save(db);
  return db.communities[index];
}

export function slugExists(slug) {
  const { communities } = read();
  return communities.some(c => c.slug === slug);
}

// ──────────────────────────────────────────────
// Posts
// ──────────────────────────────────────────────

export function getPostsBySlug(slug, limit = 50) {
  const { posts } = read();
  return posts
    .filter(p => p.community_slug === slug)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

export function getPostById(id) {
  const { posts } = read();
  return posts.find(p => p.id === id) || null;
}

export function createPost(post) {
  const db = read();
  db.posts.push(post);
  // bump community post_count
  const ci = db.communities.findIndex(c => c.id === post.community_id);
  if (ci !== -1) db.communities[ci].post_count = (db.communities[ci].post_count || 0) + 1;
  save(db);
  return post;
}

export function updatePostLikes(postId, delta) {
  const db    = read();
  const index = db.posts.findIndex(p => p.id === postId);
  if (index === -1) return null;
  db.posts[index].likes = Math.max(0, (db.posts[index].likes || 0) + delta);
  save(db);
  return db.posts[index];
}

// ──────────────────────────────────────────────
// Post likes
// ──────────────────────────────────────────────

export function hasLiked(postId, username) {
  const { post_likes } = read();
  return post_likes.some(l => l.post_id === postId && l.username === username);
}

export function addLike(postId, username) {
  const db = read();
  if (!db.post_likes.some(l => l.post_id === postId && l.username === username)) {
    db.post_likes.push({ post_id: postId, username });
  }
  save(db);
}

export function removeLike(postId, username) {
  const db    = read();
  db.post_likes = db.post_likes.filter(l => !(l.post_id === postId && l.username === username));
  save(db);
}

// ──────────────────────────────────────────────
// Members
// ──────────────────────────────────────────────

export function getMembersByCommunity(communityId, limit = 20) {
  const { members } = read();
  return members
    .filter(m => m.community_id === communityId)
    .sort((a, b) => new Date(a.joined_at) - new Date(b.joined_at))
    .slice(0, limit);
}

export function isMember(communityId, username) {
  const { members } = read();
  return members.some(m => m.community_id === communityId && m.username === username);
}

export function addMember(member) {
  const db = read();
  if (!db.members.some(m => m.community_id === member.community_id && m.username === member.username)) {
    db.members.push(member);
    const ci = db.communities.findIndex(c => c.id === member.community_id);
    if (ci !== -1) db.communities[ci].member_count = (db.communities[ci].member_count || 0) + 1;
  }
  save(db);
}

export function removeMember(communityId, username) {
  const db = read();
  const before = db.members.length;
  db.members = db.members.filter(m => !(m.community_id === communityId && m.username === username));
  if (db.members.length < before) {
    const ci = db.communities.findIndex(c => c.id === communityId);
    if (ci !== -1) db.communities[ci].member_count = Math.max(0, (db.communities[ci].member_count || 1) - 1);
  }
  save(db);
}

export function totalCommunities() {
  return read().communities.length;
}
