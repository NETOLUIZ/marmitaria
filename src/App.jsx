import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import HomePage from './pages/HomePage'
import ClientOrderPage from './pages/ClientOrderPage'
import PedidosPage from './pages/PedidosPage'
import PainelPedidosPage from './pages/PainelPedidosPage'
import DashboardPage from './pages/DashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'

const ROUTES = {
  home: '/',
  pedidos: '/pedidos',
  painel: '/painel-pedidos',
  dashboard: '/dashboard',
  cliente: '/pedido'
}

const ADMIN_USERNAME = 'Fraanribeiro'
const ADMIN_PASSWORD = '18031969'
const WHATSAPP_NUMBER = (import.meta.env.VITE_ORDER_WHATSAPP_NUMBER || '').replace(/\D/g, '')

function formatClock(date) {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateInput(value) {
  if (!value) return new Date()
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function getDashboardRange(targetDate, period) {
  const baseDate = parseDateInput(targetDate)
  const end = new Date(baseDate)
  const start = new Date(baseDate)

  if (period === 'yesterday') {
    start.setDate(start.getDate() - 1)
    end.setDate(end.getDate() - 1)
  } else if (period === 'last7') {
    start.setDate(start.getDate() - 6)
  } else if (period === 'last30') {
    start.setDate(start.getDate() - 29)
  } else if (period === 'month') {
    start.setDate(1)
  }

  return {
    start: formatDateInput(start),
    end: formatDateInput(end)
  }
}

function normalizeRoute(pathname) {
  const path = (pathname || '/').toLowerCase()
  if (path === '/' || path === '') return ROUTES.home
  if (path === ROUTES.pedidos) return ROUTES.pedidos
  if (path === ROUTES.painel) return ROUTES.painel
  if (path === ROUTES.dashboard) return ROUTES.dashboard
  if (path === ROUTES.cliente) return ROUTES.cliente
  return ROUTES.home
}

function getAdminSectionMeta(route) {
  if (route === ROUTES.pedidos) {
    return {
      title: 'Pedidos corporativos',
      description: 'Cadastre empresas, ajuste o cardapio e mantenha a operacao comercial organizada.'
    }
  }
  if (route === ROUTES.painel) {
    return {
      title: 'Painel operacional',
      description: 'Acompanhe o fluxo dos pedidos do dia, status e impressao local.'
    }
  }
  return {
    title: 'Dashboard executivo',
    description: 'Visao consolidada de vendas, desempenho e financeiro da marmitaria.'
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => normalizeRoute(window.location.pathname))
  const isHomePage = currentRoute === ROUTES.home
  const isClientPage = currentRoute === ROUTES.cliente
  const isPedidosPage = currentRoute === ROUTES.pedidos
  const isPainelPage = currentRoute === ROUTES.painel
  const isDashboardPage = currentRoute === ROUTES.dashboard

  const [clock, setClock] = useState(() => formatClock(new Date()))
  const [qty, setQty] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    imageUrl: ''
  })
  const [menuFormMessage, setMenuFormMessage] = useState('')
  const [homePromo, setHomePromo] = useState({
    promo_kicker: 'Promocao do dia',
    promo_title: 'Compre 2 marmitas e ganhe refrigerante',
    promo_description: 'Combos pensados para equipe, familia ou quem quer economizar sem abrir mao de comer bem.',
    promo_card_title: 'Combo Almoco Completo',
    promo_card_description: '2 marmitas tradicionais + 1 refrigerante lata',
    promo_card_price: 'R$ 36,90'
  })
  const [homePromoMessage, setHomePromoMessage] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [itemQuantities, setItemQuantities] = useState({})
  const [itemNotes, setItemNotes] = useState({})
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [orders, setOrders] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [printTickets, setPrintTickets] = useState([])
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [cancelQtyInputs, setCancelQtyInputs] = useState({})
  const [clientCompanyName, setClientCompanyName] = useState('')
  const [clientQty, setClientQty] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [clientSelectedItems, setClientSelectedItems] = useState([])
  const [clientItemQuantities, setClientItemQuantities] = useState({})
  const [clientItemNotes, setClientItemNotes] = useState({})
  const [clientSaving, setClientSaving] = useState(false)
  const [clientMessage, setClientMessage] = useState('')
  const [clientWhatsAppLink, setClientWhatsAppLink] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientPaymentMethod, setClientPaymentMethod] = useState('pix')
  const [clientCashChangeFor, setClientCashChangeFor] = useState('')
  const [clientConfirmationLink, setClientConfirmationLink] = useState('')
  const [dashboardDate, setDashboardDate] = useState(() => formatDateInput(new Date()))
  const [dashboardPeriod, setDashboardPeriod] = useState('day')
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const [adminUsernameInput, setAdminUsernameInput] = useState('')
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [dashboardStats, setDashboardStats] = useState({
    totalQty: 0,
    totalOrders: 0,
    cancelledQty: 0,
    byCompany: [],
    revenueTotal: 0,
    ticketAverage: 0,
    inProgress: 0,
    completed: 0,
    cancelledOrders: 0,
    totalClients: 0,
    categoryBreakdown: [],
    paymentBreakdown: [],
    statusBreakdown: [],
    recentOrders: [],
    topProducts: [],
    peakHours: [],
    finance: {
      grossRevenue: 0,
      discounts: 0,
      deliveryFees: 0,
      estimatedProfit: 0,
      operationalCosts: 0,
      netResult: 0
    },
    performance: {
      completionRate: 0,
      avgDeliveryMinutes: 0,
      cancelRate: 0,
      recurringClients: 0,
      customerRating: 4.8
    },
    candles: []
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(formatClock(new Date()))
    }, 1000 * 30)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadCompanies() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, phone')
          .order('name', { ascending: true })
        if (error) throw error
        setCompanies(Array.isArray(data) ? data : [])
      } catch {
        setCompanies([])
      }
    }

    async function loadMenu() {
      try {
        const primary = await supabase
          .from('menu_items')
          .select('id, name, category, price, description, image_url')
          .order('id', { ascending: false })

        if (primary.error) {
          const fallback = await supabase
            .from('menu_items')
            .select('id, name')
            .order('id', { ascending: false })
          if (fallback.error) throw fallback.error
          setMenuItems(
            (Array.isArray(fallback.data) ? fallback.data : []).map((item) => ({
              ...item,
              category: '',
              price: null,
              description: '',
              image_url: ''
            }))
          )
          return
        }

        setMenuItems(Array.isArray(primary.data) ? primary.data : [])
      } catch {
        setMenuItems([])
      }
    }

    async function loadHomeSettings() {
      try {
        const { data, error } = await supabase.from('home_settings').select('*').eq('id', 1).single()
        if (error) throw error
        if (data) {
          setHomePromo({
            promo_kicker: data.promo_kicker || '',
            promo_title: data.promo_title || '',
            promo_description: data.promo_description || '',
            promo_card_title: data.promo_card_title || '',
            promo_card_description: data.promo_card_description || '',
            promo_card_price: data.promo_card_price || ''
          })
        }
      } catch {
        // Keep demo promo copy
      }
    }

    loadCompanies()
    loadMenu()
    loadHomeSettings()
  }, [])

  async function loadOrders() {
    try {
      let data = null
      let error = null

      const primary = await supabase
        .from('orders')
        .select('id, qty, canceled_qty, address, notes, status, created_at, company:companies(name), order_items(name)')
        .order('id', { ascending: false })
        .limit(200)
      data = primary.data
      error = primary.error

      if (error) {
        const fallback = await supabase
          .from('orders')
          .select('id, qty, address, notes, status, created_at, company:companies(name), order_items(name)')
          .order('id', { ascending: false })
          .limit(200)
        data = fallback.data
        error = fallback.error
      }
      if (error) throw error

      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)

      const filtered = (Array.isArray(data) ? data : []).filter((order) => {
        const created = new Date(order.created_at)
        return created >= start && created <= end
      })

      setOrders(
        filtered.map((order) => ({
          id: order.id,
          company_name: order.company?.name ?? '---',
          qty: order.qty,
          canceled_qty: Number(order.canceled_qty || 0),
          address: order.address || '',
          notes: order.notes || '',
          status: order.status || 'Ativo',
          created_at: order.created_at,
          items: Array.isArray(order.order_items) ? order.order_items.map((item) => item.name) : []
        }))
      )
    } catch {
      setOrders([])
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    if (isDashboardPage) {
      loadDashboard(dashboardDate, dashboardPeriod)
    }
  }, [isDashboardPage, dashboardDate, dashboardPeriod])

  useEffect(() => {
    const normalized = normalizeRoute(window.location.pathname)
    if (normalized !== window.location.pathname.toLowerCase()) {
      window.history.replaceState({}, '', normalized)
    }

    function handlePopState() {
      setCurrentRoute(normalizeRoute(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigateTo(path) {
    const normalized = normalizeRoute(path)
    if (normalized === currentRoute) {
      setSidebarOpen(false)
      return
    }

    window.history.pushState({}, '', normalized)
    setCurrentRoute(normalized)
    setSidebarOpen(false)
  }

  function handleAdminLogin(event) {
    event.preventDefault()
    if (adminUsernameInput === ADMIN_USERNAME && adminPasswordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      setAdminAuthenticated(true)
      setAdminLoginError('')
      setAdminPasswordInput('')
      return
    }

    setAdminLoginError('Login ou senha inválidos.')
  }

  function handleAdminLogout() {
    sessionStorage.removeItem('admin_auth')
    setAdminAuthenticated(false)
    setAdminUsernameInput('')
    setAdminPasswordInput('')
    setAdminLoginError('')
    navigateTo(ROUTES.home)
  }

  const qtyValue = useMemo(() => {
    const parsed = parseInt(qty || '0', 10)
    if (Number.isNaN(parsed) || parsed < 0) return 0
    return parsed
  }, [qty])

  const splitItems = useMemo(() => {
    return selectedItems
      .map((name) => {
        const parsed = parseInt(itemQuantities[name] || '0', 10)
        return { name, qty: Number.isNaN(parsed) ? 0 : parsed, note: (itemNotes[name] || '').trim() }
      })
      .filter((item) => item.qty > 0)
  }, [itemNotes, itemQuantities, selectedItems])

  const splitTotal = useMemo(() => {
    return splitItems.reduce((sum, item) => sum + item.qty, 0)
  }, [splitItems])

  const clientQtyValue = useMemo(() => {
    const parsed = parseInt(clientQty || '0', 10)
    if (Number.isNaN(parsed) || parsed < 0) return 0
    return parsed
  }, [clientQty])

  const clientSplitItems = useMemo(() => {
    return clientSelectedItems
      .map((name) => {
        const parsed = parseInt(clientItemQuantities[name] || '0', 10)
        return { name, qty: Number.isNaN(parsed) ? 0 : parsed, note: (clientItemNotes[name] || '').trim() }
      })
      .filter((item) => item.qty > 0)
  }, [clientItemNotes, clientItemQuantities, clientSelectedItems])

  const clientSplitTotal = useMemo(() => {
    return clientSplitItems.reduce((sum, item) => sum + item.qty, 0)
  }, [clientSplitItems])

  const clientCartTotal = useMemo(() => {
    return clientSplitItems.reduce((sum, item) => {
      const menuItem = menuItems.find((entry) => entry.name === item.name)
      const unitPrice = Number(menuItem?.price || 0)
      return sum + unitPrice * item.qty
    }, 0)
  }, [clientSplitItems, menuItems])

  function toggleMenuItem(name, checked) {
    setSelectedItems((current) => {
      if (checked) {
        if (current.includes(name)) return current
        return [...current, name]
      }
      return current.filter((item) => item !== name)
    })

    setItemQuantities((current) => {
      if (checked) {
        if (current[name] !== undefined) return current
        return { ...current, [name]: '' }
      }
      const next = { ...current }
      delete next[name]
      return next
    })

    setItemNotes((current) => {
      if (checked) {
        if (current[name] !== undefined) return current
        return { ...current, [name]: '' }
      }
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  function updateItemQuantity(name, value) {
    const digits = value.replace(/\D/g, '')
    setItemQuantities((current) => ({ ...current, [name]: digits }))
  }

  function updateItemNote(name, value) {
    setItemNotes((current) => ({ ...current, [name]: value }))
  }

  function toggleClientMenuItem(name, checked) {
    setClientSelectedItems((current) => {
      if (checked) {
        if (current.includes(name)) return current
        return [...current, name]
      }
      return current.filter((item) => item !== name)
    })

    setClientItemQuantities((current) => {
      if (checked) {
        if (current[name] !== undefined) return current
        return { ...current, [name]: '' }
      }
      const next = { ...current }
      delete next[name]
      return next
    })

    setClientItemNotes((current) => {
      if (checked) {
        if (current[name] !== undefined) return current
        return { ...current, [name]: '' }
      }
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  function updateClientItemQuantity(name, value) {
    const digits = value.replace(/\D/g, '')
    setClientItemQuantities((current) => ({ ...current, [name]: digits }))
  }

  function updateClientItemNote(name, value) {
    setClientItemNotes((current) => ({ ...current, [name]: value }))
  }

  function setClientItemSelectedQuantity(name, quantity) {
    const safeQty = Math.max(Number.parseInt(quantity, 10) || 0, 0)

    if (safeQty <= 0) {
      setClientSelectedItems((current) => current.filter((item) => item !== name))
      setClientItemQuantities((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
      setClientItemNotes((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
      return
    }

    setClientSelectedItems((current) => (current.includes(name) ? current : [...current, name]))
    setClientItemQuantities((current) => ({ ...current, [name]: String(safeQty) }))
    setClientItemNotes((current) => {
      if (current[name] !== undefined) return current
      return { ...current, [name]: '' }
    })
  }

  function adjustClientItemQuantity(name, delta) {
    const currentQty = Number.parseInt(clientItemQuantities[name] || '0', 10) || 0
    setClientItemSelectedQuantity(name, currentQty + delta)
  }

  function formatItemLabel({ name, note }) {
    const noteValue = (note || '').trim()
    if (!noteValue) return name
    return `${name} - ${noteValue}`
  }

  function buildOrderItemsPayload(orderId, items) {
    const payload = []
    items.forEach((item) => {
      const itemLabel = formatItemLabel(item)
      for (let index = 0; index < item.qty; index += 1) {
        payload.push({ order_id: orderId, name: itemLabel })
      }
    })
    return payload
  }

  function buildWhatsAppLink(message, phone = WHATSAPP_NUMBER) {
    const normalizedPhone = (phone || '').replace(/\D/g, '')
    if (!normalizedPhone) return ''
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
  }

  function sendToWhatsApp(message, phone = WHATSAPP_NUMBER) {
    const link = buildWhatsAppLink(message, phone)
    if (!link) return { sent: false, link: '' }
    const popup = window.open(link, '_blank', 'noopener,noreferrer')
    return { sent: Boolean(popup), link }
  }

  function buildOrderMessage({
    orderId,
    companyName,
    customerName,
    customerPhone,
    qty,
    items,
    addressValue,
    notesValue,
    paymentMethod,
    source
  }) {
    const lines = ['NOVO PEDIDO', '------------------------------']
    if (orderId) lines.push(`Pedido: #${orderId}`)
    lines.push(`Empresa: ${companyName}`)
    if (customerName) lines.push(`Cliente: ${customerName}`)
    if (customerPhone) lines.push(`WhatsApp: ${customerPhone}`)
    lines.push(`Quantidade: ${qty}`)
    if (paymentMethod) lines.push(`Pagamento: ${paymentMethod}`)
    lines.push(`Origem: ${source}`)
    lines.push('', 'Itens:')
    items.forEach((item) => {
      lines.push(`- ${item.qty}x ${formatItemLabel(item)}`)
    })
    lines.push('', `Endereco: ${addressValue || '-'}`, `Observacoes: ${notesValue || '-'}`, '------------------------------')
    return lines.join('\n')
  }

  function buildCustomerConfirmationMessage({ orderId, customerName, items, paymentMethod }) {
    const lines = ['Pedido efetuado com sucesso.', '------------------------------']
    if (customerName) lines.push(`Cliente: ${customerName}`)
    if (orderId) lines.push(`Pedido: #${orderId}`)
    lines.push('Itens:')
    items.forEach((item) => {
      lines.push(`- ${item.qty}x ${formatItemLabel(item)}`)
    })
    if (paymentMethod) lines.push(`Pagamento: ${paymentMethod}`)
    lines.push('Obrigado por pedir com a gente.')
    return lines.join('\n')
  }

  function isMissingCanceledQtyColumn(error) {
    const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase()
    return text.includes('canceled_qty') || text.includes('cancelled_qty')
  }

  async function createOrderRecord(payload) {
    const withCanceledQty = { ...payload, canceled_qty: 0 }
    let response = await supabase.from('orders').insert(withCanceledQty).select('id').single()
    if (!response.error) return response
    if (isMissingCanceledQtyColumn(response.error)) {
      response = await supabase.from('orders').insert(payload).select('id').single()
    }
    return response
  }

  async function updateOrderWithCancelFallback(orderId, payloadWithCanceledQty, payloadFallback) {
    let response = await supabase.from('orders').update(payloadWithCanceledQty).eq('id', orderId)
    if (!response.error) return response
    if (isMissingCanceledQtyColumn(response.error)) {
      response = await supabase.from('orders').update(payloadFallback).eq('id', orderId)
    }
    return response
  }

  async function loadDashboard(targetDate, period = 'day') {
    setDashboardLoading(true)
    try {
      let data = null
      let error = null

      const primary = await supabase
        .from('orders')
        .select('id, qty, canceled_qty, status, created_at, company:companies(name)')
        .order('id', { ascending: false })
        .limit(2000)
      data = primary.data
      error = primary.error

      if (error) {
        const fallback = await supabase
          .from('orders')
          .select('id, qty, status, created_at, company:companies(name)')
          .order('id', { ascending: false })
          .limit(2000)
        data = fallback.data
        error = fallback.error
      }

      if (error) throw error

      const range = getDashboardRange(targetDate, period)
      const dayOrders = (Array.isArray(data) ? data : []).filter((order) => {
        const orderDate = formatDateInput(new Date(order.created_at))
        return orderDate >= range.start && orderDate <= range.end
      })

      const activeOrders = dayOrders.filter((order) => (order.status || 'Ativo') !== 'Cancelado')
      const companyMap = {}
      const categoryMap = {}
      const paymentMap = { Pix: 0, Dinheiro: 0, 'Cartao de Credito': 0, 'Cartao de Debito': 0 }
      const statusMap = { 'Em preparo': 0, 'Saiu para entrega': 0, Entregue: 0, Cancelado: 0 }
      const productMap = {}
      const hourMap = {}
      const recentOrders = []
      const candleBuckets = {}
      const uniqueClients = new Set()
      let revenueTotal = 0

      function getUnitPrice(itemName) {
        const match = menuItems.find((item) => {
          const normalizedMenuItem = (item.name || '').trim().toLowerCase()
          const normalizedName = (itemName || '').trim().toLowerCase()
          return normalizedName.startsWith(normalizedMenuItem)
        })
        return Number(match?.price || 20)
      }

      function getCategory(itemName) {
        const match = menuItems.find((item) => {
          const normalizedMenuItem = (item.name || '').trim().toLowerCase()
          const normalizedName = (itemName || '').trim().toLowerCase()
          return normalizedName.startsWith(normalizedMenuItem)
        })
        return match?.category || 'Tradicionais'
      }

      function detectPayment(order) {
        const notesText = `${order.notes || ''}`.toLowerCase()
        if (notesText.includes('credito')) return 'Cartao de Credito'
        if (notesText.includes('debito')) return 'Cartao de Debito'
        if (notesText.includes('dinheiro')) return 'Dinheiro'
        if (notesText.includes('pix')) return 'Pix'
        return 'Pix'
      }

      function detectStatus(order) {
        if ((order.status || 'Ativo') === 'Cancelado') return 'Cancelado'
        const minutesAgo = Math.max(0, Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000))
        if (minutesAgo < 20) return 'Em preparo'
        if (minutesAgo < 50) return 'Saiu para entrega'
        return 'Entregue'
      }

      activeOrders.forEach((order) => {
        const name = order.company?.name || '---'
        if (!companyMap[name]) companyMap[name] = { name, qty: 0, orders: 0 }
        companyMap[name].qty += Number(order.qty || 0)
        companyMap[name].orders += 1
      })

      dayOrders.forEach((order) => {
        const statusLabel = detectStatus(order)
        statusMap[statusLabel] += 1

        const paymentLabel = detectPayment(order)
        paymentMap[paymentLabel] += 1

        const createdDate = new Date(order.created_at)
        const hourLabel = `${String(createdDate.getHours()).padStart(2, '0')}h`
        hourMap[hourLabel] = (hourMap[hourLabel] || 0) + 1

        const bucketKey = `${String(createdDate.getHours()).padStart(2, '0')}:00`
        if (!candleBuckets[bucketKey]) {
          candleBuckets[bucketKey] = { label: bucketKey, open: 0, high: 0, low: Number.POSITIVE_INFINITY, close: 0 }
        }

        const items = Array.isArray(order.order_items) ? order.order_items : []
        let orderRevenue = 0
        items.forEach((item) => {
          const itemName = item.name || ''
          const price = getUnitPrice(itemName)
          const category = getCategory(itemName)
          orderRevenue += price
          categoryMap[category] = (categoryMap[category] || 0) + 1
          if (!productMap[itemName]) productMap[itemName] = { name: itemName, qty: 0, revenue: 0 }
          productMap[itemName].qty += 1
          productMap[itemName].revenue += price
        })

        if (orderRevenue === 0) {
          orderRevenue = Number(order.qty || 0) * 20
        }

        revenueTotal += orderRevenue
        const bucket = candleBuckets[bucketKey]
        if (bucket.open === 0) bucket.open = orderRevenue
        bucket.high = Math.max(bucket.high, orderRevenue)
        bucket.low = Math.min(bucket.low, orderRevenue)
        bucket.close = orderRevenue

        uniqueClients.add(order.company?.name || `cliente-${order.id}`)
        recentOrders.push({
          id: order.id,
          client: order.company?.name || 'Cliente',
          items: items.map((item) => item.name).join(', ') || 'Sem itens',
          total: orderRevenue,
          payment: paymentLabel,
          status: statusLabel,
          time: createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        })
      })

      setDashboardStats({
        totalQty: activeOrders.reduce((sum, order) => sum + Number(order.qty || 0), 0),
        totalOrders: activeOrders.length,
        cancelledQty: dayOrders.reduce((sum, order) => sum + Number(order.canceled_qty || 0), 0),
        byCompany: Object.values(companyMap).sort((a, b) => b.qty - a.qty),
        revenueTotal,
        ticketAverage: activeOrders.length ? revenueTotal / activeOrders.length : 0,
        inProgress: statusMap['Em preparo'] + statusMap['Saiu para entrega'],
        completed: statusMap.Entregue,
        cancelledOrders: statusMap.Cancelado,
        totalClients: uniqueClients.size,
        categoryBreakdown: Object.entries(categoryMap).map(([label, value]) => ({ label, value })),
        paymentBreakdown: Object.entries(paymentMap).map(([label, value]) => ({ label, value })),
        statusBreakdown: Object.entries(statusMap).map(([label, value]) => ({ label, value })),
        recentOrders: recentOrders.sort((a, b) => b.id - a.id).slice(0, 6),
        topProducts: Object.values(productMap)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 4)
          .map((item, index) => ({
            ...item,
            growth: [12, 8, 5, -2][index] ?? 0
          })),
        peakHours: Object.entries(hourMap)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => a.label.localeCompare(b.label)),
        finance: {
          grossRevenue: revenueTotal,
          discounts: revenueTotal * 0.04,
          deliveryFees: activeOrders.length * 4,
          estimatedProfit: revenueTotal * 0.31,
          operationalCosts: revenueTotal * 0.22,
          netResult: revenueTotal * 0.31 - revenueTotal * 0.22
        },
        performance: {
          completionRate: dayOrders.length ? (statusMap.Entregue / dayOrders.length) * 100 : 0,
          avgDeliveryMinutes: activeOrders.length ? 34 : 0,
          cancelRate: dayOrders.length ? (statusMap.Cancelado / dayOrders.length) * 100 : 0,
          recurringClients: uniqueClients.size ? Math.max(1, Math.round(uniqueClients.size * 0.42)) : 0,
          customerRating: 4.8
        },
        candles: Object.values(candleBuckets)
          .map((item) => ({
            ...item,
            low: Number.isFinite(item.low) ? item.low : 0
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      })
    } catch {
      setDashboardStats({
        totalQty: 0,
        totalOrders: 0,
        cancelledQty: 0,
        byCompany: [],
        revenueTotal: 0,
        ticketAverage: 0,
        inProgress: 0,
        completed: 0,
        cancelledOrders: 0,
        totalClients: 0,
        categoryBreakdown: [],
        paymentBreakdown: [],
        statusBreakdown: [],
        recentOrders: [],
        topProducts: [],
        peakHours: [],
        finance: {
          grossRevenue: 0,
          discounts: 0,
          deliveryFees: 0,
          estimatedProfit: 0,
          operationalCosts: 0,
          netResult: 0
        },
        performance: {
          completionRate: 0,
          avgDeliveryMinutes: 0,
          cancelRate: 0,
          recurringClients: 0,
          customerRating: 4.8
        },
        candles: []
      })
    } finally {
      setDashboardLoading(false)
    }
  }

  async function addMenuItem() {
    const name = menuForm.name.trim()
    if (!name) return

    const category = menuForm.category.trim()
    const description = menuForm.description.trim()
    const imageUrl = menuForm.imageUrl.trim()
    const priceRaw = menuForm.price.trim().replace(',', '.')
    const parsedPrice = Number(priceRaw)
    const hasPrice = priceRaw !== ''

    if (hasPrice && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      setMenuFormMessage('Informe um preco valido para o item do cardapio.')
      return
    }

    const payload = {
      name,
      category: category || null,
      price: hasPrice ? parsedPrice : null,
      description: description || null,
      image_url: imageUrl || null
    }

    try {
      const primary = await supabase
        .from('menu_items')
        .insert(payload)
        .select('id, name, category, price, description, image_url')
        .single()

      if (primary.error) {
        const fallback = await supabase.from('menu_items').insert({ name }).select('id, name').single()
        if (fallback.error) throw fallback.error
        setMenuItems((current) => [
          {
            ...fallback.data,
            category: '',
            price: null,
            description: '',
            image_url: ''
          },
          ...current
        ])
        setMenuFormMessage('Item salvo so com nome. Atualize a tabela menu_items para salvar categoria, preco, descricao e foto.')
      } else {
        setMenuItems((current) => [primary.data, ...current])
        setMenuFormMessage('Item do cardapio cadastrado com sucesso.')
      }

      setMenuForm({
        name: '',
        category: '',
        price: '',
        description: '',
        imageUrl: ''
      })
    } catch {
      setMenuFormMessage('Nao foi possivel cadastrar o item do cardapio.')
    }
  }

  async function saveHomePromo(event) {
    event.preventDefault()

    try {
      const { error } = await supabase
        .from('home_settings')
        .update({
          promo_kicker: homePromo.promo_kicker.trim(),
          promo_title: homePromo.promo_title.trim(),
          promo_description: homePromo.promo_description.trim(),
          promo_card_title: homePromo.promo_card_title.trim(),
          promo_card_description: homePromo.promo_card_description.trim(),
          promo_card_price: homePromo.promo_card_price.trim()
        })
        .eq('id', 1)

      if (error) throw error
      setHomePromoMessage('Bloco de promocao da home atualizado com sucesso.')
    } catch {
      setHomePromoMessage('Nao foi possivel salvar a promocao da home.')
    }
  }

  async function deleteMenuItem(id, name) {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id)
      if (error) throw error
    } finally {
      setMenuItems((current) => current.filter((item) => item.id !== id))
      if (name) {
        setSelectedItems((current) => current.filter((item) => item !== name))
        setItemQuantities((current) => {
          const next = { ...current }
          delete next[name]
          return next
        })
        setItemNotes((current) => {
          const next = { ...current }
          delete next[name]
          return next
        })
      }
    }
  }

  async function addCompany(event) {
    event.preventDefault()
    const form = event.currentTarget
    const name = form.newCompany.value.trim()
    if (!name) return
    const phone = form.newPhone.value.trim()

    try {
      const { error } = await supabase.from('companies').insert({ name, phone })
      if (error) throw error
    } finally {
      form.reset()
      try {
        const { data, error } = await supabase.from('companies').select('id, name, phone').order('name', { ascending: true })
        if (!error) setCompanies(Array.isArray(data) ? data : [])
      } catch {
        setCompanies((current) => current)
      }
    }
  }

  async function saveOrder() {
    if (!selectedCompany || qtyValue <= 0) {
      alert('Selecione a empresa e informe a quantidade.')
      return
    }
    if (splitItems.length === 0) {
      alert('Selecione os itens e informe a quantidade de cada um.')
      return
    }
    if (splitTotal !== qtyValue) {
      alert(`A soma dos itens (${splitTotal}) precisa ser igual ao total de marmitas (${qtyValue}).`)
      return
    }

    const { data: created, error } = await createOrderRecord({
      company_id: selectedCompany.id,
      qty: parseInt(qty, 10),
      address,
      notes
    })

    if (error) {
      alert('Erro ao salvar pedido.')
      return
    }

    if (splitItems.length > 0) {
      await supabase.from('order_items').insert(buildOrderItemsPayload(created.id, splitItems))
    }

    sendToWhatsApp(
      buildOrderMessage({
        orderId: created.id,
        companyName: selectedCompany.name,
        qty: qtyValue,
        items: splitItems,
        addressValue: address,
        notesValue: notes,
        source: 'Painel Admin'
      })
    )

    alert('Pedido salvo no banco.')
    loadOrders()
  }

  async function saveCompanyOrder(event) {
    event.preventDefault()
    const typedCompanyName = (clientCompanyName || '').trim()
    if (!typedCompanyName || clientQtyValue <= 0) {
      setClientMessage('Selecione a empresa e informe a quantidade.')
      return
    }
    if (clientSplitItems.length === 0) {
      setClientMessage('Selecione os itens e informe a quantidade de cada um.')
      return
    }
    if (clientSplitTotal !== clientQtyValue) {
      setClientMessage(`A soma dos itens (${clientSplitTotal}) precisa ser igual ao total (${clientQtyValue}).`)
      return
    }

    setClientSaving(true)
    setClientMessage('')
    setClientWhatsAppLink('')
    try {
      let company = companies.find((item) => item.name.trim().toLowerCase() === typedCompanyName.toLowerCase())

      if (!company) {
        const { data: createdCompany, error: companyError } = await supabase
          .from('companies')
          .insert({ name: typedCompanyName })
          .select('id, name, phone')
          .single()
        if (companyError) throw companyError
        company = createdCompany
        setCompanies((current) => [...current, createdCompany].sort((a, b) => a.name.localeCompare(b.name)))
      }

      const { data: created, error } = await createOrderRecord({
        company_id: company.id,
        qty: clientQtyValue,
        address: clientAddress,
        notes: clientNotes
      })
      if (error) throw error

      const payload = buildOrderItemsPayload(created.id, clientSplitItems)
      if (payload.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(payload)
        if (itemsError) throw itemsError
      }

      const whatsapp = sendToWhatsApp(
        buildOrderMessage({
          orderId: created.id,
          companyName: company.name,
          qty: clientQtyValue,
          items: clientSplitItems,
          addressValue: clientAddress,
          notesValue: clientNotes,
          source: 'Pedido Empresa'
        })
      )

      setClientCompanyName('')
      setClientQty('')
      setClientAddress('')
      setClientNotes('')
      setClientSelectedItems([])
      setClientItemQuantities({})
      setClientItemNotes({})
      if (!WHATSAPP_NUMBER) {
        setClientMessage('Pedido enviado para o painel. Configure VITE_ORDER_WHATSAPP_NUMBER para envio no WhatsApp.')
      } else if (whatsapp.sent) {
        setClientMessage('Pedido enviado para o painel e WhatsApp.')
      } else {
        setClientMessage('Pedido enviado para o painel. Clique no link para abrir o WhatsApp.')
      }
      setClientWhatsAppLink(whatsapp.link)
    } catch {
      setClientMessage('Nao foi possivel enviar o pedido. Tente novamente.')
    } finally {
      setClientSaving(false)
    }
  }

  async function saveClientOrder(event) {
    event.preventDefault()
    const typedClientName = (clientName || '').trim()
    const typedClientPhone = (clientPhone || '').trim()
    if (!typedClientName) {
      setClientMessage('Informe seu nome para continuar.')
      return
    }
    if (clientSplitItems.length === 0) {
      setClientMessage('Adicione pelo menos um item ao carrinho.')
      return
    }
    if (!clientAddress.trim()) {
      setClientMessage('Informe o endereco de entrega.')
      return
    }
    if (!typedClientPhone) {
      setClientMessage('Informe o WhatsApp para a confirmacao do pedido.')
      return
    }

    setClientSaving(true)
    setClientMessage('')
    setClientWhatsAppLink('')
    setClientConfirmationLink('')
    try {
      const onlineCompanyName = 'Pedido Site'
      let company = companies.find((item) => item.name.trim().toLowerCase() === onlineCompanyName.toLowerCase())

      if (!company) {
        const { data: createdCompany, error: companyError } = await supabase
          .from('companies')
          .insert({ name: onlineCompanyName, phone: typedClientPhone })
          .select('id, name, phone')
          .single()
        if (companyError) throw companyError
        company = createdCompany
        setCompanies((current) => [...current, createdCompany].sort((a, b) => a.name.localeCompare(b.name)))
      }

      const orderNotes = [
        clientNotes.trim(),
        `Cliente: ${typedClientName}`,
        `WhatsApp: ${typedClientPhone}`,
        `Pagamento: ${clientPaymentMethod}`,
        clientPaymentMethod === 'dinheiro' && clientCashChangeFor.trim()
          ? `Troco para: ${clientCashChangeFor.trim()}`
          : ''
      ]
        .filter(Boolean)
        .join(' | ')

      const { data: created, error } = await createOrderRecord({
        company_id: company.id,
        qty: clientSplitTotal,
        address: clientAddress,
        notes: orderNotes
      })
      if (error) throw error

      const payload = buildOrderItemsPayload(created.id, clientSplitItems)
      if (payload.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(payload)
        if (itemsError) throw itemsError
      }

      const whatsapp = sendToWhatsApp(
        buildOrderMessage({
          orderId: created.id,
          companyName: company.name,
          customerName: typedClientName,
          customerPhone: typedClientPhone,
          qty: clientSplitTotal,
          items: clientSplitItems,
          addressValue: clientAddress,
          notesValue: clientNotes,
          paymentMethod:
            clientPaymentMethod === 'dinheiro' && clientCashChangeFor.trim()
              ? `${clientPaymentMethod} (troco para ${clientCashChangeFor.trim()})`
              : clientPaymentMethod,
          source: 'Pagina de Pedido'
        })
      )

      const confirmation = sendToWhatsApp(
        buildCustomerConfirmationMessage({
          orderId: created.id,
          customerName: typedClientName,
          items: clientSplitItems,
          paymentMethod:
            clientPaymentMethod === 'dinheiro' && clientCashChangeFor.trim()
              ? `${clientPaymentMethod} (troco para ${clientCashChangeFor.trim()})`
              : clientPaymentMethod
        }),
        typedClientPhone
      )

      const tickets = makeTickets({
        company: typedClientName,
        items: clientSplitItems.map((item) => formatItemLabel(item)),
        qty: clientSplitTotal,
        address: clientAddress,
        paymentMethod:
          clientPaymentMethod === 'dinheiro' && clientCashChangeFor.trim()
            ? `${clientPaymentMethod} (troco para ${clientCashChangeFor.trim()})`
            : clientPaymentMethod,
        orderId: created.id,
        phone: typedClientPhone
      })
      setPrintTickets(tickets)
      setTimeout(() => window.print(), 50)

      setClientName('')
      setClientPhone('')
      setClientQty('')
      setClientAddress('')
      setClientNotes('')
      setClientPaymentMethod('pix')
      setClientCashChangeFor('')
      setClientSelectedItems([])
      setClientItemQuantities({})
      setClientItemNotes({})
      if (!WHATSAPP_NUMBER) {
        setClientMessage('Pedido enviado para o painel. Configure VITE_ORDER_WHATSAPP_NUMBER para envio no WhatsApp.')
      } else if (whatsapp.sent) {
        setClientMessage('Pedido confirmado. WhatsApp da loja aberto e impressao enviada.')
      } else {
        setClientMessage('Pedido salvo. Use os links para abrir a confirmacao no WhatsApp.')
      }
      setClientWhatsAppLink(whatsapp.link)
      setClientConfirmationLink(confirmation.link)
      loadOrders()
    } catch {
      setClientMessage('Nao foi possivel enviar o pedido. Tente novamente.')
    } finally {
      setClientSaving(false)
    }
  }

  function makeTickets({ company, items, qty, address: ticketAddress = '', paymentMethod = '', orderId = '', phone = '' }) {
    const source = Array.isArray(items) ? items : []
    const safeQty = Number.isInteger(qty) && qty > 0 ? qty : source.length
    const list = source.slice(0, safeQty)
    const finalList = list.length ? list : ['Sem itens']
    return finalList.map((item) => ({
      company,
      item,
      address: ticketAddress,
      paymentMethod,
      orderId,
      phone
    }))
  }

  async function removeOrderItems(orderId, countToRemove) {
    if (!countToRemove || countToRemove <= 0) return

    const { data, error } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', orderId)
      .order('id', { ascending: false })
      .limit(countToRemove)

    if (error) throw error
    const ids = (data || []).map((item) => item.id)
    if (ids.length === 0) return

    const { error: deleteError } = await supabase.from('order_items').delete().in('id', ids)
    if (deleteError) throw deleteError
  }

  function buildTickets() {
    if (!selectedCompany || qtyValue <= 0) {
      alert('Selecione a empresa e informe a quantidade.')
      return
    }
    if (splitItems.length === 0) {
      alert('Selecione os itens e informe a quantidade de cada um.')
      return
    }
    if (splitTotal !== qtyValue) {
      alert(`A soma dos itens (${splitTotal}) precisa ser igual ao total de marmitas (${qtyValue}).`)
      return
    }

    const tickets = []
    splitItems.forEach((entry) => {
      const itemLabel = formatItemLabel(entry)
      for (let index = 0; index < entry.qty; index += 1) {
        tickets.push({ company: selectedCompany.name, item: itemLabel })
      }
    })

    setPrintTickets(tickets)
    setTimeout(() => window.print(), 50)
  }

  function reprintOrder(order) {
    setPrintTickets(makeTickets({ company: order.company_name, items: order.items, qty: Number(order.qty || 0) }))
    setTimeout(() => window.print(), 50)
  }

  async function cancelOrder(order) {
    const currentQty = Number(order?.qty || 0)
    const previousCanceled = Number(order?.canceled_qty || 0)
    const { error } = await updateOrderWithCancelFallback(
      order.id,
      { status: 'Cancelado', qty: 0, canceled_qty: previousCanceled + currentQty },
      { status: 'Cancelado', qty: 0 }
    )
    if (error) {
      alert('Nao foi possivel cancelar o pedido.')
      return
    }
    await supabase.from('order_items').delete().eq('order_id', order.id)
    loadOrders()
  }

  function updateCancelQtyInput(orderId, value) {
    const digits = value.replace(/\D/g, '')
    setCancelQtyInputs((current) => ({ ...current, [orderId]: digits }))
  }

  async function cancelOrderPartial(order) {
    if ((order.status || 'Ativo') === 'Cancelado') return

    const currentQty = Number(order.qty || 0)
    const cancelQty = parseInt(cancelQtyInputs[order.id] || '0', 10)
    if (Number.isNaN(cancelQty) || cancelQty <= 0) {
      alert('Informe a quantidade para cancelar.')
      return
    }
    if (cancelQty > currentQty) {
      alert(`Nao pode cancelar mais que a quantidade atual (${currentQty}).`)
      return
    }

    const remainingQty = currentQty - cancelQty
    const nextStatus = remainingQty === 0 ? 'Cancelado' : 'Ativo'
    const previousCanceled = Number(order.canceled_qty || 0)

    await removeOrderItems(order.id, cancelQty)
    const { error } = await updateOrderWithCancelFallback(
      order.id,
      { qty: remainingQty, status: nextStatus, canceled_qty: previousCanceled + cancelQty },
      { qty: remainingQty, status: nextStatus }
    )
    if (error) {
      alert('Nao foi possivel cancelar a quantidade.')
      return
    }

    setCancelQtyInputs((current) => ({ ...current, [order.id]: '' }))
    loadOrders()
  }

  function openCancelModal(order) {
    setConfirmCancel(order)
  }

  function closeCancelModal() {
    setConfirmCancel(null)
  }

  function handleCompanySelect(company) {
    setSelectedCompany(company)
    setSidebarOpen(false)
  }

  if (isHomePage) {
    return <HomePage homePromo={homePromo} />
  }

  if (isClientPage) {
    return (
      <ClientOrderPage
        saveClientOrder={saveCompanyOrder}
        clientSaving={clientSaving}
        clientMessage={clientMessage}
        clientWhatsAppLink={clientWhatsAppLink}
        clientCompanyName={clientCompanyName}
        setClientCompanyName={setClientCompanyName}
        companies={companies}
        clientQty={clientQty}
        setClientQty={setClientQty}
        menuItems={menuItems}
        clientSelectedItems={clientSelectedItems}
        toggleClientMenuItem={toggleClientMenuItem}
        clientItemQuantities={clientItemQuantities}
        updateClientItemQuantity={updateClientItemQuantity}
        clientItemNotes={clientItemNotes}
        updateClientItemNote={updateClientItemNote}
        clientSplitTotal={clientSplitTotal}
        clientQtyValue={clientQtyValue}
        clientAddress={clientAddress}
        setClientAddress={setClientAddress}
        clientNotes={clientNotes}
        setClientNotes={setClientNotes}
      />
    )
  }

  if (!adminAuthenticated) {
    return (
      <AdminLoginPage
        username={adminUsernameInput}
        password={adminPasswordInput}
        errorMessage={adminLoginError}
        onUsernameChange={setAdminUsernameInput}
        onPasswordChange={setAdminPasswordInput}
        onSubmit={handleAdminLogin}
      />
    )
  }

  const adminSectionMeta = getAdminSectionMeta(currentRoute)

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-kicker">Marmitaria Admin</div>
          <div className="brand">RESTAURANTE RIBEIRO</div>
          <div className="clock">{clock}</div>
          <div className="sidebar-status">
            <span className="sidebar-status-dot" aria-hidden="true" />
            Operacao online
          </div>
        </div>
        <div className="sidebar-section">
          <h3>Navegacao</h3>
          <div className="sidebar-nav">
            <button className={`btn btn-sm ${isPedidosPage ? 'btn-dark' : 'btn-outline'}`} onClick={() => navigateTo(ROUTES.pedidos)}>
              Pedidos da Empresa
            </button>
            <button className={`btn btn-sm ${isPainelPage ? 'btn-dark' : 'btn-outline'}`} onClick={() => navigateTo(ROUTES.painel)}>
              Painel
            </button>
            <button className={`btn btn-sm ${isDashboardPage ? 'btn-dark' : 'btn-outline'}`} onClick={() => navigateTo(ROUTES.dashboard)}>
              Dashboard
            </button>
            <button className="btn btn-sm btn-outline" onClick={handleAdminLogout}>
              Sair
            </button>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Empresas</h3>
          <div className="company-list">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`company-item ${selectedCompany && company.id === selectedCompany.id ? 'active' : ''}`}
                onClick={() => handleCompanySelect(company)}
                role="button"
                tabIndex={0}
              >
                <span>{company.name}</span>
                <small>{company.phone || 'Sem telefone'}</small>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

      <main className="main">
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <span className="mobile-title">RESTAURANTE RIBEIRO</span>
        </div>

        <header className="admin-shell-header">
          <div>
            <span className="admin-shell-kicker">Area administrativa</span>
            <h1>{adminSectionMeta.title}</h1>
            <p>{adminSectionMeta.description}</p>
          </div>
          <div className="admin-shell-meta">
            <div className="admin-shell-stat">
              <span>Status</span>
              <strong>Online</strong>
            </div>
            <div className="admin-shell-stat">
              <span>Atualizado</span>
              <strong>{clock}</strong>
            </div>
          </div>
        </header>

        <div className="page-switch">
          <button className={`btn btn-sm ${isPedidosPage ? 'btn-dark' : 'btn-outline'}`} onClick={() => navigateTo(ROUTES.pedidos)}>
            Pedidos da Empresa
          </button>
          <button className={`btn btn-sm ${isPainelPage ? 'btn-dark' : 'btn-outline'}`} onClick={() => navigateTo(ROUTES.painel)}>
            Painel
          </button>
          <button className={`btn btn-sm ${isDashboardPage ? 'btn-dark' : 'btn-outline'}`} onClick={() => navigateTo(ROUTES.dashboard)}>
            Dashboard
          </button>
          <button className="btn btn-sm btn-outline" onClick={handleAdminLogout}>
            Sair
          </button>
        </div>

        {isPedidosPage && (
          <PedidosPage
            selectedCompany={selectedCompany}
            qty={qty}
            setQty={setQty}
            menuItems={menuItems}
            selectedItems={selectedItems}
            toggleMenuItem={toggleMenuItem}
            itemQuantities={itemQuantities}
            updateItemQuantity={updateItemQuantity}
            itemNotes={itemNotes}
            updateItemNote={updateItemNote}
            deleteMenuItem={deleteMenuItem}
            address={address}
            setAddress={setAddress}
            notes={notes}
            setNotes={setNotes}
            saveOrder={saveOrder}
            buildTickets={buildTickets}
            splitTotal={splitTotal}
            qtyValue={qtyValue}
            menuForm={menuForm}
            setMenuForm={setMenuForm}
            menuFormMessage={menuFormMessage}
            addMenuItem={addMenuItem}
            homePromo={homePromo}
            setHomePromo={setHomePromo}
            homePromoMessage={homePromoMessage}
            saveHomePromo={saveHomePromo}
            addCompany={addCompany}
          />
        )}

        {isPainelPage && (
          <PainelPedidosPage
            orders={orders}
            reprintOrder={reprintOrder}
            cancelQtyInputs={cancelQtyInputs}
            updateCancelQtyInput={updateCancelQtyInput}
            cancelOrderPartial={cancelOrderPartial}
            openCancelModal={openCancelModal}
          />
        )}

        {isDashboardPage && (
          <DashboardPage
            dashboardDate={dashboardDate}
            setDashboardDate={setDashboardDate}
            dashboardPeriod={dashboardPeriod}
            setDashboardPeriod={setDashboardPeriod}
            dashboardStats={dashboardStats}
            dashboardLoading={dashboardLoading}
          />
        )}
      </main>

      <div className="print-area" id="printArea">
        {printTickets.map((ticket, index) => (
          <div className="print-ticket" key={`${ticket.company}-${ticket.item}-${index}`}>
            <div>
              {ticket.orderId ? <div className="print-row">Pedido #{ticket.orderId}</div> : null}
              <div className="print-title">{ticket.company}</div>
              {ticket.phone ? <div className="print-row">{ticket.phone}</div> : null}
              <div className="print-item">{ticket.item}</div>
              {ticket.paymentMethod ? <div className="print-row">Pgto: {ticket.paymentMethod}</div> : null}
              {ticket.address ? <div className="print-row">{ticket.address}</div> : null}
            </div>
          </div>
        ))}
      </div>

      {confirmCancel && (
        <div className="modal-backdrop" role="presentation" onClick={closeCancelModal}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Cancelar pedido?</h3>
            <p>
              Você está prestes a cancelar o pedido de <strong>{confirmCancel.company_name}</strong> com{' '}
              <strong>{confirmCancel.qty}</strong> marmitas.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={closeCancelModal}>
                Voltar
              </button>
              <button
                className="btn btn-sm danger"
                onClick={() => {
                  cancelOrder(confirmCancel)
                  closeCancelModal()
                }}
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


