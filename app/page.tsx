import Dropzone from "@/components/Dropzone";
import { Zap, Shield, Download } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-64px)] pb-20">
      
      {/* Hero Section */}
      <section className="w-full relative flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-balance bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          Remove Silences From Your Videos <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#00aeff]">Instantly</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl text-balance mb-12">
          Drop your video, we remove the dead air. <br />
          <strong className="text-white">100% free. 100% private. No upload needed.</strong>
        </p>
        
        <div className="w-full mb-8">
          <Dropzone />
        </div>
        
        <p className="text-gray-500 text-sm mt-4 flex items-center gap-2">
          <Shield size={14} /> Maximum Security: Processing happens locally on your device.
        </p>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <Zap size={32} className="text-accent" />,
            title: "Lightning Fast",
            description: "Powered by WebAssembly, processing happens directly on your device CPU for maximum speed."
          },
          {
            icon: <Shield size={32} className="text-accent" />,
            title: "100% Private",
            description: "We don't even have a server to upload to. Your files never leave your browser."
          },
          {
            icon: <Download size={32} className="text-accent" />,
            title: "One Click Export",
            description: "Download your clean, perfectly cut video instantly without watermarks."
          }
        ].map((feature, i) => (
          <div key={i} className="bg-cards border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
            <div className="bg-gray-900 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* How it Works Section */}
      <section className="w-full bg-cards border-y border-gray-800 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
            
            {[
              { step: 1, title: "Drop your file", desc: "Select audio or video." },
              { step: 2, title: "We detect silence", desc: "Our algorithm finds dead air." },
              { step: 3, title: "Export clean video", desc: "Download instantly." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-background border-4 border-gray-800 rounded-full flex items-center justify-center text-accent text-2xl font-bold mb-6 shadow-xl">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full mt-auto py-12 px-4 border-t border-gray-800 flex flex-col items-center justify-center text-gray-500">
        <p className="mb-4 text-sm">© {new Date().getFullYear()} SilentRemover. All rights reserved.</p>
        <Link href="/pricing" className="text-accent hover:underline text-sm font-medium">
          View Pricing Plans
        </Link>
      </footer>
    </div>
  );
}
