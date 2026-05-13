import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  AtSign,
  BadgeCheck,
  Banknote,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  Dumbbell,
  Filter,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  UsersRound,
  Warehouse,
  X,
} from 'lucide-react'
import { api } from './service/api'
import './App.css'

const WHATSAPP_NUMBER = '5583991082689'
const ADMIN_EMAIL = 'admin@rbdryfit.com'
const ADMIN_PASSWORD = 'rb2026'
const SIZES = ['P', 'M', 'G', 'GG', 'XG']

const productImages = {
  shirtBlack:
    'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80',
  gymRunner:
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
  training:
    'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80',
  weights:
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80',
  hero:
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1800&q=85',
  gym:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
}

const defaultSuppliers = [
  {
    id: 'fenix',
    name: 'Fenix Textil',
    category: 'Dry fit premium',
    contact: 'Renata Lima',
    phone: '(83) 99921-1840',
    city: 'Campina Grande - PB',
    leadTime: 5,
    rating: 4.9,
    openOrders: 3,
    status: 'Homologado',
  },
  {
    id: 'atlanta',
    name: 'Atlanta Sublimacao',
    category: 'Camisas de time',
    contact: 'Bruno Matos',
    phone: '(85) 98114-7721',
    city: 'Fortaleza - CE',
    leadTime: 8,
    rating: 4.7,
    openOrders: 2,
    status: 'Em producao',
  },
  {
    id: 'north',
    name: 'North Fit Lab',
    category: 'Bermudas e regatas',
    contact: 'Marina Torres',
    phone: '(81) 98803-1520',
    city: 'Recife - PE',
    leadTime: 6,
    rating: 4.8,
    openOrders: 1,
    status: 'Homologado',
  },
]

const defaultProducts = [
  {
    id: 'camisa-stealth',
    name: 'Camisa Dry Fit Stealth',
    category: 'Camisas',
    price: 54.9,
    cost: 29.8,
    image: productImages.shirtBlack,
    badge: 'Giro alto',
    description: 'Toque gelado, caimento atletico e secagem rapida.',
    fabric: 'Poliester premium + elastano',
    colors: ['Preto', 'Cinza chumbo', 'Off white'],
    sizes: { P: 14, M: 28, G: 20, GG: 11 },
    supplierId: 'fenix',
    reorderPoint: 18,
    active: true,
    launch: true,
  },
  {
    id: 'camisa-compress',
    name: 'Camisa Pro Compression',
    category: 'Camisas',
    price: 69.9,
    cost: 38.2,
    image: productImages.training,
    badge: 'Performance',
    description: 'Modelagem ajustada para treino pesado e alta respirabilidade.',
    fabric: 'Malha fria 180g',
    colors: ['Preto', 'Verde militar'],
    sizes: { P: 8, M: 19, G: 16, GG: 7, XG: 4 },
    supplierId: 'fenix',
    reorderPoint: 14,
    active: true,
    launch: true,
  },
  {
    id: 'regata-basic',
    name: 'Regata Dry Fit Basic',
    category: 'Regatas',
    price: 44.9,
    cost: 23.5,
    image: productImages.gymRunner,
    badge: 'Leve',
    description: 'Regata de treino com cava confortavel e acabamento reforcado.',
    fabric: 'Dry fit soft touch',
    colors: ['Preto', 'Branco', 'Azul petroleo'],
    sizes: { P: 6, M: 12, G: 9, GG: 3 },
    supplierId: 'north',
    reorderPoint: 12,
    active: true,
    launch: false,
  },
  {
    id: 'bermuda-flex',
    name: 'Bermuda Flex Run',
    category: 'Bermudas',
    price: 64.9,
    cost: 35.1,
    image: productImages.weights,
    badge: '2 bolsos',
    description: 'Bermuda com elastico firme, bolso lateral e costura dupla.',
    fabric: 'Tactel elastano',
    colors: ['Preto', 'Grafite'],
    sizes: { P: 10, M: 18, G: 22, GG: 8 },
    supplierId: 'north',
    reorderPoint: 16,
    active: true,
    launch: true,
  },
  {
    id: 'camisa-time',
    name: 'Camisa Team Prime',
    category: 'Times',
    price: 79.9,
    cost: 43.4,
    image: productImages.gym,
    badge: 'Atacado',
    description: 'Base lisa para personalizacao, escudos e packs promocionais.',
    fabric: 'Microfibra esportiva',
    colors: ['Preto/dourado', 'Azul royal', 'Vermelho'],
    sizes: { P: 9, M: 24, G: 20, GG: 15, XG: 6 },
    supplierId: 'atlanta',
    reorderPoint: 20,
    active: true,
    launch: false,
  },
  {
    id: 'kit-academia',
    name: 'Kit Academia 3 Pecas',
    category: 'Kits',
    price: 149.9,
    cost: 87.6,
    image: productImages.shirtBlack,
    badge: 'Combo',
    description: 'Camisa, regata e bermuda com preco fechado para revenda.',
    fabric: 'Mix dry fit e tactel',
    colors: ['Preto', 'Preto/branco'],
    sizes: { P: 4, M: 11, G: 8, GG: 5 },
    supplierId: 'fenix',
    reorderPoint: 8,
    active: true,
    launch: true,
  },
]

const defaultOrders = [
  {
    id: 'RB-1048',
    customer: 'Academia Iron Club',
    date: 'Hoje, 15:20',
    items: '42 pecas',
    payment: 'Pix',
    total: 4210,
    status: 'Separacao',
  },
  {
    id: 'RB-1047',
    customer: 'Studio Move Pro',
    date: 'Hoje, 11:05',
    items: '18 pecas',
    payment: 'Cartao',
    total: 1548,
    status: 'Faturado',
  },
  {
    id: 'RB-1046',
    customer: 'Felipe Araujo',
    date: 'Ontem, 18:44',
    items: '6 pecas',
    payment: 'Dinheiro',
    total: 389.4,
    status: 'Entregue',
  },
]

const defaultClients = [
  {
    id: 'iron-club',
    name: 'Academia Iron Club',
    document: '11222333000144',
    phone: '(83) 99100-2040',
    email: 'compras@ironclub.com',
    city: 'Campina Grande',
    uf: 'PB',
    type: 'Academia',
    notes: 'Compra recorrente para alunos e loja interna.',
    active: true,
  },
  {
    id: 'move-pro',
    name: 'Studio Move Pro',
    document: '22333444000155',
    phone: '(85) 98115-8722',
    email: 'movepro@studio.com',
    city: 'Fortaleza',
    uf: 'CE',
    type: 'Revenda',
    notes: 'Prioridade para kits e camisetas de time.',
    active: true,
  },
]

const categories = [
  { name: 'Todos', icon: Sparkles, image: productImages.hero },
  { name: 'Camisas', icon: Shirt, image: productImages.shirtBlack },
  { name: 'Regatas', icon: Dumbbell, image: productImages.gymRunner },
  { name: 'Bermudas', icon: Package, image: productImages.weights },
  { name: 'Times', icon: BadgeCheck, image: productImages.gym },
  { name: 'Kits', icon: ShoppingBag, image: productImages.training },
]

const adminSections = [
  { id: 'overview', label: 'Resumo', icon: LayoutDashboard },
  { id: 'products', label: 'Produtos', icon: Boxes },
  { id: 'stock', label: 'Estoque', icon: Warehouse },
  { id: 'suppliers', label: 'Fornecedores', icon: UsersRound },
  { id: 'clients', label: 'Clientes', icon: AtSign },
  { id: 'orders', label: 'Pedidos', icon: ClipboardList },
]

const orderStatuses = ['Recebido', 'Separacao', 'Faturado', 'Enviado', 'Entregue']

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) : fallback
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Local storage is a convenience layer only.
    }
  }, [key, value])

  return [value, setValue]
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function parseCurrency(value) {
  return Number(String(value).replace(',', '.')) || 0
}

function totalStock(product) {
  return Object.values(product.sizes || {}).reduce((total, value) => total + Number(value || 0), 0)
}

function stockTone(product) {
  const total = totalStock(product)
  if (total <= product.reorderPoint) return 'critical'
  if (total <= product.reorderPoint * 1.8) return 'attention'
  return 'healthy'
}

function supplierById(suppliers, supplierId) {
  return suppliers.find((supplier) => supplier.id === supplierId)
}

function productWhatsAppLink(product) {
  const message = encodeURIComponent(
    `Ola! Tenho interesse no produto ${product.name} (${formatCurrency(product.price)}).`,
  )
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
}

function checkoutLink(items, total) {
  const lines = items
    .map(({ product, quantity }) => `- ${quantity}x ${product.name} (${formatCurrency(product.price)})`)
    .join('\n')
  const message = encodeURIComponent(
    `Ola! Quero fechar este pedido RB Dry Fit:\n\n${lines}\n\nTotal: ${formatCurrency(total)}\n\nAguardo confirmacao.`,
  )
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
}

