const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Attendi che il DB sia pronto
const connectWithRetry = async () => {
  let retries = 10;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connesso');
      return;
    } catch (err) {
      retries--;
      console.log(`Database non pronto, riprovo tra 3s... (${retries} tentativi rimasti)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.error('Impossibile connettersi al database');
  process.exit(1);
};

// ─── HEALTH CHECK ───────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── OPERATORI ──────────────────────────────────────────────
app.get('/api/operators', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM operators ORDER BY operator_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/operators', async (req, res) => {
  try {
    const { operator_id, operator_name } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO operators (operator_id, operator_name) VALUES ($1, $2)
       ON CONFLICT (operator_id) DO UPDATE SET operator_name = $2 RETURNING *`,
      [operator_id, operator_name]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/operators/all', async (req, res) => {
  try {
    await pool.query('DELETE FROM operators');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/operators/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM operators WHERE operator_id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LOCALI ─────────────────────────────────────────────────
app.get('/api/venues', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM venues ORDER BY venue_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/venues', async (req, res) => {
  try {
    const { venue_id, venue_name, venue_location } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO venues (venue_id, venue_name, venue_location) VALUES ($1, $2, $3)
       ON CONFLICT (venue_id) DO UPDATE SET venue_name = $2, venue_location = $3 RETURNING *`,
      [venue_id, venue_name, venue_location]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/venues/all', async (req, res) => {
  try {
    await pool.query('DELETE FROM venues');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/venues/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM venues WHERE venue_id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BATCH ──────────────────────────────────────────────────
app.get('/api/batches', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM batches ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/batches', async (req, res) => {
  try {
    const { batch_id, created_at, services } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO batches (batch_id, created_at, services) VALUES ($1, $2, $3)
       ON CONFLICT (batch_id) DO UPDATE SET services = $3 RETURNING *`,
      [batch_id, created_at, JSON.stringify(services)]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/batches/:id', async (req, res) => {
  try {
    const { services } = req.body;
    await pool.query(
      'UPDATE batches SET services = $1 WHERE batch_id = $2',
      [JSON.stringify(services), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/batches', async (req, res) => {
  try {
    await pool.query('DELETE FROM batches');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AVVIO SERVER ────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
connectWithRetry().then(() => {
  app.listen(PORT, () => console.log(`Backend attivo sulla porta ${PORT}`));
});
