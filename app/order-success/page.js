'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Package, Home } from 'lucide-react'

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-green-600">Order Successful!</CardTitle>
          <CardDescription className="text-lg">Thank you for your purchase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {orderId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="font-mono text-sm font-semibold">{orderId}</p>
            </div>
          )}
          <p className="text-gray-600">
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/profile" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                <Package className="h-4 w-4" />
                View Orders
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Home className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
