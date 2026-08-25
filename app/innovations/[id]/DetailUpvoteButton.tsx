'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';

export default function DetailUpvoteButton({ id, initialUpvotes }: { id: number; initialUpvotes: number }) {
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(initialUpvotes);

  useEffect(() => {
    try {
      const savedUpvotes = localStorage.getItem('gnuts_upvoted_projects');
      if (savedUpvotes) {
        const ids: number[] = JSON.parse(savedUpvotes);
        if (ids.includes(id)) {
          setIsLiked(true);
        }
      }
    } catch {}
  }, [id]);

  const handleToggleLike = () => {
    let savedIds: number[] = [];
    try {
      const saved = localStorage.getItem('gnuts_upvoted_projects');
      if (saved) savedIds = JSON.parse(saved);
    } catch {}

    if (isLiked) {
      savedIds = savedIds.filter((item) => item !== id);
      setCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      savedIds.push(id);
      setCount((prev) => prev + 1);
      setIsLiked(true);
    }

    try {
      localStorage.setItem('gnuts_upvoted_projects', JSON.stringify(savedIds));
    } catch {}
  };

  return (
    <button
      onClick={handleToggleLike}
      className={`inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold transition-all duration-300 active:scale-95 bg-transparent border-0 p-0 shadow-none outline-none cursor-pointer ${
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
  );
}
