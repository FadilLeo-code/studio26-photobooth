"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { Camera, Zap, ArrowLeft, Wand2, RefreshCcw, Check, RotateCcw, Grid3X3, FlipHorizontal, SwitchCamera, AlertTriangle, Loader2, Lightbulb, LightbulbOff } from "lucide-react";
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
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();
  
  const { photos, addPhoto, updatePhoto, clearPhotos } = usePhotoStore();
  
  // Basic Settings
  const [timerDuration, setTimerDuration] = useState(3);
  const [targetShots, setTargetShots] = useState(4); 
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shotsTaken, setShotsTaken] = useState(0);
  
  // Display & UI Toggles
  const [showGrid, setShowGrid] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [selectedFilterId, setSelectedFilterId] = useState("normal");
  const currentFilter = LIVE_FILTERS.find(f => f.id === selectedFilterId) || LIVE_FILTERS[0];

  // ==========================================
  // 🟢 UPGRADE 1: HARDWARE & ERROR STATES
  // ==========================================
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraStatus, setCameraStatus] = useState<"loading" | "ready" | "error">("loading");
  const [cameraErrorMsg, setCameraErrorMsg] = useState("");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  // Torch/Flashlight Hardware Control
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  // ==========================================
  // 🟢 UPGRADE 2: INTERACTIVE REVIEW & RETAKE
  // ==========================================
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0); // Foto yang sedang dilihat besar
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null); // Index foto yang akan di-retake

  // Check Available Devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      if (videoInputs.length > 1) setHasMultipleCameras(true);
    }).catch(console.error);
  }, []);

  // Initialize Camera Function (bisa dipanggil ulang saat error)
  const initCamera = useCallback(async () => {
    setCameraStatus("loading");
    setCameraErrorMsg("");
    
    // Stop stream lama jika ada
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraStatus("ready");
          videoRef.current?.play();
        };
      }

      // Check MediaTrackCapabilities (Autofocus & Torch)
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      
      // @ts-ignore - TypeScript kadang tidak kenal properti torch di standard DOM
      if (capabilities.torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
        setIsTorchOn(false);
      }

    } catch (err: any) {
      console.error("Camera Init Error:", err);
      setCameraStatus("error");
      setIsTorchOn(false);
      
      if (err.name === 'NotAllowedError') {
        setCameraErrorMsg("Akses kamera ditolak. Izinkan via pengaturan browser (icon gembok di URL bar).");
      } else if (err.name === 'NotFoundError') {
        setCameraErrorMsg("Kamera tidak ditemukan. Cek koneksi webcam/kamera Anda.");
      } else {
        setCameraErrorMsg("Gagal mengakses lensa. Mungkin sedang digunakan oleh aplikasi lain.");
      }
    }
  }, [facingMode]);

  // Boot Camera On Mount & Cleanup
  useEffect(() => {
    clearPhotos();
    setIsReviewMode(false);
    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [initCamera, clearPhotos]);

  // Hardware Torch Toggle
  const toggleTorch = async () => {
    if (streamRef.current && hasTorch) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !isTorchOn } as any]
        });
        setIsTorchOn(!isTorchOn);
      } catch (err) {
        console.error("Gagal menyalakan senter:", err);
      }
    }
  };

  // Virtual Canvas Capture Core
  const capturePhoto = (indexToUpdate?: number) => {
    try {
      if (!videoRef.current) return;
      const video = videoRef.current;
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (isMirrored && facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        ctx.filter = currentFilter.css;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset transform sebelum menyimpan agar aman
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.filter = "none";
        
        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.85); // Stabil & Hemat Memori
        
        if (typeof indexToUpdate === 'number') {
          updatePhoto(indexToUpdate, photoDataUrl);
        } else {
          addPhoto(photoDataUrl);
        }
      }
    } catch (error) {
      console.error("Proses Jepret Gagal:", error);
    }
  };

  const playSound = (soundPath: string) => {
    const audio = new Audio(soundPath);
    audio.play().catch(() => {}); 
  };

  // Sequence Start (Bisa untuk Normal atau Spesifik Retake)
  const startSequence = async () => {
    if (cameraStatus !== "ready") return; 
    
    setIsShooting(true);
    let currentShots = retakeIndex !== null ? targetShots - 1 : 0; // Skip counter if retake
    const isRetakeMode = retakeIndex !== null;

    const takeShot = async () => {
      // Jika mode Retake, cukup ambil 1 foto lalu kembali ke Review Mode
      if (isRetakeMode || currentShots >= targetShots) {
        setIsShooting(false);
        if (isRetakeMode) {
          setRetakeIndex(null); // Bersihkan status retake
          setActivePhotoIndex(retakeIndex); // Fokus ke foto yang baru diretake
        }
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
      
      // Jika sedang retake, oper index spesifik. Jika normal, tidak oper index.
      capturePhoto(isRetakeMode ? retakeIndex : undefined); 
      
      if (!isRetakeMode) {
        currentShots++;
        setShotsTaken(currentShots);
      }

      setTimeout(() => {
        setFlash(false); 
        if (!isRetakeMode) {
          setTimeout(takeShot, 800); 
        } else {
          takeShot(); // Langsung trigger end loop untuk retake
        }
      }, 200);
    };

    takeShot();
  };

  // Switch to Shooting Mode targeting a specific photo
  const triggerRetakeMenu = (index: number) => {
    setRetakeIndex(index);
    setIsReviewMode(false);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    if (facingMode === "user") setIsMirrored(false); 
  };

  return (
    <div className="min-h-screen bg-[#FFE600] text-black font-sans bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px] flex flex-col justify-between">
      
      <div className="p-4 md:p-8 flex-grow">
        <header className="max-w-4xl mx-auto flex items-center justify-between mb-6 bg-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Link href="/" onClick={clearPhotos} className="p-2 bg-[#FF0054] text-white border-2 border-black hover:translate-y-1 hover:shadow-none transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" aria-label="Kembali">
            <ArrowLeft strokeWidth={3} />
          </Link>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest italic flex gap-2 items-center">
            <Zap size={24} fill="currentColor" className="text-[#00E5FF] drop-shadow-[2px_2px_0px_black]" /> Studio Live
          </h1>
          <div className="font-black text-xl bg-[#00E5FF] px-4 py-1 border-2 border-black -skew-x-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {isReviewMode ? "REVIEW" : retakeIndex !== null ? `RETAKING #${retakeIndex + 1}` : `${shotsTaken} / ${targetShots}`}
          </div>
        </header>

        <main className="max-w-4xl mx-auto relative bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-2">
          
          <div className="relative w-full aspect-[4/3] bg-black overflow-hidden border-4 border-black flex items-center justify-center">
            
            {/* STATE 1: ERROR HANDLING UI */}
            {cameraStatus === "error" ? (
              <div className="text-center p-6 flex flex-col items-center gap-4">
                <AlertTriangle size={48} className="text-[#FF0054]" />
                <p className="text-white font-bold uppercase tracking-widest max-w-sm">{cameraErrorMsg}</p>
                <button onClick={initCamera} className="mt-4 px-6 py-2 bg-[#FFE600] text-black font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:translate-y-1 transition-all">
                  Coba Koneksi Ulang
                </button>
              </div>
            ) : 
            
            /* STATE 2: LOADING UI */
            cameraStatus === "loading" && !isReviewMode ? (
              <div className="flex flex-col items-center gap-4 text-[#00E5FF]">
                <Loader2 size={48} className="animate-spin" />
                <p className="font-bold uppercase tracking-widest animate-pulse text-xs">Membangunkan Lensa...</p>
              </div>
            ) : 

            /* STATE 3: BIG PREVIEW (INTERACTIVE REVIEW MODE) */
            isReviewMode && photos.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 bg-[#1A1A1A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[activePhotoIndex]} alt="Preview Besar" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-[#FF0054] text-white border-2 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                  Preview #{activePhotoIndex + 1}
                </div>
              </motion.div>
            ) : 

            /* STATE 4: LIVE CAMERA (VIDEO) */
            null}

            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover transition-all duration-300 ${isMirrored && facingMode === "user" ? "-scale-x-100" : ""} ${currentFilter.tw} ${countdown !== null ? "blur-[2px] scale-105" : ""} ${cameraStatus !== "ready" || isReviewMode ? "hidden" : "block"}`} 
            />
            
            {/* GRID OVERLAY */}
            <AnimatePresence>
              {showGrid && cameraStatus === "ready" && !isReviewMode && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/30"></div><div className="border-r border-b border-white/30"></div><div className="border-b border-white/30"></div>
                  <div className="border-r border-b border-white/30"></div><div className="border-r border-b border-white/30 flex items-center justify-center"></div><div className="border-b border-white/30"></div>
                  <div className="border-r border-white/30"></div><div className="border-r border-white/30"></div><div></div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* FLASH & COUNTDOWN */}
            <AnimatePresence>
              {flash && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-white z-30" />}
            </AnimatePresence>
            
            <AnimatePresence>
              {countdown !== null && (
                <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 } as Transition} className="absolute inset-0 flex items-center justify-center z-20 bg-black/10">
                  <span className="text-[15rem] md:text-[20rem] leading-none font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" style={{ WebkitTextStroke: "6px black" }}>
                    {countdown}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FLOATING PRO CAMERA TOOLS */}
          {!isReviewMode && cameraStatus === "ready" && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
              {hasTorch && (
                <button onClick={toggleTorch} className={`p-3 border-2 border-black rounded-full transition-transform hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isTorchOn ? 'bg-[#FFE600] text-black' : 'bg-white text-black'}`} title="Toggle Flash/Torch">
                  {isTorchOn ? <Lightbulb size={20} strokeWidth={2.5} /> : <LightbulbOff size={20} strokeWidth={2.5} />}
                </button>
              )}
              {hasMultipleCameras && (
                <button onClick={toggleCamera} className="p-3 bg-white text-black border-2 border-black rounded-full transition-transform hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" title="Ganti Kamera">
                  <SwitchCamera size={20} strokeWidth={2.5} />
                </button>
              )}
              <button onClick={() => setShowGrid(!showGrid)} className={`p-3 border-2 border-black rounded-full transition-transform hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${showGrid ? 'bg-[#00E5FF] text-black' : 'bg-white text-black'}`} title="Rule of Thirds Grid">
                <Grid3X3 size={20} strokeWidth={2.5} />
              </button>
              <button onClick={() => setIsMirrored(!isMirrored)} disabled={facingMode !== "user"} className={`p-3 border-2 border-black rounded-full transition-transform hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isMirrored ? 'bg-[#A7FF00] text-black' : 'bg-white text-black'} disabled:opacity-50`} title="Flip (Kamera Depan Saja)">
                <FlipHorizontal size={20} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANEL KONTROL BAWAH (SHOOTING MODE vs REVIEW MODE) */}
          {/* ======================================================== */}
          
          {!isReviewMode ? (
            <>
              {/* FILTER HORIZONTAL */}
              <div className="mt-4 p-3 bg-white border-4 border-black flex items-center gap-3 overflow-x-auto whitespace-nowrap">
                <div className="flex items-center gap-2 font-black uppercase text-sm bg-[#FF9CEE] px-3 py-2 border-2 border-black shrink-0">
                  <Wand2 size={16} /> Effect
                </div>
                {LIVE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => !isShooting && setSelectedFilterId(f.id)}
                    disabled={isShooting}
                    aria-pressed={selectedFilterId === f.id}
                    className={`px-4 py-2 font-black uppercase text-xs border-2 border-black transition-all shrink-0 ${
                      selectedFilterId === f.id ? "bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* KONTROL DAN TOMBOL START DI BAWAH KAMERA */}
              <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-6 p-4 bg-gray-100 border-4 border-black">
                
                {/* Sembunyikan setingan target pic kalau sedang spesifik Retake */}
                {retakeIndex === null && (
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <span className="font-black uppercase text-sm">Mode Jepretan:</span>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 6].map((num) => (
                        <button key={num} onClick={() => !isShooting && setTargetShots(num)} disabled={isShooting} className={`px-3 py-1 font-black border-2 border-black transition-all ${targetShots === num ? "bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-white hover:bg-gray-200"}`}>{num} Pic</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <span className="font-black uppercase text-sm">Timer Speed:</span>
                  <div className="flex gap-2">
                    {[3, 5, 10].map((time) => (
                      <button key={time} onClick={() => !isShooting && setTimerDuration(time)} disabled={isShooting} className={`px-3 py-1 font-black border-2 border-black transition-all ${timerDuration === time ? "bg-[#FF0054] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-white hover:bg-gray-200"}`}>{time}s</button>
                    ))}
                  </div>
                </div>

                {retakeIndex !== null && (
                  <button onClick={() => { setRetakeIndex(null); setIsReviewMode(true); }} className="px-4 py-2 font-black border-2 border-black bg-white hover:bg-gray-200">
                    Batal Retake
                  </button>
                )}

                <button 
                  onClick={startSequence} 
                  disabled={isShooting || cameraStatus !== "ready"} 
                  className={`w-full md:w-auto px-10 py-4 ${retakeIndex !== null ? 'bg-[#FF0054] text-white' : 'bg-[#FFE600] text-black'} font-black text-2xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  <Camera strokeWidth={3} size={28} /> {isShooting ? "Shooting..." : retakeIndex !== null ? "RETAKE NOW" : "START"}
                </button>
              </div>
            </>
          ) : (
            // ==========================================
            // INTERACTIVE REVIEW PANEL
            // ==========================================
            <div className="mt-4 p-4 bg-gray-100 border-4 border-black flex flex-col gap-4">
              <div className="flex justify-between items-center border-b-4 border-black pb-2">
                <h3 className="font-black uppercase text-lg flex items-center gap-2">
                  <Check size={24} className="text-[#00D46A]" /> Check Photos
                </h3>
                {/* RETAKE THE ACTIVE PHOTO */}
                <button 
                  onClick={() => triggerRetakeMenu(activePhotoIndex)}
                  className="bg-[#FFE600] text-black border-2 border-black px-4 py-2 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform flex gap-2 items-center"
                >
                  <RotateCcw size={16} /> Retake Selected
                </button>
              </div>
              
              {/* THUMBNAIL SELECTOR */}
              <div className="flex overflow-x-auto gap-4 pb-2">
                {photos.map((p, index) => (
                  <button 
                    key={index}
                    onClick={() => setActivePhotoIndex(index)}
                    className={`relative min-w-[100px] w-1/4 border-4 transition-all overflow-hidden focus:outline-none ${activePhotoIndex === index ? 'border-[#00E5FF] shadow-[0_0_0_4px_rgba(0,229,255,0.5)] -translate-y-2' : 'border-black opacity-70 hover:opacity-100'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt={`Shot ${index}`} className="w-full aspect-[4/3] object-cover" />
                    <div className="absolute top-1 left-1 bg-black text-white text-[10px] font-black px-2 py-0.5">
                      {index + 1}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-4">
                <button 
                  onClick={() => { setIsReviewMode(false); clearPhotos(); setShotsTaken(0); setActivePhotoIndex(0); }} 
                  className="w-1/3 py-4 border-4 border-black font-black uppercase bg-white hover:bg-gray-200 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <RefreshCcw size={20} /> Reset All
                </button>
                <button 
                  onClick={() => router.push("/editor")} 
                  className="w-2/3 py-4 border-4 border-black font-black uppercase text-lg md:text-xl bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Editor <ArrowLeft className="rotate-180" size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

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
             {["Next.js", "Tailwind CSS", "WebRTC", "Pro Controls"].map((tech) => (
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