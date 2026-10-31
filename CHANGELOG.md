# Changelog

## 0.2.1 — 2026-10-31

- Hide irrelevant low-price controls on US/CA/MX; limit AU to automatic/no-discount choices.
- Explain UK/EU price thresholds using API marketplace metadata.
- Keep comparison eligibility independent for each marketplace.
- Preserve the v1 API contract and reviewed rate snapshot; 52 application tests pass.

## 0.2.0 — 2026-10-31

- Initial standalone open-source release of the completed calculator and infra.
- Custom packages across14 marketplaces, single/batch HTTP API and OpenAPI3.1.
- Responsive Chinese web calculator, native-currency comparison and CSV export.
- Versioned official rate snapshot2026-10-31.1 with explicit quote_required results.
- Linux systemd/Nginx deployment, readiness, logs, rate limits and rollback.
- Monitoring infra0.1.0:12 official sources, evidence/diffs, candidate drafts,
  independent reference samples and administrator-controlled review/publishing.
- No automatic fee replacement; monitoring scheduling is opt-in.
