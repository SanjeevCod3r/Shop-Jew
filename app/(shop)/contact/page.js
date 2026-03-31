"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Send, Sparkles, Gem, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for form submission goes here
    console.log("Contact form submitted");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* 1. Hero Section - Direct & Immersive */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mr-0 md:mr-4 ml-0 md:ml-4 rounded-0 md:rounded-[40px] mt-0 md:mt-4">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/AestheticJew.jpeg"
            alt="LuxeLoom Concierge Heritage"
            fill
            className="object-cover scale-105 animate-in fade-in duration-1000 brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <span className="text-[#C5A028] uppercase tracking-[0.6em] text-xs font-bold mb-6 block animate-in slide-in-from-bottom duration-700">
            PRIVATE CONCIERGE
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1] tracking-tighter animate-in slide-in-from-bottom duration-1000 delay-200">
            Speak with a <br /> Jewelry Specialist
          </h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-200 font-light leading-relaxed animate-in slide-in-from-bottom duration-1000 delay-300">
            Our experts are dedicated to helping you find the perfect piece or curate your private collection.
          </p>
        </div>
      </section>

      {/* 2. Contact Info Grid - High-End Layout */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 -mt-32 relative z-20">
            {/* Location Card */}
            <div className="bg-white p-12 rounded-[32px] border border-gray-100 shadow-2xl hover:shadow-gold/10 transition-all duration-500 group hover:-translate-y-2">
              <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-[#2A4736] transition-colors">
                <MapPin className="h-8 w-8 text-[#2A4736] group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">The Boutique</h4>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 font-light">
                Visit our flagship boutique in the heart of the luxury district to experience our collections in person.
              </p>
              <div className="text-gray-900 font-bold text-sm">
                12-A, Heritage Plaza, <br /> Fifth Avenue, CA 90210
              </div>
            </div>

            {/* Direct Line Card */}
            <div className="bg-white p-12 rounded-[32px] border border-gray-100 shadow-2xl hover:shadow-gold/10 transition-all duration-500 group hover:-translate-y-2">
              <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-[#2A4736] transition-colors">
                <Phone className="h-8 w-8 text-[#2A4736] group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">Direct Access</h4>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 font-light">
                Speak directly with a concierge for immediate assistance with orders or bespoke requests.
              </p>
              <div className="text-gray-900 font-bold text-sm">
                +1 (800) LUXE-LOOM <br />
                <span className="text-xs text-gray-400 font-medium tracking-widest">(24/7 Concierge Support)</span>
              </div>
            </div>

            {/* Digital Concierge Card */}
            <div className="bg-white p-12 rounded-[32px] border border-gray-100 shadow-2xl hover:shadow-gold/10 transition-all duration-500 group hover:-translate-y-2">
              <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-[#2A4736] transition-colors">
                <Mail className="h-8 w-8 text-[#2A4736] group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">Digital Suite</h4>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 font-light">
                Preferred communication for digital receipts, catalog requests, and maintenance schedules.
              </p>
              <div className="text-gray-900 font-bold text-sm">
                concierge@luxeloom.com <br />
                support@luxeloom.com
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Consultation Suite - Form & Imagery */}
      <section className="py-24 bg-[#fcfcfc]">
        <div className="container mx-auto px-4 lg:px-20">
          <div className="flex flex-col lg:flex-row gap-20 items-stretch">
            {/* Imagery & Text Column */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-12 animate-in slide-in-from-left duration-1000">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-6 w-6 text-[#C5A028]" />
                  <span className="text-[#C5A028] font-black uppercase tracking-[0.3em] text-xs">A Private Session</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tighter">
                  Request a Private <br /> <span className="text-[#2A4736]">Expert Showcase</span>
                </h2>
                <p className="text-lg text-gray-500 font-light leading-relaxed max-w-md">
                  Complete the inquiry Below, and our senior specialists will reach out to schedule an exclusive viewing or 
                  consultation within 24 hours.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-[#2A4736]" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Certified Experts</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Gem className="h-5 w-5 text-[#2A4736]" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Vault Access</span>
                </div>
              </div>

              <div className="relative aspect-[16/9] rounded-[32px] overflow-hidden group shadow-xl">
                 <Image
                    src="/images/photo2.jpeg"
                    alt="Private Consultation"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
              </div>
            </div>

            {/* Form Column */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white p-12 lg:p-16 rounded-[40px] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(42,71,54,0.1)] h-full overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Gem className="h-32 w-32 text-[#2A4736]" />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</Label>
                       <Input 
                         type="text" 
                         placeholder="E.g. Alexander Sterling"
                         className="bg-gray-50/50 border-0 border-b-2 border-gray-100 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-[#2A4736] py-6 px-1 text-sm transition-all"
                       />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</Label>
                       <Input 
                         type="email" 
                         placeholder="E.g. alex@estate.com"
                         className="bg-gray-50/50 border-0 border-b-2 border-gray-100 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-[#2A4736] py-6 px-1 text-sm transition-all"
                       />
                    </div>
                  </div>

                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inquiry Subject</Label>
                     <Input 
                         type="text" 
                         placeholder=""
                         className="bg-gray-50/50 border-0 border-b-2 border-gray-100 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-[#2A4736] py-6 px-1 text-sm transition-all"
                       />
                  </div>

                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Message</Label>
                     <Textarea 
                       placeholder="How may we assist in your search for brilliance?"
                       rows={4}
                       className="bg-gray-50/50 border-0 border-b-2 border-gray-100 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-[#2A4736] py-4 px-1 text-sm transition-all resize-none"
                     ></Textarea>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-[#2A4736] hover:bg-[#1d3526] text-white py-8 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl group border-none"
                  >
                    SEND INQUIRY
                    <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                  
                  <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
                    By submitting this form, you acknowledge that our specialists will contact you <br />
                    via the provided details to facilitate your request with the utmost privacy.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
