'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, useCartStore } from '@/lib/store'
import { toast } from 'sonner'
import { ArrowLeft, CreditCard, Shield, Tag, X } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, token, hydrated } = useAuthStore()
  const { clearCart } = useCartStore()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  })

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.push('/login');
      return;
    }
    fetchCart();
    loadRazorpayScript();
  }, [hydrated, token, router]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.cart) {
        setCart(data.cart)
        if (data.cart.items.length === 0) {
          toast.error('Your cart is empty')
          router.push('/cart')
        }
      }
    } catch (error) {
      toast.error('Error loading cart')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    setApplyingCoupon(true)
    try {
      const total = calculateTotal()
      const response = await fetch(`/api/coupons/validate/${couponCode}?cartTotal=${total}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setAppliedCoupon(data.coupon)
        setDiscount(data.discount)
        toast.success(`Coupon applied! You saved ₹${data.discount}`)
      } else {
        toast.error(data.error || 'Invalid coupon code')
      }
    } catch (error) {
      toast.error('Error applying coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode('')
    toast.success('Coupon removed')
  }


  const handlePayment = async () => {
    // Validate address
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.zipCode) {
      toast.error('Please fill all address fields')
      return
    }

    setProcessing(true)

    try {
      const total = calculateTotal()
      const finalAmount = total - discount

      // Create Razorpay order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: finalAmount })
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100, // Razorpay expects amount in paise
        currency: orderData.currency,
        name: 'PremiumStore',
        description: 'Purchase from PremiumStore',
        order_id: orderData.orderId,
        handler: async function (response) {
          // Payment successful, verify on backend
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  items: cart.items.map(item => ({
                    productId: item.productId._id,
                    title: item.productId.title,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.productId.images[0],
                    size: item.size || null
                  })),
                  totalAmount: total,
                  discount: discount,
                  couponCode: appliedCoupon?.code || null,
                  finalAmount: finalAmount,
                  address: address
                }
              })
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok) {
              clearCart()
              toast.success('Order placed successfully!')
              router.push(`/order-success?orderId=${verifyData.orderId}`)
            } else {
              toast.error(verifyData.error || 'Payment verification failed')
            }
          } catch (error) {
            toast.error('Error verifying payment')
          } finally {
            setProcessing(false)
          }
        },
        prefill: {
          name: address.name,
          contact: address.phone
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false)
            toast.info('Payment cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Error processing payment')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/cart">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl text-[#2A4537] font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Address */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription>Enter your delivery address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart?.items?.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.productId?.images?.[0] || 'https://via.placeholder.com/100'}
                        alt={item.productId?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.productId?.title}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.size && (
                        <span className="inline-block text-xs font-bold bg-[#2A4537] text-white px-2 py-0.5 rounded-full mt-1">
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Code */}
                <div className="space-y-2">
                  <Label>Have a coupon code?</Label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button
                        onClick={applyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        variant="outline"
                        className="gap-2"
                      >
                        <Tag className="h-4 w-4" />
                        {applyingCoupon ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-[#C5A028] border border-[#C5A028] rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-white" />
                        <div>
                          <p className="font-semibold text-white">{appliedCoupon.code}</p>
                          {appliedCoupon.description && (
                            <p className="text-xs text-white">{appliedCoupon.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={removeCoupon}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black">Subtotal</span>
                    <span className="font-semibold">₹{total}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#C5A028]">
                      <span>Discount</span>
                      <span className="font-semibold">-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-black">Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Tax</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-black">₹{total - discount}</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    Your payment information is secure and encrypted
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#C5A028] hover:bg-[#C5A028] gap-2"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? (
                    'Processing...'
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay ₹{total - discount}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
