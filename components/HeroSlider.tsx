'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { resolveImgUrl } from '@/lib/imageUtils';

interface Slide {
  title: string;
  subtitle: string;
  image: string;
  btn1_text: string;
  btn1_link: string;
  btn2_text: string;
  btn2_link: string;
}

const PHP_HERO_SLIDES: Slide[] = [
  {
    title: 'Ghana National Union of Technical Students (GNUTS)',
    subtitle: 'The national voice of students in Technical Universities and TVET institutions across Ghana.',
    image: 'https://ik.imagekit.io/joevardy/carousel%201.jpg?updatedAt=1790249603163',
    btn1_text: 'About the union',
    btn1_link: '/about',
    btn2_text: 'Latest news',
    btn2_link: '/blog',
  },
  {
    title: 'Technical students, building Ghana',
    subtitle: 'Professionals with integrity.',
    image: 'https://ik.imagekit.io/joevardy/carousel%202.jpg?updatedAt=1790249603210',
    btn1_text: 'About the union',
    btn1_link: '/about',
    btn2_text: 'Latest news',
    btn2_link: '/blog',
  },
  {
    title: 'Opportunities beyond the classroom',
    subtitle: 'Scholarships, attachments, leadership and a platform for your projects.',
    image: 'https://ik.imagekit.io/joevardy/carousel%203.jpg?updatedAt=1790249603799',
    btn1_text: 'Find scholarships',
    btn1_link: '/scholarships',
    btn2_text: 'Latest news',
    btn2_link: '/blog',
  },
];

interface StatsProps {
  projectsCount?: number;
  scholarshipsCount?: number;
}

export interface CarouselSlideProp {
  id?: number;
  image_url?: string;
  title?: string;
}

// Renders the real number on the server (so search engines and no-JS visitors
// never see "0+"), then gives it a short count-up from 80% once the page loads.
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(value);

  useEffect(() => {
    // State already starts at the real value, so there is nothing to do here
    if (value <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const from = Math.floor(value * 0.8);
    const duration = 1200;
    let startTime: number | undefined;
    let frame: number;

    const animate = (currentTime: number) => {
      if (startTime === undefined) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(from + (value - from) * easeOutQuart));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{count.toLocaleString()}{suffix}</>;
};

export default function HeroSlider({ 
  stats, 
  carouselSlides = [] 
}: { 
  stats?: StatsProps; 
  carouselSlides?: CarouselSlideProp[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const activeSlides: Slide[] = carouselSlides && carouselSlides.length > 0
    ? carouselSlides.map((cs, idx) => {
        const fallback = PHP_HERO_SLIDES[idx % PHP_HERO_SLIDES.length];
        return {
          title: cs.title && cs.title.trim() !== '' ? cs.title : fallback.title,
          subtitle: fallback.subtitle,
          image: cs.image_url ? resolveImgUrl(cs.image_url) : fallback.image,
          btn1_text: fallback.btn1_text,
          btn1_link: fallback.btn1_link,
          btn2_text: fallback.btn2_text,
          btn2_link: fallback.btn2_link,
        };
      })
    : PHP_HERO_SLIDES;

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, activeSlides.length]);

  useEffect(() => {
    setProgress(0);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProgress(100);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [currentIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <section 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative h-[520px] sm:h-[580px] lg:h-[620px] w-full overflow-hidden bg-black text-white"
      >
        {activeSlides.map((slide, index) => {
          const isActive = index === currentIndex;
          const localFallback = `/images/carousel_${(index % 3) + 1}.jpg`;
          // One H1 per page: only the first slide's title is the page heading
          const TitleTag = index === 0 ? 'h1' : 'h2';

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Ken Burns Background Image Layer */}
              <div className="absolute inset-0 overflow-hidden bg-black">
                {/* 1. Instant local base image (never blank, loads in 1ms) */}
                <img
                  src={localFallback}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  // @ts-ignore
                  fetchPriority={index === 0 ? 'high' : 'low'}
                  decoding="async"
                />

                {/* 2. Primary / CDN image overlay (if different from local fallback) */}
                {slide.image && slide.image !== localFallback && (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    // @ts-ignore
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    decoding="async"
                    onError={(e) => {
                      // Gracefully hide overlay if CDN fails so instant local base shows
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              
              {/* Darker on the left where the text sits, so the faces on the right stay clear */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

              <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col justify-center items-start pb-10 pointer-events-none">
                <div className={`max-w-2xl pointer-events-auto transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#D9A000] mb-4">
                    GNUTS &middot; Since 1987
                  </p>
                  <TitleTag className="text-3xl sm:text-4xl lg:text-[3.25rem] font-bold text-white leading-[1.1] mb-4">
                    {slide.title}
                  </TitleTag>

                  <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl mb-8">
                    {slide.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={slide.btn1_link}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-[#D9A000] text-[#013300] hover:bg-white transition-colors rounded-md font-semibold text-sm"
                    >
                      {slide.btn1_text}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href={slide.btn2_link}
                      className="inline-flex items-center px-5 py-3 text-white border border-white/50 hover:bg-white hover:text-[#013300] transition-colors rounded-md font-semibold text-sm"
                    >
                      {slide.btn2_text}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-20 cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-20 cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators with Progress Bar */}
        <div className="absolute bottom-6 left-5 sm:left-8 lg:left-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] flex items-center gap-2 z-20">
          {activeSlides.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="group relative py-2 focus:outline-none cursor-pointer"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className={`h-0.5 transition-all duration-300 overflow-hidden bg-white/35 ${
                    isActive ? 'w-12' : 'w-6 group-hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <div
                      className="h-full bg-[#D9A000] transition-all ease-linear"
                      style={{
                        width: `${progress}%`,
                        transitionDuration: '6000ms',
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Key figures: a plain band under the hero, not a floating glass card */}
      <div className="bg-white border-b border-[#E4E2DA]">
        <dl className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E4E2DA]">
          <div className="py-6 sm:pr-8">
            <dt className="text-sm text-[#5B6560]">Students represented</dt>
            <dd className="mt-1 text-3xl font-bold text-[#014900] font-display tabular-nums">
              <AnimatedCounter value={200000} suffix="+" />
            </dd>
          </div>
          <div className="py-6 sm:px-8">
            <dt className="text-sm text-[#5B6560]">Member institutions</dt>
            <dd className="mt-1 text-3xl font-bold text-[#014900] font-display tabular-nums">
              <AnimatedCounter value={10} suffix="+" />
            </dd>
          </div>
          <div className="py-6 sm:pl-8">
            {/* Founded in 1987 as GNUPS (renamed GNUTS in 2016) */}
            <dt className="text-sm text-[#5B6560]">Representing students since</dt>
            <dd className="mt-1 text-3xl font-bold text-[#014900] font-display tabular-nums">1987</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
