# FLOW · ASCEN

Protótipo funcional de automação visual em português europeu, desenvolvido como demonstração de portefólio da ASCEN.

## Executar

Requer Node.js 20.9+ e npm.

```sh
npm install
npm run dev
```

Abra http://localhost:3000. Para produção: `npm run build` e `npm start`.

## Verificação

```sh
npm run typecheck
npm test
npm run build
```

## Funcionalidades

- Dashboard com métricas calculadas a partir das simulações locais.
- Editor XYFlow com drag-and-drop, ligações, edição e remoção de etapas.
- Gatilho, ação, condição, espera virtual e notificação.
- Validação de ciclos, entradas, saídas, ramos incompletos, etapas isoladas e configurações inválidas.
- Simulação passo a passo, execução automática, pausa, reinício e falhas de teste.
- Condições avaliam os dados JSON e executam apenas o ramo correspondente.
- CRUD de workflows, pesquisa e filtros; quatro modelos.
- Registos exportáveis em JSON e análises derivadas dos resultados.
- Zustand com persistência em localStorage; últimas 200 execuções.

## Segurança e limites

Todas as ações são simuladas no navegador. Não existem chamadas a serviços de email, contas externas ou APIs de automação. As esperas são virtuais, exibidas de forma acelerada. Não introduza dados pessoais reais nos dados de teste. Não existe autenticação nem sincronização entre dispositivos. Limpar os dados do navegador remove os workflows e registos locais. Cada etapa aceita uma entrada e cada saída uma ligação; ciclos e junções não são permitidos nesta versão.

Os workflows são guardados explicitamente pelo botão Guardar; as simulações completas são guardadas automaticamente. Os três workflows iniciais são modelos, sem execuções ou métricas fictícias.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, XYFlow, Zustand e Lucide.

## Publicação

Importe este repositório na Vercel. O framework Next.js é detetado automaticamente; não são necessárias variáveis de ambiente ou serviços externos.
