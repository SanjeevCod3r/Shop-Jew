"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Heart,
  Star,
  ShoppingCart,
  ChevronLeft,
  Truck,
  RefreshCcw,
  ShieldCheck,
  Gem,
  Ruler,
  Tag,
  Layers,
  Package,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore, useCartStore } from "@/lib/store";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { setCart } = useCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      if (data.product) {
        setProduct(data.product);
        if (data.product.category) {
          fetchRelatedProducts(data.product.category);
        }
      } else {
        toast.error("Product not found");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Error loading product details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await fetch(
        `/api/products?category=${category}&limit=5`
      );
      const data = await response.json();
      setRelatedProducts(
        (data.products || []).filter((p) => p._id !== params.id)
      );
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const buyNow = async () => {
    if (!token) {
      toast.error("Please login to purchase");
      router.push("/login");
      return;
    }
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          size: selectedSize ? String(selectedSize) : null,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data.cart?.items || []);
        router.push("/checkout");
      } else {
        toast.error(data.error || "Failed to process Buy Now");
      }
    } catch (error) {
      toast.error("Error processing Buy Now");
    }
  };

  const addToCart = async () => {
    if (!token) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          size: selectedSize ? String(selectedSize) : null,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("MASTERPIECE ADDED TO VAULT");
        setCart(data.cart?.items || []);
      } else {
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Error adding to cart");
    }
  };

  const hasSizes =
    product?.ringSizes?.length > 0 ||
    product?.category?.toLowerCase().includes("ring");

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A028]"></div>
      </div>
    );
  }

  if (!product) return null;

  const displayImages =
    product.images.length > 0
      ? product.images
      : ["https://via.placeholder.com/600"];

  const displaySizes =
    product.ringSizes && product.ringSizes.length > 0
      ? product.ringSizes
      : [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];

  // Build spec rows from product fields
  const specItems = [
    { icon: Tag, label: "SKU", value: product.sku || product._id.slice(-8).toUpperCase() },
    { icon: Gem, label: "Stone / Gem", value: product.stone || "—" },
    { icon: Layers, label: "Primary Metal", value: product.material || "—" },
    { icon: Package, label: "Design", value: product.design || "—" },
    { icon: ShoppingCart, label: "Set / Collection", value: product.set || "Individual Piece" },
    { icon: Ruler, label: "Category", value: product.category },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center text-sm text-gray-400 gap-2">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/category/${product.category.toLowerCase()}`}
            className="hover:text-black"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-600 truncate">{product.title}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Images */}
          <div className="flex flex-col-reverse md:flex-row gap-8">
            {displayImages.length > 1 && (
              <div className="flex flex-row md:flex-col gap-4 min-w-[100px] animate-in fade-in slide-in-from-left-4 duration-1000">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-24 h-24 rounded-[24px] overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === idx
                        ? "border-[#C5A028] scale-105 shadow-xl shadow-[#C5A028]/20"
                        : "border-gray-100 bg-white hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Angle ${idx + 1}`}
                      fill
                      className="object-contain p-3"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 relative aspect-[4/5] rounded-[40px] overflow-hidden bg-[#FDFDFD] border border-gray-100 group shadow-lg animate-in fade-in duration-1000">
              <Image
                src={displayImages[selectedImage]}
                alt={product.title}
                fill
                className="w-full h-full object-contain p-12 transition-all duration-700 group-hover:scale-105"
                priority
              />
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className="absolute top-8 right-8 h-14 w-14 rounded-full bg-white/90 backdrop-blur-md border border-gray-100 flex items-center justify-center transition-all shadow-xl active:scale-90 group/heart"
              >
                <Heart
                  className={`h-6 w-6 transition-colors ${
                    wishlisted ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/heart:text-red-500"
                  }`}
                />
              </button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {displayImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 transition-all duration-500 rounded-full ${
                      selectedImage === idx ? "w-8 bg-[#C5A028]" : "w-2 bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              {/* Category / Stone badge */}
              <span className="text-[#8e8e8e] text-sm font-medium mb-2 block">
                {product.stone ? `${product.stone} · ` : ""}{product.category}
              </span>

              <h1 className="text-[28px] lg:text-[34px] font-bold text-gray-900 leading-tight mb-3">
                {product.title}
              </h1>

              {/* Stars + SKU */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#FFB800] text-[#FFB800]" />
                  ))}
                </div>
                <span className="text-gray-400 text-sm font-mono">
                  SKU: {product.sku || product._id.slice(-8).toUpperCase()}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[32px] font-bold text-[#2A4736]">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-gray-400 line-through text-lg">
                  ₹{(product.price * 1.5).toLocaleString()}
                </span>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">33% OFF</span>
              </div>

              {/* Quick Spec Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {product.material && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-[#2A4736]/8 text-[#2A4736] px-3 py-1.5 rounded-full border border-[#2A4736]/20">
                    <Layers className="h-3 w-3" /> {product.material}
                  </span>
                )}
                {product.stone && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">
                    <Gem className="h-3 w-3" /> {product.stone}
                  </span>
                )}
                {product.design && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">
                    <Package className="h-3 w-3" /> {product.design}
                  </span>
                )}
                {product.set && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200">
                    <Tag className="h-3 w-3" /> {product.set}
                  </span>
                )}
              </div>

              {/* Ring Size Selector */}
              {hasSizes && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-[#C5A028]" />
                      Select Size
                      {selectedSize && (
                        <span className="ml-2 text-[#2A4736] font-black">
                          — Size {selectedSize} Selected
                        </span>
                      )}
                    </label>
                    <button className="text-xs font-bold underline text-gray-500 underline-offset-4">
                      Size Chart
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {displaySizes.map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setSelectedSize(selectedSize === size ? null : size)
                        }
                        className={`h-10 px-4 rounded-lg border-2 font-medium text-sm transition-all ${
                          selectedSize === size
                            ? "border-[#2A4736] bg-[#2A4736] text-white shadow-lg scale-105"
                            : "border-gray-100 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {!selectedSize && (
                    <p className="text-xs text-amber-600 font-medium mt-2">
                      ⚠ Please select a size before adding to cart
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 mb-10">
                <button
                  className={`h-20 bg-[#2A4537] hover:bg-[#C5A028] text-white hover:text-[#111] rounded-[20px] font-black text-[18px] uppercase tracking-[0.3em] flex items-center justify-center transition-all shadow-2xl active:scale-[0.98] ${
                    product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={buyNow}
                  disabled={product.stock === 0}
                >
                  Buy Now
                </button>
                <button
                  className="w-full h-16 bg-transparent border-2 border-gray-100 hover:border-[#C5A028] text-[#111] rounded-[24px] font-black text-[13px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                  onClick={addToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Vault"}
                </button>
              </div>

              {/* Order Info Panel — shows selected size */}
              <div className="rounded-[24px] border border-gray-100 bg-[#FDFDFD] p-6 space-y-4 shadow-sm">
                {/* Selected Size Row — always visible if sizes available */}
                {hasSizes && (
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Ruler className="h-4 w-4 text-[#C5A028]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-[11px] text-[#111] uppercase tracking-widest mb-0.5">
                        Selected Size
                      </h4>
                      {selectedSize ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[#2A4736] font-black text-base">
                            Size {selectedSize}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 font-medium italic">
                          No size chosen yet — select above
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Truck className="h-4 w-4 text-[#C5A028]" />
                  </div>
                  <div>
                    <h4 className="font-black text-[11px] text-[#111] uppercase tracking-widest mb-1">
                      Complimentary Delivery
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium italic">
                      Estimated arrival: 3–5 business days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-[#111]">
                  <RefreshCcw className="h-4 w-4 text-[#C5A028] flex-shrink-0" />
                  <span>14-Day Boutique Exchange</span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-[#111]">
                  <ShieldCheck className="h-4 w-4 text-[#C5A028] flex-shrink-0" />
                  <span>Certified Authenticity</span>
                </div>

                {/* Stock indicator */}
                <div className="pt-2 border-t border-gray-100">
                  <p className={`text-[11px] font-black uppercase tracking-widest ${product.stock > 5 ? "text-green-600" : product.stock > 0 ? "text-amber-600" : "text-red-500"}`}>
                    {product.stock > 5
                      ? `✓ In Stock (${product.stock} available)`
                      : product.stock > 0
                      ? `⚠ Only ${product.stock} left`
                      : "✕ Out of Stock"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Tabs */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <div className="flex gap-10 mb-10 overflow-x-auto pb-2">
            {["description", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[15px] font-bold pb-2 transition-all whitespace-nowrap capitalize ${
                  activeTab === tab
                    ? "text-gray-900 border-b-2 border-[#2A4736]"
                    : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-4 text-gray-600 leading-relaxed max-w-2xl">
                <p className="text-base">{product.description}</p>
                <p className="text-sm">
                  Exquisite craftsmanship meets timeless design. This piece is
                  specifically curated from our Cezore collection to bring a
                  touch of sophistication to your jewelry ensemble.
                </p>
              </div>
              {/* Mini spec preview beside description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {specItems.map(({ icon: Icon, label, value }) =>
                  value && value !== "—" ? (
                    <div
                      key={label}
                      className="flex items-center justify-between border-b border-gray-50 pb-3"
                    >
                      <span className="text-gray-400 font-medium text-sm flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" /> {label}:
                      </span>
                      <span className="font-bold text-gray-800 text-sm">{value}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="max-w-3xl">
              <div className="rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#2A4736] text-white">
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest w-1/2">
                        Attribute
                      </th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-gray-500 flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-[#C5A028]" /> SKU
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-900 font-mono">
                        {product.sku || product._id.slice(-8).toUpperCase()}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-gray-500">
                        <span className="flex items-center gap-2"><Gem className="h-3.5 w-3.5 text-[#C5A028]" /> Stone / Gem</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-900">
                        {product.stone || "—"}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-gray-500">
                        <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-[#C5A028]" /> Primary Metal</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-900">
                        {product.material || "—"}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-gray-500">
                        <span className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-[#C5A028]" /> Design Style</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-900">
                        {product.design || "—"}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-gray-500">
                        <span className="flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-[#C5A028]" /> Set / Collection</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-900">
                        {product.set || "Individual Piece"}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-gray-500">
                        <span className="flex items-center gap-2"><Ruler className="h-3.5 w-3.5 text-[#C5A028]" /> Available Sizes</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-900">
                        {product.ringSizes && product.ringSizes.length > 0
                          ? product.ringSizes.join(", ")
                          : "One Size"}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-gray-500">Category</td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-900">{product.category}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-gray-500">Stock</td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-900">{product.stock} units</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <p className="text-gray-500 text-sm italic">
              No reviews yet for this product. Be the first to share your
              thoughts!
            </p>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-[32px] font-bold text-gray-900">
                You may also like
              </h2>
              <div className="flex gap-4">
                <button className="h-12 w-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button className="h-12 w-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {relatedProducts.map((p) => (
                <Link key={p._id} href={`/product/${p._id}`} className="group">
                  <div className="bg-white rounded-[20px] p-4 border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1">
                    <div className="relative aspect-square mb-4 rounded-[12px] overflow-hidden bg-gray-50 p-4">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="font-bold text-[14px] text-gray-900 line-clamp-1 mb-1 group-hover:text-[#2A4736] transition-colors">
                      {p.title}
                    </h3>
                    {p.stone && (
                      <p className="text-[11px] text-gray-400 mb-1">{p.stone}</p>
                    )}
                    <span className="font-bold text-[16px] text-[#2c3e34]">
                      ₹{p.price.toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
