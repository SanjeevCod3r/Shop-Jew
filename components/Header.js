"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Grid, Flower2, User, Menu, Home, Info, FileText, PhoneCall, LogOut, LogIn, UserPlus, BookOpen } from "lucide-react";
import { useAuthStore, useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuthStore();
  const { cartItems } = useCartStore();
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    const categories = ['earrings', 'rings', 'necklaces', 'bracelets', 'pendants', 'bangles'];

    // check if it matches a category exactly or its singular/plural form
    const foundCategory = categories.find(cat => {
      const singular = cat.replace(/s$/i, '');
      const querySingular = query.replace(/s$/i, '');
      return cat === query || singular === query || cat === querySingular || singular === querySingular;
    });

    if (foundCategory) {
      router.push(`/category/${foundCategory}`);
    } else {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6 lg:gap-8">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <button className="lg:hidden p-1 text-[#2A4736] hover:bg-[#2A4736]/5 rounded-xl transition-all active:scale-95">
                  <Menu className="h-8 w-8" strokeWidth={3} title="Menu" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-[#2A4736] border-[#1f3628] p-0">
                <SheetHeader className="p-6 border-b border-[#3A504B]">
                  <SheetTitle className="text-black text-[30px] flex items-center">
                    <img src="/images/logp5.png" alt="Cezore" className="h-9 w-auto" />
                    Cezore
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-6">
                  <Link href="/" className="px-8 py-4 text-gray-100 hover:bg-[#1f3628] hover:text-white transition-all font-medium border-l-4 border-transparent hover:border-[#C5A028] flex items-center gap-3">
                    <Home className="h-5 w-5 text-[#C5A028]" />
                    Home
                  </Link>
                  <Link href="/shop" className="px-8 py-4 text-gray-100 hover:bg-[#1f3628] hover:text-white transition-all font-medium border-l-4 border-transparent hover:border-[#C5A028] flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-[#C5A028]" />
                    Shop
                  </Link>
                  <Link href="/about" className="px-8 py-4 text-gray-100 hover:bg-[#1f3628] hover:text-white transition-all font-medium border-l-4 border-transparent hover:border-[#C5A028] flex items-center gap-3">
                    <Info className="h-5 w-5 text-[#C5A028]" />
                    About Us
                  </Link>
                  <Link href="/blog" className="px-8 py-4 text-gray-100 hover:bg-[#1f3628] hover:text-white transition-all font-medium border-l-4 border-transparent hover:border-[#C5A028] flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-[#C5A028]" />
                    Blog
                  </Link>
                  <Link href="/contact" className="px-8 py-4 text-gray-100 hover:bg-[#1f3628] hover:text-white transition-all font-medium border-l-4 border-transparent hover:border-[#C5A028] flex items-center gap-3">
                    <PhoneCall className="h-5 w-5 text-[#C5A028]" />
                    Contact Us
                  </Link>
                </div>

                <div className="mt-auto p-6 border-t border-[#3A504B]">
                  {token ? (
                    <button
                      onClick={() => {
                        const { logout } = useAuthStore.getState();
                        logout();
                        window.location.href = "/";
                      }}
                      className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold uppercase text-xs tracking-widest"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/login"
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-[#1f3628] text-white hover:bg-[#C5A028]/20 transition-all font-bold uppercase text-xs tracking-widest"
                      >
                        <LogIn className="h-5 w-5 text-[#C5A028]" />
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-[#C5A028] text-black hover:bg-[#b08d20] transition-all font-bold uppercase text-xs tracking-widest"
                      >
                        <UserPlus className="h-5 w-5 text-black" />
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link
              href="/"
              className="flex items-center text-[22px] md:text-[26px] font-bold text-black"
            >
               <img src="/images/Logo2.png" alt="Cezore" className="h-7 md:h-8 w-auto" />
             Cezore
            </Link>
          </div>

          {/* Search Bar */}
          <div className="w-full lg:flex-1 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center bg-white border border-gray-300 rounded-full px-1.5 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#2A4736] focus-within:border-transparent transition-all"
            >
              <input
                type="text"
                placeholder="Search your favourite products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none focus:outline-none focus:ring-0 py-2 px-4 md:px-6 text-sm text-gray-700 bg-transparent placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-[#2A4736] hover:bg-[#1f3628] text-white p-2 md:p-2.5 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-6 lg:gap-8 pl-0 lg:pl-4 w-full lg:w-auto flex-wrap">
            {/* 1. Profile */}
            <Link
              href="/profile"
              className="flex items-center gap-2 text-[#3A504B] hover:text-[#2A4736] font-bold text-xs md:text-sm tracking-wide transition-colors group"
            >
              <User className="h-6 w-6 text-gray-600 group-hover:text-[#2A4736]" />
              <span className="ml-1 uppercase tracking-wide md:tracking-wider text-[10px] md:text-[11px]">Profile</span>
            </Link>

            {/* 2. Your Cart */}
            <Link
              href="/cart"
              className="flex items-center gap-2 text-[#3A504B] hover:text-[#2A4736] font-bold text-xs md:text-sm tracking-wide transition-colors group"
            >
              <div className="relative">
                <div className="p-1">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-600 group-hover:text-[#2A4736]"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </div>
                {cartItems && cartItems.length > 0 && (
                  <span className="absolute -top-[2px] -right-[5px] bg-[#2A4736] text-white text-[9px] font-bold h-[18px] w-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <span className="ml-1 uppercase tracking-wide md:tracking-wider text-[10px] md:text-[11px]">Your Cart</span>
            </Link>

            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>

            {/* 3. Login / Logout / Signup - Hidden on mobile, managed in drawer instead */}
            <div className="hidden md:flex items-center gap-3 md:gap-6">
              {token ? (
                <button
                  onClick={() => {
                    const { logout } = useAuthStore.getState();
                    logout();
                    window.location.href = "/";
                  }}
                  className="text-[#3A504B] hover:text-red-600 font-bold text-[10px] md:text-[11px] uppercase tracking-[0.12em] md:tracking-[0.2em] transition-colors"
                >
                  Logout
                </button>
              ) : (
                <div className="flex items-center gap-3 md:gap-6">
                  <Link
                    href="/login"
                    className="text-[#3A504B] hover:text-[#2A4736] font-bold text-[10px] md:text-[11px] uppercase tracking-[0.12em] md:tracking-[0.2em] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-[#2A4736] hover:bg-[#1f3628] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.12em] md:tracking-[0.2em] transition-all shadow-xl active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Hidden on mobile, shown on desktop */}
      <nav className="hidden md:block bg-[#2f4939] text-white shadow-sm relative z-20">
        <div className="container mx-auto flex flex-col md:flex-row items-stretch">
          {/* Categories Title Box */}
          <div className="hidden md:flex w-[280px] bg-[#1d3526] px-6 py-4 items-center gap-3 cursor-pointer hover:bg-[#182d20] transition-colors">
            <Grid className="h-5 w-5 text-gray-200" strokeWidth={2.5} />
            <span className="font-semibold text-[15px] tracking-wide text-gray-50">
              Categories
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex-1 px-4 md:px-8 lg:px-10 py-3 md:py-0 flex items-center justify-between gap-4 overflow-x-auto">
            <ul className="hidden md:flex items-center gap-6 md:gap-10 min-w-max">
              <li>
                <Link
                  href="/"
                  className="hover:text-gray-300 font-medium text-sm transition-colors text-white tracking-wide"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="hover:text-gray-300 font-medium text-sm transition-colors text-gray-200 tracking-wide"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-gray-300 font-medium text-sm transition-colors text-gray-200 tracking-wide"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-gray-300 font-medium text-sm transition-colors text-gray-200 tracking-wide"
                >
                  Blog
                </Link>
              </li>
            </ul>
            <Link
              href="/contact"
              className="hidden md:block hover:text-gray-300 font-medium text-sm transition-colors text-gray-200 tracking-wide min-w-max"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
