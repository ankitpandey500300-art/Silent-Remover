"use client";

import React, { useEffect, useState, useRef } from "react";
import Dropzone from "@/components/Dropzone";
import { detectSilences, AudioInterval } from "@/utils/audio";
import { processVideo } from "@/utils/ffmpeg";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import toast from "react-hot-toast";
import { Download, Loader2, Play, Pause, Scissors, Settings, Eye } from "lucide-react";
import confetti from "canvas-confetti";

export default function Editor() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");

  const [threshold, setThreshold] = useState<number>(-40);
  const [minDuration, setMinDuration] = useState<number>(0.5);

  const [intervals, setIntervals] = useState<AudioInterval[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [peaks, setPeaks] = useState<number[]>([]);

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle Smart Preview
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPreviewMode || intervals.length === 0) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      // Find if we are currently in a silent interval
      const silentInterval = intervals.find(
        (inter) => inter.isSilent && currentTime >= inter.start && currentTime < inter.end
      );

      if (silentInterval) {
        // Jump to the end of the silent interval
        video.currentTime = silentInterval.end;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [isPreviewMode, intervals]);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).uploadedFile) {
      setFile((window as any).uploadedFile);
      setFileUrl((window as any).uploadedFileUrl);
    }

    // Spacebar to play/pause shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        // Prevent default spacebar scrolling if it's not a form element
        if (e.target === document.body || (e.target as HTMLElement).tagName !== "INPUT") {
          e.preventDefault();
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play().catch(console.error);
            } else {
              videoRef.current.pause();
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Init FFmpeg
    const loadFfmpeg = async () => {
      const _ffmpeg = new FFmpeg();
      try {
        _ffmpeg.on("log", ({ message }) => console.log(message));
        // We use CDN links for core/wasm in browser because local serving requires complex setup.
        await _ffmpeg.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
        });
        setFfmpeg(_ffmpeg);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load processing engine. Check browser support.");
      }
    };
    loadFfmpeg();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const { intervals, duration, peaks } = await detectSilences(file, threshold, minDuration);
      setIntervals(intervals);
      setDuration(duration);
      setPeaks(peaks);
      toast.success("Silence detection complete!");
    } catch (e) {
      toast.error("Failed to analyze audio");
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveSilences = async () => {
    if (!ffmpeg || !file || intervals.length === 0) {
      toast.error("Nothing to process. Please analyze first.");
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    try {
      const blob = await processVideo(ffmpeg, file, intervals, (p: number) => setProgress(p));
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `silent_remover_${file.name}`;
      a.click();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("Export successful!");
    } catch (e) {
      toast.error("Processing failed");
      console.error(e);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const savedTime = intervals.filter(i => i.isSilent).reduce((acc, i) => acc + (i.end - i.start), 0);

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl font-bold mb-8">Upload a Video to Start</h2>
        <Dropzone />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background">
      {/* Main Video & Waveform Area */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto border-r border-gray-800">
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-6 border border-gray-800 shadow-xl relative flex items-center justify-center">
          {fileUrl ? (
            <video
              ref={videoRef}
              src={fileUrl}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          )}
        </div>

        {/* Waveform Visualization (Custom Blocks) */}
        <div className="w-full h-32 bg-cards rounded-2xl border border-gray-800 p-4 relative flex flex-col gap-2">
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>0:00</span>
            <span>{Math.floor(duration)}s</span>
          </div>
          <div className="flex-1 relative flex items-end justify-between gap-[1px] bg-black/50 p-2 rounded-lg overflow-hidden border border-gray-800">
            {intervals.length === 0 || peaks.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-center text-sm text-gray-500">
                No analysis yet. Adjust sliders and analyze.
              </div>
            ) : (
              peaks.map((peak, idx) => {
                const timePerPeak = duration / peaks.length;
                const peakTime = idx * timePerPeak + timePerPeak / 2;
                const isSilent = intervals.some(
                  (inter) => inter.isSilent && peakTime >= inter.start && peakTime <= inter.end
                );
                return (
                  <div
                    key={idx}
                    style={{ height: `${Math.max(peak * 100, 5)}%` }}
                    className={`flex-1 rounded-sm transition-colors ${isSilent ? 'bg-red-800' : 'bg-green-700'}`}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Controls Sidebar */}
      <div className="w-full md:w-96 bg-cards p-6 flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Settings size={20} className="text-accent" />
          Settings
        </h3>

        <div className="space-y-6 flex-1">
          {/* Controls */}
          <div>
            <label className="text-sm font-medium text-gray-300 flex justify-between mb-2">
              Silence Threshold
              <span className="text-white">{threshold} dB</span>
            </label>
            <input
              type="range"
              min="-60"
              max="-20"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <p className="text-xs text-gray-500 mt-1">Lower means only dead silence is removed.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 flex justify-between mb-2">
              Min Silence Duration
              <span className="text-white">{minDuration}s</span>
            </label>
            <input
              type="range"
              min="0.2"
              max="2"
              step="0.1"
              value={minDuration}
              onChange={(e) => setMinDuration(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <p className="text-xs text-gray-500 mt-1">Silences shorter than this are kept.</p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Scissors className="w-5 h-5" />}
            Analyze Silences
          </button>

          {intervals.length > 0 && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl space-y-2 text-center">
              <div className="text-sm text-gray-400">Estimated Time Saved</div>
              <div className="text-3xl font-extrabold text-accent">{savedTime.toFixed(1)}s</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          {intervals.length > 0 && (
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`w-full py-3 font-medium rounded-xl transition flex items-center justify-center gap-2 border ${
                isPreviewMode 
                  ? 'bg-accent/20 text-accent border-accent' 
                  : 'bg-transparent text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Eye className="w-5 h-5" />
              {isPreviewMode ? 'Smart Preview: ON' : 'Smart Preview: OFF'}
            </button>
          )}

          {isProcessing && (
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          <button
            onClick={handleRemoveSilences}
            disabled={isProcessing || intervals.length === 0}
            className="w-full py-4 bg-accent text-black font-bold rounded-xl hover:bg-accentHover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(0,255,136,0.2)]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Processing... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
