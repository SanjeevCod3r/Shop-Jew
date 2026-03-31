"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Grid,
  ChevronRight,
  Gem,
  Sparkles,
  Focus,
  CircleDot,
  Star,
  ShoppingBag,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useAuthStore, useCartStore } from "@/lib/store";
import { toast } from "sonner";

// Representing sidebar categories
const CATEGORIES_ICONS = {
  Rings: CircleDot,
  Necklace: Sparkles,
  Earing: Gem,
  Bracelet: CircleDot,
  Piercing: Focus,
  Chain: CircleDot,
};

// Thumbnails at bottom based on mockup layout
const BOTTOM_CATS = [
  { name: "Earings", image: "/images/earing.png" },
  { name: "Rings", image: "/images/ring.png" },
  { name: "Chain", image: "/images/chain.png" },
  { name: "Necklace", image: "/images/necklace.png" },
  { name: "Bangles", image: "/images/bangles.png" },
];

const GALLERY_IMAGES = [
  "/images/jew4.jpeg",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
  "/images/jew2.jpeg",
  "/images/jew3.jpeg",
  "/images/jew8.jpeg",
  "/images/jew6.jpeg",
  "/images/jew7.jpeg",
];

const WORKS_DATA = [
  {
    id: 1,
    title: "THE ROSELINE RING",
    category: "Rings",
    image: "/images/photo.jpeg",
  },
  {
    id: 2,
    title: "THE ZOË EARRINGS",
    category: "Earrings",
    image: "/images/jew4.jpeg",
  },
  {
    id: 3,
    title: "THE Hibiscus Ring II",
    category: "Rings",
    image: "/images/photo2.jpeg",
  },
  {
    id: 4,
    title: "THE CHUBBY HOOPS",
    category: "Earrings",
    image: "/images/AestheticJew.jpeg",
  },
  {
    id: 5,
    title: "THE CHUBBY HOOPS",
    category: "Rings",
    image: "/images/Asthetic3.jpeg",
  },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const { cartItems, setCart, addItem } = useCartStore();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      skipSnaps: false,
      dragFree: true,
      loop: true,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, newProdRes, blogRes, catRes] = await Promise.all([
        fetch("/api/products?limit=8"),
        fetch("/api/products?limit=4&sort=createdAt&order=desc"),
        fetch("/api/blogs?limit=3"),
        fetch("/api/categories"),
      ]);
      const prodData = await prodRes.json();
      const newProdData = await newProdRes.json();
      const blogData = await blogRes.json();
      const catData = await catRes.json();

      setProducts(prodData.products || []);
      setNewProducts(newProdData.products || []);
      setBlogs(blogData.blogs || []);
      setCategories(catData.categories || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (e, product) => {
    e.preventDefault();
    
    // Always add to local store first for immediate guest experience
    addItem(product, 1);
    toast.success("Added to cart!");

    // If logged in, also sync with backend
    if (token) {
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product._id, quantity: 1 }),
        });

        const data = await response.json();
        if (response.ok) {
          setCart(data.cart?.items || []);
        }
      } catch (error) {
        console.error("Error syncing cart to server:", error);
      }
    }
  };

  // Use categories from DB or fallback to static list if DB is empty
  const displayCategories =
    categories.length > 0 ? categories : Object.keys(CATEGORIES_ICONS);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <main className="container mx-auto px-0 md:px-4 mt-8 flex flex-col md:flex-row gap-6 lg:gap-8 mb-20 relative z-10">
        {/* Sidebar */}
        <div className="hidden md:block w-[280px] flex-shrink-0 bg-white border border-gray-200 rounded-sm shadow-sm self-start">
          <ul className="flex flex-col py-3">
            {displayCategories.map((catName, idx) => {
              const Icon = CATEGORIES_ICONS[catName] || CircleDot;
              return (
                <li key={idx}>
                  <Link
                    href={`/category/${catName
                      .toLowerCase()
                      .replace(" ", "-")}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/80 group border-b border-gray-100 last:border-none transition-colors"
                  >
                    <div className="flex items-center gap-4 text-gray-500 group-hover:text-[#2A4736]">
                      <Icon
                        className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-[#2A4736] transition-colors"
                        strokeWidth={1.5}
                      />
                      <span className="font-medium text-[14px] text-gray-600 transition-colors">
                        {catName}
                      </span>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 text-gray-300 group-hover:text-[#2A4736] transition-colors"
                      strokeWidth={2}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Banners */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 md:px-0">
          <div className="flex-1 bg-[#2A4736] rounded-[24px] overflow-hidden relative min-h-[420px] shadow-sm">
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/luxeloom_main_banner.png"
                alt="Luxury Jewelry Model"
                fill
                className="object-cover object-right-top md:object-[80%_30%]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2B4E38]/95 via-[#2B4E38]/70 to-transparent w-full md:w-[85%]"></div>
            </div>
            <div className="relative z-10 w-full md:w-[70%] h-full p-10 md:p-14 flex flex-col justify-center">
              <h2 className="text-[#C5A028] text-[28px] font-normal mb-1 tracking-wide">
                Where Luxury
              </h2> 
              <h1 className="text-white text-[42px] sm:text-[48px] lg:text-[52px] font-semibold leading-[1.1] mb-5 tracking-tight">
                Meets Affordability
              </h1>
              <p className="text-[#b1c5b4] text-[15px] mb-10 max-w-[340px] leading-relaxed font-light">
                Exquisite, handcrafted jewelry that celebrates elegance and
                individuality.
              </p>
              <Link
                href="/shop"
                className="bg-white hover:bg-gray-50 text-[#2f4939] rounded-full px-7 py-3 font-semibold text-sm w-fit flex items-center gap-3 transition-transform hover:scale-105 shadow-md group"
              >
                <span className="tracking-wide">Shop Now</span>
                <ShoppingCart className="h-[18px] w-[18px] group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[300px] xl:w-[320px] rounded-[24px] overflow-hidden relative min-h-[420px] shadow-sm flex-shrink-0 group cursor-pointer">
            <Image
              src="/images/luxeloom_side_banner.png"
              alt="Sale Rings"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col items-center text-center">
              <span className="text-gray-300 text-xs tracking-[0.2em] font-medium uppercase mb-3">
                Gold Pricing
              </span>
              <h3 className="text-[#C5A028] text-[34px] font-bold mb-3 leading-tight tracking-tight">
                Flash Sale
              </h3>
              <p className="text-gray-300 text-[13px] mb-5 font-normal tracking-wide">
                2 march-15 march
              </p>
              <span className="text-white text-[13px] underline underline-offset-4 decoration-white/60 hover:decoration-white transition-colors font-medium">
                See more products
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Category Thumbnails */}
      <section className="container mx-auto py-1 -mt-8">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-4 snap-x -mx-4 px-4 md:mx-0 md:px-0 md:justify-between w-full">
          {BOTTOM_CATS.map((cat, idx) => (
            <Link
              key={idx}
              href={`/category/${cat.name.toLowerCase().replace(" ", "-")}`}
              className="group flex flex-col items-center gap-5 flex-shrink-0 snap-center outline-none"
            >
              <div className="w-[120px] h-[75px] sm:w-[150px] sm:h-[95px] xl:w-[170px] xl:h-[105px] rounded-[30px] sm:rounded-[50px] overflow-hidden  shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] group-hover:shadow-[0_8px_25px_-5px_rgba(42,71,54,0.15)] group-hover:border-[#2A4736]/30 transition-all duration-300 relative">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              </div>
              <span className="text-black-200 font-medium text-[15px] group-hover:text-[#2A4736] transition-colors uppercase tracking-widest text-[11px]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Product Section */}
      <section className="container mx-auto px-4 mb-20 animate-in fade-in duration-1000 mt-20">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-10">
          <h2 className="text-[40px] font-semibold text-[#2A4537]">
            New Product
          </h2>
          <Link
            href="/shop"
            className="text-sm font-medium text-gray-500 hover:text-[#2A4537] flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] border border-gray-100 p-6 flex flex-col animate-pulse"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-4"></div>
                <div className="h-6 bg-gray-100 rounded w-1/4 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newProducts.map((item) => (
              <Link
                href={`/product/${item._id}`}
                key={item._id}
                className="bg-white rounded-[20px] border border-gray-100 p-6 flex flex-col group transition-all hover:shadow-xl relative overflow-hidden"
              >
                <div className="relative aspect-square mb-6 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.images[0] || "https://via.placeholder.com/400"}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="text-[14px] text-[#C5A028] font-medium mb-1 truncate">
                  {item.category}
                </span>
                <h3 className="font-bold text-[15px] text-[#2A4537] mb-2 truncate group-hover:text-[#2A4736] transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-[#2A4537] text-[15px]">
                    ₹{item.price.toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => addToCart(e, item)}
                    className="h-9 w-9 rounded-full bg-[#2A4736] flex items-center justify-center text-white"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* OUR WORKS Slider Section */}
      <section className="bg-[#2A4537] py-24 mb-20 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-20">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-[300px]">
              <p className="text-gray-400 text-[15px] leading-relaxed font-light">
                Cezore combination of statement and simplistic style helps
                create a look that's as unique as you are
              </p>
            </div>
            <div className="flex-1 text-center md:text-right">
              <h2 className="text-[#C5A028] text-[60px] md:text-[80px] lg:text-[100px] font-black tracking-tighter leading-none m-0 uppercase">
                OUR WORKS
              </h2>
            </div>
          </div>

          {/* Slider Area */}
          <div className="relative group">
            <div className="embla overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex -ml-6 cursor-grab active:cursor-grabbing">
                {WORKS_DATA.map((work, idx) => (
                  <div
                    key={work.id}
                    className="embla__slide flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_28%] xl:flex-[0_0_25%] min-w-0 pl-6"
                  >
                    <div
                      className={`relative h-[480px] md:h-[550px] lg:h-[600px] rounded-[40px] overflow-hidden group/card shadow-2xl transition-transform duration-500 hover:scale-[1.02] ${idx % 2 === 0 ? "mt-0" : "mt-12"
                        }`}
                    >
                      <Image
                        src={work.image}
                        alt={work.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>

                      {/* Badge */}
                      <div className="absolute top-6 left-6">
                        <span className="bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                          {work.category}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="absolute bottom-10 left-10 right-10">
                        <h3 className="text-white text-[20px] md:text-[24px] font-bold leading-tight tracking-tight uppercase">
                          {work.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Area */}
          <div className="flex items-center justify-center gap-4 mt-16">
            <button
              onClick={scrollPrev}
              className="h-14 w-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              className="h-14 w-14 rounded-full border border-white/10 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-10">
          <h2 className="text-[40px] font-semibold text-[#2A4537]">
            Trending Products
          </h2>
          <Link
            href="/shop"
            className="text-sm font-medium text-gray-500 hover:text-[#2A4537] flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] border border-gray-100 p-6 flex flex-col animate-pulse"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-4"></div>
                <div className="h-6 bg-gray-100 rounded w-1/4 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((item) => (
              <Link
                href={`/product/${item._id}`}
                key={item._id}
                className="bg-white rounded-[20px] border border-gray-100 p-6 flex flex-col group transition-all hover:shadow-xl relative overflow-hidden"
              >
                <div className="relative aspect-square mb-6 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.images[0] || "https://via.placeholder.com/400"}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="text-[14px] text-[#C5A028] font-medium mb-1 truncate">
                  {item.stone || item.category}
                </span>
                <h3 className="font-bold text-[15px] text-[#2A4537] mb-2 truncate group-hover:text-[#2A4736] transition-colors">
                  {item.title}
                </h3>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-[#2A4537] text-[15px]">
                    ₹{item.price.toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => addToCart(e, item)}
                    className="h-9 w-9 rounded-full bg-[#2A4736] flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
                  >
                    <ShoppingBag
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Dazzle In Every Moment Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-10">
          <h2 className="text-[40px] font-bold text-[#2A4537] tracking-tight">
            Dazzle In Every Moment
          </h2>
          <Link
            href="/shop"
            className="text-sm font-medium text-gray-500 hover:text-[#2A4537] flex items-center gap-1 group"
          >
            Shop Now{" "}
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Card 1: Horizontal with internal image */}
          <div className="bg-[#f3f4f6]/80 rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 group min-h-[450px]">
            <div className="w-full md:w-[60%] relative h-[550px] rounded-[32px] overflow-hidden flex-shrink-0 shadow-sm border-4 border-white/20">
              <Image
                src="/images/AestheticJew.jpeg"
                alt="Ancient jewelry collection 1"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="flex flex-col justify-center max-w-[340px]">
              <h3 className="text-[36px] lg:text-[42px] font-bold text-[#2A4537] leading-[1.1] mb-6">
                Ancient Jewellery Collection
              </h3>
              <p className="text-gray-500 text-[16px] mb-10 leading-relaxed font-light">
                beautiful long earrings with opal and carnelian earrings are
                light in weight.
              </p>
              <Link
                href="/shop"
                className="bg-[#2D4A3E] hover:bg-[#1E3328] text-white rounded-full px-10 py-4 font-semibold text-sm w-fit flex items-center gap-3 transition-all hover:gap-4 shadow-lg group/btn"
              >
                Explore <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Vertical with content on top */}
          <div className="bg-[#f3f4f6]/80 rounded-[40px] p-8 md:p-10 flex flex-col justify-between group min-h-[450px]">
            <div className="flex flex-col mb-10">
              <h3 className="text-[36px] lg:text-[42px] font-bold text-[#2A4537] leading-[1.1] mb-6 max-w-[400px]">
              Ancient Jewellery Collection
              </h3>
              <p className="text-gray-500 text-[16px] mb-10 leading-relaxed font-light max-w-[400px]">
                beautiful long earrings with opal and carnelian earrings are
                light in weight.
              </p>
              <Link
                href="/shop"
                className="bg-[#2D4A3E] hover:bg-[#1E3328] text-white rounded-full px-10 py-4 font-semibold text-sm w-fit flex items-center gap-3 transition-all hover:gap-4 shadow-lg group/btn"
              >
                Shop Now <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative w-full h-[280px] rounded-[32px] overflow-hidden shadow-sm border-4 border-white/20">
              <Image
                src="/images/Asthetic3.jpeg"
                alt="Ancient jewelry collection 2"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our News & Updates Section */}
      <section className="container mx-auto px-4 mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-[32px] md:text-[42px] font-bold text-gray-900 tracking-tight">
            Our News & Updates
          </h2>
          <Link
            href="/blog"
            className="text-[15px] font-semibold text-gray-900 hover:text-[#2A4537] flex items-center gap-1 transition-colors"
          >
            Shop Now <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.length > 0 ? (
            blogs.map((post) => (
              <div
                key={post._id}
                className="flex flex-col bg-[#F8F9FA] rounded-[32px] p-5 group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-[1.3/1] rounded-[24px] overflow-hidden relative mb-6">
                  <Image
                    src={
                      post.images[0] ||
                      "https://images.unsplash.com/photo-1573408302355-4e0b7cb3982e?auto=format&fit=crop&q=80&w=800"
                    }
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="px-1 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-gray-500 text-[13px] font-medium mb-3">
                    <span className="tracking-tight">{post.category}</span>
                    <span className="tracking-tight">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="text-[20px] md:text-[22px] font-extrabold text-gray-900 mb-4 group-hover:text-[#2A4736] transition-colors leading-[1.2]">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-2 font-medium">
                    {post.excerpt || (post.description ? post.description.replace(/<[^>]*>?/gm, "").substring(0, 120) + "..." : "No description available.")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-20 bg-gray-50 rounded-[32px] border border-gray-100 border-dashed">
              <p className="text-gray-400 font-medium italic">
                Our latest chronicles are being curated. Stay tuned.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-[40px] font-bold text-[#2A4537]">Gallery</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px]">
          {/* Tall Item */}
          <div className="row-span-2 relative rounded-[24px] overflow-hidden group">
            <Image
              src={GALLERY_IMAGES[0]}
              alt="Gallery 1"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          {/* Square Item */}
          <div className="relative rounded-[24px] overflow-hidden group">
            <Image
              src={GALLERY_IMAGES[1]}
              alt="Gallery 2"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="relative rounded-[24px] overflow-hidden group">
            <Image
              src={GALLERY_IMAGES[2]}
              alt="Gallery 3"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          {/* Tall Item */}
          <div className="row-span-2 relative rounded-[24px] overflow-hidden group">
            <Image
              src={GALLERY_IMAGES[3]}
              alt="Gallery 4"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          {/* Wide Item */}
          <div className="col-span-2 relative rounded-[24px] overflow-hidden group">
            <Image
              src={GALLERY_IMAGES[4]}
              alt="Gallery 5"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="relative rounded-[24px] overflow-hidden group">
            <Image
              src={GALLERY_IMAGES[5]}
              alt="Gallery 6"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="relative rounded-[24px] overflow-hidden group">
            <Image
              src={GALLERY_IMAGES[6]}
              alt="Gallery 7"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="col-span-2 relative rounded-[24px] overflow-hidden group">
            <Image
              src={GALLERY_IMAGES[4]}
              alt="Gallery 5"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* Stay Informed Section */}
      {/* <section className="relative h-[480px] flex items-center justify-center overflow-hidden mb-20">
        <Image
          src="/images/Asthetic3.jpeg"
          alt="Stay Informed Background"
          fill
          className="object-cover brightness-[0.4]"
        />
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
          <h2 className="text-white text-[32px] md:text-[42px] lg:text-[54px] font-bold mb-4 tracking-tight">
            Stay Informed with Our
          </h2>
          <h3 className="text-white text-[32px] md:text-[42px] lg:text-[54px] font-bold mb-12 tracking-tight">
            Latest News and Updates!
          </h3>

          <div className="w-full max-w-2xl relative">
            <input
              type="email"
              placeholder="Enter Your Email"
              className="w-full bg-white rounded-full py-5 px-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2A4736]"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-[#2A4736] hover:bg-[#1f3628] text-white px-10 rounded-full font-bold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section> */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
