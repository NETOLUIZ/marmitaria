export default function PainelPedidosPage({
  orders,
  reprintOrder,
  cancelQtyInputs,
  updateCancelQtyInput,
  cancelOrderPartial,
  openCancelModal
}) {
  return (
    <section className="card">
      <div className="table-header">
        <h3>Pedidos de Hoje</h3>
        <div className="badge">Total {orders.length}</div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Qtd</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4}>Nenhum pedido hoje.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.company_name}</td>
                  <td>{order.qty}</td>
                  <td>
                    <span
                      className={`status ${
                        (order.status || 'Ativo') === 'Cancelado' ? 'cancelled' : 'active'
                      }`}
                    >
                      {order.status || 'Ativo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={() => reprintOrder(order)}>
                      Reimprimir
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="cancel-qty-input"
                      placeholder="Qtd"
                      value={cancelQtyInputs[order.id] || ''}
                      onChange={(event) => updateCancelQtyInput(order.id, event.target.value)}
                      disabled={(order.status || 'Ativo') === 'Cancelado'}
                    />
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => cancelOrderPartial(order)}
                      disabled={(order.status || 'Ativo') === 'Cancelado'}
                    >
                      Cancelar Qtd
                    </button>
                    <button
                      className="btn btn-sm danger"
                      onClick={() => openCancelModal(order)}
                      disabled={(order.status || 'Ativo') === 'Cancelado'}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
