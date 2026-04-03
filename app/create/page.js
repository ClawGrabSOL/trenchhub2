'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileText, Check } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const CATEGORIES = ['General','Crypto','DeFi','NFT','Trading','Gaming','Tech','Sports','Music','Memes','Politics','Science'];

const COLORS = [
  '#7AB541','#8DC84A','#5a9e2f','#4a8a20',
  '#D4D0D5','#b0acb5','#06b6d4','#3b82f6',
  '#8b5cf6','#ec4899','#f59e0b','#ef4444',
];

export default function CreatePage() {
  const router = useRouter();

  const [user,    setUser]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    name:         '',
    description:  '',
    category:     'General',
    rules:        '',
    banner_color: '#7AB541',
    banner_image: null,
    icon_image:   null,
  });

  useEffect(() => {
    const s = localStorage.getItem('trenchmunity_user');
    if (s) setUser(s);
    else   router.push('/');
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const slug = form.name
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/communities', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, owner: user }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create'); return; }
      router.push(`/c/${data.community.slug}`);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasName = form.name.trim().length >= 3;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="section-title mb-1">New</p>
        <h1 className="text-3xl font-bold text-white">Create a Community</h1>
        <p className="text-trench-dim text-sm mt-1">Your community, your rules. Free forever.</p>
      </div>

      <form onSubmit={submit} className="space-y-7">

        {/* ─ Images ─ */}
        <div className="bg-trench-surface border border-trench-border rounded-2xl overflow-hidden">
          {/* Banner preview */}
          <div
            className="h-32 w-full relative"
            style={{
              background: form.banner_image
                ? undefined
                : `linear-gradient(135deg, ${form.banner_color}cc 0%, ${form.banner_color}22 100%)`,
            }}
          >
            {form.banner_image && (
              <img src={form.banner_image} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-trench-surface/80 to-transparent" />

            {/* Community icon overlapping banner */}
            <div className="absolute -bottom-5 left-4">
              {form.icon_image ? (
                <img
                  src={form.icon_image}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border-2 border-trench-surface shadow-lg"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl border-2 border-trench-surface shadow-lg flex items-center justify-center text-base font-bold text-white"
                  style={{ backgroundColor: form.banner_color }}
                >
                  {form.name ? form.name[0].toUpperCase() : '?'}
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 pb-5 px-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ImageUpload
              label="Banner Image"
              hint="Recommended: 1200×300px"
              aspect="banner"
              value={form.banner_image}
              onChange={v => set('banner_image', v)}
            />
            <ImageUpload
              label="Community Icon"
              hint="Square image"
              aspect="icon"
              value={form.icon_image}
              onChange={v => set('icon_image', v)}
            />
          </div>
        </div>

        {/* ─ Name ─ */}
        <div>
          <label className="label">Community Name *</label>
          <input
            className="input"
            placeholder="e.g. Crypto Degens, NFT Hunters, DeFi Signals..."
            value={form.name}
            onChange={e => set('name', e.target.value)}
            maxLength={50}
            required
          />
          {form.name && (
            <p className="text-[11px] text-trench-muted mt-1.5">
              URL: <span className="text-trench-accent font-mono">trenchmunity.com/c/{slug || '...'}</span>
            </p>
          )}
        </div>

        {/* ─ Description ─ */}
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[90px] resize-none"
            placeholder="What's this community about? Who should join?"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            maxLength={500}
          />
          <p className="text-[11px] text-trench-muted mt-1">{form.description.length}/500</p>
        </div>

        {/* ─ Category ─ */}
        <div>
          <label className="label">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => set('category', cat)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all duration-150 ${
                  form.category === cat
                    ? 'bg-trench-accent border-trench-accent text-white'
                    : 'border-trench-border text-trench-muted hover:border-trench-border2 hover:text-trench-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ─ Color ─ */}
        <div>
          <label className="label">Accent Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => set('banner_color', color)}
                className={`w-7 h-7 rounded-lg transition-all duration-150 relative ${
                  form.banner_color === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-trench-bg' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              >
                {form.banner_color === color && (
                  <Check size={10} className="absolute inset-0 m-auto text-white" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─ Rules ─ */}
        <div>
          <label className="label">
            Community Rules
            <span className="normal-case font-normal text-trench-muted ml-1">(optional)</span>
          </label>
          <textarea
            className="input min-h-[80px] resize-none font-mono text-[12px] leading-relaxed"
            placeholder={"1. Be respectful\n2. No spam\n3. Stay on topic"}
            value={form.rules}
            onChange={e => set('rules', e.target.value)}
            maxLength={1000}
          />
        </div>

        {/* ─ Error ─ */}
        {error && (
          <div className="bg-red-500/8 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* ─ Submit ─ */}
        <button
          type="submit"
          className="btn-primary w-full py-3 text-[15px]"
          disabled={loading || !hasName}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Launching...
            </span>
          ) : (
            'Launch Community'
          )}
        </button>

      </form>
    </div>
  );
}
