import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const locations = [
    { name: "Bishoftu", href: "#resorts" },
    { name: "Lake Tana", href: "#resorts" },
    { name: "Entoto", href: "#resorts" },
    { name: "African Village", href: "#resorts" },
  ];

  return (
    <nav className="fixed top-12 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-primary-foreground font-body text-sm tracking-wider"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
          <span className="hidden sm:inline">Menu</span>
        </button>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="font-display text-xl md:text-2xl font-bold text-primary-foreground tracking-wide">
            KURIFTU<span className="block text-xs tracking-[0.3em] font-body font-normal">RESORTS</span>
          </h1>
        </Link>

        <Link
          to="/booking"
          className="bg-primary-foreground text-primary px-6 py-2.5 text-sm font-body font-bold tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Reserve
        </Link>
      </div>

      {isOpen && (
        <div className="bg-primary border-t border-primary-foreground/10 animate-fade-in">
          <div className="container mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {locations.map((loc) => (
              <a
                key={loc.name}
                href={loc.href}
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground/80 hover:text-primary-foreground font-body text-sm tracking-wider transition-colors"
              >
                {loc.name}
              </a>
            ))}
            <Link
              to="/booking"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground font-body text-sm tracking-wider transition-colors"
            >
              Book Now
            </Link>
            <a
              href="#experiences"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground font-body text-sm tracking-wider transition-colors"
            >
              Experiences
            </a>
            <a
              href="#gallery"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground font-body text-sm tracking-wider transition-colors"
            >
              Gallery
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
