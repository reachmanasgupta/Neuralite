import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [userName, setUserName] = useState('');

  // Dynamically fetch user name for the dashboard preview
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.name) {
          // Get first name
          setUserName(userObj.name.split(' ')[0]);
        }
      }
    } catch (error) {
      console.error("Error parsing user data", error);
    }
  }, []);

  return (
    <div className="flex flex-col w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500 min-h-screen font-sans selection:bg-cyan-500/30 text-slate-900 dark:text-slate-100 pb-12">
      
      {/* Embedded CSS for premium, lightweight micro-animations */}
      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
        }
        .animate-scan-line { animation: scanLine 3s ease-in-out infinite; }
        
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(8px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        .animate-float-1 { animation: floatUp 6s ease-in-out infinite; }
        .animate-float-2 { animation: floatUp 6s ease-in-out infinite 2s; }
        .animate-float-3 { animation: floatUp 6s ease-in-out infinite 4s; }

        @keyframes drawLine {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-draw-line { animation: drawLine 1.5s ease-out forwards; }

        @keyframes sequenceFade {
          0%, 100% { opacity: 0.3; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1); }
        }
        .seq-1 { animation: sequenceFade 5s infinite 0s; }
        .seq-2 { animation: sequenceFade 5s infinite 1s; }
        .seq-3 { animation: sequenceFade 5s infinite 2s; }
        .seq-4 { animation: sequenceFade 5s infinite 3s; }
        .seq-5 { animation: sequenceFade 5s infinite 4s; }

        @keyframes pulseSoft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-soft { animation: pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* --- 1. GLOBAL BACKGROUND ELEMENTS --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0"></div>
      
      {/* Deep, refined background glows */}
      <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan-500/10 via-teal-500/5 to-emerald-500/10 dark:from-cyan-600/10 dark:via-teal-600/5 dark:to-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* --- 2. HERO SECTION --- */}
      <section className="relative flex flex-col items-center justify-center pt-28 pb-10 px-4 z-10 w-full max-w-7xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-full text-xs font-bold mb-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 backdrop-blur-md uppercase tracking-widest cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          Neuralite Core • AI-Assisted Healthcare
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.05]">
          Meet Your New <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-600 dark:from-cyan-400 dark:via-teal-400 dark:to-emerald-400">
            Digital Doctor.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed font-medium">
          Understand your health records, prescriptions, reports, and next steps with AI-assisted insights — while keeping professional care at the center.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6 w-full sm:w-auto px-4">
          <Link className="relative flex items-center justify-center gap-2 px-8 py-3.5 text-sm md:text-base font-bold text-white transition-all duration-300 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 rounded-full shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 group w-full sm:w-auto" to="/register">
            Start Your Health Journey
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <a href="#capabilities" className="px-8 py-3.5 text-sm md:text-base font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900 rounded-full ring-1 ring-slate-200 dark:ring-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 backdrop-blur-md transition-all w-full sm:w-auto">
            Explore Neuralite
          </a>
        </div>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
          AI-assisted • Privacy-first • Human-centered
        </p>
      </section>

      {/* --- 3. HERO PRODUCT PREVIEW --- */}
      <section className="relative z-20 px-4 w-full max-w-5xl mx-auto mb-16 perspective-1000">
        {/* Outer App Frame */}
        <div className="relative bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl md:rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transform-gpu transition-transform duration-700 hover:rotate-x-[1deg] hover:-translate-y-1">
          
          {/* Subtle Floating Notifications */}
          <div className="absolute -left-4 top-10 z-30 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 flex items-center gap-2 animate-float-1 hidden md:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Prescription Scanned</span>
          </div>
          <div className="absolute -right-6 top-32 z-30 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 flex items-center gap-2 animate-float-2 hidden md:flex">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Analysis Complete</span>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden flex flex-col shadow-inner ring-1 ring-slate-100 dark:ring-slate-800/50">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">N</div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {userName ? `Welcome back, ${userName}` : 'Welcome to Neuralite'}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    Dashboard Overview <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft inline-block"></span>
                  </p>
                </div>
              </div>
              <div className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded ring-1 ring-amber-200 dark:ring-amber-800/50 uppercase tracking-wider hidden sm:block">
                Illustrative Demo
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-transparent">
              
              {/* Health Overview */}
              <div className="col-span-1 bg-white dark:bg-slate-900 rounded-xl p-4 ring-1 ring-slate-200 dark:ring-slate-800 relative transition-transform hover:-translate-y-0.5 shadow-sm">
                <div className="absolute top-3 right-3 text-[9px] text-slate-400 dark:text-slate-500 font-medium border border-slate-200 dark:border-slate-700 px-1.5 rounded">Sample Data</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-2 uppercase tracking-wide">Health Score</p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">87</span>
                  <span className="text-xs font-bold text-emerald-500">Good</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '87%' }}></div>
                </div>
              </div>

              {/* AI Insight Processing Flow */}
              <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-900/10 dark:to-slate-900 rounded-xl p-4 ring-1 ring-cyan-100 dark:ring-slate-800 flex flex-col justify-center relative overflow-hidden transition-transform hover:-translate-y-0.5 shadow-sm">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(6,182,212,0.03)_50%,transparent_100%)] dark:bg-[linear-gradient(90deg,transparent_0%,rgba(6,182,212,0.05)_50%,transparent_100%)] w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold mb-3 uppercase tracking-wide flex items-center gap-1.5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse-soft"></span> Active Analysis Flow
                </p>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 relative z-10">
                  <div className="flex flex-col items-center gap-1 text-cyan-600 dark:text-cyan-400"><div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center ring-1 ring-cyan-200 dark:ring-cyan-800">1</div> Upload</div>
                  <div className="flex-1 h-px bg-cyan-200 dark:bg-cyan-800 mx-2 relative"><div className="absolute top-0 left-0 h-full bg-cyan-500 w-full animate-draw-line"></div></div>
                  <div className="flex flex-col items-center gap-1 text-cyan-600 dark:text-cyan-400"><div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center ring-1 ring-cyan-200 dark:ring-cyan-800">2</div> Analyze</div>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                  <div className="flex flex-col items-center gap-1"><div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 text-slate-400">3</div> Insight</div>
                </div>
              </div>

              {/* Documents */}
              <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-4 ring-1 ring-slate-200 dark:ring-slate-800 transition-transform hover:-translate-y-0.5 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase tracking-wide">Recent Documents</p>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg ring-1 ring-slate-100 dark:ring-slate-700/50">
                  <div className="w-8 h-8 rounded bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">📄</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">CBC_Report_Sample.pdf</p>
                    <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500"></span> AI Analysis Complete</p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-2 border border-slate-200 dark:border-slate-700 rounded">Sample</span>
                </div>
              </div>

              {/* Upcoming Appointment */}
              <div className="col-span-1 bg-white dark:bg-slate-900 rounded-xl p-4 ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col justify-center transition-transform hover:-translate-y-0.5 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-2 uppercase tracking-wide">Next Appt</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-100 dark:ring-blue-800/50 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <span className="text-[10px] font-bold">OCT</span>
                    <span className="text-sm font-black leading-none">24</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Specialist</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">General Physician</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- 4. TRUST / VALUE STRIP --- */}
      <section className="px-4 w-full max-w-6xl mx-auto mb-16 border-b border-slate-200 dark:border-slate-800 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">AI-Assisted</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personalized health insights</p>
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Privacy-First</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your health data stays yours</p>
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Human-Centered</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Works alongside professionals</p>
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Secure by Design</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Protected health information</p>
          </div>
        </div>
      </section>

      {/* --- 5. WHAT CAN YOU DO WITH NEURALITE? --- */}
      <section className="relative z-20 px-4 w-full max-w-7xl mx-auto mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">What can you do with Neuralite?</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Upload Medical Report", desc: "Turn complex medical reports into easier-to-understand AI-assisted insights.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { title: "Scan Prescription", desc: "Digitize handwritten prescriptions and understand medication instructions more clearly.", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" },
            { title: "AI Health Assistant", desc: "Ask health-related questions and receive informational AI assistance.", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
            { title: "Find a Doctor", desc: "Discover healthcare professionals based on your needs.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
            { title: "Book Appointment", desc: "Find available doctors and manage your appointments.", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { title: "Health Vault", desc: "Keep your health documents organized and protected in one place.", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }
          ].map((item, i) => (
            <div key={i} className="group bg-white dark:bg-slate-900 p-6 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:ring-cyan-500/50 dark:hover:ring-cyan-500/50 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/40 ring-1 ring-slate-100 dark:ring-slate-700 transition-colors">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">{item.desc}</p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs font-bold text-cyan-600 dark:text-cyan-400 gap-1">
                Learn more <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- 6. SYSTEM CAPABILITIES (Premium Bento Grid) --- */}
      <section id="capabilities" className="relative z-20 px-4 w-full max-w-7xl mx-auto mb-20 pt-6 border-t border-slate-200 dark:border-slate-800/80">
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-2">Core Modules</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">System Capabilities</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm md:text-right">
            Every module is designed to integrate AI seamlessly into your healthcare journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-5 auto-rows-[280px]">
          
          {/* Card 1: Neural OCR */}
          <div className="group lg:col-span-3 md:col-span-2 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative overflow-hidden hover:ring-cyan-500/50 hover:-translate-y-1">
            <div className="relative z-10 w-full md:w-3/5 flex-1">
              <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center mb-4 ring-1 ring-cyan-200 dark:ring-cyan-800 transition-transform group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Neural OCR Scanner</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Turn handwritten prescriptions into readable digital information with AI-assisted OCR.</p>
            </div>
            {/* Visual Animation Box */}
            <div className="hidden md:flex absolute right-[-5%] bottom-[-10%] w-[55%] h-[80%] bg-slate-50 dark:bg-slate-950 rounded-tl-2xl border-t border-l border-slate-200 dark:border-slate-800 shadow-xl p-4 flex-col gap-2 overflow-hidden transition-transform duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1">
              <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mb-1">Prescription_scan.jpg</div>
              <div className="relative w-full flex-1 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 p-2 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400/80 shadow-[0_0_8px_#22d3ee] animate-scan-line z-10"></div>
                <div className="space-y-1.5 mt-1 font-mono text-[9px] text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-2"><span className="text-cyan-500 font-black">→</span> Scan doc</div>
                  <div className="flex items-center gap-2"><span className="text-cyan-500 font-black">→</span> Detect text</div>
                  <div className="flex items-center gap-2"><span className="text-cyan-500 font-black">→</span> Analyze</div>
                  <div className="flex items-center gap-2"><span className="text-emerald-500 font-black">✓</span> Complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Smart Triage */}
          <div className="group lg:col-span-3 md:col-span-2 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:ring-emerald-500/50 hover:-translate-y-1 overflow-hidden relative">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 ring-1 ring-emerald-200 dark:ring-emerald-800 transition-transform group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Smart Triage Matrix</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 max-w-sm">Organize health concerns and help guide users toward appropriate next steps.</p>
              
              {/* Product Visual */}
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 space-y-1.5 w-full max-w-xs transition-colors">
                 <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></div> Concern recorded</div>
                 <div className="w-0.5 h-1.5 bg-slate-200 dark:bg-slate-700 ml-0.5"></div>
                 <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div> AI Assessment</div>
                 <div className="w-0.5 h-1.5 bg-slate-200 dark:bg-slate-700 ml-0.5"></div>
                 <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Doctor Match</div>
              </div>
            </div>
          </div>

          {/* Card 3: Encrypted Vault */}
          <div className="group lg:col-span-2 md:col-span-2 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:ring-blue-500/50 hover:-translate-y-1">
            <div>
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 ring-1 ring-blue-200 dark:ring-blue-800 transition-transform group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Encrypted Vault</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Keep important health documents organized and protected.</p>
            </div>
          </div>

          {/* Card 4: Prescription Intelligence */}
          <div className="group lg:col-span-2 md:col-span-2 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:ring-purple-500/50 hover:-translate-y-1">
            <div>
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 ring-1 ring-purple-200 dark:ring-purple-800 transition-transform group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Prescription Intelligence</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Understand medicines, dosage instructions, and prescription details more clearly.</p>
              
              {/* Product Visual */}
              <div className="mt-3 flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                 <div className="flex flex-col gap-1 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                   <div className="flex items-center gap-2"><span className="text-slate-400 dark:text-slate-500">Rx:</span> Prescription</div>
                   <div className="flex items-center gap-2"><span className="text-slate-400 dark:text-slate-500">M:</span> Medicine</div>
                   <div className="flex items-center gap-2"><span className="text-slate-400 dark:text-slate-500">D:</span> Dosage</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Card 5: Medical Report Analyzer */}
          <div className="group lg:col-span-2 md:col-span-2 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:ring-amber-500/50 hover:-translate-y-1">
            <div>
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4 ring-1 ring-amber-200 dark:ring-amber-800 transition-transform group-hover:scale-110">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Report Analyzer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Turn complex lab reports into easier-to-understand health insights.</p>
            </div>
          </div>

        </div>
      </section>

      {/* --- 7. HOW NEURALITE WORKS (Process Flow) --- */}
      <section className="relative z-10 px-4 pt-10 pb-12 w-full max-w-7xl mx-auto mb-12 group/process">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">How It Works</h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative">
          {/* Subtle Connecting line (Desktop) */}
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[2px] bg-slate-200 dark:bg-slate-800 z-0 overflow-hidden">
             <div className="h-full bg-cyan-400 w-0 group-hover/process:animate-draw-line"></div>
          </div>
          {/* Vertical line (Mobile) */}
          <div className="md:hidden absolute top-[10%] bottom-[10%] left-10 w-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
          
          {[
            { num: '01', title: 'Tell Us', desc: 'Upload symptoms, prescriptions, or medical reports.', icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
            { num: '02', title: 'AI Understands', desc: 'Neuralite securely processes the information.', icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { num: '03', title: 'Get Insights', desc: 'Receive AI-assisted information in a simple format.', icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            { num: '04', title: 'Take Action', desc: 'Connect with a healthcare professional or manage next steps.', icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
          ].map((step, i) => (
            <div key={i} className="relative z-10 flex md:flex-col items-center md:text-center gap-4 md:gap-0 w-full md:w-1/4 group pl-4 md:pl-0">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 ring-2 ring-slate-200 dark:ring-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 md:mb-4 transition-all duration-500 group-hover:scale-110 group-hover:ring-cyan-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:shadow-md shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} /></svg>
              </div>
              <div className="flex-1 md:w-full">
                <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1 md:mb-2 flex items-center md:justify-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">{step.num}</span> {step.title}
                </h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed md:px-2">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- 8. REAL AI WORKFLOW VISUAL --- */}
      <section className="relative z-10 px-4 pb-16 w-full max-w-5xl mx-auto mb-12 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg seq-1 ring-1 ring-transparent dark:ring-slate-700">SYMPTOMS / REPORT</div>
          <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          <div className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-4 py-2 rounded-lg ring-1 ring-cyan-200 dark:ring-cyan-800 seq-2">NEURALITE AI</div>
          <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg seq-3 ring-1 ring-transparent dark:ring-slate-700">AI-ASSISTED INSIGHTS</div>
          <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg seq-4 ring-1 ring-transparent dark:ring-slate-700">RECOMMENDED CARE</div>
          <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-lg ring-1 ring-emerald-200 dark:ring-emerald-800 seq-5">HEALTHCARE PROFESSIONAL</div>
        </div>
      </section>

      {/* --- 9. AI + HUMAN CARE & DOCTOR PREVIEW --- */}
      <section className="relative z-20 px-4 pb-12 w-full max-w-7xl mx-auto mb-16">
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-2">AI ASSISTS. DOCTORS CARE.</h2>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">AI helps you understand.<br/>Doctors help you decide.</h3>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-8 max-w-5xl mx-auto">
          
          {/* Neuralite AI Column */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <h4 className="text-xl font-black text-cyan-600 dark:text-cyan-400 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center ring-1 ring-cyan-200 dark:ring-cyan-800">N</div>
              NEURALITE AI
            </h4>
            <ul className="space-y-4 flex-1">
               {[
                 'Understand symptoms',
                 'Analyze reports',
                 'Explain prescriptions',
                 'Provide informational insights',
                 'Suggest possible next steps'
               ].map((text, i) => (
                 <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                   <svg className="w-5 h-5 text-cyan-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   {text}
                 </li>
               ))}
            </ul>
          </div>

          {/* Healthcare Professionals Column */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center ring-1 ring-emerald-200 dark:ring-emerald-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              HEALTHCARE PROFESSIONALS
            </h4>
            <ul className="space-y-4 flex-1">
               {[
                 'Diagnose',
                 'Prescribe',
                 'Treat',
                 'Provide clinical care'
               ].map((text, i) => (
                 <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                   <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   {text}
                 </li>
               ))}
            </ul>
            
            {/* Doctor Discovery Preview Mockup */}
            <div className="mt-8 bg-slate-50 dark:bg-slate-950 rounded-xl p-4 ring-1 ring-slate-200 dark:ring-slate-800 relative">
              <div className="absolute -top-2.5 right-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded ring-1 ring-emerald-200 dark:ring-emerald-800 uppercase">Illustrative Demo</div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Recommended Care Path</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-slate-900 dark:text-white text-sm truncate">Recommended Specialist</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Cardiology • Specialist Available</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- 10. SECURITY / HEALTH DATA SECTION --- */}
      <section className="relative z-20 px-4 py-16 w-full border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-100/50 dark:bg-[#050b14] mb-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Your Health Data. Your Control.</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-10 max-w-2xl mx-auto leading-relaxed text-sm">
            Healthcare requires trust. Neuralite is designed around privacy, secure access, and user control.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { title: "Encrypted Records", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
               { title: "Secure Authentication", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
               { title: "Private Health Vault", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
               { title: "Controlled Access", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" }
             ].map((item, i) => (
               <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                 <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 ring-1 ring-slate-100 dark:ring-slate-700">
                   <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                     <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                   </svg>
                 </div>
                 <h5 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h5>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- 11. RESPONSIBLE AI --- */}
      <section className="relative z-20 px-4 w-full max-w-5xl mx-auto mb-16">
        <h3 className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Designed for Responsible Healthcare AI</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">AI-Assisted</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI provides informational support and insights.</p>
          </div>
          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Privacy-First</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">Users maintain control over their health information.</p>
          </div>
          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Human-Centered</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI assistance works alongside professional healthcare providers.</p>
          </div>
        </div>
      </section>

      {/* --- 12. FINAL CTA --- */}
      <section className="relative z-20 px-4 py-12 w-full text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-b from-white/0 to-slate-100/50 dark:from-transparent dark:to-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-100 dark:border-slate-800">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Your smarter healthcare <br className="hidden md:block"/> journey starts here.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 max-w-lg mx-auto">
            Explore AI-assisted healthcare tools designed to make your next step clearer.
          </p>
          <Link className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-bold text-white transition-all duration-300 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 ring-1 ring-slate-800 dark:ring-cyan-500" to="/register">
            Create Free Account &rarr;
          </Link>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-6">
            AI-assisted. Human-centered. Privacy-first.
          </p>
        </div>
      </section>

      {/* --- 13. PROFESSIONAL FOOTER --- */}
      <footer className="relative z-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#030712] pt-16 pb-8 px-4 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-sm">N</span>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Neuralite</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs">
              AI-assisted healthcare for a smarter tomorrow.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">AI Health Assistant</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Report Analyzer</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Prescription Scanner</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Doctor Appointments</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Health Vault</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Terms</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Health Guide</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Help Center</a></li>
            </ul>
          </div>
          
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 text-center md:text-left text-sm text-slate-400 dark:text-slate-500">
          © 2026 Neuralite. All rights reserved.
        </div>
      </footer>

    </div>
  );
}