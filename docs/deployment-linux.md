# CableMap — Linux Deployment

## Prerequisites

- Node.js 20+ and npm
- git
- (Optional) PM2 for process management

Install Node.js via NodeSource if not available:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourname/cablemap.git
cd cablemap

# 2. Install all dependencies
npm run install:all

# 3. Configure environment
cp .env.example .env
nano .env   # Edit SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD

# 4. Initialize the database (creates tables, seeds locations/VLANs/templates)
npm run db:init

# 5. Build the frontend
npm run build
```

---

## Running with PM2 (recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start CableMap
pm2 start server/index.js --name cablemap

# Save PM2 process list (auto-restart on reboot)
pm2 save
pm2 startup   # Follow the printed instructions

# View logs
pm2 logs cablemap

# Stop / restart
pm2 stop cablemap
pm2 restart cablemap
```

---

## Running directly

```bash
npm start
# App runs on http://localhost:3000
```

---

## Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name cablemap.local;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/cablemap /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Apache reverse proxy

```apache
<VirtualHost *:80>
    ServerName cablemap.local

    ProxyPreserveHost On
    ProxyPass        / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    ErrorLog  ${APACHE_LOG_DIR}/cablemap_error.log
    CustomLog ${APACHE_LOG_DIR}/cablemap_access.log combined
</VirtualHost>
```

Enable:
```bash
sudo a2enmod proxy proxy_http
sudo a2ensite cablemap
sudo systemctl reload apache2
```

---

## Updating

```bash
git pull
npm run install:all
npm run build
npm run db:init   # safe to re-run; skips existing data
pm2 restart cablemap
```

---

## .env reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP listen port |
| `SESSION_SECRET` | `changeme` | Cookie signing key — **change this** |
| `ADMIN_USERNAME` | `admin` | Login username |
| `ADMIN_PASSWORD` | `changeme` | Login password (plaintext or bcrypt hash) |
| `DATA_DIR` | `./data` | Directory for SQLite DB and sessions |
| `DB_PATH` | `./data/cablemap.db` | SQLite database path |

To use a bcrypt password hash (recommended for production):
```bash
node -e "const b=require('bcrypt'); b.hash('yourpassword',10).then(h=>console.log(h))"
```
Then set `ADMIN_PASSWORD=<hash>` in `.env`.