function numericId(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function emptyProductForm(supplierId = '') {
  return {
    name: '',
    category: 'Camisas',
    price: '',
    cost: '',
    supplierId: supplierId ? String(supplierId) : '',
    badge: 'Novo',
    image: productImages.training,
    description: '',
    fabric: 'Dry fit',
    colors: 'Preto',
    reorderPoint: '10',
    active: true,
    launch: true,
    sizes: SIZES.reduce((grade, size) => ({ ...grade, [size]: size === 'XG' ? '' : '0' }), {}),
  }
}

function emptySupplierForm() {
  return {
    name: '',
    category: '',
    contact: '',
    phone: '',
    city: '',
    leadTime: '7',
    rating: '4,6',
    openOrders: '0',
    status: 'Em avaliacao',
    active: true,
  }
}

function emptyClientForm() {
  return {
    name: '',
    document: '',
    phone: '',
    email: '',
    city: '',
    uf: '',
    type: 'Consumidor',
    notes: '',
    active: true,
  }
}

function emptyOrderItem(product) {
  return {
    productId: product?.id ? String(product.id) : '',
    productName: product?.name || '',
    size: '',
    quantity: '1',
    unitPrice: product?.price ? String(product.price).replace('.', ',') : '',
  }
}

function emptyOrderForm(products = []) {
  return {
    clientId: '',
    customerName: '',
    customerPhone: '',
    payment: 'Pix',
    status: 'Recebido',
    discount: '0',
    surcharge: '0',
    notes: 'Venda fechada pelo WhatsApp.',
    items: [emptyOrderItem(products[0])],
  }
}

function colorsFromText(value) {
  return String(value || '')
    .split(/[,|]/)
    .map((color) => color.trim())
    .filter(Boolean)
}

function sizesFromForm(sizes) {
  return SIZES.reduce(
    (grade, size) => ({
      ...grade,
      [size]: Math.max(0, Number(sizes?.[size]) || 0),
    }),
    {},
  )
}

function productPayload(product) {
  return {
    name: product.name,
    category: product.category,
    price: Number(product.price || 0),
    cost: Number(product.cost || 0),
    image: product.image,
    badge: product.badge,
    description: product.description,
    fabric: product.fabric,
    colors: product.colors || [],
    sizes: product.sizes || {},
    supplierId: numericId(product.supplierId),
    reorderPoint: Number(product.reorderPoint || 0),
    active: Boolean(product.active),
    launch: Boolean(product.launch),
  }
}

function supplierPayload(supplier) {
  return {
    name: supplier.name,
    category: supplier.category,
    contact: supplier.contact,
    phone: supplier.phone,
    city: supplier.city,
    leadTime: Number(supplier.leadTime || 7),
    rating: Number(supplier.rating || 4.6),
    openOrders: Number(supplier.openOrders || 0),
    status: supplier.status,
    active: supplier.active !== false,
  }
}

function clientPayload(client) {
  return {
    name: client.name,
    document: client.document,
    phone: client.phone,
    email: client.email,
    city: client.city,
    uf: client.uf,
    type: client.type,
    notes: client.notes,
    active: client.active !== false,
  }
}

function ModalOverlay({ isOpen, onClose, children, title }) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      />
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 1001,
          width: '90%',
          maxWidth: '600px',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '16px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

function App() {
  const [view, setViewState] = useState(() => (window.location.hash === '#admin' ? 'admin' : 'store'))
  const [products, setProducts] = useState(defaultProducts)
  const [suppliers, setSuppliers] = useState(defaultSuppliers)
  const [orders, setOrders] = useState(defaultOrders)
  const [clients, setClients] = useState(defaultClients)
  const [cart, setCart] = usePersistentState('rb-cart-items', [])
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [cartNotice, setCartNotice] = useState(null)
  const [apiStatus, setApiStatus] = useState({ isLoading: true, isOnline: false, message: '' })
  const [checkoutStatus, setCheckoutStatus] = useState({ isSaving: false, message: '' })
  const [showProductModal, setShowProductModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const cartNoticeTimer = useRef(null)

  useEffect(() => {
    function syncHash() {
      setViewState(window.location.hash === '#admin' ? 'admin' : 'store')
    }

    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    return () => {
      if (cartNoticeTimer.current) {
        window.clearTimeout(cartNoticeTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadRemoteData() {
      try {
        const [remoteProducts, remoteSuppliers, remoteOrders, remoteClients] = await Promise.all([
          api.listProducts(),
          api.listSuppliers(),
          api.listOrders(),
          api.listClients(),
        ])

        if (!isMounted) return

        setProducts(remoteProducts)
        setSuppliers(remoteSuppliers)
        setOrders(remoteOrders)
        setClients(remoteClients)
        setApiStatus({ isLoading: false, isOnline: true, message: 'API conectada ao Firebird.' })
      } catch (error) {
        if (!isMounted) return
        setApiStatus({
          isLoading: false,
          isOnline: false,
          message: error.message || 'API offline. Usando dados locais temporarios.',
        })
      }
    }

    loadRemoteData()

    return () => {
      isMounted = false
    }
  }, [])

  const activeProducts = useMemo(() => products.filter((product) => product.active), [products])

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => ({
          ...item,
          product: products.find((product) => product.id === item.productId),
        }))
        .filter((item) => item.product),
    [cart, products],
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [cartItems],
  )

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  function addToCart(productId) {
    const product = products.find((item) => item.id === productId)

    setCart((current) => {
      const match = current.find((item) => item.productId === productId)
      if (match) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...current, { productId, quantity: 1 }]
    })

    if (product) {
      if (cartNoticeTimer.current) {
        window.clearTimeout(cartNoticeTimer.current)
      }

      setCartNotice({ id: Date.now(), productName: product.name })
      cartNoticeTimer.current = window.setTimeout(() => {
        setCartNotice(null)
      }, 2800)
    }
  }

  function updateCartQuantity(productId, quantity) {
    setCart((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  async function updateProduct(productId, patch) {
    const currentProduct = products.find((product) => product.id === productId)
    if (!currentProduct) return

    const updatedProduct = { ...currentProduct, ...patch }
    setProducts((current) =>
      current.map((product) => (product.id === productId ? updatedProduct : product)),
    )

    if (!apiStatus.isOnline || !numericId(productId)) return

    try {
      const savedProduct = patch.sizes
        ? await api.updateStock(productId, updatedProduct.sizes)
        : await api.updateProduct(productId, productPayload(updatedProduct))
      setProducts((current) => current.map((product) => (product.id === productId ? savedProduct : product)))
    } catch (error) {
      setApiStatus((current) => ({ ...current, message: error.message }))
      setProducts((current) =>
        current.map((product) => (product.id === productId ? currentProduct : product)),
      )
    }
  }

  async function addProduct(product) {
    if (!apiStatus.isOnline) {
      const message = 'API offline. Ligue o backend para cadastrar produtos no banco.'
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }

    try {
      const savedProduct = await api.createProduct(productPayload(product))
      setProducts((current) => [savedProduct, ...current])
      return { ok: true, product: savedProduct }
    } catch (error) {
      const message = error.message || 'Nao foi possivel cadastrar o produto.'
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }
  }

  async function addSupplier(supplier) {
    if (!apiStatus.isOnline) {
      const message = 'API offline. Ligue o backend para cadastrar fornecedores no banco.'
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }

    try {
      const savedSupplier = await api.createSupplier(supplierPayload(supplier))
      setSuppliers((current) => [savedSupplier, ...current])
      return { ok: true, supplier: savedSupplier }
    } catch (error) {
      const message = error.message || 'Nao foi possivel cadastrar o fornecedor.'
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }
  }

  async function updateSupplier(supplierId, patch) {
    const currentSupplier = suppliers.find((supplier) => supplier.id === supplierId)
    if (!currentSupplier) return

    const updatedSupplier = { ...currentSupplier, ...patch }
    setSuppliers((current) =>
      current.map((supplier) => (supplier.id === supplierId ? updatedSupplier : supplier)),
    )

    if (!apiStatus.isOnline || !numericId(supplierId)) return

    try {
      const savedSupplier = await api.updateSupplier(supplierId, supplierPayload(updatedSupplier))
      setSuppliers((current) => current.map((supplier) => (supplier.id === supplierId ? savedSupplier : supplier)))
    } catch (error) {
      setApiStatus((current) => ({ ...current, message: error.message }))
      setSuppliers((current) =>
        current.map((supplier) => (supplier.id === supplierId ? currentSupplier : supplier)),
      )
    }
  }

  async function addClient(client) {
    if (!apiStatus.isOnline) {
      const message = 'API offline. Ligue o backend para cadastrar clientes no banco.'
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }

    try {
      const savedClient = await api.createClient(clientPayload(client))
      setClients((current) => [savedClient, ...current])
      return { ok: true, client: savedClient }
    } catch (error) {
      const message = error.message || 'Nao foi possivel cadastrar o cliente.'
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }
  }

  async function updateClient(clientId, patch) {
    const currentClient = clients.find((client) => client.id === clientId)
    if (!currentClient) return

    const updatedClient = { ...currentClient, ...patch }
    setClients((current) => current.map((client) => (client.id === clientId ? updatedClient : client)))

    if (!apiStatus.isOnline || !numericId(clientId)) return

    try {
      const savedClient = await api.updateClient(clientId, clientPayload(updatedClient))
      setClients((current) => current.map((client) => (client.id === clientId ? savedClient : client)))
    } catch (error) {
      setApiStatus((current) => ({ ...current, message: error.message }))
      setClients((current) => current.map((client) => (client.id === clientId ? currentClient : client)))
    }
  }

  async function updateOrder(orderId, patch) {
    const currentOrder = orders.find((order) => order.id === orderId)
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, ...patch } : order)))

    if (!apiStatus.isOnline || !patch.status) return

    try {
      const savedOrder = await api.updateOrderStatus(orderId, patch.status)
      setOrders((current) => current.map((order) => (order.id === orderId ? savedOrder : order)))
    } catch (error) {
      setApiStatus((current) => ({ ...current, message: error.message }))
      if (currentOrder) {
        setOrders((current) => current.map((order) => (order.id === orderId ? currentOrder : order)))
      }
    }
  }

  async function addOrder(order) {
    if (!apiStatus.isOnline) {
      const message = 'API offline. Ligue o backend para registrar pedidos no banco.'
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }

    try {
      const savedOrder = await api.finalizeOrder(order)
      setOrders((current) => [savedOrder, ...current.filter((item) => item.id !== savedOrder.id)])

      const [remoteProducts, remoteClients] = await Promise.all([api.listProducts(), api.listClients()])
      setProducts(remoteProducts)
      setClients(remoteClients)
      setApiStatus((current) => ({ ...current, isOnline: true, message: `Pedido ${savedOrder.id} salvo no Firebird.` }))
      return { ok: true, order: savedOrder }
    } catch (error) {
      const message = error.message || 'Nao foi possivel registrar o pedido.'
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }
  }

  async function registerCartOrder() {
    if (cartItems.length === 0) {
      return { ok: false, message: 'Carrinho vazio.' }
    }

    if (!apiStatus.isOnline) {
      const message = 'API offline. Ligue o backend para registrar o pedido no banco.'
      setCheckoutStatus({ isSaving: false, message })
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }

    setCheckoutStatus({ isSaving: true, message: 'Registrando pedido no sistema...' })

    try {
      const savedOrder = await api.finalizeOrder({
        client: { name: 'Pedido WhatsApp', type: 'WhatsApp' },
        payment: 'WhatsApp',
        status: 'Recebido',
        notes: 'Pedido iniciado pelo catalogo online.',
        items: cartItems.map(({ product, quantity }) => ({
          productId: numericId(product.id),
          productName: product.name,
          quantity,
          unitPrice: Number(product.price || 0),
        })),
      })
      setOrders((current) => [savedOrder, ...current.filter((order) => order.id !== savedOrder.id)])
      setCart([])
      setCheckoutStatus({ isSaving: false, message: `Pedido ${savedOrder.id} salvo no banco.` })
      setApiStatus((current) => ({ ...current, isOnline: true, message: `Pedido ${savedOrder.id} salvo no Firebird.` }))
      return { ok: true, order: savedOrder }
    } catch (error) {
      const message = error.message || 'Nao foi possivel registrar o pedido.'
      setCheckoutStatus({ isSaving: false, message })
      setApiStatus((current) => ({ ...current, message }))
      return { ok: false, message }
    }
  }

  function setView(nextView) {
    setViewState(nextView)
    if (nextView === 'admin') {
      window.history.replaceState(null, '', '#admin')
      return
    }

    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  if (view === 'admin') {
    return (
      <AdminShell
        addClient={addClient}
        addOrder={addOrder}
        addProduct={addProduct}
        addSupplier={addSupplier}
        apiStatus={apiStatus}
        clients={clients}
        isAuthenticated={isAdminAuthenticated}
        orders={orders}
        products={products}
        setIsAuthenticated={setIsAdminAuthenticated}
        setView={setView}
        suppliers={suppliers}
        updateClient={updateClient}
        updateOrder={updateOrder}
        updateProduct={updateProduct}
        updateSupplier={updateSupplier}
        showProductModal={showProductModal}
        setShowProductModal={setShowProductModal}
        showSupplierModal={showSupplierModal}
        setShowSupplierModal={setShowSupplierModal}
        showClientModal={showClientModal}
        setShowClientModal={setShowClientModal}
        showOrderModal={showOrderModal}
        setShowOrderModal={setShowOrderModal}
        ModalOverlay={ModalOverlay}
      />
    )
  }

  return (
    <Storefront
      activeProducts={activeProducts}
      addToCart={addToCart}
      cartCount={cartCount}
      cartItems={cartItems}
      cartTotal={cartTotal}
      cartNotice={cartNotice}
      checkoutStatus={checkoutStatus}
      dismissCartNotice={() => setCartNotice(null)}
      registerCartOrder={registerCartOrder}
      setView={setView}
      suppliers={suppliers}
      updateCartQuantity={updateCartQuantity}
    />
  )
}

function Storefront({
  activeProducts,
  addToCart,
  cartCount,
  cartItems,
  cartTotal,
  cartNotice,
  checkoutStatus,
  dismissCartNotice,
  registerCartOrder,
  setView,
  suppliers,
  updateCartQuantity,
}) {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('launch')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return activeProducts
      .filter((product) => activeCategory === 'Todos' || product.category === activeCategory)
      .filter((product) => {
        const searchable = [product.name, product.category, product.description, product.fabric]
          .join(' ')
          .toLowerCase()
        return !normalizedQuery || searchable.includes(normalizedQuery)
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price
        if (sort === 'price-desc') return b.price - a.price
        if (sort === 'stock') return totalStock(b) - totalStock(a)
        return Number(b.launch) - Number(a.launch)
      })
  }, [activeCategory, activeProducts, query, sort])

  const launches = activeProducts.filter((product) => product.launch).slice(0, 4)
  const heroProduct = launches[0] || activeProducts[0]

  return (
    <div className="site-shell">
      <PublicHeader
        cartCount={cartCount}
        isMenuOpen={isMenuOpen}
        onCartOpen={() => setIsCartOpen(true)}
        setIsMenuOpen={setIsMenuOpen}
        setView={setView}
      />

      <main>
        <section className="hero-section" id="inicio">
          <div className="hero-media" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow">Atacado de moda fitness masculina</p>
            <h1>RB Dry Fit</h1>
            <p className="hero-copy">
              Pecas de giro rapido, visual forte e reposicao organizada para revendedores,
              academias e lojas que precisam vender sem perder tempo.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#catalogo">
                <ShoppingBag size={18} />
                Ver catalogo
              </a>
              <a className="button whatsapp" href={productWhatsAppLink(heroProduct)} target="_blank" rel="noreferrer">
                <MessageCircle size={18} />
                Comprar no WhatsApp
              </a>
            </div>
            <div className="hero-stats" aria-label="Indicadores da loja">
              <span>
                <strong>120+</strong>
                SKUs ativos
              </span>
              <span>
                <strong>24h</strong>
                separacao media
              </span>
              <span>
                <strong>Brasil</strong>
                envio nacional
              </span>
            </div>
          </div>
        </section>

        <TrustBar />

        <section className="section categories-section" id="categorias">
          <div className="section-heading">
            <p className="eyebrow">Compra por linha</p>
            <h2>Categorias prontas para vender</h2>
          </div>

          <div className="category-grid">
            {categories.slice(1).map((category) => (
              <button
                className="category-card"
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name)
                  document.querySelector('#catalogo')?.scrollIntoView({ behavior: 'smooth' })
                }}
                type="button"
              >
                <img src={category.image} alt="" />
                <span className="category-shade" />
                <category.icon size={24} />
                <strong>{category.name}</strong>
                <small>Ver produtos</small>
              </button>
            ))}
          </div>
        </section>

        <section className="section launch-section" id="lancamentos">
          <div className="section-heading row">
            <div>
              <p className="eyebrow">Novidades</p>
              <h2>Lancamentos da semana</h2>
            </div>
            <a className="text-link" href="#catalogo">
              Ver todos
              <ChevronRight size={16} />
            </a>
          </div>
          <div className="launch-strip">
            {launches.map((product) => (
              <ProductCard
                addToCart={addToCart}
                compact
                key={product.id}
                product={product}
                supplier={supplierById(suppliers, product.supplierId)}
              />
            ))}
          </div>
        </section>

        <section className="section catalog-section" id="catalogo">
          <div className="section-heading">
            <p className="eyebrow">Catalogo digital</p>
            <h2>Escolha as pecas e chame no WhatsApp</h2>
          </div>

          <div className="catalog-toolbar">
            <div className="search-field">
              <Search size={18} />
              <input
                aria-label="Buscar produto"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar produto, tecido ou linha"
                type="search"
                value={query}
              />
            </div>

            <div className="filter-pills" aria-label="Categorias">
              {categories.map((category) => (
                <button
                  className={activeCategory === category.name ? 'is-active' : ''}
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  type="button"
                >
                  <category.icon size={16} />
                  {category.name}
                </button>
              ))}
            </div>

            <label className="select-field">
              <Filter size={16} />
              <select aria-label="Ordenar produtos" onChange={(event) => setSort(event.target.value)} value={sort}>
                <option value="launch">Lancamentos primeiro</option>
                <option value="stock">Mais estoque</option>
                <option value="price-asc">Menor preco</option>
                <option value="price-desc">Maior preco</option>
              </select>
            </label>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                addToCart={addToCart}
                key={product.id}
                product={product}
                supplier={supplierById(suppliers, product.supplierId)}
              />
            ))}
          </div>
        </section>

        <OperationalBand />
        <SocialProof />
      </main>

      <Footer setView={setView} />

      <CartDrawer
        cartItems={cartItems}
        cartTotal={cartTotal}
        checkoutStatus={checkoutStatus}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={registerCartOrder}
        updateCartQuantity={updateCartQuantity}
      />

      <CartNotice
        notice={cartNotice}
        onOpenCart={() => {
          setIsCartOpen(true)
          dismissCartNotice()
        }}
      />
    </div>
  )
}

