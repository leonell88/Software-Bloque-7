import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { Download, FileSpreadsheet, Printer, RefreshCw } from 'lucide-react';

export const ReportsViewer: React.FC = () => {
  const { config, apartments, payments, expenses, monthlySummaries, getApartmentDebt } = useCondo();

  const [activeReport, setActiveReport] = useState<'rendicion' | 'gastos' | 'deuda'>('gastos');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-02');

  const handlePrint = () => {
    window.print();
  };

  // Calculations for Report 2 (Relación de Ingresos/Gastos Fijos)
  const approvedPayments = payments.filter((p) => p.status === 'Aprobado');
  const monthlyPaymentsBs = approvedPayments.reduce((acc, p) => acc + p.amountBs, 0);

  let b1Bs = 0;
  let b2Bs = 0;
  approvedPayments.forEach((p) => {
    if (p.building === 'Edificio 1') b1Bs += p.amountBs;
    if (p.building === 'Edificio 2') b2Bs += p.amountBs;
  });

  const totalFixedExpensesBs = expenses
    .filter((e) => e.status === 'Pagado')
    .reduce((acc, e) => acc + e.amountBs, 0);

  const initialBalanceBs = 16049.50;
  const totalBalanceBs = initialBalanceBs + monthlyPaymentsBs;
  const netBalanceBs = monthlyPaymentsBs - totalFixedExpensesBs;

  // Expected collection calculation (32 apts * $5 * rate)
  const estimatedMonthBs = apartments.length * config.monthlyFeeUSD * config.bcvRate;

  return (
    <div className="space-y-6">
      {/* Top Header & Report Selection Tabs (Hidden on Print) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Reportes Oficiales de Condominio</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Formatos estandarizados de Rendición de Cuentas, Gastos Fijos y Matriz de Deuda General.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Reporte (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs (Hidden on Print) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 print:hidden overflow-x-auto">
        <button
          onClick={() => setActiveReport('gastos')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition whitespace-nowrap ${
            activeReport === 'gastos'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          1. Relación Ingresos/Gastos Fijos Mensuales
        </button>
        <button
          onClick={() => setActiveReport('rendicion')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition whitespace-nowrap ${
            activeReport === 'rendicion'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          2. Rendición de Cuentas (Histórico)
        </button>
        <button
          onClick={() => setActiveReport('deuda')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition whitespace-nowrap ${
            activeReport === 'deuda'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          3. Matriz de Deuda General por Apartamento
        </button>
      </div>

      {/* REPORT 1: RELACION DE INGRESOS/GASTOS FIJOS MENSUALES */}
      {activeReport === 'gastos' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0 space-y-6 text-slate-900 font-sans">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="text-center">
              <h1 className="text-lg font-black tracking-wide uppercase text-slate-900">
                {config.condoName}
              </h1>
              <p className="text-sm font-extrabold text-slate-800 uppercase mt-0.5">
                RELACION DE INGRESOS/GASTOS FIJOS MENSUALES
              </p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                FEBRERO - AÑO 2026 | RIF {config.rif}
              </p>
            </div>
          </div>

          {/* Top Financial Cards Table Grid matching attached PDF */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border border-slate-300 p-3 bg-slate-50 rounded-xl">
            <div className="border-r border-slate-300 pr-2">
              <span className="font-bold text-slate-600 block">SALDO INICIAL:</span>
              <span className="font-black text-slate-900 text-sm">
                Bs {initialBalanceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-r border-slate-300 pr-2">
              <span className="font-bold text-slate-600 block">PAGOS DEL MES:</span>
              <span className="font-black text-emerald-700 text-sm">
                Bs {monthlyPaymentsBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-600 block">SALDO DISPONIBLE:</span>
              <span className="font-black text-slate-900 text-sm">
                Bs {totalBalanceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Fee & Exchange Rate Box */}
          <div className="grid grid-cols-3 gap-3 text-xs text-center border border-slate-300 bg-yellow-50 p-2.5 rounded-xl font-bold">
            <div className="bg-amber-200/80 p-2 rounded">
              CUOTA inicio MES: <span className="text-slate-900">Bs. 1.851,25</span>
            </div>
            <div className="bg-amber-200/80 p-2 rounded">
              Ref. BCV $: <span className="text-slate-900">${config.monthlyFeeUSD} USD</span>
            </div>
            <div className="bg-amber-200/80 p-2 rounded">
              Valor Bs/$ BCV: <span className="text-slate-900">Bs.S {config.bcvRate.toFixed(2)}</span>
            </div>
          </div>

          {/* Building Collection Summary */}
          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-800 text-white font-bold p-2 text-center flex justify-between px-4">
              <span>COBRANZA MES POR EDIFICIO: Bs. {monthlyPaymentsBs.toLocaleString('es-VE')}</span>
              <span>ESTIMADO MES Bs: Bs. {estimatedMonthBs.toLocaleString('es-VE')}</span>
            </div>
            <div className="grid grid-cols-3 p-3 text-center font-bold bg-slate-100">
              <div>
                EDIFICIO 1<p className="text-slate-800">Bs. {b1Bs.toLocaleString('es-VE')}</p>
              </div>
              <div>
                EDIFICIO 2<p className="text-slate-800">Bs. {b2Bs.toLocaleString('es-VE')}</p>
              </div>
              <div className="bg-yellow-200 p-1.5 rounded text-slate-900">
                TOTAL RECAUDACIÓN MES:
                <p className="text-sm font-black">Bs. {monthlyPaymentsBs.toLocaleString('es-VE')}</p>
              </div>
            </div>
          </div>

          {/* Itemized Fixed Expenses Table */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 bg-slate-200 p-2 rounded-t-lg border-x border-t border-slate-300">
              GASTOS FIJOS Y OPERATIVOS
            </h3>
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase">
                <tr>
                  <th className="p-2.5 border-r border-slate-300">GASTOS FIJOS</th>
                  <th className="p-2.5 border-r border-slate-300">CONCEPTO DEL GASTO</th>
                  <th className="p-2.5 text-right">MONTO (Bs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                      {expense.category}
                    </td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200">
                      {expense.description}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {expense.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-yellow-100 font-black border-t-2 border-slate-900">
                <tr>
                  <td colSpan={2} className="p-2.5 text-right uppercase border-r border-slate-300">
                    TOTAL GASTOS:
                  </td>
                  <td className="p-2.5 text-right text-slate-900 font-mono text-sm">
                    {totalFixedExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-slate-900 text-white">
                  <td colSpan={2} className="p-2.5 text-right uppercase border-r border-slate-700">
                    TOTAL INGRESOS - GASTOS:
                  </td>
                  <td className="p-2.5 text-right text-emerald-400 font-mono text-sm">
                    {netBalanceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Information Box */}
          <div className="bg-slate-50 border border-slate-300 p-4 rounded-xl text-[11px] space-y-2 text-slate-700 leading-normal">
            <p className="font-bold text-slate-900 uppercase text-center border-b pb-1">
              INFORMACIÓN PARA LOS RESIDENTES
            </p>
            <p>
              <strong>Nota:</strong> Recuerde que su pago a tiempo contribuye a ejecutar mejoras a tu residencia y la revaloración de su inmueble.
            </p>
            <p>
              <strong>Enviar comprobante de pago al correo electrónico:</strong> {config.email}
            </p>
            <p>
              Favor realizar el pago del condominio en el <strong>{config.bankName}</strong> {config.bankAccountType} No. <strong>{config.bankAccountNumber}</strong> a nombre de <strong>{config.bankAccountOwner}</strong>. Rif. {config.rif}.
            </p>
          </div>
        </div>
      )}

      {/* REPORT 2: RENDICION DE CUENTA (HISTORICO INGRESOS Y EGRESOS) */}
      {activeReport === 'rendicion' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0 space-y-6 text-slate-900">
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <h1 className="text-lg font-black tracking-wide uppercase text-slate-900">
              {config.condoName}
            </h1>
            <p className="text-xs font-bold text-slate-600 mt-1">RIF {config.rif}</p>
            <h2 className="text-base font-extrabold text-slate-900 uppercase mt-2">
              RENDICION DE CUENTA
            </h2>
            <p className="text-xs font-bold text-slate-700 uppercase">
              RELACION DE INGRESOS Y EGRESOS PERIODO 2024-2026
            </p>
          </div>

          <table className="w-full text-xs border border-slate-300 text-center">
            <thead className="bg-yellow-300 text-slate-900 font-black uppercase border-b-2 border-slate-900">
              <tr>
                <th className="p-2.5 border-r border-slate-400">MES</th>
                <th className="p-2.5 border-r border-slate-400">AÑO</th>
                <th className="p-2.5 border-r border-slate-400">INGRESOS</th>
                <th className="p-2.5 border-r border-slate-400">GASTOS</th>
                <th className="p-2.5">SALDOS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              <tr className="bg-yellow-50 font-bold">
                <td colSpan={2} className="p-2 border-r text-right uppercase text-slate-600">
                  PERIODO ANTERIOR
                </td>
                <td className="p-2 border-r font-mono">2.708,57</td>
                <td className="p-2 border-r font-mono">-</td>
                <td className="p-2 font-mono">2.708,57</td>
              </tr>
              {monthlySummaries.map((summary, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2 border-r font-bold text-slate-800">{summary.monthName}</td>
                  <td className="p-2 border-r font-semibold text-slate-600">{summary.year}</td>
                  <td className="p-2 border-r font-mono font-semibold text-slate-900">
                    {summary.incomeBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 border-r font-mono font-semibold text-slate-900">
                    {summary.expensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 font-mono font-bold text-emerald-800">
                    {summary.finalBalanceBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black border-t-2 border-slate-900">
              <tr>
                <td colSpan={2} className="p-3 text-right uppercase border-r border-slate-700">
                  TOTAL GENERAL:
                </td>
                <td className="p-3 font-mono text-emerald-400">
                  Bs.{' '}
                  {monthlySummaries
                    .reduce((acc, s) => acc + s.incomeBs, 0)
                    .toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 font-mono text-rose-300">
                  Bs.{' '}
                  {monthlySummaries
                    .reduce((acc, s) => acc + s.expensesBs, 0)
                    .toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 font-mono text-amber-300">
                  Bs.{' '}
                  {(
                    monthlySummaries.reduce((acc, s) => acc + s.incomeBs, 0) -
                    monthlySummaries.reduce((acc, s) => acc + s.expensesBs, 0)
                  ).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* REPORT 3: MATRIZ DE DEUDA GENERAL POR APARTAMENTO */}
      {activeReport === 'deuda' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0 space-y-4 text-slate-900 overflow-x-auto">
          <div className="border-b-2 border-slate-900 pb-3 text-center">
            <h1 className="text-base font-black tracking-wide uppercase text-slate-900">
              {config.condoName}
            </h1>
            <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">
              RELACION DE DEUDA GENERAL CONDOMINIO (AÑO 2026) | RIF {config.rif}
            </p>
          </div>

          <table className="w-full text-[10px] border border-slate-300 text-center">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="p-2 border-r border-slate-700 text-left">Apartamento / Propietario</th>
                <th className="p-2 border-r border-slate-700">Deuda Anteriores ($)</th>
                <th className="p-2 border-r border-slate-700">Enero</th>
                <th className="p-2 border-r border-slate-700">Febrero</th>
                <th className="p-2 border-r border-slate-700">Marzo</th>
                <th className="p-2 border-r border-slate-700">Abril</th>
                <th className="p-2 border-r border-slate-700">Mayo</th>
                <th className="p-2 border-r border-slate-700">Junio</th>
                <th className="p-2 border-r border-slate-700">Julio</th>
                <th className="p-2 border-r border-slate-700">Agosto</th>
                <th className="p-2 border-r border-slate-700">Septiembre</th>
                <th className="p-2 border-r border-slate-700">Octubre</th>
                <th className="p-2 border-r border-slate-700">Noviembre</th>
                <th className="p-2 border-r border-slate-700">Diciembre</th>
                <th className="p-2 bg-rose-900 text-white">Total USD ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {apartments.map((apt) => {
                const debtInfo = getApartmentDebt(apt.id);
                const isEneroPaid = debtInfo.paidMonthsList.includes('Enero 2026');
                const isFebreroPaid = debtInfo.paidMonthsList.includes('Febrero 2026');

                return (
                  <tr key={apt.id} className="hover:bg-slate-50">
                    <td className="p-1.5 border-r font-bold text-left text-slate-900">
                      Apto {apt.aptNumber} - {apt.ownerName}
                    </td>
                    <td className="p-1.5 border-r font-mono text-slate-700">
                      ${apt.previousYearsDebtUSD}
                    </td>

                    {/* Enero */}
                    <td className="p-1.5 border-r font-bold">
                      {apt.isExonerated ? (
                        <span className="text-blue-600 font-extrabold text-[9px]">EXONERADA</span>
                      ) : isEneroPaid ? (
                        <span className="text-emerald-700">X</span>
                      ) : (
                        <span className="text-rose-600">5</span>
                      )}
                    </td>

                    {/* Febrero */}
                    <td className="p-1.5 border-r font-bold">
                      {apt.isExonerated ? (
                        <span className="text-blue-600 font-extrabold text-[9px]">EXONERADA</span>
                      ) : isFebreroPaid ? (
                        <span className="text-emerald-700">X</span>
                      ) : (
                        <span className="text-rose-600">5</span>
                      )}
                    </td>

                    {/* Future Months (Marzo to Diciembre) */}
                    {['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m) => (
                      <td key={m} className="p-1.5 border-r text-slate-400">
                        {apt.isExonerated ? 'EX' : '-'}
                      </td>
                    ))}

                    {/* Total USD */}
                    <td className="p-1.5 font-black text-rose-600 font-mono bg-rose-50">
                      ${debtInfo.totalUSD.toFixed(0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black">
              <tr>
                <td className="p-2 text-left uppercase border-r border-slate-700">
                  TOTAL GENERAL DEUDA:
                </td>
                <td className="p-2 border-r font-mono">
                  ${apartments.reduce((acc, a) => acc + a.previousYearsDebtUSD, 0)}
                </td>
                <td colSpan={12} className="p-2 border-r text-slate-400">
                  Simbología: <span className="text-emerald-400 font-bold">X = Solvente</span> |{' '}
                  <span className="text-rose-400 font-bold">Nº = Deuda $</span> |{' '}
                  <span className="text-blue-300 font-bold">EXONERADA = Exento</span>
                </td>
                <td className="p-2 text-emerald-400 font-mono text-xs">
                  $
                  {apartments
                    .reduce((acc, a) => acc + getApartmentDebt(a.id).totalUSD, 0)
                    .toFixed(0)}{' '}
                  USD
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
