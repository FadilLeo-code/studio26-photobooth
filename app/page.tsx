"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Image as ImageIcon } from "lucide-react";

export default function LandingPage() {
  // Upgrade: Menambahkan as const agar TypeScript tidak error saat build Vercel
  const mangaPop: Variants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { type: "spring" as const, stiffness: 200, damping: 10 } 
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans overflow-hidden relative bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:24px_24px]">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-black tracking-tighter text-2xl flex items-center gap-2 uppercase italic">
            <div className="w-8 h-8 bg-[#FF0054] border-2 border-black flex items-center justify-center text-white -skew-x-6">
              <Zap size={18} strokeWidth={3} fill="currentColor" />
            </div>
            Studio<span className="text-[#FF0054]">26</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
            <Link href="#features" className="hover:text-[#FF0054] hover:underline underline-offset-4 decoration-4 transition-all">Features</Link>
            <Link href="/gallery" className="hover:text-[#00E5FF] hover:underline underline-offset-4 decoration-4 transition-all">Gallery</Link>
          </div>
          <Link 
            href="/studio" 
            className="text-sm font-black uppercase tracking-wider bg-[#00E5FF] text-black px-6 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
          >
            Open Studio
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-36 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Badge */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={mangaPop}
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#FFE600] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-black uppercase tracking-widest mb-10 -rotate-2"
        >
          <Sparkles size={16} fill="currentColor" />
          <span>Make A Moment</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" as const, bounce: 0.5 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none uppercase italic"
        >
          Isekai Your <br className="hidden md:block" />
          <span className="inline-block bg-[#FF0054] text-white px-4 py-2 mt-2 border-4 border-black -skew-x-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            Photostrip
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl font-bold max-w-2xl mb-12 bg-white inline-block px-4 py-2 border-2 border-black border-dashed"
        >
          Masuk ke dimensi baru. Bikin foto bareng temen, sahabat atau pacar dengan frame yang menarik dan keren!
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" as const, stiffness: 150 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link 
            href="/studio" 
            className="group flex items-center justify-center gap-3 h-16 px-10 bg-[#FF0054] text-white font-black text-xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FF3377] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all -rotate-1"
          >
            Start Shooting
            <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
          </Link>
          
          <Link 
            href="/gallery" 
            className="group flex items-center justify-center gap-3 h-16 px-10 bg-white text-black font-black text-xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all rotate-1"
          >
            View Gallery
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full text-left"
        >
          <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,229,255,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,229,255,1)] transition-all">
            <div className="w-14 h-14 bg-[#00E5FF] border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Zap size={28} strokeWidth={2.5} /></div>
            <h3 className="text-2xl font-black uppercase mb-3">Zero Lag</h3>
            <p className="font-bold text-gray-700">Kamera live super mulus. Jepret pose terbaikmu tanpa delay seperti koneksi dewa!</p>
          </div>
          
          <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,230,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(255,230,0,1)] transition-all">
            <div className="w-14 h-14 bg-[#FFE600] border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><ImageIcon size={28} strokeWidth={2.5} /></div>
            <h3 className="text-2xl font-black uppercase mb-3">Epic Frames</h3>
            <p className="font-bold text-gray-700">Template 4-cut dengan tema Mecha, Cyberpunk, hingga turnamen kelas dunia.</p>
          </div>
          
          <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,0,84,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(255,0,84,1)] transition-all">
            <div className="w-14 h-14 bg-[#FF0054] border-2 border-black flex items-center justify-center text-white mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Sparkles size={28} strokeWidth={2.5} /></div>
            <h3 className="text-2xl font-black uppercase mb-3">Aura Filters</h3>
            <p className="font-bold text-gray-700">Bangkitkan auramu dengan filter warna cerah khas animasi studio legendaris Jepang.</p>
          </div>
        </motion.div>
      </main>

      <footer className="w-full bg-[#FFE600] border-t-8 border-black mt-20 py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row justify-between items-center gap-10 text-center lg:text-left">
          <div className="flex flex-col gap-3">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Studio<span className="text-[#FF0054]">26</span></h2>
            <div className="font-bold text-black text-sm uppercase tracking-widest leading-loose">
              Developed by: <span className="bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block md:ml-2">Fadil Leo Kurniawan, S.Kom</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:items-end w-full lg:w-1/2">
            <p className="font-black uppercase text-lg border-b-4 border-black inline-block pb-1">Power Level (Tech Stack):</p>
            <div className="flex flex-wrap justify-center lg:justify-end gap-3">
              {["Next.js", "Tailwind CSS", "Framer Motion", "WebRTC"].map((tech) => (
                <span key={tech} className="bg-white border-2 border-black px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{tech}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}