function CartNotice({ notice, onOpenCart }) {
  if (!notice) return null

  return (
    <div className="cart-notice" role="status" aria-live="polite">
      <CheckCircle2 size={20} />
      <div>
        <strong>Produto adicionado ao carrinho</strong>
        <span>{notice.productName}</span>
      </div>
      <button onClick={onOpenCart} type="button">
        Ver carrinho
      </button>
    </div>
  )
}

function PublicHeader({ cartCount, isMenuOpen, onCartOpen, setIsMenuOpen, setView }) {
  const navItems = [
    ['Inicio', '#inicio'],
    ['Categorias', '#categorias'],
    ['Lancamentos', '#lancamentos'],
    ['Catalogo', '#catalogo'],
  ]

  return (
    <header className="public-header">
      <a className="brand" href="#inicio" aria-label="RB Dry Fit">
        <span className="brand-mark">RB</span>
        <span>
          <strong>RB Dry Fit</strong>
          <small>Atacado premium</small>
        </span>
      </a>

      <nav className={isMenuOpen ? 'is-open' : ''}>
        {navItems.map(([label, href]) => (
          <a href={href} key={href} onClick={() => setIsMenuOpen(false)}>
            {label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button className="ghost-button admin-entry" onClick={() => setView('admin')} type="button">
          <LockKeyhole size={16} />
          Painel
        </button>
        <button className="cart-button" onClick={onCartOpen} type="button">
          <ShoppingBag size={18} />
          <span>{cartCount}</span>
        </button>
        <button
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="menu-button"
          onClick={() => setIsMenuOpen((current) => !current)}
          title={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          type="button"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  )
}

function TrustBar() {
  const items = [
    { icon: Truck, title: 'Entrega nacional', text: 'Envios para todo o Brasil' },
    { icon: ShieldCheck, title: 'Compra segura', text: 'Pedido direto no WhatsApp' },
    { icon: BadgeCheck, title: 'Qualidade premium', text: 'Malhas e costuras conferidas' },
    { icon: Clock3, title: 'Atendimento rapido', text: 'Orcamentos com agilidade' },
  ]

  return (
    <section className="trust-bar" aria-label="Diferenciais RB Dry Fit">
      {items.map((item) => (
        <div className="trust-item" key={item.title}>
          <item.icon size={26} />
          <span>
            <strong>{item.title}</strong>
            <small>{item.text}</small>
          </span>
        </div>
      ))}
    </section>
  )
}

function ProductCard({ addToCart, compact = false, product, supplier }) {
  return (
    <article className={`product-card ${compact ? 'compact' : ''}`}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="product-badge">{product.badge}</span>
      </div>

      <div className="product-body">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
          {!compact && <p className="product-description">{product.description}</p>}
        </div>

        <div className="product-meta">
          <span>{product.fabric}</span>
          <span>{totalStock(product)} un.</span>
        </div>

        <div className="swatches" aria-label={`Cores de ${product.name}`}>
          {product.colors.map((color) => (
            <span key={color}>{color}</span>
          ))}
        </div>

        <div className="product-bottom">
          <div>
            <strong>{formatCurrency(product.price)}</strong>
            <small>{supplier?.name || 'Fornecedor RB'}</small>
          </div>
          <div className="product-actions">
            <button
              aria-label={`Adicionar ${product.name} ao carrinho`}
              onClick={() => addToCart(product.id)}
              title="Adicionar ao carrinho"
              type="button"
            >
              <Plus size={17} />
            </button>
            <a aria-label={`Comprar ${product.name} no WhatsApp`} href={productWhatsAppLink(product)} target="_blank" rel="noreferrer">
              <MessageCircle size={17} />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

function OperationalBand() {
  const metrics = [
    { label: 'Margem media', value: '42%', icon: TrendingUp },
    { label: 'Curva ABC', value: 'A/B/C', icon: BarChart3 },
    { label: 'Reposicao', value: 'Semanal', icon: Warehouse },
  ]

  return (
    <section className="operation-band" id="sobre">
      <div>
        <p className="eyebrow">Operacao de atacado</p>
        <h2>Bonito na vitrine, serio nos bastidores.</h2>
        <p>
          O catalogo conversa com o WhatsApp e o painel interno acompanha estoque,
          fornecedores, pedidos e pontos de reposicao para manter a loja girando.
        </p>
      </div>
      <div className="operation-metrics">
        {metrics.map((metric) => (
          <span key={metric.label}>
            <metric.icon size={22} />
            <strong>{metric.value}</strong>
            <small>{metric.label}</small>
          </span>
        ))}
      </div>
    </section>
  )
}

function SocialProof() {
  const testimonials = [
    ['Lucas Trainer', 'Qualidade absurda. O tecido nao fica pesado e meus alunos sempre pedem reposicao.'],
    ['Gabriel Souza', 'Chegou rapido e a grade veio certinha. O kit de academia vendeu no primeiro fim de semana.'],
    ['Matheus Lima', 'Atendimento direto, preco bom para revenda e acabamento melhor do que eu esperava.'],
  ]

  return (
    <section className="section social-proof" id="contato">
      <div className="section-heading">
        <p className="eyebrow">Clientes RB</p>
        <h2>Quem compra volta para repor</h2>
      </div>

      <div className="testimonial-grid">
        {testimonials.map(([name, text]) => (
          <article className="testimonial" key={name}>
            <div className="stars" aria-label="5 estrelas">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star fill="currentColor" key={index} size={15} />
              ))}
            </div>
            <p>{text}</p>
            <strong>{name}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}

function Footer({ setView }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="brand-mark">RB</span>
        <p>
          RB Dry Fit veste performance para quem treina, vende e precisa de uma
          operacao enxuta.
        </p>
      </div>

      <div>
        <h3>Atendimento</h3>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
          <Phone size={16} />
          (85) 98915-7437
        </a>
        <a href="https://www.instagram.com/rb.dryfit/" target="_blank" rel="noreferrer">
          <AtSign size={16} />
          @rb.dryfit
        </a>
        <span>
          <MapPin size={16} />
          Enviamos para todo o Brasil
        </span>
      </div>

      <div>
        <h3>Pagamento</h3>
        <span>
          <QrCode size={16} />
          Pix
        </span>
        <span>
          <CreditCard size={16} />
          Cartao
        </span>
        <span>
          <Banknote size={16} />
          Condicoes para atacado
        </span>
      </div>

      <div>
        <h3>Interno</h3>
        <button className="footer-admin" onClick={() => setView('admin')} type="button">
          <LockKeyhole size={16} />
          Painel administrativo
        </button>
        <span>
          <Mail size={16} />
          contato@rbdryfit.com.br
        </span>
      </div>
    </footer>
  )
}

function CartDrawer({ cartItems, cartTotal, checkoutStatus, isOpen, onCheckout, onClose, updateCartQuantity }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isCheckoutDisabled = cartItems.length === 0 || isSubmitting || checkoutStatus.isSaving

  async function handleCheckout() {
    if (isCheckoutDisabled) return

    const whatsappUrl = checkoutLink(cartItems, cartTotal)
    const whatsappWindow = window.open('', '_blank')

    setIsSubmitting(true)
    try {
      const result = await onCheckout()

      if (result?.ok) {
        if (whatsappWindow) {
          whatsappWindow.opener = null
          whatsappWindow.location.href = whatsappUrl
        } else {
          window.location.href = whatsappUrl
        }
        onClose()
        return
      }

      whatsappWindow?.close()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        aria-label="Fechar carrinho"
        className={`drawer-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <aside className={`cart-drawer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
        <header>
          <div>
            <p className="eyebrow">Pedido</p>
            <h2>Carrinho RB</h2>
          </div>
          <button aria-label="Fechar carrinho" onClick={onClose} title="Fechar carrinho" type="button">
            <X size={20} />
          </button>
        </header>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Seu carrinho esta vazio.</p>
          ) : (
            cartItems.map(({ product, quantity }) => (
              <div className="cart-item" key={product.id}>
                <img src={product.image} alt="" />
                <div>
                  <strong>{product.name}</strong>
                  <span>{formatCurrency(product.price)}</span>
                </div>
                <div className="quantity-control">
                  <button
                    aria-label={`Diminuir ${product.name}`}
                    onClick={() => updateCartQuantity(product.id, quantity - 1)}
                    title="Diminuir quantidade"
                    type="button"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    aria-label={`Aumentar ${product.name}`}
                    onClick={() => updateCartQuantity(product.id, quantity + 1)}
                    title="Aumentar quantidade"
                    type="button"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer>
          <div className="cart-total">
            <span>Total</span>
            <strong>{formatCurrency(cartTotal)}</strong>
          </div>
          <button
            className={`button whatsapp ${isCheckoutDisabled ? 'is-disabled' : ''}`}
            disabled={isCheckoutDisabled}
            onClick={handleCheckout}
            type="button"
          >
            {isSubmitting || checkoutStatus.isSaving ? <Clock3 size={18} /> : <MessageCircle size={18} />}
            {isSubmitting || checkoutStatus.isSaving ? 'Salvando pedido...' : 'Finalizar no WhatsApp'}
          </button>
          {checkoutStatus.message && <p className="checkout-status">{checkoutStatus.message}</p>}
        </footer>
      </aside>
    </>
  )
}

function AdminShell({
  addClient,
  addOrder,
  addProduct,
  addSupplier,
  apiStatus,
  clients,
  isAuthenticated,
  orders,
  products,
  setIsAuthenticated,
  setView,
  suppliers,
  updateClient,
  updateOrder,
  updateProduct,
  updateSupplier,
  showProductModal,
  setShowProductModal,
  showSupplierModal,
  setShowSupplierModal,
  showClientModal,
  setShowClientModal,
  showOrderModal,
  setShowOrderModal,
  ModalOverlay,
}) {
  const [activeSection, setActiveSection] = useState('overview')

  if (!isAuthenticated) {
    return <AdminLogin setIsAuthenticated={setIsAuthenticated} setView={setView} />
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand admin-brand">
          <span className="brand-mark">RB</span>
          <span>
            <strong>Painel RB</strong>
            <small>Operacao interna</small>
          </span>
        </div>

        <nav>
          {adminSections.map((section) => (
            <button
              className={activeSection === section.id ? 'is-active' : ''}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Administradores</p>
            <h1>{adminSections.find((section) => section.id === activeSection)?.label}</h1>
            <small className={`api-status ${apiStatus.isOnline ? 'is-online' : ''}`}>
              {apiStatus.isLoading ? 'Conectando API...' : apiStatus.message}
            </small>
          </div>
          <div className="admin-actions">
            <button className="ghost-button" onClick={() => setView('store')} type="button">
              <ShoppingBag size={16} />
              Catalogo
            </button>
            <button className="danger-button" onClick={() => setIsAuthenticated(false)} type="button">
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </header>

        {activeSection === 'overview' && (
          <AdminOverview
            apiStatus={apiStatus}
            clients={clients}
            orders={orders}
            products={products}
            suppliers={suppliers}
          />
        )}
        {activeSection === 'products' && (
          <AdminProducts
            addProduct={addProduct}
            products={products}
            suppliers={suppliers}
            updateProduct={updateProduct}
            showModal={showProductModal}
            setShowModal={setShowProductModal}
            ModalOverlay={ModalOverlay}
          />
        )}
        {activeSection === 'stock' && <AdminStock products={products} updateProduct={updateProduct} />}
        {activeSection === 'suppliers' && (
          <AdminSuppliers
            addSupplier={addSupplier}
            suppliers={suppliers}
            updateSupplier={updateSupplier}
            showModal={showSupplierModal}
            setShowModal={setShowSupplierModal}
            ModalOverlay={ModalOverlay}
          />
        )}
        {activeSection === 'clients' && (
          <AdminClients
            addClient={addClient}
            clients={clients}
            updateClient={updateClient}
            showModal={showClientModal}
            setShowModal={setShowClientModal}
            ModalOverlay={ModalOverlay}
          />
        )}
        {activeSection === 'orders' && (
          <AdminOrders
            addOrder={addOrder}
            clients={clients}
            orders={orders}
            products={products}
            updateOrder={updateOrder}
            showModal={showOrderModal}
            setShowModal={setShowOrderModal}
            ModalOverlay={ModalOverlay}
          />
        )}
      </main>
    </div>
  )
}

function AdminLogin({ setIsAuthenticated, setView }) {
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
      return
    }

    setError('Credenciais invalidas.')
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand login-brand">
          <span className="brand-mark">RB</span>
          <span>
            <strong>RB Dry Fit</strong>
            <small>Painel interno</small>
          </span>
        </div>
        <div>
          <p className="eyebrow">Acesso administrativo</p>
          <h1>Gestao de catalogo, estoque e fornecedores.</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            E-mail
            <input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </label>
          <label>
            Senha
            <input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Senha do administrador"
              type="password"
              value={password}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button primary" type="submit">
            <LockKeyhole size={18} />
            Entrar
          </button>
        </form>

        <button className="text-link muted" onClick={() => setView('store')} type="button">
          Voltar ao catalogo
          <ChevronRight size={16} />
        </button>
      </section>
    </main>
  )
}

function AdminOverview({ apiStatus, clients, orders, products, suppliers }) {
  const isDatabaseReady = apiStatus.isOnline && !apiStatus.isLoading
  const dbProducts = isDatabaseReady ? products : []
  const dbSuppliers = isDatabaseReady ? suppliers : []
  const dbOrders = isDatabaseReady ? orders : []
  const dbClients = isDatabaseReady ? clients : []
  const inventoryUnits = dbProducts.reduce((total, product) => total + totalStock(product), 0)
  const inventoryCost = dbProducts.reduce((total, product) => total + totalStock(product) * product.cost, 0)
  const inventoryPotential = dbProducts.reduce((total, product) => total + totalStock(product) * product.price, 0)
  const lowStockProducts = dbProducts.filter((product) => stockTone(product) !== 'healthy')
  const salesTotal = dbOrders.reduce((total, order) => total + order.total, 0)

  const cards = [
    { label: 'Pecas em estoque', value: inventoryUnits, icon: Boxes, tone: 'gold' },
    { label: 'Valor de custo', value: formatCurrency(inventoryCost), icon: Warehouse, tone: 'green' },
    { label: 'Potencial de venda', value: formatCurrency(inventoryPotential), icon: TrendingUp, tone: 'lime' },
    { label: 'Clientes ativos', value: dbClients.filter((client) => client.active !== false).length, icon: AtSign, tone: 'red' },
  ]

  return (
    <section className="admin-section">
      <article className={`admin-data-banner ${isDatabaseReady ? 'is-online' : ''}`}>
        <ShieldCheck size={18} />
        <div>
          <strong>{isDatabaseReady ? 'Resumo usando dados do Firebird' : 'Aguardando dados reais do banco'}</strong>
          <span>
            {apiStatus.isLoading
              ? 'Conectando na API...'
              : apiStatus.message || 'Nenhum dado local sera usado neste resumo.'}
          </span>
        </div>
      </article>

      <div className="metric-grid">
        {cards.map((card) => (
          <article className={`metric-card ${card.tone}`} key={card.label}>
            <card.icon size={22} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-columns">
        <article className="admin-panel">
          <div className="panel-heading">
            <h2>Alertas de estoque</h2>
            <AlertTriangle size={18} />
          </div>
          <div className="alert-list">
            {lowStockProducts.map((product) => (
              <div className="alert-row" key={product.id}>
                <span className={`stock-dot ${stockTone(product)}`} />
                <div>
                  <strong>{product.name}</strong>
                  <small>{totalStock(product)} unidades restantes</small>
                </div>
                <span>{product.category}</span>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="empty-state">
                {isDatabaseReady ? 'Estoque saudavel em todas as linhas.' : 'Conecte a API para carregar alertas reais.'}
              </p>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="panel-heading">
            <h2>Fornecedores ativos</h2>
            <UsersRound size={18} />
          </div>
          <div className="supplier-mini-list">
            {dbSuppliers.map((supplier) => (
              <div className="supplier-mini" key={supplier.id}>
                <div>
                  <strong>{supplier.name}</strong>
                  <small>{supplier.category}</small>
                </div>
                <span>{supplier.leadTime} dias</span>
              </div>
            ))}
            {dbSuppliers.length === 0 && <p className="empty-state">Nenhum fornecedor carregado do banco.</p>}
          </div>
        </article>
      </div>

      <article className="admin-panel">
        <div className="panel-heading">
          <h2>Pedidos recentes</h2>
          <strong>{formatCurrency(salesTotal)}</strong>
        </div>
        <div className="order-table compact-table">
          {dbOrders.map((order) => (
            <div className="order-row" key={order.id}>
              <strong>{order.id}</strong>
              <span>{order.customer}</span>
              <span>{order.items}</span>
              <span>{formatCurrency(order.total)}</span>
              <span className="status-chip">{order.status}</span>
            </div>
          ))}
          {dbOrders.length === 0 && <p className="empty-state">Nenhum pedido carregado do banco.</p>}
        </div>
      </article>
    </section>
  )
}

function FormBlock({ children, className = '', title }) {
  return (
    <fieldset className={`form-block ${className}`}>
      <legend>{title}</legend>
      <div className="form-block-grid">{children}</div>
    </fieldset>
  )
}

function AdminProducts({ addProduct, products, suppliers, updateProduct, showModal, setShowModal, ModalOverlay }) {
  const firstSupplierId = suppliers[0]?.id ? String(suppliers[0].id) : ''
  const [newProduct, setNewProduct] = useState(() => emptyProductForm(firstSupplierId))
  const [formStatus, setFormStatus] = useState({ tone: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  function updateNewProduct(field, value) {
    setNewProduct((current) => ({ ...current, [field]: value }))
  }

  function updateProductSize(size, value) {
    setNewProduct((current) => ({
      ...current,
      sizes: { ...current.sizes, [size]: value },
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!newProduct.name.trim()) {
      setFormStatus({ tone: 'error', message: 'Informe o nome do produto.' })
      return
    }

    setIsSaving(true)
    setFormStatus({ tone: '', message: '' })

    const product = {
      id: `produto-${Date.now()}`,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: parseCurrency(newProduct.price),
      cost: parseCurrency(newProduct.cost),
      image: newProduct.image.trim() || productImages.training,
      badge: newProduct.badge.trim() || 'Novo',
      description: newProduct.description.trim() || 'Produto cadastrado pelo painel interno.',
      fabric: newProduct.fabric.trim() || 'Dry fit',
      colors: colorsFromText(newProduct.colors).length ? colorsFromText(newProduct.colors) : ['Preto'],
      sizes: sizesFromForm(newProduct.sizes),
      supplierId: newProduct.supplierId || firstSupplierId || null,
      reorderPoint: Number(newProduct.reorderPoint || 10),
      active: newProduct.active,
      launch: newProduct.launch,
    }

    const result = await addProduct(product)
    setIsSaving(false)

    if (result?.ok) {
      setFormStatus({ tone: 'success', message: `Produto ${result.product?.name || product.name} cadastrado.` })
      setNewProduct(emptyProductForm(firstSupplierId))
      return
    }

    setFormStatus({ tone: 'error', message: result?.message || 'Nao foi possivel cadastrar o produto.' })
  }

  return (
    <>
      <section className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Produtos</h2>
          <button
            className="button primary"
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} />
            Novo Produto
          </button>
        </div>

        <div className="admin-list">
          {products.map((product) => (
            <article className="product-admin-row" key={product.id}>
              <img src={product.image} alt="" />
              <div className="product-admin-info">
                <strong>{product.name}</strong>
                <small>
                  {product.category} · {formatCurrency(product.price)} · {totalStock(product)} un.
                </small>
                <p>{product.description}</p>
              </div>
              <div className="product-admin-controls">
                <label>
                  Categoria
                  <select
                    aria-label={`Categoria de ${product.name}`}
                    onChange={(event) => updateProduct(product.id, { category: event.target.value })}
                    value={product.category}
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category.name}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Fornecedor
                  <select
                    aria-label={`Fornecedor de ${product.name}`}
                    onChange={(event) => updateProduct(product.id, { supplierId: event.target.value || null })}
                    value={product.supplierId || ''}
                  >
                    <option value="">Sem fornecedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className={`status-toggle ${product.launch ? 'is-on' : ''}`}
                  onClick={() => updateProduct(product.id, { launch: !product.launch })}
                  type="button"
                >
                  <Sparkles size={16} />
                  {product.launch ? 'Lancamento' : 'Linha'}
                </button>
                <button
                  className={`status-toggle ${product.active ? 'is-on' : ''}`}
                  onClick={() => updateProduct(product.id, { active: !product.active })}
                  type="button"
                >
                  <CheckCircle2 size={16} />
                  {product.active ? 'Publicado' : 'Oculto'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ModalOverlay
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Produto"
      >
        <form className="admin-form product-form organized-form" onSubmit={handleSubmit}>
          <FormBlock title="Identificacao">
            <label>
              Produto
              <input
                onChange={(event) => updateNewProduct('name', event.target.value)}
                placeholder="Nome do produto"
                required
                value={newProduct.name}
              />
            </label>
            <label>
              Categoria
              <select
                onChange={(event) => updateNewProduct('category', event.target.value)}
                value={newProduct.category}
              >
                {categories.slice(1).map((category) => (
                  <option key={category.name}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Fornecedor
              <select
                onChange={(event) => updateNewProduct('supplierId', event.target.value)}
                value={newProduct.supplierId || firstSupplierId}
              >
                {!firstSupplierId && <option value="">Sem fornecedor</option>}
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Badge
              <input
                onChange={(event) => updateNewProduct('badge', event.target.value)}
                placeholder="Novo"
                value={newProduct.badge}
              />
            </label>
          </FormBlock>

          <FormBlock title="Preco e estoque">
            <label>
              Preco
              <input
                inputMode="decimal"
                onChange={(event) => updateNewProduct('price', event.target.value)}
                placeholder="59,90"
                value={newProduct.price}
              />
            </label>
            <label>
              Custo
              <input
                inputMode="decimal"
                onChange={(event) => updateNewProduct('cost', event.target.value)}
                placeholder="32,00"
                value={newProduct.cost}
              />
            </label>
            <label>
              Tecido
              <input
                onChange={(event) => updateNewProduct('fabric', event.target.value)}
                placeholder="Dry fit"
                value={newProduct.fabric}
              />
            </label>
            <label>
              Ponto de reposicao
              <input
                min="0"
                onChange={(event) => updateNewProduct('reorderPoint', event.target.value)}
                type="number"
                value={newProduct.reorderPoint}
              />
            </label>
          </FormBlock>

          <FormBlock className="full" title="Apresentacao no catalogo">
            <label className="wide-field">
              Imagem do produto
              <input
                onChange={(event) => updateNewProduct('image', event.target.value)}
                placeholder="https://..."
                type="url"
                value={newProduct.image}
              />
            </label>
            <label className="wide-field">
              Cores
              <input
                onChange={(event) => updateNewProduct('colors', event.target.value)}
                placeholder="Preto, Branco, Azul"
                value={newProduct.colors}
              />
            </label>
            <label className="wide-field description-field">
              Descricao
              <textarea
                onChange={(event) => updateNewProduct('description', event.target.value)}
                placeholder="Detalhes comerciais do produto"
                rows={3}
                value={newProduct.description}
              />
            </label>
          </FormBlock>

          <FormBlock className="full" title="Grade inicial e publicacao">
            <fieldset className="form-size-grid">
              <legend>Grade inicial</legend>
              {SIZES.map((size) => (
                <label key={size}>
                  {size}
                  <input
                    min="0"
                    onChange={(event) => updateProductSize(size, event.target.value)}
                    type="number"
                    value={newProduct.sizes[size]}
                  />
                </label>
              ))}
            </fieldset>

            <div className="product-form-options">
              <label className="checkbox-field">
                <input
                  checked={newProduct.active}
                  onChange={(event) => updateNewProduct('active', event.target.checked)}
                  type="checkbox"
                />
                <span>Publicado</span>
              </label>
              <label className="checkbox-field">
                <input
                  checked={newProduct.launch}
                  onChange={(event) => updateNewProduct('launch', event.target.checked)}
                  type="checkbox"
                />
                <span>Lancamento</span>
              </label>
            </div>

            <div className="form-actions">
              <button className="button primary" disabled={isSaving} type="submit">
                <Plus size={18} />
                {isSaving ? 'Cadastrando...' : 'Cadastrar'}
              </button>
              <button
                className="ghost-button"
                onClick={() => {
                  setNewProduct(emptyProductForm(firstSupplierId))
                  setFormStatus({ tone: '', message: '' })
                }}
                type="button"
              >
                Limpar
              </button>
            </div>
          </FormBlock>

          {formStatus.message && (
            <p className={`form-feedback ${formStatus.tone}`} role="status">
              {formStatus.message}
            </p>
          )}
        </form>
      </ModalOverlay>
    </>
  )
}

function AdminStock({ products, updateProduct }) {
  function changeSize(product, size, value) {
    updateProduct(product.id, {
      sizes: { ...product.sizes, [size]: Math.max(0, Number(value) || 0) },
    })
  }

  return (
    <section className="admin-section">
      <div className="stock-table">
        <div className="stock-head">
          <span>Produto</span>
          <span>Grade</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {products.map((product) => (
          <div className="stock-row" key={product.id}>
            <div className="stock-product">
              <img src={product.image} alt="" />
              <div>
                <strong>{product.name}</strong>
                <small>Reposicao em {product.reorderPoint} un.</small>
              </div>
            </div>
            <div className="size-inputs">
              {SIZES.filter((size) => size in product.sizes).map((size) => (
                <label key={size}>
                  {size}
                  <input
                    min="0"
                    onChange={(event) => changeSize(product, size, event.target.value)}
                    type="number"
                    value={product.sizes[size]}
                  />
                </label>
              ))}
            </div>
            <strong>{totalStock(product)}</strong>
            <span className={`stock-pill ${stockTone(product)}`}>
              {stockTone(product) === 'healthy' ? 'Saudavel' : 'Repor'}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function AdminSuppliers({ addSupplier, suppliers, updateSupplier, showModal, setShowModal, ModalOverlay }) {
  const [newSupplier, setNewSupplier] = useState(emptySupplierForm)
  const [formStatus, setFormStatus] = useState({ tone: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  function updateNewSupplier(field, value) {
    setNewSupplier((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!newSupplier.name.trim()) {
      setFormStatus({ tone: 'error', message: 'Informe o nome do fornecedor.' })
      return
    }

    setIsSaving(true)
    setFormStatus({ tone: '', message: '' })

    const supplier = {
      id: `fornecedor-${Date.now()}`,
      name: newSupplier.name.trim(),
      category: newSupplier.category || 'Fornecedor geral',
      contact: newSupplier.contact || 'Contato comercial',
      phone: newSupplier.phone || '(00) 00000-0000',
      city: newSupplier.city || 'Brasil',
      leadTime: Number(newSupplier.leadTime) || 7,
      rating: parseCurrency(newSupplier.rating || '4,6'),
      openOrders: Number(newSupplier.openOrders || 0),
      status: newSupplier.status || 'Em avaliacao',
      active: newSupplier.active,
    }

    const result = await addSupplier(supplier)
    setIsSaving(false)

    if (result?.ok) {
      setFormStatus({ tone: 'success', message: `Fornecedor ${result.supplier?.name || supplier.name} cadastrado.` })
      setNewSupplier(emptySupplierForm())
      return
    }

    setFormStatus({ tone: 'error', message: result?.message || 'Nao foi possivel cadastrar o fornecedor.' })
  }

  return (
    <>
      <section className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Fornecedores</h2>
          <button
            className="button primary"
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} />
            Novo Fornecedor
          </button>
        </div>

        <div className="supplier-grid">
          {suppliers.map((supplier) => (
            <article className="supplier-card" key={supplier.id}>
              <div className="supplier-top">
                <div>
                  <strong>{supplier.name}</strong>
                  <small>{supplier.category}</small>
                </div>
                <span>{supplier.rating.toFixed(1)}</span>
              </div>
              <p>{supplier.contact}</p>
              <div className="supplier-facts">
                <span>
                  <Phone size={15} />
                  {supplier.phone}
                </span>
                <span>
                  <MapPin size={15} />
                  {supplier.city}
                </span>
                <span>
                  <Clock3 size={15} />
                  {supplier.leadTime} dias
                </span>
              </div>
              <select
                aria-label={`Status de ${supplier.name}`}
                onChange={(event) => updateSupplier(supplier.id, { status: event.target.value })}
                value={supplier.status}
              >
                <option>Homologado</option>
                <option>Em producao</option>
                <option>Em avaliacao</option>
                <option>Pausado</option>
              </select>
              <button
                className={`status-toggle ${supplier.active !== false ? 'is-on' : ''}`}
                onClick={() => updateSupplier(supplier.id, { active: supplier.active === false })}
                type="button"
              >
                <CheckCircle2 size={16} />
                {supplier.active !== false ? 'Ativo' : 'Inativo'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <ModalOverlay
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Fornecedor"
      >
        <form className="admin-form product-form organized-form" onSubmit={handleSubmit}>
          <FormBlock title="Dados do fornecedor">
            <label>
              Fornecedor
              <input
                onChange={(event) => updateNewSupplier('name', event.target.value)}
                placeholder="Nome da empresa"
                required
                value={newSupplier.name}
              />
            </label>
            <label>
              Linha
              <input
                onChange={(event) => updateNewSupplier('category', event.target.value)}
                placeholder="Ex: Dry fit premium"
                value={newSupplier.category}
              />
            </label>
            <label>
              Contato
              <input
                onChange={(event) => updateNewSupplier('contact', event.target.value)}
                placeholder="Responsavel"
                value={newSupplier.contact}
              />
            </label>
            <label>
              Telefone
              <input
                onChange={(event) => updateNewSupplier('phone', event.target.value)}
                placeholder="(00) 00000-0000"
                value={newSupplier.phone}
              />
            </label>
          </FormBlock>

          <FormBlock title="Operacao e status">
            <label>
              Cidade
              <input
                onChange={(event) => updateNewSupplier('city', event.target.value)}
                placeholder="Cidade - UF"
                value={newSupplier.city}
              />
            </label>
            <label>
              Lead time
              <input
                min="1"
                onChange={(event) => updateNewSupplier('leadTime', event.target.value)}
                type="number"
                value={newSupplier.leadTime}
              />
            </label>
            <label>
              Avaliacao
              <input
                inputMode="decimal"
                onChange={(event) => updateNewSupplier('rating', event.target.value)}
                placeholder="4,6"
                value={newSupplier.rating}
              />
            </label>
            <label>
              Pedidos abertos
              <input
                min="0"
                onChange={(event) => updateNewSupplier('openOrders', event.target.value)}
                type="number"
                value={newSupplier.openOrders}
              />
            </label>
            <label>
              Status
              <select onChange={(event) => updateNewSupplier('status', event.target.value)} value={newSupplier.status}>
                <option>Homologado</option>
                <option>Em producao</option>
                <option>Em avaliacao</option>
                <option>Pausado</option>
              </select>
            </label>
            <div className="product-form-options">
              <label className="checkbox-field">
                <input
                  checked={newSupplier.active}
                  onChange={(event) => updateNewSupplier('active', event.target.checked)}
                  type="checkbox"
                />
                <span>Ativo</span>
              </label>
            </div>
          </FormBlock>

          <div className="form-actions full">
            <button className="button primary" disabled={isSaving} type="submit">
              <Plus size={18} />
              {isSaving ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            <button
              className="ghost-button"
              onClick={() => {
                setNewSupplier(emptySupplierForm())
                setFormStatus({ tone: '', message: '' })
              }}
              type="button"
            >
              Limpar
            </button>
          </div>
          {formStatus.message && (
            <p className={`form-feedback ${formStatus.tone}`} role="status">
              {formStatus.message}
            </p>
          )}
        </form>
      </ModalOverlay>
    </>
  )
}

function AdminClients({ addClient, clients, updateClient, showModal, setShowModal, ModalOverlay }) {
  const [newClient, setNewClient] = useState(emptyClientForm)
  const [formStatus, setFormStatus] = useState({ tone: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  function updateNewClient(field, value) {
    setNewClient((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!newClient.name.trim()) {
      setFormStatus({ tone: 'error', message: 'Informe o nome do cliente.' })
      return
    }

    setIsSaving(true)
    setFormStatus({ tone: '', message: '' })

    const client = {
      id: `cliente-${Date.now()}`,
      name: newClient.name.trim(),
      document: newClient.document,
      phone: newClient.phone,
      email: newClient.email,
      city: newClient.city,
      uf: newClient.uf,
      type: newClient.type,
      notes: newClient.notes || 'Cliente cadastrado pelo painel interno.',
      active: newClient.active,
    }

    const result = await addClient(client)
    setIsSaving(false)

    if (result?.ok) {
      setFormStatus({ tone: 'success', message: `Cliente ${result.client?.name || client.name} cadastrado.` })
      setNewClient(emptyClientForm())
      return
    }

    setFormStatus({ tone: 'error', message: result?.message || 'Nao foi possivel cadastrar o cliente.' })
  }

  return (
    <>
      <section className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Clientes</h2>
          <button
            className="button primary"
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>

        <div className="supplier-grid">
          {clients.map((client) => (
            <article className="supplier-card" key={client.id}>
              <div className="supplier-top">
                <div>
                  <strong>{client.name}</strong>
                  <small>{client.document || 'Documento nao informado'}</small>
                </div>
                <span>{client.type || 'Cliente'}</span>
              </div>
              <p>{client.notes || client.email || 'Cliente RB Dry Fit'}</p>
              <div className="supplier-facts">
                <span>
                  <Phone size={15} />
                  {client.phone || 'Sem telefone'}
                </span>
                <span>
                  <Mail size={15} />
                  {client.email || 'Sem e-mail'}
                </span>
                <span>
                  <MapPin size={15} />
                  {[client.city, client.uf].filter(Boolean).join(' - ') || 'Brasil'}
                </span>
              </div>
              <select
                aria-label={`Tipo de ${client.name}`}
                onChange={(event) => updateClient(client.id, { type: event.target.value })}
                value={client.type || 'Consumidor'}
              >
                <option>Consumidor</option>
                <option>Revenda</option>
                <option>Academia</option>
                <option>WhatsApp</option>
              </select>
              <button
                className={`status-toggle ${client.active !== false ? 'is-on' : ''}`}
                onClick={() => updateClient(client.id, { active: client.active === false })}
                type="button"
              >
                <CheckCircle2 size={16} />
                {client.active !== false ? 'Ativo' : 'Inativo'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <ModalOverlay
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Cliente"
      >
        <form className="admin-form product-form organized-form" onSubmit={handleSubmit}>
          <FormBlock title="Dados do cliente">
            <label>
              Cliente
              <input
                onChange={(event) => updateNewClient('name', event.target.value)}
                placeholder="Nome ou empresa"
                required
                value={newClient.name}
              />
            </label>
            <label>
              Documento
              <input
                onChange={(event) => updateNewClient('document', event.target.value)}
                placeholder="CPF ou CNPJ"
                value={newClient.document}
              />
            </label>
            <label>
              Telefone
              <input
                onChange={(event) => updateNewClient('phone', event.target.value)}
                placeholder="(00) 00000-0000"
                value={newClient.phone}
              />
            </label>
            <label>
              E-mail
              <input
                onChange={(event) => updateNewClient('email', event.target.value)}
                placeholder="cliente@email.com"
                type="email"
                value={newClient.email}
              />
            </label>
          </FormBlock>

          <FormBlock title="Perfil comercial">
            <label>
              Cidade
              <input
                onChange={(event) => updateNewClient('city', event.target.value)}
                placeholder="Cidade"
                value={newClient.city}
              />
            </label>
            <label>
              UF
              <input
                maxLength={2}
                onChange={(event) => updateNewClient('uf', event.target.value)}
                placeholder="PB"
                value={newClient.uf}
              />
            </label>
            <label>
              Tipo
              <select
                onChange={(event) => updateNewClient('type', event.target.value)}
                value={newClient.type}
              >
                <option>Consumidor</option>
                <option>Revenda</option>
                <option>Academia</option>
                <option>WhatsApp</option>
              </select>
            </label>
            <div className="product-form-options">
              <label className="checkbox-field">
                <input
                  checked={newClient.active}
                  onChange={(event) => updateNewClient('active', event.target.checked)}
                  type="checkbox"
                />
                <span>Ativo</span>
              </label>
            </div>
          </FormBlock>

          <FormBlock className="full" title="Observacoes">
            <label className="wide-field description-field">
              Observacao
              <textarea
                onChange={(event) => updateNewClient('notes', event.target.value)}
                placeholder="Historico, preferencias ou condicoes comerciais"
                rows={3}
                value={newClient.notes}
              />
            </label>
          </FormBlock>

          <div className="form-actions full">
            <button className="button primary" disabled={isSaving} type="submit">
              <Plus size={18} />
              {isSaving ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            <button
              className="ghost-button"
              onClick={() => {
                setNewClient(emptyClientForm())
                setFormStatus({ tone: '', message: '' })
              }}
              type="button"
            >
              Limpar
            </button>
          </div>
          {formStatus.message && (
            <p className={`form-feedback ${formStatus.tone}`} role="status">
              {formStatus.message}
            </p>
          )}
        </form>
      </ModalOverlay>
    </>
  )
}

function AdminOrders({ addOrder, clients, orders, products, updateOrder, showModal, setShowModal, ModalOverlay }) {
  const [newOrder, setNewOrder] = useState(() => emptyOrderForm(products))
  const [formStatus, setFormStatus] = useState({ tone: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  function updateNewOrder(field, value) {
    setNewOrder((current) => ({ ...current, [field]: value }))
  }

  function updateNewOrderItem(index, field, value) {
    setNewOrder((current) => {
      const items = [...current.items]
      items[index] = { ...items[index], [field]: value }

      if (field === 'productId') {
        const selectedProduct = products.find((product) => String(product.id) === value)
        items[index].productName = selectedProduct?.name || ''
        items[index].unitPrice = selectedProduct?.price ? String(selectedProduct.price).replace('.', ',') : ''
      }

      return { ...current, items }
    })
  }

  function addOrderItem() {
    setNewOrder((current) => ({ ...current, items: [...current.items, emptyOrderItem(products[0])] }))
  }

  function removeOrderItem(index) {
    setNewOrder((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!newOrder.customerName.trim()) {
      setFormStatus({ tone: 'error', message: 'Informe o nome do cliente.' })
      return
    }

    if (!newOrder.items.length || newOrder.items.some((item) => !item.productId || !Number(item.quantity))) {
      setFormStatus({ tone: 'error', message: 'Adicione ao menos um item com produto e quantidade.' })
      return
    }

    setIsSaving(true)
    setFormStatus({ tone: '', message: '' })

    const orderPayload = {
      clientId: numericId(newOrder.clientId) || newOrder.clientId || null,
      customerName: newOrder.customerName.trim(),
      customerPhone: newOrder.customerPhone.trim(),
      payment: newOrder.payment,
      status: newOrder.status,
      discount: parseCurrency(newOrder.discount),
      surcharge: parseCurrency(newOrder.surcharge),
      notes: newOrder.notes.trim(),
      items: newOrder.items.map((item) => ({
        productId: numericId(item.productId) || item.productId || null,
        productName: item.productName,
        size: item.size,
        quantity: Number(item.quantity) || 0,
        unitPrice: parseCurrency(item.unitPrice),
      })),
    }

    const result = await addOrder(orderPayload)
    setIsSaving(false)

    if (result?.ok) {
      setFormStatus({ tone: 'success', message: `Pedido ${result.order?.id || 'cadastrado'} salvo.` })
      setNewOrder(emptyOrderForm(products))
      setShowModal(false)
      return
    }

    setFormStatus({ tone: 'error', message: result?.message || 'Nao foi possivel cadastrar o pedido.' })
  }

  return (
    <>
      <section className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Pedidos</h2>
          <button
            className="button primary"
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} />
            Novo Pedido
          </button>
        </div>

        <div className="orders-board">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-top">
                <div>
                  <strong>{order.id}</strong>
                  <small>{order.date}</small>
                </div>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <h2>{order.customer}</h2>
              <div className="order-card-meta">
                <span>{order.items}</span>
                <span>{order.payment}</span>
              </div>
              <label>
                Status
                <select
                  onChange={(event) => updateOrder(order.id, { status: event.target.value })}
                  value={order.status}
                >
                  {orderStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </article>
          ))}
        </div>
      </section>

      <ModalOverlay
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setFormStatus({ tone: '', message: '' })
          setNewOrder(emptyOrderForm(products))
        }}
        title="Novo Pedido"
      >
        <form className="admin-form product-form organized-form" onSubmit={handleSubmit}>
          <FormBlock title="Dados do cliente">
            <label>
              Cliente existente
              <select
                onChange={(event) => {
                  const clientId = event.target.value
                  const client = clients.find((item) => String(item.id) === clientId)
                  setNewOrder((current) => ({
                    ...current,
                    clientId,
                    customerName: client?.name || current.customerName,
                    customerPhone: client?.phone || current.customerPhone,
                  }))
                }}
                value={newOrder.clientId}
              >
                <option value="">Nenhum</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nome do cliente
              <input
                required
                onChange={(event) => updateNewOrder('customerName', event.target.value)}
                placeholder="Nome do cliente"
                value={newOrder.customerName}
              />
            </label>
            <label>
              Telefone
              <input
                onChange={(event) => updateNewOrder('customerPhone', event.target.value)}
                placeholder="(00) 00000-0000"
                value={newOrder.customerPhone}
              />
            </label>
          </FormBlock>

          <FormBlock title="Pagamento e status">
            <label>
              Pagamento
              <select
                onChange={(event) => updateNewOrder('payment', event.target.value)}
                value={newOrder.payment}
              >
                <option>Pix</option>
                <option>Cartao</option>
                <option>Dinheiro</option>
                <option>Transferencia</option>
              </select>
            </label>
            <label>
              Status
              <select
                onChange={(event) => updateNewOrder('status', event.target.value)}
                value={newOrder.status}
              >
                {orderStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <label>
              Desconto
              <input
                inputMode="decimal"
                onChange={(event) => updateNewOrder('discount', event.target.value)}
                placeholder="0,00"
                value={newOrder.discount}
              />
            </label>
            <label>
              Acrescimo
              <input
                inputMode="decimal"
                onChange={(event) => updateNewOrder('surcharge', event.target.value)}
                placeholder="0,00"
                value={newOrder.surcharge}
              />
            </label>
          </FormBlock>

          <FormBlock className="full" title="Itens do pedido">
            {newOrder.items.map((item, index) => (
              <div key={`${item.productId}-${index}`} style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr 0.7fr auto', gap: '10px' }}>
                  <label>
                    Produto
                    <select
                      onChange={(event) => updateNewOrderItem(index, 'productId', event.target.value)}
                      value={item.productId}
                    >
                      <option value="">Selecione</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Tamanho
                    <input
                      onChange={(event) => updateNewOrderItem(index, 'size', event.target.value)}
                      placeholder="P"
                      value={item.size}
                    />
                  </label>
                  <label>
                    Qtde
                    <input
                      min="1"
                      onChange={(event) => updateNewOrderItem(index, 'quantity', event.target.value)}
                      type="number"
                      value={item.quantity}
                    />
                  </label>
                  <label>
                    Preco
                    <input
                      inputMode="decimal"
                      onChange={(event) => updateNewOrderItem(index, 'unitPrice', event.target.value)}
                      placeholder="0,00"
                      value={item.unitPrice}
                    />
                  </label>
                  <button
                    className="ghost-button"
                    onClick={(event) => {
                      event.preventDefault()
                      removeOrderItem(index)
                    }}
                    type="button"
                    style={{ alignSelf: 'end' }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
            <button className="ghost-button" onClick={(event) => { event.preventDefault(); addOrderItem() }} type="button">
              Adicionar item
            </button>
          </FormBlock>

          <FormBlock className="full" title="Notas do pedido">
            <label className="wide-field description-field">
              Notas
              <textarea
                onChange={(event) => updateNewOrder('notes', event.target.value)}
                rows={3}
                value={newOrder.notes}
              />
            </label>
          </FormBlock>

          <div className="form-actions full">
            <button className="button primary" disabled={isSaving} type="submit">
              <Plus size={18} />
              {isSaving ? 'Salvando...' : 'Cadastrar pedido'}
            </button>
            <button
              className="ghost-button"
              onClick={(event) => {
                event.preventDefault()
                setNewOrder(emptyOrderForm(products))
                setFormStatus({ tone: '', message: '' })
              }}
              type="button"
            >
              Limpar
            </button>
          </div>
          {formStatus.message && (
            <p className={`form-feedback ${formStatus.tone}`} role="status">
              {formStatus.message}
            </p>
          )}
        </form>
      </ModalOverlay>
    </>
  )
}

export default App
