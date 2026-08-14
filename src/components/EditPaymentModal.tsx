import React, { useState, useEffect } from 'react';
import { useCondo } from '../context/CondoContext';
import { PaymentRecord } from '../types';
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  DollarSign,
  Edit3,
  FileCheck,
  Hash,
  Save,
  User,
  X,
} from 'lucide-react';

interface EditPaymentModalProps {
  payment: PaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_MONTHS = [
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

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  const { apartments, updatePayment, config } = useCondo();

  const [selectedAptId, setSelectedAptId] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const [amountBs, setAmountBs] = useState<number>(0);
  const [bcvRate, setBcvRate] = useState<number>(config.bcvRate);
  const [paymentMethod, setPaymentMethod] = useState<
    'Pago Móvil' | 'Transferencia' | 'Efectivo $' | 'Efectivo Bs' | 'Zelle'
  >('Pago Móvil');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [bankOrigin, setBankOrigin] = useState<string>('Banco de Venezuela');
  const [status, setStatus] = useState<'Aprobado' | 'Pendiente' | 'Rechazado'>('Aprobado');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (payment) {
      setSelectedAptId(payment.apartmentId);
      setOwnerName(payment.ownerName);
      setDate(payment.date);
      setSelectedMonths(payment.monthsPaid || []);
      setAmountUSD(payment.amountUSD);
      setAmountBs(payment.amountBs);
      setBcvRate(payment.bcvRate || config.bcvRate);
      setPaymentMethod(payment.paymentMethod);
      setReferenceNumber(payment.referenceNumber);
      setBankOrigin(payment.bankOrigin);
      setStatus(payment.status);
      setNotes(payment.notes || '');
    }
  }, [payment, config.bcvRate]);

  if (!isOpen || !payment) return null;

  const handleAptChange = (newAptId: string) => {
    setSelectedAptId(newAptId);
    const apt = apartments.find((a) => a.id === newAptId);
    if (apt) {
      setOwnerName(apt.ownerName);
    }
  };

  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      if (selectedMonths.length > 1) {
        const next = selectedMonths.filter((m) => m !== month);
        setSelectedMonths(next);
        const newUsd = next.length * config.monthlyFeeUSD;
        setAmountUSD(newUsd);
        setAmountBs(newUsd * bcvRate);
      }
    } else {
      const next = [...selectedMonths, month];
      setSelectedMonths(next);
      const newUsd = next.length * config.monthlyFeeUSD;
      setAmountUSD(newUsd);
      setAmountBs(newUsd * bcvRate);
    }
  };

  const handleUsdChange = (val: number) => {
    setAmountUSD(val);
    setAmountBs(val * bcvRate);
  };

  const handleBcvChange = (val: number) => {
    setBcvRate(val);
    setAmountBs(amountUSD * val);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedApt = apartments.find((a) => a.id === selectedAptId);

    updatePayment(payment.id, {
      apartmentId: selectedAptId,
      building: selectedApt?.building || payment.building,
      ownerName: ownerName.trim() || selectedApt?.ownerName || payment.ownerName,
      date,
      monthsPaid: selectedMonths,
      amountUSD: Number(amountUSD),
      amountBs: Number(amountBs),
      bcvRate: Number(bcvRate),
      paymentMethod,
      referenceNumber: referenceNumber.trim() || payment.referenceNumber,
      bankOrigin,
      status,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Edit3 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-black">Editar Transacción de Pago</h2>
              <p className="text-[11px] text-slate-400 font-mono">Recibo Nº {payment.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-slate-800 max-h-[80vh] overflow-y-auto">
          {/* Apartment and Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Apartamento
              </label>
              <select
                value={selectedAptId}
                onChange={(e) => handleAptChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <optgroup label="EDIFICIO 1">
                  {apartments
                    .filter((a) => a.building === 'Edificio 1')
                    .map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        Apto {apt.aptNumber} - {apt.ownerName}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="EDIFICIO 2">
                  {apartments
                    .filter((a) => a.building === 'Edificio 2')
                    .map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        Apto {apt.aptNumber} - {apt.ownerName}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre del Propietario / Titular
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Date and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha del Pago
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estado de la Transacción
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Aprobado">Aprobado (Solvente)</option>
                <option value="Pendiente">Pendiente de Conciliación</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
          </div>

          {/* Months Paid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Meses Cancelados en este Recibo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_MONTHS.map((month) => {
                const isSelected = selectedMonths.includes(month);
                return (
                  <button
                    type="button"
                    key={month}
                    onClick={() => toggleMonth(month)}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{month}</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amounts: USD, BCV Rate, Bs */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Monto ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountUSD}
                  onChange={(e) => handleUsdChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Tasa BCV Aplicada
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={bcvRate}
                  onChange={(e) => handleBcvChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Monto en Bolívares (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountBs}
                  onChange={(e) => setAmountBs(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Cambiar el monto USD o la tasa BCV recalculará el monto en Bolívares automáticamente.
            </p>
          </div>

          {/* Payment Method, Ref, Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Pago Móvil">Pago Móvil</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo $">Efectivo $</option>
                <option value="Efectivo Bs">Efectivo Bs</option>
                <option value="Zelle">Zelle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nº de Referencia
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Banco Origen / Entidad
              </label>
              <select
                value={bankOrigin}
                onChange={(e) => setBankOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Banco de Venezuela">Banco de Venezuela</option>
                <option value="Banesco">Banesco</option>
                <option value="Mercantil">Mercantil</option>
                <option value="BBVA Provincial">BBVA Provincial</option>
                <option value="BNC">BNC</option>
                <option value="BFC">BFC</option>
                <option value="Bancamiga">Bancamiga</option>
                <option value="Caja Chica / Efectivo">Caja Chica / Efectivo</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Observaciones / Notas
            </label>
            <input
              type="text"
              placeholder="Notas u observaciones del pago..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
