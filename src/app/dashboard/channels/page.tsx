'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Business } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Circle, Loader2, MessageSquare, Copy } from 'lucide-react'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_API_URL + '/webhook/meta'

export default function ChannelsPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [pageId, setPageId] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api<Business>('/api/me').then(biz => {
      setBusiness(biz)
      setWhatsapp(biz.whatsappNumber ?? '')
      setPageId(biz.facebookPageId ?? '')
    }).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await api<Business>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({
          whatsappNumber: whatsapp.trim() || null,
          facebookPageId: pageId.trim() || null,
        }),
      })
      setBusiness(updated)
    } finally {
      setSaving(false)
    }
  }

  function copyWebhook() {
    navigator.clipboard.writeText(WEBHOOK_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
  }

  const hasWhatsapp = !!business?.whatsappNumber
  const hasFacebook = !!business?.facebookPageId

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Canales de venta</h1>
        <p className="text-sm text-gray-500 mt-1">Conecta tus canales de Meta para recibir mensajes automáticamente</p>
      </div>

      {/* Channel status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'WhatsApp Business', icon: MessageSquare, active: hasWhatsapp, color: 'text-green-600' },
          { label: 'Facebook Messenger', icon: MessageSquare, active: hasFacebook, color: 'text-blue-600' },
          { label: 'Instagram DM', icon: MessageSquare, active: hasFacebook, color: 'text-pink-600' },
        ].map(({ label, icon: Icon, active, color }) => (
          <Card key={label} className={`border-2 ${active ? 'border-green-200' : 'border-gray-100'}`}>
            <CardContent className="flex items-center gap-3 p-4">
              {active
                ? <CheckCircle2 className={`h-5 w-5 ${color} flex-shrink-0`} />
                : <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />}
              <p className="text-sm font-medium text-gray-700">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Config form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuración de canales</CardTitle>
          <CardDescription>
            Ingresa los IDs de tus canales de Meta para activar la recepción de mensajes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Número de WhatsApp Business</Label>
            <Input
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+50412345678"
            />
            <p className="text-xs text-gray-400">
              Número registrado en Meta Business (incluye código de país)
            </p>
          </div>

          <div className="space-y-2">
            <Label>ID de Página de Facebook</Label>
            <Input
              value={pageId}
              onChange={e => setPageId(e.target.value)}
              placeholder="123456789012345"
            />
            <p className="text-xs text-gray-400">
              ID numérico de tu página (también activa Instagram DM si tienes la cuenta vinculada)
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</> : 'Guardar canales'}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhook de Meta</CardTitle>
          <CardDescription>
            Configura esta URL en tu aplicación de Meta Developers para recibir mensajes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL del Webhook</Label>
            <div className="flex gap-2">
              <Input value={WEBHOOK_URL} readOnly className="font-mono text-xs bg-gray-50" />
              <Button variant="outline" size="icon" onClick={copyWebhook}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 space-y-2 text-sm text-blue-800">
            <p className="font-semibold">Pasos para configurar el Webhook:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Ve a <strong>Meta for Developers</strong> → tu app → Webhooks</li>
              <li>Pega la URL del webhook arriba</li>
              <li>Escribe el token de verificación: <code className="bg-blue-100 px-1 rounded">ventasia_webhook</code></li>
              <li>Suscríbete a: <code className="bg-blue-100 px-1 rounded">messages</code> y <code className="bg-blue-100 px-1 rounded">messaging_postbacks</code></li>
              <li>Activa los productos: Messenger, Instagram, WhatsApp Business</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
