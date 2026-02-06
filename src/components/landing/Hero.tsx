import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Play, ChevronLeft, ChevronRight, GraduationCap, Globe, ShieldCheck, School } from 'lucide-react';
import { Odometer } from '@/components/Odometer';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_SLIDES = [
  {
    type: "points",
    topLabel: "Helping more than 2500+",
    topBadge: "Institutions to Scale Excellence",
    title: "Pioneering Innovation",
    subtitle: "Leading the Digital Frontier Since 2025",
    subtitleColor: "text-[#10b981]",
    items: [
      'Empowering schools with AI-powered actionable insights.',
      'Unified 360° student lifecycle management system.',
      'Breaking operational silos with seamless automation.',
      'Elevating classroom experiences with next-gen digital assets.'
    ],
    trustSignals: [
      { label: "Trusted by 2500+ Institutions", color: "bg-[#10b981]" },
      { label: "ISO 27001 & DPDP Compliant", color: "bg-[#3b82f6]" }
    ],
    image: '/slider1.png'
  },
  {
    type: "description",
    topLabel: "CampusCare 10X · Advanced LMS",
    topBadge: "Modern Pedagogy Orchestration",
    title: "Transform Learning into a",
    subtitle: "Future-Ready Experience",
    subtitleColor: "text-[#f59e0b]",
    description: "Foster collaborative excellence. Connect teachers, parents, and students on a unified platform designed for academic growth and engagement.",
    trustSignals: [
      { label: "Global Presence", color: "bg-[#f59e0b]" },
      { label: "Cloud-Native Security", color: "bg-[#f59e0b]" }
    ],
    image: '/slider2.png'
  },
  {
    type: "description",
    topLabel: "Enterprise Governance - Scalable",
    topBadge: "Unified School Group Management",
    title: "Manage Global Campuses from a",
    subtitle: "Single Strategic Pane",
    subtitleColor: "text-[#f59e0b]",
    description: "Enterprise-grade oversight for school groups. Centralize finance, admissions, and compliance across multiple locations with ease.",
    trustSignals: [
      { label: "Multi-Campus Optimized", color: "bg-[#f59e0b]" },
      { label: "Real-time Analytics", color: "bg-[#f59e0b]" }
    ],
    image: '/slider3.png'
  }
];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      moveSlide(1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const moveSlide = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: ORIGINAL SLIDER HERO */}
      <div className="relative bg-[#0b1b35] min-h-[92vh] flex items-center overflow-hidden font-sans">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10 py-10 w-full h-full text-left">
          {/* Persistent Stats (Top Right) */}
          <div className="absolute top-8 right-16 flex items-center space-x-6 z-40 hidden md:flex">
            <div className="bg-[#1a2b45]/60 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-[20px] flex items-center space-x-3 shadow-xl scale-90 transition-transform hover:scale-95">
              <div className="bg-indigo-600 p-2 rounded-full shadow-lg shadow-indigo-500/50">
                <Play className="w-3 h-3 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black leading-tight">Active Users</span>
                <span className="text-white font-black text-base leading-tight"><Odometer value={5005852} suffix="+" /></span>
              </div>
            </div>
            <div className="bg-[#1a2b45]/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-[20px] shadow-xl scale-90 transition-transform hover:scale-95 text-center">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black leading-tight">Uptime</span>
                <span className="text-white font-black text-base leading-tight"><Odometer value={99} suffix=".9%" /></span>
              </div>
            </div>
          </div>

          {/* Navigation Arrows at Bottom Left */}
          <div className="absolute bottom-8 left-16 flex space-x-3 z-40">
            <button
              onClick={() => moveSlide(-1)}
              className="w-10 h-10 rounded-lg border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#f59e0b]/20 hover:border-[#f59e0b] transition-all active:scale-95 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => moveSlide(1)}
              className="w-10 h-10 rounded-lg border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#f59e0b]/20 hover:border-[#f59e0b] transition-all active:scale-95 group"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="relative h-[72vh] flex items-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-gray-400">
                      <div className="w-2.5 h-2.5 bg-[#10b981] rounded-sm animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                      <span className="text-sm font-semibold tracking-wide text-gray-300 italic flex items-center gap-2">
                        {slide.topLabel}
                        <span className="inline-block w-2 h-2 bg-[#10b981] rounded-sm animate-pulse opacity-75"></span>
                      </span>
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter">
                    {slide.title} <br />
                    <span className={`${slide.subtitleColor} drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] text-2xl md:text-3xl lg:text-4xl font-extrabold mt-1 block`}>
                      {slide.subtitle}
                    </span>
                  </h1>

                  {slide.type === "points" ? (
                    <div className="space-y-4 pt-2">
                      {slide.items && slide.items.map((item, i) => (
                        <div key={i} className="flex items-center space-x-4 text-gray-300 group">
                          <div className="bg-blue-600/10 p-1 rounded-full">
                            <Play className="h-3.5 w-3.5 text-blue-400 fill-blue-400" />
                          </div>
                          <span className="text-xl font-normal tracking-wide text-gray-200">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg font-light text-left">
                      {slide.description}
                    </p>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Link to="/login">
                      <Button className="bg-[#f59e0b] hover:bg-[#ffb330] text-white px-8 py-3 rounded-md text-sm font-bold transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                        See Impact
                      </Button>
                    </Link>
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] active:scale-95 border-none">
                      Discover ERP
                    </Button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="relative w-full max-w-[750px] aspect-[16/10] bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10 shadow-3xl overflow-hidden">
                    <img
                      className="w-full h-auto max-h-full object-contain rounded-2xl select-none"
                      src={slide.image}
                      alt={slide.title}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* SECTION 2: NEW CONTENT FROM IMAGE */}
      <div className="relative bg-white py-24 flex flex-col items-center font-sans overflow-hidden border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 text-center space-y-12">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[#1e293b] text-sm font-semibold shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <Play className="w-3 h-3 fill-blue-600 text-blue-600" />
            See CampusCare 10X In Action
          </div>

          {/* Headline */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-[#0f172a] leading-[1.1] tracking-tight">
              Experience the Future of <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                School Management
              </span>
            </h1>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Watch how leading institutions are transforming their operations with our cutting-edge platform. Real results, real impact.
            </p>
          </div>

          {/* Brand Silhouette Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-8">
            {[
              { name: "St. Xavier's International", icon: <GraduationCap className="h-6 w-6 text-emerald-600" /> },
              { name: "Global Academy Groups", icon: <Globe className="h-6 w-6 text-blue-600" /> },
              { name: "Modern Heritage School", icon: <ShieldCheck className="h-6 w-6 text-indigo-600" /> },
              { name: "Lotus Valley Institutions", icon: <School className="h-6 w-6 text-emerald-600" /> }
            ].map((school, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-3 bg-white px-6 py-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-opacity-80 transition-all">
                  {school.icon}
                </div>
                <span className="text-[11px] font-extrabold text-[#0f172a] text-center leading-tight uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                  {school.name}
                </span>
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-bold text-emerald-600">Partner Institution</span>
                </div>
              </div>
            ))}
          </div>

          {/* Video Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-6xl mx-auto w-full">
            {[
              {
                title: "School Management",
                stat: "2,500+ Schools Empowered",
                image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
                color: "indigo"
              },
              {
                title: "Analytics & Reports",
                stat: "1M+ Daily Insights",
                image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=800",
                color: "purple"
              },
              {
                title: "Digital Management",
                stat: "Enterprise-Grade Security",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
                color: "pink"
              }
            ].map((card, i) => (
              <div key={i} className="group relative aspect-[14/11] rounded-[40px] overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{card.title}</span>
                  </div>
                </div>
                <div className="absolute top-6 right-6">
                  <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                    <div className="p-0.5 bg-blue-500 rounded-full">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-white">{card.stat}</span>
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/30">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-indigo-600 fill-indigo-600 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
