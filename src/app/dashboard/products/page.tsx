'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Loader2, Plus, Pencil, Trash2, ImagePlus } from 'lucide-react'

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
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} productos registrados</p>
        </div>
        <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4 mr-2" /> Nuevo producto
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Camisa talla M" />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción del producto" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Precio (L) *</Label>
                  <Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={handleSave} disabled={saving || !form.name || !form.price}>
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

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-400 mb-4">No tienes productos aún</p>
            <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 mr-2" /> Agregar primer producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <Card key={product.id} className="overflow-hidden">
              {/* Image */}
              <div
                className="relative h-40 bg-gray-100 cursor-pointer group"
                onClick={() => {
                  setPendingImageProductId(product.id)
                  fileInputRef.current?.click()
                }}
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <ImagePlus className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingId === product.id
                    ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                    : <ImagePlus className="h-6 w-6 text-white" />}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                    {product.description && <p className="text-xs text-gray-400 truncate mt-0.5">{product.description}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(product)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-lg font-bold text-violet-600">
                    L {product.price.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Stock: {product.stock}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
