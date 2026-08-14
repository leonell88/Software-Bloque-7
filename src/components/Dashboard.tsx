import React from 'react';
import { useCondo } from '../context/CondoContext';
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calculator,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  Mail,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onSelectPayment: (payment: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onSelectPayment }) => {
  const { apartments, payments, expenses, config, getApartmentDebt } = useCondo();

  // Calculate total collected from approved payments
  const approvedPayments = payments.filter((p) => p.status === 'Aprobado');
  const totalCollectedUSD = approvedPayments.reduce((acc, p) => acc + p.amountUSD, 0);
  const totalCollectedBs = approvedPayments.reduce((acc, p) => acc + p.amountBs, 0);

  // Calculate total debt across all apartments
  let totalPendingDebtUSD = 0;
  let totalPendingDebtBs = 0;
  let solventApartmentsCount = 0;
  let debtorApartmentsCount = 0;

  // Collection by building
  let building1CollectionUSD = 0;
  let building2CollectionUSD = 0;

  approvedPayments.forEach((p) => {
    if (p.building === 'Edificio 1') building1CollectionUSD += p.amountUSD;
    if (p.building === 'Edificio 2') building2CollectionUSD += p.amountUSD;
  });

  apartments.forEach((apt) => {
    const debt = getApartmentDebt(apt.id);
    if (debt.isSolvent) {
      solventApartmentsCount++;
    } else {
      debtorApartmentsCount++;
      totalPendingDebtUSD += debt.totalUSD;
      totalPendingDebtBs += debt.totalBs;
    }
  });

  // Total expenses
  const paidExpenses = expenses.filter((e) => e.status === 'Pagado');
  const totalExpensesBs = paidExpenses.reduce((acc, e) => acc + e.amountBs, 0);
  const totalExpensesUSD = paidExpenses.reduce((acc, e) => acc + e.amountUSD, 0);

  const solvencyPercentage = Math.round((solventApartmentsCount / apartments.length) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
            Panel Principal de Control
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Gestión de Condominio Bloque 7
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Sólido control financiero para 32 apartamentos en 2 edificios. Recaudación en cuota de $5 a tasa oficial BCV (Bs. {config.bcvRate.toFixed(2)} / $).
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('register-payment')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl shadow-lg transition text-xs sm:text-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs sm:text-sm"
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Notificar Morosos ({debtorApartmentsCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs sm:text-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            <span>Ver Reportes PDF</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Recaudado */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recaudación Total
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ${totalCollectedUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })} USD
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Bs. {totalCollectedBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Card 2: Deuda Total Pendiente */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deuda Pendiente
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              ${totalPendingDebtUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })} USD
            </div>
            <p className="text-xs font-semibold text-rose-500 mt-1">
              Bs. {totalPendingDebtBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} ({debtorApartmentsCount} aptos morosos)
            </p>
          </div>
        </div>

        {/* Card 3: Nivel de Solvencia */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nivel de Solvencia
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {solvencyPercentage}%
            </div>
            <p className="text-xs font-medium text-slate-600 mt-1">
              {solventApartmentsCount} aptos al día de 32 totales
            </p>
          </div>
        </div>

        {/* Card 4: Gastos Operativos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Gastos Ejecutados
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              Bs. {totalExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              ~ ${totalExpensesUSD.toFixed(2)} USD (Corpoelec, Obrero, Bomba)
            </p>
          </div>
        </div>
      </div>

      {/* Building Breakdown & Income/Expense Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Building Collection Comparison */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Cobranza Recaudada por Edificio
              </h3>
              <p className="text-xs text-slate-500">Distribución entre los 2 edificios del Bloque 7</p>
            </div>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {/* Edificio 1 */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>Edificio 1 (16 Aptos)</span>
                <span className="text-emerald-700 font-extrabold">
                  ${building1CollectionUSD.toFixed(2)} USD (Bs.{' '}
                  {(building1CollectionUSD * config.bcvRate).toLocaleString('es-VE', {
                    maximumFractionDigits: 2,
                  })}
                  )
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalCollectedUSD > 0
                        ? Math.min(100, (building1CollectionUSD / totalCollectedUSD) * 100)
                        : 50
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Edificio 2 */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>Edificio 2 (16 Aptos)</span>
                <span className="text-teal-700 font-extrabold">
                  ${building2CollectionUSD.toFixed(2)} USD (Bs.{' '}
                  {(building2CollectionUSD * config.bcvRate).toLocaleString('es-VE', {
                    maximumFractionDigits: 2,
                  })}
                  )
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalCollectedUSD > 0
                        ? Math.min(100, (building2CollectionUSD / totalCollectedUSD) * 100)
                        : 50
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Bank details summary box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 text-xs space-y-1.5 text-slate-700">
              <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                📌 Datos de Cuenta Bancaria para Pagos:
              </p>
              <p><span className="font-semibold text-slate-500">Banco:</span> {config.bankName} ({config.bankAccountType})</p>
              <p><span className="font-semibold text-slate-500">Número de Cuenta:</span> <span className="font-mono font-bold text-slate-900">{config.bankAccountNumber}</span></p>
              <p><span className="font-semibold text-slate-500">A Nombre de:</span> {config.bankAccountOwner}</p>
              <p><span className="font-semibold text-slate-500">RIF:</span> {config.rif}</p>
            </div>
          </div>
        </div>

        {/* Real-Time Recent Payments Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Últimos Pagos Registrados
                </h3>
                <p className="text-xs text-slate-500">Actualización en tiempo real</p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Ver todos ({payments.length})
              </button>
            </div>

            <div className="space-y-3">
              {payments.slice(0, 4).map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => onSelectPayment(payment)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        payment.building === 'Edificio 1'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {payment.apartmentId}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        {payment.ownerName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {payment.monthsPaid.join(', ')} • {payment.paymentMethod} ({payment.referenceNumber})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-slate-900 text-xs sm:text-sm">
                      ${payment.amountUSD.toFixed(2)}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        payment.status === 'Aprobado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : payment.status === 'Pendiente'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('register-payment')}
            className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition"
          >
            + Registrar Nuevo Pago de Apartamento
          </button>
        </div>
      </div>
    </div>
  );
};
