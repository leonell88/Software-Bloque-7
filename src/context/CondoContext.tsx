import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface CondoContextType {
  config: CondoConfig;
  updateConfig: (newConfig: Partial<CondoConfig>) => void;
  apartments: Apartment[];
  updateApartment: (aptId: string, updated: Partial<Apartment>) => void;
  payments: PaymentRecord[];
  addPayment: (payment: Omit<PaymentRecord, 'id' | 'registeredAt'>) => PaymentRecord;
  updatePayment: (paymentId: string, updated: Partial<PaymentRecord>) => void;
  updatePaymentStatus: (paymentId: string, status: 'Aprobado' | 'Pendiente' | 'Rechazado') => void;
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  deleteExpense: (id: string) => void;
  monthlySummaries: MonthlySummary[];
  addMonthlySummary: (summary: MonthlySummary) => void;
  notifications: EmailNotification[];
  sendEmailNotification: (notification: Omit<EmailNotification, 'id' | 'sentAt'>) => void;
  sendBulkNotifications: (debtorIds: string[], customSubject?: string, customMessage?: string) => number;
  resetAllData: () => void;
  getApartmentDebt: (aptId: string) => {
    unpaidMonthsUSD: number;
    previousYearsUSD: number;
    totalUSD: number;
    totalBs: number;
    paidMonthsList: string[];
    unpaidMonthsList: string[];
    isSolvent: boolean;
  };
  isDbConnected: boolean;
}

const CondoContext = createContext<CondoContextType | undefined>(undefined);

const ALL_2026_MONTHS = [
  'Enero 2026',
  'Febrero 2026',
  'Marzo 2026',
  'Abril 2026',
  'Mayo 2026',
  'Junio 2026',
  'Julio 2026',
  'Agosto 2026',
  'Septiembre 2026',
  'Octubre 2026',
  'Noviembre 2026',
  'Diciembre 2026',
];

