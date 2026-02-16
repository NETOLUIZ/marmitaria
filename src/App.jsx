import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import ClientOrderPage from './pages/ClientOrderPage'
import PedidosPage from './pages/PedidosPage'
import PainelPedidosPage from './pages/PainelPedidosPage'
import DashboardPage from './pages/DashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'

const ROUTES = {
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

function normalizeRoute(pathname) {
  const path = (pathname || '/').toLowerCase()
  if (path === '/' || path === '') return ROUTES.cliente
  if (path === ROUTES.pedidos) return ROUTES.pedidos
  if (path === ROUTES.painel) return ROUTES.painel
  if (path === ROUTES.dashboard) return ROUTES.dashboard
  if (path === ROUTES.cliente) return ROUTES.cliente
  return ROUTES.cliente
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => normalizeRoute(window.location.pathname))
  const isClientPage = currentRoute === ROUTES.cliente
  const isPedidosPage = currentRoute === ROUTES.pedidos
  const isPainelPage = currentRoute === ROUTES.painel
  const isDashboardPage = currentRoute === ROUTES.dashboard

  // Estados gerais da tela de atendimento
  const [clock, setClock] = useState(() => formatClock(new Date()))
  const [qty, setQty] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [menuInput, setMenuInput] = useState('')
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
  const [dashboardDate, setDashboardDate] = useState(() => formatDateInput(new Date()))
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const [adminUsernameInput, setAdminUsernameInput] = useState('')
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [dashboardStats, setDashboardStats] = useState({
    totalQty: 0,
    totalOrders: 0,
    cancelledQty: 0,
    byCompany: []
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
        const { data, error } = await supabase
          .from('menu_items')
          .select('id, name')
          .order('id', { ascending: false })
        if (error) throw error
        setMenuItems(Array.isArray(data) ? data : [])
      } catch {
        setMenuItems([])
      }
    }

    loadCompanies()
    loadMenu()
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

      const mapped = filtered.map((order) => ({
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

      setOrders(mapped)
    } catch {
      setOrders([])
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    if (isDashboardPage) {
      loadDashboard(dashboardDate)
    }
  }, [isDashboardPage, dashboardDate])

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
    navigateTo(ROUTES.cliente)
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
        return {
          name,
          qty: Number.isNaN(parsed) ? 0 : parsed,
          note: (itemNotes[name] || '').trim()
        }
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
        return {
          name,
          qty: Number.isNaN(parsed) ? 0 : parsed,
          note: (clientItemNotes[name] || '').trim()
        }
      })
      .filter((item) => item.qty > 0)
  }, [clientItemNotes, clientItemQuantities, clientSelectedItems])

  const clientSplitTotal = useMemo(() => {
    return clientSplitItems.reduce((sum, item) => sum + item.qty, 0)
  }, [clientSplitItems])

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
    setItemQuantities((current) => ({
      ...current,
      [name]: digits
    }))
  }

  function updateItemNote(name, value) {
    setItemNotes((current) => ({
      ...current,
      [name]: value
    }))
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
    setClientItemQuantities((current) => ({
      ...current,
      [name]: digits
    }))
  }

  function updateClientItemNote(name, value) {
    setClientItemNotes((current) => ({
      ...current,
      [name]: value
    }))
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

  function buildWhatsAppLink(message) {
    if (!WHATSAPP_NUMBER) return ''
    const encoded = encodeURIComponent(message)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
  }

  function sendToWhatsApp(message) {
    const link = buildWhatsAppLink(message)
    if (!link) return { sent: false, link: '' }
    const popup = window.open(link, '_blank', 'noopener,noreferrer')
    return { sent: Boolean(popup), link }
  }

  function buildOrderMessage({
    orderId,
    companyName,
    qty,
    items,
    addressValue,
    notesValue,
    source
  }) {
    const lines = ['🍱 *NOVO PEDIDO*', '------------------------------']

    if (orderId) {
      lines.push(`🧾 Pedido: #${orderId}`)
    }

    lines.push(`🏢 Empresa: ${companyName}`)
    lines.push(`🔢 Quantidade: ${qty}`)
    lines.push(`📍 Origem: ${source}`)
    lines.push('')
    lines.push('📋 *Itens:*')

    items.forEach((item) => {
      lines.push(`- ${item.qty}x ${formatItemLabel(item)}`)
    })

    lines.push('')
    lines.push(`📬 Endereço: ${addressValue || '-'}`)
    lines.push(`📝 Observações: ${notesValue || '-'}`)
    lines.push('------------------------------')
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
      return response
    }

    return response
  }

  async function updateOrderWithCancelFallback(orderId, payloadWithCanceledQty, payloadFallback) {
    let response = await supabase.from('orders').update(payloadWithCanceledQty).eq('id', orderId)
    if (!response.error) return response

    if (isMissingCanceledQtyColumn(response.error)) {
      response = await supabase.from('orders').update(payloadFallback).eq('id', orderId)
      return response
    }

    return response
  }

  async function loadDashboard(targetDate) {
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

      const dayOrders = (Array.isArray(data) ? data : []).filter((order) => {
        return formatDateInput(new Date(order.created_at)) === targetDate
      })

      const activeOrders = dayOrders.filter((order) => (order.status || 'Ativo') !== 'Cancelado')

      const companyMap = {}
      activeOrders.forEach((order) => {
        const name = order.company?.name || '---'
        if (!companyMap[name]) {
          companyMap[name] = { name, qty: 0, orders: 0 }
        }
        companyMap[name].qty += Number(order.qty || 0)
        companyMap[name].orders += 1
      })

      setDashboardStats({
        totalQty: activeOrders.reduce((sum, order) => sum + Number(order.qty || 0), 0),
        totalOrders: activeOrders.length,
        cancelledQty: dayOrders.reduce((sum, order) => sum + Number(order.canceled_qty || 0), 0),
        byCompany: Object.values(companyMap).sort((a, b) => b.qty - a.qty)
      })
    } catch {
      setDashboardStats({
        totalQty: 0,
        totalOrders: 0,
        cancelledQty: 0,
        byCompany: []
      })
    } finally {
      setDashboardLoading(false)
    }
  }

  async function addMenuItem() {
    const value = menuInput.trim()
    if (!value) return

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({ name: value })
        .select('id, name')
        .single()
      if (error) throw error
      setMenuItems((current) => [...current, data])
      setMenuInput('')
    } catch {
      // Silently ignore network errors
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
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, phone')
          .order('name', { ascending: true })
        if (error) {
          setCompanies((current) => current)
        } else {
          setCompanies(Array.isArray(data) ? data : [])
        }
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
      const payload = buildOrderItemsPayload(created.id, splitItems)
      await supabase.from('order_items').insert(payload)
    }

    const message = buildOrderMessage({
      orderId: created.id,
      companyName: selectedCompany.name,
      qty: qtyValue,
      items: splitItems,
      addressValue: address,
      notesValue: notes,
      source: 'Painel Admin'
    })
    sendToWhatsApp(message)

    alert('Pedido salvo no banco.')
    loadOrders()
  }

  async function saveClientOrder(event) {
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
      let company = companies.find(
        (item) => item.name.trim().toLowerCase() === typedCompanyName.toLowerCase()
      )

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

      const message = buildOrderMessage({
        orderId: created.id,
        companyName: company.name,
        qty: clientQtyValue,
        items: clientSplitItems,
        addressValue: clientAddress,
        notesValue: clientNotes,
        source: 'Pagina de Pedido'
      })
      const whatsapp = sendToWhatsApp(message)

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

  function makeTickets({ company, items, qty }) {
    const source = Array.isArray(items) ? items : []
    const safeQty = Number.isInteger(qty) && qty > 0 ? qty : source.length
    const list = source.slice(0, safeQty)
    const finalList = list.length ? list : ['Sem itens']
    return finalList.map((item) => ({
      company,
      item
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
        tickets.push({
          company: selectedCompany.name,
          item: itemLabel
        })
      }
    })

    setPrintTickets(tickets)
    setTimeout(() => window.print(), 50)
  }

  function reprintOrder(order) {
    const tickets = makeTickets({
      company: order.company_name,
      items: order.items,
      qty: Number(order.qty || 0)
    })
    setPrintTickets(tickets)
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
    setCancelQtyInputs((current) => ({
      ...current,
      [orderId]: digits
    }))
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

    setCancelQtyInputs((current) => ({
      ...current,
      [order.id]: ''
    }))
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

  if (isClientPage) {
    return (
      <ClientOrderPage
        saveClientOrder={saveClientOrder}
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

  return (
    <>
      {/* Sidebar fixa: marca, navegação e lista de empresas */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">RESTAURANTE RIBEIRO</div>
          <div className="clock">{clock}</div>
        </div>
        <div className="sidebar-nav">
          <button
            className={`btn btn-sm ${isPedidosPage ? 'btn-dark' : 'btn-outline'}`}
            onClick={() => navigateTo(ROUTES.pedidos)}
          >
            Pedidos
          </button>
          <button
            className={`btn btn-sm ${isPainelPage ? 'btn-dark' : 'btn-outline'}`}
            onClick={() => navigateTo(ROUTES.painel)}
          >
            Painel
          </button>
          <button
            className={`btn btn-sm ${isDashboardPage ? 'btn-dark' : 'btn-outline'}`}
            onClick={() => navigateTo(ROUTES.dashboard)}
          >
            Dashboard
          </button>
          <button className="btn btn-sm btn-outline" onClick={handleAdminLogout}>
            Sair
          </button>
        </div>

        <div className="sidebar-section">
          <h3>Empresas</h3>
          <div className="company-list">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`company-item ${
                  selectedCompany && company.id === selectedCompany.id ? 'active' : ''
                }`}
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

      <div
        className={`overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <main className="main">
        {/* Topbar mobile */}
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <span className="mobile-title">RESTAURANTE RIBEIRO</span>
        </div>
        <div className="page-switch">
          <button
            className={`btn btn-sm ${isPedidosPage ? 'btn-dark' : 'btn-outline'}`}
            onClick={() => navigateTo(ROUTES.pedidos)}
          >
            Pedidos
          </button>
          <button
            className={`btn btn-sm ${isPainelPage ? 'btn-dark' : 'btn-outline'}`}
            onClick={() => navigateTo(ROUTES.painel)}
          >
            Painel
          </button>
          <button
            className={`btn btn-sm ${isDashboardPage ? 'btn-dark' : 'btn-outline'}`}
            onClick={() => navigateTo(ROUTES.dashboard)}
          >
            Dashboard
          </button>
          <button className="btn btn-sm btn-outline" onClick={handleAdminLogout}>
            Sair
          </button>
          <button className="btn btn-sm btn-outline" onClick={() => window.open('/pedido', '_blank')}>
            Pagina Cliente
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
            menuInput={menuInput}
            setMenuInput={setMenuInput}
            addMenuItem={addMenuItem}
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
            dashboardStats={dashboardStats}
            dashboardLoading={dashboardLoading}
          />
        )}
      </main>

      {/* Área usada apenas na impressão das etiquetas */}
      <div className="print-area" id="printArea">
        {printTickets.map((ticket, index) => (
          <div className="print-ticket" key={`${ticket.company}-${ticket.item}-${index}`}>
            <div>
              <div className="print-title">{ticket.company}</div>
              <div className="print-item">{ticket.item}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmação para cancelamento de pedido */}
      {confirmCancel && (
        <div className="modal-backdrop" role="presentation" onClick={closeCancelModal}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Cancelar pedido?</h3>
            <p>
              Você está prestes a cancelar o pedido de{' '}
              <strong>{confirmCancel.company_name}</strong> com <strong>{confirmCancel.qty}</strong> marmitas.
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
