import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { PaymentRecord } from '../types';
import {
  Building2,
  Calculator,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileCheck,
  Upload,
  User,
} from 'lucide-react';

interface PaymentFormProps {
  onPaymentRegistered: (payment: PaymentRecord) => void;
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

export const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentRegistered }) => {
  const { apartments, config, addPayment, getApartmentDebt } = useCondo();

  const [selectedAptId, setSelectedAptId] = useState<string>('00-01');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['Febrero 2026']);
  const [paymentMethod, setPaymentMethod] = useState<
    'Pago Móvil' | 'Transferencia' | 'Efectivo $' | 'Efectivo Bs' | 'Zelle'
  >('Pago Móvil');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [bankOrigin, setBankOrigin] = useState<string>('Banco de Venezuela');
  const [customUSDAmount, setCustomUSDAmount] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedApt = apartments.find((a) => a.id === selectedAptId) || apartments[0];
  const debtInfo = getApartmentDebt(selectedApt.id);

  // Calculated USD amount
  const calculatedUSD =
    customUSDAmount !== null
      ? customUSDAmount
      : selectedMonths.length * config.monthlyFeeUSD;
  const calculatedBs = calculatedUSD * config.bcvRate;

  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter((m) => m !== month));
      }
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!referenceNumber.trim() && paymentMethod !== 'Efectivo $' && paymentMethod !== 'Efectivo Bs') {
      alert('Por favor ingrese el número de referencia del pago.');
      return;
    }

    const ref =
      referenceNumber.trim() ||
      `EF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = addPayment({
      apartmentId: selectedApt.id,
      building: selectedApt.building,
      ownerName: selectedApt.ownerName,
      date: new Date().toISOString().split('T')[0],
      monthsPaid: selectedMonths,
      amountUSD: calculatedUSD,
      amountBs: calculatedBs,
      bcvRate: config.bcvRate,
      paymentMethod,
      referenceNumber: ref,
      bankOrigin,
      status: 'Aprobado',
      receiptUrl: receiptImage || undefined,
      notes,
    });

    setSuccessMsg(`¡Pago de Apto ${selectedApt.aptNumber} registrado exitosamente!`);
    setTimeout(() => setSuccessMsg(null), 4000);

    // Trigger parent view modal callback
    onPaymentRegistered(newPayment);

    // Reset fields
    setReferenceNumber('');
    setNotes('');
    setReceiptImage(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
        {/* Title */}
        <div className="border-b border-slate-100 pb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              <span>Registrar Pago de Condominio</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {config.condoName} — Tasa BCV Oficial: <span className="font-bold text-slate-800">Bs. {config.bcvRate.toFixed(2)} / $</span>
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-slate-400 block font-bold uppercase">Cuota Base</span>
            <span className="text-lg font-black text-emerald-600">${config.monthlyFeeUSD} USD</span>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Step 1: Select Apartment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Seleccionar Apartamento (32 Unidades)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select
                  value={selectedAptId}
                  onChange={(e) => {
                    setSelectedAptId(e.target.value);
                    setCustomUSDAmount(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <optgroup label="EDIFICIO 1">
                    {apartments
                      .filter((a) => a.building === 'Edificio 1')
                      .map((apt) => (
                        <option key={apt.id} value={apt.id}>
                          Apto {apt.aptNumber} - {apt.ownerName} ({apt.floor})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="EDIFICIO 2">
                    {apartments
                      .filter((a) => a.building === 'Edificio 2')
                      .map((apt) => (
                        <option key={apt.id} value={apt.id}>
                          Apto {apt.aptNumber} - {apt.ownerName} ({apt.floor})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Apartment Selected Summary Badge */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {selectedApt.ownerName}
                  </span>
                  <span className="text-slate-500">
                    {selectedApt.building} • {selectedApt.floor}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Deuda Actual
                  </span>
                  <span
                    className={`font-black text-sm ${
                      debtInfo.totalUSD > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    ${debtInfo.totalUSD.toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Select Months Being Paid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Seleccionar Meses / Conceptos a Cancelar ($5 c/u)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {AVAILABLE_MONTHS.map((month) => {
                const isSelected = selectedMonths.includes(month);
                const isAlreadyPaid = debtInfo.paidMonthsList.includes(month);
                return (
                  <button
                    type="button"
                    key={month}
                    onClick={() => toggleMonth(month)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : isAlreadyPaid
                        ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{month}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Payment Method & Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Detalles de la Transacción
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Método de Pago
                </span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Pago Móvil">Pago Móvil</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Efectivo $">Efectivo en $ (Divisas)</option>
                  <option value="Efectivo Bs">Efectivo en Bolívares</option>
                  <option value="Zelle">Zelle / Transferencia Ext.</option>
                </select>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Nº de Referencia / Confirmación
                </span>
                <input
                  type="text"
                  placeholder="Ej: 88410293"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Banco Origen / Entidad
                </span>
                <select
                  value={bankOrigin}
                  onChange={(e) => setBankOrigin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
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
          </div>

          {/* Amount Summary Calculation Box */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Total a Registrar ({selectedMonths.length} meses a $5)
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-black text-white">
                  ${calculatedUSD.toFixed(2)} USD
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  = Bs. {calculatedBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">
                Tasa BCV Aplicada: <span className="text-white font-bold">Bs. {config.bcvRate.toFixed(2)}</span>
              </span>
            </div>
          </div>

          {/* Upload Receipt / Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Adjuntar Comprobante o Captura (Opcional)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center transition bg-slate-50/50">
              {receiptImage ? (
                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={receiptImage}
                      alt="Comprobante"
                      className="w-12 h-12 object-cover rounded-lg border"
                    />
                    <span className="text-xs font-bold text-emerald-700">
                      Captura adjuntada correctamente
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptImage(null)}
                    className="text-xs text-rose-600 font-bold hover:underline px-2"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-1.5 py-2">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">
                    Haz clic aquí para seleccionar imagen del comprobante
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Soporta PNG, JPG o capturas de pantalla de Pago Móvil
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Observaciones adicionales
            </label>
            <input
              type="text"
              placeholder="Ej: Pago realizado por familiar, abono a cuenta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <FileCheck className="w-5 h-5" />
              <span>Registrar Pago y Emitir Recibo Oficial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
