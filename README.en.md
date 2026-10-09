# Agent Revenue Proof

[Français](README.md) · English · [Español](README.es.md)

A read-only MCP extension that joins agent run costs, leads, quotes, and paid invoices through **explicit identifiers**. Its report keeps linked paid amounts separate from agent costs; it does not calculate causal ROI or claim an agent caused a sale. Broken chains and inconsistent amounts are flagged.

## Try it

```sh
npm test
node src/cli.js reconcile fixtures/data.json
node src/cli.js serve fixtures/data.json
```

Add the last command as a stdio MCP server in OpenClaw or Hermes. `skills/revenue` provides FR/EN/ES instructions. The JSON dataset has `currency` and arrays `runs` (`id`, `workflow`, `cost_cents`), `leads` (`id`), `quotes` (`id`, `lead_id`, `run_id`, `total_cents`), and `invoices` (`id`, `quote_id`, `status`, `paid_cents`). Cents are integers; only `paid` invoices with a valid evidence chain enter the linked total.

The fixture is synthetic. No live Muse, incwo, or Bruno adapter is included; exports from these systems must be normalized into this contract. Keep customer names out of report data. Node.js 22+, MIT.

Context: [Muse for Small Business](https://about.fb.com/news/2026/09/introducing-muse-small-business/), [incwo MCP sales cycle](https://go.incwo.com/agents/mcp/ventes/), [Bruno costs](https://get-bruno.com/fr/tech).

The package includes Agent Plugins `plugin.json` and `mcp.json`. For a compatible local installation, place the file expected by `mcp.json` and every file it references in `${PLUGIN_DATA}`, then replace synthetic data with your private data. Public ChatGPT directory submission requires a hosted HTTPS MCP server; this local stdio version has not been submitted. OCE and Muse have not been tested.
