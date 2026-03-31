"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  Mail,
  Facebook,
  Twitter,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

export default function BlogPostDetail() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/${params.id}`);
      const data = await response.json();
      if (data.blog) {
        setBlog(data.blog);
        fetchRelatedBlogs(data.blog.category);
      } else {
        router.push("/blog");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      router.push("/blog");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (category) => {
    try {
      const response = await fetch(`/api/blogs?limit=4`);
      const data = await response.json();
      // Filter out current blog
      setRelatedBlogs(
        (data.blogs || []).filter((b) => b._id !== params.id).slice(0, 3)
      );
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A4736]"></div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* 1. Immersive Header */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <Image
          src={
            blog.images?.[0] ||
            "https://images.unsplash.com/photo-1573408302355-4e0b7cb3982e?auto=format&fit=crop&q=80&w=1600"
          }
          alt={blog.title}
          fill
          className="object-cover animate-in fade-in duration-1000 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-16 md:pb-24">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 text-sm font-bold uppercase tracking-widest transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
              Back to Chronicles
            </Link>
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center gap-4 text-[#C5A028] text-xs font-black uppercase tracking-[0.4em]">
                <span>{blog.category}</span>
                <span className="h-4 w-[1px] bg-white/20"></span>
                <span>10 Min Read</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-bold text-white leading-[1.1] tracking-tighter animate-in slide-in-from-bottom duration-1000">
                {blog.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Article Content Section */}
      <div className="container mx-auto px-4 mt-[-80px] relative z-10">
        <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Sticky Social/Meta */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-32 space-y-12">
              <div className="space-y-4 pt-16">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black-400">
                  Written By
                </h4>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#1d3526] flex items-center justify-center text-gold font-bold">
                    
                  </div>
                  <div className="text-gray-900 font-bold">
                    Cezore Editorial
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black-400">
                  Story Published
                </h4>
                <div className="flex items-center gap-3 text-black-600">
                  <Calendar className="h-5 w-5 text-black-400" />
                  <span className="text-sm font-medium">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-10">
                {[Facebook, Twitter, Mail, Share2].map((Icon, idx) => (
                  <button
                    key={idx}
                    className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#2A4736] hover:text-white transition-all shadow-sm"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right: Main Body */}
          <main className="lg:col-span-9">
            <div className="max-w-3xl prose prose-lg prose-gray">
              {/* Excerpt with special styling */}
              <p className="text-2xl md:text-3xl text-gray-900 font-light italic leading-relaxed border-l-4 border-gold pl-8 py-4 mb-16 animate-in slide-in-from-left duration-1000 delay-200">
                "{blog.excerpt}"
              </p>

              {/* Main Description (split into paragraphs) */}
              <div className="space-y-8 text-gray-600 text-lg leading-[1.8] font-medium font-sans">
                {blog.description
                  .split("\n")
                  .map((para, i) => para.trim() && <p key={i}>{para}</p>)}

                {/* Decorative Multi-image section if more than 1 image */}
                {blog.images && blog.images.length > 1 && (
                  <div className="grid grid-cols-2 gap-4 my-16 h-[400px]">
                    <div className="relative h-full rounded-[24px] overflow-hidden">
                      <Image
                        src={blog.images[1]}
                        alt="Gallery 1"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {blog.images[2] && (
                      <div className="relative h-full rounded-[24px] overflow-hidden">
                        <Image
                          src={blog.images[2]}
                          alt="Gallery 2"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                <p>
                  In the vast landscape of artisanal jewelry, Cezore continues
                  to define standards that transcend trends. We believe that
                  true luxury is not just seen, but felt—through the precision
                  of a master's touch and the clarity of a flawlessly cut stone.
                </p>

                <blockquote className="my-16 bg-[#f9fafb] p-12 rounded-[32px] relative overflow-hidden border border-gray-100 text-center italic text-xl text-gray-900 group">
                  "Every gemstone reflects a story millions of years in the
                  making. We simply provide the frame."
                  {/* Abstract background */}
                  <Bookmark className="absolute -top-4 -right-4 h-24 w-24 text-gold/5" />
                </blockquote>

                <p>
                  As we move into a new season of design, we invite you to
                  explore these narratives further. Whether it's the history of
                  our signature casting or the sustainability behind our
                  recycled gold—true elegance always has a story to tell.
                </p>
              </div>

              {/* Tags/Categories bottom */}
              <div className="pt-16 mt-16 border-t border-gray-100 flex flex-wrap gap-3">
                {["Luxury", blog.category, "Handcrafted", "Bespoke"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1 rounded-full bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest border border-gray-100"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 3. Related Narrative Section */}
      <section className="mt-32 pt-24 bg-[#f9fafb]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              More Cezore Narratives
            </h2>
            <Link
              href="/blog"
              className="text-gold font-bold flex items-center gap-2 hover:underline transition-all"
            >
              View All Stories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {relatedBlogs.map((p, idx) => (
              <Link key={p._id} href={`/blog/${p._id}`} className="group">
                <div className="space-y-6">
                  <div className="aspect-[16/10] rounded-[24px] overflow-hidden relative shadow-sm">
                    <Image
                      src={
                        p.images?.[0] ||
                        "https://images.unsplash.com/photo-1626784215021-2e39ccf541e5?auto=format&fit=crop&q=80&w=800"
                      }
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A028]">
                      {p.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#2A4736] transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
