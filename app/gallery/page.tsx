"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Flame, CloudCog } from "lucide-react";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:24px_24px]">
      
      <div className="p-4 md:p-8">
        {/* Header Galeri */}
        <header className="max-w-6xl mx-auto flex items-center justify-between mb-12 bg-[#00E5FF] p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Link href="/" className="p-2 bg-white border-2 border-black hover:translate-y-1 hover:shadow-none transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ArrowLeft strokeWidth={3} />
          </Link>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest italic flex gap-2 items-center">
            <ImageIcon size={28} fill="currentColor" className="hidden sm:block" /> Hall of Fame
          </h1>
          <div className="hidden md:flex items-center gap-2 font-black uppercase bg-[#FFE600] px-4 py-2 border-2 border-black -skew-x-6">
            <Flame size={20} className="text-[#FF0054]" /> Trending Now
          </div>
        </header>

        {/* COMING SOON AREA */}
        <main className="max-w-4xl mx-auto mt-10 md:mt-20 mb-20 text-center flex flex-col items-center px-4">
          
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: [0, -10, 10, -5, 0], scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="bg-[#FFE600] p-6 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] mb-8 inline-block"
          >
            <CloudCog size={80} strokeWidth={2} className="text-black" />
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 text-black drop-shadow-[4px_4px_0px_rgba(0,229,255,1)]">
            Coming Soon!
          </h2>

          <p className="max-w-2xl text-lg md:text-xl font-bold border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(255,0,84,1)] leading-relaxed">
            Sistem <span className="text-[#FF0054] underline decoration-4 underline-offset-4">Cloud Gallery</span> sedang dirakit oleh sistem. Nantinya, semua hasil jepretan dari Editor akan otomatis dipajang di sini secara <span className="bg-[#FFE600] px-2 border-2 border-black">Real-Time!</span>
          </p>

          {/* Call to Action Kembali ke Studio */}
          <div className="mt-12 w-full max-w-sm">
            <Link 
              href="/studio" 
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#FF0054] text-white font-black text-xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FF3377] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all -rotate-2"
            >
              <ArrowLeft strokeWidth={3} /> Masuk ke Studio
            </Link>
          </div>
        </main>
      </div>

      {/* FOOTER MANGA STYLE DENGAN INFORMASI TECH STACK */}
      <footer className="w-full bg-[#FFE600] border-t-8 border-black py-16 relative z-10 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row justify-between items-center gap-10 text-center lg:text-left">
          
          <div className="flex flex-col gap-3">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
              Studio<span className="text-[#FF0054]">26</span>
            </h2>
            <div className="font-bold text-black text-sm uppercase tracking-widest leading-loose">
              Developed by: <br className="md:hidden" />
              <span className="bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block md:ml-2">
                Fadil Leo Kurniawan, S.Kom
              </span>
            </div>
            <div className="font-bold text-black text-sm uppercase tracking-widest leading-loose">
              Code & Concept: <br className="md:hidden" />
              <a href="https://leoviniacode.my.id" target="_blank" rel="noreferrer" className="bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[#FF0054] hover:bg-[#00E5FF] hover:text-black transition-colors inline-block md:ml-2">
                leoviniacode.my.id
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end w-full lg:w-1/2">
            <p className="font-black uppercase text-lg border-b-4 border-black inline-block pb-1">
              Power Level (Tech Stack):
            </p>
            <div className="flex flex-wrap justify-center lg:justify-end gap-3">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Zustand", "WebRTC", "HTML5 Canvas"].map((tech) => (
                <span key={tech} className="bg-white border-2 border-black px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}