# Setup and implementation notes

## Data Tables

The [column map](data-tables.json) is derived from the workflow's own column schemas. Use these table bindings:

| Binding | Table | Purpose |
| --- | --- | --- |
| `YOUR_DATA_TABLE_1` | `northstar_polic` | Seed/activate policies; the reader finds this table by name |
| `YOUR_DATA_TABLE_2` | `northstar_decisions` | Save decisions and load overrides |
| `YOUR_DATA_TABLE_3` | A candidate table of your choosing | Save/load pending candidates and update approval status |

Columns containing lists/objects, including categories, requirements, evidence, and matched policy IDs, are JSON encoded strings. Keep numeric policy thresholds as strings because the policy builder treats an empty string as unset. Use a boolean for `was_overridden`, a number for `system_confidence`, and a date-compatible column for `created_at` (the mapping calls this `dateTime`).

The disconnected table helpers create policy/history tables but not the candidate table. The policy helper includes a `packaging` column; the current matcher does not consume it. Review helper schemas before running them. **Prepare Policy Import** connects to **Insert Policies** but has no trigger connection; execute the preparation node manually and then its insert branch in the isolated instance. Do not repeatedly insert the seed into the same table.

## Policy and guardrail boundaries

The embedded seed and hard-rule code disagree about several policy IDs. For example, the hard-rule node uses POL-002 for hygiene and POL-003 for high-value scrap review, while the seed names those IDs as unknown-condition and unclear-condition escalation. The export preserves this inconsistency; align policy IDs and enforced semantics before relying on audit records.

Most policy rows, including rows labeled HARD, feed policy matching and AI context. Only the explicitly coded conditions in Evaluate Hard Rules are enforced independently of AI. Learned policies are recognized by `group: LEARNED` in the active policy table; the runtime does not separately authenticate their provenance.

Guardrail order is: parse failure fallback, learned policy, forced hard action, mandatory hard review, allowed-action validation. A matching learned/hard rule can supersede the initial AI parse-failure fallback. The AI call still happens even when a hard rule has already determined a restriction.

There is no confidence threshold, full AI response JSON-schema validator, or general network-error recovery. Missing message content throws. Model confidence is retained only for AI recommendations. Human overrides are recorded without another hard-rule pass.

## Approval-loop limits

The analysis groups overrides after deduplicating by return ID. This prevents repeated rows for one return from reaching the three-distinct-return threshold. It does not make inserts, policy activation, or candidate creation idempotent. Repeated analysis runs can create repeated proposals; timestamp-based candidate IDs are not a concurrency-safe uniqueness scheme.

The manager form accepts APPROVE/REJECT and loads one PENDING candidate. It has no candidate identifier field, no evidence display, and no role/authentication configuration. APPROVE activates that loaded candidate; REJECT has no connected persistence path and leaves it pending. Approval and status update are separate writes, so partial failure can leave state inconsistent.

For an isolated demonstration, inspect the pending table manually and ensure only the intended candidate is pending before submitting the form. Before operational use, add explicit candidate selection, evidence display, authenticated reviewer identity, rejection persistence, idempotency, and atomic or recoverable activation.

## Other boundaries

Unknown SKU produces `product_found:false`, but the false branch is unconnected. Policies use an embedded catalog and seed rather than a live inventory integration. The final history is structured decision metadata, not a complete immutable event log. There are no automatic refunds or inventory writes.

## Local verification

`node tests/smoke.mjs` executes selected exported Code nodes using synthetic inputs and a fixed clock. It checks mandatory review, invalid actions, malformed/missing AI content, learned/hard-rule precedence, unique-return counting, pending candidate creation, and unknown SKU handling. Generated examples are deterministic rule outputs; no AI endpoint is called. Forms, Data Tables, permissions, activation writes, and full n8n execution require separate integration testing.
