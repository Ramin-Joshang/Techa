/**
 * TECHA 2.0 — BACKEND ROOT LANDING PAGE
 * Minimal, accessible, responsive English HTML landing page for Express backend.
 * Provides service metadata and direct links to OpenAPI/Swagger documentation.
 * Does NOT leak credentials, internal IPs, or database connection details.
 */

export function getLandingPageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="TECHA 2.0 API Service - High-performance backend engine for developer education.">
  <title>TECHA API Service</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: #1f2937;
      --text-main: #f9fafb;
      --text-muted: #9ca3af;
      --accent: #2563eb;
      --accent-hover: #1d4ed8;
      --success: #10b981;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1rem;
      max-width: 640px;
      width: 100%;
      padding: 2.5rem 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
      margin-bottom: 1.25rem;
    }
    .badge-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background-color: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    h1 {
      font-size: 1.875rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
      color: #ffffff;
    }
    p.lead {
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 0.5rem;
      border: 1px solid var(--border);
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .meta-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .meta-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: #ffffff;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 0.5rem;
      text-decoration: none;
      transition: all 0.15s ease-in-out;
      cursor: pointer;
    }
    .btn-primary {
      background-color: var(--accent);
      color: #ffffff;
      border: 1px solid transparent;
    }
    .btn-primary:hover {
      background-color: var(--accent-hover);
    }
    .btn-secondary {
      background-color: transparent;
      color: var(--text-main);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: #374151;
    }
    footer {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: center;
    }
  </style>
</head>
<body>
  <main class="card" role="main">
    <div class="badge">
      <span class="badge-dot" aria-hidden="true"></span>
      <span>Service Operational</span>
    </div>

    <h1>TECHA API Service</h1>
    <p class="lead">
      High-performance public educational content delivery API powered by Express 5, Node.js 24 LTS, and MongoDB Atlas.
    </p>

    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">API Version</span>
        <span class="meta-value">1.0.0</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Architecture</span>
        <span class="meta-value">Express 5 REST</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Specification</span>
        <span class="meta-value">OpenAPI 3.1</span>
      </div>
    </div>

    <div class="actions">
      <a href="/api-docs" class="btn btn-primary">Explore API Documentation</a>
      <a href="/api-docs.json" class="btn btn-secondary">Raw OpenAPI Specification (JSON)</a>
    </div>

    <footer>
      TECHA 2.0 &bull; Production Infrastructure Gateway &bull; <a href="https://techa.ir" style="color: inherit; text-decoration: underline;">techa.ir</a>
    </footer>
  </main>
</body>
</html>
`;
}
