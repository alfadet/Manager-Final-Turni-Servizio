# Deploy su Hostinger VPS

## 1. Connettiti al VPS via SSH
```bash
ssh root@IP_DEL_TUO_VPS
```

## 2. Installa Docker e Docker Compose
```bash
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y
```

## 3. Clona il repository
```bash
git clone https://github.com/alfadet/Manager-Final-Turni-Servizio
cd Manager-Final-Turni-Servizio
```

## 4. Crea il file .env con la password del database
```bash
cp .env.example .env
nano .env
# Cambia DB_PASSWORD con una password sicura
```

## 5. Avvia tutto
```bash
docker compose up -d
```

## 6. Verifica che funzioni
```bash
docker compose ps
# Dovresti vedere 3 container: db, backend, frontend (tutti "Up")
```

## 7. Apri nel browser
```
http://IP_DEL_TUO_VPS
```

---

## Comandi utili

**Vedere i log:**
```bash
docker compose logs -f
```

**Aggiornare l'app dopo modifiche:**
```bash
git pull
docker compose up -d --build
```

**Backup del database:**
```bash
docker compose exec db pg_dump -U alfauser alfadb > backup_$(date +%Y%m%d).sql
```

**Ripristino backup:**
```bash
docker compose exec -T db psql -U alfauser alfadb < backup_YYYYMMDD.sql
```
