import Link from 'next/link';
import { Users, FileText } from 'lucide-react';

const CATEGORY_STYLES = {
  Crypto:   'bg-[#7AB541]/15 text-[#8DC84A] border-[#7AB541]/25',
  DeFi:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  NFT:      'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Trading:  'bg-blue-500/10   text-blue-400   border-blue-500/20',
  Gaming:   'bg-pink-500/10   text-pink-400   border-pink-500/20',
  Tech:     'bg-cyan-500/10   text-cyan-400   border-cyan-500/20',
  Sports:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Music:    'bg-red-500/10    text-red-400    border-red-500/20',
  Memes:    'bg-lime-500/10   text-lime-400   border-lime-500/20',
  Politics: 'bg-rose-500/10   text-rose-400   border-rose-500/20',
  Science:  'bg-teal-500/10   text-teal-400   border-teal-500/20',
  General:  'bg-white/5       text-trench-dim border-white/10',
};

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function CommunityCard({ community }) {
  const { name, slug, description, category, member_count, post_count,
          created_at, banner_color, banner_image, icon_image, owner } = community;

  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.General;

  return (
    <Link href={`/c/${slug}`} className="block group">
      <article className="card card-hover h-full flex flex-col">

        {/* ── Banner (self-contained, no overflow issues) ── */}
        <div className="relative h-24 overflow-hidden shrink-0 rounded-t-xl">
          {banner_image ? (
            <img
              src={banner_image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full transition-transform duration-500 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${banner_color}cc 0%, ${banner_color}33 60%, #0f0f0f 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-trench-card/80 via-transparent to-transparent" />

          {/* Category badge — top right, inside banner */}
          <span className={`absolute top-2.5 right-2.5 badge border ${catStyle}`}>
            {category}
          </span>
        </div>

        {/* ── Identity row — icon pulled OUT of overflow container ── */}
        <div className="px-4 pt-3 pb-4 flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-3">
            {/* PFP / icon — always fully visible */}
            <div className="shrink-0">
              {icon_image ? (
                <img
                  src={icon_image}
                  alt={name}
                  className="w-11 h-11 rounded-xl object-cover border border-trench-border shadow-md"
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-xl border border-black/20 shadow-md flex items-center justify-center text-base font-bold text-white"
                  style={{ backgroundColor: banner_color }}
                >
                  {name[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + owner — no truncation, wraps naturally */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-[15px] group-hover:text-trench-accent transition-colors leading-snug break-words">
                {name}
              </h3>
              <p className="text-[11px] text-trench-muted mt-0.5">by @{owner}</p>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-trench-dim leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-1 mt-auto border-t border-trench-border">
            <span className="stat">
              <Users size={11} />
              <span className="font-semibold text-trench-text">{member_count.toLocaleString()}</span>
            </span>
            <span className="stat">
              <FileText size={11} />
              <span className="font-semibold text-trench-text">{post_count}</span>
            </span>
            <span className="text-[11px] text-trench-muted ml-auto">{timeAgo(created_at)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
