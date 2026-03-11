import { useState } from 'react'
import { homeCategories, homeFeaturedMeals } from '../data/homeFeaturedMeals'

const WHATSAPP_NUMBER = (import.meta.env.VITE_ORDER_WHATSAPP_NUMBER || '').replace(/\D/g, '')

const categories = homeCategories

const featuredMeals = homeFeaturedMeals.map((meal) => ({
  ...meal,
  price: `R$ ${Number(meal.price).toFixed(2).replace('.', ',')}`
}))

const highlights = [
  { title: 'Entrega rapida', text: 'Saida agil para almocos do dia a dia sem complicacao.' },
  { title: 'Comida caseira', text: 'Receitas com tempero de casa e preparo caprichado.' },
  { title: 'Ingredientes frescos', text: 'Selecao diaria para manter sabor e qualidade.' },
  { title: 'Preco acessivel', text: 'Opcoes para diferentes bolsos sem perder qualidade.' },
  { title: 'Pedido no WhatsApp', text: 'Atendimento direto e simples para finalizar o pedido.' }
]

const testimonials = [
  {
    name: 'Mariana Souza',
    text: 'Chega quentinha, bem montada e com gosto de comida feita na hora.'
  },
  {
    name: 'Carlos Henrique',
    text: 'Pedi para a empresa toda e o processo ficou muito mais organizado.'
  },
  {
    name: 'Aline Costa',
    text: 'A fitness virou minha favorita. Boa quantidade e muito sabor.'
  }
]

const paymentOptions = {
  pix: {
    label: 'Pix',
    helper: 'Pague com QR Code ou chave copia e cola',
    note: 'Aprovacao rapida'
  },
  debito: {
    label: 'Cartao de Debito',
    helper: 'Pagamento direto no cartao na entrega',
    note: 'Na entrega'
  },
  credito: {
    label: 'Cartao de Credito',
    helper: 'Use seu cartao para finalizar o pedido',
    note: 'Credito'
  },
  dinheiro: {
    label: 'Dinheiro',
    helper: 'Leve troco se precisar',
    note: 'Troco opcional'
  }
}

const paymentLabels = Object.fromEntries(
  Object.entries(paymentOptions).map(([key, value]) => [key, value.label])
)

