import { ArrowLeft, PlayCircle, Info } from "lucide-react";

export const ZuriEvaluationBanner = () => {
  // Try to figure out where they came from to go back
  const dashboardUrl = "https://zuriai.et/dashboard"; // Your deployed panel fallback
  
  // This helps us be smart about returning them if they are testing locally vs prod
  const handleReturnToDashboard = () => {
    // If they came from local, go back to local.
    if (document.referrer && document.referrer.includes("localhost")) {
      window.location.href = "http://localhost:5173/dashboard";
    } else {
      window.location.href = dashboardUrl;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-12 bg-zinc-950 text-white flex items-center justify-between px-6 border-b border-amber-500/30 shadow-lg font-sans">
      <div className="flex items-center gap-4">
         <span className="flex items-center gap-2 text-xs font-mono font-medium tracking-widest text-amber-500 uppercase px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
           <PlayCircle className="w-3 h-3" /> Zuri Demo Mode
         </span>
         <span className="text-sm font-medium text-zinc-300 hidden md:inline-flex items-center gap-2 border-l border-white/10 pl-4">
           <Info className="w-4 h-4 text-emerald-400" />
           The AI Concierge widget is deployed in the bottom right.
         </span>
      </div>
      
      <button 
        onClick={handleReturnToDashboard}
        className="flex items-center gap-2 text-sm font-medium text-white hover:text-amber-400 transition-colors bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full border border-white/10 hover:border-amber-400/50"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </button>
    </div>
  );
};
