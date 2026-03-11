import { useMemo, useState } from 'react'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0))
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(Number(value || 0))
}

function SummaryCard({ title, value, icon, trend, subtitle, tone = 'orange' }) {
  const isPositive = trend >= 0
  return (
    <article className={`dashboard-summary-card tone-${tone}`}>
      <div className="dashboard-summary-top">
        <span className="dashboard-summary-icon" aria-hidden="true">{icon}</span>
        <span className={`dashboard-trend ${isPositive ? 'up' : 'down'}`}>
          {isPositive ? '+' : ''}
          {trend}%
        </span>
      </div>
      <div className="dashboard-summary-title">{title}</div>
      <div className="dashboard-summary-value">{value}</div>
      <div className="dashboard-summary-subtitle">{subtitle}</div>
    </article>
  )
}

function PieChartCard({ title, data, colors }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1
  let currentAngle = 0

  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-head">
        <h3>{title}</h3>
      </div>
      <div className="dashboard-pie-layout">
        <svg viewBox="0 0 42 42" className="dashboard-pie-chart" aria-label={title}>
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="6" />
          {data.map((item, index) => {
            const value = item.value || 0
            const angle = (value / total) * 100
            const circle = (
              <circle
                key={item.label}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth="6"
                strokeDasharray={`${angle} ${100 - angle}`}
                strokeDashoffset={25 - currentAngle}
              >
                <title>
                  {item.label}: {item.value} ({Math.round((value / total) * 100)}%)
                </title>
              </circle>
            )
            currentAngle += angle
            return circle
          })}
        </svg>
        <div className="dashboard-legend">
          {data.map((item, index) => {
            const percentage = total ? Math.round((item.value / total) * 100) : 0
            return (
              <div className="dashboard-legend-item" key={item.label}>
                <span className="dashboard-legend-dot" style={{ backgroundColor: colors[index % colors.length] }} />
                <span>{item.label}</span>
                <strong>{percentage}%</strong>
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}

function CandlesChart({ data }) {
  const values = data.flatMap((item) => [item.low, item.high, item.open, item.close])
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const scaleY = (value) => 180 - ((value - min) / range) * 150

  return (
    <article className="dashboard-panel dashboard-panel-large">
      <div className="dashboard-panel-head">
        <div>
          <h3>Grafico de velas do faturamento</h3>
          <p>Oscilacao por horario com abertura, maxima, minima e fechamento do faturamento.</p>
        </div>
      </div>
      <svg viewBox="0 0 640 220" className="dashboard-candles-chart" aria-label="Grafico de velas">
        <line x1="40" y1="190" x2="610" y2="190" className="dashboard-axis" />
        <line x1="40" y1="20" x2="40" y2="190" className="dashboard-axis" />
        {data.map((item, index) => {
          const x = 80 + index * 70
          const bodyTop = scaleY(Math.max(item.open, item.close))
          const bodyBottom = scaleY(Math.min(item.open, item.close))
          const highY = scaleY(item.high)
          const lowY = scaleY(item.low)
          const rising = item.close >= item.open

          return (
            <g key={item.label}>
              <line x1={x} y1={highY} x2={x} y2={lowY} className="dashboard-candle-line" />
              <rect
                x={x - 12}
                y={bodyTop}
                width="24"
                height={Math.max(10, bodyBottom - bodyTop)}
                rx="6"
                className={rising ? 'dashboard-candle-up' : 'dashboard-candle-down'}
              >
                <title>
                  {item.label} | Abertura: {formatCurrency(item.open)} | Alta: {formatCurrency(item.high)} | Baixa:{' '}
                  {formatCurrency(item.low)} | Fechamento: {formatCurrency(item.close)}
                </title>
              </rect>
              <text x={x} y="208" textAnchor="middle" className="dashboard-axis-label">
                {item.label}
              </text>
            </g>
          )
        })}
        <text x="8" y="30" className="dashboard-axis-label">
          {formatCurrency(max)}
        </text>
        <text x="8" y="188" className="dashboard-axis-label">
          {formatCurrency(min)}
        </text>
      </svg>
    </article>
  )
}

function PeakHoursChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-head">
        <h3>Horarios de pico</h3>
      </div>
      <div className="dashboard-hours-list">
        {data.map((item) => (
          <div className="dashboard-hours-item" key={item.label}>
            <span>{item.label}</span>
            <div className="dashboard-hours-bar">
              <div className="dashboard-hours-fill" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </article>
  )
}

function getPeriodLabel(period) {
  if (period === 'yesterday') return 'Ontem'
  if (period === 'last7') return 'Ultimos 7 dias'
  if (period === 'last30') return 'Ultimos 30 dias'
  if (period === 'month') return 'Este mes'
  return 'Hoje'
}

function exportCsv(rows) {
  const headers = ['Pedido', 'Cliente', 'Itens', 'Total', 'Pagamento', 'Status', 'Horario']
  const lines = rows.map((row) => [row.id, row.client, row.items, row.total, row.payment, row.status, row.time])
  const csv = [headers, ...lines]
    .map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';'))
    .join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'relatorio-marmitaria.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function DashboardPage({
  dashboardDate,
  setDashboardDate,
  dashboardPeriod,
  setDashboardPeriod,
  dashboardStats,
  dashboardLoading
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const recentOrders = dashboardStats.recentOrders || []
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return recentOrders
    return recentOrders.filter((order) => {
      const haystack = [order.id, order.client, order.items, order.payment, order.status, order.time]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [recentOrders, searchTerm])

  const selectedOrder = useMemo(() => {
    return filteredOrders.find((order) => order.id === selectedOrderId) || filteredOrders[0] || null
  }, [filteredOrders, selectedOrderId])

  const summaryCards = [
    {
      title: 'Total de pedidos',
      value: formatNumber(dashboardStats.totalOrders),
      icon: '#',
      trend: 12,
      subtitle: 'comparado ao periodo anterior',
      tone: 'orange'
    },
    {
      title: 'Faturamento',
      value: formatCurrency(dashboardStats.revenueTotal),
      icon: 'R$',
      trend: 18,
      subtitle: 'receita consolidada',
      tone: 'green'
    },
    {
      title: 'Marmitas vendidas',
      value: formatNumber(dashboardStats.totalQty),
      icon: 'QTD',
      trend: 9,
      subtitle: 'volume total expedido',
      tone: 'blue'
    },
    {
      title: 'Ticket medio',
      value: formatCurrency(dashboardStats.ticketAverage),
      icon: 'TM',
      trend: 6,
      subtitle: 'valor medio por pedido',
      tone: 'slate'
    },
    {
      title: 'Em andamento',
      value: formatNumber(dashboardStats.inProgress),
      icon: 'OP',
      trend: 4,
      subtitle: 'preparo ou entrega',
      tone: 'orange'
    },
    {
      title: 'Concluidos',
      value: formatNumber(dashboardStats.completed),
      icon: 'OK',
      trend: 14,
      subtitle: 'pedidos entregues',
      tone: 'green'
    },
    {
      title: 'Cancelados',
      value: formatNumber(dashboardStats.cancelledOrders),
      icon: 'AL',
      trend: -3,
      subtitle: 'cancelamentos do periodo',
      tone: 'red'
    },
    {
      title: 'Clientes atendidos',
      value: formatNumber(dashboardStats.totalClients),
      icon: 'CL',
      trend: 11,
      subtitle: 'base atendida no periodo',
      tone: 'slate'
    }
  ]

  const activeRangeLabel = getPeriodLabel(dashboardPeriod)

  return (
    <section className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <span className="dashboard-kicker">Painel administrativo</span>
          <h1>Visao executiva da marmitaria</h1>
          <p>Resumo visual do negocio com foco em vendas, operacao, financeiro e desempenho.</p>
        </div>
        <div className="dashboard-toolbar">
          <input
            className="dashboard-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar pedido, cliente, item ou pagamento"
          />
          <div className="dashboard-top-actions">
            <span className="dashboard-notice">{dashboardStats.inProgress} pedidos ativos</span>
            <span className="dashboard-user">Admin</span>
          </div>
        </div>
      </header>

      <div className="dashboard-filter-bar">
        <div className="dashboard-filter">
          <label htmlFor="dashboardDate">Data de analise</label>
          <input
            id="dashboardDate"
            type="date"
            value={dashboardDate}
            onChange={(event) => {
              setDashboardDate(event.target.value)
              setDashboardPeriod('day')
            }}
          />
        </div>
        <div className="dashboard-quick-filters">
          <button
            className={`btn btn-sm ${dashboardPeriod === 'day' ? 'btn-dark' : 'btn-outline'}`}
            type="button"
            onClick={() => setDashboardPeriod('day')}
          >
            Hoje
          </button>
          <button
            className={`btn btn-sm ${dashboardPeriod === 'yesterday' ? 'btn-dark' : 'btn-outline'}`}
            type="button"
            onClick={() => setDashboardPeriod('yesterday')}
          >
            Ontem
          </button>
          <button
            className={`btn btn-sm ${dashboardPeriod === 'last7' ? 'btn-dark' : 'btn-outline'}`}
            type="button"
            onClick={() => setDashboardPeriod('last7')}
          >
            Ultimos 7 dias
          </button>
          <button
            className={`btn btn-sm ${dashboardPeriod === 'last30' ? 'btn-dark' : 'btn-outline'}`}
            type="button"
            onClick={() => setDashboardPeriod('last30')}
          >
            Ultimos 30 dias
          </button>
          <button
            className={`btn btn-sm ${dashboardPeriod === 'month' ? 'btn-dark' : 'btn-outline'}`}
            type="button"
            onClick={() => setDashboardPeriod('month')}
          >
            Este mes
          </button>
        </div>
      </div>

      <div className="dashboard-summary-grid">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      {dashboardLoading ? (
        <section className="dashboard-panel">
          <p className="helper">Carregando indicadores...</p>
        </section>
      ) : (
        <>
          <div className="dashboard-main-grid">
            <CandlesChart
              data={dashboardStats.candles.length ? dashboardStats.candles : [{ label: '08:00', open: 0, high: 0, low: 0, close: 0 }]}
            />
            <div className="dashboard-side-stack">
              <PeakHoursChart data={dashboardStats.peakHours.length ? dashboardStats.peakHours : [{ label: '11h', value: 0 }]} />
              <article className="dashboard-panel">
                <div className="dashboard-panel-head">
                  <h3>Financeiro</h3>
                  <span className="dashboard-panel-badge">{activeRangeLabel}</span>
                </div>
                <div className="dashboard-finance-grid">
                  <div><span>Receita bruta</span><strong>{formatCurrency(dashboardStats.finance.grossRevenue)}</strong></div>
                  <div><span>Descontos</span><strong>{formatCurrency(dashboardStats.finance.discounts)}</strong></div>
                  <div><span>Entregas</span><strong>{formatCurrency(dashboardStats.finance.deliveryFees)}</strong></div>
                  <div><span>Lucro estimado</span><strong>{formatCurrency(dashboardStats.finance.estimatedProfit)}</strong></div>
                  <div><span>Despesas</span><strong>{formatCurrency(dashboardStats.finance.operationalCosts)}</strong></div>
                  <div><span>Resultado liquido</span><strong>{formatCurrency(dashboardStats.finance.netResult)}</strong></div>
                </div>
              </article>
            </div>
          </div>

          <div className="dashboard-pies-grid">
            <PieChartCard
              title="Pedidos por categoria"
              data={dashboardStats.categoryBreakdown.length ? dashboardStats.categoryBreakdown : [{ label: 'Tradicionais', value: 1 }]}
              colors={['#f97316', '#22c55e', '#0ea5e9', '#facc15', '#94a3b8']}
            />
            <PieChartCard
              title="Formas de pagamento"
              data={dashboardStats.paymentBreakdown.length ? dashboardStats.paymentBreakdown : [{ label: 'Pix', value: 1 }]}
              colors={['#16a34a', '#f97316', '#0f172a', '#38bdf8']}
            />
            <PieChartCard
              title="Status dos pedidos"
              data={dashboardStats.statusBreakdown.length ? dashboardStats.statusBreakdown : [{ label: 'Em preparo', value: 1 }]}
              colors={['#f59e0b', '#0ea5e9', '#22c55e', '#ef4444']}
            />
          </div>

          <div className="dashboard-content-grid">
            <article className="dashboard-panel dashboard-panel-large">
              <div className="dashboard-panel-head">
                <div>
                  <h3>Pedidos recentes</h3>
                  <p>{filteredOrders.length} resultados encontrados</p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Itens</th>
                      <th>Total</th>
                      <th>Pagamento</th>
                      <th>Status</th>
                      <th>Horario</th>
                      <th>Acao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8}>Sem pedidos recentes no periodo.</td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.client}</td>
                          <td>{order.items}</td>
                          <td>{formatCurrency(order.total)}</td>
                          <td>{order.payment}</td>
                          <td>{order.status}</td>
                          <td>{order.time}</td>
                          <td>
                            <button className="btn btn-sm btn-outline" type="button" onClick={() => setSelectedOrderId(order.id)}>
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {selectedOrder ? (
                <div className="dashboard-order-detail">
                  <div>
                    <span>Pedido selecionado</span>
                    <strong>#{selectedOrder.id} - {selectedOrder.client}</strong>
                  </div>
                  <div>
                    <span>Itens</span>
                    <strong>{selectedOrder.items}</strong>
                  </div>
                  <div>
                    <span>Pagamento</span>
                    <strong>{selectedOrder.payment}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{selectedOrder.status}</strong>
                  </div>
                </div>
              ) : null}
            </article>

            <div className="dashboard-side-stack">
              <article className="dashboard-panel">
                <div className="dashboard-panel-head">
                  <h3>Produtos mais vendidos</h3>
                </div>
                <div className="dashboard-top-products">
                  {dashboardStats.topProducts.length === 0 ? (
                    <p className="helper">Sem dados de produtos vendidos.</p>
                  ) : (
                    dashboardStats.topProducts.map((item) => (
                      <div className="dashboard-top-product" key={item.name}>
                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.qty} vendidos</span>
                        </div>
                        <div>
                          <strong>{formatCurrency(item.revenue)}</strong>
                          <span className={item.growth >= 0 ? 'up' : 'down'}>
                            {item.growth >= 0 ? '+' : ''}
                            {item.growth}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="dashboard-panel">
                <div className="dashboard-panel-head">
                  <h3>Desempenho geral</h3>
                </div>
                <div className="dashboard-performance-list">
                  <div><span>Taxa de concluidos</span><strong>{dashboardStats.performance.completionRate.toFixed(1)}%</strong></div>
                  <div><span>Tempo medio de entrega</span><strong>{dashboardStats.performance.avgDeliveryMinutes} min</strong></div>
                  <div><span>Taxa de cancelamento</span><strong>{dashboardStats.performance.cancelRate.toFixed(1)}%</strong></div>
                  <div><span>Clientes recorrentes</span><strong>{dashboardStats.performance.recurringClients}</strong></div>
                  <div><span>Avaliacao media</span><strong>{dashboardStats.performance.customerRating.toFixed(1)}</strong></div>
                </div>
              </article>
            </div>
          </div>

          <footer className="dashboard-footer">
            <span>Ultima atualizacao com base em {dashboardDate}</span>
            <span>Sistema operando normalmente</span>
            <div className="dashboard-footer-actions">
              <button className="btn btn-sm btn-outline" type="button" onClick={() => window.print()}>
                Exportar PDF
              </button>
              <button className="btn btn-sm btn-outline" type="button" onClick={() => exportCsv(filteredOrders)}>
                Exportar Excel
              </button>
            </div>
          </footer>
        </>
      )}
    </section>
  )
}
