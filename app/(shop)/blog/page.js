"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, ArrowLeft, Bookmark } from "lucide-react";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "News",
    "Styling Tips",
    "Jewelry Care",
    "Brand Story",
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blogs?limit=20"); // Get more for the list page
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === selectedCategory);

  // Featured blog is the newest one
  const featuredBlog = blogs[0];
  const otherBlogs = filteredBlogs.filter((b) => b._id !== featuredBlog?._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A4736]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-24">
      {/* 1. Page Header */}
      <section className="bg-[#f9fafb] py-20 border-b border-gray-100 mb-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-gold uppercase tracking-[0.4em] text-xs font-black mb-6 block animate-in fade-in slide-in-from-bottom duration-700">
            The Chronicles
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-[#2A4537] leading-tight tracking-tighter animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            Brand Narratives & <br /> Styling Guides
          </h1>
          <div className="max-w-2xl mx-auto mt-8 flex flex-wrap justify-center gap-4 animate-in fade-in duration-1000 delay-400">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat
                  ? "bg-[#2A4736] text-white border-[#2A4736] shadow-lg"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#2A4736] hover:text-[#2A4736]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* 2. Featured Post (Highlighted only if 'All' category is selected) */}
        {selectedCategory === "All" && featuredBlog && (
          <section className="mb-24 animate-in fade-in duration-1000">
            <Link href={`/blog/${featuredBlog._id}`} className="group">
              <div className="relative h-[400px] md:h-[600px] rounded-[40px] overflow-hidden shadow-2xl">
                <Image
                  src={
                    featuredBlog.images?.[0] ||
                    "https://images.unsplash.com/photo-1573408302355-4e0b7cb3982e?auto=format&fit=crop&q=80&w=1200"
                  }
                  alt={featuredBlog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-4xl text-white">
                  <div className="flex items-center gap-4 mb-4 text-xs font-bold uppercase tracking-widest text-[#C5A028]">
                    <span>Featured Story</span>
                    <span className="h-4 w-[1px] bg-white/20"></span>
                    <span>{featuredBlog.category}</span>
                  </div>
                  <h2 className="text-3xl text-[#C5A028] md:text-5xl font-bold mb-6 leading-[1.1]">
                    {featuredBlog.title}
                  </h2>
                  <p className="text-gray-200 text-lg md:text-xl font-light mb-8 line-clamp-2 max-w-2xl">
                    {featuredBlog.excerpt}
                  </p>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 text-lg text-gray-300">
                      <Calendar className="h-4 w-4" />{" "}
                      {new Date(featuredBlog.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2 text-lg text-gray-300 font-bold group-hover:text-white transition-colors">
                      Read Full Narrative{" "}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* 3. Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {otherBlogs.length > 0
            ? otherBlogs.map((post, idx) => (
              <article
                key={post._id}
                className="group animate-in fade-in slide-in-from-bottom duration-700"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <Link href={`/blog/${post._id}`}>
                  <div className="aspect-[4/3] rounded-[32px] overflow-hidden relative mb-8 shadow-sm">
                    <Image
                      src={
                        post.images?.[0] ||
                        "https://images.unsplash.com/photo-1601121141461-9d6647268892?auto=format&fit=crop&q=80&w=800"
                      }
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm text-black px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {post.category}
                    </div>
                  </div>
                  <div className="space-y-4 px-2">
                    <div className="flex items-center gap-4 text-xs font-bold text-[#C5A028] uppercase tracking-widest">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                      <span>8 Min Read</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#2A4537] group-hover:text-[#2A4736] transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-black-500 text-sm line-clamp-3 leading-relaxed">
                      {post.excerpt || post.description}
                    </p>
                    <div className="pt-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-[#2A4736] group-hover:underline transition-all">
                        Read More <ArrowRight className="h-4 w-4" />
                      </span>
                      <Bookmark className="h-4 w-4 text-gray-300 group-hover:text-gold transition-colors" />
                    </div>
                  </div>
                </Link>
              </article>
            ))
            : selectedCategory !== "All" && (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-2xl font-bold text-gray-400">
                  No narratives found in this category.
                </h3>
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="mt-4 text-[#2A4736] font-bold underline underline-offset-8"
                >
                  Return to All Stories
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
