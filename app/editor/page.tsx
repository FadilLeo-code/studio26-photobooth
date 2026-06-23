"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePhotoStore } from "@/store/usePhotoStore";
import { motion } from "framer-motion";
import { Download, ArrowLeft, Palette, RefreshCcw, Home, LayoutTemplate, Heart, Brush, Zap, Sparkles, Gift, Printer, Trophy, Gamepad2, Code, Camera } from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";

export default function EditorPage() {
  const router = useRouter();
  const { photos, clearPhotos } = usePhotoStore();
  const stripRef = useRef<HTMLDivElement>(null);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState("white");
  const [selectedDesign, setSelectedDesign] = useState("solid");
  const [selectedFilter, setSelectedFilter] = useState("normal");
  const [selectedRatio, setSelectedRatio] = useState("strip");
  const [selectedTheme, setSelectedTheme] = useState("none");

  useEffect(() => {
    if (photos.length === 0) router.push("/studio");
  }, [photos, router]);

  // UPGRADE 1: 30 VARIASI WARNA FRAME (Solid, Pastel, Neon, Dark)
  const frames: Record<string, string> = {
    white: "bg-white border-8 border-black text-black",
    black: "bg-[#1A1A1A] border-8 border-[#FFE600] text-white",
    gray: "bg-gray-400 border-8 border-black text-black",
    slate: "bg-[#64748B] border-8 border-black text-white",
    red: "bg-[#FF0054] border-8 border-black text-white",
    crimson: "bg-[#DA291C] border-8 border-black text-white",
    maroon: "bg-[#800000] border-8 border-[#FFE600] text-white",
    orange: "bg-[#FF6B00] border-8 border-black text-black",
    coral: "bg-[#FF7F50] border-8 border-black text-black",
    yellow: "bg-[#FFE600] border-8 border-black text-black",
    gold: "bg-[#FFD700] border-8 border-black text-black",
    lime: "bg-[#A7FF00] border-8 border-black text-black",
    green: "bg-[#00D46A] border-8 border-black text-white",
    mint: "bg-[#98FF98] border-8 border-black text-black",
    matcha: "bg-[#C1D5A4] border-8 border-black text-black",
    cyan: "bg-[#00E5FF] border-8 border-[#FF0054] text-black",
    teal: "bg-[#14B8A6] border-8 border-black text-white",
    blue: "bg-[#0055FF] border-8 border-black text-white",
    ocean: "bg-[#0077B6] border-8 border-black text-white",
    navy: "bg-[#0F172A] border-8 border-[#00E5FF] text-white",
    indigo: "bg-[#4B0082] border-8 border-black text-white",
    purple: "bg-[#9D00FF] border-8 border-black text-white",
    lavender: "bg-[#E0B0FF] border-8 border-black text-black",
    pink: "bg-[#FF9CEE] border-8 border-black text-black",
    hotPink: "bg-[#FF00AA] border-8 border-black text-white",
    neonPink: "bg-[#FF10F0] border-8 border-[#00FFFF] text-white",
    roseGold: "bg-[#B76E79] border-8 border-black text-white",
    brown: "bg-[#8B4513] border-8 border-black text-white",
    beige: "bg-[#D4C5B9] border-8 border-black text-black",
    sand: "bg-[#F4A460] border-8 border-black text-black",
  };

  // UPGRADE 2: TAMBAHAN PATTERN DESIGN
  const designs: Record<string, string> = {
    solid: "",
    polka: "bg-[radial-gradient(rgba(0,0,0,0.15)_2px,transparent_2px)] bg-[size:12px_12px]",
    microdots: "bg-[radial-gradient(rgba(0,0,0,0.3)_1px,transparent_1px)] bg-[size:6px_6px]",
    grid: "bg-[linear-gradient(rgba(0,0,0,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:12px_12px]",
    cross: "bg-[radial-gradient(circle,transparent_20%,transparent_20%),linear-gradient(rgba(0,0,0,0.15)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.15)_2px,transparent_2px)] bg-[size:24px_24px]",
    stripes: "bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.1)_8px,rgba(0,0,0,0.1)_16px)]",
    checker: "bg-[conic-gradient(rgba(0,0,0,0.1)_90deg,transparent_90deg_180deg,rgba(0,0,0,0.1)_180deg_270deg,transparent_270deg)] bg-[size:24px_24px]",
    zigzag: "bg-[linear-gradient(135deg,rgba(0,0,0,0.05)_25%,transparent_25%),linear-gradient(225deg,rgba(0,0,0,0.05)_25%,transparent_25%),linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%),linear-gradient(315deg,rgba(0,0,0,0.05)_25%,transparent_25%)] bg-[size:20px_20px] bg-[position:10px_0,10px_0,0_0,0_0]",
    halftone: "bg-[radial-gradient(circle,rgba(0,0,0,0.1)_2px,transparent_2.5px)] bg-[size:10px_10px]",
    blueprint: "bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]",
  };

  const filters: Record<string, string> = {
    normal: "", 
    manga: "grayscale", 
    vintage: "sepia contrast-125 brightness-90", 
    auraPop: "contrast-150 saturate-150",
    cyberNeon: "contrast-150 saturate-200 hue-rotate-15", 
    kpopGlow: "brightness-110 saturate-150 contrast-90", 
    dramatic: "grayscale contrast-150 brightness-75", 
    invert: "invert",
  };

  const handleDownload = async () => {
    if (!stripRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Studio26-${selectedRatio}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Gagal mengunduh gambar:", error);
      alert("Terjadi kesalahan saat menyimpan foto.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!stripRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print - Studio26 Photobooth</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; background:#fff;">
              <img src="${dataUrl}" style="max-width:100%; height:auto;" onload="window.print(); window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        alert("Pop-up diblokir oleh browser. Izinkan pop-up untuk mencetak.");
      }
    } catch (error) {
      console.error("Gagal mencetak gambar:", error);
      alert("Terjadi kesalahan saat memproses cetakan.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getLayoutClass = () => {
    if (selectedRatio === "strip") return "w-[280px] flex flex-col";
    if (selectedRatio === "square") return "w-[400px] aspect-square flex flex-col justify-between";
    if (selectedRatio === "portrait") return "w-[400px] aspect-[4/5] flex flex-col justify-between"; 
    if (selectedRatio === "story-grid" || selectedRatio === "story-strip") return "w-[360px] aspect-[9/16] flex flex-col justify-between";
    if (selectedRatio === "landscape-grid" || selectedRatio === "landscape-row") return "w-[600px] aspect-[16/9] flex flex-col justify-between"; 
    return "w-[280px] flex flex-col";
  };

  const getGridClass = () => {
    const count = photos.length;
    if (selectedRatio === "strip" || selectedRatio === "story-strip") return "grid-cols-1";
    if (selectedRatio === "landscape-row") {
      if (count === 1) return "grid-cols-1";
      if (count === 2) return "grid-cols-2";
      if (count === 3) return "grid-cols-3";
      if (count === 4) return "grid-cols-4";
      if (count === 6) return "grid-cols-6";
    }
    if (selectedRatio === "landscape-grid") {
      if (count <= 2) return "grid-cols-2";
      if (count <= 4) return "grid-cols-2"; 
      return "grid-cols-3"; 
    }
    if (count === 1) return "grid-cols-1";
    if (count === 2) return selectedRatio === "story-grid" ? "grid-cols-1" : "grid-cols-2";
    if (count === 3 || count === 4) return "grid-cols-2";
    if (count === 6) return selectedRatio === "story-grid" || selectedRatio === "portrait" ? "grid-cols-2" : "grid-cols-3";
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
          
          <div className="flex gap-2">
            <button onClick={handlePrint} disabled={isDownloading} className="flex items-center gap-2 bg-[#00E5FF] px-4 py-2 border-2 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 disabled:opacity-50">
              {isDownloading ? <RefreshCcw className="animate-spin" size={20} /> : <Printer strokeWidth={3} size={20} />} 
              <span className="hidden md:inline">Print</span>
            </button>
            <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 bg-[#FFE600] px-4 py-2 border-2 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 disabled:opacity-50">
              {isDownloading ? <RefreshCcw className="animate-spin" size={20} /> : <Download strokeWidth={3} size={20} />} 
              <span className="hidden md:inline">Save</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-10">
          
          {/* PANEL KIRI: Canvas */}
          <div className="lg:col-span-5 xl:col-span-6 flex justify-center overflow-x-auto p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-4 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative ${frames[selectedFrame]} ${designs[selectedDesign]} ${getLayoutClass()}`} ref={stripRef}>
              
              {/* === STICKER THEME OVERLAYS (UPGRADE 3) === */}
              {selectedTheme === "birthday" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 font-black uppercase italic">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#00E5FF] text-black border-4 border-black px-6 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[12px] whitespace-nowrap -rotate-2">HAPPY B-DAY! 🎂</div>
                  <div className="absolute top-20 left-[-10px] text-4xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] rotate-12">🎈</div>
                  <div className="absolute bottom-20 right-[-10px] bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-12 text-[#FF0054]"><Gift size={28} fill="currentColor" /></div>
                  <div className="absolute bottom-12 left-2 text-4xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] -rotate-12">🎉</div>
                  <div className="absolute top-1/2 right-2 bg-[#FFE600] text-black border-4 border-black px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[10px] rotate-6">MAKE A WISH!</div>
                </div>
              )}

              {selectedTheme === "love" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 font-black uppercase italic">
                  <div className="absolute top-4 left-2 text-[#FF0054] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-12"><Heart size={48} fill="currentColor" /></div>
                  <div className="absolute top-6 right-[-10px] bg-white text-[#FF0054] border-4 border-black px-5 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[14px] rotate-12">X.O.X.O</div>
                  <div className="absolute bottom-24 left-2 flex gap-1">
                    <Heart size={20} fill="#FF9CEE" className="text-black -rotate-12 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"/>
                    <Heart size={24} fill="#FF0054" className="text-black rotate-12 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"/>
                  </div>
                  <div className="absolute bottom-16 right-2 bg-[#FF0054] text-white border-4 border-black px-4 py-2 -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[12px] tracking-widest">TRUE LOVE</div>
                </div>
              )}

              {selectedTheme === "brutalist" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 font-black uppercase italic">
                  <div className="absolute top-4 left-[-20px] bg-black text-[#FFE600] px-8 py-1 -rotate-45 text-[10px] tracking-widest border-y-4 border-[#FFE600] shadow-xl">CAUTION</div>
                  <div className="absolute top-1/3 right-[-10px] bg-[#00E5FF] border-4 border-black p-2 rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Zap size={24} fill="currentColor" /></div>
                  <div className="absolute bottom-16 left-2 bg-[#FF0054] text-white border-4 border-black px-3 py-1 -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[10px]">APPROVED</div>
                </div>
              )}

              {selectedTheme === "y2k" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  <div className="absolute top-2 right-2 text-black drop-shadow-[2px_2px_0px_white]"><Sparkles size={36} strokeWidth={2.5} /></div>
                  <div className="absolute bottom-20 left-2 flex gap-[2px] items-end opacity-80 mix-blend-difference">
                    <div className="w-1 h-6 bg-white"></div><div className="w-2 h-6 bg-white"></div><div className="w-1 h-6 bg-white"></div><div className="w-3 h-6 bg-white"></div><div className="w-1 h-6 bg-white"></div>
                  </div>
                  <div className="absolute top-1/2 left-2 bg-gray-300 border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><span className="text-[8px] font-bold block text-center">FILE.exe</span></div>
                </div>
              )}

              {selectedTheme === "redGlory" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 font-black uppercase italic">
                  <div className="absolute top-4 left-[-10px] bg-[#DA291C] text-white border-4 border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[14px] -rotate-6">GLORY GLORY! ⚽</div>
                  <div className="absolute bottom-20 right-2 bg-[#FFE600] border-4 border-black p-2 rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Trophy size={28} className="text-black" /></div>
                  <div className="absolute bottom-12 left-2 bg-black text-white border-4 border-[#DA291C] px-3 py-1 -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[10px] tracking-widest">CHAMPIONS</div>
                </div>
              )}

              {selectedTheme === "esports" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 font-black uppercase italic">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#FFE600] text-black border-4 border-black px-6 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[12px] tracking-widest">PRO PLAYER</div>
                  <div className="absolute top-20 right-[-10px] bg-black border-4 border-[#FFE600] p-2 rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Gamepad2 size={24} className="text-[#FFE600] animate-pulse" /></div>
                  <div className="absolute bottom-16 left-2 bg-[#FF0054] text-white border-4 border-black px-4 py-2 -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[14px]">VICTORY ⚡</div>
                </div>
              )}

              {selectedTheme === "hacker" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 font-mono">
                  <div className="absolute top-4 left-2 bg-black text-[#00FF00] border-2 border-[#00FF00] px-3 py-1 text-[10px]">&gt; SYS.ONLINE_</div>
                  <div className="absolute bottom-24 right-2 bg-black border-2 border-[#00FF00] p-2"><Code size={20} className="text-[#00FF00]" /></div>
                  <div className="absolute top-1/3 left-[-5px] bg-black text-white px-2 py-1 text-[8px] rotate-90 tracking-widest">LEOVINIA_CODE</div>
                </div>
              )}

              {/* Grid Foto */}
              <div className={`grid gap-2 flex-grow ${getGridClass()} relative z-0`}>
                {photos.map((photo, index) => (
                  <div key={index} className="w-full h-full min-h-[100px] bg-black border-4 border-black overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Shot ${index}`} className={`w-full h-full object-cover transition-all duration-300 ${filters[selectedFilter]}`} />
                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
                  </div>
                ))}
              </div>
              
              {/* Branding Bawah */}
              <div className={`text-center pt-4 ${selectedRatio !== 'strip' ? 'mt-auto' : 'mt-4'} relative z-10`}>
                <div className="inline-block px-5 py-2 bg-white/90 backdrop-blur-md border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-black flex items-center gap-2">
                    <Camera size={24} /> STUDIO<span className="text-[#FF0054]">26</span>
                  </h2>
                  <p className="text-[10px] font-bold tracking-widest mt-1 text-black">{new Date().toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* PANEL KANAN: Tools Kustomisasi */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col gap-6">
            
            <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2"><LayoutTemplate size={20}/> Layout Size</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "strip", label: "Classic Strip" }, 
                  { id: "square", label: "Square 1:1" }, 
                  { id: "portrait", label: "IG Feed 4:5" },
                  { id: "story-grid", label: "Story Grid 9:16" }, 
                  { id: "story-strip", label: "Story Strip 9:16" }, 
                  { id: "landscape-grid", label: "PC Grid 16:9" },
                  { id: "landscape-row", label: "PC Row 16:9" }
                ].map(r => (
                  <button key={r.id} onClick={() => setSelectedRatio(r.id)} className={`p-2 border-4 border-black font-black uppercase text-[10px] md:text-xs transition-all ${selectedRatio === r.id ? 'bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 -translate-y-1' : 'bg-gray-100 hover:bg-gray-200'}`}>{r.label}</button>
                ))}
              </div>
            </div>

            {/* BARU DITAMBAHKAN: PANEL FILTER */}
            <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2"><Sparkles size={20}/> Photo Filters</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.keys(filters).map(fId => (
                  <button key={fId} onClick={() => setSelectedFilter(fId)} className={`p-2 border-4 border-black font-black uppercase text-[10px] transition-all ${selectedFilter === fId ? 'bg-[#A7FF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 -translate-y-1' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {fId.replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2"><Heart size={20}/> Sticker Theme</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { id: "none", label: "Clean ✨" }, 
                  { id: "birthday", label: "Birthday 🎂" }, 
                  { id: "love", label: "True Love ❤️" },
                  { id: "brutalist", label: "Streetwear ⚡" }, 
                  { id: "y2k", label: "Y2K Cyber 💫" },
                  { id: "redGlory", label: "Red Glory ⚽" },
                  { id: "esports", label: "Pro Player 🎮" },
                  { id: "hacker", label: "Hacker Mode 💻" }
                ].map(t => (
                  <button key={t.id} onClick={() => setSelectedTheme(t.id)} className={`p-2 border-4 border-black font-black uppercase text-[10px] md:text-xs transition-all ${selectedTheme === t.id ? 'bg-[#FF9CEE] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 -translate-y-1' : 'bg-gray-100 hover:bg-gray-200'}`}>{t.label}</button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2"><Brush size={20} /> Frame Design</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.keys(designs).map(dId => (
                  <button key={dId} onClick={() => setSelectedDesign(dId)} className={`p-2 border-4 border-black font-black uppercase text-[10px] transition-all ${selectedDesign === dId ? 'bg-[#FFE600] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 -translate-y-1' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {dId}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2"><Palette size={20} /> Frame Color (30 Colors)</h3>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 p-1">
                {Object.keys(frames).map((fId) => (
                  <button 
                    key={fId} 
                    onClick={() => setSelectedFrame(fId)} 
                    title={fId.toUpperCase()}
                    className={`h-10 w-full border-4 border-black transition-all ${frames[fId].split(' ')[0]} ${selectedFrame === fId ? 'scale-125 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10' : 'opacity-80 hover:opacity-100 hover:scale-110'}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>

      <footer className="w-full bg-white border-t-8 border-black mt-10 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
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
             {["Next.js", "Tailwind CSS", "WebRTC", "Html-to-Image"].map((tech) => (
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