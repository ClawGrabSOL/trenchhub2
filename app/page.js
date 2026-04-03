import Link from 'next/link';
import CommunityCard from '@/components/CommunityCard';
import { getAllCommunities, totalCommunities } from '@/lib/db';
import { ArrowRight, Layers, Users, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getData() {
  const newest  = getAllCommunities({ sort: 'newest'  }).slice(0, 6);
  const popular = getAllCommunities({ sort: 'popular' }).slice(0, 6);
  const total   = totalCommunities();
  return { newest, popular, total };
}

export default async function HomePage() {
  const { newest, popular, total } = await getData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">

      {/* ── Hero ── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl">
          {total > 0 && (
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-trench-surface border border-trench-border text-[12px] font-medium text-trench-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {total.toLocaleString()} {total === 1 ? 'community' : 'communities'} live
            </div>
          )}

          <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.02] tracking-tight mb-6">
            Build your<br />
            <span className="text-trench-accent">community.</span><br />
            <span className="text-trench-silver">No limits.</span>
          </h1>

          <p className="text-trench-dim text-lg sm:text-xl max-w-lg leading-relaxed mb-10">
            X restricted multiple communities per account. We didn't.
            Create as many as you want — free, persistent, fully yours.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/create"
              className="flex items-center gap-2 bg-trench-accent hover:bg-trench-accent2 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-150 text-[15px] active:scale-[.97]"
            >
              Create a Community
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/explore"
              className="flex items-center gap-2 bg-trench-surface hover:bg-trench-hover text-trench-text font-medium px-6 py-3 rounded-xl border border-trench-border transition-all duration-150 text-[15px] active:scale-[.97]"
            >
              Explore All
            </Link>
          </div>
        </div>
      </section>

      {/* ── Popular ── */}
      {popular.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-title mb-1">Trending</p>
              <h2 className="text-xl font-bold text-white">Most Popular</h2>
            </div>
            <Link
              href="/explore?sort=popular"
              className="flex items-center gap-1 text-[13px] text-trench-muted hover:text-trench-accent transition-colors font-medium"
            >
              See all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map(c => <CommunityCard key={c.id} community={c} />)}
          </div>
        </section>
      )}

      {/* ── Newest ── */}
      {newest.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-title mb-1">Fresh</p>
              <h2 className="text-xl font-bold text-white">Just Launched</h2>
            </div>
            <Link
              href="/explore?sort=newest"
              className="flex items-center gap-1 text-[13px] text-trench-muted hover:text-trench-accent transition-colors font-medium"
            >
              See all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newest.map(c => <CommunityCard key={c.id} community={c} />)}
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {total === 0 && (
        <section className="py-20 text-center border border-dashed border-trench-border2 rounded-2xl mb-16">
          <div className="w-12 h-12 rounded-2xl bg-trench-surface border border-trench-border flex items-center justify-center mx-auto mb-4">
            <Layers size={22} className="text-trench-muted" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Nothing here yet</h3>
          <p className="text-trench-muted text-sm mb-6">Be the first to build a community.</p>
          <Link href="/create" className="btn-primary">Create the first one</Link>
        </section>
      )}

      {/* ── How it works ── */}
      <section className="border-t border-trench-border py-16 mb-8">
        <div className="text-center mb-10">
          <p className="section-title mb-2">How it works</p>
          <h2 className="text-2xl font-bold text-white">From zero to community in minutes</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              Icon: Layers,
              label: '01',
              title: 'Create',
              desc:  'Name it, brand it, set your rules. Upload a banner and icon. Takes under a minute.',
            },
            {
              Icon: Users,
              label: '02',
              title: 'Grow',
              desc:  'Share your community link. Anyone can join, post, and interact. No follower count needed.',
            },
            {
              Icon: Globe,
              label: '03',
              title: 'Own it',
              desc:  'Your community lives here permanently. No platform policy can shut it down.',
            },
          ].map(({ Icon, label, title, desc }) => (
            <div key={title} className="bg-trench-surface border border-trench-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-trench-accent/10 border border-trench-accent/20 flex items-center justify-center">
                  <Icon size={17} className="text-trench-accent" />
                </div>
                <span className="text-[11px] font-bold text-trench-muted tracking-widest">{label}</span>
              </div>
              <h3 className="font-bold text-white text-[17px] mb-2">{title}</h3>
              <p className="text-sm text-trench-dim leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