export const CondoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<CondoConfig>(() => {
    const saved = localStorage.getItem('condo_config');
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [apartments, setApartments] = useState<Apartment[]>(() => {
    const saved = localStorage.getItem('condo_apartments');
    return saved ? JSON.parse(saved) : initialApartments;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('condo_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('condo_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>(() => {
    const saved = localStorage.getItem('condo_summaries');
    return saved ? JSON.parse(saved) : initialMonthlySummaries;
  });

  const [notifications, setNotifications] = useState<EmailNotification[]>(() => {
    const saved = localStorage.getItem('condo_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // Load from SQLite API on Mount
  useEffect(() => {
    async function loadFromDb() {
      try {
        const [resCfg, resApts, resPays, resExps, resSums, resNotifs] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/apartments'),
          fetch('/api/payments'),
          fetch('/api/expenses'),
          fetch('/api/summaries'),
          fetch('/api/notifications'),
        ]);

        if (resCfg.ok) {
          const cfgData = await resCfg.json();
          setConfig(cfgData);
        }
        if (resApts.ok) {
          const aptsData: Apartment[] = await resApts.json();
          setApartments(aptsData.map((a) => ({ ...a, previousYearsDebtUSD: 0 })));
        }
        if (resPays.ok) {
          const paysData = await resPays.json();
          setPayments(paysData);
        }
        if (resExps.ok) {
          const expsData = await resExps.json();
          setExpenses(expsData);
        }
        if (resSums.ok) {
          const sumsData = await resSums.json();
          setMonthlySummaries(sumsData);
        }
        if (resNotifs.ok) {
          const notifsData = await resNotifs.json();
          setNotifications(notifsData);
        }

        setIsDbConnected(true);
      } catch (err) {
        console.warn('Backend API connection offline, using client storage:', err);
      }
    }

    loadFromDb();
  }, []);

  // Sync state to local storage as safety backup
  useEffect(() => {
    localStorage.setItem('condo_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('condo_apartments', JSON.stringify(apartments));
  }, [apartments]);

  useEffect(() => {
    localStorage.setItem('condo_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('condo_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('condo_summaries', JSON.stringify(monthlySummaries));
  }, [monthlySummaries]);

  useEffect(() => {
    localStorage.setItem('condo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const updateConfig = (newConfig: Partial<CondoConfig>) => {
    setConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      }).catch((e) => console.error(e));
      return merged;
    });
  };

  const updateApartment = (aptId: string, updated: Partial<Apartment>) => {
    setApartments((prev) =>
      prev.map((apt) => {
        if (apt.id === aptId) {
          const merged = { ...apt, ...updated };
          fetch(`/api/apartments/${aptId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(merged),
          }).catch((e) => console.error(e));
          return merged;
        }
        return apt;
      })
    );
  };

  const addPayment = (paymentData: Omit<PaymentRecord, 'id' | 'registeredAt'>): PaymentRecord => {
    const tempId = `PAY-${Date.now().toString().slice(-6)}`;
    const registeredAt = new Date().toISOString();
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: tempId,
      registeredAt,
    };

    setPayments((prev) => [newPayment, ...prev]);

    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    })
      .then((res) => res.json())
      .then((persistedPayment) => {
        if (persistedPayment && persistedPayment.id) {
          setPayments((prev) =>
            prev.map((p) => (p.id === tempId ? persistedPayment : p))
          );
        }
      })
      .catch((e) => console.error('Error adding payment to SQLite:', e));

    return newPayment;
  };

  const updatePayment = (paymentId: string, updated: Partial<PaymentRecord>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, ...updated } : p))
    );

    fetch(`/api/payments/${paymentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((e) => console.error('Error updating payment:', e));
  };

  const updatePaymentStatus = (paymentId: string, status: 'Aprobado' | 'Pendiente' | 'Rechazado') => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status } : p))
    );

    fetch(`/api/payments/${paymentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch((e) => console.error(e));
  };

  const addExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const tempId = `EXP-${Date.now().toString().slice(-6)}`;
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: tempId,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    })
      .then((res) => res.json())
      .then((persistedExpense) => {
        if (persistedExpense && persistedExpense.id) {
          setExpenses((prev) =>
            prev.map((e) => (e.id === tempId ? persistedExpense : e))
          );
        }
      })
      .catch((e) => console.error('Error adding expense to SQLite:', e));
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    }).catch((e) => console.error(e));
  };

  const addMonthlySummary = (summary: MonthlySummary) => {
    setMonthlySummaries((prev) => {
      const idx = prev.findIndex((s) => s.period === summary.period);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = summary;
        return updated;
      }
      return [...prev, summary];
    });

    fetch('/api/summaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summary),
    }).catch((e) => console.error(e));
  };

  const sendEmailNotification = (notificationData: Omit<EmailNotification, 'id' | 'sentAt'>) => {
    const tempId = `NOTIF-${Date.now().toString().slice(-6)}`;
    const sentAt = new Date().toLocaleString('es-VE');
    const newNotification: EmailNotification = {
      ...notificationData,
      id: tempId,
      sentAt,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData),
    })
      .then((res) => res.json())
      .then((persistedNotif) => {
        if (persistedNotif && persistedNotif.id) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === tempId ? persistedNotif : n))
          );
        }
      })
      .catch((e) => console.error(e));
  };

  const getApartmentDebt = (aptId: string) => {
    const apt = apartments.find((a) => a.id === aptId);
    if (!apt) {
      return {
        unpaidMonthsUSD: 0,
        previousYearsUSD: 0,
        totalUSD: 0,
        totalBs: 0,
        paidMonthsList: [],
        unpaidMonthsList: ALL_2026_MONTHS,
        isSolvent: true,
      };
    }

    if (apt.isExonerated) {
      return {
        unpaidMonthsUSD: 0,
        previousYearsUSD: 0,
        totalUSD: 0,
        totalBs: 0,
        paidMonthsList: ALL_2026_MONTHS,
        unpaidMonthsList: [],
        isSolvent: true,
      };
    }

    const aptPayments = payments.filter(
      (p) => p.apartmentId === aptId && p.status === 'Aprobado'
    );
    const paidMonthsSet = new Set<string>();
    aptPayments.forEach((p) => {
      p.monthsPaid.forEach((m) => paidMonthsSet.add(m));
    });

    const paidMonthsList = Array.from(paidMonthsSet);
    const activeMonthsToEvaluate: string[] = [];
    const unpaidMonthsList = activeMonthsToEvaluate.filter((m) => !paidMonthsSet.has(m));

    const unpaidMonthsUSD = unpaidMonthsList.length * config.monthlyFeeUSD;
    const previousYearsUSD = apt.previousYearsDebtUSD || 0;
    const totalUSD = previousYearsUSD + unpaidMonthsUSD;
    const totalBs = totalUSD * config.bcvRate;
    const isSolvent = totalUSD === 0;

    return {
      unpaidMonthsUSD,
      previousYearsUSD,
      totalUSD,
      totalBs,
      paidMonthsList,
      unpaidMonthsList,
      isSolvent,
    };
  };

  const sendBulkNotifications = (
    debtorIds: string[],
    customSubject?: string,
    customMessage?: string
  ): number => {
    let count = 0;
    debtorIds.forEach((aptId) => {
      const apt = apartments.find((a) => a.id === aptId);
      if (!apt) return;
      const debtInfo = getApartmentDebt(aptId);
      if (debtInfo.totalUSD <= 0) return;

      const defaultSubject = `RECORDATORIO DE PAGO - Condominio Bloque 7 Apto ${apt.aptNumber}`;
      const defaultBody = `Estimado(a) ${apt.ownerName},

Le saludamos cordialmente de la Junta de Condominio del ${config.condoName}.

Le notificamos que el Apartamento ${apt.aptNumber} (${apt.building}, ${apt.floor}) presenta un saldo pendiente de:
- Deuda en $: $${debtInfo.totalUSD.toFixed(2)} USD
- Deuda en Bolívares (Tasa BCV ${config.bcvRate.toFixed(2)}): Bs. ${debtInfo.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}

Meses o conceptos pendientes: ${debtInfo.unpaidMonthsList.join(', ')} ${debtInfo.previousYearsUSD > 0 ? `(+ Deuda Años Anteriores: $${debtInfo.previousYearsUSD})` : ''}

Agradecemos realizar su pago a la brevedad posible para mantener los servicios comunes del edificio.

Datos Bancarios:
- Banco: ${config.bankName} (${config.bankAccountType})
- Cuenta No: ${config.bankAccountNumber}
- RIF: ${config.rif}
- Titular: ${config.bankAccountOwner}

Atentamente,
Junta de Condominio Bloque 7 Los Cocalitos`;

      sendEmailNotification({
        apartmentId: apt.id,
        ownerName: apt.ownerName,
        email: apt.email,
        subject: customSubject || defaultSubject,
        message: customMessage || defaultBody,
        status: 'Enviado',
        debtMonthsCount: debtInfo.unpaidMonthsList.length,
        debtAmountUSD: debtInfo.totalUSD,
        debtAmountBs: debtInfo.totalBs,
      });
      count++;
    });
    return count;
  };

  const resetAllData = () => {
    setConfig(initialConfig);
    setApartments(initialApartments);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setMonthlySummaries(initialMonthlySummaries);
    setNotifications([]);
    localStorage.clear();

    fetch('/api/reset', { method: 'POST' }).catch((e) => console.error(e));
  };

  return (
    <CondoContext.Provider
      value={{
        config,
        updateConfig,
        apartments,
        updateApartment,
        payments,
        addPayment,
        updatePayment,
        updatePaymentStatus,
        expenses,
        addExpense,
        deleteExpense,
        monthlySummaries,
        addMonthlySummary,
        notifications,
        sendEmailNotification,
        sendBulkNotifications,
        resetAllData,
        getApartmentDebt,
        isDbConnected,
      }}
    >
      {children}
    </CondoContext.Provider>
  );
};

export const useCondo = () => {
  const context = useContext(CondoContext);
  if (!context) {
    throw new Error('useCondo must be used within a CondoProvider');
  }
  return context;
};
