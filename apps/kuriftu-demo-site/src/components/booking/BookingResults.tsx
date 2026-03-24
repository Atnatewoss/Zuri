import { useState } from "react";
import { Calendar, Users, BedDouble, ChevronDown, MapPin, Star, User } from "lucide-react";
import resortBishoftu from "@/assets/resort-bishoftu.jpg";
import resortEntoto from "@/assets/resort-entoto.jpg";
import resortAfrican from "@/assets/resort-african-village.jpg";
import resortTana from "@/assets/resort-tana.jpg";

interface Room {
  adults: number;
  children: number;
}

interface BookingResultsProps {
  selectedDate: Date;
  rooms: Room[];
  onChangeSearch: () => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const resorts = [
  {
    name: "Kuriftu Entoto Adventure Park",
    location: "Entoto Natural Park, Gulele, Addis Ababa - Ethiopia",
    image: resortEntoto,
    stars: 5,
    description: "Kuriftu Entoto Adventure Park sits high on the ridges of Mount Entoto inside Entoto Natural Park — a eucalyptus-wooded highland park. The property combines glamping/tented village and low-rise cabins with an on-site adventure park.",
    rooms: [
      { name: "TENTED CAMPS KING", rate: "Website Non Refundable Bed and Breakfast Rate", price: 76.95, guests: 2 },
      { name: "TENTED CAMPS TWIN", rate: "Website Non Refundable Bed and Breakfast Rate", price: 76.95, guests: 2 },
      { name: "TENTED CAMPS KING", rate: "Website BAR Bed and Breakfast Rate", price: 85.50, guests: 2 },
    ],
    otherRooms: 3,
  },
  {
    name: "Kuriftu Resort & Spa Bishoftu",
    location: "Lake Kuriftu, Bishoftu/Debre Zeyit, Oromia, Ethiopia",
    image: resortBishoftu,
    stars: 5,
    description: "Kuriftu Resort & Spa Bishoftu is located on the shores of Lake Kuriftu in Bishoftu/Debre Zeyit, a peaceful lakeside town 45-60 minutes from Addis Ababa. The area is known for its crater lakes, mild climate, outdoor activities and growing tourism facilities.",
    rooms: [
      { name: "DELUXE STANDARDS KING", rate: "Website Non Refundable Bed and Breakfast Rate", price: 134.67, guests: 2 },
      { name: "DELUXE STANDARDS TWIN", rate: "Website Non Refundable Bed and Breakfast Rate", price: 142.36, guests: 2 },
      { name: "DELUXE SUITE KING", rate: "Website Non Refundable Bed and Breakfast Rate", price: 145.44, guests: 2 },
    ],
    otherRooms: 21,
  },
  {
    name: "Kuriftu Resort & Spa African Village",
    location: "New Ambo Road, Shaggar City/Burayu - Ethiopia",
    image: resortAfrican,
    stars: 5,
    description: "Kuriftu Resort & Spa African Village is a newly opened African-theme boutique resort complex located in the Shaggar/Burayu area. The property blends contemporary luxury with traditional African design, featuring villa-style accommodations.",
    rooms: [
      { name: "DELUXE SUITE KING WITH HALF CITY VIEW", rate: "Website Non Refundable Bed and Breakfast Rate", price: 160.74, guests: 2 },
      { name: "DELUXE SUITE KING FULL CITY VIEW", rate: "Website Non Refundable Bed and Breakfast Rate", price: 171.00, guests: 2 },
      { name: "DELUXE SUITE KING WITH HALF CITY VIEW", rate: "Website Bed and Breakfast Rate", price: 178.60, guests: 2 },
    ],
    otherRooms: 3,
  },
];

const BookingResults = ({ selectedDate, rooms, onChangeSearch }: BookingResultsProps) => {
  const [orderBy, setOrderBy] = useState<"price" | "stars">("price");
  const [expandedResort, setExpandedResort] = useState<number | null>(null);

  const checkout = new Date(selectedDate);
  checkout.setDate(checkout.getDate() + 1);

  const totalAdults = rooms.reduce((s, r) => s + r.adults, 0);
  const totalChildren = rooms.reduce((s, r) => s + r.children, 0);

  const formatDate = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;

  const sortedResorts = [...resorts].sort((a, b) => {
    if (orderBy === "price") return a.rooms[0].price - b.rooms[0].price;
    return b.stars - a.stars;
  });

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen animate-slide-up">
      {/* Left sidebar - Trip Summary & Filters */}
      <div className="w-full lg:w-[380px] flex-shrink-0 bg-card border-r border-border">
        {/* Trip Summary */}
        <div className="p-6 border-b border-border">
          <h3 className="font-display text-lg font-bold text-center mb-4">Trip summary</h3>
          <div className="flex items-center gap-2 font-body text-sm mb-3">
            <Calendar size={16} className="text-muted-foreground" />
            <span className="font-bold">{formatDate(selectedDate)}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-bold">{formatDate(checkout)}</span>
            <span className="text-accent font-bold">(nights 1)</span>
          </div>
          <div className="flex items-center gap-6 font-body text-sm">
            <div className="flex items-center gap-1.5">
              <BedDouble size={16} className="text-muted-foreground" />
              <span>Rooms: <strong>{rooms.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-muted-foreground" />
              <span>Adults: <strong>{totalAdults}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={16} className="text-muted-foreground" />
              <span>Children: <strong>{totalChildren}</strong></span>
            </div>
          </div>
          <button
            onClick={onChangeSearch}
            className="w-full mt-4 border border-border py-2.5 font-body text-sm font-bold tracking-wider hover:bg-muted transition-colors"
          >
            CHANGE SEARCH
          </button>
        </div>

        {/* Filters */}
        <div className="p-6">
          <h3 className="font-display text-base font-bold mb-4">Filter by</h3>

          <div className="mb-6">
            <h4 className="font-body text-sm font-bold mb-3">Price</h4>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 border border-input px-3 py-1.5 font-body text-sm text-center">77.00 USD</div>
              <span className="text-muted-foreground">-</span>
              <div className="flex-1 border border-input px-3 py-1.5 font-body text-sm text-center">180.00 USD</div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full relative">
              <div className="absolute left-[10%] right-[10%] h-full bg-accent rounded-full" />
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-body text-sm font-bold mb-3">Stars</h4>
            <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
              <input type="checkbox" className="rounded border-border" />
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-accent text-accent" />)}
              </div>
              <span>S</span>
            </label>
          </div>

          <div className="mb-6">
            <h4 className="font-body text-sm font-bold mb-3">Location</h4>
            {["Lake", "Mountains", "City"].map(loc => (
              <label key={loc} className="flex items-center gap-2 font-body text-sm mb-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                {loc}
              </label>
            ))}
          </div>

          <div className="mb-6">
            <h4 className="font-body text-sm font-bold mb-3">Services</h4>
            {["Spa & Wellness", "Restaurant", "Pool", "Bar"].map(s => (
              <label key={s} className="flex items-center gap-2 font-body text-sm mb-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                {s}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Results */}
      <div className="flex-1 bg-background">
        {/* Kuriftu branding header */}
        <div className="flex items-center justify-center gap-4 py-6 border-b border-border bg-card">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="font-display text-xl font-bold text-accent">K</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide leading-none">KURIFTU</h1>
            <p className="font-body text-sm tracking-[0.3em] text-muted-foreground">RESORTS</p>
          </div>
        </div>

        {/* Order by */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
          <span className="font-body text-sm text-muted-foreground">Order by</span>
          <div className="flex gap-2">
            <button
              onClick={() => setOrderBy("price")}
              className={`flex items-center gap-1 px-4 py-1.5 border font-body text-sm transition-colors ${orderBy === "price" ? "border-accent text-accent" : "border-border text-foreground"}`}
            >
              Price <ChevronDown size={14} />
            </button>
            <button
              onClick={() => setOrderBy("stars")}
              className={`flex items-center gap-1 px-4 py-1.5 border font-body text-sm transition-colors ${orderBy === "stars" ? "border-accent text-accent" : "border-border text-foreground"}`}
            >
              Stars <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Resort Cards */}
        <div className="p-6 space-y-6">
          {sortedResorts.map((resort, idx) => (
            <div key={idx} className="border border-border bg-card overflow-hidden animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
              {/* Top: image + info */}
              <div className="flex flex-col md:flex-row">
                <div className="md:w-[300px] h-[220px] flex-shrink-0 overflow-hidden">
                  <img src={resort.image} alt={resort.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-5">
                  <h3 className="font-display text-xl text-accent mb-1">{resort.name}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: resort.stars }).map((_, i) => (
                      <Star key={i} size={12} className="fill-accent text-accent" />
                    ))}
                    <span className="font-body text-xs ml-1">S</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground font-body text-xs mb-3">
                    <MapPin size={12} />
                    <span>{resort.location}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {resort.description}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button className="bg-accent text-accent-foreground px-6 py-2 font-body text-sm font-bold tracking-wider hover:bg-accent/90 transition-colors rounded-sm">
                      Select
                    </button>
                  </div>
                </div>
              </div>

              {/* Room types */}
              <div className="border-t border-border">
                {resort.rooms.map((room, ri) => (
                  <div key={ri} className="flex items-center justify-between px-5 py-3 border-b border-border/50 last:border-b-0">
                    <div>
                      <p className="font-body text-sm font-bold">{room.name}</p>
                      <p className="font-body text-xs text-muted-foreground">{room.rate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {Array.from({ length: room.guests }).map((_, i) => (
                          <Users key={i} size={14} className="text-muted-foreground" />
                        ))}
                      </div>
                      <span className="font-body text-sm font-bold">{room.price.toFixed(2)} USD</span>
                    </div>
                  </div>
                ))}
                {resort.otherRooms > 0 && (
                  <button
                    onClick={() => setExpandedResort(expandedResort === idx ? null : idx)}
                    className="w-full py-2.5 bg-muted/50 font-body text-sm text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Other {resort.otherRooms} room - rates available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingResults;
