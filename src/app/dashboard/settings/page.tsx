'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Business } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api<Business>('/api/me').then(biz => {
      setBusiness(biz)
      setName(biz.name)
    }).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await api<Business>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() }),
      })
      setBusiness(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Información de tu negocio</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del negocio</CardTitle>
          <CardDescription>Nombre e información visible para tus clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del negocio</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={business?.email ?? ''} readOnly className="bg-gray-50 text-gray-500" />
          </div>
          <div className="space-y-2">
            <Label>Slug (URL pública del catálogo)</Label>
            <Input value={business?.slug ?? ''} readOnly className="bg-gray-50 font-mono text-sm text-gray-500" />
            <p className="text-xs text-gray-400">
              Tu catálogo público: {process.env.NEXT_PUBLIC_API_URL}/api/catalog/{business?.slug}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || name === business?.name}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</> : saved ? '¡Guardado!' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
