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
  return (
    <>
      <nav className="client-nav">
        <a className="client-admin-link" href="/pedidos" title="Entrar no admin" aria-label="Entrar no admin">
          ⚙
        </a>
        <div className="client-nav-brand">Restaurante Ribeiro</div>
      </nav>
      <main className="client-page">
        <section className="client-card">
          <h1>Fazer Pedido</h1>
          <p className="helper">Selecione a empresa e monte seu pedido.</p>
          <form onSubmit={saveClientOrder}>
            <div className="field">
              <label htmlFor="clientCompany">Empresa (digite livre)</label>
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
              <label htmlFor="clientQty">Quantidade de Marmitas</label>
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

            <div className="field">
              <label>Cardapio do Dia</label>
              <div className="menu-list">
                {menuItems.map((item) => (
                  <label key={item.id} className="menu-item">
                    <input
                      type="checkbox"
                      value={item.name}
                      checked={clientSelectedItems.includes(item.name)}
                      onChange={(event) => toggleClientMenuItem(item.name, event.target.checked)}
                    />
                    <span className="menu-name">{item.name}</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Qtd"
                      className="menu-qty-input"
                      value={clientItemQuantities[item.name] || ''}
                      onChange={(event) => updateClientItemQuantity(item.name, event.target.value)}
                      disabled={!clientSelectedItems.includes(item.name)}
                    />
                    <input
                      type="text"
                      placeholder="Obs/Nome"
                      className="menu-note-input"
                      value={clientItemNotes[item.name] || ''}
                      onChange={(event) => updateClientItemNote(item.name, event.target.value)}
                      disabled={!clientSelectedItems.includes(item.name)}
                    />
                    <span className="menu-tag">{clientSelectedItems.includes(item.name) ? 'ok' : '-'}</span>
                  </label>
                ))}
              </div>
              <p className="helper">
                Separacao dos itens: <strong>{clientSplitTotal}</strong> / <strong>{clientQtyValue}</strong>
              </p>
            </div>

            <div className="field">
              <label htmlFor="clientAddress">Endereco (opcional)</label>
              <input
                id="clientAddress"
                type="text"
                value={clientAddress}
                onChange={(event) => setClientAddress(event.target.value)}
                placeholder="Rua, numero, bairro"
              />
            </div>

            <div className="field">
              <label htmlFor="clientNotes">Observacoes (opcional)</label>
              <textarea
                id="clientNotes"
                rows="3"
                value={clientNotes}
                onChange={(event) => setClientNotes(event.target.value)}
                placeholder="Informacoes adicionais do pedido"
              />
            </div>

            <button className="btn btn-success" type="submit" disabled={clientSaving}>
              {clientSaving ? 'Enviando...' : 'Enviar Pedido'}
            </button>
            {clientMessage && <p className="helper client-message">{clientMessage}</p>}
            {clientWhatsAppLink && (
              <a className="btn btn-outline client-whatsapp-link" href={clientWhatsAppLink} target="_blank" rel="noreferrer">
                Abrir WhatsApp
              </a>
            )}
          </form>
        </section>
      </main>
    </>
  )
}
