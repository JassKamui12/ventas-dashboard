'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Loader2, Plus, Pencil, Trash2, ImagePlus, Package } from 'lucide-react'

interface ProductForm {
  name: string
  description: string
  price: string
  stock: string
}

const empty: ProductForm = { name: '', description: '', price: '', stock: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(empty)
  const [error, setError] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImageProductId, setPendingImageProductId] = useState<string | null>(null)

  async function loadProducts() {
    const data = await api<Product[]>('/api/products')
    setProducts(data)
  }

  useEffect(() => {
    loadProducts().finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setError('')
    setOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      stock: String(p.stock),
    })
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      }
      if (editing) {
        await api(`/api/products/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
      } else {
        await api('/api/products', { method: 'POST', body: JSON.stringify(body) })
      }
      await loadProducts()
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await api(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  async function handleImageUpload(productId: string, file: File) {
    setUploadingId(productId)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const updated = await api<Product>(`/api/products/${productId}/image`, {
        method: 'POST',
        body: formData,
      })
      setProducts(prev => prev.map(p => p.id === productId ? updated : p))
    } finally {
      setUploadingId(null)
      setPendingImageProductId(null)
    }
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Productos</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              <span className="inline-flex items-center bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full mr-1">
                {products.length}
              </span>
              productos registrados
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-sm">
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo producto
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Camisa talla M"
                  className="border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Descripción</Label>
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción del producto"
                  className="border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Precio (L) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0,00"
                    className="border-slate-200 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="0"
                    className="border-slate-200 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-slate-200" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.price}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file && pendingImageProductId) handleImageUpload(pendingImageProductId, file)
          e.target.value = ''
        }}
      />

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
            <Package className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Sin productos aún</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">Agrega tu primer producto para comenzar a vender</p>
          <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-sm">
            <Plus className="h-4 w-4 mr-1.5" /> Agregar primer producto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden group">
              {/* Image area */}
              <div
                className="relative h-44 bg-slate-50 cursor-pointer"
                onClick={() => {
                  setPendingImageProductId(product.id)
                  fileInputRef.current?.click()
                }}
                role="button"
                aria-label={`Cambiar imagen de ${product.name}`}
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-300">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs text-slate-400">Agregar imagen</span>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingId === product.id
                    ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                    : <ImagePlus className="h-6 w-6 text-white" />}
                </div>
                {/* Edit / Delete — appear on card hover */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(product) }}
                    aria-label={`Editar ${product.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(product.id) }}
                    aria-label={`Eliminar ${product.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white shadow-sm hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <p className="font-semibold text-slate-900 truncate text-sm">{product.name}</p>
                {product.description && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-base font-bold text-indigo-600">
                    L {product.price.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    product.isActive
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Stock: {product.stock} unidades</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
