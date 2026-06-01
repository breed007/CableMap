# CableMap — Docker Deployment

## Prerequisites

- Docker 24+
- Docker Compose v2 (`docker compose` command)

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/yourname/cablemap.git
cd cablemap

# 2. Create and configure .env
cp .env.example .env
nano .env   # Set SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD

# 3. Build and start
docker compose up -d

# CableMap is now running at http://localhost:3000
```

---

## Build & Run

```bash
# Build image
docker compose build

# Start (background)
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

---

## Configuration

Edit `.env` before starting:

```env
SESSION_SECRET=replace-with-a-long-random-string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
PORT=3000
```

To change the host port (e.g. expose on 8080 instead of 3000):
```yaml
# docker-compose.yml
ports:
  - "8080:3000"
```

---

## Data persistence

All data is stored in the named Docker volume `cablemap_data` mounted at `/data` inside the container. This volume persists across container restarts and rebuilds. It contains:

- `cablemap.db` — the SQLite database
- `sessions.db` — login sessions
- `uploads/` — original uploaded photos
- `uploads/thumbs/` — generated thumbnails (regenerated on demand if deleted)

```bash
# Inspect the volume
docker volume inspect cablemap_cablemap_data

# List volumes
docker volume ls
```

---

## Backup

```bash
# Backup the SQLite database
docker run --rm \
  -v cablemap_cablemap_data:/data \
  -v $(pwd):/backup \
  alpine \
  cp /data/cablemap.db /backup/cablemap-$(date +%Y%m%d-%H%M%S).db

# Back up everything (database + photos) as a tarball
docker run --rm \
  -v cablemap_cablemap_data:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/cablemap-full-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

---

## Restore

```bash
# Restore from a backup file
docker compose down

docker run --rm \
  -v cablemap_cablemap_data:/data \
  -v $(pwd):/backup \
  alpine \
  cp /backup/cablemap-YYYYMMDD-HHMMSS.db /data/cablemap.db

docker compose up -d
```

---

## Update

```bash
# Pull latest code
git pull

# Rebuild and restart (data is preserved in the volume)
docker compose build
docker compose up -d
```

---

## Reset (delete all data)

```bash
docker compose down
docker volume rm cablemap_cablemap_data
docker compose up -d
# Database will be re-initialized with seed data on next start
```

---

## Reverse proxy with Nginx

If you want to expose CableMap behind Nginx on port 80:

```nginx
server {
    listen 80;
    server_name cablemap.local;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;
    }
}
```

Or add Nginx as a service in `docker-compose.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - cablemap
```
