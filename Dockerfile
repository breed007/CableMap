FROM node:20-alpine AS builder

WORKDIR /app

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

# ─── Runtime image ────────────────────────────────────────────────────────────

# Debian slim (glibc) so better-sqlite3 and sharp install via prebuilt binaries
# with no native compilation. (Alpine/musl would build both from source.)
FROM node:20-slim

WORKDIR /app

# iputils-ping provides the `ping` binary used by the reachability monitor
# (the http/tcp check methods need no extra packages).
RUN apt-get update && apt-get install -y --no-install-recommends iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source and built frontend
COPY server/ ./server/
COPY --from=builder /app/server/public ./server/public

# Copy init script (runs before server starts)
COPY package.json ./

# Data volume for SQLite DB and sessions
VOLUME /data

EXPOSE 3000

ENV NODE_ENV=production
ENV DATA_DIR=/data
ENV DB_PATH=/data/cablemap.db

# Initialize DB then start server
CMD ["sh", "-c", "cd server && node db/init.js && node index.js"]
