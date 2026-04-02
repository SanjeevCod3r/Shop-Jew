'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { Store, Mail, Lock, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setAuth(data.user, data.token)
        toast.success('Login successful!')
        
        if (data.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 pt-24 md:pt-4 overflow-hidden bg-[#2A4537]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2A4736]/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C5A028]/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      
      {/* Back to Home */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-white/60 hover:text-[#C5A028] transition-all group z-30"
      >
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-[#C5A028]/50 group-hover:bg-[#C5A028]/10 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </div>
        <span className="text-xs uppercase tracking-[0.2em] font-bold">Back to Home</span>
      </Link>

      <Card className="w-full max-w-md relative z-10 border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A028] to-transparent opacity-50"></div>
        
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
            <Link
            href="/"
            className="flex items-center text-[26px] font-bold text-black"
          >
             <img src="/images/Logo2.png" alt="Cezore" className="h-8 w-15" />
           Cezore
          </Link>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight text-[#C5A028]">
            The <span className="text-[#C5A028]">Cezore</span> Experience
          </CardTitle>
          <CardDescription className="text-black font-light tracking-wide">
            Sign in to access your luxury sanctuary
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="relative">
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-xs uppercase tracking-widest font-bold">
                Identity (Email)
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C5A028]/60 group-focus-within:text-[#C5A028] transition-colors" />
                <Input
                  id="email"
                  type="text"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400 focus:border-[#C5A028]/50 focus:ring-1 focus:ring-[#C5A028]/30 transition-all rounded-xl h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-xs uppercase tracking-widest font-bold">
                Access Key (Password)
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C5A028]/60 group-focus-within:text-[#C5A028] transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400 focus:border-[#C5A028]/50 focus:ring-1 focus:ring-[#C5A028]/30 transition-all rounded-xl h-12"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="" size="sm" className="text-[#C5A028] hover:text-[#e4be3e] text-xs font-medium transition-colors">
                Forgot access key?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 pb-10 px-8">
            <Button 
              type="submit" 
              className="w-full bg-[#2A4736] hover:bg-[#355c46] text-white font-bold h-12 rounded-xl shadow-[0_4px_20px_0_rgba(42,71,54,0.4)] transition-all active:scale-[0.98] border border-[#C5A028]/20" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                'Login '
              )}
            </Button>

            <p className="text-sm text-center text-gray-400">
              Join the elite.{' '}
              <Link href="/signup" className="text-[#C5A028] hover:text-[#e4be3e] font-bold transition-colors">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      
      {/* Decorative Bottom Text */}
      <div className="absolute bottom-6 text-gray-700 text-[10px] uppercase tracking-[0.5em] font-bold">
        © Cezore Artisan Jewelers - Since 1994
      </div>
    </div>
  )
}
