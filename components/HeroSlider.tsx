'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Users, GraduationCap, Building2 } from 'lucide-react';

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

export default function HeroSlider({ stats }: { stats?: StatsProps }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PHP_HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
    setCurrentIndex((prev) => (prev === 0 ? PHP_HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % PHP_HERO_SLIDES.length);
  };

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <section className="relative h-[92vh] min-h-[650px] sm:min-h-[750px] lg:min-h-[850px] max-h-[950px] w-full overflow-hidden bg-black text-white">
        {PHP_HERO_SLIDES.map((slide, index) => {
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
              <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col justify-center items-start pb-20 sm:pb-16 pointer-events-none">
                <div className="max-w-3xl pointer-events-auto">
                  <h1 className={`text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg mb-4 sm:mb-6 transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-8 opacity-0'}`}>
                    {slide.title}
                  </h1>

                  <p className={`text-base sm:text-xl lg:text-2xl text-gray-200 font-medium leading-relaxed max-w-2xl drop-shadow-md mb-6 sm:mb-8 transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100 delay-500' : 'translate-y-8 opacity-0'}`}>
                    {slide.subtitle}
                  </p>

                  <div className={`flex flex-col sm:flex-row gap-3.5 transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100 delay-700' : 'translate-y-8 opacity-0'}`}>
                    <Link
                      href={slide.btn1_link}
                      className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#014900] text-white font-extrabold text-sm sm:text-base tracking-wide hover:bg-[#003300] transition-all shadow-lg text-center"
                    >
                      {slide.btn1_text}
                    </Link>

                    <Link
                      href={slide.btn2_link}
                      className="inline-flex items-center justify-center px-8 py-4 rounded-md border-2 border-white/80 bg-white/5 backdrop-blur-sm text-white font-bold text-sm sm:text-base tracking-wide hover:bg-white hover:text-[#014900] transition-all text-center"
                    >
                      {slide.btn2_text}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Hero Navigation Controls */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-[#D9A000] hover:text-[#014900] hover:border-[#D9A000] text-white flex items-center justify-center transition-all group"
        >
          <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-[#D9A000] hover:text-[#014900] hover:border-[#D9A000] text-white flex items-center justify-center transition-all group"
        >
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Slide Progress Bar (replacing dots) */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10 z-20">
          <div
            className="h-full bg-[#D9A000] ease-linear"
            style={{ 
              width: `${progress}%`,
              transitionDuration: progress === 0 ? '0ms' : '6000ms',
              transitionProperty: 'width'
            }}
          />
        </div>
      </section>

      {/* Overlay Stats Card with Glassmorphism and Animated Counters */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 -mt-24 sm:-mt-20 z-30 mb-12">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {/* Stat 1 */}
            <div className="flex items-center gap-5 sm:justify-center pt-2 sm:pt-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#014900]/10 to-[#014900]/5 text-[#014900] flex items-center justify-center shrink-0 border border-[#014900]/10 shadow-sm">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-3xl sm:text-4xl font-extrabold text-[#014900]">
                  <AnimatedCounter value={10} suffix="+" />
                </h4>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Active Member Institutions</p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-5 sm:justify-center pt-6 sm:pt-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#014900]/10 to-[#014900]/5 text-[#014900] flex items-center justify-center shrink-0 border border-[#014900]/10 shadow-sm">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-3xl sm:text-4xl font-extrabold text-[#014900]">
                  <AnimatedCounter value={(stats?.scholarshipsCount && stats.scholarshipsCount > 0) ? stats.scholarshipsCount : 1} />
                </h4>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Active Scholarships Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