const PIX_QR_CODE_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <rect width="240" height="240" fill="#ffffff"/>
      <rect x="12" y="12" width="60" height="60" fill="#111111"/>
      <rect x="24" y="24" width="36" height="36" fill="#ffffff"/>
      <rect x="36" y="36" width="12" height="12" fill="#111111"/>
      <rect x="168" y="12" width="60" height="60" fill="#111111"/>
      <rect x="180" y="24" width="36" height="36" fill="#ffffff"/>
      <rect x="192" y="36" width="12" height="12" fill="#111111"/>
      <rect x="12" y="168" width="60" height="60" fill="#111111"/>
      <rect x="24" y="180" width="36" height="36" fill="#ffffff"/>
      <rect x="36" y="192" width="12" height="12" fill="#111111"/>
      <rect x="96" y="24" width="12" height="12" fill="#111111"/>
      <rect x="120" y="24" width="12" height="12" fill="#111111"/>
      <rect x="144" y="24" width="12" height="12" fill="#111111"/>
      <rect x="84" y="48" width="12" height="12" fill="#111111"/>
      <rect x="108" y="48" width="12" height="12" fill="#111111"/>
      <rect x="132" y="48" width="12" height="12" fill="#111111"/>
      <rect x="96" y="72" width="12" height="12" fill="#111111"/>
      <rect x="120" y="72" width="12" height="12" fill="#111111"/>
      <rect x="144" y="72" width="12" height="12" fill="#111111"/>
      <rect x="84" y="96" width="12" height="12" fill="#111111"/>
      <rect x="108" y="96" width="12" height="12" fill="#111111"/>
      <rect x="132" y="96" width="12" height="12" fill="#111111"/>
      <rect x="156" y="96" width="12" height="12" fill="#111111"/>
      <rect x="180" y="96" width="12" height="12" fill="#111111"/>
      <rect x="204" y="96" width="12" height="12" fill="#111111"/>
      <rect x="24" y="108" width="12" height="12" fill="#111111"/>
      <rect x="48" y="108" width="12" height="12" fill="#111111"/>
      <rect x="72" y="108" width="12" height="12" fill="#111111"/>
      <rect x="96" y="120" width="12" height="12" fill="#111111"/>
      <rect x="120" y="120" width="12" height="12" fill="#111111"/>
      <rect x="144" y="120" width="12" height="12" fill="#111111"/>
      <rect x="168" y="120" width="12" height="12" fill="#111111"/>
      <rect x="192" y="120" width="12" height="12" fill="#111111"/>
      <rect x="24" y="132" width="12" height="12" fill="#111111"/>
      <rect x="48" y="132" width="12" height="12" fill="#111111"/>
      <rect x="72" y="132" width="12" height="12" fill="#111111"/>
      <rect x="96" y="144" width="12" height="12" fill="#111111"/>
      <rect x="120" y="144" width="12" height="12" fill="#111111"/>
      <rect x="144" y="144" width="12" height="12" fill="#111111"/>
      <rect x="168" y="144" width="12" height="12" fill="#111111"/>
      <rect x="192" y="144" width="12" height="12" fill="#111111"/>
      <rect x="84" y="168" width="12" height="12" fill="#111111"/>
      <rect x="108" y="168" width="12" height="12" fill="#111111"/>
      <rect x="132" y="168" width="12" height="12" fill="#111111"/>
      <rect x="156" y="168" width="12" height="12" fill="#111111"/>
      <rect x="180" y="168" width="12" height="12" fill="#111111"/>
      <rect x="204" y="168" width="12" height="12" fill="#111111"/>
      <rect x="84" y="192" width="12" height="12" fill="#111111"/>
      <rect x="120" y="192" width="12" height="12" fill="#111111"/>
      <rect x="144" y="192" width="12" height="12" fill="#111111"/>
      <rect x="168" y="192" width="12" height="12" fill="#111111"/>
      <rect x="204" y="192" width="12" height="12" fill="#111111"/>
      <rect x="96" y="216" width="12" height="12" fill="#111111"/>
      <rect x="120" y="216" width="12" height="12" fill="#111111"/>
      <rect x="156" y="216" width="12" height="12" fill="#111111"/>
      <rect x="180" y="216" width="12" height="12" fill="#111111"/>
    </svg>
  `)

export default function HomePage({ homePromo }) {
  const [quickOrder, setQuickOrder] = useState({
    open: false,
    step: 'details',
    item: null,
    quantity: 1,
    address: '',
    paymentMethod: 'pix',
    cashChangeFor: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  })

  function openQuickOrder(item) {
    setQuickOrder({
      open: true,
      step: 'details',
      item,
      quantity: 1,
      address: '',
      paymentMethod: 'pix',
      cashChangeFor: '',
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: ''
    })
  }

  function closeQuickOrder() {
    setQuickOrder((current) => ({ ...current, open: false }))
  }

  function updateQuickOrder(field, value) {
    setQuickOrder((current) => ({ ...current, [field]: value }))
  }

  function continueQuickOrder() {
    if (!quickOrder.item || !quickOrder.address.trim()) return
    if (quickOrder.paymentMethod === 'pix') {
      updateQuickOrder('step', 'pix')
      return
    }
    if (quickOrder.paymentMethod === 'debito' || quickOrder.paymentMethod === 'credito') {
      updateQuickOrder('step', 'card')
      return
    }
    updateQuickOrder('step', 'confirm')
  }

  function goBackQuickOrder() {
    if (quickOrder.step === 'details') {
      closeQuickOrder()
      return
    }
    updateQuickOrder('step', 'details')
  }

  function submitQuickOrder(event) {
    event.preventDefault()
    if (!quickOrder.item || !quickOrder.address.trim()) return
    if ((quickOrder.paymentMethod === 'debito' || quickOrder.paymentMethod === 'credito') && (!quickOrder.cardName.trim() || !quickOrder.cardNumber.trim() || !quickOrder.cardExpiry.trim() || !quickOrder.cardCvv.trim())) {
      return
    }

    const lines = [
      'NOVO PEDIDO PELO SITE',
      '------------------------------',
      `Item: ${quickOrder.item.name}`,
      `Quantidade: ${quickOrder.quantity}`,
      `Preco base: ${quickOrder.item.price}`,
      `Endereco: ${quickOrder.address}`,
      `Pagamento: ${paymentLabels[quickOrder.paymentMethod]}`
    ]

    if (quickOrder.paymentMethod === 'dinheiro' && quickOrder.cashChangeFor.trim()) {
      lines.push(`Troco para: ${quickOrder.cashChangeFor.trim()}`)
    }

    if (quickOrder.paymentMethod === 'pix') {
      lines.push('Pagamento Pix confirmado no QR Code.')
    }

    if (quickOrder.paymentMethod === 'debito' || quickOrder.paymentMethod === 'credito') {
      lines.push(`Titular do cartao: ${quickOrder.cardName}`)
      lines.push(`Cartao final: ${quickOrder.cardNumber.slice(-4)}`)
    }

    const link = WHATSAPP_NUMBER
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
      : `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`

    window.open(link, '_blank', 'noopener,noreferrer')
    closeQuickOrder()
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <a className="home-brand" href="/">
          <span className="home-brand-mark">RR</span>
          <span className="home-brand-text">
            <strong>Restaurante Ribeiro</strong>
            <small>Marmitas artesanais</small>
          </span>
        </a>

        <nav className="home-nav">
          <a href="#inicio">Inicio</a>
          <a href="#cardapio">Cardapio</a>
          <a href="#promocoes">Promocoes</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>

        <div className="home-header-actions">
          <a className="btn btn-outline" href="/dashboard">
            Admin
          </a>
          <a className="btn btn-outline" href="/pedido">
            Pedido Empresa
          </a>
        </div>
      </header>

      <main>
        <section className="home-hero" id="inicio">
          <div className="home-hero-copy">
            <span className="home-chip">Prato do dia com sabor de casa</span>
            <h1>Marmitas saborosas, feitas com carinho para o seu almoco</h1>
            <p>
              Cardapio variado, atendimento rapido e opcoes para empresa, rotina corrida e quem
              quer comer bem todos os dias.
            </p>

            <div className="home-hero-actions">
              <a className="btn btn-outline" href="https://wa.me/" target="_blank" rel="noreferrer">
                Pedir no WhatsApp
              </a>
            </div>

            <div className="home-hero-stats">
              <div>
                <strong>+250</strong>
                <span>pedidos por semana</span>
              </div>
              <div>
                <strong>6 categorias</strong>
                <span>para diferentes rotinas</span>
              </div>
              <div>
                <strong>Entrega agil</strong>
                <span>ideal para empresas</span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-hero-card">
              <span className="home-card-badge">Mais pedido hoje</span>
              <img
                src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80"
                alt="Marmita caseira pronta para entrega"
              />
              <div className="home-hero-card-body">
                <strong>Executiva com bife acebolado</strong>
                <p>Arroz, feijao, farofa crocante e salada.</p>
                <div className="home-hero-price-row">
                  <span>R$ 24,90</span>
                  <button type="button" className="home-link-button" onClick={() => openQuickOrder(featuredMeals[3])}>
                    Fazer pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section" id="cardapio">
          <div className="home-section-head">
            <div>
              <span className="home-chip">Categorias</span>
              <h2>Escolha sua linha favorita</h2>
            </div>
            <div className="home-search">
              <input type="text" placeholder="Buscar marmita" />
              <select defaultValue="todos">
                <option value="todos">Todas as faixas</option>
                <option value="ate20">Ate R$ 20</option>
                <option value="ate25">Ate R$ 25</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className="home-category-row">
            {categories.map((category) => (
              <button className="home-category-pill" type="button" key={category}>
                {category}
              </button>
            ))}
          </div>

          <div className="home-meal-grid">
            {featuredMeals.map((meal) => (
              <article className="home-meal-card" key={meal.name}>
                <div className="home-meal-image-wrap">
                  <img src={meal.image} alt={meal.name} />
                  <span className="home-meal-badge">{meal.badge}</span>
                </div>
                <div className="home-meal-body">
                  <h3>{meal.name}</h3>
                  <p>{meal.description}</p>
                  <div className="home-meal-footer">
                    <strong>{meal.price}</strong>
                    <button type="button" className="btn btn-success btn-sm" onClick={() => openQuickOrder(meal)}>
                      Fazer pedido
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-promo-section" id="promocoes">
          <div className="home-promo-copy">
            <span className="home-chip">{homePromo?.promo_kicker || 'Promocao do dia'}</span>
            <h2>{homePromo?.promo_title || 'Compre 2 marmitas e ganhe refrigerante'}</h2>
            <p>{homePromo?.promo_description || 'Combos pensados para equipe, familia ou quem quer economizar sem abrir mao de comer bem.'}</p>
          </div>
          <div className="home-promo-card">
            <strong>{homePromo?.promo_card_title || 'Combo Almoco Completo'}</strong>
            <p>{homePromo?.promo_card_description || '2 marmitas tradicionais + 1 refrigerante lata'}</p>
            <span>por {homePromo?.promo_card_price || 'R$ 36,90'}</span>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() =>
                openQuickOrder({
                  name: homePromo?.promo_card_title || 'Combo Almoco Completo',
                  description: homePromo?.promo_card_description || '2 marmitas tradicionais + 1 refrigerante lata',
                  price: homePromo?.promo_card_price || 'R$ 36,90',
                  badge: 'Promocao',
                  image: featuredMeals[0].image
                })
              }
            >
              Fazer pedido
            </button>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <div>
              <span className="home-chip">Diferenciais</span>
              <h2>Motivos para pedir com a gente</h2>
            </div>
          </div>

          <div className="home-feature-grid">
            {highlights.map((item) => (
              <article className="home-feature-card" key={item.title}>
                <div className="home-feature-icon" aria-hidden="true">
                  •
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-story-section" id="sobre">
          <div className="home-story-card">
            <span className="home-chip">Sobre a marmitaria</span>
            <h2>Qualidade, sabor e rotina mais pratica</h2>
            <p>
              O Restaurante Ribeiro prepara marmitas com foco em sabor caseiro, montagem caprichada
              e atendimento proximo. Nossa proposta e facilitar o almoco de clientes e empresas com
              uma experiencia simples, confiavel e gostosa.
            </p>
          </div>
          <div className="home-story-note">
            <strong>Feito para o dia a dia</strong>
            <p>
              Da marmita economica ao prato executivo, cada opcao foi pensada para unir praticidade
              e boa apresentacao.
            </p>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <div>
              <span className="home-chip">Depoimentos</span>
              <h2>Quem pede, recomenda</h2>
            </div>
          </div>

          <div className="home-testimonial-grid">
            {testimonials.map((item) => (
              <article className="home-testimonial-card" key={item.name}>
                <div className="home-stars">★★★★★</div>
                <p>{item.text}</p>
                <strong>{item.name}</strong>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="home-footer" id="contato">
        <div>
          <strong>Restaurante Ribeiro</strong>
          <p>Rua Exemplo, 123 - Centro</p>
          <p>Atendimento de segunda a sabado, das 10h as 14h</p>
        </div>
        <div>
          <strong>Contato</strong>
          <p>Telefone: (85) 99999-9999</p>
          <p>WhatsApp: (85) 99999-9999</p>
          <p>Instagram: @restauranteribeiro</p>
        </div>
        <div className="home-footer-map">
          <strong>Localizacao</strong>
          <div className="home-map-placeholder">Mapa da regiao</div>
        </div>
      </footer>

      <a className="home-whatsapp-float" href="https://wa.me/" target="_blank" rel="noreferrer">
        WhatsApp
      </a>

      {quickOrder.open && quickOrder.item ? (
        <div className="modal-backdrop" role="presentation" onClick={closeQuickOrder}>
          <div className="modal checkout-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>Finalizar pedido</h3>
            <form onSubmit={submitQuickOrder} className="client-checkout-form">
              <div className="quick-order-item">
                <div>
                  <strong>{quickOrder.item.name}</strong>
                  <small>{quickOrder.item.category || 'Prato do dia'}</small>
                </div>
                <span>{quickOrder.item.price}</span>
              </div>

                {quickOrder.step === 'details' ? (
                  <>
                    <div className="field">
                      <label htmlFor="quickOrderQty">Quantidade</label>
                      <input
                        id="quickOrderQty"
                        type="number"
                        min="1"
                        value={quickOrder.quantity}
                        onChange={(event) => updateQuickOrder('quantity', event.target.value)}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="quickOrderAddress">Endereco</label>
                      <input
                        id="quickOrderAddress"
                        type="text"
                        value={quickOrder.address}
                        onChange={(event) => updateQuickOrder('address', event.target.value)}
                        placeholder="Rua, numero, bairro e referencia"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Forma de pagamento</label>
                    <div className="client-payment-grid delivery-payment-grid">
                      {Object.entries(paymentOptions).map(([value, option]) => (
                        <label
                          key={value}
                          className={`client-payment-card ${quickOrder.paymentMethod === value ? 'is-selected' : ''}`}
                        >
                            <input
                              type="radio"
                              name="quickPaymentMethod"
                            value={value}
                            checked={quickOrder.paymentMethod === value}
                            onChange={(event) => updateQuickOrder('paymentMethod', event.target.value)}
                          />
                          <span className="client-payment-content">
                            <strong>{option.label}</strong>
                            <small>{option.helper}</small>
                          </span>
                          <span className="client-payment-note">{option.note}</span>
                        </label>
                      ))}
                    </div>
                    </div>

                    {quickOrder.paymentMethod === 'pix' ? (
                      <div className="quick-payment-panel quick-payment-inline">
                        <div className="quick-pix-code">
                          <img className="quick-pix-image" src={PIX_QR_CODE_SRC} alt="QR Code Pix" />
                        </div>
                        <div className="quick-payment-copy">
                          <strong>QR Code Pix</strong>
                          <span>Ao clicar em continuar, voce confirma que vai seguir com esse pagamento.</span>
                        </div>
                      </div>
                    ) : null}

                    {quickOrder.paymentMethod === 'dinheiro' ? (
                      <div className="field">
                        <label htmlFor="quickOrderChange">Troco para quanto?</label>
                        <input
                          id="quickOrderChange"
                          type="text"
                          inputMode="decimal"
                          value={quickOrder.cashChangeFor}
                          onChange={(event) => updateQuickOrder('cashChangeFor', event.target.value)}
                          placeholder="Ex: 50,00"
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}

                {quickOrder.step === 'pix' ? (
                  <div className="quick-payment-panel">
                    <div className="quick-pix-code">
                      <img className="quick-pix-image" src={PIX_QR_CODE_SRC} alt="QR Code Pix" />
                    </div>
                    <div className="quick-payment-copy">
                      <strong>Escaneie o QR Code Pix</strong>
                      <span>Chave copia e cola: pix@restauranteribeiro.com</span>
                    </div>
                  </div>
                ) : null}

                {quickOrder.step === 'card' ? (
                  <div className="quick-card-form">
                    <div className="field">
                      <label htmlFor="quickCardName">Nome no cartao</label>
                      <input
                        id="quickCardName"
                        type="text"
                        value={quickOrder.cardName}
                        onChange={(event) => updateQuickOrder('cardName', event.target.value)}
                        placeholder="Ex: Maria Oliveira"
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="quickCardNumber">Numero do cartao</label>
                      <input
                        id="quickCardNumber"
                        type="text"
                        inputMode="numeric"
                        value={quickOrder.cardNumber}
                        onChange={(event) => updateQuickOrder('cardNumber', event.target.value)}
                        placeholder="0000 0000 0000 0000"
                        required
                      />
                    </div>
                    <div className="quick-card-grid">
                      <div className="field">
                        <label htmlFor="quickCardExpiry">Validade</label>
                        <input
                          id="quickCardExpiry"
                          type="text"
                          value={quickOrder.cardExpiry}
                          onChange={(event) => updateQuickOrder('cardExpiry', event.target.value)}
                          placeholder="MM/AA"
                          required
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="quickCardCvv">CVV</label>
                        <input
                          id="quickCardCvv"
                          type="text"
                          inputMode="numeric"
                          value={quickOrder.cardCvv}
                          onChange={(event) => updateQuickOrder('cardCvv', event.target.value)}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="modal-actions">
                  <button className="btn btn-outline" type="button" onClick={goBackQuickOrder}>
                    {quickOrder.step === 'details' ? 'Fechar' : 'Voltar'}
                  </button>
                  {quickOrder.step === 'details' ? (
                    <button className="btn btn-success" type="button" onClick={continueQuickOrder}>
                      {quickOrder.paymentMethod === 'pix'
                        ? 'Ir para QR Code'
                        : quickOrder.paymentMethod === 'debito' || quickOrder.paymentMethod === 'credito'
                          ? 'Ir para Cartao'
                          : 'Continuar'}
                    </button>
                  ) : quickOrder.step === 'pix' ? (
                    <button className="btn btn-success" type="submit">
                      Ja paguei no Pix
                    </button>
                  ) : (
                    <button className="btn btn-success" type="submit">
                      Finalizar pedido
                    </button>
                  )}
                </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
