'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Order } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ChevronDown } from 'lucide-react'

const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] as const
type Status = typeof statuses[number]

const statusLabel: Record<Status, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY: 'Listo para entregar',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const statusColor: Record<Status, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PREPARING: 'bg-orange-100 text-orange-700 border-orange-200',
  READY: 'bg-green-100 text-green-700 border-green-200',
  DELIVERED: 'bg-gray-100 text-gray-600 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-600 border-red-200',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    api<{ orders: Order[] } | Order[]>('/api/orders')
      .then(data => setOrders(Array.isArray(data) ? data : (data as { orders: Order[] }).orders ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(orderId: string, status: Status) {
    setUpdatingId(orderId)
    try {
      await api(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    } finally {
      setUpdatingId(null)
    }
  }

  const visible = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes</h1>
          <p className="text-sm text-gray-500 mt-1">{visible.length} órdenes</p>
        </div>
        <Select value={filter} onValueChange={v => setFilter(v as Status | 'ALL')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {statuses.map(s => (
              <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-gray-400">No hay órdenes en esta categoría</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map(order => (
            <Card key={order.id} className="overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {order.customerName || order.customerPhone}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('es-HN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`hidden sm:inline-flex text-xs font-medium px-2 py-1 rounded-full border ${statusColor[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                  <p className="text-sm font-bold text-gray-900">
                    L {order.total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-4 bg-gray-50">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Productos</p>
                    <div className="space-y-1">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.quantity}x {item.product.name}</span>
                          <span className="text-gray-900 font-medium">L {item.total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="font-medium">{order.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pago</p>
                      <p className="font-medium capitalize">{order.paymentMethod}</p>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <p className="text-xs text-gray-500">Notas</p>
                      <p className="text-sm text-gray-700">{order.notes}</p>
                    </div>
                  )}

                  {/* Status update */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cambiar estado</p>
                    <div className="flex flex-wrap gap-2">
                      {statuses.filter(s => s !== order.status && s !== 'PENDING').map(s => (
                        <Button
                          key={s}
                          size="sm"
                          variant="outline"
                          disabled={updatingId === order.id}
                          onClick={() => updateStatus(order.id, s)}
                          className="text-xs h-7"
                        >
                          {updatingId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : statusLabel[s]}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
