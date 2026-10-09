# Agent Revenue Proof

Français · [English](README.en.md) · [Español](README.es.md)

Extension MCP en lecture seule qui rapproche coûts des runs d'agents, prospects, devis et factures payées par **identifiants explicites**. Le rapport sépare montants facturés reliés et coûts d'agent ; il ne calcule pas de ROI causal et ne prétend pas qu'un agent a provoqué la vente. Les chaînes rompues et montants incohérents sont signalés.

## Essayer

```sh
npm test
node src/cli.js reconcile fixtures/data.json
node src/cli.js serve fixtures/data.json
```

Ajouter la dernière commande comme serveur MCP stdio à OpenClaw ou Hermes. `skills/revenue` fournit les consignes FR/EN/ES. Le jeu JSON contient `currency`, puis les tableaux `runs` (`id`, `workflow`, `cost_cents`), `leads` (`id`), `quotes` (`id`, `lead_id`, `run_id`, `total_cents`) et `invoices` (`id`, `quote_id`, `status`, `paid_cents`). Les cents sont des entiers ; seules les factures `paid` avec chaîne valide entrent dans le total relié.

La fixture est synthétique. Aucun adaptateur live Muse, incwo ou Bruno n'est inclus ; leurs exports doivent être normalisés dans ce contrat. Ne fournissez pas de noms de clients dans le fichier de rapport. Node.js 22+, MIT.

Contexte : [Muse for Small Business](https://about.fb.com/news/2026/09/introducing-muse-small-business/), [cycle de vente MCP incwo](https://go.incwo.com/agents/mcp/ventes/), [coûts Bruno](https://get-bruno.com/fr/tech).

Le paquet contient `plugin.json` et `mcp.json` au format Agent Plugins. Lors d’une installation locale compatible, placez dans `${PLUGIN_DATA}` le fichier attendu par `mcp.json` et tous les fichiers qu’il référence, puis remplacez les données fictives par vos données privées. La publication dans le répertoire public ChatGPT exige un MCP HTTPS hébergé : cette version stdio locale n’y est pas soumise. OCE et Muse ne sont pas testés.
