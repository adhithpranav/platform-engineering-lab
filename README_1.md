# platform-engineering-lab

Self-hosted infrastructure and monitoring setup running on AWS EC2 — Docker, Docker Compose, NGINX, Next.js, FastAPI, Prometheus, and Grafana.

**Focus areas:** Docker networking · reverse proxying · container communication · observability · Linux operations · infrastructure troubleshooting

---

## Infrastructure Stack

| Component | Purpose |
| --- | --- |
| AWS EC2 | Compute host |
| Ubuntu 24.04 LTS | Operating system |
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| NGINX | Reverse proxy |
| Next.js | Frontend |
| FastAPI | Backend API |
| Prometheus | Metrics collection |
| Grafana | Monitoring dashboards |
| cAdvisor | Container-level metrics |
| Node Exporter | Host-level metrics |

---

## Architecture

### Request Flow

<img width="1736" height="782" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/fce68cb0-2674-439f-9318-0f0998e0a644" />

### Monitoring Flow

<img width="1084" height="328" alt="mermaid-diagram (1)" src="https://github.com/user-attachments/assets/31959d06-e98f-4524-b0b1-0538249a57d7" />

---

## Docker Networking

All services are defined in `docker-compose.yml` and communicate over named Docker networks.

```
app-network        →  frontend, backend, nginx
monitoring-network →  prometheus, grafana, cadvisor, node-exporter
```

### The `localhost` Problem

Initial backend call from the Next.js frontend:

```js
fetch("http://localhost:8000/api/...")
```

This fails inside Docker. `localhost` inside a container refers to that container's own loopback interface — not the host, not another container. The request never leaves the `frontend` container.

**Fix:** Use Docker Compose service names as hostnames.

```js
fetch("http://backend:8000/api/...")
```

Docker's internal DNS resolves `backend` to the correct container IP on the shared network. Services only need to be on the same named network in `docker-compose.yml` for this to work.

---

## Monitoring Stack

Prometheus scrapes metrics from three targets:

| Target | Metrics |
| --- | --- |
| cAdvisor `:8080` | Per-container CPU, memory, network |
| Node Exporter `:9100` | Host CPU, disk, RAM |
| FastAPI `:8000/metrics` | Application-level metrics |

Grafana connects to Prometheus as a datasource and visualizes everything via dashboards.

---

## Features

- Multi-container deployment with Docker Compose
- Reverse proxy routing via NGINX
- Internal Docker networking and service discovery
- Container-level metrics via cAdvisor
- Host-level metrics via Node Exporter
- Prometheus scraping and time-series storage
- Grafana dashboards for infrastructure visibility

---

## Repository Structure

```
platform-engineering-lab/
├── apps/
│   ├── frontend/               # Next.js app
│   │   ├── pages/
│   │   ├── components/
│   │   └── Dockerfile
│   └── backend/                # FastAPI app
│       ├── main.py
│       └── Dockerfile
├── docker/
│   └── docker-compose.yml      # All service definitions
├── monitoring/
│   └── prometheus.yml          # Scrape configs
├── nginx/
│   └── default.conf            # Reverse proxy routing
├── template.yml                # EC2 provisioning notes
└── README.md
```

---

## Current Setup

- EC2 instance running Ubuntu, Docker and Docker Compose installed manually
- NGINX configured as a reverse proxy in its own container
- Frontend and backend on a shared `app-network`
- Prometheus scraping cAdvisor, Node Exporter, and FastAPI `/metrics`
- Grafana provisioned with Prometheus as a datasource

```bash
# Start everything
docker compose -f docker/docker-compose.yml up -d

# Check running containers
docker ps

# View logs for a specific service
docker logs backend

# Bring everything down
docker compose -f docker/docker-compose.yml down
```

---

## Screenshots

**Grafana — Container CPU/Memory**
<img width="1600" height="900" alt="Cadvisor" src="https://github.com/user-attachments/assets/fac22e21-f2f0-4429-a6d9-a5bd2833aeff" />

**Grafana — Host Metrics**
<img width="1600" height="900" alt="node_exporter" src="https://github.com/user-attachments/assets/d12b5115-6f1b-4b2a-863f-1922baf2f407" />

**Prometheus Targets**
<img width="1600" height="900" alt="prometheus_targets" src="https://github.com/user-attachments/assets/81779ea6-0df9-4599-b7fa-b7c8ee3c5554" />

**Running Containers**
<img width="1585" height="259" alt="Running_containers" src="https://github.com/user-attachments/assets/2f7111d0-612e-4149-a868-54d3692fdc07" />

---

> **Notes**
> - Prometheus default retention is 15 days. Adjust via `--storage.tsdb.retention.time` in `docker-compose.yml`.
> - Grafana default login is `admin / admin` — change on first access.
> - cAdvisor requires Docker socket and `/sys` mounted as volumes.
> - Node Exporter requires read access to host proc/sys via volume mounts.
