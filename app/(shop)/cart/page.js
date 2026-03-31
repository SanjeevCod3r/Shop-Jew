'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore, useCartStore } from '@/lib/store'
import { toast } from 'sonner'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck, Truck, RefreshCcw } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { user, token, hydrated } = useAuthStore()
  const { cartItems, setCart, clearCart } = useCartStore()
  const [cart, setLocalCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!hydrated) return;
    
    // Web doesn't require auth for cart, but we fetch from server if logged in
    if (token) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [hydrated, token]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.cart) {
        setLocalCart(data.cart)
        setCart(data.cart.items || [])
      }
    } catch (error) {
      toast.error('Error loading cart')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    
    setUpdating(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: newQuantity })
      })

      const data = await response.json()
      if (response.ok) {
        setLocalCart(data.cart)
        setCart(data.cart.items || [])
        toast.success('Cart updated')
      } else {
        toast.error(data.error || 'Failed to update cart')
      }
    } catch (error) {
      toast.error('Error updating cart')
    } finally {
      setUpdating(false)
    }
  }

  const removeItem = async (productId) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (response.ok) {
        setLocalCart(data.cart)
        setCart(data.cart.items || [])
        toast.success('Item removed from cart')
      } else {
        toast.error(data.error || 'Failed to remove item')
      }
    } catch (error) {
      toast.error('Error removing item')
    } finally {
      setUpdating(false)
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-[#111]">
      {/* Header */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-6">
          <Link href="/">
            <Button variant="ghost" className="text-black-400 hover:bg-white/10 gap-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-full px-8 py-6">
              <ArrowLeft className="h-4 w-4" />
              BACK TO THE VAULT
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="mt-[-10] text-[#C5A028] text-[12px] font-black uppercase tracking-[0.4em] mb-4">Your Selection</span>
          <h1 className="text-[40px] lg:text-[60px] font-black text-[#2A4537] leading-none tracking-tighter uppercase mb-2">
            Shopping Bag
          </h1>
          <div className="w-20 h-1.5 bg-[#C5A028] rounded-full"></div>
        </div>

        {!cart?.items || cart.items.length === 0 ? (
          <Card className="rounded-[48px] border border-gray-100 shadow-2xl overflow-hidden py-24 text-center max-w-3xl mx-auto">
            <CardContent>
              <ShoppingCart className="h-20 w-20 mx-auto text-gray-200 mb-8" strokeWidth={1} />
              <h2 className="text-[28px] font-black text-[#111] tracking-tighter uppercase mb-4">Your bag is currently empty</h2>
              <p className="text-gray-400 text-sm font-medium italic mb-10">Add some masterpieces to your vault to continue.</p>
              <Link href="/">
                <Button className="bg-[#111] hover:bg-[#C5A028] text-white hover:text-[#111] rounded-full px-12 py-7 text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">
                  Browse Masterpieces
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              {cart.items.map((item) => (
                <Card key={item._id} className="rounded-[40px] border border-gray-100 shadow-xl overflow-hidden group hover:border-[#C5A028] transition-all duration-500">
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row gap-8">
                      <div className="w-full sm:w-40 h-40 flex-shrink-0 bg-[#FDFDFD] rounded-[32px] overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform duration-500 shadow-sm relative">
                        <img
                          src={item.productId?.images?.[0] || 'https://via.placeholder.com/150'}
                          alt={item.productId?.title}
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[#C5A028] text-[12px] font-black uppercase tracking-[0.3em] block mb-1">
                              {item.productId?.category || 'Premium Jewelry'}
                            </span>
                            <h3 className="text-[22px] font-black text-[#2A4537] leading-tight uppercase tracking-tight group-hover:text-[#2A4736] transition-colors">{item.productId?.title}</h3>
                            {item.size && (
                              <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-black bg-[#2A4537] text-white px-3 py-1 rounded-full">
                                Size: {item.size}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 rounded-full text-black-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                            onClick={() => removeItem(item.productId._id)}
                            disabled={updating}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        <div className="mt-auto flex items-end justify-between pt-6 border-t border-gray-50">
                          <div className="flex items-center bg-gray-50/80 rounded-full p-1.5 border border-gray-100/50">
                            <Button
                              variant="ghost"
                              className="h-9 w-9 rounded-full text-[#111] hover:bg-white transition-all shadow-sm disabled:opacity-30"
                              onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                              disabled={updating || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center font-bold text-[14px] text-[#111]">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              className="h-9 w-9 rounded-full text-[#111] hover:bg-white transition-all shadow-sm disabled:opacity-30"
                              onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                              disabled={updating || item.quantity >= (item.productId?.stock || 99)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-[24px] font-black text-[#2A4736] leading-none mb-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">₹{item.price.toLocaleString()} per unit</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
 
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border border-black-100 shadow-2xl overflow-hidden p-8 sticky top-32 bg-white text-white">
                <CardHeader className="px-0 pt-0 pb-8 border-b border-white/10 mb-8">
                  <h3 className="text-[20px] text-black uppercase tracking-widest">Summary</h3>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-black text-[11px] font-black uppercase tracking-widest">Subtotal ({cart.items.length} units)</span>
                    <span className="text-[20px]  text-black font-bold tracking-tight">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black text-[11px] font-black uppercase tracking-widest">Premium Shipping</span>
                    <span className="text-[12px] font-black text-[#C5A028] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-[#C5A028]/30">COMPLIMENTARY</span>
                  </div>
                  
                  {/* Luxury Assurance Panel */}
                  <div className="py-8 space-y-4 border-y border-white/10">
                    <div className="flex items-center gap-4 text-[10px] font-medium text-gray-400">
                      <ShieldCheck className="h-4 w-4 text-[#C5A028]" />
                      <span className="uppercase tracking-widest">Authenticated Mastery</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-medium text-gray-400">
                      <Truck className="h-4 w-4 text-[#C5A028]" />
                      <span className="uppercase tracking-widest">Priority Discreet Shipping</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-medium text-gray-400">
                      <RefreshCcw className="h-4 w-4 text-[#C5A028]" />
                      <span className="uppercase tracking-widest">14-Day Boutique Exchange</span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-black text-[10px] font-black uppercase tracking-widest">Total Investment</span>
                        <span className="text-[36px] text-black font-black leading-none tracking-tighter">₹{total.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-[#C5A028] font-bold uppercase tracking-[0.3em] text-right">Includes all regional taxes</p>
                  </div>
                </CardContent>
                <CardFooter className="px-0 pt-10">
                  <Link href="/checkout" className="w-full">
                    <Button className="w-full h-18 bg-[#C5A028] hover:bg-[#C5A028] text-[#111] rounded-[5px] text-[19px] font-black uppercase tracking-[0.3em] transition-all shadow-xl group/check active:scale-95">
                      Check Out
                      <ArrowRight className="h-5 w-5 ml-4 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
