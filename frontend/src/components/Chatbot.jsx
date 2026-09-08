import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; 

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am Neuralite AI, your Smart Health Assistant. How can I help you with your health today?' }
  ]);
  const [input, setInput] = useState('');
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false); // To hide suggestions
  
  // VOICE STATES
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isChatLoading]);

  // Voice setup
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
    return () => { if (speechSynthRef.current) speechSynthRef.current.cancel(); };
  }, []);

  // --- MANUAL VOICE OUTPUT (TEXT TO SPEECH) ---
  const speakText = (text) => {
    if (!speechSynthRef.current) return;
    speechSynthRef.current.cancel();
    
    let cleanText = text.replace(/[*#_]/g, '').replace(/\n/g, ', ');
    cleanText = cleanText.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const hasHindiChars = /[\u0900-\u097F]/.test(cleanText); 
    utterance.lang = hasHindiChars ? 'hi-IN' : 'en-IN'; 

    const voices = speechSynthRef.current.getVoices();
    let bestVoice = hasHindiChars 
      ? voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) || voices.find(v => v.lang === 'hi-IN')
      : voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-IN');
    
    if (bestVoice) utterance.voice = bestVoice;
    utterance.rate = 0.95; 
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      // Optional: Aap ek chhota sa toast/alert add kar sakte hain
  };

  // --- VOICE INPUT (MIC) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; 
    recognition.interimResults = false; 
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      setInput(prev => prev + (prev ? " " : "") + event.results[0][0].transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    setHasStartedChat(true);

    const currentInput = input.trim(); 
    const currentImage = selectedImage;
    
    const userMessage = { sender: 'user', text: currentInput, image: imagePreview };
    setMessages((prev) => [...prev, userMessage]);
    
    setInput('');
    removeImage();
    setIsChatLoading(true);
    stopSpeaking(); 

    if (currentImage) {
      setMessages((prev) => [...prev, { sender: 'bot', text: "Analyzing your document... please wait ⏳" }]);
      const formData = new FormData();
      formData.append('file', currentImage);

      try {
        const response = await fetch('http://localhost:8000/api/analyze-prescription', {
          method: 'POST', body: formData,
        });
        const data = await response.json();
        
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages.pop(); 
          newMessages.push({ sender: 'bot', text: data.message || data.error }); 
          return newMessages;
        });

      } catch (error) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages.pop();
          newMessages.push({ sender: 'bot', text: "Server connection failed. ML API is offline." });
          return newMessages;
        });
      } finally {
        setIsChatLoading(false);
      }
    } 
    else if (currentInput) {
      try {
        const response = await fetch('http://localhost:8000/api/chat-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: currentInput }),
        });
        const data = await response.json();

        setMessages((prev) => [...prev, { sender: 'bot', text: data.message || data.error }]);

      } catch (error) {
        setMessages((prev) => [...prev, { sender: 'bot', text: "Server error! Cannot connect to Neuralite AI." }]);
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setInput(suggestionText);
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FLOATING CHAT BUTTON */}
      {/* ======================================================== */}
      <div className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[999] transition-all duration-300 ease-out ${isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
          <button className="relative bg-[#0e7490] w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_8px_20px_rgba(14,116,144,0.3)] hover:shadow-[0_12px_30px_rgba(14,116,144,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center border border-white/10">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CHATBOT WINDOW (PROFESSIONAL MEDICAL AI) */}
      {/* ======================================================== */}
      <div 
        className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[1000] w-[calc(100vw-2rem)] sm:w-[400px] md:w-[440px] h-[85vh] sm:h-[650px] bg-[#f8fafc] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col overflow-hidden transform transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        
        {/* --- HEADER --- */}
        <div className="bg-[#0f172a] px-5 py-4 flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden">
          {/* Subtle accent gradient */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9]"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-700">
                <span className="text-[#0e7490] font-black text-sm">N</span>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0f172a] rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Neuralite AI</h3>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">Smart Health Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            {isSpeaking && (
              <button onClick={stopSpeaking} className="text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 px-2 py-1 transition-colors">
                Stop
              </button>
            )}
            <button onClick={() => { setIsOpen(false); stopSpeaking(); }} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* --- MESSAGES AREA --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scroll-smooth bg-white">
          
          {/* Quick Suggestions (Empty State) */}
          {!hasStartedChat && messages.length === 1 && (
            <div className="mb-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 ml-1">How can I help you today?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "🩺 Check my symptoms", 
                  "🥗 Nutrition & Diet", 
                  "💊 Medicine Info", 
                  "📄 Analyze Prescription",
                  "⚖️ Weight Management"
                ].map((text, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSuggestionClick(text.split(' ').slice(1).join(' '))} 
                    className="text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actual Messages */}
          {messages.map((msg, index) => {
            const isBot = msg.sender === 'bot';
            const isEmergency = isBot && msg.text && msg.text.toLowerCase().includes('emergency');

            return (
              <div key={index} className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'}`}>
                {isBot && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center mr-2 mt-1">
                    <span className="text-[11px] font-black text-[#0e7490]">N</span>
                  </div>
                )}
                
                <div className={`relative max-w-[85%] text-[14px] leading-relaxed font-medium ${
                    isBot 
                      ? 'text-slate-700' 
                      : 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white py-2.5 px-4 rounded-2xl rounded-br-sm shadow-sm'
                  }`}
                >
                  {/* Emergency Warning */}
                  {isEmergency && (
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase tracking-widest mb-2 p-2 bg-rose-50 border border-rose-200 rounded-md">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Medical Alert
                    </div>
                  )}

                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="w-full h-auto max-h-48 object-cover rounded-xl mb-2 border border-slate-200" />
                  )}
                  
                  {msg.text && (
                    <div className={`prose prose-sm max-w-none prose-p:leading-[1.6] prose-p:my-2 prose-ul:my-2 prose-li:my-0 ${!isBot && 'text-white'}`}>
                      <ReactMarkdown>{msg.text.replace(/\n{3,}/g, '\n\n')}</ReactMarkdown>
                    </div>
                  )}

                  {/* AI Action Area */}
                  {isBot && !msg.text.includes("⏳") && (
                    <div className="mt-2 pt-2 flex items-center gap-3 border-t border-transparent">
                      <button 
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.text)}
                        className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${isSpeaking ? 'text-rose-500 hover:text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {isSpeaking ? (
                          <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> Stop</>
                        ) : (
                          <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg> Listen</>
                        )}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(msg.text)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {isChatLoading && (
            <div className="flex w-full justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center mr-2"><span className="text-[11px] font-black text-[#0e7490]">N</span></div>
              <div className="text-sm font-medium text-slate-500 flex items-center gap-1">
                Neuralite AI is thinking
                <span className="flex gap-0.5 ml-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* --- INPUT COMPOSER --- */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          
          {/* Image Attachment Preview */}
          {imagePreview && (
            <div className="mb-3 flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200 w-max pr-4">
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-slate-200" />
                <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-slate-900 shadow-sm">✕</button>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Attachment added</p>
                <p className="text-[10px] text-slate-500">Ready to send</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSend} className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-full pr-1.5 pl-2 py-1.5 focus-within:ring-1 focus-within:ring-[#06b6d4] focus-within:border-[#06b6d4] transition-all shadow-sm">
            
            <button type="button" onClick={startListening} className={`p-2 rounded-full flex items-center justify-center transition-colors shrink-0 ${isListening ? 'text-rose-500 bg-rose-50 animate-pulse' : 'text-slate-400 hover:text-[#06b6d4] hover:bg-slate-200'}`} title="Voice Input">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>

            <label className="cursor-pointer p-2 text-slate-400 hover:text-[#06b6d4] transition-colors hover:bg-slate-200 rounded-full shrink-0">
              <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </label>

            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Message Neuralite..."} 
              className="flex-grow px-2 py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none w-full"
            />
            
            <button 
              type="submit"
              className="bg-[#0e7490] text-white w-9 h-9 rounded-full hover:bg-[#0891b2] transition-colors flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 shrink-0"
              disabled={isChatLoading || (!input.trim() && !selectedImage)}
            >
              <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>

          <div className="text-center mt-3">
            <p className="text-[10px] text-slate-400 font-medium">Neuralite AI provides informational guidance only.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatbot;