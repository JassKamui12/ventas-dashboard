'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Order } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const statusLabelShort: Record<Status, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const statusPill: Record<Status, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  CONFIRMED: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  PREPARING: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  READY: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  DELIVERED: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
}

const filterTabActive = 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
const filterTabInactive = 'text-slate-500 hover:text-slate-700'

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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Órdenes</h1>
        <p className="text-sm text-slate-500 mt-0.5">{visible.length} órdenes</p>
      </div>

      {/* Pill filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 flex-wrap">
        <button
          onClick={() => setFilter('ALL')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
            filter === 'ALL' ? filterTabActive : filterTabInactive
          )}
        >
          Todas
          <span className="ml-1.5 text-xs text-slate-400">{orders.length}</span>
        </button>
        {statuses.map(s => {
          const count = orders.filter(o => o.status === s).length
          if (count === 0) return null
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                filter === s ? filterTabActive : filterTabInactive
              )}
            >
              {statusLabelShort[s]}
              <span className="ml-1.5 text-xs text-slate-400">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      {visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
            <ClipboardList className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">Sin órdenes en esta categoría</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Row header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200',
                      expanded === order.id && 'rotate-180'
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {order.customerName || order.customerPhone}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleString('es-HN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${statusPill[order.status]}`}>
                    {statusLabelShort[order.status]}
                  </span>
                  <p className="text-sm font-bold text-slate-900 tabular-nums">
                    L {order.total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === order.id && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-5 bg-slate-50/50">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Productos</p>
                    <div className="space-y-1.5">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-700">{item.quantity}x {item.product.name}</span>
                          <span className="text-slate-900 font-medium tabular-nums">
                            L {item.total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Teléfono</p>
                      <p className="font-medium text-slate-800">{order.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Pago</p>
                      <p className="font-medium text-slate-800 capitalize">{order.paymentMethod}</p>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Notas</p>
                      <p className="text-sm text-slate-700">{order.notes}</p>
                    </div>
                  )}

                  {/* Status update */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cambiar estado</p>
                    <div className="flex flex-wrap gap-2">
                      {statuses.filter(s => s !== order.status && s !== 'PENDING').map(s => (
                        <Button
                          key={s}
                          size="sm"
                          variant="outline"
                          disabled={updatingId === order.id}
                          onClick={() => updateStatus(order.id, s)}
                          className="text-xs h-7 border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          {updatingId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : statusLabel[s]}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
