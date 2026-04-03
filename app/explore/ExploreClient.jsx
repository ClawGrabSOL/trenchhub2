'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import CommunityCard from '@/components/CommunityCard';
import Link from 'next/link';
import { Search, SlidersHorizontal, Plus, Layers } from 'lucide-react';

const CATEGORIES = ['All','Crypto','DeFi','NFT','Trading','Gaming','Tech','Sports','Music','Memes','Politics','Science','General'];
const SORTS = [
  { value: 'newest',  label: 'Newest'      },
  { value: 'popular', label: 'Most Members' },
  { value: 'active',  label: 'Most Active'  },
];

export default function ExploreClient() {
  const searchParams = useSearchParams();

  const [communities, setCommunities] = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState(searchParams.get('search') || '');
  const [category,    setCategory]    = useState(searchParams.get('category') || '');
  const [sort,        setSort]        = useState(searchParams.get('sort') || 'newest');

  const load = useCallback(async (s, cat, srt) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (s)                    p.set('search',   s);
      if (cat && cat !== 'All') p.set('category', cat);
      p.set('sort', srt);
      const res  = await fetch(`/api/communities?${p}`);
      const data = await res.json();
      setCommunities(data.communities || []);
      setTotal(data.total || 0);
    } catch(e) { console.error(e); }
    finally    { setLoading(false); }
  }, []);

  useEffect(() => { load(search, category, sort); }, [sort, category]);

  const handleSearch = (e) => { e.preventDefault(); load(search, category, sort); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="section-title mb-1">Discover</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">
            All Communities
            <span className="ml-3 text-lg font-normal text-trench-muted">({total.toLocaleString()})</span>
          </h1>
          <Link href="/create" className="hidden sm:flex items-center gap-1.5 btn-primary">
            <Plus size={14} />
            New Community
          </Link>
        </div>
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-trench-muted pointer-events-none" />
            <input
              className="input pl-9"
              placeholder="Search communities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>

        <div className="relative">
          <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-trench-muted pointer-events-none" />
          <select
            className="input pl-8 sm:w-44 appearance-none cursor-pointer"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-8 pb-6 border-b border-trench-border">
        {CATEGORIES.map(cat => {
          const active = cat === 'All' ? !category : category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all duration-150 ${
                active
                  ? 'bg-trench-accent border-trench-accent text-white'
                  : 'border-trench-border text-trench-muted hover:text-trench-text hover:border-trench-border2 bg-transparent'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 skeleton rounded-xl" />
          ))}
        </div>
      ) : communities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-up">
          {communities.map(c => <CommunityCard key={c.id} community={c} />)}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-trench-border2 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-trench-surface border border-trench-border flex items-center justify-center mx-auto mb-4">
            <Layers size={22} className="text-trench-muted" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Nothing found</h3>
          <p className="text-trench-muted text-sm mb-5">
            {search ? `No results for "${search}"` : 'No communities in this category yet.'}
          </p>
          <Link href="/create" className="btn-primary">Create one</Link>
        </div>
      )}
    </div>
  );
}
