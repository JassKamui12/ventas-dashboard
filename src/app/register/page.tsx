'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, setToken } from '@/lib/api'
import { Business } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Zap, MessageCircle, MessagesSquare, Smartphone } from 'lucide-react'

interface RegisterResponse {
  token: string
  business: Business
}

const FEATURES = [
  { icon: MessageCircle, label: 'WhatsApp Business automático', color: 'text-emerald-400' },
  { icon: MessagesSquare, label: 'Facebook Messenger integrado', color: 'text-blue-400' },
  { icon: Smartphone, label: 'Instagram DM con IA', color: 'text-pink-400' },
] as const

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', slug: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setField(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    if (field === 'name' && !form.slug) {
      setForm(f => ({
        ...f,
        name: value,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setToken(data.token)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
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
              Empieza gratis.<br />Vende más desde el día uno.
            </h2>
            <p className="mt-3 text-slate-400 text-base leading-relaxed">
              Crea tu cuenta en segundos y conecta tus canales de venta para empezar a automatizar.
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
            <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
            <p className="mt-1 text-sm text-slate-500">Automatiza tus ventas en minutos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Nombre del negocio *</Label>
              <Input
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="Mi Tienda Online"
                required
                className="h-10 border-slate-200 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Slug (URL del catálogo) *</Label>
              <Input
                value={form.slug}
                onChange={e => setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="mi-tienda"
                required
                className="h-10 border-slate-200 focus-visible:ring-indigo-500"
              />
              <p className="text-xs text-slate-400">Solo letras, números y guiones</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                placeholder="negocio@ejemplo.com"
                required
                autoComplete="email"
                className="h-10 border-slate-200 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Contraseña *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                autoComplete="new-password"
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</>
              ) : (
                'Crear cuenta gratis'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
