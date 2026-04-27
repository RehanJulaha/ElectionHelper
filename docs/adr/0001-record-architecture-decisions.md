# ADR 0001: Record architecture decisions in-repo

## Status

Accepted

## Context

Hackathon and small-team delivery benefit from lightweight, versioned rationale next to the code.

## Decision

Maintain ADRs under `docs/adr/` with sequential numbering and a short index in `docs/adr/README.md`.

## Consequences

- Positive: onboarding and security reviews can cite stable links.
- Negative: ADRs can go stale; owners should update or supersede them when behavior changes.
