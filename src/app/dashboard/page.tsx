'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Business, Order, Product } from '@/lib/types'
import { Package, ClipboardList, DollarSign, Share2, Loader2 } from 'lucide-react'

interface Stats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
}

function computeStats(products: Product[], orders: Order[]): Stats {
  return {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.isActive).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length,
    totalRevenue: orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0),
  }
}

const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const statusPill: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  CONFIRMED: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  PREPARING: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  READY: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  DELIVERED: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
}

const KPI_CARDS = [
  {
    key: 'activeProducts' as const,
    label: 'Productos activos',
    subKey: 'totalProducts' as const,
    subLabel: (n: number) => `${n} en total`,
    icon: Package,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600',
  },
  {
    key: 'pendingOrders' as const,
    label: 'Órdenes activas',
    subKey: 'totalOrders' as const,
    subLabel: (n: number) => `${n} en total`,
    icon: ClipboardList,
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600',
  },
  {
    key: 'totalRevenue' as const,
    label: 'Ingresos totales',
    subKey: null,
    subLabel: () => 'Todas las órdenes',
    icon: DollarSign,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    isCurrency: true,
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api<Business>('/api/me'),
      api<Product[]>('/api/products'),
      api<{ orders: Order[] } | Order[]>('/api/orders'),
    ]).then(([biz, products, ordersRaw]) => {
      const orders = Array.isArray(ordersRaw) ? ordersRaw : (ordersRaw as { orders: Order[] }).orders ?? []
      setBusiness(biz)
      setStats(computeStats(products, orders))
      setRecentOrders(orders.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('es-HN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const activeChannels = [business?.whatsappNumber, business?.facebookPageId].filter(Boolean).length

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Panel de control</h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{today}</p>
        </div>
        {business?.name && (
          <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
            {business.name}
          </span>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ key, label, subKey, subLabel, icon: Icon, iconBg, iconColor, isCurrency }) => (
          <div key={key} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-medium text-slate-500 leading-tight">{label}</p>
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {isCurrency
                ? `L ${(stats?.[key] ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`
                : (stats?.[key] ?? 0)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {subLabel(subKey ? (stats?.[subKey] ?? 0) : 0)}
            </p>
          </div>
        ))}

        {/* Channels card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-medium text-slate-500 leading-tight">Canales activos</p>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Share2 className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{activeChannels}</p>
          <p className="text-xs text-slate-400 mt-1">de 3 disponibles</p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Órdenes recientes</h2>
          {recentOrders.length > 0 && (
            <span className="text-xs text-slate-400">{recentOrders.length} órdenes</span>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
              <ClipboardList className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Sin órdenes aún</p>
            <p className="text-xs text-slate-400 mt-1">Conecta tus canales para empezar a recibir pedidos</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{order.customerName || order.customerPhone}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('es-HN')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusPill[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 tabular-nums min-w-20 text-right">
                    L {order.total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
