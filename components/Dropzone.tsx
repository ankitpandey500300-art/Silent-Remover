"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Dropzone() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // In a real app we'd pass this via context or state manager like Zustand.
    // Since we can't easily pass File objects via standard Next.js routing, 
    // we'll store it in a global window variable for this prototype, or an object URL.
    // For local processing, object URL is often acceptable or we route and read there.
    
    const fileUrl = URL.createObjectURL(file);
    if (typeof window !== "undefined") {
      (window as any).uploadedFile = file;
      (window as any).uploadedFileUrl = fileUrl;
    }
    
    toast.success("File loaded successfully!");
    router.push("/editor");
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.mkv', '.webm', '.avi'],
      'audio/*': ['.mp3', '.wav']
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative w-full max-w-3xl mx-auto rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 ease-in-out backdrop-blur-sm
        ${isDragActive ? "border-accent bg-accent/5 scale-105" : "border-gray-700 bg-cards/50 hover:border-accent/50 hover:bg-cards/80"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input {...getInputProps()} />
      <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
        isDragActive || isHovered ? "bg-accent text-black scale-110 shadow-[0_0_30px_rgba(0,255,136,0.5)]" : "bg-gray-800 text-gray-400"
      }`}>
        <UploadCloud size={32} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">
        {isDragActive ? "Drop it like it's hot!" : "Drag & Drop your media here"}
      </h3>
      <p className="text-gray-400 mb-6 max-w-sm mx-auto">
        Supports MP4, MOV, MKV, WebM, AVI, MP3, WAV. Maximum privacy: files never leave your browser.
      </p>
      
      <div className="inline-block px-8 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors">
        Browse Files
      </div>
    </div>
  );
}
