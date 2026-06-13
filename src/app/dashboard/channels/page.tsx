'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Business } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MessageCircle, MessagesSquare, Smartphone, Copy, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_API_URL + '/webhook/meta'

const WEBHOOK_STEPS = [
  { step: 1, text: <>Ve a <strong className="text-slate-700">Meta for Developers</strong> → tu app → Webhooks</> },
  { step: 2, text: <>Pega la URL del webhook que aparece arriba</> },
  { step: 3, text: <>Escribe el token de verificación: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">ventasia_webhook</code></> },
  { step: 4, text: <>Suscríbete a: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">messages</code> y <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">messaging_postbacks</code></> },
  { step: 5, text: <>Activa los productos: Messenger, Instagram, WhatsApp Business</> },
] as const

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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const hasWhatsapp = !!business?.whatsappNumber
  const hasFacebook = !!business?.facebookPageId

  const channels = [
    { label: 'WhatsApp Business', icon: MessageCircle, active: hasWhatsapp, iconColor: 'text-emerald-500', ringActive: 'ring-emerald-400', bgActive: 'bg-emerald-50' },
    { label: 'Facebook Messenger', icon: MessagesSquare, active: hasFacebook, iconColor: 'text-blue-500', ringActive: 'ring-blue-400', bgActive: 'bg-blue-50' },
    { label: 'Instagram DM', icon: Smartphone, active: hasFacebook, iconColor: 'text-pink-500', ringActive: 'ring-pink-400', bgActive: 'bg-pink-50' },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Canales de venta</h1>
        <p className="text-sm text-slate-500 mt-0.5">Conecta tus canales de Meta para recibir mensajes automáticamente</p>
      </div>

      {/* Channel status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channels.map(({ label, icon: Icon, active, iconColor, ringActive, bgActive }) => (
          <div
            key={label}
            className={cn(
              'bg-white rounded-xl border shadow-sm p-5 flex flex-col items-center gap-3 text-center transition-all',
              active
                ? `border-transparent ring-2 ${ringActive}`
                : 'border-slate-100'
            )}
          >
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              active ? bgActive : 'bg-slate-100'
            )}>
              <Icon className={cn('h-6 w-6', active ? iconColor : 'text-slate-400')} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">{label}</p>
              <p className={cn('text-xs mt-0.5', active ? 'text-emerald-600 font-medium' : 'text-slate-400')}>
                {active ? 'Conectado' : 'No conectado'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Config form */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Configuración de canales</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingresa los IDs de tus canales de Meta para activar la recepción de mensajes
          </p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Número de WhatsApp Business</Label>
            <Input
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+50412345678"
              className="border-slate-200 focus-visible:ring-indigo-500"
            />
            <p className="text-xs text-slate-400">
              Número registrado en Meta Business (incluye código de país)
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">ID de Página de Facebook</Label>
            <Input
              value={pageId}
              onChange={e => setPageId(e.target.value)}
              placeholder="123456789012345"
              className="border-slate-200 focus-visible:ring-indigo-500"
            />
            <p className="text-xs text-slate-400">
              ID numérico de tu página (también activa Instagram DM si tienes la cuenta vinculada)
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-sm"
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</>
              : 'Guardar canales'}
          </Button>
        </div>
      </div>

      {/* Webhook instructions */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Webhook de Meta</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura esta URL en tu aplicación de Meta Developers
          </p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">URL del Webhook</Label>
            <div className="flex gap-2">
              <Input
                value={WEBHOOK_URL}
                readOnly
                className="font-mono text-xs bg-slate-50 border-slate-200 text-slate-600"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyWebhook}
                aria-label="Copiar URL del webhook"
                className="flex-shrink-0 border-slate-200"
              >
                {copied
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  : <Copy className="h-4 w-4 text-slate-500" />}
              </Button>
            </div>
          </div>

          {/* Numbered stepper */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Pasos para configurar
            </p>
            <ol className="space-y-3">
              {WEBHOOK_STEPS.map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mt-0.5">
                    {step}
                  </span>
                  <span className="text-sm text-slate-600 leading-relaxed">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
