"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Star, Flame } from "lucide-react";

export default function GalleryPage() {
  // Data bayangan (dummy) untuk photostrip
  // Kita menggunakan gambar placeholder dari Unsplash yang mensimulasikan foto portrait
  const dummyPhotostrips = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    imageUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?auto=format&fit=crop&w=400&q=80`,
    likes: Math.floor(Math.random() * 500) + 10,
    theme: ["Classic", "Strike", "Esports", "Neon"][Math.floor(Math.random() * 4)],
    height: Math.floor(Math.random() * (400 - 250 + 1) + 250), // Random height untuk efek Masonry
  }));

  return (
    <div className="min-h-screen bg-white text-black font-sans p-4 md:p-8 bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:24px_24px]">
      
      {/* Header Galeri */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-12 bg-[#00E5FF] p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <Link href="/" className="p-2 bg-white border-2 border-black hover:translate-y-1 hover:shadow-none transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ArrowLeft strokeWidth={3} />
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-widest italic flex gap-2 items-center">
          <ImageIcon size={28} fill="currentColor" /> Hall of Fame
        </h1>
        <div className="hidden md:flex items-center gap-2 font-black uppercase bg-[#FFE600] px-4 py-2 border-2 border-black -skew-x-6">
          <Flame size={20} className="text-[#FF0054]" /> Trending Now
        </div>
      </header>

      {/* Masonry Grid Area */}
      <main className="max-w-7xl mx-auto">
        {/* Menggunakan columns dari Tailwind untuk efek Masonry yang sangat ringan */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {dummyPhotostrips.map((strip, index) => (
            <motion.div
              key={strip.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }} // Lazy loading trigger
              transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
              className="break-inside-avoid relative group"
            >
              {/* Kartu Photostrip */}
              <div className="bg-white border-4 border-black p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-2 group-hover:shadow-[12px_12px_0px_0px_rgba(255,0,84,1)] transition-all duration-300">
                
                <div 
                  className="w-full bg-gray-200 border-2 border-black overflow-hidden relative"
                  style={{ height: `${strip.height}px` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={strip.imageUrl} 
                    alt={`Photostrip ${strip.id}`}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    loading="lazy" // Native lazy loading
                  />
                  
                  {/* Badge Tema */}
                  <div className="absolute top-2 left-2 bg-[#FFE600] text-black text-[10px] font-black uppercase px-2 py-1 border-2 border-black">
                    {strip.theme}
                  </div>
                </div>

                {/* Info Bawah Kartu */}
                <div className="flex justify-between items-center mt-3 px-1">
                  <span className="font-black text-sm uppercase italic">Studio26</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-[#FF0054]">
                    <Star size={16} fill="currentColor" /> {strip.likes}
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </main>



      {/* Call to Action di Bawah */}
      <div className="max-w-md mx-auto mt-20 mb-10 text-center">
        <Link 
          href="/studio" 
          className="inline-flex items-center justify-center gap-3 w-full py-4 bg-[#FF0054] text-white font-black text-xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FF3377] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all -rotate-1"
        >
          Join The Gallery <ArrowLeft className="rotate-180" strokeWidth={3} />
        </Link>
      </div>

      {/* FOOTER MANGA STYLE DENGAN INFORMASI TECH STACK */}
      <footer className="w-full bg-[#FFE600] border-t-8 border-black mt-20 py-16 relative z-10">
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