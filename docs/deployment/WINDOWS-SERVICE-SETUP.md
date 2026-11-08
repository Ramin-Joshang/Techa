# TECHA 2.0 — Windows Server 2025 PM2 Process Orchestration & Service Persistence

This document explains how to run, monitor, and persist the TECHA 2.0 dual-process architecture (Next.js frontend + Express backend) across Windows Server 2025 reboots.

---

## 1. Process Architecture

The monorepo defines an authoritative root-level PM2 ecosystem file: `ecosystem.config.cjs`.

It configures two independent, isolated processes:
1. `techa-frontend`: Next.js 16 standalone server bound to `127.0.0.1:3000`.
2. `techa-backend`: Express 5 server bound to `127.0.0.1:5000`.

Both processes run under Node.js 24 LTS with automatic restarts, memory caps (1GB), and dedicated log files.

---

## 2. Managing Processes with npm Scripts

Execute the following commands from the monorepo root:

| Action | Command | Purpose |
|:---|:---|:---|
| **Build all** | `npm run build:all` | Compiles shared contracts, builds backend TypeScript, and generates Next.js production bundle. |
| **Start both** | `npm run pm2:start` | Launches both processes under PM2 in production mode. |
| **Inspect status** | `npm run pm2:status` | Shows PID, status, uptime, CPU, and memory usage for both apps. |
| **View logs** | `npm run pm2:logs` | Streams live console output and errors from both applications. |
| **Restart both** | `npm run pm2:restart` | Gracefully reloads both processes with zero code-state leakage. |
| **Stop both** | `npm run pm2:stop` | Stops both processes cleanly without deleting configurations. |
| **Delete from PM2** | `npm run pm2:delete` | Removes both applications from PM2 process supervisor. |
| **Save process list**| `npm run pm2:save` | Persists the active process configuration to PM2 state file. |

---

## 3. Windows Server 2025 Boot Persistence

### 3.1 Why `pm2 startup` is different on Windows
On Linux, `pm2 startup` generates a systemd unit. On Windows Server, PM2 requires a Windows Service wrapper to launch automatically before user login.

### 3.2 Recommended Solution: NSSM (Non-Sucking Service Manager)
NSSM is the industry standard for wrapping Node.js / PM2 processes on Windows Server 2025.

1. **Download NSSM:**
   Download `nssm.exe` from https://nssm.cc/download and place it in `C:\tools\nssm\nssm.exe` (or add to `PATH`).
2. **Ensure Consistent Environment Variables:**
   Set the system-wide environment variable `PM2_HOME` so the Windows service and administrator shell share the same process list:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('PM2_HOME', 'C:\ProgramData\pm2', 'Machine')
   ```
3. **Save PM2 Process State:**
   With your applications running via `npm run pm2:start`, save the state:
   ```cmd
   npm run pm2:save
   ```
4. **Install the Windows Service via NSSM:**
   Open an Administrator Command Prompt and run:
   ```cmd
   nssm install TechaPM2Service "C:\Program Files\nodejs\node.exe" "C:\Users\<Administrator>\AppData\Roaming\npm\node_modules\pm2\bin\pm2 resurrect"
   ```
   Or to run PM2 in no-daemon mode:
   ```cmd
   nssm install TechaPM2 "C:\Users\<Administrator>\AppData\Roaming\npm\pm2.cmd" "resurrect"
   nssm set TechaPM2 AppDirectory "C:\inetpub\techa-monorepo"
   nssm set TechaPM2 AppEnvironmentExtra "PM2_HOME=C:\ProgramData\pm2"
   nssm set TechaPM2 Start SERVICE_AUTO_START
   ```
5. **Start the Service:**
   ```cmd
   nssm start TechaPM2
   ```

---

## 4. Verification & Diagnostics

To verify the deployment from PowerShell, execute:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-windows-deployment.ps1
```
This runs 10 automated network, listener, and reachability tests, ensuring:
- `techa.ir` resolves to `62.220.123.21`
- Port `3000` is listening on `127.0.0.1`
- Port `5000` is listening on `127.0.0.1`
- Neither internal port is exposed publicly
- Public ports 80 and 443 are operational through IIS
