import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import {
  initialApartments,
  initialConfig,
  initialExpenses,
  initialMonthlySummaries,
  initialPayments,
} from '../data/initialData';
import {
  Apartment,
  CondoConfig,
  EmailNotification,
  ExpenseRecord,
  MonthlySummary,
  PaymentRecord,
} from '../types';

let dbInstance: Database | null = null;
const dbFilePath = path.join(process.cwd(), 'condominio_bloque7.db');

export function saveDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Error saving SQLite database file:', err);
  }
}

export async function initDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  let SQL: any;
  try {
    const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
    if (fs.existsSync(wasmPath)) {
      const wasmBinary = fs.readFileSync(wasmPath);
      SQL = await initSqlJs({ wasmBinary });
    } else {
      SQL = await initSqlJs();
    }
  } catch (e) {
    console.warn('initSqlJs fallback attempt without binary:', e);
    SQL = await initSqlJs();
  }

  if (fs.existsSync(dbFilePath)) {
    try {
      const filebuffer = fs.readFileSync(dbFilePath);
      dbInstance = new SQL.Database(filebuffer);
      console.log('Successfully loaded existing SQLite database from disk.');
    } catch (e) {
      console.warn('Failed to parse existing SQLite database file, reinitializing:', e);
      dbInstance = new SQL.Database();
      createTablesAndSeed(dbInstance);
    }
  } else {
    console.log('Creating new SQLite database file and seeding initial data...');
    dbInstance = new SQL.Database();
    createTablesAndSeed(dbInstance);
  }

  // Ensure all values start at 0 for fresh software usage
  try {
    dbInstance.run(`UPDATE apartments SET previousYearsDebtUSD = 0;`);
    dbInstance.run(`DELETE FROM payments;`);
    dbInstance.run(`DELETE FROM expenses;`);
    dbInstance.run(`DELETE FROM monthly_summaries;`);
    dbInstance.run(`DELETE FROM notifications;`);
    saveDb();
  } catch (err) {
    console.error('Error resetting database to 0:', err);
  }

  return dbInstance;
}

function createTablesAndSeed(db: Database) {
  // Config Table
  db.run(`
    CREATE TABLE IF NOT EXISTS condo_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      condoName TEXT,
      subTitle TEXT,
      rif TEXT,
      email TEXT,
      bankName TEXT,
      bankAccountType TEXT,
      bankAccountNumber TEXT,
      bankAccountOwner TEXT,
      monthlyFeeUSD REAL,
      bcvRate REAL,
      lastBcvUpdate TEXT
    );
  `);

  // Apartments Table
  db.run(`
    CREATE TABLE IF NOT EXISTS apartments (
      id TEXT PRIMARY KEY,
      building TEXT,
      floor TEXT,
      aptNumber TEXT,
      ownerName TEXT,
      phone TEXT,
      email TEXT,
      previousYearsDebtUSD REAL,
      isExonerated INTEGER
    );
  `);

  // Payments Table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      apartmentId TEXT,
      building TEXT,
      ownerName TEXT,
      date TEXT,
      monthsPaid TEXT,
      amountUSD REAL,
      amountBs REAL,
      bcvRate REAL,
      paymentMethod TEXT,
      referenceNumber TEXT,
      bankOrigin TEXT,
      status TEXT,
      receiptUrl TEXT,
      notes TEXT,
      registeredAt TEXT
    );
  `);

  // Expenses Table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      category TEXT,
      description TEXT,
      amountBs REAL,
      amountUSD REAL,
      bcvRate REAL,
      date TEXT,
      period TEXT,
      status TEXT
    );
  `);

  // Monthly Summaries Table
  db.run(`
    CREATE TABLE IF NOT EXISTS monthly_summaries (
      period TEXT PRIMARY KEY,
      monthName TEXT,
      year INTEGER,
      initialBalanceBs REAL,
      incomeBs REAL,
      expensesBs REAL,
      finalBalanceBs REAL
    );
  `);

  // Notifications Table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      apartmentId TEXT,
      ownerName TEXT,
      email TEXT,
      subject TEXT,
      message TEXT,
      sentAt TEXT,
      status TEXT,
      debtMonthsCount INTEGER,
      debtAmountUSD REAL,
      debtAmountBs REAL
    );
  `);

  // Seed Initial Config
  db.run(
    `INSERT INTO condo_config (condoName, subTitle, rif, email, bankName, bankAccountType, bankAccountNumber, bankAccountOwner, monthlyFeeUSD, bcvRate, lastBcvUpdate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      initialConfig.condoName,
      initialConfig.subTitle,
      initialConfig.rif,
      initialConfig.email,
      initialConfig.bankName,
      initialConfig.bankAccountType,
      initialConfig.bankAccountNumber,
      initialConfig.bankAccountOwner,
      initialConfig.monthlyFeeUSD,
      initialConfig.bcvRate,
      initialConfig.lastBcvUpdate,
    ]
  );

  // Seed Initial Apartments
  for (const apt of initialApartments) {
    db.run(
      `INSERT INTO apartments (id, building, floor, aptNumber, ownerName, phone, email, previousYearsDebtUSD, isExonerated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        apt.id,
        apt.building,
        apt.floor,
        apt.aptNumber,
        apt.ownerName,
        apt.phone,
        apt.email,
        apt.previousYearsDebtUSD,
        apt.isExonerated ? 1 : 0,
      ]
    );
  }

  // Seed Initial Payments
  for (const p of initialPayments) {
    db.run(
      `INSERT INTO payments (id, apartmentId, building, ownerName, date, monthsPaid, amountUSD, amountBs, bcvRate, paymentMethod, referenceNumber, bankOrigin, status, receiptUrl, notes, registeredAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.apartmentId,
        p.building,
        p.ownerName,
        p.date,
        JSON.stringify(p.monthsPaid),
        p.amountUSD,
        p.amountBs,
        p.bcvRate,
        p.paymentMethod,
        p.referenceNumber,
        p.bankOrigin,
        p.status,
        p.receiptUrl || '',
        p.notes || '',
        p.registeredAt,
      ]
    );
  }

  // Seed Initial Expenses
  for (const exp of initialExpenses) {
    db.run(
      `INSERT INTO expenses (id, category, description, amountBs, amountUSD, bcvRate, date, period, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        exp.id,
        exp.category,
        exp.description,
        exp.amountBs,
        exp.amountUSD,
        exp.bcvRate,
        exp.date,
        exp.period,
        exp.status,
      ]
    );
  }

  // Seed Initial Summaries
  for (const sum of initialMonthlySummaries) {
    db.run(
      `INSERT INTO monthly_summaries (period, monthName, year, initialBalanceBs, incomeBs, expensesBs, finalBalanceBs)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sum.period,
        sum.monthName,
        sum.year,
        sum.initialBalanceBs,
        sum.incomeBs,
        sum.expensesBs,
        sum.finalBalanceBs,
      ]
    );
  }

  saveDb();
}

