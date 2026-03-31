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
  Clock,
  Plus,
  Minus,
} from "lucide-react";
import { useAuthStore, useCartStore } from "@/lib/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      // Filter out the current product
      setRelatedProducts(
        (data.products || []).filter((p) => p._id !== params.id)
      );
    } catch (error) {
      console.error("Error fetching related products:", error);
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
          size: selectedSize,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Added to cart!");
        setCart(data.cart?.items || []);
      } else {
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Error adding to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A4736]"></div>
      </div>
    );
  }

  if (!product) return null;

  // Fallback images if none exist
  const displayImages =
    product.images.length > 0
      ? product.images
      : ["https://via.placeholder.com/600"];

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
          {/* Left Column: Images */}
          <div className="flex flex-col-reverse md:flex-row gap-5">
            {/* Thumbnail list */}
            <div className="flex flex-row md:flex-col gap-3 min-w-[80px]">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                    ? "border-[#2A4736]"
                    : "border-gray-100 hover:border-gray-300"
                    }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} view ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1 relative aspect-square rounded-[24px] overflow-hidden bg-gray-50 border border-gray-100 group">
              <Image
                src={displayImages[selectedImage]}
                alt={product.title}
                width={600}
                height={600}
                className="w-full h-full object-contain p-8"
              />
              <button className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-sm">
                <Heart className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <span className="text-[#8e8e8e] text-sm font-medium mb-2 block">
                {product.stone || "Premium Jewelry"}
              </span>
              <h1 className="text-[28px] lg:text-[34px] font-bold text-gray-900 leading-tight mb-3">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[#FFB800] text-[#FFB800]"
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-sm font-mono">
                  SKU: {product.sku || product._id.slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <span className="text-[32px] font-bold text-[#2A4736]">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-gray-400 line-through text-lg">
                  ₹{(product.price * 1.5).toLocaleString()}
                </span>
              </div>

              {/* Ring Sizes - Only if category is rings or sizes exist */}
              {(product.category.toLowerCase().includes("ring") ||
                product.ringSizes?.length > 0) && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-bold text-gray-900">
                        Ring Size Women
                      </label>
                      <button className="text-xs font-bold underline text-gray-500 underline-offset-4">
                        Size Chart
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {(product.ringSizes && product.ringSizes.length > 0
                        ? product.ringSizes
                        : [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5]
                      ).map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`h-10 px-4 rounded-lg border-2 font-medium text-sm transition-all ${selectedSize === size
                            ? "border-[#2A4736] bg-[#2A4736] text-white"
                            : "border-gray-100 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                      <button className="h-10 px-6 rounded-lg border-2 border-gray-100 bg-white text-gray-700 hover:border-gray-300 font-medium text-sm">
                        More
                      </button>
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 mb-10">
                <button
                  className="w-full h-16 bg-[#006093] hover:bg-[#004e78] text-white rounded-[12px] font-bold text-lg flex items-center justify-center transition-all shadow-lg active:scale-[0.98]"
                  onClick={() => toast.success("Proceeding to checkout...")}
                >
                  Buy Now
                </button>
                <button
                  className="w-full h-16 bg-[#DFE6EA] hover:bg-[#d0dae1] text-[#006093] rounded-[12px] font-bold text-lg flex items-center justify-center transition-all active:scale-[0.98]"
                  onClick={addToCart}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>

              {/* Order Info Panel */}
              <div className="rounded-[16px] border border-gray-100 bg-gray-50/50 p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">
                      Shipping and return policies
                    </h4>
                    <p className="text-sm text-gray-500 leading-tight">
                      Order today, get it by Apr 9 - Apr 14
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 ml-auto" />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <RefreshCcw className="h-5 w-5" />
                  <span>Return and exchange up to 5 to 10 days</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Truck className="h-5 w-5" />
                  <span>Free shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Section */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <div className="flex gap-10 mb-10 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setActiveTab("description")}
              className={`text-[17px] font-bold pb-2 transition-all whitespace-nowrap ${activeTab === "description"
                ? "text-gray-900 border-b-2 border-[#2A4736]"
                : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
                }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`text-[17px] font-bold pb-2 transition-all whitespace-nowrap ${activeTab === "reviews"
                ? "text-gray-900 border-b-2 border-[#2A4736]"
                : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
                }`}
            >
              Reviews
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-6 text-gray-600 leading-relaxed max-w-2xl">
              {activeTab === "description" ? (
                <>
                  <p>{product.description}</p>
                  <p>
                    Exquisite craftsmanship meets timeless design. This piece is
                    specifically curated from our LuxeLoom collection to bring a
                    touch of sophistication to your jewelry ensemble.
                  </p>
                </>
              ) : (
                <p>
                  No reviews yet for this product. Be the first to share your
                  thoughts!
                </p>
              )}
            </div>

            <div className="space-y-4">
              {/* Spec List matches Image 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-400 font-medium">Stone:</span>
                  <span className="font-bold text-gray-800">
                    {product.stone || "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-400 font-medium">Material:</span>
                  <span className="font-bold text-gray-800">
                    {product.material || "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-400 font-medium">Design:</span>
                  <span className="font-bold text-gray-800">
                    {product.design || "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-400 font-medium">Set:</span>
                  <span className="font-bold text-gray-800">
                    {product.set || "Individual Piece"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
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
                      <Image
                        src={p.images[0]}
                        alt={p.title}
                        width={200}
                        height={200}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-2 left-2 bg-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        Free Shipping
                      </div>
                    </div>
                    <h3 className="font-bold text-[15px] text-gray-900 line-clamp-1 mb-2 group-hover:text-[#2A4736] transition-colors">
                      {p.title}
                    </h3>
                    <span className="font-bold text-[17px] text-[#2c3e34]">
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
