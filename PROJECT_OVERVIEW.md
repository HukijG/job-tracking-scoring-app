# Job Tracking and Scoring System - Project Overview

## Purpose
Internal web application for a recruitment agency to track and prioritize open jobs based on quality metrics and team consensus. Solves the problem of spreading resources across too many low-quality opportunities by implementing a systematic ranking system.

## Users
4 internal team members:
- Account Manager
- Sales Person
- CEO
- (4th team member role TBD)

## Core Problem
The team gets on many jobs but lacks systematic attention to which jobs are actually worth the time investment or become difficult to fill. This leads to resource inefficiency and missed opportunities on high-value placements.

## Solution
A dashboard-based web application that:
1. Displays all actively sourced jobs with key metrics
2. Allows team members to individually score jobs on multiple factors
3. Calculates weighted composite scores to rank jobs A, B, or C
4. Tracks historical scoring data even after jobs close
5. Provides visibility into candidate pipeline health and client engagement

## Tech Stack

### Frontend
- Cloudflare Pages (deployment)
- SvelteKit (chosen for lightweight, excellent DX, good for dashboards)

### Backend
- Cloudflare Workers (serverless functions)
- Cloudflare Workers + Hono/itty-router (API routing)

### Database
- Supabase (PostgreSQL)
  - Stores job rankings and scoring history
  - Persists individual scorer inputs for audit trail
  - Acts as supplementary data store (Recruiterflow is source of truth for job data)

### External Integration
- Recruiterflow CRM (primary data source)
  - API integration for job data
  - Webhook listeners for real-time updates
  - Custom fields for linking scoring data

## Key Principle
**Recruiterflow is the source of truth for job data.** The scoring system supplements this with ranking intelligence but never replaces core job information.
