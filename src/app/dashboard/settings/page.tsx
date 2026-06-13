'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Business } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2 } from 'lucide-react'

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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const hasChanges = name.trim() !== '' && name !== business?.name

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-0.5">Información de tu negocio</p>
      </div>

      {/* Business data card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Datos del negocio</h2>
          <p className="text-xs text-slate-500 mt-0.5">Nombre e información visible para tus clientes</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Nombre del negocio</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-slate-200 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Email</Label>
            <Input
              value={business?.email ?? ''}
              readOnly
              className="bg-slate-50 border-slate-200 text-slate-500 cursor-default"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Slug (URL pública del catálogo)</Label>
            <Input
              value={business?.slug ?? ''}
              readOnly
              className="bg-slate-50 border-slate-200 font-mono text-sm text-slate-500 cursor-default"
            />
            <p className="text-xs text-slate-400">
              Tu catálogo público:{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">
                {process.env.NEXT_PUBLIC_API_URL}/api/catalog/{business?.slug}
              </code>
            </p>
          </div>

          {/* Save button — only visible when changes are detected */}
          {hasChanges && (
            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-sm"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</>
                ) : saved ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-300" />Guardado</>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
              {saved && (
                <span className="text-xs text-emerald-600 font-medium">Los cambios se guardaron correctamente</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
