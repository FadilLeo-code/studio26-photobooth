"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePhotoStore } from "@/store/usePhotoStore";
import { motion } from "framer-motion";
import { Download, ArrowLeft, Palette, Wand2, RefreshCcw, Home, LayoutTemplate, Heart } from "lucide-react";
import Link from "next/link";
import html2canvas from "html2canvas";

export default function EditorPage() {
  const router = useRouter();
  const { photos, clearPhotos } = usePhotoStore();
  const stripRef = useRef<HTMLDivElement>(null);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState("manga");
  const [selectedFilter, setSelectedFilter] = useState("normal");
  const [selectedRatio, setSelectedRatio] = useState("strip");
  const [selectedTheme, setSelectedTheme] = useState("none");

  useEffect(() => {
    if (photos.length === 0) router.push("/studio");
  }, [photos, router]);

  // 12 Pilihan Warna & Tema Frame
  const frames: Record<string, string> = {
    manga: "bg-white border-8 border-black text-black",
    redDevils: "bg-[#DA291C] border-8 border-black text-white",
    yellowEsports: "bg-[#FFE600] border-8 border-black text-black",
    cyberpunk: "bg-[#00E5FF] border-8 border-[#FF0054] text-black",
    kpopPastel: "bg-[#FF9CEE] border-8 border-black text-black",
    darkMecha: "bg-[#1A1A1A] border-8 border-[#FFE600] text-white",
    vintageFilm: "bg-[#D4C5B9] border-8 border-black text-black",
    monochrome: "bg-gray-400 border-8 border-black text-black",
    matcha: "bg-[#C1D5A4] border-8 border-black text-black",
    ocean: "bg-[#0077B6] border-8 border-black text-white",
    lavender: "bg-[#E0B0FF] border-8 border-black text-black",
    gold: "bg-[#FFD700] border-8 border-black text-black",
  };

  const filters: Record<string, string> = {
    normal: "", manga: "grayscale", vintage: "sepia contrast-125 brightness-90", auraPop: "contrast-150 saturate-150",
    cyberNeon: "contrast-150 saturate-200 hue-rotate-15", kpopGlow: "brightness-110 saturate-150 contrast-90", 
    dramatic: "grayscale contrast-150 brightness-75", invert: "invert",
  };

  const handleDownload = async () => {
    if (!stripRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(stripRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Studio26-${selectedRatio}-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error("Gagal mengunduh gambar:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // 5 Rasio Resolusi Modern
  const getLayoutClass = () => {
    if (selectedRatio === "strip") return "w-[280px] flex flex-col";
    if (selectedRatio === "square") return "w-[400px] aspect-square flex flex-col justify-between";
    if (selectedRatio === "story") return "w-[360px] aspect-[9/16] flex flex-col justify-between";
    if (selectedRatio === "portrait") return "w-[400px] aspect-[4/5] flex flex-col justify-between"; // Feed IG
    if (selectedRatio === "landscape") return "w-[600px] aspect-[16/9] flex flex-col justify-between"; // PC/YouTube
    return "w-[280px] flex flex-col";
  };

  // Logika Grid cerdas menyesuaikan jumlah foto
  const getGridClass = () => {
    const count = photos.length;
    if (selectedRatio === "strip") return "grid-cols-1";
    if (selectedRatio === "landscape") {
      if (count <= 2) return "grid-cols-2";
      if (count <= 4) return "grid-cols-4";
      return "grid-cols-3"; // untuk 6 foto
    }
    if (count === 1) return "grid-cols-1";
    if (count === 2) return selectedRatio === "story" ? "grid-cols-1" : "grid-cols-2";
    if (count === 3 || count === 4) return "grid-cols-2";
    if (count === 6) return selectedRatio === "story" || selectedRatio === "portrait" ? "grid-cols-2" : "grid-cols-3";
    return "grid-cols-2";
  };

  if (photos.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#FF0054] text-black font-sans bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px] flex flex-col justify-between">
      
      <div className="p-4 md:p-8">
        <header className="max-w-7xl mx-auto flex items-center justify-between mb-8 bg-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex gap-2">
            <Link href="/studio" className="p-2 bg-[#00E5FF] border-2 border-black hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><ArrowLeft strokeWidth={3} /></Link>
            <Link href="/" onClick={() => clearPhotos()} className="p-2 bg-black text-white border-2 border-black hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Home strokeWidth={3} /></Link>
          </div>
          <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 bg-[#FFE600] px-6 py-2 border-2 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 disabled:opacity-50">
            {isDownloading ? <RefreshCcw className="animate-spin" /> : <Download strokeWidth={3} />} <span className="hidden md:inline">Print Result</span>
          </button>
        </header>

        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-10">
          
          {/* PANEL KIRI: Canvas */}
          <div className="lg:col-span-6 flex justify-center overflow-x-auto p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-4 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative ${frames[selectedFrame]} ${getLayoutClass()}`} ref={stripRef}>
              
              {/* 6 Tema Dekorasi Overlay */}
              {selectedTheme === "love" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  <span className="absolute top-2 left-2 text-4xl">❤️</span><span className="absolute bottom-20 right-4 text-5xl">💕</span><span className="absolute top-1/2 left-[-10px] text-3xl">💘</span>
                </div>
              )}
              {selectedTheme === "cute" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  <span className="absolute top-4 right-4 text-4xl">✨</span><span className="absolute bottom-16 left-2 text-5xl">🌸</span><span className="absolute top-1/3 right-2 text-3xl">🎀</span>
                </div>
              )}
              {selectedTheme === "y2k" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  <span className="absolute top-2 left-4 text-4xl">💫</span><span className="absolute bottom-24 right-2 text-5xl">🌟</span><span className="absolute top-1/3 left-2 text-3xl">✨</span>
                </div>
              )}
              {selectedTheme === "cyber" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  <span className="absolute top-2 right-4 text-4xl">⚡</span><span className="absolute bottom-16 left-4 text-5xl">👾</span><span className="absolute top-1/2 right-0 text-3xl">🔋</span>
                </div>
              )}
              {selectedTheme === "party" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  <span className="absolute top-4 left-4 text-4xl">🎈</span><span className="absolute bottom-16 right-4 text-5xl">🎉</span><span className="absolute top-1/3 left-1 text-3xl">🎂</span>
                </div>
              )}
              {selectedTheme === "gothic" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  <span className="absolute top-2 right-4 text-4xl">🦇</span><span className="absolute bottom-16 left-4 text-5xl">🖤</span><span className="absolute top-1/2 left-[-5px] text-3xl">🕷️</span>
                </div>
              )}

              {/* Grid Foto */}
              <div className={`grid gap-2 flex-grow ${getGridClass()}`}>
                {photos.map((photo, index) => (
                  <div key={index} className="w-full h-full min-h-[100px] bg-black border-4 border-black overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Shot ${index}`} className={`w-full h-full object-cover ${filters[selectedFilter]}`} />
                  </div>
                ))}
              </div>
              
              {/* Branding Bawah */}
              <div className={`text-center pt-4 ${selectedRatio !== 'strip' ? 'mt-auto' : 'mt-4'}`}>
                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">STUDIO26</h2>
                <p className="text-[10px] font-bold tracking-widest mt-1">{new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </motion.div>
          </div>

          {/* PANEL KANAN: Tools Kustomisasi Super Lengkap */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2"><LayoutTemplate size={20}/> Layout Size (5 Opsi)</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "strip", label: "Strip (Classic)" },
                  { id: "square", label: "IG Square (1:1)" },
                  { id: "portrait", label: "IG Feed (4:5)" },
                  { id: "story", label: "TikTok (9:16)" },
                  { id: "landscape", label: "PC (16:9)" }
                ].map(r => (
                  <button key={r.id} onClick={() => setSelectedRatio(r.id)} className={`p-2 border-4 border-black font-black uppercase text-[10px] md:text-xs transition-all ${selectedRatio === r.id ? 'bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-100 hover:bg-gray-200'}`}>{r.label}</button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2"><Heart size={20}/> Sticker Theme (6 Opsi)</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "none", label: "Clean" }, { id: "love", label: "Romantic ❤️" }, { id: "cute", label: "Kawaii 🌸" },
                  { id: "y2k", label: "Y2K Star 💫" }, { id: "cyber", label: "Cyber ⚡" }, { id: "party", label: "Party 🎉" }, { id: "gothic", label: "Gothic 🦇" }
                ].map(t => (
                  <button key={t.id} onClick={() => setSelectedTheme(t.id)} className={`p-2 border-4 border-black font-black uppercase text-[10px] md:text-xs transition-all ${selectedTheme === t.id ? 'bg-[#FF9CEE] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-100 hover:bg-gray-200'}`}>{t.label}</button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2"><Palette size={20} /> Frame Color (12 Opsi)</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {Object.keys(frames).map((fId) => (
                  <button key={fId} onClick={() => setSelectedFrame(fId)} className={`h-10 border-4 border-black font-black uppercase text-[10px] ${frames[fId]} ${selectedFrame === fId ? 'scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'opacity-70 hover:opacity-100'}`}>{fId.replace(/([A-Z])/g, ' $1').trim()}</button>
                ))}
              </div>
            </div>

          </div>
        </main>

        
      </div>
      {/* FOOTER MANGA STYLE UNTUK STUDIO */}
      <footer className="w-full bg-white border-t-8 border-black mt-10 py-8 relative z-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              Studio<span className="text-[#FF0054]">26</span>
            </h2>
            <div className="font-bold text-black text-xs uppercase tracking-widest">
              Developed by: Fadil Leo Kurniawan, S.Kom
            </div>
            <div className="font-bold text-black text-xs uppercase tracking-widest">
              Code & Concept: <a href="https://leoviniacode.my.id" target="_blank" rel="noreferrer" className="text-[#00E5FF] hover:text-[#FF0054] underline decoration-2 underline-offset-2">leoviniacode.my.id</a>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-[300px]">
             {["Next.js", "Tailwind CSS", "WebRTC"].map((tech) => (
                <span key={tech} className="bg-[#FFE600] border-2 border-black px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-default">
                  {tech}
                </span>
              ))}
          </div>
        </div>
      </footer>
    </div>
  );
}