"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Store,
  Tag,
  ToggleLeft,
  ToggleRight,
  Star,
  Newspaper,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, token, logout, hydrated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Dashboard data
  const [stats, setStats] = useState(null);

  // Products data
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    title: "",
    description: "",
    price: "",
    images: "",
    category: "",
    stock: "",
    sku: "",
    ringSizes: "",
    stone: "",
    material: "",
    design: "",
    set: "",
  });
  const [showProductDialog, setShowProductDialog] = useState(false);

  // Orders data
  const [orders, setOrders] = useState([]);

  // Users data
  const [users, setUsers] = useState([]);

  // Coupons data
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    expiryDate: "",
  });
  const [showCouponDialog, setShowCouponDialog] = useState(false);

  // Blogs data
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogFormData, setBlogFormData] = useState({
    title: "",
    description: "",
    category: "News",
    images: "",
    excerpt: "",
  });
  const [showBlogDialog, setShowBlogDialog] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!token || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [hydrated, token, user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchProducts(),
        fetchOrders(),
        fetchUsers(),
        fetchCoupons(),
        fetchBlogs(),
      ]);
    } catch (error) {
      toast.error("Error loading admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/admin/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleAddBlog = async () => {
    try {
      const imagesArray = blogFormData.images
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);
      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...blogFormData,
          images: imagesArray,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Blog post created");
        setShowBlogDialog(false);
        resetBlogForm();
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to create blog");
      }
    } catch (error) {
      toast.error("Error creating blog");
    }
  };

  const handleUpdateBlog = async () => {
    try {
      const imagesArray = blogFormData.images
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);
      const response = await fetch(`/api/admin/blogs/${editingBlog}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...blogFormData,
          images: imagesArray,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Blog updated successfully");
        setShowBlogDialog(false);
        setEditingBlog(null);
        resetBlogForm();
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to update blog");
      }
    } catch (error) {
      toast.error("Error updating blog");
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Blog deleted");
        fetchBlogs();
      } else {
        toast.error("Failed to delete blog");
      }
    } catch (error) {
      toast.error("Error deleting blog");
    }
  };

  const openAddBlogDialog = () => {
    resetBlogForm();
    setEditingBlog(null);
    setShowBlogDialog(true);
  };

  const openEditBlogDialog = (blog) => {
    setBlogFormData({
      title: blog.title,
      description: blog.description,
      category: blog.category,
      images: blog.images.join(", "),
      excerpt: blog.excerpt || "",
    });
    setEditingBlog(blog._id);
    setShowBlogDialog(true);
  };

  const resetBlogForm = () => {
    setBlogFormData({
      title: "",
      description: "",
      category: "News",
      images: "",
      excerpt: "",
    });
  };

  const handleAddCoupon = async () => {
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponFormData.code,
          description: couponFormData.description,
          discountType: couponFormData.discountType,
          discountValue: parseFloat(couponFormData.discountValue),
          minPurchaseAmount: couponFormData.minPurchaseAmount
            ? parseFloat(couponFormData.minPurchaseAmount)
            : 0,
          maxDiscountAmount: couponFormData.maxDiscountAmount
            ? parseFloat(couponFormData.maxDiscountAmount)
            : null,
          usageLimit: couponFormData.usageLimit
            ? parseInt(couponFormData.usageLimit)
            : null,
          expiryDate: couponFormData.expiryDate || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Coupon created successfully");
        setShowCouponDialog(false);
        resetCouponForm();
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to create coupon");
      }
    } catch (error) {
      toast.error("Error creating coupon");
    }
  };

  const handleUpdateCoupon = async () => {
    try {
      const response = await fetch(`/api/admin/coupons/${editingCoupon}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponFormData.code,
          description: couponFormData.description,
          discountType: couponFormData.discountType,
          discountValue: parseFloat(couponFormData.discountValue),
          minPurchaseAmount: couponFormData.minPurchaseAmount
            ? parseFloat(couponFormData.minPurchaseAmount)
            : 0,
          maxDiscountAmount: couponFormData.maxDiscountAmount
            ? parseFloat(couponFormData.maxDiscountAmount)
            : null,
          usageLimit: couponFormData.usageLimit
            ? parseInt(couponFormData.usageLimit)
            : null,
          expiryDate: couponFormData.expiryDate || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Coupon updated successfully");
        setShowCouponDialog(false);
        setEditingCoupon(null);
        resetCouponForm();
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to update coupon");
      }
    } catch (error) {
      toast.error("Error updating coupon");
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } else {
        toast.error("Failed to delete coupon");
      }
    } catch (error) {
      toast.error("Error deleting coupon");
    }
  };

  const handleToggleCouponStatus = async (couponId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Coupon ${!currentStatus ? "activated" : "deactivated"}`);
        fetchCoupons();
      }
    } catch (error) {
      toast.error("Error updating coupon status");
    }
  };

  const openAddCouponDialog = () => {
    resetCouponForm();
    setEditingCoupon(null);
    setShowCouponDialog(true);
  };

  const openEditCouponDialog = (coupon) => {
    setCouponFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || "",
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      expiryDate: coupon.expiryDate
        ? new Date(coupon.expiryDate).toISOString().split("T")[0]
        : "",
    });
    setEditingCoupon(coupon._id);
    setShowCouponDialog(true);
  };

  const resetCouponForm = () => {
    setCouponFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minPurchaseAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      expiryDate: "",
    });
  };

  const handleAddProduct = async () => {
    try {
      const imagesArray = productFormData.images
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);
      const ringSizesArray = productFormData.ringSizes
        ? productFormData.ringSizes
          .split(",")
          .map((s) => parseFloat(s.trim()))
          .filter((n) => !isNaN(n))
        : [];

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productFormData,
          price: parseFloat(productFormData.price),
          stock: parseInt(productFormData.stock),
          images: imagesArray,
          ringSizes: ringSizesArray,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Product added successfully");
        setShowProductDialog(false);
        resetProductForm();
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to add product");
      }
    } catch (error) {
      toast.error("Error adding product");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const imagesArray = productFormData.images
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);
      const ringSizesArray = productFormData.ringSizes
        ? productFormData.ringSizes
          .split(",")
          .map((s) => parseFloat(s.trim()))
          .filter((n) => !isNaN(n))
        : [];

      const response = await fetch(`/api/admin/products/${editingProduct}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productFormData,
          price: parseFloat(productFormData.price),
          stock: parseInt(productFormData.stock),
          images: imagesArray,
          ringSizes: ringSizesArray,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Product updated successfully");
        setShowProductDialog(false);
        setEditingProduct(null);
        resetProductForm();
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to update product");
      }
    } catch (error) {
      toast.error("Error updating product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Order status updated");
        fetchOrders();
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      toast.error("Error updating order status");
    }
  };

  const openAddProductDialog = () => {
    resetProductForm();
    setEditingProduct(null);
    setShowProductDialog(true);
  };

  const openEditProductDialog = (product) => {
    setProductFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      images: product.images.join(", "),
      category: product.category,
      stock: product.stock.toString(),
      sku: product.sku || "",
      ringSizes: product.ringSizes ? product.ringSizes.join(", ") : "",
      stone: product.stone || "",
      material: product.material || "",
      design: product.design || "",
      set: product.set || "",
    });
    setEditingProduct(product._id);
    setShowProductDialog(true);
  };

  const resetProductForm = () => {
    setProductFormData({
      title: "",
      description: "",
      price: "",
      images: "",
      category: "",
      stock: "",
      sku: "",
      ringSizes: "",
      stone: "",
      material: "",
      design: "",
      set: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Confirmed":
        return "bg-blue-500";
      case "Shipped":
        return "bg-purple-500";
      case "Delivered":
        return "bg-green-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A028] mx-auto"></div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-[#111]">
            Loading Admin Management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-[#111]">
      {/* Header */}
      <header className="bg-white border-b border-white/10 shadow-1xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
             <Link
            href="/"
            className="flex items-center text-[26px] font-bold text-black"
          >
             <img src="/images/Logo2.png" alt="Cezore" className="h-8 w-15" />
           Cezore
          </Link>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 border-r border-white/10 pr-8 hidden md:block">
                Curator: <span className="text-black ml-2">{user?.name}</span>
              </span>
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent border-white/20 text-black hover:bg-black/10 hover:text-black rounded-full px-6 py-5 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Storefront
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#C5A028] border-none text-[#111] hover:bg-white rounded-full px-6 py-5 text-[10px] font-black uppercase tracking-widest transition-all"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-12"
        >
          <TabsList className="bg-white p-2 rounded-[24px] border border-[#2A4537] shadow-xl h-auto flex-wrap gap-2">
            <TabsTrigger
              value="dashboard"
              className="gap-2 rounded-[18px] px-8 py-4 data-[state=active]:bg-[#2A4537] data-[state=active]:text-white transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="gap-2 rounded-[18px] px-8 py-4 data-[state=active]:bg-[#2A4537] data-[state=active]:text-white transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="gap-2 rounded-[18px] px-8 py-4 data-[state=active]:bg-[#2A4537] data-[state=active]:text-white transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="gap-2 rounded-[18px] px-8 py-4 data-[state=active]:bg-[#2A4537] data-[state=active]:text-white transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger
              value="coupons"
              className="gap-2 rounded-[18px] px-8 py-4 data-[state=active]:bg-[#2A4537] data-[state=active]:text-white transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <Tag className="h-4 w-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger
              value="blogs"
              className="gap-2 rounded-[18px] px-8 py-4 data-[state=active]:bg-[#2A4537] data-[state=active]:text-white transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <Newspaper className="h-4 w-4" />
              Blogs
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-[32px] border border-gray-100 shadow-xl overflow-hidden group hover:border-[#C5A028] transition-all duration-500">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-[14px] font-black uppercase tracking-widest text-gray-400">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-[#C5A028]" />
                </CardHeader>
                <CardContent>
                  <div className="text-[32px] font-black text-[#2A4537] tracking-tighter">
                    ₹{stats?.stats?.totalRevenue?.toLocaleString() || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                    Certified Earnings
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border border-gray-100 shadow-xl overflow-hidden group hover:border-[#C5A028] transition-all duration-500">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-[14px] font-black uppercase tracking-widest text-gray-400">
                    Total Orders
                  </CardTitle>
                  <ShoppingCart className="h-5 w-5 text-[#C5A028]" />
                </CardHeader>
                <CardContent>
                  <div className="text-[32px] font-black text-[#2A4537]  tracking-tighter">
                    {stats?.stats?.totalOrders || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                    Luxury Placements
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border border-gray-100 shadow-xl overflow-hidden group hover:border-[#C5A028] transition-all duration-500">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-[14px] font-black uppercase tracking-widest text-gray-400">
                    Total Users
                  </CardTitle>
                  <Users className="h-5 w-5 text-[#C5A028]" />
                </CardHeader>
                <CardContent>
                  <div className="text-[32px] font-black text-[#2A4537]  tracking-tighter">
                    {stats?.stats?.totalUsers || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                    Private Members
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border border-gray-100 shadow-xl overflow-hidden group hover:border-[#C5A028] transition-all duration-500">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-[14px] font-black uppercase tracking-widest text-gray-400">
                    Inventory Size
                  </CardTitle>
                  <Package className="h-5 w-5 text-[#C5A028]" />
                </CardHeader>
                <CardContent>
                  <div className="text-[32px] font-black text-[#2A4537] tracking-tighter">
                    {stats?.stats?.totalProducts || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                    Jewelry Pieces
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Orders by Status Chart */}
              <Card className="lg:col-span-2 rounded-[48px] border border-gray-50 shadow-2xl overflow-hidden p-8">
                <CardHeader className="px-0 pt-0 mb-8">
                  <CardTitle className="text-[20px] text-[#2A4537] uppercase tracking-tighter">
                    Performance Matrix
                  </CardTitle>
                  <CardDescription className="text-lg font-medium italic">
                    Operational status of all acquisitions
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={stats?.ordersByStatus || []}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="_id"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 900,
                          textTransform: "uppercase",
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 900 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                          textTransform: "uppercase",
                          fontSize: "13px",
                          fontWeight: 900,
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#2A4537"
                        radius={[8, 8, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="rounded-[48px] border border-gray-50 shadow-2xl overflow-hidden p-8">
                <CardHeader className="px-0 pt-0 mb-8">
                  <CardTitle className="text-[20px] text-[#2A4537] uppercase tracking-tighter">
                    Recent Placements
                  </CardTitle>
                  <CardDescription className="text-xs font-medium italic">
                    Latest member activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-8">
                    {stats?.recentOrders?.slice(0, 5).map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between group"
                      >
                        <div className="space-y-1">
                          <p className="text-[13px] font-black uppercase tracking-tight">
                            {order.userId?.name}
                          </p>
                          <p className="text-[13px] text-black-300 font-medium italic">
                            {order.userId?.email}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-[15px] font-black tracking-tighter text-[#111]">
                            ₹{order.finalAmount?.toLocaleString()}
                          </div>
                          {order.discount > 0 && (
                            <div className="text-[10px] text-[#C5A028] font-bold uppercase tracking-widest mt-1">
                              Saved ₹{order.discount.toLocaleString()}
                            </div>
                          )}
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white ${getStatusColor(
                              order.status
                            )} shadow-lg`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent
            value="products"
            className="space-y-12 animate-in slide-in-from-bottom duration-700"
          >
            <div className="flex justify-between items-center bg-[#2A4537] p-3 rounded-[45px] shadow-2xl relative overflow-hidden mb-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="relative z-10">
                <h2 className="text-[20px] font-black text-white tracking-tighter uppercase leading-none mb-2">
                
                </h2>
              </div>
              <Dialog
                open={showProductDialog}
                onOpenChange={setShowProductDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={openAddProductDialog}
                    className="relative z-10 gap-3 bg-[#C5A028] hover:bg-white text-[#111] font-black uppercase tracking-widest text-[11px] px-10 py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-5 w-5" />
                    New Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[48px] border-none shadow-[0_40px_80px_rgba(0,0,0,0.2)] p-0 bg-[#FDFDFD]">
                  <DialogHeader className="p-10 bg-[#2A4537] text-white">
                    <DialogTitle className="text-[25px] font-black uppercase tracking-tighter">
                      {editingProduct
                        ? "Edit Product"
                        : "Add New Product"}
                    </DialogTitle>
                    <DialogDescription className="text-[#C5A028] text-[13px] font-black uppercase tracking-[0.4em] opacity-80">
                      {editingProduct
                        ? "Updating the specifications for this private asset"
                        : "Defining the attributes of a new luxury piece"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-12 space-y-10">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <Label
                          htmlFor="title"
                          className="text-[10px] font-black uppercase tracking-widest ml-4"
                        >
                          Title *
                        </Label>
                        <Input
                          id="title"
                          value={productFormData.title}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g. Vintage Black Carnelian Ring"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tight focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="category"
                          className="text-[10px] font-black uppercase tracking-widest ml-4"
                        >
                          Collection Category *
                        </Label>
                        <Input
                          id="category"
                          value={productFormData.category}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              category: e.target.value,
                            })
                          }
                          placeholder="Category name"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tight focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-[10px] font-black uppercase tracking-widest  ml-4"
                      >
                        Curator's Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={productFormData.description}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            description: e.target.value,
                          })
                        }
                        placeholder="The story behind this piece..."
                        rows={4}
                        className="rounded-[32px] bg-gray-50 border-gray-100 p-8 text-[13px] font-medium italic focus:ring-2 focus:ring-[#C5A028] transition-all resize-none shadow-inner"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="space-y-3">
                        <Label
                          htmlFor="price"
                          className="text-[10px] font-black uppercase tracking-widest  ml-4"
                        >
                          Valuation (₹) *
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          value={productFormData.price}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              price: e.target.value,
                            })
                          }
                          placeholder="999"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tighter focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="stock"
                          className="text-[10px] font-black uppercase tracking-widest ml-4"
                        >
                          Available Qty *
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productFormData.stock}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              stock: e.target.value,
                            })
                          }
                          placeholder="100"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tight focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="sku"
                          className="text-[10px] font-black uppercase tracking-widest  ml-4"
                        >
                          Private SKU
                        </Label>
                        <Input
                          id="sku"
                          value={productFormData.sku}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              sku: e.target.value,
                            })
                          }
                          placeholder="e.g. LUX-001"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tight focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="material"
                          className="text-[10px] font-black uppercase tracking-widest  ml-4"
                        >
                          Primary Metal
                        </Label>
                        <Input
                          id="material"
                          value={productFormData.material}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              material: e.target.value,
                            })
                          }
                          placeholder="e.g. Silver, Gold"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tight focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label
                            htmlFor="stone"
                            className="text-[10px] font-black uppercase tracking-widest ml-4"
                          >
                            Gemstone Specs
                          </Label>
                          <Input
                            id="stone"
                            value={productFormData.stone}
                            onChange={(e) =>
                              setProductFormData({
                                ...productFormData,
                                stone: e.target.value,
                              })
                            }
                            placeholder="e.g. Black Carnelian, Diamond"
                            className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tight focus:ring-2 focus:ring-[#C5A028] transition-all"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label
                            htmlFor="design"
                            className="text-[10px] font-black uppercase tracking-widest ml-4"
                          >
                            Design Language
                          </Label>
                          <Input
                            id="design"
                            value={productFormData.design}
                            onChange={(e) =>
                              setProductFormData({
                                ...productFormData,
                                design: e.target.value,
                              })
                            }
                            placeholder="e.g. Vintage, Tribal"
                            className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tight focus:ring-2 focus:ring-[#C5A028] transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="ringSizes"
                          className="text-[10px] font-black uppercase tracking-widest ml-4"
                        >
                          Tailored Sizes (Sizes: x, y, z)
                        </Label>
                        <div className="rounded-[32px] bg-gray-50 border border-gray-100 p-8 space-y-6 shadow-inner">
                          <Input
                            id="ringSizes"
                            value={productFormData.ringSizes}
                            onChange={(e) =>
                              setProductFormData({
                                ...productFormData,
                                ringSizes: e.target.value,
                              })
                            }
                            placeholder="e.g. 5, 6, 7"
                            className="rounded-xl bg-white border-gray-100 p-4 text-[13px] font-black tracking-tight focus:ring-2 focus:ring-[#C5A028]"
                          />
                          <div className="flex flex-wrap gap-2">
                            {["5", "5.5", "6", "6.5", "7", "7.5", "8"].map(
                              (size) => (
                                <Button
                                  key={size}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 border-gray-100 text-[10px] font-black rounded-full hover:bg-[#C5A028] hover:text-[#111] hover:border-transparent transition-all"
                                  onClick={() => {
                                    const current = productFormData.ringSizes
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter((s) => s);
                                    if (!current.includes(size)) {
                                      setProductFormData({
                                        ...productFormData,
                                        ringSizes: [...current, size].join(
                                          ", "
                                        ),
                                      });
                                    }
                                  }}
                                >
                                  {size}
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-1 space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest  mb-3 block">
                        Masterpiece Visuals
                      </Label>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                            Main Reveal (Primary Image)
                          </Label>
                          <Input
                            placeholder="Primary image URL"
                            value={
                              productFormData.images.split(",")[0]?.trim() || ""
                            }
                            onChange={(e) => {
                              const imgs = productFormData.images
                                .split(",")
                                .map((s) => s.trim());
                              imgs[0] = e.target.value;
                              setProductFormData({
                                ...productFormData,
                                images: imgs.filter((img) => img).join(", "),
                              });
                            }}
                            className="rounded-[16px] border-gray-100 focus:border-[#C5A028] transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                            Angle 2 (Side View)
                          </Label>
                          <Input
                            placeholder="Second image URL"
                            value={
                              productFormData.images.split(",")[1]?.trim() || ""
                            }
                            onChange={(e) => {
                              const imgs = productFormData.images
                                .split(",")
                                .map((s) => s.trim());
                              imgs[1] = e.target.value;
                              setProductFormData({
                                ...productFormData,
                                images: imgs.filter((img) => img).join(", "),
                              });
                            }}
                            className="rounded-[16px] border-gray-100 focus:border-[#C5A028] transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                            Angle 3 (Detail View)
                          </Label>
                          <Input
                            placeholder="Third image URL"
                            value={
                              productFormData.images.split(",")[2]?.trim() || ""
                            }
                            onChange={(e) => {
                              const imgs = productFormData.images
                                .split(",")
                                .map((s) => s.trim());
                              imgs[2] = e.target.value;
                              setProductFormData({
                                ...productFormData,
                                images: imgs.filter((img) => img).join(", "),
                              });
                            }}
                            className="rounded-[16px] border-gray-100 focus:border-[#C5A028] transition-all"
                          />
                        </div>
                      </div>
                      <p className="text-[9px] text-[#C5A028] font-bold uppercase tracking-[0.2em] mt-3">
                        High-resolution imagery advised for luxurious detail.
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="p-12 bg-gray-50 border-t border-gray-100 rounded-b-[48px]">
                    <Button
                      variant="outline"
                      onClick={() => setShowProductDialog(false)}
                      className="rounded-full px-10 py-7 text-[11px] font-black uppercase tracking-widest border-gray-200 hover:bg-[#2A4537] hover:text-white transition-all"
                    >
                      Discard
                    </Button>
                    <Button
                      onClick={
                        editingProduct ? handleUpdateProduct : handleAddProduct
                      }
                      className="bg-[#2A4537] hover:bg-[#C5A028] text-white rounded-full px-12 py-7 text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all"
                    >
                      {editingProduct ? "Commit Changes" : "Initialize Piece"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map((product) => (
                <Card
                  key={product._id}
                  className="rounded-[40px] border border-gray-100 shadow-xl overflow-hidden group transition-all duration-700 hover:border-[#C5A028] flex flex-col h-full bg-white"
                >
                  <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden flex items-center justify-center p-12">
                    <img
                      src={
                        product.images[0] || "https://via.placeholder.com/400"
                      }
                      alt={product.title}
                      className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <Badge className="bg-white/90 backdrop-blur-md text-[#111] text-[9px] font-black px-4 py-2 rounded-full border border-gray-100 uppercase tracking-widest shadow-lg">
                        {product.category}
                      </Badge>
                      {product.stock <= 5 && (
                        <Badge className="bg-red-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                          Critical Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-[#C5A028] text-[#C5A028]"
                          strokeWidth={0}
                        />
                      ))}
                    </div>
                    <h3 className="text-[20px] font-black text-[#2A4537] tracking-tighter uppercase leading-tight mb-4 group-hover:text-[#C5A028] transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-black text-black-300 uppercase tracking-widest mb-8">
                      <span>SKU: {product.sku || "N/A"}</span>
                      <span className="h-3 w-[1px] bg-gray-100"></span>
                      <span>Stock: {product.stock}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                      <span className="text-[24px] font-black text-[#2A4537] tracking-tighter">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditProductDialog(product)}
                          className="h-12 w-12 rounded-full border-gray-100 hover:bg-[#111] hover:text-white hover:border-transparent transition-all shadow-md group/edit"
                        >
                          <Edit className="h-5 w-5 text-gray-400 group-hover/edit:text-white" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteProduct(product._id)}
                          className="h-12 w-12 rounded-full border-gray-100 hover:bg-red-500 hover:text-white hover:border-transparent transition-all shadow-md group/trash"
                        >
                          <Trash2 className="h-5 w-5 text-gray-400 group-hover/trash:text-white" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent
            value="orders"
            className="space-y-12 animate-in fade-in duration-700"
          >
            <div className="bg-white rounded-[48px] border border-gray-50 shadow-2xl overflow-hidden p-0">
              <div className="p-12 border-b border-gray-50">
                <h3 className="text-[35px] text-[#2A4537] uppercase tracking-tighter">
                  Order History 
                </h3>
                <p className="text-gray-400 text-xs font-medium italic mt-2">
                  Certified transaction history and fulfillment status
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#2A4537]">
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-white">
                        Order ID
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-white">
                        Collector
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-white">
                        Items & Sizes
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-white">
                        Total Value
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-white">
                        Status
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-white">
                        Update
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50/50 transition-colors group align-top"
                      >
                        <td className="px-8 py-6">
                          <span className="text-[13px] font-black text-[#111] font-mono group-hover:text-[#C5A028] transition-colors">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-[13px] font-black uppercase tracking-tight">
                            {order.userId?.name || "Guest"}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium italic">
                            {order.userId?.email || "—"}
                          </p>
                          {order.address?.city && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              📍 {order.address.city}, {order.address.state}
                            </p>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 bg-gray-50 rounded-xl p-3"
                              >
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-100 flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-bold text-[#111] leading-tight truncate max-w-[180px]">
                                    {item.title || item.productId?.title || "Product"}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[10px] text-gray-500 font-medium">
                                      Qty: <strong>{item.quantity}</strong>
                                    </span>
                                    <span className="text-[10px] font-bold text-[#2A4537]">
                                      ₹{item.price?.toLocaleString()}
                                    </span>
                                    {item.size ? (
                                      <span className="text-[10px] font-black bg-[#2A4537] text-white px-2 py-0.5 rounded-full">
                                        Size: {item.size}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 italic">
                                        One Size
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-[15px] font-black text-[#111] tracking-tighter">
                            ₹{order.finalAmount?.toLocaleString()}
                          </div>
                          {order.discount > 0 && (
                            <div className="text-[11px] text-[#C5A028] font-bold uppercase tracking-widest mt-1">
                              Saved ₹{order.discount.toLocaleString()}
                            </div>
                          )}
                          {order.couponCode && (
                            <div className="text-[10px] text-gray-400 mt-1">
                              Coupon: <strong>{order.couponCode}</strong>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <Badge
                            className={`${getStatusColor(
                              order.status
                            )} text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border-none shadow-lg`}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <Select
                            onValueChange={(val) =>
                              handleUpdateOrderStatus(order._id, val)
                            }
                            defaultValue={order.status}
                          >
                            <SelectTrigger className="w-[130px] rounded-full border-gray-100 text-[10px] font-black uppercase tracking-widest hover:border-[#111] transition-all">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                              {[
                                "Pending",
                                "Confirmed",
                                "Shipped",
                                "Delivered",
                                "Cancelled",
                              ].map((status) => (
                                <SelectItem
                                  key={status}
                                  value={status}
                                  className="rounded-xl text-[10px] font-black uppercase tracking-widest focus:bg-[#111] focus:text-white transition-all py-3"
                                >
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent
            value="users"
            className="space-y-12 animate-in fade-in duration-700"
          >
            <div className="bg-white rounded-[48px] border border-gray-50 shadow-2xl overflow-hidden p-0">
              <div className="p-12 border-b border-gray-50">
                <h3 className="text-[30px] text-[#2A4537] uppercase tracking-tighter">
                  Privileged Members
                </h3>
                <p className="text-gray-400 text-xs font-medium italic mt-2">
                  Executive list of registered connoisseurs and patrons
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#2A4537]">
                      <th className="px-10 py-6 text-[14px] font-black uppercase tracking-widest text-white">
                        Patron Name
                      </th>
                      <th className="px-10 py-6 text-[14px] font-black uppercase tracking-widest text-white">
                        Digital Identity
                      </th>
                      <th className="px-10 py-6 text-[14px] font-black uppercase tracking-widest text-white">
                        Contact Line
                      </th>
                      <th className="px-10 py-6 text-[14px] font-black uppercase tracking-widest text-white">
                        Access Level
                      </th>
                      <th className="px-10 py-6 text-[14px] font-black uppercase tracking-widest text-white">
                        Initiation Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-10 py-8 text-[14px] font-black uppercase tracking-tight text-[#111] transition-colors">
                          {user.name}
                        </td>
                        <td className="px-10 py-8 text-[14px] text-black-400 font-medium italic">
                          {user.email}
                        </td>
                        <td className="px-10 py-8 text-[14px] font-bold text-black-500">
                          {user.phone || "Private"}
                        </td>
                        <td className="px-10 py-8">
                          <Badge
                            className={`${user.role === "admin"
                              ? "bg-[#111]"
                              : "bg-[#C5A028]"
                              } text-white text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border-none shadow-lg`}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-10 py-8 text-[12px] font-black tracking-tighter text-black-400">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent
            value="coupons"
            className="space-y-12 animate-in slide-in-from-right duration-700"
          >
            <div className="flex justify-between items-center bg-[#2A4537] p-5 rounded-[48px] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="relative z-10">
                <h2 className="text-[20px] font-black text-white tracking-tighter uppercase leading-none mb-2">
                  
                </h2>
              </div>
              <Dialog
                open={showCouponDialog}
                onOpenChange={setShowCouponDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={openAddCouponDialog}
                    className="relative z-10 gap-3 bg-[#C5A028] hover:bg-white text-[#111] font-black uppercase tracking-widest text-[11px] px-10 py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-5 w-5" />
                    New Coupon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[48px] border-none shadow-[0_40px_80px_rgba(0,0,0,0.2)] p-0 bg-[#FDFDFD]">
                  <DialogHeader className="p-10 bg-[#2A4537] text-white">
                    <DialogTitle className="text-[32px] text-white uppercase tracking-tighter">
                      {editingCoupon ? "Edit Coupon" : "Add Coupon"}
                    </DialogTitle>
                    <DialogDescription className="text-[#C5A028] text-[12px] font-black uppercase tracking-[0.4em] opacity-80">
                      {editingCoupon
                        ? "Updating the parameters for this exclusive privilege"
                        : "Creating a new gateway to luxury rewards"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-12 space-y-10">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <Label
                          htmlFor="code"
                          className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                        >
                          Privilege Key (Code) *
                        </Label>
                        <Input
                          id="code"
                          value={couponFormData.code}
                          onChange={(e) =>
                            setCouponFormData({
                              ...couponFormData,
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="PRIVATE-GOLD"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-widest uppercase focus:ring-2 focus:ring-[#C5A028] transition-all font-mono"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="discountType"
                          className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                        >
                          Benefit Type *
                        </Label>
                        <Select
                          value={couponFormData.discountType}
                          onValueChange={(value) =>
                            setCouponFormData({
                              ...couponFormData,
                              discountType: value,
                            })
                          }
                        >
                          <SelectTrigger className="rounded-2xl bg-gray-50 border-gray-100 p-6 h-auto text-[13px] font-black tracking-tight transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl p-2 border-none">
                            <SelectItem
                              value="percentage"
                              className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3"
                            >
                              Percentage Reward (%)
                            </SelectItem>
                            <SelectItem
                              value="fixed"
                              className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3"
                            >
                              Fixed Allocation (₹)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                      >
                        Privilege Briefing
                      </Label>
                      <Textarea
                        id="description"
                        value={couponFormData.description}
                        onChange={(e) =>
                          setCouponFormData({
                            ...couponFormData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Define the exclusivity of this offer..."
                        rows={3}
                        className="rounded-[32px] bg-gray-50 border-gray-100 p-8 text-[13px] font-medium italic focus:ring-2 focus:ring-[#C5A028] transition-all resize-none shadow-inner"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <Label
                          htmlFor="discountValue"
                          className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                        >
                          Reward Value *
                        </Label>
                        <Input
                          id="discountValue"
                          type="number"
                          value={couponFormData.discountValue}
                          onChange={(e) =>
                            setCouponFormData({
                              ...couponFormData,
                              discountValue: e.target.value,
                            })
                          }
                          placeholder="10"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tighter focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="minPurchaseAmount"
                          className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                        >
                          Threshold (₹)
                        </Label>
                        <Input
                          id="minPurchaseAmount"
                          type="number"
                          value={couponFormData.minPurchaseAmount}
                          onChange={(e) =>
                            setCouponFormData({
                              ...couponFormData,
                              minPurchaseAmount: e.target.value,
                            })
                          }
                          placeholder="5000"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tighter focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="usageLimit"
                          className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                        >
                          Allocation Limit
                        </Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={couponFormData.usageLimit}
                          onChange={(e) =>
                            setCouponFormData({
                              ...couponFormData,
                              usageLimit: e.target.value,
                            })
                          }
                          placeholder="Unlimited"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      {couponFormData.discountType === "percentage" && (
                        <div className="space-y-3">
                          <Label
                            htmlFor="maxDiscountAmount"
                            className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                          >
                            Max Reward Cap (₹)
                          </Label>
                          <Input
                            id="maxDiscountAmount"
                            type="number"
                            value={couponFormData.maxDiscountAmount}
                            onChange={(e) =>
                              setCouponFormData({
                                ...couponFormData,
                                maxDiscountAmount: e.target.value,
                              })
                            }
                            placeholder="1000"
                            className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black tracking-tighter focus:ring-2 focus:ring-[#C5A028] transition-all"
                          />
                        </div>
                      )}
                      <div className="space-y-3">
                        <Label
                          htmlFor="expiryDate"
                          className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                        >
                          Deactivation Date
                        </Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={couponFormData.expiryDate}
                          onChange={(e) =>
                            setCouponFormData({
                              ...couponFormData,
                              expiryDate: e.target.value,
                            })
                          }
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black focus:ring-2 focus:ring-[#C5A028] transition-all h-auto"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="p-12 bg-gray-50 border-t border-gray-100 rounded-b-[48px]">
                    <Button
                      variant="outline"
                      onClick={() => setShowCouponDialog(false)}
                      className="rounded-full px-10 py-7 text-[11px] font-black uppercase tracking-widest border-gray-200 hover:bg-[#2A4537] hover:text-white transition-all"
                    >
                      Discard
                    </Button>
                    <Button
                      onClick={
                        editingCoupon ? handleUpdateCoupon : handleAddCoupon
                      }
                      className="bg-[#2A4537] hover:bg-[#C5A028] text-white rounded-full px-12 py-7 text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all"
                    >
                      {editingCoupon ? "Update Coupon" : "Add Coupon"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {coupons.length === 0 ? (
                <Card className="rounded-[40px] border border-gray-100 shadow-xl overflow-hidden p-20 text-center bg-white">
                  <CardContent>
                    <Tag className="h-20 w-20 mx-auto text-[#C5A028] opacity-20 mb-8" />
                    <h3 className="text-[24px] font-black uppercase tracking-tighter mb-4">
                      No Active Privileges
                    </h3>
                    <p className="text-gray-400 text-sm font-medium italic mb-10 max-w-md mx-auto">
                      The vault is currently empty of bespoke rewards. Forge
                      your first privilege key to begin.
                    </p>
                    <Button
                      onClick={openAddCouponDialog}
                      className="bg-[#111] hover:bg-[#C5A028] text-white rounded-full px-12 py-8 text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all"
                    >
                      <Plus className="h-5 w-5 mr-3" />
                      Create First Coupon
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                coupons.map((coupon) => (
                  <Card
                    key={coupon._id}
                    className={`rounded-[40px] border border-gray-100 shadow-xl overflow-hidden group transition-all duration-700 hover:shadow-2xl hover:border-[#C5A028] bg-white ${!coupon.isActive ? "opacity-40 grayscale" : ""
                      }`}
                  >
                    <CardContent className="p-10">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="flex-1 space-y-6">
                          <div className="flex items-center gap-6">
                            <div className="bg-[#2A4736] text-[#C5A028] px-8 py-3 rounded-2xl font-mono font-black text-[20px] tracking-[0.2em] shadow-2xl group-hover:scale-105 transition-transform">
                              {coupon.code}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge
                                className={`${coupon.isActive
                                  ? "bg-[#2A4736]"
                                  : "bg-gray-400"
                                  } text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-none`}
                              >
                                {coupon.isActive
                                  ? "Operational"
                                  : "Deactivated"}
                              </Badge>
                              {coupon.expiryDate &&
                                new Date(coupon.expiryDate) < new Date() && (
                                  <Badge className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-none animate-pulse">
                                    Terminated
                                  </Badge>
                                )}
                            </div>
                          </div>
                          {coupon.description && (
                            <p className="text-[13px] font-medium text-black-500 italic max-w-2xl">
                              "{coupon.description}"
                            </p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-gray-50">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-black-300 mb-1">
                                Privilege Value
                              </p>
                              <p className="text-[16px] font-black text-[#111] tracking-tighter">
                                {coupon.discountType === "percentage"
                                  ? `${coupon.discountValue}% Off`
                                  : `₹${coupon.discountValue?.toLocaleString()} Credit`}
                              </p>
                            </div>
                            {coupon.minPurchaseAmount > 0 && (
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-black-300 mb-1">
                                  Threshold
                                </p>
                                <p className="text-[16px] font-black text-[#111] tracking-tighter">
                                  ₹{coupon.minPurchaseAmount?.toLocaleString()}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-black-300 mb-1">
                                Utilization
                              </p>
                              <p className="text-[16px] font-black text-[#111] tracking-tighter">
                                {coupon.usedCount}{" "}
                                <span className="text-gray-200 text-[10px]">
                                  /
                                </span>{" "}
                                {coupon.usageLimit || "∞"}
                              </p>
                            </div>
                            {coupon.expiryDate && (
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-black-300 mb-1">
                                  Expiry
                                </p>
                                <p className="text-[16px] font-black text-[#111] tracking-tighter">
                                  {new Date(
                                    coupon.expiryDate
                                  ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex lg:flex-col gap-4 self-center">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleToggleCouponStatus(
                                coupon._id,
                                coupon.isActive
                              )
                            }
                            className="h-14 w-14 rounded-full border-gray-100 hover:bg-[#111] hover:text-white transition-all shadow-md group/toggle"
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="h-6 w-6 text-gray-400 group-hover/toggle:text-[#C5A028]" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-gray-400 group-hover/toggle:text-white" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditCouponDialog(coupon)}
                            className="h-14 w-14 rounded-full border-gray-100 hover:bg-[#111] hover:text-white transition-all shadow-md group/edit"
                          >
                            <Edit className="h-5 w-5 text-gray-400 group-hover/edit:text-white" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="h-14 w-14 rounded-full border-gray-100 hover:bg-red-500 hover:text-white transition-all shadow-md group/trash"
                          >
                            <Trash2 className="h-5 w-5 text-gray-400 group-hover/trash:text-white" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Blogs Tab */}
          <TabsContent
            value="blogs"
            className="space-y-12 animate-in slide-in-from-left duration-700"
          >
            <div className="flex justify-between items-center bg-[#2A4537] p-4 rounded-[48px] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="relative z-10">
                <h2 className="text-[20px] font-black text-white tracking-tighter uppercase leading-none mb-2">
                </h2>
              </div>
              <Dialog open={showBlogDialog} onOpenChange={setShowBlogDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={openAddBlogDialog}
                    className="relative z-10 gap-3 bg-[#C5A028] hover:bg-white text-[#111] font-black uppercase tracking-widest text-[11px] px-10 py-2 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-5 w-5" />
                    Draft New Blog
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[48px] border-none shadow-[0_40px_80px_rgba(0,0,0,0.2)] p-0 bg-[#FDFDFD]">
                  <DialogHeader className="p-14 bg-[#2A4537] text-white">
                    <DialogTitle className="text-[32px] font-black uppercase tracking-tighter">
                      {editingBlog ? "Edit Blog" : "Draft New Blog"}
                    </DialogTitle>
                    <DialogDescription className="text-[#C5A028] text-[13px] font-black uppercase tracking-[0.4em] opacity-80">
                      {editingBlog
                        ? "Updating the details of this brand editorial"
                        : "Composing a new chapter in the LuxeLoom legacy"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-12 space-y-10">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <Label
                          htmlFor="blog-title"
                          className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                        >
                          Headline *
                        </Label>
                        <Input
                          id="blog-title"
                          value={blogFormData.title}
                          onChange={(e) =>
                            setBlogFormData({
                              ...blogFormData,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g. The Art of Ethical Diamonds"
                          className="rounded-2xl bg-gray-50 border-gray-100 p-6 text-[13px] font-black focus:ring-2 focus:ring-[#C5A028] transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="blog-category"
                          className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                        >
                          Classification *
                        </Label>
                        <Select
                          value={blogFormData.category}
                          onValueChange={(value) =>
                            setBlogFormData({
                              ...blogFormData,
                              category: value,
                            })
                          }
                        >
                          <SelectTrigger className="rounded-2xl bg-gray-50 border-gray-100 p-6 h-auto text-[13px] font-black transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl p-2 border-none">
                            {[
                              "News",
                              "Collections",
                              "Tips",
                              "Craftsmanship",
                              "Heritage",
                            ].map((cat) => (
                              <SelectItem
                                key={cat}
                                value={cat}
                                className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3"
                              >
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="excerpt"
                        className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                      >
                        Brief Abstract (Excerpt)
                      </Label>
                      <Textarea
                        id="excerpt"
                        value={blogFormData.excerpt}
                        onChange={(e) =>
                          setBlogFormData({
                            ...blogFormData,
                            excerpt: e.target.value,
                          })
                        }
                        placeholder="A short introduction to the story..."
                        rows={2}
                        className="rounded-[24px] bg-gray-50 border-gray-100 p-6 text-[13px] font-medium italic focus:ring-2 focus:ring-[#C5A028] transition-all resize-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="blog-description"
                        className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                      >
                        Full Narrative *
                      </Label>
                      <Textarea
                        id="blog-description"
                        value={blogFormData.description}
                        onChange={(e) =>
                          setBlogFormData({
                            ...blogFormData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Write the complete story here..."
                        rows={8}
                        className="rounded-[32px] bg-gray-50 border-gray-100 p-8 text-[13px] leading-relaxed focus:ring-2 focus:ring-[#C5A028] transition-all resize-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="blog-images"
                        className="text-[10px] font-black uppercase tracking-widest text-black-400 ml-4"
                      >
                        Visual Imagery (Comma-separated URLs)
                      </Label>
                      <Textarea
                        id="blog-images"
                        value={blogFormData.images}
                        onChange={(e) =>
                          setBlogFormData({
                            ...blogFormData,
                            images: e.target.value,
                          })
                        }
                        placeholder="https://example.com/story-main.jpg, https://example.com/story-detail.jpg"
                        rows={2}
                        className="rounded-[24px] bg-gray-50 border-gray-100 p-6 text-[11px] font-mono focus:ring-2 focus:ring-[#C5A028] transition-all resize-none shadow-inner"
                      />
                    </div>
                  </div>
                  <DialogFooter className="p-12 bg-gray-50 border-t border-gray-100 rounded-b-[48px]">
                    <Button
                      variant="outline"
                      onClick={() => setShowBlogDialog(false)}
                      className="rounded-full px-10 py-7 text-[11px] font-black uppercase tracking-widest border-gray-200 hover:bg-[#2A4537] hover:text-white transition-all"
                    >
                      Discard Draft
                    </Button>
                    <Button
                      onClick={editingBlog ? handleUpdateBlog : handleAddBlog}
                      className="bg-[#2A4537] hover:bg-[#C5A028] text-white rounded-full px-12 py-7 text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all"
                    >
                      {editingBlog ? "Edit Blog" : "Add Blog Post"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {blogs.map((blog) => (
                <Card
                  key={blog._id}
                  className="rounded-[40px] border border-gray-100 shadow-xl overflow-hidden group transition-all duration-700 hover:shadow-2xl hover:border-[#C5A028] flex flex-col h-full bg-white"
                >
                  <div className="aspect-video bg-gray-50 relative overflow-hidden">
                    <img
                      src={
                        blog.images[0] ||
                        "https://images.unsplash.com/photo-1573408302382-90abf5573161?w=800"
                      }
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-white/90 backdrop-blur-md text-[#111] text-[9px] font-black px-4 py-2 rounded-full border border-gray-100 uppercase tracking-widest shadow-lg">
                        {blog.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <p className="text-[12px] font-black text-[#C5A028] uppercase tracking-[0.2em] mb-4">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="text-[21px] font-black text-[#2A4537] tracking-tighter uppercase leading-tight mb-4 group-hover:text-[#C5A028] transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-black-400 text-[14px] font-medium italic line-clamp-3 mb-8 flex-1">
                      {blog.excerpt ||
                        blog.description.substring(0, 150) + "..."}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditBlogDialog(blog)}
                          className="h-12 w-12 rounded-full border-gray-100 hover:bg-[#111] hover:text-white transition-all shadow-md group/edit"
                        >
                          <Edit className="h-5 w-5 text-gray-400 group-hover/edit:text-white" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteBlog(blog._id)}
                          className="h-12 w-12 rounded-full border-gray-100 hover:bg-red-500 hover:text-white transition-all shadow-md group/trash"
                        >
                          <Trash2 className="h-5 w-5 text-gray-400 group-hover/trash:text-white" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
