import { Suspense } from 'react';
import ExploreClient from './ExploreClient';

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="h-4 w-24 skeleton rounded mb-2" />
          <div className="h-8 w-64 skeleton rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    }>
      <ExploreClient />
    </Suspense>
  );
}
