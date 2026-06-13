'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, setToken } from '@/lib/api'
import { Business } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Zap, MessageCircle, MessagesSquare, Smartphone } from 'lucide-react'

interface LoginResponse {
  token: string
  business: Business
}

const FEATURES = [
  { icon: MessageCircle, label: 'WhatsApp Business automático', color: 'text-emerald-400' },
  { icon: MessagesSquare, label: 'Facebook Messenger integrado', color: 'text-blue-400' },
  { icon: Smartphone, label: 'Instagram DM con IA', color: 'text-pink-400' },
] as const

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setToken(data.token)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT panel — dark branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-500/30">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          <span className="text-lg font-semibold text-white">VentasIA</span>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Automatiza tus ventas<br />con inteligencia artificial
            </h2>
            <p className="mt-3 text-slate-400 text-base leading-relaxed">
              Responde a tus clientes las 24 horas, gestiona pedidos y haz crecer tu negocio sin esfuerzo.
            </p>
          </div>

          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, color }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white/5">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <span className="text-sm text-slate-300">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} VentasIA. Todos los derechos reservados.
        </p>
      </div>

      {/* RIGHT panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">VentasIA</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-slate-500">Ingresa con tu cuenta de negocio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="negocio@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10 border-slate-200 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-10 border-slate-200 focus-visible:ring-indigo-500"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ingresando...</>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
