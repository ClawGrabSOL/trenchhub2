'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, FileText, Heart, Link2, Shield, Copy, Check, MessageSquare } from 'lucide-react';
import Link from 'next/link';

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function PostCard({ post, user }) {
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [busy,  setBusy]  = useState(false);

  useEffect(() => {
    if (user) setLiked(localStorage.getItem(`liked_${post.id}_${user}`) === '1');
  }, [user, post.id]);

  const handleLike = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      const res  = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify({ username: user }),
      });
      const data = await res.json();
      setLikes(data.likes);
      setLiked(data.liked);
      const key = `liked_${post.id}_${user}`;
      data.liked ? localStorage.setItem(key, '1') : localStorage.removeItem(key);
    } finally { setBusy(false); }
  };

  return (
    <article className="card p-4 fade-up hover:border-trench-border2 transition-all">
      <div className="flex gap-3">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={!user || busy}
          className={`flex flex-col items-center gap-1 pt-0.5 w-8 shrink-0 group transition-colors
            ${liked ? 'text-trench-accent' : 'text-trench-muted hover:text-trench-accent'}
            disabled:opacity-40`}
        >
          <Heart
            size={15}
            className="transition-transform group-hover:scale-110 group-active:scale-90"
            fill={liked ? 'currentColor' : 'none'}
            strokeWidth={liked ? 0 : 1.5}
          />
          <span className="text-[11px] font-bold tabular-nums">{likes}</span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-[14px] leading-snug mb-1">{post.title}</p>
          {post.content && (
            <p className="text-sm text-trench-dim leading-relaxed mb-2 whitespace-pre-wrap">{post.content}</p>
          )}
          <div className="flex items-center gap-2 text-[11px] text-trench-muted">
            <span className="font-medium text-trench-dim">@{post.author}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function MemberRow({ member, isOwner }) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <div className="w-7 h-7 rounded-full bg-trench-surface border border-trench-border flex items-center justify-center text-[11px] font-bold text-trench-text uppercase shrink-0">
        {member.username[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-trench-text font-medium truncate">@{member.username}</p>
        <p className="text-[11px] text-trench-muted">Joined {timeAgo(member.joined_at)}</p>
      </div>
      {isOwner && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-trench-accent border border-trench-accent/30 px-1.5 py-0.5 rounded">
          Owner
        </span>
      )}
    </div>
  );
}

