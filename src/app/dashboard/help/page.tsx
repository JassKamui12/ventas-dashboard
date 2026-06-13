'use client'

import { useState } from 'react'
import {
  BookOpen, ChevronDown, ChevronRight, MessageCircle, MessagesSquare,
  Smartphone, CreditCard, Package, ClipboardList, Zap, AlertTriangle,
  CheckCircle2, Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'

const WEBHOOK_URL = (process.env.NEXT_PUBLIC_API_URL ?? '') + '/webhook/meta'
const VERIFY_TOKEN = 'ventasia_meta_webhook'

const sections = [
  { id: 'que-es', label: '¿Qué es VentasIA?' },
  { id: 'primeros-pasos', label: 'Primeros pasos' },
  { id: 'catalogo', label: 'Catálogo de productos' },
  { id: 'whatsapp', label: 'Conectar WhatsApp' },
  { id: 'facebook', label: 'Facebook e Instagram' },
  { id: 'pagos', label: 'Métodos de pago' },
  { id: 'ordenes', label: 'Gestionar órdenes' },
  { id: 'bot', label: 'Cómo funciona el bot' },
  { id: 'faq', label: 'Preguntas frecuentes' },
]

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mt-0.5">
        {n}
      </span>
      <span className="text-sm text-slate-600 leading-relaxed">{children}</span>
    </li>
  )
}

function SectionCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="bg-white rounded-xl border border-slate-100 shadow-sm scroll-mt-6">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4 text-sm text-slate-600">{children}</div>
    </section>
  )
}

