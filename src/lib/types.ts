export interface Business {
  id: string
  name: string
  email: string
  slug: string
  logoUrl: string | null
  whatsappNumber: string | null
  facebookPageId: string | null
  whatsappChannel: 'META' | 'BAILEYS'
  phoneNumberId: string | null
  whatsappToken: string | null
  paymentMethods: string[]
  isActive: boolean
  onboardingStep: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  businessId: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  imageUrls: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  businessId: string
  customerPhone: string
  customerName: string | null
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  paymentMethod: string
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  subtotal: number
  total: number
  notes: string | null
  createdAt: string
  items: OrderItem[]
  payment: Payment | null
}

export interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  total: number
  product: { name: string; price: number; imageUrl: string | null }
}

export interface Payment {
  id: string
  method: string
  status: string
  amount: number
  wompiPaymentLink: string | null
  confirmedAt: string | null
}
