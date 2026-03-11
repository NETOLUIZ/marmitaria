import { homeCategories } from '../data/homeFeaturedMeals'

export default function PedidosPage({
  menuItems,
  deleteMenuItem,
  menuForm,
  setMenuForm,
  menuFormMessage,
  addMenuItem,
  homePromo,
  setHomePromo,
  homePromoMessage,
  saveHomePromo,
  addCompany
}) {
  function handleMenuFormChange(event) {
    const { name, value } = event.target
    setMenuForm((current) => ({ ...current, [name]: value }))
  }

  function handleHomePromoChange(event) {
    const { name, value } = event.target
    setHomePromo((current) => ({ ...current, [name]: value }))
  }

  return (
    <section className="catalog-admin-page">
      <div className="catalog-admin-hero">
        <div>
          <span className="catalog-admin-kicker">Painel de cardapio</span>
          <h1>Monte pratos com cara de vitrine, nao de planilha</h1>
          <p>
            Cadastre os itens do cardapio com nome, categoria, preco, descricao e foto em uma
            tela mais direta para operacao diaria.
          </p>
        </div>
        <div className="catalog-admin-stats">
          <div className="catalog-stat">
            <strong>{menuItems.length}</strong>
            <span>itens cadastrados</span>
          </div>
          <div className="catalog-stat">
            <strong>{menuItems.filter((item) => item.image_url).length}</strong>
            <span>com foto</span>
          </div>
        </div>
      </div>

      <div className="catalog-admin-grid">
        <div className="catalog-builder card">
          <div className="catalog-section-head">
            <div>
              <span className="catalog-badge">Criacao</span>
              <h2>Novo card do cardapio</h2>
            </div>
            <p>Preencha os campos e deixe o prato pronto para aparecer de forma organizada.</p>
          </div>

          <form
            className="menu-add-form"
            onSubmit={(event) => {
              event.preventDefault()
              addMenuItem()
            }}
          >
            <div className="catalog-builder-grid">
              <div className="catalog-form-column">
                <div className="field">
                  <label htmlFor="menuName">Nome do prato</label>
                  <input
                    id="menuName"
                    name="name"
                    type="text"
                    value={menuForm.name}
                    onChange={handleMenuFormChange}
                    placeholder="Ex: Marmita de frango grelhado"
                    required
                  />
                </div>
                <div className="menu-add-grid">
                  <div className="field">
                    <label htmlFor="menuCategory">Categoria</label>
                    <input
                      id="menuCategory"
                      name="category"
                      type="text"
                      value={menuForm.category}
                      onChange={handleMenuFormChange}
                      placeholder="Ex: Fitness"
                    />
                    <div className="catalog-category-chips">
                      {homeCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className={`catalog-category-chip ${menuForm.category === category ? 'is-active' : ''}`}
                          onClick={() => setMenuForm((current) => ({ ...current, category }))}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="menuPrice">Preco</label>
                    <input
                      id="menuPrice"
                      name="price"
                      type="text"
                      inputMode="decimal"
                      value={menuForm.price}
                      onChange={handleMenuFormChange}
                      placeholder="Ex: 22,90"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="menuDescription">Descricao</label>
                  <textarea
                    id="menuDescription"
                    name="description"
                    rows="5"
                    value={menuForm.description}
                    onChange={handleMenuFormChange}
                    placeholder="Ex: arroz, feijao, frango e salada"
                  />
                </div>
                <div className="field">
                  <label htmlFor="menuImageUrl">Foto do prato</label>
                  <input
                    id="menuImageUrl"
                    name="imageUrl"
                    type="url"
                    value={menuForm.imageUrl}
                    onChange={handleMenuFormChange}
                    placeholder="https://site.com/foto-do-prato.jpg"
                  />
                </div>
              </div>

              <div className="catalog-preview-column">
                <div className="catalog-preview-card">
                  <span className="catalog-badge">Preview</span>
                  <div className="catalog-preview-media">
                    {menuForm.imageUrl ? (
                      <img src={menuForm.imageUrl} alt={menuForm.name || 'Preview do prato'} />
                    ) : (
                      <div className="catalog-preview-placeholder">Foto do prato</div>
                    )}
                  </div>
                  <div className="catalog-preview-body">
                    <div className="catalog-preview-topline">
                      <span>{menuForm.category || 'Categoria'}</span>
                      <strong>{menuForm.price ? `R$ ${menuForm.price}` : 'Preco'}</strong>
                    </div>
                    <h3>{menuForm.name || 'Nome do prato'}</h3>
                    <p>{menuForm.description || 'A descricao do prato aparecera aqui para facilitar a revisao.'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="catalog-form-footer">
              <button className="btn btn-dark catalog-submit" type="submit">
                Salvar Item no Cardapio
              </button>
              <p className="helper">{menuFormMessage || 'Os itens cadastrados ficam disponiveis na biblioteca ao lado.'}</p>
            </div>
          </form>
        </div>

        <div className="catalog-side">
          <div className="catalog-company card">
            <div className="catalog-section-head">
              <div>
                <span className="catalog-badge">Home Promo</span>
                <h2>Editar bloco de promocao</h2>
              </div>
              <p>Altere a div de promocao da tela inicial sem depender de backend.</p>
            </div>

            <form className="catalog-company-form" onSubmit={saveHomePromo}>
              <div className="field">
                <label htmlFor="promoKicker">Selo</label>
                <input id="promoKicker" name="promo_kicker" type="text" value={homePromo.promo_kicker} onChange={handleHomePromoChange} />
              </div>
              <div className="field">
                <label htmlFor="promoTitle">Titulo</label>
                <input id="promoTitle" name="promo_title" type="text" value={homePromo.promo_title} onChange={handleHomePromoChange} />
              </div>
              <div className="field">
                <label htmlFor="promoDescription">Descricao</label>
                <textarea id="promoDescription" name="promo_description" rows="3" value={homePromo.promo_description} onChange={handleHomePromoChange} />
              </div>
              <div className="field">
                <label htmlFor="promoCardTitle">Titulo do card</label>
                <input id="promoCardTitle" name="promo_card_title" type="text" value={homePromo.promo_card_title} onChange={handleHomePromoChange} />
              </div>
              <div className="field">
                <label htmlFor="promoCardDescription">Descricao do card</label>
                <textarea id="promoCardDescription" name="promo_card_description" rows="3" value={homePromo.promo_card_description} onChange={handleHomePromoChange} />
              </div>
              <div className="field">
                <label htmlFor="promoCardPrice">Preco</label>
                <input id="promoCardPrice" name="promo_card_price" type="text" value={homePromo.promo_card_price} onChange={handleHomePromoChange} />
              </div>
              <button className="btn btn-outline" type="submit">
                Salvar Promocao
              </button>
              <p className="helper">{homePromoMessage}</p>
            </form>
          </div>

          <div className="catalog-library card">
            <div className="catalog-section-head">
              <div>
                <span className="catalog-badge">Biblioteca</span>
                <h2>Itens cadastrados</h2>
              </div>
              <p>Remova rapidamente o que nao faz mais parte do cardapio.</p>
            </div>

            <div className="catalog-list">
              {menuItems.length === 0 ? (
                <div className="catalog-empty-state">
                  <strong>Nenhum prato cadastrado</strong>
                  <span>Crie o primeiro item do cardapio para começar.</span>
                </div>
              ) : (
                menuItems.map((item) => (
                  <article key={item.id} className="catalog-list-item">
                    <div className="catalog-list-media">
                      {item.image_url ? (
                        <img className="menu-thumb" src={item.image_url} alt={item.name} />
                      ) : (
                        <div className="catalog-list-placeholder">Sem foto</div>
                      )}
                    </div>
                    <div className="menu-main">
                      <span className="menu-name">{item.name}</span>
                      <span className="menu-meta">
                        {item.category || 'Sem categoria'}
                        {item.price !== null && item.price !== undefined && item.price !== ''
                          ? ` - R$ ${Number(item.price).toFixed(2).replace('.', ',')}`
                          : ''}
                      </span>
                      {item.description ? <span className="menu-description">{item.description}</span> : null}
                    </div>
                    <button
                      type="button"
                      className="menu-delete"
                      onClick={() => deleteMenuItem(item.id, item.name)}
                      aria-label={`Remover ${item.name}`}
                    >
                      x
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="catalog-company card">
            <div className="catalog-section-head">
              <div>
                <span className="catalog-badge">Cadastro</span>
                <h2>Nova empresa</h2>
              </div>
              <p>Deixe a base de clientes pronta para receber os pedidos da empresa.</p>
            </div>

            <form className="catalog-company-form" onSubmit={addCompany}>
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
      </div>
    </section>
  )
}
