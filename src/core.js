function safeCents(n) {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error("invalid_cents");
  return n;
}
function index(records, name) {
  if (!Array.isArray(records)) throw new Error("invalid_" + name);
  const map = new Map();
  for (const row of records) {
    if (!row || typeof row.id !== "string" || !row.id || map.has(row.id))
      throw new Error("duplicate_or_missing_" + name + "_id");
    map.set(row.id, row);
  }
  return map;
}
export function reconcile(data) {
  if (
    !data ||
    typeof data.currency !== "string" ||
    !/^[A-Z]{3}$/.test(data.currency)
  )
    throw new Error("invalid_currency");
  const runs = index(data.runs, "runs"),
    leads = index(data.leads, "leads"),
    quotes = index(data.quotes, "quotes"),
    invoices = index(data.invoices, "invoices");
  const issues = [];
  const byRun = new Map();
  for (const run of runs.values()) {
    safeCents(run.cost_cents);
    byRun.set(run.id, {
      run_id: run.id,
      workflow: run.workflow || "unspecified",
      cost_cents: run.cost_cents,
      linked_paid_cents: 0,
      paid_invoices: 0,
      linked_quotes: 0,
    });
  }
  const validQuotes = new Set();
  for (const quote of quotes.values()) {
    safeCents(quote.total_cents);
    if (!leads.has(quote.lead_id)) {
      issues.push({ type: "orphan_quote_lead", id: quote.id });
      continue;
    }
    if (!runs.has(quote.run_id)) {
      issues.push({ type: "orphan_quote_run", id: quote.id });
      continue;
    }
    validQuotes.add(quote.id);
    byRun.get(quote.run_id).linked_quotes++;
  }
  const paidByQuote = new Map();
  for (const invoice of invoices.values()) {
    safeCents(invoice.paid_cents);
    if (!quotes.has(invoice.quote_id)) {
      issues.push({ type: "orphan_invoice_quote", id: invoice.id });
      continue;
    }
    if (!validQuotes.has(invoice.quote_id)) {
      issues.push({ type: "broken_evidence_chain", id: invoice.id });
      continue;
    }
    const quote = quotes.get(invoice.quote_id);
    if (invoice.status !== "paid") continue;
    const nextPaid = (paidByQuote.get(quote.id) || 0) + invoice.paid_cents;
    if (!Number.isSafeInteger(nextPaid) || nextPaid > quote.total_cents) {
      issues.push({ type: "paid_exceeds_quote", id: invoice.id });
      continue;
    }
    paidByQuote.set(quote.id, nextPaid);
    const record = byRun.get(quote.run_id);
    record.linked_paid_cents += invoice.paid_cents;
    record.paid_invoices++;
    if (!Number.isSafeInteger(record.linked_paid_cents))
      throw new Error("amount_overflow");
  }
  const rows = [...byRun.values()].sort((a, b) =>
    a.run_id.localeCompare(b.run_id),
  );
  const totals = {
    agent_cost_cents: rows.reduce((s, r) => s + r.cost_cents, 0),
    linked_paid_cents: rows.reduce((s, r) => s + r.linked_paid_cents, 0),
    paid_invoices: rows.reduce((s, r) => s + r.paid_invoices, 0),
  };
  if (
    !Number.isSafeInteger(totals.agent_cost_cents) ||
    !Number.isSafeInteger(totals.linked_paid_cents)
  )
    throw new Error("amount_overflow");
  return {
    currency: data.currency,
    totals,
    runs: rows,
    issues,
    meaning: "exact_links_only_no_causal_attribution",
  };
}
