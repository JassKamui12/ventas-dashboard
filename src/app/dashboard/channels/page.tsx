'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { Business } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2, MessageCircle, MessagesSquare, Smartphone,
  Copy, CheckCircle2, Wifi, WifiOff, QrCode, Cloud,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const BOT_SERVICE_URL = process.env.NEXT_PUBLIC_BOT_SERVICE_URL ?? ''
const WEBHOOK_URL = (process.env.NEXT_PUBLIC_API_URL ?? '') + '/webhook/meta'
const WEBHOOK_TOKEN = 'ventasia_meta_webhook'

const META_STEPS = [
  { step: 1, text: <>Ve a <strong className="text-slate-700">developers.facebook.com</strong> → Mis Apps → Crear app → Tipo: Negocios</> },
  { step: 2, text: <>En el panel de la app → Agregar productos → WhatsApp → Configuración</> },
  { step: 3, text: <>Copia el <strong className="text-slate-700">Phone Number ID</strong> y el <strong className="text-slate-700">Token de acceso</strong> y pégalos arriba</> },
  { step: 4, text: <>En la sección Webhooks: pega la URL y el token de verificación que aparecen arriba</> },
  { step: 5, text: <>Suscríbete a: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">messages</code> y <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">messaging_postbacks</code></> },
] as const

type Channel = 'META' | 'BAILEYS'

