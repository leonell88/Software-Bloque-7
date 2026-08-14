import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { PaymentRecord } from '../types';
import { EditPaymentModal } from './EditPaymentModal';
import {
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Filter,
  History,
  Printer,
  Search,
  X,
  XCircle,
} from 'lucide-react';

interface TransactionHistoryProps {
  onSelectPayment: (payment: PaymentRecord) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onSelectPayment }) => {
  const { payments, updatePaymentStatus, config } = useCondo();

  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.apartmentId.toLowerCase().includes(search.toLowerCase()) ||
      p.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.bankOrigin.toLowerCase().includes(search.toLowerCase());

    const matchesBuilding = buildingFilter === 'Todos' || p.building === buildingFilter;
    const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;

    return matchesSearch && matchesBuilding && matchesStatus;
  });

  const exportCSV = () => {
    const headers = [
      'ID',
      'Apartamento',
      'Edificio',
      'Propietario',
      'Fecha',
      'Meses Pagados',
      'Monto USD',
      'Tasa BCV',
      'Monto Bs',
      'Método',
      'Referencia',
      'Banco',
      'Estado',
    ];

    const rows = filteredPayments.map((p) => [
      p.id,
      p.apartmentId,
      p.building,
      `"${p.ownerName}"`,
      p.date,
      `"${p.monthsPaid.join(', ')}"`,
      p.amountUSD,
      p.bcvRate,
      p.amountBs,
      p.paymentMethod,
      p.referenceNumber,
      p.bankOrigin,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historial_pagos_bloque7_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <span>Historial de Transacciones y Pagos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registro continuo actualizado en tiempo real. {payments.length} transacciones registradas.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportar Historial (CSV)</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar propietario, apto o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Building Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            <option value="Todos">Todos los Edificios</option>
            <option value="Edificio 1">Edificio 1</option>
            <option value="Edificio 2">Edificio 2</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Aprobado">Solo Aprobados</option>
            <option value="Pendiente">Solo Pendientes</option>
            <option value="Rechazado">Solo Rechazados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Nº Recibo</th>
                <th className="p-3.5">Apto</th>
                <th className="p-3.5">Propietario</th>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Meses Cancelados</th>
                <th className="p-3.5 text-right">Monto ($)</th>
                <th className="p-3.5 text-right">Monto (Bs)</th>
                <th className="p-3.5">Método / Ref</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No se encontraron transacciones registradas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{p.id}</td>
                    <td className="p-3.5">
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        {p.apartmentId}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{p.ownerName}</td>
                    <td className="p-3.5 text-slate-600">{p.date}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">
                      {p.monthsPaid.join(', ')}
                    </td>
                    <td className="p-3.5 text-right font-black text-slate-900">
                      ${p.amountUSD.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-700">
                      Bs. {p.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5">
                      <span className="block font-bold text-slate-800">{p.paymentMethod}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        Ref: {p.referenceNumber} ({p.bankOrigin})
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                          p.status === 'Aprobado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : p.status === 'Pendiente'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectPayment(p)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-[10px] transition shadow-xs"
                          title="Ver y Emitir Recibo"
                        >
                          Ver Recibo
                        </button>

                        <button
                          onClick={() => setEditingPayment(p)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[10px] transition shadow-xs"
                          title="Editar Registro de Pago"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        {p.status === 'Pendiente' && (
                          <>
                            <button
                              onClick={() => updatePaymentStatus(p.id, 'Aprobado')}
                              className="p-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition"
                              title="Aprobar Pago"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(p.id, 'Rechazado')}
                              className="p-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition"
                              title="Rechazar Pago"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Payment Modal */}
      <EditPaymentModal
        payment={editingPayment}
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
      />
    </div>
  );
};
