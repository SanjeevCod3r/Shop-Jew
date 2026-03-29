'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore, useCartStore } from '@/lib/store'
import { toast } from 'sonner'
import { ArrowLeft, ShoppingCart, Plus, Minus, Heart, Share2, Package, Shield, TruckIcon } from 'lucide-react'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { token } = useAuthStore()
  const { setCart } = useCartStore()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()
      if (data.product) {
        setProduct(data.product)
      } else {
        toast.error('Product not found')
        router.push('/')
      }
    } catch (error) {
      toast.error('Error loading product')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!token) {
      toast.error('Please login to add items to cart')
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id, quantity })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Added to cart!')
        setCart(data.cart.items || [])
      } else {
        toast.error(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      toast.error('Error adding to cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden border-2 shadow-lg">
              <img
                src={product.images[selectedImage] || product.images[0] || 'https://via.placeholder.com/600'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">{product.category}</Badge>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{product.title}</h1>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-blue-600">₹{product.price}</span>
                <span className="text-lg text-gray-500 line-through">₹{Math.round(product.price * 1.3)}</span>
                <Badge className="bg-green-600">Save 23%</Badge>
              </div>
              {product.stock > 0 ? (
                <Badge className="bg-green-600">In Stock ({product.stock} available)</Badge>
              ) : (
                <Badge className="bg-red-600">Out of Stock</Badge>
              )}
            </div>

            <div className="border-t border-b py-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-5 w-5 text-blue-600" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TruckIcon className="h-5 w-5 text-blue-600" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Secure Payment</span>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2 py-6 text-lg"
                    onClick={addToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon" className="h-auto px-4">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-auto px-4">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Product Info */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold">{product.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Availability</span>
                  <span className="font-semibold">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SKU</span>
                  <span className="font-semibold font-mono">{product._id.slice(-8).toUpperCase()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
