import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { Apartment } from '../types';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit2,
  Mail,
  Phone,
  Search,
  User,
  X,
} from 'lucide-react';

interface ApartmentsListProps {
  onOpenNotifyDebtor: (apt: Apartment) => void;
  onRegisterPaymentForApt: (aptId: string) => void;
}

export const ApartmentsList: React.FC<ApartmentsListProps> = ({
  onOpenNotifyDebtor,
  onRegisterPaymentForApt,
}) => {
  const { apartments, updateApartment, config, getApartmentDebt } = useCondo();

  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<'Todos' | 'Edificio 1' | 'Edificio 2'>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Morosos' | 'Solventes'>('Todos');

  // Edit Modal State
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);

  const filteredApartments = apartments.filter((apt) => {
    const matchesSearch =
      apt.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      apt.aptNumber.toLowerCase().includes(search.toLowerCase()) ||
      apt.email.toLowerCase().includes(search.toLowerCase());

    const matchesBuilding = buildingFilter === 'Todos' || apt.building === buildingFilter;

    const debtInfo = getApartmentDebt(apt.id);
    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Morosos' && !debtInfo.isSolvent) ||
      (statusFilter === 'Solventes' && debtInfo.isSolvent);

    return matchesSearch && matchesBuilding && matchesStatus;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApt) return;
    updateApartment(editingApt.id, {
      ownerName: editingApt.ownerName,
      phone: editingApt.phone,
      email: editingApt.email,
      previousYearsDebtUSD: editingApt.previousYearsDebtUSD,
      isExonerated: editingApt.isExonerated,
    });
    setEditingApt(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Control de Apartamentos y Morosidad</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión individual de los 32 apartamentos del Bloque 7 (PB a Piso 3).
          </p>
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBuildingFilter('Todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              buildingFilter === 'Todos'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos (32)
          </button>
          <button
            onClick={() => setBuildingFilter('Edificio 1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              buildingFilter === 'Edificio 1'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Edificio 1 (16)
          </button>
          <button
            onClick={() => setBuildingFilter('Edificio 2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              buildingFilter === 'Edificio 2'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Edificio 2 (16)
          </button>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por propietario, apto o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('Todos')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'Todos'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('Morosos')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'Morosos'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Ver Morosos
          </button>
          <button
            onClick={() => setStatusFilter('Solventes')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'Solventes'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Ver Solventes
          </button>
        </div>
      </div>

      {/* Apartments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApartments.map((apt) => {
          const debtInfo = getApartmentDebt(apt.id);
          return (
            <div
              key={apt.id}
              className={`bg-white rounded-2xl p-5 border transition shadow-sm hover:shadow-md relative flex flex-col justify-between ${
                apt.isExonerated
                  ? 'border-blue-200 bg-blue-50/20'
                  : debtInfo.isSolvent
                  ? 'border-emerald-200'
                  : 'border-rose-200 bg-rose-50/10'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                      {apt.aptNumber}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {apt.building}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{apt.floor}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                      apt.isExonerated
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : debtInfo.isSolvent
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {apt.isExonerated
                      ? 'Exonerado'
                      : debtInfo.isSolvent
                      ? 'Solvente'
                      : 'Deuda Pendiente'}
                  </span>
                </div>

                {/* Owner info */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-sm">{apt.ownerName}</h3>
                    <button
                      onClick={() => setEditingApt(apt)}
                      className="p-1 text-slate-400 hover:text-slate-800 transition"
                      title="Editar Datos del Propietario"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{apt.email}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{apt.phone}</span>
                  </p>
                </div>

                {/* Debt details box */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Deuda Años Anteriores:</span>
                    <span className="font-bold">${apt.previousYearsDebtUSD} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Meses 2026 Pendientes:</span>
                    <span className="font-bold">{debtInfo.unpaidMonthsList.length} meses</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-900 font-extrabold text-sm">
                    <span>TOTAL DEUDA:</span>
                    <span className={debtInfo.totalUSD > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      ${debtInfo.totalUSD.toFixed(2)} USD
                    </span>
                  </div>
                  {debtInfo.totalUSD > 0 && (
                    <div className="text-[10px] text-right font-bold text-rose-500">
                      Bs. {debtInfo.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onRegisterPaymentForApt(apt.id)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition text-center"
                >
                  Registrar Pago
                </button>
                {!debtInfo.isSolvent && (
                  <button
                    onClick={() => onOpenNotifyDebtor(apt)}
                    className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl transition"
                    title="Enviar Recordatorio por Correo"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Resident Modal */}
      {editingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Editar Apto {editingApt.aptNumber} ({editingApt.building})
              </h3>
              <button
                onClick={() => setEditingApt(null)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Propietario</label>
                <input
                  type="text"
                  value={editingApt.ownerName}
                  onChange={(e) => setEditingApt({ ...editingApt, ownerName: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editingApt.email}
                  onChange={(e) => setEditingApt({ ...editingApt, email: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={editingApt.phone}
                  onChange={(e) => setEditingApt({ ...editingApt, phone: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deuda Acumulada Años Anteriores ($ USD)
                </label>
                <input
                  type="number"
                  value={editingApt.previousYearsDebtUSD}
                  onChange={(e) =>
                    setEditingApt({
                      ...editingApt,
                      previousYearsDebtUSD: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="exoneratedCheck"
                  checked={editingApt.isExonerated || false}
                  onChange={(e) =>
                    setEditingApt({ ...editingApt, isExonerated: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="exoneratedCheck" className="font-bold text-slate-700">
                  Unidad Exonerada de Condominio
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
