'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
  ToggleRight
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, token, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  
  // Dashboard data
  const [stats, setStats] = useState(null)
  
  // Products data
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [productFormData, setProductFormData] = useState({
    title: '',
    description: '',
    price: '',
    images: '',
    category: '',
    stock: ''
  })
  const [showProductDialog, setShowProductDialog] = useState(false)
  
  // Orders data
  const [orders, setOrders] = useState([])
  
  // Users data
  const [users, setUsers] = useState([])

  // Coupons data
  const [coupons, setCoupons] = useState([])
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    expiryDate: ''
  })
  const [showCouponDialog, setShowCouponDialog] = useState(false)

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchStats(),
        fetchProducts(),
        fetchOrders(),
        fetchUsers(),
        fetchCoupons()
      ])
    } catch (error) {
      toast.error('Error loading admin data')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setCoupons(data.coupons || [])
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    }
  }

  const handleAddCoupon = async () => {
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponFormData.code,
          description: couponFormData.description,
          discountType: couponFormData.discountType,
          discountValue: parseFloat(couponFormData.discountValue),
          minPurchaseAmount: couponFormData.minPurchaseAmount ? parseFloat(couponFormData.minPurchaseAmount) : 0,
          maxDiscountAmount: couponFormData.maxDiscountAmount ? parseFloat(couponFormData.maxDiscountAmount) : null,
          usageLimit: couponFormData.usageLimit ? parseInt(couponFormData.usageLimit) : null,
          expiryDate: couponFormData.expiryDate || null,
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Coupon created successfully')
        setShowCouponDialog(false)
        resetCouponForm()
        fetchCoupons()
      } else {
        toast.error(data.error || 'Failed to create coupon')
      }
    } catch (error) {
      toast.error('Error creating coupon')
    }
  }

  const handleUpdateCoupon = async () => {
    try {
      const response = await fetch(`/api/admin/coupons/${editingCoupon}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponFormData.code,
          description: couponFormData.description,
          discountType: couponFormData.discountType,
          discountValue: parseFloat(couponFormData.discountValue),
          minPurchaseAmount: couponFormData.minPurchaseAmount ? parseFloat(couponFormData.minPurchaseAmount) : 0,
          maxDiscountAmount: couponFormData.maxDiscountAmount ? parseFloat(couponFormData.maxDiscountAmount) : null,
          usageLimit: couponFormData.usageLimit ? parseInt(couponFormData.usageLimit) : null,
          expiryDate: couponFormData.expiryDate || null,
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Coupon updated successfully')
        setShowCouponDialog(false)
        setEditingCoupon(null)
        resetCouponForm()
        fetchCoupons()
      } else {
        toast.error(data.error || 'Failed to update coupon')
      }
    } catch (error) {
      toast.error('Error updating coupon')
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Coupon deleted successfully')
        fetchCoupons()
      } else {
        toast.error('Failed to delete coupon')
      }
    } catch (error) {
      toast.error('Error deleting coupon')
    }
  }

  const handleToggleCouponStatus = async (couponId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchCoupons()
      }
    } catch (error) {
      toast.error('Error updating coupon status')
    }
  }

  const openAddCouponDialog = () => {
    resetCouponForm()
    setEditingCoupon(null)
    setShowCouponDialog(true)
  }

  const openEditCouponDialog = (coupon) => {
    setCouponFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || '',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
    })
    setEditingCoupon(coupon._id)
    setShowCouponDialog(true)
  }

  const resetCouponForm = () => {
    setCouponFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchaseAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      expiryDate: ''
    })
  }


  const handleAddProduct = async () => {
    try {
      const imagesArray = productFormData.images.split(',').map(url => url.trim()).filter(url => url)
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productFormData,
          price: parseFloat(productFormData.price),
          stock: parseInt(productFormData.stock),
          images: imagesArray
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Product added successfully')
        setShowProductDialog(false)
        resetProductForm()
        fetchProducts()
      } else {
        toast.error(data.error || 'Failed to add product')
      }
    } catch (error) {
      toast.error('Error adding product')
    }
  }

  const handleUpdateProduct = async () => {
    try {
      const imagesArray = productFormData.images.split(',').map(url => url.trim()).filter(url => url)
      
      const response = await fetch(`/api/admin/products/${editingProduct}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productFormData,
          price: parseFloat(productFormData.price),
          stock: parseInt(productFormData.stock),
          images: imagesArray
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Product updated successfully')
        setShowProductDialog(false)
        setEditingProduct(null)
        resetProductForm()
        fetchProducts()
      } else {
        toast.error(data.error || 'Failed to update product')
      }
    } catch (error) {
      toast.error('Error updating product')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Product deleted successfully')
        fetchProducts()
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Error deleting product')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Order status updated')
        fetchOrders()
      } else {
        toast.error('Failed to update order status')
      }
    } catch (error) {
      toast.error('Error updating order status')
    }
  }

  const openAddProductDialog = () => {
    resetProductForm()
    setEditingProduct(null)
    setShowProductDialog(true)
  }

  const openEditProductDialog = (product) => {
    setProductFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      images: product.images.join(', '),
      category: product.category,
      stock: product.stock.toString()
    })
    setEditingProduct(product._id)
    setShowProductDialog(true)
  }

  const resetProductForm = () => {
    setProductFormData({
      title: '',
      description: '',
      price: '',
      images: '',
      category: '',
      stock: ''
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500'
      case 'Confirmed': return 'bg-blue-500'
      case 'Shipped': return 'bg-purple-500'
      case 'Delivered': return 'bg-green-500'
      case 'Cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
                <Store className="h-6 w-6" />
                PremiumStore Admin
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Store
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => { logout(); router.push('/login'); }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Tag className="h-4 w-4" />
              Coupons
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats?.stats?.totalRevenue || 0}</div>
                  <p className="text-xs text-muted-foreground">From all orders</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.stats?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">All time orders</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered customers</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.stats?.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">In inventory</p>
                </CardContent>
              </Card>
            </div>

            {/* Orders by Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>Overview of order statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.ordersByStatus || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentOrders?.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-semibold">{order.userId?.name}</p>
                        <p className="text-sm text-gray-600">{order.userId?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{order.totalAmount}</p>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Products Management</h2>
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button onClick={openAddProductDialog} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>
                      {editingProduct ? 'Update product information' : 'Fill in the details to add a new product'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={productFormData.title}
                        onChange={(e) => setProductFormData({ ...productFormData, title: e.target.value })}
                        placeholder="Product title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={productFormData.description}
                        onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                        placeholder="Product description"
                        rows={3}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={productFormData.price}
                          onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                          placeholder="999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productFormData.stock}
                          onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        value={productFormData.category}
                        onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                        placeholder="Electronics, Fashion, Sports, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="images">Images (comma-separated URLs)</Label>
                      <Textarea
                        id="images"
                        value={productFormData.images}
                        onChange={(e) => setProductFormData({ ...productFormData, images: e.target.value })}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {editingProduct ? 'Update' : 'Add'} Product
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/400'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                    <Badge variant="outline" className="mb-2">{product.category}</Badge>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-blue-600">₹{product.price}</span>
                      <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => openEditProductDialog(product)}
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Orders Management</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-mono text-sm font-semibold">{order._id}</p>
                        <p className="text-sm text-gray-600 mt-2">Customer: {order.userId?.name}</p>
                        <p className="text-sm text-gray-600">{order.userId?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 mb-2">₹{order.totalAmount}</p>
                        <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order._id, value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <p className="font-semibold text-sm">Items:</p>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.title} x {item.quantity}
                          </span>
                          <span className="font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3">
                      <p className="text-sm font-semibold mb-1">Shipping Address:</p>
                      <p className="text-sm text-gray-600">
                        {order.address?.name}, {order.address?.phone}<br />
                        {order.address?.street}, {order.address?.city}<br />
                        {order.address?.state} - {order.address?.zipCode}, {order.address?.country}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold">Users Management</h2>
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Phone</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">{user.phone || '-'}</td>
                          <td className="py-3 px-4">
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Coupons Management</h2>
              <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
                <DialogTrigger asChild>
                  <Button onClick={openAddCouponDialog} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Create Coupon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                    <DialogDescription>
                      {editingCoupon ? 'Update coupon information' : 'Fill in the details to create a new coupon code'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Coupon Code *</Label>
                        <Input
                          id="code"
                          value={couponFormData.code}
                          onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                          placeholder="SUMMER2025"
                          className="uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountType">Discount Type *</Label>
                        <Select value={couponFormData.discountType} onValueChange={(value) => setCouponFormData({ ...couponFormData, discountType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={couponFormData.description}
                        onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                        placeholder="e.g., Summer sale discount"
                        rows={2}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discountValue">
                          Discount Value * {couponFormData.discountType === 'percentage' ? '(%)' : '(₹)'}
                        </Label>
                        <Input
                          id="discountValue"
                          type="number"
                          value={couponFormData.discountValue}
                          onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: e.target.value })}
                          placeholder={couponFormData.discountType === 'percentage' ? '10' : '100'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minPurchaseAmount">Min Purchase Amount (₹)</Label>
                        <Input
                          id="minPurchaseAmount"
                          type="number"
                          value={couponFormData.minPurchaseAmount}
                          onChange={(e) => setCouponFormData({ ...couponFormData, minPurchaseAmount: e.target.value })}
                          placeholder="500"
                        />
                      </div>
                    </div>
                    {couponFormData.discountType === 'percentage' && (
                      <div className="space-y-2">
                        <Label htmlFor="maxDiscountAmount">Max Discount Amount (₹)</Label>
                        <Input
                          id="maxDiscountAmount"
                          type="number"
                          value={couponFormData.maxDiscountAmount}
                          onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscountAmount: e.target.value })}
                          placeholder="1000"
                        />
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="usageLimit">Usage Limit</Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={couponFormData.usageLimit}
                          onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                          placeholder="100 (leave empty for unlimited)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={couponFormData.expiryDate}
                          onChange={(e) => setCouponFormData({ ...couponFormData, expiryDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCouponDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingCoupon ? handleUpdateCoupon : handleAddCoupon}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {editingCoupon ? 'Update' : 'Create'} Coupon
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {coupons.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Coupons Yet</h3>
                    <p className="text-gray-600 mb-6">Create your first coupon to offer discounts to customers!</p>
                    <Button onClick={openAddCouponDialog} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Coupon
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                coupons.map((coupon) => (
                  <Card key={coupon._id} className={!coupon.isActive ? 'opacity-60' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-mono font-bold text-lg">
                              {coupon.code}
                            </div>
                            <Badge className={coupon.isActive ? 'bg-green-600' : 'bg-gray-500'}>
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {coupon.expiryDate && new Date(coupon.expiryDate) < new Date() && (
                              <Badge className="bg-red-600">Expired</Badge>
                            )}
                          </div>
                          {coupon.description && (
                            <p className="text-gray-600 mb-3">{coupon.description}</p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Discount</p>
                              <p className="font-semibold">
                                {coupon.discountType === 'percentage' 
                                  ? `${coupon.discountValue}%` 
                                  : `₹${coupon.discountValue}`}
                              </p>
                            </div>
                            {coupon.minPurchaseAmount > 0 && (
                              <div>
                                <p className="text-gray-500">Min Purchase</p>
                                <p className="font-semibold">₹{coupon.minPurchaseAmount}</p>
                              </div>
                            )}
                            {coupon.maxDiscountAmount && (
                              <div>
                                <p className="text-gray-500">Max Discount</p>
                                <p className="font-semibold">₹{coupon.maxDiscountAmount}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500">Usage</p>
                              <p className="font-semibold">
                                {coupon.usedCount}
                                {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / Unlimited'}
                              </p>
                            </div>
                            {coupon.expiryDate && (
                              <div>
                                <p className="text-gray-500">Expires</p>
                                <p className="font-semibold">
                                  {new Date(coupon.expiryDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleCouponStatus(coupon._id, coupon.isActive)}
                            className="gap-2"
                          >
                            {coupon.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditCouponDialog(coupon)}
                            className="gap-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