function Badge({ children, color = 'amber' }: { children: React.ReactNode; color?: 'amber' | 'emerald' | 'indigo' }) {
  const cls = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  }[color]
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${cls}`}>
      {children}
    </span>
  )
}

function Alert({ children, type = 'warning' }: { children: React.ReactNode; type?: 'warning' | 'info' }) {
  return (
    <div className={cn(
      'flex gap-3 rounded-lg px-4 py-3 text-sm',
      type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
    )}>
      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  )
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-700 font-mono truncate">
          {value}
        </code>
        <button
          onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50"
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
        </button>
      </div>
    </div>
  )
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-slate-800 hover:text-indigo-600 transition-colors"
      >
        {q}
        {open ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && <p className="pb-3 text-sm text-slate-600 leading-relaxed">{children}</p>}
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          Manual de Usuario
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Guía completa para configurar VentasIA y empezar a vender automáticamente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Sidebar navegación */}
        <nav className="hidden lg:block sticky top-6 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contenido</p>
          </div>
          <ul className="py-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                >
                  <ChevronRight className="h-3 w-3 text-slate-300" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contenido */}
        <div className="space-y-5 min-w-0">

          {/* 1. Qué es VentasIA */}
          <SectionCard id="que-es" title="¿Qué es VentasIA?">
            <p>
              VentasIA es una plataforma que permite a pequeños negocios en Honduras automatizar
              sus ventas 24/7 por WhatsApp, Facebook Messenger e Instagram. El bot atiende a tus
              clientes, muestra tu catálogo, toma pedidos y procesa pagos — sin que tú tengas que
              estar pendiente del teléfono.
            </p>

            {/* Diagrama de flujo */}
            <div className="bg-slate-50 rounded-lg p-4 overflow-x-auto">
              <div className="flex items-center gap-1 text-xs font-medium text-slate-600 min-w-max">
                {[
                  { icon: MessageCircle, label: 'Cliente escribe' },
                  null,
                  { icon: Zap, label: 'Bot responde' },
                  null,
                  { icon: Package, label: 'Elige producto' },
                  null,
                  { icon: CreditCard, label: 'Paga' },
                  null,
                  { icon: ClipboardList, label: 'Orden creada' },
                ].map((item, i) =>
                  item === null ? (
                    <ChevronRight key={i} className="h-4 w-4 text-slate-300 flex-shrink-0" />
                  ) : (
                    <div key={i} className="flex flex-col items-center gap-1 px-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                        <item.icon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-slate-500 text-center">{item.label}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <p>
              El bot está impulsado por inteligencia artificial (Groq Llama 3.3) y puede entender
              mensajes en español natural — no necesitas respuestas exactas de tus clientes.
            </p>
          </SectionCard>

          {/* 2. Primeros pasos */}
          <SectionCard id="primeros-pasos" title="Primeros pasos — Crear tu cuenta">
            <ol className="space-y-3">
              <Step n={1}>
                Ve a <strong className="text-slate-700">ventas.agendaloia.com/register</strong>
              </Step>
              <Step n={2}>
                Completa el formulario: <strong className="text-slate-700">nombre del negocio</strong>,{' '}
                <strong className="text-slate-700">slug</strong> (tu URL única),{' '}
                <strong className="text-slate-700">email</strong> y{' '}
                <strong className="text-slate-700">contraseña</strong>
              </Step>
              <Step n={3}>
                El <strong className="text-slate-700">slug</strong> es como se identificará tu negocio
                en el sistema. Usa solo letras, números y guiones. Ejemplo:{' '}
                <code className="bg-slate-100 px-1 rounded text-slate-700">mi-tienda-hn</code>
              </Step>
              <Step n={4}>
                Haz clic en <strong className="text-slate-700">"Crear cuenta gratis"</strong>.
                Entrarás directamente al dashboard.
              </Step>
            </ol>
            <Alert type="info">
              Plan gratuito: hasta 10 conversaciones activas por mes. Para más, actualiza al Plan Pro.
            </Alert>
          </SectionCard>

          {/* 3. Catálogo */}
          <SectionCard id="catalogo" title="Configurar tu catálogo de productos">
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-slate-700 mb-2">Agregar productos</p>
                <ol className="space-y-2">
                  <Step n={1}>En el menú lateral, haz clic en <strong className="text-slate-700">Productos</strong></Step>
                  <Step n={2}>Clic en <strong className="text-slate-700">"Nuevo producto"</strong></Step>
                  <Step n={3}>Completa: nombre, descripción, precio en Lempiras y stock disponible</Step>
                  <Step n={4}>Haz clic en la imagen del producto para subir una foto (máx. 5MB)</Step>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-2">Buenas prácticas</p>
                <ul className="space-y-1.5">
                  {[
                    'Agrega imagen a cada producto — aumenta la conversión considerablemente',
                    'Usa nombres descriptivos: "Camisa polo talla M azul" en vez de "Camisa"',
                    'Mantén el stock actualizado para evitar órdenes de productos agotados',
                    'Solo los productos marcados como Activos aparecen en el catálogo del bot',
                    'El bot muestra hasta 10 productos por mensaje',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>

          {/* 4. WhatsApp */}
          <SectionCard id="whatsapp" title="Conectar WhatsApp">
            <p>VentasIA soporta dos formas de conectar WhatsApp. Elige la que se adapte a tu negocio:</p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-slate-800 text-sm mb-1">Opción A — Meta Cloud API</p>
                <Badge color="indigo">Recomendado para negocios en crecimiento</Badge>
                <ul className="mt-3 space-y-1 text-xs text-slate-500">
                  <li>• Número verificado con Meta Business</li>
                  <li>• El servidor no depende de tu teléfono</li>
                  <li>• Requiere aprobación de Meta (~1-2 días)</li>
                  <li>• Más estable y escalable</li>
                </ul>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-slate-800 text-sm mb-1">Opción B — Número con QR</p>
                <Badge color="amber">Para negocios que empiezan</Badge>
                <ul className="mt-3 space-y-1 text-xs text-slate-500">
                  <li>• Cualquier número de WhatsApp</li>
                  <li>• Sin aprobaciones — listo en minutos</li>
                  <li>• Tu teléfono debe permanecer conectado</li>
                  <li>• Como WhatsApp Web</li>
                </ul>
              </div>
            </div>

            {/* Opción A */}
            <div className="space-y-3">
              <p className="font-semibold text-slate-700">Configurar Meta Cloud API (Opción A)</p>
              <ol className="space-y-2">
                <Step n={1}>
                  Ve a <strong className="text-slate-700">developers.facebook.com</strong> → "Mis Apps" → "Crear app" → Tipo: <strong className="text-slate-700">Negocios</strong>
                </Step>
                <Step n={2}>
                  En el panel de tu app → "Agregar productos" → selecciona <strong className="text-slate-700">WhatsApp</strong>
                </Step>
                <Step n={3}>
                  En WhatsApp → Configuración → encontrarás el <strong className="text-slate-700">Phone Number ID</strong> y un token de acceso temporal
                </Step>
                <Step n={4}>
                  Para uso en producción, genera un token permanente desde Meta Business Suite → Configuración del sistema → Usuarios del sistema
                </Step>
                <Step n={5}>
                  En VentasIA → Canales → selecciona "Meta Cloud API" → pega el Phone Number ID y el Access Token
                </Step>
                <Step n={6}>
                  Configura el webhook en Meta Developers con estos datos:
                </Step>
              </ol>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <CopyField label="URL del Webhook" value={WEBHOOK_URL} />
                <CopyField label="Token de verificación" value={VERIFY_TOKEN} />
              </div>
              <Alert>
                El token temporal expira en 24 horas. Usa un token permanente para que el bot
                funcione continuamente.
              </Alert>
            </div>

            {/* Opción B */}
            <div className="space-y-3">
              <p className="font-semibold text-slate-700">Conectar con QR (Opción B)</p>
              <ol className="space-y-2">
                <Step n={1}>En Canales → selecciona <strong className="text-slate-700">"WhatsApp Número Normal"</strong></Step>
                <Step n={2}>Haz clic en <strong className="text-slate-700">"Conectar número"</strong> — aparecerá un código QR</Step>
                <Step n={3}>
                  En tu teléfono: abre WhatsApp → toca los tres puntos <strong className="text-slate-700">⋮</strong> → "Dispositivos vinculados" → "Vincular un dispositivo"
                </Step>
                <Step n={4}>Escanea el QR — en 5-10 segundos aparecerá el badge "Conectado ✓"</Step>
              </ol>
              <Alert>
                Para Opción B: tu teléfono debe permanecer conectado a internet. Si el teléfono
                se apaga o pierde conexión, el bot se desconecta. El sistema intentará reconectarse
                automáticamente cuando vuelvas a estar en línea.
              </Alert>
            </div>
          </SectionCard>

          {/* 5. Facebook / Instagram */}
          <SectionCard id="facebook" title="Configurar Facebook Messenger e Instagram">
            <p>
              Prerrequisito: tener una <strong className="text-slate-700">Página de Facebook</strong>{' '}
              (no un perfil personal).
            </p>
            <ol className="space-y-2">
              <Step n={1}>
                En Meta Developers → tu app → "Agregar productos" → <strong className="text-slate-700">Messenger</strong>
              </Step>
              <Step n={2}>
                En Messenger → Configuración → selecciona tu Página de Facebook
              </Step>
              <Step n={3}>
                Copia el <strong className="text-slate-700">ID de la Página</strong> (número largo visible en la URL de la página o en Configuración → Acerca de)
              </Step>
              <Step n={4}>
                En VentasIA → Canales → sección "Facebook Page ID" → pega el ID → Guardar
              </Step>
              <Step n={5}>
                Configura el webhook con la misma URL y token que WhatsApp. Suscríbete a:{' '}
                <code className="bg-slate-100 px-1 rounded text-slate-700 text-xs">messages</code>{' '}
                y{' '}
                <code className="bg-slate-100 px-1 rounded text-slate-700 text-xs">messaging_postbacks</code>
              </Step>
            </ol>
            <p className="text-slate-500 text-xs">
              Para Instagram DM: vincula tu cuenta de Instagram Business a la Página de Facebook.
              Una vez configurado el Page ID, Instagram DM se activa automáticamente.
            </p>
          </SectionCard>

          {/* 6. Pagos */}
          <SectionCard id="pagos" title="Métodos de pago">
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-slate-700">Contra entrega</p>
                  <Badge color="emerald">Disponible</Badge>
                </div>
                <p>El cliente paga al recibir el producto. El repartidor cobra al entregar.</p>
                <p className="text-slate-500 mt-1">Activar: Configuración → Métodos de pago → "Contra entrega"</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-slate-700">Transferencia bancaria</p>
                  <Badge color="emerald">Disponible</Badge>
                </div>
                <p>El cliente hace una transferencia antes del envío. Tú confirmas el pago manualmente en el dashboard.</p>
                <p className="text-slate-500 mt-1">El bot enviará las instrucciones de tu cuenta bancaria al cliente.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-slate-700">Wompi (pago en línea)</p>
                  <Badge color="amber">Próximamente</Badge>
                </div>
                <p className="text-slate-500">
                  El bot generará un link de pago. El cliente paga con tarjeta y la orden se confirma automáticamente.
                  Requiere cuenta en Wompi Honduras.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* 7. Órdenes */}
          <SectionCard id="ordenes" title="Gestionar órdenes">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-700 mb-2">Ver y filtrar órdenes</p>
                <ol className="space-y-2">
                  <Step n={1}>En el menú → <strong className="text-slate-700">Órdenes</strong></Step>
                  <Step n={2}>Usa los tabs para filtrar por estado: Pendiente, Confirmado, Preparando, Listo, Entregado, Cancelado</Step>
                  <Step n={3}>Clic en una orden para ver detalle: productos, cliente, método de pago y total</Step>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-2">Cambiar estado de una orden</p>
                <ol className="space-y-2">
                  <Step n={1}>Clic en la orden para expandirla</Step>
                  <Step n={2}>En la sección "Cambiar estado" selecciona el nuevo estado</Step>
                </ol>
                <div className="mt-3 bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Flujo recomendado</p>
                  <div className="flex items-center gap-1 flex-wrap text-xs text-slate-600">
                    {['Pendiente', 'Confirmado', 'Preparando', 'Listo', 'Entregado'].map((s, i, arr) => (
                      <span key={s} className="flex items-center gap-1">
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full">{s}</span>
                        {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Alert type="info">
                Para órdenes con transferencia bancaria: cuando verifiques el pago en tu banco,
                cambia el estado a "Confirmado" para proceder con el despacho.
              </Alert>
            </div>
          </SectionCard>

          {/* 8. Cómo funciona el bot */}
          <SectionCard id="bot" title="Cómo funciona el bot">
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-slate-700 mb-2">Flujo de conversación</p>
                <ol className="space-y-2">
                  {[
                    'Cliente envía "Hola" → Bot saluda y muestra el menú principal',
                    'Cliente escribe "1" o "catálogo" → Bot lista los primeros 10 productos',
                    'Cliente elige un producto escribiendo su número → Bot muestra detalle y precio',
                    'Cliente escribe la cantidad → Bot agrega al carrito',
                    'Cliente escribe "confirmar" → Bot pregunta método de pago',
                    'Cliente elige pago → Orden creada, bot envía número de referencia',
                  ].map((step, i) => <Step key={i} n={i + 1}>{step}</Step>)}
                </ol>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-2">Comandos que entiende el bot</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    ['hola, menú, 0', 'Menú principal'],
                    ['1, catálogo, ver productos', 'Ver catálogo'],
                    ['2, mi carrito', 'Ver carrito actual'],
                    ['confirmar, pagar', 'Proceder al pago'],
                    ['cancelar', 'Cancelar y volver al inicio'],
                    ['[nombre de producto]', 'Buscar producto específico'],
                  ].map(([cmd, desc]) => (
                    <div key={cmd} className="flex gap-2 text-xs">
                      <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono flex-shrink-0">{cmd}</code>
                      <span className="text-slate-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-2">Canales soportados</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { icon: MessageCircle, label: 'WhatsApp', color: 'text-emerald-500' },
                    { icon: MessagesSquare, label: 'Messenger', color: 'text-blue-500' },
                    { icon: Smartphone, label: 'Instagram DM', color: 'text-pink-500' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Icon className={`h-4 w-4 ${color}`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 9. FAQ */}
          <SectionCard id="faq" title="Preguntas frecuentes">
            <FaqItem q="¿El bot funciona las 24 horas?">
              Sí. Para Meta Cloud API (Opción A), el bot funciona siempre mientras el servidor esté
              activo. Para la Opción B (QR), tu teléfono debe permanecer encendido y conectado a internet.
            </FaqItem>
            <FaqItem q="¿Qué pasa si el cliente manda algo que el bot no entiende?">
              El bot responderá con un mensaje amable pidiendo que repita o mostrará el menú principal.
              La IA intenta entender el lenguaje natural, pero si el mensaje es muy inusual, volverá
              al inicio de la conversación.
            </FaqItem>
            <FaqItem q="¿Puedo personalizar los mensajes del bot?">
              Actualmente el bot usa textos predefinidos con el nombre de tu negocio. Personalización
              avanzada de mensajes estará disponible en el Plan Pro próximamente.
            </FaqItem>
            <FaqItem q="¿Qué pasa si mi catálogo tiene más de 10 productos?">
              El bot muestra los primeros 10 productos activos. Si el cliente escribe el nombre de
              un producto, el bot lo buscará en todo el catálogo. Búsqueda semántica avanzada
              (RAG) llegará próximamente.
            </FaqItem>
            <FaqItem q="¿Los datos de mis clientes están seguros?">
              Sí. Los tokens de Meta y Wompi se guardan cifrados con AES-256. La base de datos
              está en Neon PostgreSQL con conexión SSL. No compartimos información con terceros.
            </FaqItem>
            <FaqItem q="¿Puedo tener múltiples negocios?">
              Cada negocio requiere una cuenta separada. Próximamente habrá soporte para múltiples
              negocios desde una misma cuenta.
            </FaqItem>
            <FaqItem q="¿Meta puede bloquear mi número con Baileys (Opción B)?">
              Es posible, aunque poco frecuente para uso normal de ventas. Si recibes muchos
              mensajes o envías mensajes masivos, el riesgo aumenta. Para negocios con alto volumen,
              recomendamos Meta Cloud API (Opción A).
            </FaqItem>
            <FaqItem q="¿Cómo actualizo al Plan Pro?">
              Contacta soporte en el chat del dashboard o escribe a soporte@ventasia.hn.
              El Plan Pro cuesta $20/mes e incluye conversaciones ilimitadas.
            </FaqItem>
          </SectionCard>

        </div>
      </div>
    </div>
  )
}
