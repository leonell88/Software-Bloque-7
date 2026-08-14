import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { ExpenseRecord } from '../types';
import { DollarSign, Plus, Trash2, TrendingUp } from 'lucide-react';

export const ExpenseManager: React.FC = () => {
  const { expenses, addExpense, deleteExpense, config } = useCondo();

  const [category, setCategory] = useState<string>('C.A. Hidrológica del Caribe');
  const [description, setDescription] = useState<string>('');
  const [amountBs, setAmountBs] = useState<string>('');
  const [status, setStatus] = useState<'Pagado' | 'Pendiente'>('Pagado');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bs = parseFloat(amountBs);
    if (isNaN(bs) || bs <= 0) return;

    const usd = bs / config.bcvRate;

    addExpense({
      category,
      description: description.trim() || category,
      amountBs: bs,
      amountUSD: usd,
      bcvRate: config.bcvRate,
      date: new Date().toISOString().split('T')[0],
      period: '2026-02',
      status,
    });

    setDescription('');
    setAmountBs('');
  };

  const totalPaidExpensesBs = expenses
    .filter((e) => e.status === 'Pagado')
    .reduce((acc, e) => acc + e.amountBs, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Gestión de Gastos Fijos y Operativos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registro de egresos (Hidrológica, Corpoelec, Aseo, Obrero) que se reflejan en las cuentas del condominio.
          </p>
        </div>

        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold">
          Total Gastos Ejecutados: <span className="text-emerald-400 font-extrabold text-sm">Bs. {totalPaidExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">
            Registrar Nuevo Gasto / Egreso
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoría del Gasto</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl p-2.5 font-semibold"
              >
                <option value="C.A. Hidrológica del Caribe">C.A. Hidrológica del Caribe</option>
                <option value="Recibar (Servicio de Aseo)">Recibar (Servicio de Aseo)</option>
                <option value="Corpoelec">Corpoelec</option>
                <option value="Pago de Obrero">Pago de Obrero / Mantenimiento</option>
                <option value="Mantenimiento de Bomba de Agua">Mantenimiento Bomba de Agua</option>
                <option value="Limpieza de Casilla">Limpieza de Casilla y Pasillos</option>
                <option value="Materiales y Pintura">Materiales, Pintura y Llaves</option>
                <option value="Comisiones Bancarias">Comisiones Bancarias</option>
                <option value="Otros Gastos">Otros Gastos Imprevistos</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Descripción / Concepto</label>
              <input
                type="text"
                placeholder="Ej: Edwuar Caigua mantenimiento..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-xl p-2.5 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Monto en Bolívares (Bs.)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej: 16500.00"
                value={amountBs}
                onChange={(e) => setAmountBs(e.target.value)}
                className="w-full border rounded-xl p-2.5 font-mono font-bold"
                required
              />
              {amountBs && (
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                  Equivalente USD: ${(parseFloat(amountBs) / config.bcvRate).toFixed(2)} USD
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estado del Pago</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border rounded-xl p-2.5 font-semibold"
              >
                <option value="Pagado">Pagado / Ejecutado</option>
                <option value="Pendiente">Pendiente por Pagar</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Gasto al Condominio</span>
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 mb-3">
            Lista de Gastos Registrados ({expenses.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Concepto</th>
                  <th className="p-3 text-right">Monto (Bs)</th>
                  <th className="p-3 text-right">Monto ($)</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-center">Eliminar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{exp.category}</td>
                    <td className="p-3 text-slate-600 truncate max-w-xs">{exp.description}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      Bs. {exp.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      ${exp.amountUSD.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          exp.status === 'Pagado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
