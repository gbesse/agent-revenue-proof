# Agent Revenue Proof

[Français](README.md) · [English](README.en.md) · Español

Extensión MCP de solo lectura que relaciona costes de ejecuciones de agentes, prospectos, presupuestos y facturas pagadas mediante **identificadores explícitos**. El informe separa importes pagados relacionados y costes de agentes; no calcula un ROI causal ni afirma que un agente provocara una venta. Señala cadenas rotas e importes incoherentes.

## Probar

```sh
npm test
node src/cli.js reconcile fixtures/data.json
node src/cli.js serve fixtures/data.json
```

Añade el último comando como servidor MCP stdio en OpenClaw o Hermes. `skills/revenue` ofrece instrucciones FR/EN/ES. El conjunto JSON contiene `currency` y las listas `runs` (`id`, `workflow`, `cost_cents`), `leads` (`id`), `quotes` (`id`, `lead_id`, `run_id`, `total_cents`) e `invoices` (`id`, `quote_id`, `status`, `paid_cents`). Los céntimos son enteros; solo las facturas `paid` con cadena válida entran en el total relacionado.

Los datos de ejemplo son ficticios. No hay adaptadores activos para Muse, incwo o Bruno; sus exportaciones deben normalizarse según este contrato. No incluyas nombres de clientes en los datos del informe. Node.js 22+, MIT.

Contexto: [Muse for Small Business](https://about.fb.com/news/2026/09/introducing-muse-small-business/), [ciclo de ventas MCP de incwo](https://go.incwo.com/agents/mcp/ventes/), [costes de Bruno](https://get-bruno.com/fr/tech).

El paquete incluye `plugin.json` y `mcp.json` en formato Agent Plugins. Para una instalación local compatible, coloca en `${PLUGIN_DATA}` el archivo esperado por `mcp.json` y todos los archivos que referencia; después sustituye los datos ficticios por tus datos privados. La publicación en el directorio público de ChatGPT exige un servidor MCP HTTPS alojado; esta versión stdio local no se ha enviado. OCE y Muse no se han probado.
