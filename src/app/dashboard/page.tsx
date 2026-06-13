'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Business, Order, Product } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ClipboardList, DollarSign, TrendingUp, Loader2 } from 'lucide-react'

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

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  READY: 'bg-green-100 text-green-700',
  DELIVERED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
}

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

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {business?.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de tu negocio hoy</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Productos activos</CardTitle>
            <Package className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.activeProducts ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">{stats?.totalProducts ?? 0} en total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Órdenes activas</CardTitle>
            <ClipboardList className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.pendingOrders ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">{stats?.totalOrders ?? 0} en total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Ingresos totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              L {(stats?.totalRevenue ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 mt-1">Todas las órdenes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Canales activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {[business?.whatsappNumber, business?.facebookPageId].filter(Boolean).length}
            </p>
            <p className="text-xs text-gray-400 mt-1">de 3 disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Órdenes recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay órdenes aún. Conecta tus canales para empezar.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customerName || order.customerPhone}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-HN')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">
                      L {order.total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
