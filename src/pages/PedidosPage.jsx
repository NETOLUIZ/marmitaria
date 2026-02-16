export default function PedidosPage({
  selectedCompany,
  qty,
  setQty,
  menuItems,
  selectedItems,
  toggleMenuItem,
  itemQuantities,
  updateItemQuantity,
  itemNotes,
  updateItemNote,
  deleteMenuItem,
  address,
  setAddress,
  notes,
  setNotes,
  saveOrder,
  buildTickets,
  splitTotal,
  qtyValue,
  menuInput,
  setMenuInput,
  addMenuItem,
  addCompany
}) {
  return (
    <>
      <section className="grid-2">
        <div className="card card-new-order">
          <h2>Novo Pedido</h2>
          <div className="field">
            <label>Empresa Selecionada</label>
            <div className="selected-company">
              {selectedCompany ? selectedCompany.name : 'Clique em uma empresa ao lado'}
            </div>
          </div>

          <div className="field">
            <label htmlFor="qty">Quantidade de Marmitas</label>
            <input
              type="number"
              id="qty"
              min="0"
              placeholder="Ex: 10"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
            />
          </div>

          <div className="field">
            <label>Cardápio do Dia</label>
            <div className="menu-list">
              {menuItems.map((item) => (
                <label key={item.id} className="menu-item">
                  <input
                    type="checkbox"
                    value={item.name}
                    checked={selectedItems.includes(item.name)}
                    onChange={(event) => toggleMenuItem(item.name, event.target.checked)}
                  />
                  <span className="menu-name">{item.name}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Qtd"
                    className="menu-qty-input"
                    value={itemQuantities[item.name] || ''}
                    onChange={(event) => updateItemQuantity(item.name, event.target.value)}
                    disabled={!selectedItems.includes(item.name)}
                  />
                  <input
                    type="text"
                    placeholder="Obs/Nome"
                    className="menu-note-input"
                    value={itemNotes[item.name] || ''}
                    onChange={(event) => updateItemNote(item.name, event.target.value)}
                    disabled={!selectedItems.includes(item.name)}
                  />
                  <button
                    type="button"
                    className="menu-delete"
                    onClick={() => deleteMenuItem(item.id, item.name)}
                  >
                    x
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="address">Endereço (opcional)</label>
            <input
              type="text"
              id="address"
              placeholder="Rua, nº, bairro"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              rows="3"
              placeholder="Ex: sem salada, sem cebola..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
          <div className="actions">
            <button className="btn btn-success" onClick={saveOrder}>
              Salvar Pedido
            </button>
            <button className="btn btn-dark" onClick={buildTickets}>
              Imprimir Pedido 40x60mm
            </button>
          </div>
          <p className="helper">
            Separacao dos itens: <strong>{splitTotal}</strong> / <strong>{qtyValue}</strong>
          </p>
        </div>

        <div className="stack">
          <div className="card card-compact card-menu-add">
            <h2>Adicionar Itens do Cardápio</h2>
            <div className="menu-add">
              <input
                type="text"
                value={menuInput}
                onChange={(event) => setMenuInput(event.target.value)}
                placeholder="Digite um item e pressione Enter"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addMenuItem()
                  }
                }}
              />
              <button className="btn btn-outline" onClick={addMenuItem}>
                Adicionar
              </button>
            </div>
            <p className="helper"></p>
          </div>

          <div className="card card-compact card-company-add">
            <h2>Cadastrar Empresa</h2>
            <form onSubmit={addCompany}>
              <div className="field">
                <label htmlFor="newCompany">Nome Fantasia</label>
                <input type="text" id="newCompany" name="newCompany" placeholder="Ex: Mercantil Central" required />
              </div>
              <div className="field">
                <label htmlFor="newPhone">Telefone</label>
                <input type="text" id="newPhone" name="newPhone" placeholder="(85) 0000-0000" />
              </div>
              <button className="btn btn-outline" type="submit">
                Adicionar Empresa
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="summary card">
        <h3>Resumo do Pedido</h3>
        <div className="summary-grid">
          <div>
            <strong>Empresa:</strong> <span>{selectedCompany ? selectedCompany.name : '-'}</span>
          </div>
          <div>
            <strong>Qtd Marmitas:</strong> <span>{qty || '-'}</span>
          </div>
          <div>
            <strong>Endereço:</strong> <span>{address || '-'}</span>
          </div>
          <div>
            <strong>Observação:</strong> <span>{notes || '-'}</span>
          </div>
        </div>
        <div className="summary-items">
          <strong>Itens selecionados:</strong>
          <ul>
            {selectedItems.length === 0 ? (
              <li>Nenhum item selecionado</li>
            ) : (
              selectedItems.map((item) => (
                <li key={item}>
                  {item}: {itemQuantities[item] || 0}
                  {itemNotes[item] ? ` (${itemNotes[item]})` : ''}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </>
  )
}
