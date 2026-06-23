"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { Camera, Zap, ArrowLeft, Wand2, RefreshCcw, Check, RotateCcw, Grid3X3, FlipHorizontal, Focus } from "lucide-react";
import Link from "next/link";
import { usePhotoStore } from "@/store/usePhotoStore"; 

const LIVE_FILTERS = [
  { id: "normal", name: "Normal", tw: "", css: "none" },
  { id: "beauty", name: "Beauty ✨", tw: "brightness-110 contrast-110 saturate-150", css: "brightness(1.1) contrast(1.1) saturate(1.5)" },
  { id: "manga", name: "Manga 🦇", tw: "grayscale", css: "grayscale(1)" },
  { id: "retro", name: "Retro 🎞️", tw: "sepia contrast-125", css: "sepia(1) contrast(1.25)" },
  { id: "cyber", name: "Cyber ⚡", tw: "saturate-200 hue-rotate-15", css: "saturate(2) hue-rotate(15deg)" },
];

export default function StudioPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  
  const { photos, addPhoto, updatePhoto, clearPhotos } = usePhotoStore();
  
  const [timerDuration, setTimerDuration] = useState(3);
  const [targetShots, setTargetShots] = useState(4); 
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shotsTaken, setShotsTaken] = useState(0);
  
  // UPGRADE 1: Fitur Pro Camera
  const [showGrid, setShowGrid] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);

  // State untuk mengaktifkan mode Review
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  const [selectedFilterId, setSelectedFilterId] = useState("normal");
  const currentFilter = LIVE_FILTERS.find(f => f.id === selectedFilterId) || LIVE_FILTERS[0];

  useEffect(() => {
    clearPhotos(); 
    setIsReviewMode(false);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 1280, height: 720 } })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Akses kamera ditolak:", err));

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [clearPhotos]);

  const capturePhoto = (indexToUpdate?: number) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (ctx) {
        // UPGRADE 2: Logika Flip Canvas mengikuti state isMirrored
        if (isMirrored) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        ctx.filter = currentFilter.css;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
        
        const photoDataUrl = canvas.toDataURL("image/png");
        
        if (typeof indexToUpdate === 'number') {
          updatePhoto(indexToUpdate, photoDataUrl);
        } else {
          addPhoto(photoDataUrl);
        }
      }
    }
  };

  const playSound = (soundPath: string) => {
    const audio = new Audio(soundPath);
    audio.play().catch((err) => console.log("Gagal memutar suara:", err));
  };

  const startSequence = async () => {
    setIsShooting(true);
    let currentShots = 0;

    const takeShot = async () => {
      if (currentShots >= targetShots) {
        setIsShooting(false);
        setIsReviewMode(true); 
        return;
      }

      for (let i = timerDuration; i > 0; i--) {
        setCountdown(i);
        playSound("/beep.mp3"); 
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      setCountdown(null);
      setFlash(true); 
      playSound("/shutter.mp3"); 
      capturePhoto(); 
      
      currentShots++;
      setShotsTaken(currentShots);

      // UPGRADE 3: Durasi Flash lebih dramatis
      setTimeout(() => {
        setFlash(false); 
        setTimeout(takeShot, 800); // Jeda transisi ke foto berikutnya lebih smooth
      }, 200);
    };

    takeShot();
  };

  const handleRetake = async (index: number) => {
    setIsShooting(true);
    
    for (let i = timerDuration; i > 0; i--) {
      setCountdown(i);
      playSound("/beep.mp3");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    setCountdown(null);
    setFlash(true);
    playSound("/shutter.mp3");
    
    capturePhoto(index);

    setTimeout(() => {
      setFlash(false);
      setIsShooting(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#FFE600] text-black font-sans bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px] flex flex-col justify-between">
      
      <div className="p-4 md:p-8">
        <header className="max-w-5xl mx-auto flex items-center justify-between mb-6 bg-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Link href="/" className="p-2 bg-[#FF0054] text-white border-2 border-black hover:translate-y-1 hover:shadow-none transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ArrowLeft strokeWidth={3} />
          </Link>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest italic flex gap-2 items-center">
            <Zap size={24} fill="currentColor" className="text-[#00E5FF] drop-shadow-[2px_2px_0px_black]" /> Studio Live
          </h1>
          <div className="font-black text-xl bg-[#00E5FF] px-4 py-1 border-2 border-black -skew-x-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {isReviewMode ? "REVIEW" : `${shotsTaken} / ${targetShots}`}
          </div>
        </header>

        <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LAYAR UTAMA KAMERA */}
          <div className="lg:col-span-8 relative bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-2">
            
            <div className="relative w-full aspect-[4/3] bg-black overflow-hidden border-4 border-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover transition-all duration-300 ${isMirrored ? "-scale-x-100" : ""} ${currentFilter.tw} ${countdown !== null ? "blur-[2px] scale-105" : ""}`} 
              />
              
              {/* UPGRADE 4: CAMERA OVERLAY (GRID) */}
              <AnimatePresence>
                {showGrid && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/30"></div><div className="border-r border-b border-white/30"></div><div className="border-b border-white/30"></div>
                    <div className="border-r border-b border-white/30"></div><div className="border-r border-b border-white/30 flex items-center justify-center"><Focus className="text-white/30" size={32}/></div><div className="border-b border-white/30"></div>
                    <div className="border-r border-white/30"></div><div className="border-r border-white/30"></div><div></div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* CINEMATIC FLASH */}
              <AnimatePresence>
                {flash && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-white z-30" />}
              </AnimatePresence>
              
              {/* HUGE COUNTDOWN */}
              <AnimatePresence>
                {countdown !== null && (
                  <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 } as Transition} className="absolute inset-0 flex items-center justify-center z-20 bg-black/10">
                    <span className="text-[15rem] md:text-[20rem] leading-none font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" style={{ WebkitTextStroke: "6px black" }}>{countdown}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* QUICK CAMERA TOOLS */}
            {!isReviewMode && (
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <button onClick={() => setShowGrid(!showGrid)} className={`p-3 border-2 border-black rounded-full transition-transform hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${showGrid ? 'bg-[#00E5FF] text-black' : 'bg-white text-black'}`} title="Rule of Thirds Grid">
                  <Grid3X3 size={20} strokeWidth={2.5} />
                </button>
                <button onClick={() => setIsMirrored(!isMirrored)} className={`p-3 border-2 border-black rounded-full transition-transform hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isMirrored ? 'bg-[#A7FF00] text-black' : 'bg-white text-black'}`} title="Flip Camera">
                  <FlipHorizontal size={20} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>

          {/* PANEL KONTROL KANAN */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {!isReviewMode ? (
              <>
                <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black uppercase mb-3 text-sm">Mode Jepretan</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 6].map((num) => (
                      <button key={num} onClick={() => !isShooting && setTargetShots(num)} disabled={isShooting} className={`py-2 font-black border-2 border-black transition-all ${targetShots === num ? "bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-gray-100 hover:bg-gray-200"}`}>{num} Pic</button>
                    ))}
                  </div>

                  <h3 className="font-black uppercase mb-3 mt-6 text-sm">Timer Speed</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 10].map((time) => (
                      <button key={time} onClick={() => !isShooting && setTimerDuration(time)} disabled={isShooting} className={`py-2 font-black border-2 border-black transition-all ${timerDuration === time ? "bg-[#FF0054] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-gray-100 hover:bg-gray-200"}`}>{time}s</button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black uppercase mb-3 text-sm flex items-center gap-2"><Wand2 size={16} /> Live Filter</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {LIVE_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => !isShooting && setSelectedFilterId(f.id)}
                        disabled={isShooting}
                        className={`px-2 py-3 font-black uppercase text-[10px] border-2 border-black transition-all ${
                          selectedFilterId === f.id ? "bg-[#A7FF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={startSequence} disabled={isShooting} className="w-full py-6 bg-[#FFE600] font-black text-3xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-auto">
                  <Camera strokeWidth={3} size={32} /> {isShooting ? "SMILE!" : "START"}
                </button>
              </>
            ) : (
              // PANEL REVIEW MODE
              <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col">
                <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
                  <Check size={24} className="text-[#00D46A]" /> Check Photos
                </h3>
                
                <div className="grid grid-cols-2 gap-3 flex-grow overflow-y-auto pr-2 mb-4">
                  {photos.map((p, index) => (
                    <div key={index} className="relative w-full border-4 border-black group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p} alt={`Shot ${index}`} className="w-full aspect-[4/3] object-cover" />
                      
                      <button 
                        onClick={() => handleRetake(index)} 
                        disabled={isShooting} 
                        className="absolute inset-0 bg-black/60 text-white font-black opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-1 text-[10px]"
                      >
                        <RotateCcw size={20} /> RETAKE
                      </button>
                      
                      <div className="absolute top-1 left-1 bg-[#FFE600] border-2 border-black text-black text-[10px] font-black px-2 py-0.5">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  <button 
                    onClick={() => { setIsReviewMode(false); clearPhotos(); setShotsTaken(0); }} 
                    disabled={isShooting}
                    className="w-full py-3 border-4 border-black font-black uppercase text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={16} /> Retake All
                  </button>
                  <button 
                    onClick={() => router.push("/editor")} 
                    disabled={isShooting}
                    className="w-full py-4 border-4 border-black font-black uppercase text-lg bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    Go To Editor <ArrowLeft className="rotate-180" size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}