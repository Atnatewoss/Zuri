import { Minus, Plus, MapPin, Building2, Tag, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

const properties = [
  "Kuriftu Resort & Spa Bishoftu",
  "Kuriftu Resort & Spa Lake Tana",
  "Kuriftu Entoto Adventure Park",
  "Kuriftu African Village",
  "Kuriftu Resort & Spa Awash",
];
const cities = ["Bishoftu", "Addis Ababa", "Bahir Dar", "Awash"];

const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const days: { day: number; current: boolean; date: Date }[] = [];
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: prevDays - i, current: false, date: new Date(year, month - 1, prevDays - i) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, current: true, date: new Date(year, month, i) });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
  }
  return days;
};

interface Room {
  adults: number;
  children: number;
}

interface BookingFormProps {
  city: string;
  setCity: (v: string) => void;
  property: string;
  setProperty: (v: string) => void;
  rooms: Room[];
  setRooms: (r: Room[]) => void;
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
}

const BookingForm = ({
  city, setCity, property, setProperty,
  rooms, setRooms, selectedDate, setSelectedDate,
}: BookingFormProps) => {
  const today = new Date();
  const [calMonth, setCalMonth] = [today.getMonth(), null] as any;
  // We need local state for calendar navigation
  return <BookingFormInner
    city={city} setCity={setCity}
    property={property} setProperty={setProperty}
    rooms={rooms} setRooms={setRooms}
    selectedDate={selectedDate} setSelectedDate={setSelectedDate}
  />;
};

// Actual inner component with local calendar state
import { useState } from "react";

const BookingFormInner = ({
  city, setCity, property, setProperty,
  rooms, setRooms, selectedDate, setSelectedDate,
}: BookingFormProps) => {
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState("");

  const calDays = getCalendarDays(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const isPast = (d: Date) => {
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };
  const isSelected = (d: Date) =>
    selectedDate && d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
  const isAvailable = (d: Date) => !isPast(d);

  const updateRoom = (idx: number, field: "adults" | "children", delta: number) => {
    setRooms(rooms.map((r, i) => {
      if (i !== idx) return r;
      const min = field === "adults" ? 1 : 0;
      return { ...r, [field]: Math.max(min, r[field] + delta) };
    }));
  };

  const addRoom = () => setRooms([...rooms, { adults: 2, children: 0 }]);

  return (
    <div className="p-8 md:p-10">
      {/* City */}
      <div className="mb-5">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-transparent border-b border-border pl-10 pr-4 py-3 font-body text-sm focus:outline-none focus:border-accent appearance-none cursor-pointer"
          >
            <option value="">City</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Property */}
      <div className="mb-10">
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={property}
            onChange={(e) => setProperty(e.target.value)}
            className="w-full bg-transparent border-b border-border pl-10 pr-4 py-3 font-body text-sm focus:outline-none focus:border-accent appearance-none cursor-pointer"
          >
            <option value="">Property</option>
            {properties.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Guests */}
      <h3 className="font-body text-sm font-bold text-center mb-4 tracking-wide">Select number of guests</h3>

      {/* Header row */}
      <div className="flex items-center gap-6 mb-2">
        <span className="font-body text-xs w-16" />
        <div className="flex-1 text-center font-body text-xs text-muted-foreground">adults</div>
        <div className="flex-1 text-center font-body text-xs text-muted-foreground">children</div>
      </div>

      {rooms.map((room, idx) => (
        <div key={idx} className="mb-3">
          <div className="flex items-center gap-6">
            <span className="font-body text-sm font-bold w-16">Room {idx + 1}</span>
            <div className="flex items-center gap-0 flex-1 justify-center">
              <button onClick={() => updateRoom(idx, "adults", -1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Minus size={12} />
              </button>
              <span className="font-body text-sm w-8 text-center">{room.adults}</span>
              <button onClick={() => updateRoom(idx, "adults", 1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Plus size={12} />
              </button>
            </div>
            <div className="flex items-center gap-0 flex-1 justify-center">
              <button onClick={() => updateRoom(idx, "children", -1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Minus size={12} />
              </button>
              <span className="font-body text-sm w-8 text-center">{room.children}</span>
              <button onClick={() => updateRoom(idx, "children", 1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <button onClick={addRoom} className="flex items-center gap-2 mx-auto text-accent font-body text-sm hover:text-accent/80 transition-colors mt-2 mb-8">
        <Plus size={14} /> Add another room
      </button>

      {/* Calendar */}
      <h3 className="font-body text-sm font-bold text-center mb-4 tracking-wide">Select arrival date</h3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1 hover:bg-muted rounded transition-colors"><ChevronLeft size={18} /></button>
          <span className="font-body text-sm font-bold tracking-wider">{MONTHS[calMonth]} {calYear}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-muted rounded transition-colors"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 gap-0">
          {DAYS.map((d) => (
            <div key={d} className="text-center font-body text-xs text-muted-foreground py-1.5 font-bold">{d}</div>
          ))}
          {calDays.map((d, i) => {
            const available = d.current && isAvailable(d.date);
            const selected = d.current && isSelected(d.date);
            return (
              <button
                key={i}
                disabled={!available}
                onClick={() => d.current && available && setSelectedDate(d.date)}
                className={`aspect-square flex items-center justify-center font-body text-sm transition-colors
                  ${!d.current ? "text-muted-foreground/30" : ""}
                  ${d.current && isPast(d.date) ? "text-muted-foreground/40 cursor-not-allowed" : ""}
                  ${d.current && available && !selected ? "hover:bg-accent/20 cursor-pointer" : ""}
                  ${selected ? "bg-accent text-accent-foreground font-bold" : ""}
                  ${d.current && available && !selected ? "bg-accent/10" : ""}
                `}
              >
                {d.day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount Code */}
      <div className="border-t border-border pt-5">
        <button onClick={() => setShowDiscount(!showDiscount)} className="flex items-center gap-2 font-body text-sm text-foreground hover:text-accent transition-colors">
          <Tag size={16} />
          <span className="underline">Enter discount code</span>
        </button>
        {showDiscount && (
          <div className="mt-3 flex gap-2">
            <input
              type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Code"
              className="flex-1 bg-background border border-input px-4 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="bg-primary text-primary-foreground px-4 py-2 font-body text-xs font-bold tracking-wider">Apply</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
