import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const BookingBranding = () => {
  return (
    <div className="flex flex-col items-center py-8 px-6">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="font-display text-2xl font-bold text-accent">K</span>
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide leading-none">KURIFTU</h1>
          <p className="font-body text-base tracking-[0.3em] text-muted-foreground">RESORTS</p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-6">
        <div className="aspect-[3/4] overflow-hidden rounded-sm">
          <img src={hero1} alt="Kuriftu Resort" className="w-full h-full object-cover" />
        </div>
        <div className="aspect-[3/4] overflow-hidden rounded-sm">
          <img src={hero2} alt="Kuriftu Resort" className="w-full h-full object-cover" />
        </div>
        <div className="aspect-[3/4] overflow-hidden rounded-sm">
          <img src={hero3} alt="Kuriftu Resort" className="w-full h-full object-cover" />
        </div>
      </div>

      <p className="font-body text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground">
        Welcome to Kuriftu Resorts
      </p>
    </div>
  );
};

export default BookingBranding;
