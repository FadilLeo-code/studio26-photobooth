"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePhotoStore } from "@/store/usePhotoStore"; 

export default function StudioPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  
  const { photos, addPhoto, clearPhotos } = usePhotoStore();
  
  const [timerDuration, setTimerDuration] = useState(3);
  const [targetShots, setTargetShots] = useState(4); 
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shotsTaken, setShotsTaken] = useState(0);

  useEffect(() => {
    clearPhotos(); 
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

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        addPhoto(canvas.toDataURL("image/png"));
      }
    }
  };

  // Fungsi Pemicu Efek Suara (SFX)
  const playSound = (soundPath: string) => {
    const audio = new Audio(soundPath);
    audio.play().catch((err) => console.log("Gagal memutar suara:", err));
  };

  const startSequence = async () => {
    setIsShooting(true);
    let currentShots = 0;

    const takeShot = async () => {
      if (currentShots >= targetShots) {
        router.push("/editor");
        return;
      }

      // Hitung mundur dengan efek suara Beep
      for (let i = timerDuration; i > 0; i--) {
        setCountdown(i);
        playSound("/beep.mp3"); // Panggil SFX Beep
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      setCountdown(null);
      setFlash(true); 
      
      // Jepretan dengan efek suara Shutter
      playSound("/shutter.mp3"); // Panggil SFX Cekrek
      capturePhoto(); 
      
      currentShots++;
      setShotsTaken(currentShots);

      setTimeout(() => {
        setFlash(false); 
        setTimeout(takeShot, 500); 
      }, 150);
    };

    takeShot();
  };

  return (
    <div className="min-h-screen bg-[#FFE600] text-black font-sans bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px] flex flex-col justify-between">
      
      <div className="p-4 md:p-8">
        <header className="max-w-4xl mx-auto flex items-center justify-between mb-6 bg-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Link href="/" className="p-2 bg-[#FF0054] text-white border-2 border-black hover:translate-y-1 hover:shadow-none transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ArrowLeft strokeWidth={3} />
          </Link>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest italic flex gap-2 items-center">
            <Zap size={24} fill="currentColor" /> Studio Live
          </h1>
          <div className="font-black text-xl bg-[#00E5FF] px-4 py-1 border-2 border-black -skew-x-6">
            {shotsTaken} / {targetShots}
          </div>
        </header>

        <main className="max-w-4xl mx-auto relative bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-2">
          <div className="relative w-full aspect-[4/3] bg-black overflow-hidden border-4 border-black">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover -scale-x-100" />
            <AnimatePresence>
              {flash && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white z-20" />}
            </AnimatePresence>
            <AnimatePresence>
              {countdown !== null && (
                <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="text-9xl font-black text-white drop-shadow-[0_8px_8px_rgba(0,0,0,1)] text-stroke-3">{countdown}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 p-4 bg-gray-100 border-4 border-black">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <span className="font-black uppercase text-sm">Mode Jepretan:</span>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 6].map((num) => (
                  <button key={num} onClick={() => !isShooting && setTargetShots(num)} disabled={isShooting} className={`px-3 py-1 font-black border-2 border-black transition-all ${targetShots === num ? "bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-white hover:bg-gray-200"}`}>{num} Pic</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
              <span className="font-black uppercase text-sm">Timer Speed:</span>
              <div className="flex gap-2">
                {[3, 5, 10].map((time) => (
                  <button key={time} onClick={() => !isShooting && setTimerDuration(time)} disabled={isShooting} className={`px-3 py-1 font-black border-2 border-black transition-all ${timerDuration === time ? "bg-[#FF0054] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-white hover:bg-gray-200"}`}>{time}s</button>
                ))}
              </div>
            </div>

            <button onClick={startSequence} disabled={isShooting} className="w-full md:w-auto px-10 py-4 bg-[#FFE600] font-black text-2xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <Camera strokeWidth={3} size={28} /> {isShooting ? "Shooting..." : "Start"}
            </button>
          </div>
        </main>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* FOOTER MANGA STYLE UNTUK STUDIO (Portofolio Tetap Aktif) */}
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