// Data Access Helpers
export function getConfig(db: Database): CondoConfig {
  const stmt = db.prepare(`SELECT * FROM condo_config ORDER BY id DESC LIMIT 1`);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return {
      condoName: row.condoName as string,
      subTitle: row.subTitle as string,
      rif: row.rif as string,
      email: row.email as string,
      bankName: row.bankName as string,
      bankAccountType: row.bankAccountType as string,
      bankAccountNumber: row.bankAccountNumber as string,
      bankAccountOwner: row.bankAccountOwner as string,
      monthlyFeeUSD: Number(row.monthlyFeeUSD),
      bcvRate: Number(row.bcvRate),
      lastBcvUpdate: row.lastBcvUpdate as string,
    };
  }
  stmt.free();
  return initialConfig;
}

export function updateConfigDb(db: Database, newConfig: Partial<CondoConfig>): CondoConfig {
  const current = getConfig(db);
  const updated = { ...current, ...newConfig };
  db.run(
    `UPDATE condo_config SET condoName=?, subTitle=?, rif=?, email=?, bankName=?, bankAccountType=?, bankAccountNumber=?, bankAccountOwner=?, monthlyFeeUSD=?, bcvRate=?, lastBcvUpdate=? WHERE id=1`,
    [
      updated.condoName,
      updated.subTitle,
      updated.rif,
      updated.email,
      updated.bankName,
      updated.bankAccountType,
      updated.bankAccountNumber,
      updated.bankAccountOwner,
      updated.monthlyFeeUSD,
      updated.bcvRate,
      updated.lastBcvUpdate,
    ]
  );
  saveDb();
  return updated;
}

export function getApartments(db: Database): Apartment[] {
  const stmt = db.prepare(`SELECT * FROM apartments ORDER BY id ASC`);
  const list: Apartment[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    list.push({
      id: row.id as string,
      building: row.building as any,
      floor: row.floor as any,
      aptNumber: row.aptNumber as string,
      ownerName: row.ownerName as string,
      phone: row.phone as string,
      email: row.email as string,
      previousYearsDebtUSD: Number(row.previousYearsDebtUSD),
      isExonerated: Boolean(row.isExonerated),
    });
  }
  stmt.free();
  return list;
}

