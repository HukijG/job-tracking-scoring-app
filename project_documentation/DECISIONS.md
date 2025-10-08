# Decision Log

This document tracks all key technical and product decisions made during development.

## Format
Each decision includes:
- **Date**: When decision was made
- **Decision**: What was decided
- **Context**: Why this decision was needed
- **Rationale**: Why this option was chosen
- **Alternatives Considered**: What else was evaluated
- **Status**: Decided / Implemented / Revisited

---

## Decisions

### 2025-10-07: Frontend Framework

**Decision**: Use SvelteKit for frontend

**Context**: Need to choose a modern web framework for dashboard application with 4 users

**Rationale**:
- Lightweight and fast performance
- Excellent developer experience
- Well-suited for dashboard/data-heavy applications
- Built-in routing and SSR capabilities
- Smaller bundle sizes compared to React/Vue

**Alternatives Considered**:
- React with Vite: More ecosystem, but heavier
- Vue 3 with Vite: Good middle ground, but team less familiar

**Status**: ✓ Decided

---

### 2025-10-07: Scoring Scale

**Decision**: Use 1-5 scale for all scoring factors

**Context**: Need to determine granularity of scoring system

**Rationale**:
- Simpler for users to understand and apply consistently
- Sufficient granularity for differentiation (5 levels)
- Less cognitive load than 1-10 scale
- Industry-standard for subjective assessments

**Alternatives Considered**:
- 1-10 scale: More granular but harder to apply consistently
- 1-3 scale: Too coarse, insufficient differentiation

**Status**: ✓ Decided (open to adjustment after user testing)

---

### 2025-10-07: Rank Assignment Method

**Decision**: Use fixed thresholds for A/B/C ranking

**Context**: Need to determine how composite scores translate to ranks

**Rationale**:
- Provides consistency across scoring periods
- Easier to understand and explain
- Thresholds (A≥4.0, B≥2.5, C<2.5) align with scoring scale
- Allows historical comparison

**Alternatives Considered**:
- Percentile-based (top 25% = A, etc.): Adapts to job pool but less consistent over time

**Status**: ✓ Decided (can migrate to percentile if needed)

---

### 2025-10-07: Fee Size Ranges

**Decision**: Use £10k-£50k range for fee scoring

**Context**: Need to calibrate fee size scoring factor

**Rationale**:
- Matches typical fee range for this recruitment agency
- Will be pulled directly from Recruiterflow data
- Scoring tiers: £40k+ (5), £30-40k (4), £20-30k (3), £10-20k (2), <£10k (1)

**Alternatives Considered**:
- Fixed fee brackets: Less flexible as business evolves

**Status**: ✓ Decided

---

### 2025-10-07: Factor Weights

**Decision**: Use equal 25% weighting as placeholder

**Context**: Need weights for composite score calculation, awaiting team discussion

**Rationale**:
- Equal weighting is neutral starting point
- Allows development to proceed while team decides
- Easily configurable via database/config file
- No bias toward any factor until team aligns

**Alternatives Considered**:
- Example weights (35% client, 30% fee, etc.): Would bias system before team input

**Status**: ⏳ Pending team discussion

---

### 2025-10-07: Git Branching Strategy

**Decision**: Feature branch workflow with descriptive naming

**Context**: Need standardized development process for solo developer working on features incrementally

**Rationale**:
- Isolates work on each feature/bug fix
- Easy to roll back or abandon experiments
- Clear naming convention (feature/, fix/, docs/, refactor/)
- Main branch stays clean and deployable

**Alternatives Considered**:
- Trunk-based development: Less structure for solo dev
- Gitflow: Too complex for small team

**Status**: ✓ Decided

---

## Pending Decisions

### Factor Weighting Percentages
**Status**: Awaiting team discussion
**Required By**: Phase 3 (Week 5)
**Options**:
- Revenue-focused: Client 30%, Fee 35%, Difficulty 20%, Time 15%
- Balanced: Equal 25% each
- Client-focused: Client 40%, Fee 25%, Difficulty 20%, Time 15%

### Authentication Method
**Status**: To be decided in Phase 2
**Required By**: Week 3
**Options**:
- Simple JWT with hardcoded users (4 users only)
- Supabase Auth with email/password
- Magic link authentication

### Real-time Update Strategy
**Status**: To be decided in Phase 4
**Required By**: Week 7
**Options**:
- Polling (every 30-60 seconds)
- Supabase Realtime subscriptions
- Server-sent events from Workers

---

## Decision Review Schedule

- **After MVP Launch** (Week 15): Review all "open to adjustment" decisions
- **After 1 Month Usage**: Review factor weights based on actual usage patterns
- **Quarterly**: Review architectural decisions for optimization opportunities
