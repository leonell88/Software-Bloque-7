import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  addExpenseDb,
  addMonthlySummaryDb,
  addNotificationDb,
  addPaymentDb,
  deleteExpenseDb,
  getApartments,
  getConfig,
  getExpenses,
  getMonthlySummaries,
  getNotifications,
  getPayments,
  initDb,
  resetAllDataDb,
  updateApartmentDb,
  updateConfigDb,
  updatePaymentDb,
  updatePaymentStatusDb,
} from './src/db/sqliteDb';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize SQLite database
  const db = await initDb();

  // API Routes for SQLite Persistence
  app.get('/api/config', (req, res) => {
    try {
      const config = getConfig(db);
      res.json(config);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/config', (req, res) => {
    try {
      const updated = updateConfigDb(db, req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/apartments', (req, res) => {
    try {
      const list = getApartments(db);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/apartments/:id', (req, res) => {
    try {
      const apt = updateApartmentDb(db, req.params.id, req.body);
      res.json(apt);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/payments', (req, res) => {
    try {
      const list = getPayments(db);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/payments', (req, res) => {
    try {
      const payment = addPaymentDb(db, req.body);
      res.json(payment);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch('/api/payments/:id/status', (req, res) => {
    try {
      updatePaymentStatusDb(db, req.params.id, req.body.status);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/payments/:id', (req, res) => {
    try {
      const updated = updatePaymentDb(db, req.params.id, req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/expenses', (req, res) => {
    try {
      const list = getExpenses(db);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/expenses', (req, res) => {
    try {
      const expense = addExpenseDb(db, req.body);
      res.json(expense);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/expenses/:id', (req, res) => {
    try {
      deleteExpenseDb(db, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/summaries', (req, res) => {
    try {
      const list = getMonthlySummaries(db);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/summaries', (req, res) => {
    try {
      addMonthlySummaryDb(db, req.body);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/notifications', (req, res) => {
    try {
      const list = getNotifications(db);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/notifications', (req, res) => {
    try {
      const notif = addNotificationDb(db, req.body);
      res.json(notif);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/reset', (req, res) => {
    try {
      resetAllDataDb(db);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server with SQLite running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
