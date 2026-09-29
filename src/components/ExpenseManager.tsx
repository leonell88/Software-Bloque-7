import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { Apartment, ExpenseRecord } from '../types';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  DollarSign,
  Edit2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

export const ExpenseManager: React.FC = () => {
  const {
    expenses,
    addExpense,
    deleteExpense,
    config,
    apartments,
    addApartment,
    updateApartment,
    deleteApartment,
  } = useCondo();

  // Subtab State: 'expenses' | 'owners'
  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'owners'>('expenses');

  // ================= EXPENSES STATE =================
  const [category, setCategory] = useState<string>('C.A. Hidrológica del Caribe');
  const [description, setDescription] = useState<string>('');
  const [amountBs, setAmountBs] = useState<string>('');
  const [status, setStatus] = useState<'Pagado' | 'Pendiente'>('Pagado');

  const handleExpenseSubmit = (e: React.FormEvent) => {
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
      period: new Date().toISOString().slice(0, 7),
      status,
    });

    setDescription('');
    setAmountBs('');
  };

  const totalPaidExpensesBs = expenses
    .filter((e) => e.status === 'Pagado')
    .reduce((acc, e) => acc + e.amountBs, 0);

  // ================= OWNERS / APARTMENTS STATE =================
  const [ownerSearch, setOwnerSearch] = useState<string>('');
  const [ownerBuildingFilter, setOwnerBuildingFilter] = useState<'Todos' | 'Edificio 1' | 'Edificio 2'>('Todos');

  // Modal State for New/Edit Owner
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState<boolean>(false);
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null); // null = new, string = edit
  const [ownerError, setOwnerError] = useState<string>('');
  const [ownerSuccess, setOwnerSuccess] = useState<string>('');

  // Form State for Owner
  const [formApt, setFormApt] = useState<Partial<Apartment>>({
    id: '',
    building: 'Edificio 1',
    floor: 'Planta Baja',
    aptNumber: '',
    ownerName: '',
    phone: '',
    email: '',
    previousYearsDebtUSD: 0,
    isExonerated: false,
  });

  // Delete Confirmation State
  const [deletingApt, setDeletingApt] = useState<Apartment | null>(null);

  const openNewOwnerModal = () => {
    setEditingOwnerId(null);
    setFormApt({
      id: '',
      building: 'Edificio 1',
      floor: 'Planta Baja',
      aptNumber: '',
      ownerName: '',
      phone: '',
      email: '',
      previousYearsDebtUSD: 0,
      isExonerated: false,
    });
    setOwnerError('');
    setIsOwnerModalOpen(true);
  };

  const openEditOwnerModal = (apt: Apartment) => {
    setEditingOwnerId(apt.id);
    setFormApt({
      ...apt,
    });
    setOwnerError('');
    setIsOwnerModalOpen(true);
  };

  const handleOwnerFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerError('');

    const aptId = (formApt.aptNumber || formApt.id || '').trim();
    if (!aptId) {
      setOwnerError('Debe ingresar el número de apartamento.');
      return;
    }

    if (!formApt.ownerName?.trim()) {
      setOwnerError('Debe ingresar el nombre del propietario.');
      return;
    }

    if (!editingOwnerId) {
      // Adding new owner
      const newApartment: Apartment = {
        id: aptId,
        building: formApt.building as any || 'Edificio 1',
        floor: formApt.floor as any || 'Planta Baja',
        aptNumber: aptId,
        ownerName: formApt.ownerName.trim(),
        phone: formApt.phone?.trim() || '',
        email: formApt.email?.trim() || '',
        previousYearsDebtUSD: Number(formApt.previousYearsDebtUSD) || 0,
        isExonerated: Boolean(formApt.isExonerated),
      };

      const success = addApartment(newApartment);
      if (!success) {
        setOwnerError(`Ya existe un apartamento registrado con el identificador "${aptId}".`);
        return;
      }

      setOwnerSuccess(`Propietario ${newApartment.ownerName} (${aptId}) registrado con éxito.`);
    } else {
      // Editing existing owner
      updateApartment(editingOwnerId, {
        building: formApt.building as any,
        floor: formApt.floor as any,
        aptNumber: formApt.aptNumber || editingOwnerId,
        ownerName: formApt.ownerName.trim(),
        phone: formApt.phone?.trim() || '',
        email: formApt.email?.trim() || '',
        previousYearsDebtUSD: Number(formApt.previousYearsDebtUSD) || 0,
        isExonerated: Boolean(formApt.isExonerated),
      });

      setOwnerSuccess(`Datos del propietario actualizados correctamente.`);
    }

    setIsOwnerModalOpen(false);
    setTimeout(() => setOwnerSuccess(''), 4000);
  };

  const handleConfirmDelete = () => {
    if (!deletingApt) return;
    deleteApartment(deletingApt.id);
    setOwnerSuccess(`Apartamento ${deletingApt.id} eliminado correctamente.`);
    setDeletingApt(null);
    setTimeout(() => setOwnerSuccess(''), 4000);
  };

  // Filtered owners
  const filteredApartments = apartments.filter((apt) => {
    const matchesSearch =
      apt.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      apt.aptNumber.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      apt.phone.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      apt.email.toLowerCase().includes(ownerSearch.toLowerCase());

    const matchesBuilding = ownerBuildingFilter === 'Todos' || apt.building === ownerBuildingFilter;

    return matchesSearch && matchesBuilding;
  });

  const b1Count = apartments.filter((a) => a.building === 'Edificio 1').length;
  const b2Count = apartments.filter((a) => a.building === 'Edificio 2').length;
  const exoneratedCount = apartments.filter((a) => a.isExonerated).length;

  return (
    <div className="space-y-6">
      {/* Tab Navigation: Gastos vs Propietarios */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              activeSubTab === 'expenses'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Gastos y Egresos Operativos</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
              {expenses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('owners')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              activeSubTab === 'owners'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Propietarios</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
              {apartments.length}
            </span>
          </button>
        </div>

        {activeSubTab === 'owners' && (
          <button
            onClick={openNewOwnerModal}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Propietario</span>
          </button>
        )}
      </div>

      {ownerSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{ownerSuccess}</span>
        </div>
      )}

      {/* ================= VIEW 1: GASTOS Y EGRESOS ================= */}
      {activeSubTab === 'expenses' && (
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
              Total Gastos Ejecutados:{' '}
              <span className="text-emerald-400 font-extrabold text-sm">
                Bs. {totalPaidExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Gastos */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">
                Registrar Nuevo Gasto / Egreso
              </h3>

              <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
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
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Gasto al Condominio</span>
                </button>
              </form>
            </div>

            {/* Lista de Gastos */}
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
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Eliminar gasto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No hay gastos registrados aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: GESTIÓN DE PROPIETARIOS ================= */}
      {activeSubTab === 'owners' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Apartamentos
              </span>
              <span className="text-2xl font-black text-slate-900">{apartments.length}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Edificio 1
              </span>
              <span className="text-2xl font-black text-emerald-600">{b1Count}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Edificio 2
              </span>
              <span className="text-2xl font-black text-teal-600">{b2Count}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Exonerados
              </span>
              <span className="text-2xl font-black text-amber-600">{exoneratedCount}</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por apto, nombre, teléfono..."
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-600">Filtrar:</span>
                {(['Todos', 'Edificio 1', 'Edificio 2'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOwnerBuildingFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      ownerBuildingFilter === filter
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Owners Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Apto</th>
                    <th className="p-3">Edificio / Piso</th>
                    <th className="p-3">Titular / Propietario</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">Correo</th>
                    <th className="p-3 text-right">Deuda Anterior ($)</th>
                    <th className="p-3 text-center">Exonerado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredApartments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-black text-slate-900">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                          {apt.aptNumber || apt.id}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">
                        <div className="font-bold">{apt.building}</div>
                        <div className="text-[10px] text-slate-400">{apt.floor}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {apt.ownerName}
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">
                        {apt.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{apt.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No registrado</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">
                        {apt.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[150px]">{apt.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No registrado</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700">
                        ${apt.previousYearsDebtUSD?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-3 text-center">
                        {apt.isExonerated ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                            Exonerado
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditOwnerModal(apt)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Modificar datos del propietario"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingApt(apt)}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Eliminar propietario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredApartments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        No se encontraron propietarios que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: NUEVO / MODIFICAR PROPIETARIO ================= */}
      {isOwnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                {editingOwnerId ? (
                  <Edit2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                )}
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {editingOwnerId ? 'Modificar Datos de Propietario' : 'Registrar Nuevo Propietario'}
                </h3>
              </div>
              <button
                onClick={() => setIsOwnerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ownerError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{ownerError}</span>
              </div>
            )}

            <form onSubmit={handleOwnerFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Edificio</label>
                  <select
                    value={formApt.building}
                    onChange={(e) => setFormApt({ ...formApt, building: e.target.value as any })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 font-semibold"
                    required
                  >
                    <option value="Edificio 1">Edificio 1</option>
                    <option value="Edificio 2">Edificio 2</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Piso</label>
                  <select
                    value={formApt.floor}
                    onChange={(e) => setFormApt({ ...formApt, floor: e.target.value as any })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 font-semibold"
                    required
                  >
                    <option value="Planta Baja">Planta Baja</option>
                    <option value="Piso 1">Piso 1</option>
                    <option value="Piso 2">Piso 2</option>
                    <option value="Piso 3">Piso 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Número de Apartamento</label>
                <input
                  type="text"
                  placeholder="Ej: 00-01, 01-02, 02-04..."
                  value={formApt.aptNumber}
                  onChange={(e) => setFormApt({ ...formApt, aptNumber: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  required
                  disabled={Boolean(editingOwnerId)} // Only disable ID edit when modifying to keep relation integrity
                />
                {editingOwnerId && (
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    El número identificador de apartamento no se puede alterar una vez creado.
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo del Titular</label>
                <input
                  type="text"
                  placeholder="Ej: Carlos Mendoza..."
                  value={formApt.ownerName}
                  onChange={(e) => setFormApt({ ...formApt, ownerName: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-semibold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    placeholder="Ej: 0414-1234567"
                    value={formApt.phone}
                    onChange={(e) => setFormApt({ ...formApt, phone: e.target.value })}
                    className="w-full border rounded-xl p-2.5 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formApt.email}
                    onChange={(e) => setFormApt({ ...formApt, email: e.target.value })}
                    className="w-full border rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deuda Anterior ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formApt.previousYearsDebtUSD}
                  onChange={(e) => setFormApt({ ...formApt, previousYearsDebtUSD: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-xl p-2.5 font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Monto de deuda histórica previa en dólares si aplica (por defecto 0.00).
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formApt.isExonerated || false}
                    onChange={(e) => setFormApt({ ...formApt, isExonerated: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>¿Exonerado de pago de cuota mensual?</span>
                </label>
                <p className="text-[10px] text-slate-500 mt-1 pl-6">
                  Los apartamentos exonerados no acumulan cuota mensual en las relaciones de cobro.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsOwnerModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{editingOwnerId ? 'Guardar Cambios' : 'Registrar Propietario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMAR ELIMINACIÓN ================= */}
      {deletingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">¿Eliminar Propietario?</h4>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700 border border-slate-200">
              <p>
                <strong>Apartamento:</strong> {deletingApt.aptNumber || deletingApt.id}
              </p>
              <p>
                <strong>Titular:</strong> {deletingApt.ownerName}
              </p>
              <p>
                <strong>Ubicación:</strong> {deletingApt.building} ({deletingApt.floor})
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
