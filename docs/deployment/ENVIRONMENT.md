# TECHA 2.0 — Production Environment Reference Guide

This document provides the authoritative inventory and reference for all environment variables used across the TECHA 2.0 monorepo.

---

## 1. Quick Start

1. Copy the canonical template from repository root:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the required values (especially `MONGODB_URI`).
3. Build the monorepo:
   ```bash
   npm run build:all
   ```
4. Start both applications under PM2:
   ```bash
   npm run pm2:start
   ```

---

## 2. Complete Environment Variable Inventory

| Variable Name | Consumer | Classification | Timing | Exposure | Default Value | Description & Constraints |
|:---|:---|:---:|:---:|:---:|:---|:---|
| `NODE_ENV` | Frontend, Backend, PM2 | Required | Build & Runtime | Private | `production` | Execution mode (`production`, `development`, `test`). In production, strict validation and MongoDB checks are enforced. |
| `PORT` | Frontend (Next.js) | Optional | Runtime | Private | `3000` | Internal TCP port where Next.js listens. Kept private on loopback (`127.0.0.1`) behind IIS. |
| `HOST` | Frontend (Next.js) | Optional | Runtime | Private | `127.0.0.1` | Network interface binding for Next.js server. |
| `TECHA_API_BASE_URL` | Frontend (Server SSR) | Optional | Runtime | Private | `http://127.0.0.1:5000/api/v1/public` | Internal loopback URL used by Next.js Server Components to fetch public data directly from Express. |
| `API_PORT` | Backend (Express 5) | Optional | Runtime | Private | `5000` | Internal TCP port where Express listens. Kept private on loopback (`127.0.0.1`) behind IIS. |
| `API_HOST` | Backend (Express 5) | Optional | Runtime | Private | `127.0.0.1` | Network interface binding for Express server. |
| `MONGODB_URI` | Backend (Mongoose 9) | **Strictly Required in Production** | Runtime | **Secret** | None (Template placeholder) | MongoDB Atlas connection string with replica set and database name. Never exposed to browser or logs. |
| `CANONICAL_API_URL` | Backend (OpenAPI/Swagger) | Optional | Runtime | Public | `https://techa.ir` | Public HTTPS domain used in generated OpenAPI 3.1 server list. Never use internal loopback IPs here. |
| `SWAGGER_ENABLED` | Backend (Express 5) | Optional | Runtime | Private | `true` | Boolean flag to enable or disable `/api-docs` and `/api-docs.json`. |
| `PRODUCTION_DOMAIN` | Operational / Scripts | Optional | Runtime | Public | `techa.ir` | The primary production domain used for server configuration and diagnostics. |
| `PRODUCTION_IP` | Operational / Scripts | Optional | Runtime | Public | `62.220.123.21` | The static public IPv4 address of the Windows Server 2025 host. |
| `CORS_ORIGINS` | Backend (CORS middleware) | Optional | Runtime | Private | `https://techa.ir,https://www.techa.ir` | Comma-separated list of allowed browser origins. |
| `FRONTEND_ORIGIN` | Backend (Security) | Optional | Runtime | Private | `https://techa.ir` | Primary frontend origin for cross-origin and reverse-proxy validation. |
| `TRUST_PROXY_HOPS` | Backend (Express) | Optional | Runtime | Private | `1` | Number of trusted reverse proxy hops (1 behind IIS on loopback). |
| `LOG_LEVEL` | Backend (Pino logger) | Optional | Runtime | Private | `info` | Minimum log severity level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`). |

---

## 3. Security Rules & Restrictions

1. **Zero Browser Secret Leaks:**
   - Never prefix database credentials or backend secrets with `NEXT_PUBLIC_`.
   - Never create `NEXT_PUBLIC_MONGODB_URI`.
2. **Sanitized Error Reporting:**
   - The Zod 4 environment validator (`backend/src/core/config/env.ts`) fails fast on missing or malformed variables but sanitizes issue objects to ensure raw values or connection strings are never written to stderr or log outputs.
3. **No Wildcard Credentialed CORS:**
   - `credentials: false` is configured on the public read-only API. No wildcard origins (`*`) are accepted in combination with credentials.
4. **Git Protection:**
   - `.env`, `.env.local`, `.env.*.local` are explicitly ignored in `.gitignore`. Real credentials must never be committed.