export function updateApartmentDb(db: Database, aptId: string, updated: Partial<Apartment>): Apartment | null {
  const stmt = db.prepare(`SELECT * FROM apartments WHERE id = ?`);
  stmt.bind([aptId]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const current = stmt.getAsObject();
  stmt.free();

  const merged = {
    ...current,
    ...updated,
    isExonerated: updated.isExonerated !== undefined ? (updated.isExonerated ? 1 : 0) : current.isExonerated,
  };

  db.run(
    `UPDATE apartments SET building=?, floor=?, aptNumber=?, ownerName=?, phone=?, email=?, previousYearsDebtUSD=?, isExonerated=? WHERE id=?`,
    [
      merged.building,
      merged.floor,
      merged.aptNumber,
      merged.ownerName,
      merged.phone,
      merged.email,
      merged.previousYearsDebtUSD,
      merged.isExonerated,
      aptId,
    ]
  );
  saveDb();
  return {
    id: aptId,
    building: merged.building as any,
    floor: merged.floor as any,
    aptNumber: merged.aptNumber as string,
    ownerName: merged.ownerName as string,
    phone: merged.phone as string,
    email: merged.email as string,
    previousYearsDebtUSD: Number(merged.previousYearsDebtUSD),
    isExonerated: Boolean(merged.isExonerated),
  };
}

export function getPayments(db: Database): PaymentRecord[] {
  const stmt = db.prepare(`SELECT * FROM payments ORDER BY registeredAt DESC`);
  const list: PaymentRecord[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    let monthsPaid: string[] = [];
    try {
      monthsPaid = JSON.parse(row.monthsPaid as string);
    } catch {
      monthsPaid = [];
    }
    list.push({
      id: row.id as string,
      apartmentId: row.apartmentId as string,
      building: row.building as any,
      ownerName: row.ownerName as string,
      date: row.date as string,
      monthsPaid,
      amountUSD: Number(row.amountUSD),
      amountBs: Number(row.amountBs),
      bcvRate: Number(row.bcvRate),
      paymentMethod: row.paymentMethod as any,
      referenceNumber: row.referenceNumber as string,
      bankOrigin: row.bankOrigin as string,
      status: row.status as any,
      receiptUrl: row.receiptUrl as string,
      notes: row.notes as string,
      registeredAt: row.registeredAt as string,
    });
  }
  stmt.free();
  return list;
}

export function addPaymentDb(db: Database, payment: Omit<PaymentRecord, 'id' | 'registeredAt'>): PaymentRecord {
  const id = `PAY-${Date.now().toString().slice(-6)}`;
  const registeredAt = new Date().toISOString();

  db.run(
    `INSERT INTO payments (id, apartmentId, building, ownerName, date, monthsPaid, amountUSD, amountBs, bcvRate, paymentMethod, referenceNumber, bankOrigin, status, receiptUrl, notes, registeredAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payment.apartmentId,
      payment.building,
      payment.ownerName,
      payment.date,
      JSON.stringify(payment.monthsPaid),
      payment.amountUSD,
      payment.amountBs,
      payment.bcvRate,
      payment.paymentMethod,
      payment.referenceNumber,
      payment.bankOrigin,
      payment.status,
      payment.receiptUrl || '',
      payment.notes || '',
      registeredAt,
    ]
  );
  saveDb();

  return {
    ...payment,
    id,
    registeredAt,
  };
}

export function updatePaymentStatusDb(db: Database, paymentId: string, status: 'Aprobado' | 'Pendiente' | 'Rechazado') {
  db.run(`UPDATE payments SET status = ? WHERE id = ?`, [status, paymentId]);
  saveDb();
}

export function updatePaymentDb(db: Database, paymentId: string, updated: Partial<PaymentRecord>): PaymentRecord | null {
  const stmt = db.prepare(`SELECT * FROM payments WHERE id = ?`);
  stmt.bind([paymentId]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const current = stmt.getAsObject();
  stmt.free();

  const merged = {
    ...current,
    ...updated,
  };

  const monthsPaidStr = updated.monthsPaid !== undefined
    ? JSON.stringify(updated.monthsPaid)
    : (current.monthsPaid as string);

  db.run(
    `UPDATE payments SET apartmentId=?, building=?, ownerName=?, date=?, monthsPaid=?, amountUSD=?, amountBs=?, bcvRate=?, paymentMethod=?, referenceNumber=?, bankOrigin=?, status=?, receiptUrl=?, notes=? WHERE id=?`,
    [
      merged.apartmentId,
      merged.building,
      merged.ownerName,
      merged.date,
      monthsPaidStr,
      Number(merged.amountUSD),
      Number(merged.amountBs),
      Number(merged.bcvRate),
      merged.paymentMethod,
      merged.referenceNumber,
      merged.bankOrigin,
      merged.status,
      merged.receiptUrl || '',
      merged.notes || '',
      paymentId,
    ]
  );
  saveDb();

  let parsedMonths: string[] = [];
  try {
    parsedMonths = typeof monthsPaidStr === 'string' ? JSON.parse(monthsPaidStr) : monthsPaidStr;
  } catch {
    parsedMonths = [];
  }

  return {
    id: paymentId,
    apartmentId: merged.apartmentId as string,
    building: merged.building as any,
    ownerName: merged.ownerName as string,
    date: merged.date as string,
    monthsPaid: parsedMonths,
    amountUSD: Number(merged.amountUSD),
    amountBs: Number(merged.amountBs),
    bcvRate: Number(merged.bcvRate),
    paymentMethod: merged.paymentMethod as any,
    referenceNumber: merged.referenceNumber as string,
    bankOrigin: merged.bankOrigin as string,
    status: merged.status as any,
    receiptUrl: merged.receiptUrl as string,
    notes: merged.notes as string,
    registeredAt: (merged.registeredAt as string) || new Date().toISOString(),
  };
}

export function getExpenses(db: Database): ExpenseRecord[] {
  const stmt = db.prepare(`SELECT * FROM expenses ORDER BY date DESC`);
  const list: ExpenseRecord[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    list.push({
      id: row.id as string,
      category: row.category as string,
      description: row.description as string,
      amountBs: Number(row.amountBs),
      amountUSD: Number(row.amountUSD),
      bcvRate: Number(row.bcvRate),
      date: row.date as string,
      period: row.period as string,
      status: row.status as any,
    });
  }
  stmt.free();
  return list;
}

export function addExpenseDb(db: Database, expense: Omit<ExpenseRecord, 'id'>): ExpenseRecord {
  const id = `EXP-${Date.now().toString().slice(-6)}`;
  db.run(
    `INSERT INTO expenses (id, category, description, amountBs, amountUSD, bcvRate, date, period, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      expense.category,
      expense.description,
      expense.amountBs,
      expense.amountUSD,
      expense.bcvRate,
      expense.date,
      expense.period,
      expense.status,
    ]
  );
  saveDb();
  return { ...expense, id };
}

export function deleteExpenseDb(db: Database, id: string) {
  db.run(`DELETE FROM expenses WHERE id = ?`, [id]);
  saveDb();
}

export function getMonthlySummaries(db: Database): MonthlySummary[] {
  const stmt = db.prepare(`SELECT * FROM monthly_summaries ORDER BY period ASC`);
  const list: MonthlySummary[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    list.push({
      period: row.period as string,
      monthName: row.monthName as string,
      year: Number(row.year),
      initialBalanceBs: Number(row.initialBalanceBs),
      incomeBs: Number(row.incomeBs),
      expensesBs: Number(row.expensesBs),
      finalBalanceBs: Number(row.finalBalanceBs),
    });
  }
  stmt.free();
  return list;
}

export function addMonthlySummaryDb(db: Database, summary: MonthlySummary) {
  db.run(
    `INSERT OR REPLACE INTO monthly_summaries (period, monthName, year, initialBalanceBs, incomeBs, expensesBs, finalBalanceBs)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      summary.period,
      summary.monthName,
      summary.year,
      summary.initialBalanceBs,
      summary.incomeBs,
      summary.expensesBs,
      summary.finalBalanceBs,
    ]
  );
  saveDb();
}

export function getNotifications(db: Database): EmailNotification[] {
  const stmt = db.prepare(`SELECT * FROM notifications ORDER BY sentAt DESC`);
  const list: EmailNotification[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    list.push({
      id: row.id as string,
      apartmentId: row.apartmentId as string,
      ownerName: row.ownerName as string,
      email: row.email as string,
      subject: row.subject as string,
      message: row.message as string,
      sentAt: row.sentAt as string,
      status: row.status as any,
      debtMonthsCount: Number(row.debtMonthsCount),
      debtAmountUSD: Number(row.debtAmountUSD),
      debtAmountBs: Number(row.debtAmountBs),
    });
  }
  stmt.free();
  return list;
}

export function addNotificationDb(db: Database, notif: Omit<EmailNotification, 'id' | 'sentAt'>): EmailNotification {
  const id = `NOTIF-${Date.now().toString().slice(-6)}`;
  const sentAt = new Date().toLocaleString('es-VE');

  db.run(
    `INSERT INTO notifications (id, apartmentId, ownerName, email, subject, message, sentAt, status, debtMonthsCount, debtAmountUSD, debtAmountBs)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      notif.apartmentId,
      notif.ownerName,
      notif.email,
      notif.subject,
      notif.message,
      sentAt,
      notif.status,
      notif.debtMonthsCount,
      notif.debtAmountUSD,
      notif.debtAmountBs,
    ]
  );
  saveDb();

  return { ...notif, id, sentAt };
}

export function resetAllDataDb(db: Database) {
  db.run(`DELETE FROM condo_config`);
  db.run(`DELETE FROM apartments`);
  db.run(`DELETE FROM payments`);
  db.run(`DELETE FROM expenses`);
  db.run(`DELETE FROM monthly_summaries`);
  db.run(`DELETE FROM notifications`);
  createTablesAndSeed(db);
}
