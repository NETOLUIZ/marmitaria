# Marmitaria - Atendimento

Sistema de atendimento para marmitaria rodando somente no frontend, com dados salvos no navegador via `localStorage`.

Inclui:
- Cadastro de empresas
- Cadastro de cardapio
- Registro de pedidos
- Impressao de etiquetas 40x60mm
- Dashboard de vendas por dia
- Home com pedido rapido por modal
- Painel administrativo moderno

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar variaveis de ambiente

Crie o arquivo `.env.local` (ou copie de `.env.example`) com:

```env
VITE_ORDER_WHATSAPP_NUMBER=5585999999999
```

## 3. Rodar projeto

```bash
npm run dev
```

Abrir no navegador:

`http://localhost:5173`

## 4. Como os dados funcionam

- O projeto nao usa backend nem banco externo.
- Empresas, cardapio, pedidos e configuracoes ficam salvos no navegador.
- Ao abrir pela primeira vez, os dados demo sao carregados automaticamente.
- Para resetar os dados, basta limpar o `localStorage` do navegador.

## 5. Fluxo do projeto

### Fluxo do site

1. O cliente acessa a home.
2. Escolhe um prato no cardapio da vitrine.
3. Clica em `Fazer pedido`.
4. Abre uma modal com:
   - quantidade
   - endereco
   - forma de pagamento
5. Se escolher:
   - `Pix`: vai para a etapa do QR Code
   - `Cartao de debito` ou `Cartao de credito`: vai para a etapa dos dados do cartao
   - `Dinheiro`: pode informar troco
6. Ao finalizar, o sistema abre o WhatsApp com a mensagem do pedido pronta.

### Fluxo administrativo

1. O admin faz login no painel.
2. Em `Pedidos da Empresa`, pode:
   - cadastrar empresas
   - cadastrar itens do cardapio
   - editar o bloco promocional da home
3. Em `Painel`, acompanha os pedidos operacionais.
4. Em `Dashboard`, acompanha:
   - pedidos
   - faturamento
   - pagamentos
   - categorias
   - horarios de pico
   - desempenho geral

### Persistencia local

- O projeto usa uma camada local em `src/supabaseClient.js`.
- Essa camada simula um banco, mas salva tudo no navegador.
- Os dados demo sao carregados automaticamente no primeiro acesso.
