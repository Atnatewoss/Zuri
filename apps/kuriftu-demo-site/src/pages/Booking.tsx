import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/booking/BookingForm";
import BookingBranding from "@/components/booking/BookingBranding";
import BookingResults from "@/components/booking/BookingResults";
import hero2 from "@/assets/hero-2.jpg";

const Booking = () => {
  const [city, setCity] = useState("");
  const [property, setProperty] = useState("");
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);

  // When a date is selected, transition to results
  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const handleChangeSearch = () => {
    setShowResults(false);
    setSelectedDate(null);
  };

  if (showResults && selectedDate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        {/* Cancel/change link */}
        <div className="flex justify-end px-6 pt-20 pb-2">
          <button
            onClick={handleChangeSearch}
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 underline"
          >
            Cancel/change booking
            <ChevronRight size={14} className="rotate-90" />
          </button>
        </div>
        <BookingResults
          selectedDate={selectedDate}
          rooms={rooms}
          onChangeSearch={handleChangeSearch}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Navbar />

      {/* Blurred background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero2})`, filter: "blur(12px) brightness(0.7)", transform: "scale(1.05)" }}
      />

      {/* Cancel/change link */}
      <div className="relative z-10 flex justify-end px-6 pt-20 pb-2">
        <button className="font-body text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center gap-1 underline">
          Cancel/change booking
          <ChevronRight size={14} className="rotate-90" />
        </button>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex justify-center px-4 pb-12">
        <div className="flex flex-col lg:flex-row w-full max-w-[1100px] shadow-2xl overflow-hidden">
          {/* LEFT: Form */}
          <div className="w-full lg:w-[480px] flex-shrink-0 bg-card/95 backdrop-blur-sm overflow-y-auto">
            <BookingForm
              city={city} setCity={setCity}
              property={property} setProperty={setProperty}
              rooms={rooms} setRooms={setRooms}
              selectedDate={selectedDate} setSelectedDate={handleDateSelect}
            />
            <div className="px-8 pb-6">
              <Link to="/" className="block text-center font-body text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider">
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* RIGHT: Branding - pushed to top, doesn't match left height */}
          <div className="flex-1 bg-card/80 backdrop-blur-sm border-l border-border/30">
            <BookingBranding />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
