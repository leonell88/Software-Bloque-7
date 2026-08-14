export interface Apartment {
  id: string; // e.g. "00-01"
  building: 'Edificio 1' | 'Edificio 2';
  floor: 'Planta Baja' | 'Piso 1' | 'Piso 2' | 'Piso 3';
  aptNumber: string; // e.g. "00-01"
  ownerName: string;
  phone: string;
  email: string;
  previousYearsDebtUSD: number; // Deuda años anteriores in USD
  isExonerated?: boolean;
}

export interface PaymentRecord {
  id: string;
  apartmentId: string;
  building: 'Edificio 1' | 'Edificio 2';
  ownerName: string;
  date: string; // YYYY-MM-DD
  monthsPaid: string[]; // e.g. ["2026-01", "2026-02"] or ["Enero 2026"]
  amountUSD: number;
  amountBs: number;
  bcvRate: number;
  paymentMethod: 'Pago Móvil' | 'Transferencia' | 'Efectivo $' | 'Efectivo Bs' | 'Zelle';
  referenceNumber: string;
  bankOrigin: string;
  status: 'Aprobado' | 'Pendiente' | 'Rechazado';
  receiptUrl?: string;
  notes?: string;
  registeredAt: string; // ISO string
}

export interface ExpenseRecord {
  id: string;
  category: string; // e.g. "C.A. Hidrológica", "Corpoelec", "Aseo (Recibar)", "Mantenimiento Bomba", "Pago de Obrero", "Limpieza", "Pintura", "Comisiones", "Otros"
  description: string;
  amountBs: number;
  amountUSD: number;
  bcvRate: number;
  date: string; // YYYY-MM-DD
  period: string; // e.g. "2026-02"
  status: 'Pagado' | 'Pendiente';
}

export interface MonthlySummary {
  period: string; // e.g. "2026-02"
  monthName: string; // e.g. "FEBRERO"
  year: number; // e.g. 2026
  initialBalanceBs: number;
  incomeBs: number;
  expensesBs: number;
  finalBalanceBs: number;
}

export interface EmailNotification {
  id: string;
  apartmentId: string;
  ownerName: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
  status: 'Enviado' | 'Simulado' | 'Error';
  debtMonthsCount: number;
  debtAmountUSD: number;
  debtAmountBs: number;
}

export interface CondoConfig {
  condoName: string;
  subTitle: string;
  rif: string;
  email: string;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  bankAccountOwner: string;
  monthlyFeeUSD: number;
  bcvRate: number;
  lastBcvUpdate: string;
}
