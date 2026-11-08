/**
 * TECHA 2.0 — PM2 ECOSYSTEM CONFIGURATION
 * Orchestrates Next.js 16 (frontend) and Express 5 (backend) as independent production services.
 * Windows Server 2025 compatible.
 */

const path = require('path');

module.exports = {
  apps: [
    {
      name: 'techa-frontend',
      cwd: path.resolve(__dirname, 'frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: `start -p ${process.env.PORT || 3000} -H ${process.env.HOST || '127.0.0.1'}`,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 2000,
      min_uptime: '5s',
      max_memory_restart: '1G',
      kill_timeout: 5000,
      listen_timeout: 10000,
      output: path.resolve(__dirname, 'logs/pm2-frontend-out.log'),
      error: path.resolve(__dirname, 'logs/pm2-frontend-error.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '127.0.0.1',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
        HOST: process.env.HOST || '127.0.0.1',
        TECHA_API_BASE_URL: process.env.TECHA_API_BASE_URL || 'http://127.0.0.1:5000/api/v1/public',
      },
    },
    {
      name: 'techa-backend',
      cwd: path.resolve(__dirname, 'backend'),
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 2000,
      min_uptime: '5s',
      max_memory_restart: '1G',
      kill_timeout: 5000,
      listen_timeout: 10000,
      output: path.resolve(__dirname, 'logs/pm2-backend-out.log'),
      error: path.resolve(__dirname, 'logs/pm2-backend-error.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'development',
        API_PORT: 5000,
        API_HOST: '127.0.0.1',
      },
      env_production: {
        NODE_ENV: 'production',
        API_PORT: process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 5000,
        API_HOST: process.env.API_HOST || '127.0.0.1',
        CANONICAL_API_URL: process.env.CANONICAL_API_URL || 'https://techa.ir',
        FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'https://techa.ir',
        CORS_ORIGINS: process.env.CORS_ORIGINS || 'https://techa.ir,https://www.techa.ir',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        SWAGGER_ENABLED: process.env.SWAGGER_ENABLED || 'true',
        TRUST_PROXY_HOPS: process.env.TRUST_PROXY_HOPS || '1',
      },
    },
  ],
};
