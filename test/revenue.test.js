import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { reconcile } from "../src/core.js";
const fixture = JSON.parse(await readFile("fixtures/data.json"));
test("counts only exact paid invoice chain", () => {
  const r = reconcile(fixture);
  assert.equal(r.totals.agent_cost_cents, 75);
  assert.equal(r.totals.linked_paid_cents, 12500);
  assert.equal(r.totals.paid_invoices, 1);
  assert.equal(r.runs[1].linked_paid_cents, 0);
});
test("rejects overpayment and broken chain", () => {
  const d = structuredClone(fixture);
  d.invoices[0].paid_cents = 20000;
  d.invoices.push({
    id: "invoice-3",
    quote_id: "missing",
    status: "paid",
    paid_cents: 100,
  });
  const r = reconcile(d);
  assert.equal(r.totals.linked_paid_cents, 0);
  assert.ok(r.issues.some((x) => x.type === "paid_exceeds_quote"));
  assert.ok(r.issues.some((x) => x.type === "orphan_invoice_quote"));
});
test("rejects duplicate IDs and negative costs", () => {
  const d = structuredClone(fixture);
  d.runs.push({ ...d.runs[0] });
  assert.throws(() => reconcile(d));
  d.runs.pop();
  d.runs[0].cost_cents = -1;
  assert.throws(() => reconcile(d));
});

test("does not double count paid invoices beyond one quote", () => {
  const d = structuredClone(fixture);
  d.invoices.push({
    id: "invoice-3",
    quote_id: "quote-1",
    status: "paid",
    paid_cents: 100,
  });
  const r = reconcile(d);
  assert.equal(r.totals.linked_paid_cents, 12500);
  assert.ok(r.issues.some((x) => x.type === "paid_exceeds_quote"));
});