export default function ChannelsPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  // Canal selector
  const [channel, setChannel] = useState<Channel>('META')
  const [changingChannel, setChangingChannel] = useState(false)

  // META fields
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [whatsappToken, setWhatsappToken] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)

  // BAILEYS / QR
  const [isConnected, setIsConnected] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Facebook Page
  const [pageId, setPageId] = useState('')
  const [savingPage, setSavingPage] = useState(false)

  // Error
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<Business>('/api/me').then(biz => {
      setBusiness(biz)
      setChannel(biz.whatsappChannel ?? 'META')
      setPhoneNumberId(biz.phoneNumberId ?? '')
      setWhatsappToken(biz.whatsappToken ?? '')
      setPageId(biz.facebookPageId ?? '')
    }).catch(() => setError('No se pudo cargar la configuración')).finally(() => setLoading(false))
  }, [])

  // Polling del QR de Baileys
  useEffect(() => {
    if (!polling || !business) return

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BOT_SERVICE_URL}/session/${business.id}/qr`)
        const data = await res.json() as { connected?: boolean; qr?: string }
        if (data.connected) {
          setIsConnected(true)
          setQrCode(null)
          stopPolling()
        } else if (data.qr) {
          setQrCode(data.qr)
        }
      } catch {
        // El bot-service puede no estar disponible aún — seguir intentando
      }
    }, 3000)

    return () => stopPolling()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling, business?.id])

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setPolling(false)
  }

  async function handleSelectChannel(ch: Channel) {
    if (ch === channel || changingChannel) return
    setChangingChannel(true)
    setError(null)
    try {
      const updated = await api<Business>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({ whatsappChannel: ch }),
      })
      setBusiness(updated)
      setChannel(ch)
      // Resetear estado de QR al cambiar de canal
      setQrCode(null)
      setIsConnected(false)
      stopPolling()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cambiar canal')
    } finally {
      setChangingChannel(false)
    }
  }

  async function handleSaveMeta() {
    setSavingMeta(true)
    setError(null)
    try {
      const updated = await api<Business>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({
          phoneNumberId: phoneNumberId.trim() || null,
          whatsappToken: whatsappToken.trim() || null,
        }),
      })
      setBusiness(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleSavePage() {
    setSavingPage(true)
    setError(null)
    try {
      const updated = await api<Business>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({ facebookPageId: pageId.trim() || null }),
      })
      setBusiness(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSavingPage(false)
    }
  }

  async function handleConnect() {
    if (!business) return
    setConnecting(true)
    setError(null)
    setQrCode(null)
    try {
      await fetch(`${BOT_SERVICE_URL}/session/${business.id}/connect`, { method: 'POST' })
      setPolling(true)
    } catch {
      setError('No se pudo conectar con el servicio de WhatsApp. Intenta de nuevo.')
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    if (!business) return
    setDisconnecting(true)
    setError(null)
    stopPolling()
    try {
      await fetch(`${BOT_SERVICE_URL}/session/${business.id}`, { method: 'DELETE' })
      setIsConnected(false)
      setQrCode(null)
    } catch {
      setError('Error al desconectar la sesión.')
    } finally {
      setDisconnecting(false)
    }
  }

  function copyText(text: string, setter: (v: boolean) => void) {
    navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const hasWhatsapp = channel === 'META'
    ? !!(business?.phoneNumberId)
    : isConnected
  const hasFacebook = !!(business?.facebookPageId)

  const channelCards = [
    {
      label: 'WhatsApp Business',
      icon: MessageCircle,
      active: hasWhatsapp,
      iconColor: 'text-emerald-500',
      ringActive: 'ring-emerald-400',
      bgActive: 'bg-emerald-50',
    },
    {
      label: 'Facebook Messenger',
      icon: MessagesSquare,
      active: hasFacebook,
      iconColor: 'text-blue-500',
      ringActive: 'ring-blue-400',
      bgActive: 'bg-blue-50',
    },
    {
      label: 'Instagram DM',
      icon: Smartphone,
      active: hasFacebook,
      iconColor: 'text-pink-500',
      ringActive: 'ring-pink-400',
      bgActive: 'bg-pink-50',
    },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Canales de venta</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Elige cómo conectar WhatsApp y activa tus canales de mensajería
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Sección 1: Selector de canal WhatsApp */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Canal de WhatsApp</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Elige cómo quieres conectar tu número de WhatsApp al bot
          </p>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opción META */}
            <button
              onClick={() => handleSelectChannel('META')}
              disabled={changingChannel}
              aria-pressed={channel === 'META'}
              className={cn(
                'relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all disabled:opacity-60',
                channel === 'META'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              {changingChannel && channel !== 'META' && (
                <Loader2 className="absolute right-3 top-3 h-3.5 w-3.5 animate-spin text-indigo-500" />
              )}
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                channel === 'META' ? 'bg-indigo-100' : 'bg-slate-100'
              )}>
                <Cloud className={cn('h-5 w-5', channel === 'META' ? 'text-indigo-600' : 'text-slate-400')} />
              </div>
              <div>
                <p className={cn('text-sm font-semibold', channel === 'META' ? 'text-indigo-700' : 'text-slate-700')}>
                  Meta Cloud API
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Número verificado en Meta Business. Estable y recomendado para negocios en crecimiento.
                </p>
              </div>
              {channel === 'META' && (
                <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-indigo-500" />
              )}
            </button>

            {/* Opción BAILEYS */}
            <button
              onClick={() => handleSelectChannel('BAILEYS')}
              disabled={changingChannel}
              aria-pressed={channel === 'BAILEYS'}
              className={cn(
                'relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all disabled:opacity-60',
                channel === 'BAILEYS'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              {changingChannel && channel !== 'BAILEYS' && (
                <Loader2 className="absolute right-3 top-3 h-3.5 w-3.5 animate-spin text-indigo-500" />
              )}
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                channel === 'BAILEYS' ? 'bg-indigo-100' : 'bg-slate-100'
              )}>
                <QrCode className={cn('h-5 w-5', channel === 'BAILEYS' ? 'text-indigo-600' : 'text-slate-400')} />
              </div>
              <div>
                <p className={cn('text-sm font-semibold', channel === 'BAILEYS' ? 'text-indigo-700' : 'text-slate-700')}>
                  WhatsApp Numero Normal
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Cualquier numero de WhatsApp. Escanea un QR con tu telefono para vincularlo.
                </p>
              </div>
              {channel === 'BAILEYS' && (
                <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-indigo-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sección 2: Configuración según canal */}
      {channel === 'META' ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Credenciales de Meta Cloud API</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Obtén estos datos en Meta for Developers → tu app → WhatsApp → Configuracion
            </p>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Phone Number ID</Label>
              <Input
                value={phoneNumberId}
                onChange={e => setPhoneNumberId(e.target.value)}
                placeholder="12345678901234"
                className="border-slate-200 focus-visible:ring-indigo-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-400">
                ID numerico del numero en Meta Developers (no es el numero de telefono)
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Access Token</Label>
              <Input
                type="password"
                value={whatsappToken}
                onChange={e => setWhatsappToken(e.target.value)}
                placeholder="EAAxxxxxxxxxxxxx..."
                className="border-slate-200 focus-visible:ring-indigo-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-400">
                Token de acceso temporal o permanente de Meta Business Suite
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>El token temporal expira en 24 horas.</strong> Para produccion, genera un token permanente desde Meta Business Suite → Configuracion del sistema → Usuarios del sistema.
              </p>
            </div>

            <Button
              onClick={handleSaveMeta}
              disabled={savingMeta}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-sm"
            >
              {savingMeta
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</>
                : 'Guardar credenciales'}
            </Button>
          </div>
        </div>
      ) : (
        /* BAILEYS: QR connect */
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Conexion por codigo QR</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vincula tu numero de WhatsApp escaneando el codigo QR con tu telefono
            </p>
          </div>
          <div className="px-6 py-5">
            {isConnected ? (
              /* Estado: conectado */
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 ring-2 ring-emerald-400">
                    <Wifi className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Conectado</p>
                    {business?.whatsappNumber && (
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{business.whatsappNumber}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Activo
                  </span>
                </div>
                <Button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-9 text-sm"
                >
                  {disconnecting
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Desconectando...</>
                    : <><WifiOff className="h-4 w-4 mr-2" />Desconectar</>}
                </Button>
              </div>
            ) : (
              /* Estado: desconectado */
              <div className="space-y-5">
                {/* Advertencia */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Importante:</strong> Tu telefono debe permanecer conectado a internet mientras el bot este activo. Si se apaga o pierde conexion, el bot se desconectara.
                  </p>
                </div>

                {/* QR o boton de conectar */}
                {qrCode ? (
                  <div className="flex flex-col items-center gap-4 py-2">
                    <img
                      src={qrCode}
                      alt="Codigo QR para vincular WhatsApp"
                      className="w-56 h-56 mx-auto rounded-lg border border-slate-200 shadow-sm"
                    />
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-slate-700">Escanea este codigo QR</p>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                        Abre WhatsApp en tu telefono → toca los tres puntos (⋮) → Dispositivos vinculados → Vincular dispositivo → escanea este QR
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Esperando escaneo...
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                      <QrCode className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-700">Numero no vinculado</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Haz clic en el boton para generar el codigo QR
                      </p>
                    </div>
                    <Button
                      onClick={handleConnect}
                      disabled={connecting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-sm"
                    >
                      {connecting
                        ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Conectando...</>
                        : <><QrCode className="h-4 w-4 mr-2" />Conectar numero</>}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección 3: Facebook / Instagram */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Facebook e Instagram</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Activa Facebook Messenger e Instagram DM con el ID de tu Pagina de Facebook
          </p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">ID de Pagina de Facebook</Label>
            <Input
              value={pageId}
              onChange={e => setPageId(e.target.value)}
              placeholder="123456789012345"
              className="border-slate-200 focus-visible:ring-indigo-500 font-mono text-sm"
            />
            <p className="text-xs text-slate-400">
              ID numerico de tu pagina. Tambien activa Instagram DM si tienes la cuenta vinculada.
            </p>
          </div>
          <Button
            onClick={handleSavePage}
            disabled={savingPage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-sm"
          >
            {savingPage
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</>
              : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Estado de canales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channelCards.map(({ label, icon: Icon, active, iconColor, ringActive, bgActive }) => (
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

      {/* Sección 4: Webhook Meta (solo cuando canal = META) */}
      {channel === 'META' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Webhook de Meta</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura esta URL en tu aplicacion de Meta Developers para recibir mensajes
            </p>
          </div>
          <div className="px-6 py-5 space-y-5">
            {/* URL del webhook */}
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
                  onClick={() => copyText(WEBHOOK_URL, setCopiedWebhook)}
                  aria-label="Copiar URL del webhook"
                  className="flex-shrink-0 border-slate-200"
                >
                  {copiedWebhook
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    : <Copy className="h-4 w-4 text-slate-500" />}
                </Button>
              </div>
            </div>

            {/* Token de verificacion */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Token de verificacion</Label>
              <div className="flex gap-2">
                <Input
                  value={WEBHOOK_TOKEN}
                  readOnly
                  className="font-mono text-xs bg-slate-50 border-slate-200 text-slate-600"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyText(WEBHOOK_TOKEN, setCopiedToken)}
                  aria-label="Copiar token de verificacion"
                  className="flex-shrink-0 border-slate-200"
                >
                  {copiedToken
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    : <Copy className="h-4 w-4 text-slate-500" />}
                </Button>
              </div>
            </div>

            {/* Stepper */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Pasos para configurar
              </p>
              <ol className="space-y-3">
                {META_STEPS.map(({ step, text }) => (
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
      )}
    </div>
  )
}
