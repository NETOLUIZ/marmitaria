import { homeFeaturedMeals } from './data/homeFeaturedMeals'

const STORAGE_KEY = 'marmitaria_local_db'

function nowIso() {
  return new Date().toISOString()
}

function buildInitialDb() {
  const menu_items = homeFeaturedMeals.map((item, index) => ({
    id: index + 1,
    name: item.name,
    category: item.category,
    price: Number(item.price),
    description: item.description,
    image_url: item.image,
    created_at: nowIso()
  }))

  const companies = [
    { id: 1, name: '65', phone: '', created_at: nowIso() },
    { id: 2, name: 't1', phone: '', created_at: nowIso() },
    { id: 3, name: 'vrs', phone: '', created_at: nowIso() }
  ]

  return {
    companies,
    menu_items,
    home_settings: [
      {
        id: 1,
        promo_kicker: 'Promocao do dia',
        promo_title: 'Compre 2 marmitas e ganhe refrigerante',
        promo_description:
          'Combos pensados para equipe, familia ou quem quer economizar sem abrir mao de comer bem.',
        promo_card_title: 'Combo Almoco Completo',
        promo_card_description: '2 marmitas tradicionais + 1 refrigerante lata',
        promo_card_price: 'R$ 36,90',
        created_at: nowIso()
      }
    ],
    orders: [],
    order_items: [],
    counters: {
      companies: companies.length,
      menu_items: menu_items.length,
      home_settings: 1,
      orders: 0,
      order_items: 0
    }
  }
}

function readDb() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = buildInitialDb()
      writeDb(initial)
      return initial
    }
    return JSON.parse(raw)
  } catch {
    const initial = buildInitialDb()
    writeDb(initial)
    return initial
  }
}

function writeDb(db) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function applyFilters(rows, filters) {
  return rows.filter((row) =>
    filters.every((filter) => {
      if (filter.type === 'eq') return row[filter.column] === filter.value
      if (filter.type === 'in') return filter.values.includes(row[filter.column])
      return true
    })
  )
}

function applyOrder(rows, orderBy) {
  if (!orderBy) return rows
  const { column, ascending } = orderBy
  return [...rows].sort((a, b) => {
    if (a[column] === b[column]) return 0
    if (a[column] == null) return 1
    if (b[column] == null) return -1
    if (a[column] > b[column]) return ascending ? 1 : -1
    return ascending ? -1 : 1
  })
}

function decorateOrders(rows, db) {
  return rows.map((order) => ({
    ...order,
    company: db.companies.find((company) => company.id === order.company_id)
      ? { name: db.companies.find((company) => company.id === order.company_id).name }
      : null,
    order_items: db.order_items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({ name: item.name }))
  }))
}

class LocalQueryBuilder {
  constructor(table) {
    this.table = table
    this.action = 'select'
    this.columns = '*'
    this.payload = null
    this.filters = []
    this.orderBy = null
    this.limitCount = null
    this.expectSingle = false
  }

  select(columns = '*') {
    this.columns = columns
    return this
  }

  insert(payload) {
    this.action = 'insert'
    this.payload = Array.isArray(payload) ? payload : [payload]
    return this
  }

  update(payload) {
    this.action = 'update'
    this.payload = payload
    return this
  }

  delete() {
    this.action = 'delete'
    return this
  }

  order(column, { ascending = true } = {}) {
    this.orderBy = { column, ascending }
    return this
  }

  limit(count) {
    this.limitCount = count
    return this
  }

  eq(column, value) {
    this.filters.push({ type: 'eq', column, value })
    return this
  }

  in(column, values) {
    this.filters.push({ type: 'in', column, values })
    return this
  }

  single() {
    this.expectSingle = true
    return this
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject)
  }

  async execute() {
    const db = readDb()
    const tableRows = clone(db[this.table] || [])

    try {
      if (this.action === 'select') {
        let rows = applyFilters(tableRows, this.filters)
        rows = applyOrder(rows, this.orderBy)
        if (typeof this.limitCount === 'number') rows = rows.slice(0, this.limitCount)
        if (this.table === 'orders') rows = decorateOrders(rows, db)
        return { data: this.expectSingle ? rows[0] || null : rows, error: null }
      }

      if (this.action === 'insert') {
        const inserted = this.payload.map((item) => {
          const id = (db.counters[this.table] || 0) + 1
          db.counters[this.table] = id
          const row = {
            id,
            created_at: nowIso(),
            ...item
          }

          if (this.table === 'orders') {
            row.status = row.status || 'Ativo'
            row.canceled_qty = Number(row.canceled_qty || 0)
          }

          db[this.table].push(row)
          return row
        })

        writeDb(db)
        return { data: this.expectSingle ? inserted[0] || null : inserted, error: null }
      }

      if (this.action === 'update') {
        const rows = db[this.table]
        const updated = []
        rows.forEach((row, index) => {
          const match = applyFilters([row], this.filters).length > 0
          if (!match) return
          rows[index] = { ...row, ...this.payload }
          updated.push(rows[index])
        })
        writeDb(db)
        return { data: this.expectSingle ? updated[0] || null : updated, error: null }
      }

      if (this.action === 'delete') {
        const keep = []
        const removed = []
        db[this.table].forEach((row) => {
          const match = applyFilters([row], this.filters).length > 0
          if (match) {
            removed.push(row)
          } else {
            keep.push(row)
          }
        })
        db[this.table] = keep
        writeDb(db)
        return { data: this.expectSingle ? removed[0] || null : removed, error: null }
      }

      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

export const supabase = {
  from(table) {
    return new LocalQueryBuilder(table)
  }
}
