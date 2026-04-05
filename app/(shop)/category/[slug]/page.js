'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Star, ArrowLeft } from 'lucide-react'
import { useAuthStore, useCartStore } from '@/lib/store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ListingAddToCartButton from '@/components/ListingAddToCartButton'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { token, hydrated: authHydrated } = useAuthStore()
  const { setCart } = useCartStore()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Reconstruct category name from slug
  const categorySlug = params.slug || ''
  const categoryName = categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  useEffect(() => {
    fetchProducts()
  }, [categorySlug])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // fetch from our existing API
      const response = await fetch(`/api/products?category=${categoryName}&limit=20`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Simple Header for Navigation */}
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4 lg:px-8 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 pt-10">

        {/* Section Header */}
        <div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-8">
          <h1 className="text-[30px] md:text-[32px] font-bold text-[#2A4537] tracking-tight">
            {categoryName} Products
          </h1>
          <Link href="/shop" className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-1 transition-colors">
            View All
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-[16px] border border-gray-100 p-4 animate-pulse">
                <div className="w-full aspect-square bg-gray-100 rounded-lg mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[24px] border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">No products found in this category.</p>
            <Link href="/">
              <Button className="bg-[#2A4736] hover:bg-[#1f3628]">Back to Store</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link href={`/product/${product._id}`} key={product._id} className="group">
                <div className="bg-white rounded-[16px] border border-gray-200/60 p-5 transition-shadow hover:shadow-lg relative flex flex-col h-full">
                  {/* Image */}
                  <div className="relative w-full aspect-square mb-6 overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/400'}
                      alt={product.title}
                      className="object-contain w-full h-full max-h-[180px] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Details */}
                  <div className="mt-auto">
                    {/* Category Label */}
                    <span className="text-[15px] text-[#C5A028] font-medium mb-1.5 block">
                      {product.stone || product.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-bold text-[20px] text-black leading-tight mb-2.5 line-clamp-1">
                      {product.title}
                    </h3>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-[16px] w-[16px] fill-[#F5A623] text-[#F5A623]" />
                      ))}
                    </div>

                    {/* Footer: Price & Add to Cart */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-[20px] text-[#2A4537]">
                        ₹{product.price.toFixed(2)}
                      </span>

                      <ListingAddToCartButton
                        product={product}
                        requireAuth
                        authHydrated={authHydrated}
                        authenticated={!!token}
                        onUnauthenticated={() => {
                          toast.error('Please login to add items to cart')
                          router.push('/login')
                        }}
                        disabled={product.stock === 0}
                        className={`h-9 w-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${product.stock === 0 ? 'bg-gray-300' : 'bg-[#2A4736] hover:bg-[#1f3628]'} shadow-sm text-white disabled:cursor-not-allowed`}
                        onAdd={async (size) => {
                          const response = await fetch('/api/cart', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              productId: product._id,
                              quantity: 1,
                              size: size == null ? null : String(size),
                            }),
                          })
                          const data = await response.json()
                          if (response.ok) {
                            toast.success('Added to cart!')
                            setCart(data.cart?.items || [])
                          } else {
                            toast.error(data.error || 'Failed to add to cart')
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
