# Public export notes

This repository contains a sanitized portfolio snapshot. The original local exports and working files were left unchanged.

- Workflows are inactive and contain no pinned execution data.
- Credential attachments, original webhook/node/workflow/version/instance identifiers, and cached private resource URLs were removed or replaced. New node UUIDs identify this public export only. Semantic policy IDs and fixture identifiers remain where they are part of the rules.
- Private endpoints and external resource selectors use explicit placeholders where needed. Runtime expressions that refer to credentials/data are preserved without secret values.
- Screenshots are original project assets, cropped or redacted as described in the README. Architecture graphics are existing conceptual illustrations, not fabricated execution evidence. PNG metadata was removed and images were losslessly optimized.
- Sample input/output files are newly constructed synthetic examples. They contain no customer execution data or personal contact values.
- Original workflow connections and business-rule code are preserved. PAPERGUARD's policy-pack attribution is replaced with example metadata; NORTHSTAR's public workflow display name is standardized.
- No client-owned documents, raw exports, environment files, original seed customer records, or decision-history exports are included.

## Verification scope

The preparation checked JSON syntax, node connection references, JavaScript syntax, relative documentation links, original versus public workflow topology, and selected behavior using `node tests/smoke.mjs`. Text was scanned for secrets, personal email addresses, private URLs, original installation IDs, and sensitive literals from the source exports. Images were visually reviewed after cropping/redaction.

The checks did not run the complete workflows inside n8n or connect to external services. The source n8n application version was not recorded in the exports. Node type versions are preserved in the JSON; importing into a compatible instance must be verified locally.

No license is added because redistribution/licensing scope has not been established. Public availability alone does not grant an open-source license.
