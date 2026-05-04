## BelleCosméticos

Sistema profissional para gerenciamento completo de loja com PDV (caixa), estoque, financeiro e relatórios, utilizando backend com SQLite.

## Sobre o Projeto

O BelleCosméticos é um sistema moderno para controle de uma loja real, permitindo registrar vendas, controlar estoque automaticamente, acompanhar desempenho financeiro e gerar relatórios profissionais.

O sistema possui integração completa com backend, garantindo maior confiabilidade dos dados.

## Funcionalidades

# PDV (Caixa)
Registro de vendas em tempo real
Leitura por código de barras
Carrinho de compras
Múltiplas formas de pagamento
Finalização de venda automática
Limpeza do carrinho após venda
Redirecionamento automático para relatórios

# Financeiro

Registro de despesas
Controle de receitas
Cálculo automático de lucro
Ticket médio
Resumo financeiro em tempo real

# Estoque

Cadastro de produtos
Controle automático de quantidade
Baixa automática ao vender
Alerta de estoque baixo
Histórico de movimentações
Integração direta com vendas

# Dashboard

Indicadores (KPIs)
Produtos mais vendidos
Receita do dia
Ticket médio
Visão geral da loja

# Relatórios

Exportação em PDF profissional
Exportação em Excel
Filtro por período
Relatório com:
Vendas
Despesas
Lucro
Cabeçalho personalizado com dados da loja~

# Configurações

Cadastro de dados da loja:
Nome
CNPJ
Telefone
Endereço
E-mail
Utilizado automaticamente nos relatórios

## Tecnologias Utilizadas

# Frontend

React
Vite
Zustand
Tailwind CSS
Lucide Icons

# Backend
Node.js
Express
SQLite (better-sqlite3)
Relatórios
jsPDF
jspdf-autotable
XLSX

## Instalação
git clone https://github.com/seu-usuario/bellecosmeticos.git

# Frontend
npm install
npm run dev

# Backend

cd backend
npm install
npm run dev

## Endpoints da API

Produtos
GET /produtos
POST /produtos
PUT /produtos/:id
DELETE /produtos/:id
Vendas
GET /vendas
POST /vendas

## Build para produção

npm run build

## Gerar executável (.exe)

npm run dist 

## Estrutura do Projeto

src/
├── components/
├── pages/
│   ├── Dashboard.jsx
│   ├── Sales.jsx
│   ├── Inventory.jsx
│   ├── Reports.jsx
│   └── Settings.jsx
├── services/
│   └── api.js
├── store/
│   └── index.js
└── App.jsx

backend/
├── routes/
│   ├── produtos.routes.js
│   └── vendas.routes.js
├── database.js
└── server.js

## Diferenciais
Sistema completo com backend real
PDV estilo caixa profissional
Controle automático de estoque
Relatórios exportáveis
Interface moderna estilo SaaS

## Melhorias Futuras
Login e autenticação
Multiusuário
Backup automático
Impressão de cupom
Integração com pagamentos
Gráficos avançados

# Autor

Desenvolvido por Tiago Madeira

## Observação

O BelleCosméticos já está pronto para uso real em loja física e pode ser evoluído para:

Sistema comercial vendável
Aplicação desktop (Electron)
SaaS completo