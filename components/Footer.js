"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  ArrowRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full relative bg-[#2A4537] text-white overflow-hidden font-sans">
      {/* Subtle Texture & Depth Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1E3328]/40 via-transparent to-[#1E3328]/40 pointer-events-none"></div>
      
      {/* Premium Gold Top Accent */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5A028]/40 to-transparent shadow-[0_0_15px_rgba(197,160,40,0.2)]"></div>

      <div className="container mx-auto px-6 lg:px-20 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand & Logo Column */}
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="flex items-center text-[32px] font-black text-white hover:text-[#C5A028] transition-all duration-300 mb-8 uppercase tracking-tighter group/logo"
            >
              <div className="relative">
                <img src="/images/Logo2.png" alt="Cezore" className="h-10 w-auto mr-4 transition-transform duration-500 group-hover/logo:scale-110" />
                <div className="absolute -inset-1 bg-[#C5A028]/10 blur-xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
              </div>
              Cezore
            </Link>
            <p className="text-white/70 text-[15px] leading-relaxed font-medium italic max-w-sm mb-12 tracking-wide">
              Crafting timeless masterpieces that bridge the gap between ancient elegance and modern luxury. Distinctively handmade for the discerning few.
            </p>
            
            <div className="flex flex-col gap-6">
              <a
                href="mailto:concierge@cezore.com"
                className="flex items-center gap-6 group/contact w-fit"
              >
                <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover/contact:border-[#C5A028]/50 group-hover/contact:bg-[#C5A028]/10 transition-all duration-500 shadow-lg">
                  <Mail className="h-5 w-5 text-white/50 group-hover/contact:text-[#C5A028]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A028]/70">Concierge Inquiries</span>
                  <span className="text-sm font-bold tracking-tight text-white/90 group-hover/contact:text-[#C5A028] transition-colors">concierge@cezore.com</span>
                </div>
              </a>
              
              <a
                href="tel:+1800LUXEGOLD"
                className="flex items-center gap-6 group/contact w-fit"
              >
                <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover/contact:border-[#C5A028]/50 group-hover/contact:bg-[#C5A028]/10 transition-all duration-500 shadow-lg">
                  <Phone className="h-5 w-5 text-white/50 group-hover/contact:text-[#C5A028]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A028]/70">Direct Boutique Line</span>
                  <span className="text-sm font-bold tracking-tight text-white/90 group-hover/contact:text-[#C5A028] transition-colors">+1 (800) LUXE-GOLD</span>
                </div>
              </a>
            </div>
          </div>

          {/* CATEGORIES SECTION */}
          <div className="lg:col-span-3">
            <h4 className="text-[14px] font-black uppercase tracking-[0.35em] text-[#C5A028] mb-12 flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#C5A028]/30"></span>
              CATEGORIES
            </h4>
            <ul className="flex flex-col gap-6">
              {[
                "Bracelets", "Necklace", "Chokers", "Rings", "Earrings"
              ].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/category/${item.toLowerCase()}`}
                    className="group flex items-center gap-3 text-white/60 hover:text-white transition-all text-[15px] font-bold tracking-wide"
                  >
                    <ArrowRight className="h-3 w-3 text-[#C5A028] opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* QUICK LINKS SECTION */}
          <div className="lg:col-span-4">
            <h4 className="text-[14px] font-black uppercase tracking-[0.35em] text-[#C5A028] mb-12 flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#C5A028]/30"></span>
              QUICK LINKS
            </h4>
            <ul className="flex flex-col gap-6">
              {[
                { name: "Refund Policy", path: "/refund-policy" },
                { name: "Return Order", path: "/orders" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms Of Services", path: "/terms" },
                { name: "About Us", path: "/about" },
                { name: "Contact Us", path: "/contact" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.path}
                    className="group flex items-center gap-3 text-white/60 hover:text-white transition-all text-[15px] font-bold tracking-wide"
                  >
                    <ArrowRight className="h-3 w-3 text-[#C5A028] opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Global Standards & Copyright Bar */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
              © 2024 <span className="text-[#C5A028]/80">Cezore Boutique</span>. Crafted with heritage.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3 text-[#C5A028]/50" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Worldwide Shipping</span>
              </div>
              <span className="h-1 w-1 bg-white/10 rounded-full"></span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#C5A028]/40">Diamond Certified</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-2 rounded-full bg-black/10 border border-white/5 shadow-inner">
            {[Twitter, Linkedin, Instagram, Facebook, Youtube].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="h-11 w-11 rounded-full border border-white/5 flex items-center justify-center hover:bg-[#C5A028] hover:text-[#111] hover:border-transparent transition-all duration-500 shadow-xl group"
              >
                <Icon className="h-4 w-4 text-white/40 group-hover:text-[#111]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
