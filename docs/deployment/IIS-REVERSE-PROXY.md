# TECHA 2.0 — Windows Server 2025 IIS Reverse Proxy Configuration Guide

This document details the configuration of Internet Information Services (IIS) 10 on Windows Server 2025 to act as the single secure entry point and reverse proxy for TECHA 2.0.

---

## 1. Network Topology

```
Internet (Clients / Browsers)
             │
             ▼ HTTPS (443) / HTTP (80)
   ┌──────────────────────────────────────────────┐
   │         Windows Server 2025 (IIS 10)         │
   │               Public IP: 62.220.123.21       │
   │               Domain: https://techa.ir       │
   └─────────────┬───────────────────┬────────────┘
                 │ (Reverse Proxy)   │ (Reverse Proxy)
                 │                   │
                 ▼                   ▼
    ┌──────────────────────┐ ┌──────────────────────┐
    │  Next.js 16 Frontend │ │  Express 5 Backend   │
    │  127.0.0.1:3000      │ │  127.0.0.1:5000      │
    │  - / (Home)          │ │  - /api/v1/public/*  │
    │  - /docs             │ │  - /api-docs (UI)    │
    │  - /docs/:slug       │ │  - /api-docs.json    │
    │  - /docs/:slug/:sub  │ │  - /backend          │
    └──────────────────────┘ └──────────────────────┘
```

---

## 2. Prerequisites on Windows Server 2025

1. **IIS URL Rewrite Module 2.1+:**
   Download and install the official Microsoft URL Rewrite module:
   https://www.iis.net/downloads/microsoft/url-rewrite
2. **Application Request Routing (ARR) 3.0+:**
   Download and install Microsoft ARR:
   https://www.iis.net/downloads/microsoft/application-request-routing
3. **Enable ARR Proxy Feature in IIS Manager:**
   - Open **IIS Manager** (`inetmgr`).
   - Click the root server node in the left pane.
   - Double-click **Application Request Routing Cache**.
   - In the right-hand **Actions** panel, click **Server Proxy Settings...**.
   - Check **Enable proxy**.
   - Keep default HTTP version (Pass through) and timeout settings.
   - Click **Apply**.

---

## 3. Public Route Mapping Table

| Incoming Client Request | Upstream Target | Purpose |
|:---|:---|:---|
| `http://techa.ir/*` | `https://techa.ir/*` | Automatic 301 Permanent Redirect to HTTPS |
| `https://techa.ir/api/v1/*` | `http://127.0.0.1:5000/api/v1/{R:1}` | Express REST APIs (Courses, Lessons, Health) |
| `https://techa.ir/api-docs` | `http://127.0.0.1:5000/api-docs` | Interactive Swagger UI Documentation |
| `https://techa.ir/api-docs/*` | `http://127.0.0.1:5000/api-docs/{R:1}` | Swagger UI static assets (CSS, JS, favicons) |
| `https://techa.ir/api-docs.json` | `http://127.0.0.1:5000/api-docs.json` | Raw OpenAPI 3.1 specification JSON |
| `https://techa.ir/backend` | `http://127.0.0.1:5000/` | Express Backend English Landing Page |
| `https://techa.ir/` | `http://127.0.0.1:3000/` | Next.js 16 Homepage (SSR) |
| `https://techa.ir/docs` | `http://127.0.0.1:3000/docs` | Next.js 16 Course Catalog (SSR) |
| `https://techa.ir/docs/*` | `http://127.0.0.1:3000/docs/{R:1}` | Next.js 16 Course & Lesson Reader (SSR) |
| `https://techa.ir/_next/*` | `http://127.0.0.1:3000/_next/{R:1}` | Next.js static scripts and CSS chunks |

---

## 4. Reusable `web.config` Deployment

Copy the provided template from `deploy/iis/web.config` directly to the website root directory in IIS (e.g., `C:\inetpub\wwwroot\techa` or your designated site directory).

The rules are strictly ordered so that API, Swagger, and backend requests are proxied to port 5000 first, preventing them from falling through to the Next.js frontend route guard.

---

## 5. SSL / TLS Certificate Binding

1. Bind the public SSL certificate to port 443 on the site:
   - Select site `techa.ir` in IIS Manager.
   - Click **Bindings...** in the Actions pane.
   - Add a binding: Type: `https`, IP Address: `All Unassigned` (or `62.220.123.21`), Port: `443`, Host name: `techa.ir`.
   - Select your SSL certificate (e.g., Let's Encrypt or commercial certificate).
   - Check **Require Server Name Indication (SNI)**.
2. Ensure Windows Firewall allows inbound connections on ports **80** and **443** only.
3. Keep ports **3000** and **5000** blocked from inbound public traffic.
