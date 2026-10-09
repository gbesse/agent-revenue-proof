#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { reconcile } from "./core.js";
const msg = {
  fr: {
    usage: "Usage : agent-revenue-proof reconcile|serve données.json",
    error: "Échec du rapprochement",
  },
  en: {
    usage: "Usage: agent-revenue-proof reconcile|serve data.json",
    error: "Reconciliation failed",
  },
  es: {
    usage: "Uso: agent-revenue-proof reconcile|serve datos.json",
    error: "Error de conciliación",
  },
};
const lang = ["fr", "en", "es"].includes(process.env.LANG?.slice(0, 2))
  ? process.env.LANG.slice(0, 2)
  : "en";
const [mode, path] = process.argv.slice(2);
if (!["reconcile", "serve"].includes(mode) || !path) {
  process.stderr.write(msg[lang].usage + "\n");
  process.exit(2);
}
async function run() {
  return reconcile(JSON.parse(await readFile(resolve(path), "utf8")));
}
try {
  if (mode === "reconcile")
    process.stdout.write(JSON.stringify(await run(), null, 2) + "\n");
  else
    for await (const line of createInterface({ input: process.stdin })) {
      let req;
      try {
        req = JSON.parse(line);
      } catch {
        continue;
      }
      if (req.id === undefined) continue;
      try {
        let result;
        if (req.method === "initialize")
          result = {
            protocolVersion: "2025-06-18",
            capabilities: { tools: {} },
            serverInfo: { name: "agent-revenue-proof", version: "0.1.0" },
          };
        else if (req.method === "tools/list")
          result = {
            tools: [
              {
                name: "reconcile_revenue",
                description:
                  "Rapprocher coûts et factures payées / Reconcile costs and paid invoices / Conciliar costes y facturas pagadas",
                inputSchema: { type: "object", properties: {} },
                annotations: {
                  readOnlyHint: true,
                  destructiveHint: false,
                  openWorldHint: false,
                },
              },
            ],
          };
        else if (
          req.method === "tools/call" &&
          req.params?.name === "reconcile_revenue"
        )
          result = {
            content: [{ type: "text", text: JSON.stringify(await run()) }],
          };
        else throw new Error("unknown_method");
        process.stdout.write(
          JSON.stringify({ jsonrpc: "2.0", id: req.id, result }) + "\n",
        );
      } catch (e) {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: "2.0",
            id: req.id,
            error: { code: -32000, message: e.message },
          }) + "\n",
        );
      }
    }
} catch (e) {
  process.stderr.write(`${msg[lang].error}: ${e.message}\n`);
  process.exit(2);
}
