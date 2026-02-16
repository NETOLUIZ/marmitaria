export default function DashboardPage({
  dashboardDate,
  setDashboardDate,
  dashboardStats,
  dashboardLoading
}) {
  return (
    <section className="card dashboard-card">
      <div className="table-header">
        <h3>Dashboard de Vendas</h3>
      </div>
      <div className="dashboard-filter">
        <label htmlFor="dashboardDate">Data</label>
        <input
          id="dashboardDate"
          type="date"
          value={dashboardDate}
          onChange={(event) => setDashboardDate(event.target.value)}
        />
      </div>
      <div className="dashboard-grid">
        <div className="card card-compact">
          <h2>Total de Quentinhas</h2>
          <div className="dashboard-value">{dashboardStats.totalQty}</div>
        </div>
        <div className="card card-compact">
          <h2>Pedidos Ativos</h2>
          <div className="dashboard-value">{dashboardStats.totalOrders}</div>
        </div>
        <div className="card card-compact">
          <h2>Qtd Cancelada</h2>
          <div className="dashboard-value">{dashboardStats.cancelledQty}</div>
        </div>
      </div>
      <div className="card card-compact">
        <h2>Vendas por Empresa</h2>
        {dashboardLoading ? (
          <p className="helper">Carregando...</p>
        ) : dashboardStats.byCompany.length === 0 ? (
          <p className="helper">Sem vendas para a data selecionada.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Qtd</th>
                  <th>Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {dashboardStats.byCompany.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{item.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
