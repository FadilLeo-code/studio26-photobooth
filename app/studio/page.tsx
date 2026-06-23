"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { Camera, Zap, ArrowLeft, Wand2, RefreshCcw, Check, RotateCcw, Grid3X3, FlipHorizontal, Focus, SwitchCamera, AlertTriangle, Loader2 } from "lucide-react";
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
  
  const [showGrid, setShowGrid] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  const [selectedFilterId, setSelectedFilterId] = useState("normal");
  const currentFilter = LIVE_FILTERS.find(f => f.id === selectedFilterId) || LIVE_FILTERS[0];

  // ==========================================
  // 🟢 NEW: STABILITY & HARDWARE STATES
  // ==========================================
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    setIsCameraReady(false);
    setCameraError(null);

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        
        currentStream = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // FLAG: Aktifkan START hanya setelah metadata video masuk
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
            videoRef.current?.play();
          };
        }
      } catch (err: any) {
        console.error("Camera Error:", err);
        if (err.name === 'NotAllowedError') {
          setCameraError("Akses kamera ditolak. Silakan izinkan di pengaturan browser Anda.");
        } else if (err.name === 'NotFoundError') {
          setCameraError("Kamera tidak ditemukan pada perangkat ini.");
        } else {
          setCameraError("Gagal mengakses kamera. Pastikan tidak sedang digunakan aplikasi lain.");
        }
      }
    };

    initCamera();

    // CLEANUP: Matikan track sebelum render ulang (penting saat switch kamera)
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]); // Re-run jika switch kamera depan/belakang

  const capturePhoto = (indexToUpdate?: number) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (ctx) {
        // BUGFIX: Reset Transform mutlak sebelum modifikasi koordinat
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Hanya mirror jika kamera depan DAN toggle mirror aktif
        if (isMirrored && facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        ctx.filter = currentFilter.css;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // BUGFIX: Reset Transform lagi untuk keamanan state canvas berikutnya
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.filter = "none";
        
        // MEMORY OPTIMIZATION: Convert ke JPEG kualitas 85% alih-alih PNG
        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        
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
    audio.play().catch((err) => console.log("Gagal memutar suara (auto-play policy):", err));
  };

  const startSequence = async () => {
    if (!isCameraReady) return; // Proteksi tambahan
    
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

      setTimeout(() => {
        setFlash(false); 
        setTimeout(takeShot, 800); 
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

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    // Matikan mirror otomatis kalau pakai kamera belakang
    if (facingMode === "user") setIsMirrored(false); 
  };

  return (
    <div className="min-h-screen bg-[#FFE600] text-black font-sans bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px] flex flex-col justify-between">
      
      <div className="p-4 md:p-8 flex-grow flex flex-col">
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between mb-6 bg-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Link href="/" onClick={clearPhotos} className="p-2 bg-[#FF0054] text-white border-2 border-black hover:translate-y-1 hover:shadow-none transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" aria-label="Kembali ke Beranda">
            <ArrowLeft strokeWidth={3} />
          </Link>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest italic flex gap-2 items-center">
            <Zap size={24} fill="currentColor" className="text-[#00E5FF] drop-shadow-[2px_2px_0px_black]" /> Studio Live
          </h1>
          <div className="font-black text-xl bg-[#00E5FF] px-4 py-1 border-2 border-black -skew-x-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" aria-live="polite">
            {isReviewMode ? "REVIEW" : `${shotsTaken} / ${targetShots}`}
          </div>
        </header>

        <main className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow">
          
          {/* LAYAR UTAMA KAMERA */}
          <div className="lg:col-span-8 relative bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-2 h-full flex flex-col">
            
            <div className="relative w-full aspect-[4/3] bg-black overflow-hidden border-4 border-black flex-grow flex items-center justify-center">
              
              {/* ERROR HANDLING UI */}
              {cameraError ? (
                <div className="text-center p-6 flex flex-col items-center gap-4">
                  <AlertTriangle size={48} className="text-[#FF0054]" />
                  <p className="text-white font-bold uppercase tracking-widest max-w-sm">{cameraError}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-white text-black font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                    Coba Lagi
                  </button>
                </div>
              ) : !isCameraReady ? (
                <div className="flex flex-col items-center gap-4 text-[#00E5FF]">
                  <Loader2 size={48} className="animate-spin" />
                  <p className="font-bold uppercase tracking-widest animate-pulse text-xs">Menghubungkan Lensa...</p>
                </div>
              ) : null}

              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className={`w-full h-full object-cover transition-all duration-300 ${isMirrored && facingMode === "user" ? "-scale-x-100" : ""} ${currentFilter.tw} ${countdown !== null ? "blur-[2px] scale-105" : ""} ${!isCameraReady || cameraError ? "hidden" : "block"}`} 
              />
              
              <AnimatePresence>
                {showGrid && isCameraReady && !cameraError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/30"></div><div className="border-r border-b border-white/30"></div><div className="border-b border-white/30"></div>
                    <div className="border-r border-b border-white/30"></div><div className="border-r border-b border-white/30 flex items-center justify-center"><Focus className="text-white/30" size={32}/></div><div className="border-b border-white/30"></div>
                    <div className="border-r border-white/30"></div><div className="border-r border-white/30"></div><div></div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {flash && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-white z-30" />}
              </AnimatePresence>
              
              <AnimatePresence>
                {countdown !== null && (
                  <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 } as Transition} className="absolute inset-0 flex items-center justify-center z-20 bg-black/10">
                    <span className="text-[15rem] md:text-[20rem] leading-none font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" style={{ WebkitTextStroke: "6px black" }} aria-live="assertive">
                      {countdown}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* QUICK CAMERA TOOLS */}
            {!isReviewMode && isCameraReady && !cameraError && (
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <button onClick={() => setShowGrid(!showGrid)} aria-pressed={showGrid} className={`p-3 border-2 border-black rounded-full transition-transform hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${showGrid ? 'bg-[#00E5FF] text-black' : 'bg-white text-black'}`} title="Rule of Thirds Grid">
                  <Grid3X3 size={20} strokeWidth={2.5} />
                </button>
                <button onClick={() => setIsMirrored(!isMirrored)} aria-pressed={isMirrored} disabled={facingMode !== "user"} className={`p-3 border-2 border-black rounded-full transition-transform hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isMirrored ? 'bg-[#A7FF00] text-black' : 'bg-white text-black'} disabled:opacity-50 disabled:bg-gray-300`} title="Flip Camera (Kamera Depan Saja)">
                  <FlipHorizontal size={20} strokeWidth={2.5} />
                </button>
                <button onClick={toggleCamera} className="p-3 bg-white text-black border-2 border-black rounded-full transition-transform hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" title="Ganti Kamera Depan/Belakang">
                  <SwitchCamera size={20} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>

          {/* PANEL KONTROL KANAN */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full">
            
            {!isReviewMode ? (
              <>
                <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black uppercase mb-3 text-sm">Mode Jepretan</h3>
                  <div className="grid grid-cols-3 gap-2" role="group" aria-label="Pilih jumlah foto">
                    {[1, 2, 3, 4, 6].map((num) => (
                      <button key={num} onClick={() => !isShooting && setTargetShots(num)} disabled={isShooting} aria-pressed={targetShots === num} className={`py-2 font-black border-2 border-black transition-all ${targetShots === num ? "bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-gray-100 hover:bg-gray-200"}`}>{num} Pic</button>
                    ))}
                  </div>

                  <h3 className="font-black uppercase mb-3 mt-6 text-sm">Timer Speed</h3>
                  <div className="grid grid-cols-3 gap-2" role="group" aria-label="Pilih durasi timer">
                    {[3, 5, 10].map((time) => (
                      <button key={time} onClick={() => !isShooting && setTimerDuration(time)} disabled={isShooting} aria-pressed={timerDuration === time} className={`py-2 font-black border-2 border-black transition-all ${timerDuration === time ? "bg-[#FF0054] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-gray-100 hover:bg-gray-200"}`}>{time}s</button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black uppercase mb-3 text-sm flex items-center gap-2"><Wand2 size={16} /> Live Filter</h3>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label="Pilih filter live">
                    {LIVE_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => !isShooting && setSelectedFilterId(f.id)}
                        disabled={isShooting}
                        aria-pressed={selectedFilterId === f.id}
                        className={`px-2 py-3 font-black uppercase text-[10px] border-2 border-black transition-all ${
                          selectedFilterId === f.id ? "bg-[#A7FF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={startSequence} 
                  // FLAG: Tombol start mati jika kamera belum siap atau error
                  disabled={isShooting || !isCameraReady || !!cameraError} 
                  className="w-full py-6 bg-[#FFE600] font-black text-3xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-auto"
                >
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
                        aria-label={`Jepret ulang foto ke-${index + 1}`}
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
      </div>
    </div>
  );
}