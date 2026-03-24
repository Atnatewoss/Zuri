import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [hero1, hero2, hero3];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={slide}
            alt={`Kuriftu Resort view ${i + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 hero-overlay" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <p className="section-label text-primary-foreground/80 mb-4">
          A New Urban Sanctuary
        </p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-primary-foreground font-normal leading-tight max-w-4xl animate-fade-in">
          Kuriftu Resorts –<br />Luxury Redefined in Ethiopia
        </h2>
        <Link
          to="/booking"
          className="mt-10 bg-accent text-accent-foreground px-10 py-4 font-body text-sm font-bold tracking-[0.2em] uppercase hover:bg-gold-light transition-colors animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          Book Your Stay
        </Link>

        <div className="absolute bottom-10 flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-primary-foreground w-8" : "bg-primary-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
