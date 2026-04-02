'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Star, ShoppingBag, ArrowLeft, Filter, Grid, List } from 'lucide-react'
import { useAuthStore, useCartStore } from '@/lib/store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ShopPage() {
  const { token } = useAuthStore()
  const { setCart } = useCartStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQueryFromUrl = searchParams.get('search') || ''

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('latest')
  const [maxPriceLimit, setMaxPriceLimit] = useState(50000)
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(50000)

  useEffect(() => {
    fetchData()
  }, [selectedCategory, searchQueryFromUrl])

  const fetchData = async () => {
    try {
      setLoading(true)
      let url = selectedCategory === 'All'
        ? '/api/products?limit=80'
        : `/api/products?category=${encodeURIComponent(selectedCategory)}&limit=80`
      
      if (searchQueryFromUrl) {
        url += `&search=${encodeURIComponent(searchQueryFromUrl)}`
      }

      const [prodRes, catRes] = await Promise.all([
        fetch(url),
        fetch('/api/categories')
      ])
      const prodData = await prodRes.json()
      const catData = await catRes.json()

      const fetchedProducts = prodData.products || []
      setProducts(fetchedProducts)
      setCategories(['All', ...(catData.categories || [])])
      const computedMax = Math.max(50000, ...fetchedProducts.map((p) => Number(p.price) || 0))
      setMaxPriceLimit(computedMax)
      setSelectedMaxPrice(computedMax)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    const byPrice = products.filter((p) => (Number(p.price) || 0) <= selectedMaxPrice)
    const sorted = [...byPrice]

    if (sortBy === 'price-low-high') {
      sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else if (sortBy === 'price-high-low') {
      sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    }

    return sorted
  }, [products, selectedMaxPrice, sortBy])

  const addToCart = async (e, productId) => {
    e.preventDefault()
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
        body: JSON.stringify({ productId, quantity: 1 })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Added to cart!')
        setCart(data.cart?.items || [])
      } else {
        toast.error(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      toast.error('Error adding to cart')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 overflow-x-hidden">

      {/* Breadcrumb Section */}
      <div className="bg-gray-50 border-b py-4 md:py-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-black">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium">Our Shop</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-8 py-6 md:py-10">

        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl p-5 md:p-8 border border-gray-100 shadow-sm lg:sticky lg:top-32">
              <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4">
                <Filter className="h-5 w-5 text-[#2A4736]" />
                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-widest">Categories</h4>
                  <div className="flex flex-col gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex items-center justify-between text-left px-4 py-2.5 rounded-xl transition-all ${selectedCategory === cat
                          ? 'bg-[#2A4737] text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <span className="font-medium">{cat}</span>
                        {selectedCategory === cat && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50">
                  <h4 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-widest">Price Range</h4>
                  <div className="space-y-4">
                    <input
                      type="range"
                      className="w-full accent-[#2A4736]"
                      min="0"
                      max={maxPriceLimit}
                      step="500"
                      value={selectedMaxPrice}
                      onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
                    />
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                      <span>₹0</span>
                      <span>₹{selectedMaxPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-10 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xs sm:text-sm font-medium text-gray-500">
                Showing <span className="text-black font-bold">{filteredProducts.length}</span> results 
                {searchQueryFromUrl && (
                  <> for <span className="text-[#2A4736] font-bold">"{searchQueryFromUrl}"</span></>
                )}
                {selectedCategory !== 'All' && (
                  <> in <span className="text-[#2A4736] font-bold">"{selectedCategory}"</span></>
                )}
              </div>
              <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto overflow-x-auto">
                <button className="p-2 rounded-lg bg-gray-100 text-[#2A4736]"><Grid className="h-5 w-5" /></button>
                <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400"><List className="h-5 w-5" /></button>
                <span className="h-6 w-[1px] bg-gray-200 mx-1 md:mx-2"></span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-sm font-bold border-none focus:ring-0 cursor-pointer min-w-[150px]"
                >
                  <option value="latest">Latest Arrivals</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Dynamic Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
                    <div className="aspect-square bg-gray-50 rounded-2xl mb-4"></div>
                    <div className="h-4 bg-gray-50 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-50 rounded w-full mb-6"></div>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="h-6 bg-gray-50 rounded w-1/4"></div>
                      <div className="h-10 w-10 bg-gray-50 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 md:p-20 text-center border border-gray-100 shadow-sm">
                <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">We couldn't find any items matching your selected filters. Try broadening your criteria or reset filters.</p>
                <Button
                  className="bg-[#2A4736] hover:bg-[#1f3628] rounded-full px-8 py-6"
                  onClick={() => {
                    setSelectedCategory('All')
                    setSortBy('latest')
                    setSelectedMaxPrice(maxPriceLimit)
                  }}
                >Reset Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
                {filteredProducts.map((p) => (
                  <Link href={`/product/${p._id}`} key={p._id} className="group">
                    <div className="bg-white rounded-[22px] md:rounded-[32px] p-3 sm:p-4 md:p-6 border border-gray-200/50 transition-all duration-500 hover:shadow-2xl hover:border-transparent hover:-translate-y-2 flex flex-col h-full overflow-hidden relative">
                      {/* Badge */}
                      {Math.random() > 0.8 && (
                        <div className="absolute top-6 left-6 z-10 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">SALE</div>
                      )}

                      {/* Image Container */}
                      <div className="aspect-square bg-gray-50/50 rounded-2xl mb-3 md:mb-6 flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-hidden relative">
                        <img
                          src={p.images[0] || 'https://via.placeholder.com/400'}
                          alt={p.title}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      {/* Content */}
                      <div className="mb-2">
                        <div className="hidden sm:flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-5 fill-[#FFB800] text-[#FFB800]" />
                          ))}
                        </div>
                        <h3 className="font-bold text-base md:text-lg text-[#2A4537] group-hover:text-[#2A4736] transition-colors line-clamp-2 leading-snug mb-1">{p.title}</h3>
                        <p className="text-[10px] sm:text-xs font-bold text-[#C5A028] uppercase tracking-wide sm:tracking-widest">{p.stone || p.category}</p>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between mt-auto pt-3 md:pt-4 border-t border-gray-50 ">
                        <span className="text-base sm:text-lg md:text-2xl font-bold text-[#2A4537]">₹{p.price.toLocaleString()}</span>
                        <button
                          onClick={(e) => addToCart(e, p._id)}
                           className="h-9 w-9 rounded-full bg-[#2A4736] flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
                        >
                          <ShoppingBag className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
