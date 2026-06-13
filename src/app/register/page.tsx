'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, setToken } from '@/lib/api'
import { Business } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Loader2 } from 'lucide-react'

interface RegisterResponse {
  token: string
  business: Business
}

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">VentasIA</h1>
          <p className="text-sm text-gray-500">Crea tu cuenta de negocio gratis</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Crear cuenta</CardTitle>
            <CardDescription>Empieza a automatizar tus ventas en minutos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del negocio *</Label>
                <Input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="Mi Tienda Online"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL del catálogo) *</Label>
                <Input
                  value={form.slug}
                  onChange={e => setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="mi-tienda"
                  required
                />
                <p className="text-xs text-gray-400">Solo letras, números y guiones</p>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="negocio@ejemplo.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label>Contraseña *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
              )}

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</> : 'Crear cuenta gratis'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-violet-600 hover:underline font-medium">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  )
}
