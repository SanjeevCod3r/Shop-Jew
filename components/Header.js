"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Grid, Flower2, User } from "lucide-react";
import { useAuthStore, useCartStore } from "@/lib/store";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuthStore();
  const { cartItems } = useCartStore();

  return (
    <>
      {/* Top Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center text-[26px] font-bold text-black"
          >
             <img src="/images/Logo2.png" alt="Cezore" className="h-8 w-15" />
           Cezore
          </Link>

          {/* Search Bar */}
          <div className="w-full lg:flex-1 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white border border-gray-300 rounded-full px-1.5 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#2A4736] focus-within:border-transparent transition-all">
              <input
                type="text"
                placeholder="Search your favourite products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none focus:outline-none focus:ring-0 py-2.5 px-6 text-sm text-gray-700 bg-transparent placeholder-gray-400"
              />
              <button
                type="button"
                className="bg-[#2A4736] hover:bg-[#1f3628] text-white p-2.5 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-8 pl-4">
            {/* 1. Profile */}
            <Link
              href="/profile"
              className="flex items-center gap-2 text-[#3A504B] hover:text-[#2A4736] font-bold text-sm tracking-wide transition-colors group"
            >
              <User className="h-6 w-6 text-gray-600 group-hover:text-[#2A4736]" />
              <span className="ml-1 uppercase tracking-wider text-[11px]">Profile</span>
            </Link>

            {/* 2. Your Cart */}
            <Link
              href="/cart"
              className="flex items-center gap-2 text-[#3A504B] hover:text-[#2A4736] font-bold text-sm tracking-wide transition-colors group"
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
              <span className="ml-1 uppercase tracking-wider text-[11px]">Your Cart</span>
            </Link>

            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden lg:block"></div>

            {/* 3. Login / Logout / Signup */}
            {token ? (
              <button
                onClick={() => {
                  const { logout } = useAuthStore.getState();
                  logout();
                  window.location.href = "/";
                }}
                className="text-[#3A504B] hover:text-red-600 font-bold text-[11px] uppercase tracking-[0.2em] transition-colors"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  href="/login"
                  className="text-[#3A504B] hover:text-[#2A4736] font-bold text-[11px] uppercase tracking-[0.2em] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#2A4736] hover:bg-[#1f3628] text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#2f4939] text-white shadow-sm relative z-20">
        <div className="container mx-auto flex items-stretch">
          {/* Categories Title Box */}
          <div className="w-[280px] bg-[#1d3526] px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-[#182d20] transition-colors">
            <Grid className="h-5 w-5 text-gray-200" strokeWidth={2.5} />
            <span className="font-semibold text-[15px] tracking-wide text-gray-50">
              Categories
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex-1 px-8 lg:px-10 flex items-center justify-between">
            <ul className="flex items-center gap-10">
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
              className="hover:text-gray-300 font-medium text-sm transition-colors text-gray-200 tracking-wide"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