export default function CommunityPage() {
  const { slug } = useParams();
  const router   = useRouter();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState('');
  const [joined,  setJoined]  = useState(false);
  const [joining, setJoining] = useState(false);
  const [tab,     setTab]     = useState('posts'); // posts | members | about
  const [copied,  setCopied]  = useState(false);

  // Post form
  const [title,    setTitle]    = useState('');
  const [content,  setContent]  = useState('');
  const [posting,  setPosting]  = useState(false);
  const [postErr,  setPostErr]  = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('trenchhub_user');
    if (s) setUser(s);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/communities/${slug}`);
      if (res.status === 404) { router.push('/explore'); return; }
      const json = await res.json();
      setData(json);
      const s = localStorage.getItem('trenchhub_user');
      if (s && json.members) setJoined(json.members.some(m => m.username === s));
    } finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleJoin = async () => {
    if (!user || joining) return;
    setJoining(true);
    try {
      const action = joined ? 'leave' : 'join';
      const res    = await fetch(`/api/communities/${slug}/join`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify({ username: user, action }),
      });
      const json = await res.json();
      setJoined(json.joined);
      setData(prev => ({
        ...prev,
        community: { ...prev.community, member_count: prev.community.member_count + (json.joined ? 1 : -1) },
        members:   json.joined
          ? [...(prev.members || []), { username: user, joined_at: new Date().toISOString() }]
          : (prev.members || []).filter(m => m.username !== user),
      }));
    } finally { setJoining(false); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!user || posting || !title.trim()) return;
    setPosting(true);
    setPostErr('');
    try {
      const res  = await fetch(`/api/communities/${slug}/posts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify({ title, content, author: user }),
      });
      const json = await res.json();
      if (!res.ok) { setPostErr(json.error || 'Failed'); return; }
      setTitle(''); setContent(''); setShowForm(false);
      setData(prev => ({
        ...prev,
        posts:     [json.post, ...(prev.posts || [])],
        community: { ...prev.community, post_count: prev.community.post_count + 1 },
      }));
    } finally { setPosting(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-0">
        <div className="h-48 skeleton" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}
          </div>
          <div className="h-48 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { community, posts = [], members = [] } = data;
  const isOwner   = user === community.owner;
  const canPost   = joined || isOwner;

  return (
    <div>
      {/* ── Banner ── */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        {community.banner_image ? (
          <img src={community.banner_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${community.banner_color}cc 0%, ${community.banner_color}11 100%)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-trench-bg via-trench-bg/40 to-transparent" />
      </div>

      {/* ── Identity bar ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="-mt-8 mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-end gap-4">
            {/* Icon */}
            <div className="shrink-0">
              {community.icon_image ? (
                <img
                  src={community.icon_image}
                  alt={community.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-trench-bg shadow-xl"
                />
              ) : (
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-trench-bg shadow-xl flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: community.banner_color }}
                >
                  {community.name[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{community.name}</h1>
                <span className="badge bg-trench-surface border-trench-border text-trench-dim">
                  {community.category}
                </span>
              </div>
              <p className="text-[13px] text-trench-muted mt-0.5">by @{community.owner}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={copyLink}
              className="p-2 rounded-lg bg-trench-surface border border-trench-border hover:border-trench-border2 transition-all text-trench-muted hover:text-trench-text"
              title="Copy link"
            >
              {copied ? <Check size={15} className="text-green-400" /> : <Link2 size={15} />}
            </button>
            {user ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className={isOwner ? 'hidden' : joined ? 'btn-secondary' : 'btn-primary'}
              >
                {joining ? '...' : joined ? 'Joined' : 'Join Community'}
              </button>
            ) : (
              <span className="text-xs text-trench-muted">Set a username to join</span>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 pb-4 border-b border-trench-border mb-6">
          <span className="stat text-[13px]">
            <Users size={14} />
            <strong className="text-white font-semibold">{community.member_count.toLocaleString()}</strong>
            <span>members</span>
          </span>
          <span className="stat text-[13px]">
            <FileText size={14} />
            <strong className="text-white font-semibold">{community.post_count}</strong>
            <span>posts</span>
          </span>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 mb-6 border-b border-trench-border">
          {[
            { id: 'posts',   label: 'Posts',   icon: MessageSquare },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'about',   label: 'About',   icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-all ${
                tab === id
                  ? 'border-trench-accent text-white'
                  : 'border-transparent text-trench-muted hover:text-trench-dim'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">

          {/* ── Posts tab ── */}
          {tab === 'posts' && (
            <div className="lg:col-span-2 space-y-3">
              {/* Post composer */}
              {canPost ? (
                showForm ? (
                  <form onSubmit={handlePost} className="card p-4 space-y-3 scale-in">
                    <input
                      className="input"
                      placeholder="Post title..."
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      maxLength={150}
                      required
                      autoFocus
                    />
                    <textarea
                      className="input min-h-[90px] resize-none"
                      placeholder="Add more context (optional)..."
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      maxLength={2000}
                    />
                    {postErr && <p className="text-xs text-red-400">{postErr}</p>}
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                      <button type="submit" className="btn-primary" disabled={posting || !title.trim()}>
                        {posting
                          ? <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/></span>
                          : 'Post'
                        }
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full card p-4 text-left flex items-center gap-3 hover:border-trench-border2 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-full bg-trench-accent/20 border border-trench-accent/30 flex items-center justify-center text-[11px] font-bold text-trench-accent uppercase shrink-0 group-hover:bg-trench-accent/30 transition-colors">
                      {user[0]}
                    </div>
                    <span className="text-[13px] text-trench-muted flex-1">What's on your mind?</span>
                    <span className="btn-primary py-1.5 px-3 text-xs">Post</span>
                  </button>
                )
              ) : (
                <div className="card p-4 text-center text-trench-muted text-[13px] border-dashed">
                  {user ? 'Join this community to post' : 'Set a username to join and post'}
                </div>
              )}

              {/* Post list */}
              {posts.length > 0 ? (
                <div className="space-y-2">
                  {posts.map(p => <PostCard key={p.id} post={p} user={user} />)}
                </div>
              ) : (
                <div className="py-16 text-center border border-dashed border-trench-border2 rounded-xl">
                  <MessageSquare size={24} className="text-trench-muted mx-auto mb-3" />
                  <p className="text-trench-muted text-sm font-medium">No posts yet</p>
                  <p className="text-trench-muted text-xs mt-1">Be the first to post something</p>
                </div>
              )}
            </div>
          )}

          {/* ── Members tab ── */}
          {tab === 'members' && (
            <div className="lg:col-span-2">
              <div className="card divide-y divide-trench-border">
                {members.length > 0 ? (
                  <div className="px-4">
                    {members.map(m => (
                      <MemberRow key={m.username} member={m} isOwner={m.username === community.owner} />
                    ))}
                    {community.member_count > members.length && (
                      <p className="text-xs text-trench-muted py-3">
                        +{community.member_count - members.length} more members
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-trench-muted text-sm">
                    <Users size={22} className="mx-auto mb-3 text-trench-muted" />
                    No members yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── About tab ── */}
          {tab === 'about' && (
            <div className="lg:col-span-2 space-y-4">
              {community.description && (
                <div className="card p-5">
                  <h3 className="section-title mb-3">Description</h3>
                  <p className="text-[14px] text-trench-dim leading-relaxed">{community.description}</p>
                </div>
              )}
              {community.rules && (
                <div className="card p-5">
                  <h3 className="section-title mb-3">Rules</h3>
                  <pre className="text-[13px] text-trench-dim whitespace-pre-wrap font-sans leading-relaxed">{community.rules}</pre>
                </div>
              )}
              {!community.description && !community.rules && (
                <div className="py-12 text-center border border-dashed border-trench-border2 rounded-xl text-trench-muted text-sm">
                  No about info set
                </div>
              )}
            </div>
          )}

          {/* ── Sidebar (always visible) ── */}
          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <h3 className="section-title">Community</h3>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-trench-muted">Created by</span>
                  <span className="text-trench-accent font-medium">@{community.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-trench-muted">Members</span>
                  <span className="text-white font-semibold">{community.member_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-trench-muted">Posts</span>
                  <span className="text-white font-semibold">{community.post_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-trench-muted">Category</span>
                  <span className="text-trench-dim">{community.category}</span>
                </div>
              </div>
            </div>

            <button
              onClick={copyLink}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <Link href="/explore" className="block">
              <div className="card p-4 hover:border-trench-border2 transition-all text-center">
                <p className="text-[12px] text-trench-muted mb-1">Looking for more?</p>
                <p className="text-[13px] font-semibold text-trench-accent">Explore all communities →</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
