'use client';

import { useState, useSyncExternalStore } from 'react';
import { ThumbsUp } from 'lucide-react';

const STORAGE_KEY = 'gnuts_upvoted_projects';
const CHANGE_EVENT = 'gnuts-likes-changed';

// Which projects this browser has liked. The total itself lives in the database.
function readLikedIds(): number[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const ids = saved ? JSON.parse(saved) : [];
    return Array.isArray(ids) ? ids.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function writeLikedIds(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribeToLikes(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export default function DetailUpvoteButton({
  id,
  initialUpvotes,
  variant = 'hero',
}: {
  id: number;
  initialUpvotes: number;
  /** 'hero' = text button on the dark detail-page header; 'card' = white pill over a card image */
  variant?: 'hero' | 'card';
}) {
  const savedLiked = useSyncExternalStore(
    subscribeToLikes,
    () => readLikedIds().includes(id),
    () => false
  );
  // Set while a like is being saved, so the button responds before the server answers
  const [pendingLiked, setPendingLiked] = useState<boolean | null>(null);
  const isLiked = pendingLiked ?? savedLiked;

  const [count, setCount] = useState(initialUpvotes);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleToggleLike = async () => {
    if (isSaving) return;

    const wasLiked = isLiked;
    const previousCount = count;

    // Update the button straight away, then confirm with the server
    setIsSaving(true);
    setError('');
    setPendingLiked(!wasLiked);
    setCount(Math.max(0, previousCount + (wasLiked ? -1 : 1)));

    try {
      const res = await fetch(`/api/innovations/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: wasLiked ? 'remove' : 'add' }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Could not save your like. Please try again.');
      }

      setCount(Number(data.upvotes) || 0);
      const others = readLikedIds().filter((item) => item !== id);
      writeLikedIds(wasLiked ? others : [...others, id]);
    } catch (err) {
      // Not saved: put the count back the way it was
      setCount(previousCount);
      setError(err instanceof Error ? err.message : 'Could not save your like. Please try again.');
    } finally {
      setPendingLiked(null);
      setIsSaving(false);
    }
  };

  if (variant === 'card') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={isSaving}
          aria-pressed={isLiked}
          aria-label={`${isLiked ? 'Unlike' : 'Like'} this project (${count} ${count === 1 ? 'like' : 'likes'})`}
          title={isLiked ? 'Unlike Project' : 'Like Project'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all duration-300 cursor-pointer disabled:cursor-wait ${
            isLiked
              ? 'bg-[#D9A000] text-[#014900]'
              : 'bg-white/95 text-gray-800 hover:bg-[#D9A000] hover:text-[#014900]'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{count}</span>
        </button>
        {error && (
          <span role="alert" className="max-w-[12rem] px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold text-right shadow-md">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={isSaving}
        aria-pressed={isLiked}
        className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all duration-300 bg-transparent border-0 p-0 shadow-none outline-none cursor-pointer disabled:cursor-wait ${
          isLiked
            ? 'text-[#D9A000]'
            : 'text-gray-200 hover:text-[#D9A000]'
        }`}
        title={isLiked ? 'Unlike Project' : 'Like Project'}
      >
        <ThumbsUp
          className={`w-4 h-4 transition-transform duration-300 ${
            isLiked ? 'fill-current text-[#D9A000] scale-110' : 'text-white'
          }`}
        />
        <span>{isLiked ? `Liked (${count})` : `Like (${count})`}</span>
      </button>
      {error && (
        <span role="alert" className="text-xs font-semibold text-red-200">
          {error}
        </span>
      )}
    </div>
  );
}
