# Marmitaria - Atendimento

Sistema de atendimento para marmitaria com:
- Cadastro de empresas
- Cadastro de cardapio
- Registro de pedidos
- Impressao de etiquetas 40x60mm
- Dashboard de vendas por dia

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar variaveis de ambiente

Crie o arquivo `.env.local` (ou copie de `.env.example`) com:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

## 3. Criar banco no Supabase

No Supabase, abra `SQL Editor` e execute o script:

`database/schema.sql`

Esse script cria as tabelas:
- `companies`
- `menu_items`
- `orders`
- `order_items`

E tambem cria as politicas RLS para uso com a chave `anon`.

## 4. Rodar projeto

```bash
npm run dev
```

Abrir no navegador:

`http://localhost:5173`

## 5. Validar conexao com banco

1. Cadastre uma empresa
2. Cadastre um item de cardapio
3. Salve um pedido
4. Confira no Supabase em `Table Editor` se os dados entraram

