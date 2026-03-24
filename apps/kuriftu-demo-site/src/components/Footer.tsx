import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">More Information</h3>
            <ul className="space-y-3 font-body text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">About Us</a></li>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                +251 911 091 185
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} />
                booking@kurifturesorts.com
              </li>
              <li>
                <Link to="/booking" className="inline-block mt-2 border border-primary-foreground/30 px-5 py-2 text-xs tracking-wider hover:bg-primary-foreground/10 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Resorts</h3>
            <ul className="space-y-3 font-body text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Kuriftu Resort & Spa African Village</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Kuriftu Resort & Spa Bishoftu</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Kuriftu Entoto Adventure Park</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Kuriftu Resort & Spa Lake Tana</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Kuriftu Resort & Spa Awash</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Adventure & Wellness</h3>
            <ul className="space-y-3 font-body text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Kuriftu Water Park</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Kuriftu Entoto Adventure Park</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Boston Day Spa</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Socials</h3>
            <div className="flex gap-4 text-primary-foreground/70">
              <a href="#" className="hover:text-primary-foreground transition-colors text-sm font-body">Instagram</a>
              <a href="#" className="hover:text-primary-foreground transition-colors text-sm font-body">Facebook</a>
              <a href="#" className="hover:text-primary-foreground transition-colors text-sm font-body">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 text-center font-body text-xs text-primary-foreground/50">
          All Copyright © 2025 Kuriftu Resort & Spa.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
