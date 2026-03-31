"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Gem, Sparkles, Heart, ShieldCheck, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans text-gray-800 overflow-x-hidden">
      {/* 1. Hero Section - Immersive Luxury */}
      <section className="relative h-[72vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about.jpeg"
            alt="Cezore Heritage Header"
            fill
            className="object-cover scale-105 anim-enter-up"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white stagger-children">
          <span className="text-gold uppercase tracking-[0.25em] sm:tracking-[0.45em] md:tracking-[0.6em] text-[10px] md:text-sm font-bold mb-4 md:mb-6 block">
            Established 1994
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-8xl font-bold mb-5 md:mb-8 leading-[1.1] tracking-tighter">
            A Legacy of <br /> Timeless Elegance
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-xl text-gray-200 font-light leading-relaxed">
            Crafting more than just jewelry—we weave stories of love, heritage,
            and uncompromising beauty into every hand-selected gemstone.
          </p>
        </div>
      </section>

      {/* 2. Our Narrative - Elegant Storytelling */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16 lg:gap-24">
            <div className="w-full lg:w-1/2 space-y-8 md:space-y-12 anim-enter-up">
              <div className="space-y-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="h-px w-12 bg-gold"></div>
                  <h3 className="text-gold uppercase tracking-[0.22em] md:tracking-[0.4em] font-black text-[10px] md:text-xs">
                    The Cezore Legacy
                  </h3>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                  Born from a passion <br /> 
                  for <span className="text-[#2A4736] relative inline-block">
                    natural brilliance
                    <svg className="absolute -bottom-2 left-0 w-full h-2 text-gold/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </span>.
                </h2>
              </div>
              
              <div className="space-y-8">
                <div className="relative pl-5 md:pl-8 border-l-2 border-gold/20">
                  <p className="text-base md:text-xl text-gray-600 font-light italic leading-relaxed">
                    "Luxury at Cezore isn't just a price tag; it's a standard of 
                    unwavering excellence passed down through generations."
                  </p>
                </div>
                
                <div className="space-y-6 text-gray-600 text-base md:text-lg leading-relaxed font-light">
                  <p>
                    Founded over three decades ago, our journey began in a 
                    sequestered boutique focused on rare pearls and vintage 
                    restorations. What started as a labor of love has evolved 
                    into a global sanctuary for the world's most discerning 
                    connoisseurs.
                  </p>
                  <p>
                    Today, Cezore stands as a lighthouse of artisanal integrity. 
                    Every piece undergoes a rigorous 12-point inspection, 
                    ensuring that what you wear is not simply jewelry, but a 
                    timeless masterpiece of structural perfection.
                  </p>
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 md:pt-8">
                {[
                  { label: "Years Experience", value: "30+" },
                  { label: "Clients Worldwide", value: "10k+" },
                  { label: "Ethical Sourcing", value: "100%" }
                ].map((stat, i) => (
                  <div key={i} className="group p-5 md:p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-[#2A4736] hover:border-[#2A4736] transition-all duration-500 hover:-translate-y-1 anim-hover-lift">
                    <div className="text-2xl font-bold text-[#2A4736] group-hover:text-gold transition-colors mb-2">
                      {stat.value}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-400 font-black group-hover:text-white/70 transition-colors">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2 relative group anim-enter-up">
              <div className="aspect-[4/5] rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl relative z-10">
                <Image
                  src="/images/Contact.jpeg"
                  alt="Our Founder's Vision"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#2A4736]/10 rounded-full blur-3xl -z-10 text-[#2A4736]"></div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Artisan Section - Deep Mood */}
      <section className="bg-[#1d3526] py-14 md:py-24 text-white">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <div className="max-w-3xl space-y-6 mb-16 anim-enter-up">
            <div className="flex justify-center mb-6">
              <Sparkles className="h-10 w-10 text-[#C5A028] opacity-80" />
            </div>
            <h2 className="text-3xl md:text-6xl font-bold tracking-tight text-[#C5A028]">
              The Heartbeat <br /> of Craftsmanship
            </h2>
            <p className="text-gray-400 text-base md:text-xl font-light">
              Behind every Cezore piece is a collective of master artisans who
              have dedicated their lives to the art of fine jewelry. We honor
              traditional techniques while embracing modern innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full stagger-children">
            <div className="space-y-6 anim-hover-lift">
              <div className="aspect-square rounded-[32px] overflow-hidden relative border-2 border-white/5 p-2">
                <div className="w-full h-full rounded-[24px] overflow-hidden relative">
                  <Image
                    src="/images/about1.jpeg"
                    alt="Detailing"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <h4 className="text-xl font-bold ">Meticulous Selection</h4>
              <p className="text-gray-400 text-sm">
                Only the top 1% of naturally sourced gemstones meet our criteria
                for color, clarity, and ethical origin.
              </p>
            </div>
            <div className="space-y-6 anim-hover-lift">
              <div className="aspect-square rounded-[32px] overflow-hidden relative border-2 border-white/5 p-2">
                <div className="w-full h-full rounded-[24px] overflow-hidden relative">
                  <Image
                    src="/images/about3.jpeg"
                    alt="Handcrafting"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <h4 className="text-xl font-bold">Artisanal Casting</h4>
              <p className="text-gray-400 text-sm">
                We use eco-friendly recycled metals, casted in specialized
                high-pressure environments for zero flaws.
              </p>
            </div>
            <div className="space-y-6 anim-hover-lift">
              <div className="aspect-square rounded-[32px] overflow-hidden relative border-2 border-white/5 p-2">
                <div className="w-full h-full rounded-[24px] overflow-hidden relative">
                  <Image
                    src="/images/about2.jpeg"
                    alt="Polishing"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <h4 className="text-xl font-bold">Signature Finish</h4>
              <p className="text-gray-400 text-sm">
                Each piece is hand-polished for over 48 hours to achieve our
                signature 'Liquid Mirror' shine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Brand Values - High-End Grid */}
      <section className="py-14 md:py-24 bg-[#f9fafb]">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-20">
            <h3 className="text-[#2A4537] uppercase tracking-[0.2em] md:tracking-[0.4em] font-black text-[10px] md:text-xs">
              Our Commitment
            </h3>
            <h2 className="text-3xl md:text-5xl font-bold text-[#2A4537]">
              Why Choose Cezore?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 stagger-children">
            {[
              {
                icon: Heart,
                title: "Ethical Sourcing",
                desc: "Conflict-free diamonds and fair-trade gold as a non-negotiable standard.",
              },
              {
                icon: ShieldCheck,
                title: "Lifetime Assurance",
                desc: "Complimentary maintenance and appraisal services for the life of your piece.",
              },
              {
                icon: Gem,
                title: "Unique Designs",
                desc: "Bespoke collections that are never mass-produced, ensuring exclusivity.",
              },
              {
                icon: Sparkles,
                title: "Modern Luxury",
                desc: "Redefining elegance for the contemporary connoisseur with bold silhouettes.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 md:p-10 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group hover:-translate-y-2 anim-hover-lift"
              >
                <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-[#2A4736] transition-colors">
                  <item.icon className="h-7 w-7 text-[#2A4736] group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Section - Direct and Clean */}
      <section className="py-16 md:py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-10 anim-enter-up">
            <h2 className="text-3xl md:text-7xl font-bold tracking-tighter text-[#2A4537]">
              Experience Excellence.
            </h2>
            <p className="text-gray-500 text-base md:text-xl font-light">
              Join thousands of discerning individuals who trust us with their
              most precious moments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-5 md:pt-6">
              <Link
                href="/shop"
                className="bg-[#2A4736] text-white px-6 md:px-10 py-4 md:py-5 rounded-full font-bold text-[13px] md:text-[16px] shadow-2xl hover:bg-[#1d3526] transition-all flex items-center gap-2 md:gap-3 active:scale-95 group"
              >
                Shop Latest Collection
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="text-gray-900 font-bold hover:text-[#2A4736] transition-colors flex items-center gap-2 text-[16px]"
              >
                Speak to a Specialist <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-gold/5 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-[#2A4736]/5 rounded-full blur-[100px] -z-10"></div>
      </section>
    </div>
  );
}
