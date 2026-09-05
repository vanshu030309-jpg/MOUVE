import React from 'react';

export const MovieCardSkeleton: React.FC = () => (
  <div className="flex flex-col rounded-2xl bg-[#0E1119] border border-zinc-800/80 overflow-hidden animate-pulse">
    <div className="aspect-[2/3] w-full bg-zinc-800/60" />
    <div className="p-3.5 space-y-2">
      <div className="h-4 bg-zinc-800 rounded w-3/4" />
      <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
    </div>
  </div>
);

export const MovieGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-5 lg:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <MovieCardSkeleton key={i} />
    ))}
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="w-full min-h-[500px] md:min-h-[600px] bg-[#0A0D14] animate-pulse flex items-end p-8">
    <div className="max-w-2xl space-y-4 w-full">
      <div className="h-6 bg-zinc-800 rounded-full w-36" />
      <div className="h-12 bg-zinc-800 rounded-xl w-3/4" />
      <div className="h-4 bg-zinc-800/70 rounded w-1/2" />
      <div className="h-16 bg-zinc-800/50 rounded-xl w-full" />
      <div className="flex gap-3 pt-2">
        <div className="h-12 bg-zinc-800 rounded-xl w-36" />
        <div className="h-12 bg-zinc-800 rounded-xl w-36" />
      </div>
    </div>
  </div>
);

export const RecommendationCardSkeleton: React.FC = () => (
  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 md:p-6 rounded-2xl bg-[#0B0D15] border border-zinc-800/80 animate-pulse">
    <div className="w-full sm:w-36 md:w-44 lg:w-48 xl:w-52 shrink-0 aspect-[2/3] rounded-xl bg-zinc-800/60" />
    <div className="flex flex-col justify-between flex-1 space-y-3">
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="h-6 w-28 bg-zinc-800 rounded-full" />
          <div className="h-6 w-16 bg-zinc-800 rounded-full" />
        </div>
        <div className="h-7 w-3/4 bg-zinc-800 rounded-lg" />
        <div className="h-4 w-1/2 bg-zinc-800/60 rounded" />
        <div className="h-20 w-full bg-zinc-800/40 rounded-xl mt-3" />
      </div>
      <div className="flex gap-3 pt-3 border-t border-zinc-800/80">
        <div className="h-9 w-24 bg-zinc-800 rounded-xl" />
        <div className="h-9 w-32 bg-zinc-800 rounded-xl" />
      </div>
    </div>
  </div>
);

export const MovieDetailsSkeleton: React.FC = () => (
  <div className="min-h-screen animate-pulse">
    <div className="w-full min-h-[460px] md:min-h-[540px] bg-zinc-900/60" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 -mt-24 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-48 sm:w-56 md:w-64 aspect-[2/3] bg-zinc-800 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-4 pt-6 md:pt-12">
          <div className="h-10 w-2/3 bg-zinc-800 rounded-xl" />
          <div className="h-5 w-1/3 bg-zinc-800/60 rounded" />
          <div className="h-24 w-full bg-zinc-800/40 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);
