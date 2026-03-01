# GUIDA DEPLOY APP SU HOSTINGER VPS

## Dati VPS
- IP: 72.62.154.189
- Utente: root
- Console web: hpanel.hostinger.com → VPS → Gestisci → Console

---

## App Deployate
| App | URL | Cartella VPS |
|---|---|---|
| Manager Turni | http://72.62.154.189 | /root/app |
| Preventivi Clienti | http://72.62.154.189:8080 | /root/preventivi |

---

## Come deployare una nuova app

### 1. Sul VPS (console Hostinger)
```bash
git clone https://github.com/alfadet/NOME-REPO /root/NOME-CARTELLA
cd /root/NOME-CARTELLA
echo "DB_PASSWORD=Alfa2024Secure!" > .env
docker compose up -d --build
```

### 2. Aggiungere aggiornamento automatico (cron job)
⚠️ La console Hostinger spezza le righe lunghe — usare variabili:
```bash
A="cd /root/NOME-CARTELLA && git pull"
B="| grep -q 'up to date' || docker compose up -d --build"
echo "*/5 * * * * $A $B" >> /tmp/c && crontab /tmp/c && crontab -l
```
Ogni 5 minuti il VPS controlla GitHub e aggiorna automaticamente.

### 3. Porte disponibili
- Porta 80 → Manager Turni (già usata)
- Porta 8080 → Preventivi Clienti (già usata)
- Porta 8081 → prossima app
- Porta 8082 → app successiva

---

## Aggiornamento automatico CI/CD
⚠️ GitHub Actions SSH NON funziona su Hostinger.
✅ Soluzione: cron job sul VPS (vedi sopra).

**Vedere cron job attivi:**
```bash
crontab -l
```

---

## Comandi utili sul VPS

**Vedere stato container:**
```bash
docker compose ps
```

**Vedere i log:**
```bash
docker compose logs -f
```

**Aggiornare manualmente:**
```bash
cd /root/app
git pull
docker compose up -d --build
```

**Riavviare tutto:**
```bash
docker compose restart
```

**Backup database Manager Turni:**
```bash
cd /root/app
docker compose exec db pg_dump -U alfauser alfadb > backup_$(date +%Y%m%d).sql
```

**Backup database Preventivi:**
```bash
cd /root/preventivi
docker compose exec db pg_dump -U preventiviuser preventividb > backup_$(date +%Y%m%d).sql
```

---

## Note importanti
- Accedere al VPS sempre dalla console web di Hostinger
- Ogni app ha il suo database PostgreSQL separato
- I dati sono al sicuro anche se il VPS si riavvia
- Password DB: Alfa2024Secure!
- Node.js v18 installato sul VPS
