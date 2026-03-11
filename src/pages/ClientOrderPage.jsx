export default function ClientOrderPage({
  saveClientOrder,
  clientSaving,
  clientMessage,
  clientWhatsAppLink,
  clientCompanyName,
  setClientCompanyName,
  companies,
  clientQty,
  setClientQty,
  menuItems,
  clientSelectedItems,
  toggleClientMenuItem,
  clientItemQuantities,
  updateClientItemQuantity,
  clientItemNotes,
  updateClientItemNote,
  clientSplitTotal,
  clientQtyValue,
  clientAddress,
  setClientAddress,
  clientNotes,
  setClientNotes
}) {
  const selectedMenu = menuItems.filter((item) => clientSelectedItems.includes(item.name))
  const remainingQty = Math.max(clientQtyValue - clientSplitTotal, 0)
  const hasMenu = menuItems.length > 0
  const isCompleteSplit = clientQtyValue > 0 && clientSplitTotal === clientQtyValue

  return (
    <>
      <nav className="client-nav">
        <a className="client-admin-link" href="/pedidos" title="Entrar no admin" aria-label="Entrar no admin">
          Admin
        </a>
        <div className="client-nav-brand">Restaurante Ribeiro</div>
      </nav>

      <main className="client-page">
        <section className="client-card client-sales-layout">
          <div className="client-sales-hero">
            <span className="client-kicker">Pedidos para empresas</span>
            <h1>Monte o pedido da empresa e distribua o cardapio com rapidez</h1>
            <p className="helper client-hero-text">
              Escolha a empresa, informe a quantidade total e distribua as marmitas entre os pratos disponiveis.
            </p>

            <div className="client-highlight-grid">
              <div className="client-highlight">
                <strong>{menuItems.length}</strong>
                <span>opcoes no cardapio</span>
              </div>
              <div className="client-highlight">
                <strong>{clientSplitTotal}</strong>
                <span>marmitas separadas</span>
              </div>
              <div className="client-highlight">
                <strong>{remainingQty}</strong>
                <span>faltando distribuir</span>
              </div>
            </div>
          </div>

          <form onSubmit={saveClientOrder} className="client-order-form">
            <div className="client-form-grid">
              <div className="field">
                <label htmlFor="clientCompany">Empresa</label>
                <input
                  id="clientCompany"
                  type="text"
                  list="clientCompanyList"
                  value={clientCompanyName}
                  onChange={(event) => setClientCompanyName(event.target.value)}
                  placeholder="Digite o nome da empresa"
                  required
                />
                <datalist id="clientCompanyList">
                  {companies.map((company) => (
                    <option key={company.id} value={company.name} />
                  ))}
                </datalist>
              </div>

              <div className="field">
                <label htmlFor="clientQty">Quantidade total</label>
                <input
                  id="clientQty"
                  type="number"
                  min="1"
                  value={clientQty}
                  onChange={(event) => setClientQty(event.target.value)}
                  placeholder="Ex: 10"
                  required
                />
              </div>
            </div>

            <div className="field">
              <div className="client-section-head">
                <div>
                  <label>Escolha o cardapio</label>
                  <p className="helper">Marque os pratos e informe quantas marmitas vao para cada opcao.</p>
                </div>
                <div className={`client-total-pill ${isCompleteSplit ? 'is-complete' : ''}`}>
                  {clientSplitTotal} de {clientQtyValue || 0}
                </div>
              </div>

              {!hasMenu && (
                <div className="client-empty-menu">
                  Nenhum item cadastrado no cardapio. Adicione os pratos no painel administrativo.
                </div>
              )}

              {hasMenu && (
                <div className="client-menu-grid">
                  {menuItems.map((item) => {
                    const selected = clientSelectedItems.includes(item.name)

                    return (
                      <label
                        key={item.id}
                        className={`client-menu-card ${selected ? 'is-selected' : ''}`}
                      >
                        <div className="client-menu-top">
                          <input
                            type="checkbox"
                            value={item.name}
                            checked={selected}
                            onChange={(event) => toggleClientMenuItem(item.name, event.target.checked)}
                          />
                          <span className="client-menu-name">{item.name}</span>
                          <span className="client-menu-state">{selected ? 'Selecionado' : 'Disponivel'}</span>
                        </div>

                        <div className="client-menu-fields">
                          <input
                            type="number"
                            min="0"
                            placeholder="Qtd"
                            className="menu-qty-input"
                            value={clientItemQuantities[item.name] || ''}
                            onChange={(event) => updateClientItemQuantity(item.name, event.target.value)}
                            disabled={!selected}
                          />
                          <input
                            type="text"
                            placeholder="Observacao do item"
                            className="menu-note-input"
                            value={clientItemNotes[item.name] || ''}
                            onChange={(event) => updateClientItemNote(item.name, event.target.value)}
                            disabled={!selected}
                          />
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="client-form-grid">
              <div className="field">
                <label htmlFor="clientAddress">Endereco de entrega</label>
                <input
                  id="clientAddress"
                  type="text"
                  value={clientAddress}
                  onChange={(event) => setClientAddress(event.target.value)}
                  placeholder="Rua, numero e bairro"
                />
              </div>

              <div className="field">
                <label htmlFor="clientNotes">Observacoes gerais</label>
                <textarea
                  id="clientNotes"
                  rows="3"
                  value={clientNotes}
                  onChange={(event) => setClientNotes(event.target.value)}
                  placeholder="Ex: entregar ate 11h30, sem talher"
                />
              </div>
            </div>

            <div className="client-summary">
              <h2>Resumo do pedido da empresa</h2>
              <div className="client-summary-grid">
                <div>
                  <span>Empresa</span>
                  <strong>{clientCompanyName || '-'}</strong>
                </div>
                <div>
                  <span>Total de marmitas</span>
                  <strong>{clientQtyValue || 0}</strong>
                </div>
                <div>
                  <span>Itens escolhidos</span>
                  <strong>{selectedMenu.length}</strong>
                </div>
                <div>
                  <span>Separacao atual</span>
                  <strong>{clientSplitTotal}</strong>
                </div>
              </div>

              <div className="client-summary-items">
                {selectedMenu.length === 0 ? (
                  <p className="helper">Nenhum prato selecionado ainda.</p>
                ) : (
                  selectedMenu.map((item) => (
                    <div className="client-summary-item" key={item.id}>
                      <strong>{item.name}</strong>
                      <span>{clientItemQuantities[item.name] || 0} marmitas</span>
                      <small>{clientItemNotes[item.name] || 'Sem observacao'}</small>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="client-actions">
              <button className="btn btn-success" type="submit" disabled={clientSaving || !hasMenu}>
                {clientSaving ? 'Enviando...' : 'Enviar Pedido da Empresa'}
              </button>
              {clientWhatsAppLink && (
                <a
                  className="btn btn-outline client-whatsapp-link"
                  href={clientWhatsAppLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir WhatsApp
                </a>
              )}
            </div>

            {clientMessage && <p className="helper client-message">{clientMessage}</p>}
          </form>
        </section>
      </main>
    </>
  )
}
