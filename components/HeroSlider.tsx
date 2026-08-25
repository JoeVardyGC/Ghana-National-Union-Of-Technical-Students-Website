'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Users, GraduationCap, Building2 } from 'lucide-react';
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
    subtitle: 'The unified voice of Technical and TVET students in Ghana.',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
    btn1_text: 'Who We Are →',
    btn1_link: '/about',
    btn2_text: 'Our Events',
    btn2_link: '/blog',
  },
  {
    title: 'Empowering Technical Students for National Development',
    subtitle: 'Professionals with Integrity.',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-46_w6zphs.jpg',
    btn1_text: 'Who We Are →',
    btn1_link: '/about',
    btn2_text: 'Our Events',
    btn2_link: '/blog',
  },
  {
    title: 'Creating Opportunities Beyond the Classroom',
    subtitle: 'Scholarships, skills, leadership, and innovation.',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-43_hkzlai.jpg',
    btn1_text: 'Who We Are →',
    btn1_link: '/about',
    btn2_text: 'Our Events',
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

const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 2000; // 2 seconds

    if (value === 0) {
      setCount(0);
      return;
    }

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(value * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

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
      <section className="relative h-[520px] sm:h-[580px] lg:h-[620px] w-full overflow-hidden bg-black text-white">
        {activeSlides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Ken Burns Background Image */}
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              />
              
              {/* Better gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

              {/* Content Container with Animated Text Entrance */}
              <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col justify-center items-start pb-16 sm:pb-12 pointer-events-none">
                <div className="max-w-3xl pointer-events-auto">
                  <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg mb-3 sm:mb-4 transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-8 opacity-0'}`}>
                    {slide.title}
                  </h1>

                  <p className={`text-sm sm:text-lg lg:text-xl text-gray-200 font-medium leading-relaxed max-w-2xl drop-shadow-md mb-5 sm:mb-6 transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100 delay-500' : 'translate-y-8 opacity-0'}`}>
                    {slide.subtitle}
                  </p>

                  <div className={`flex flex-wrap gap-4 transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100 delay-700' : 'translate-y-8 opacity-0'}`}>
                    <Link
                      href={slide.btn1_link}
                      className="px-6 py-3 bg-[#014900] text-white hover:bg-[#D9A000] hover:text-[#014900] transition-all rounded-2xl font-bold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {slide.btn1_text}
                    </Link>
                    <Link
                      href={slide.btn2_link}
                      className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 transition-all rounded-2xl font-bold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5"
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
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-20"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-20"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators with Progress Bar */}
        <div className="absolute bottom-16 sm:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {activeSlides.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="group relative py-2 focus:outline-none"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 overflow-hidden bg-white/40 ${
                    isActive ? 'w-10 sm:w-14' : 'w-2.5 sm:w-3 group-hover:bg-white/60'
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

      {/* Floating Modern Compact Stats Bar — Curved Edges */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 -mt-8 z-30 mb-8">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/80 py-5 px-6 sm:px-8 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Stat 1: Students Represented */}
            <div className="flex items-center gap-3.5 md:justify-center pt-2 md:pt-0">
              <div className="w-9 h-9 rounded-lg bg-[#014900]/10 text-[#014900] flex items-center justify-center shrink-0 border border-[#014900]/15">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#014900] leading-none">
                  <AnimatedCounter value={200000 + (new Date().getFullYear() - 2026) * 40000} suffix="+" />
                </h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Students Represented</p>
              </div>
            </div>

            {/* Stat 2: Member Institutions */}
            <div className="flex items-center gap-3.5 md:justify-center pt-3 md:pt-0">
              <div className="w-9 h-9 rounded-lg bg-[#D9A000]/15 text-[#014900] flex items-center justify-center shrink-0 border border-[#D9A000]/25">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#014900] leading-none">
                  <AnimatedCounter value={10} suffix="+" />
                </h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Member Institutions</p>
              </div>
            </div>

            {/* Stat 3: National Advocacy */}
            <div className="flex items-center gap-3.5 md:justify-center pt-3 md:pt-0">
              <div className="w-9 h-9 rounded-lg bg-[#014900]/10 text-[#014900] flex items-center justify-center shrink-0 border border-[#014900]/15">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#014900] leading-none">
                  <AnimatedCounter value={new Date().getFullYear() - 1992} suffix="+ Yrs" />
                </h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">National Advocacy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
