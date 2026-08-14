import React from 'react';
import { useCondo } from '../context/CondoContext';
import { PaymentRecord } from '../types';
import { CheckCircle2, Download, Printer, X } from 'lucide-react';

interface ReceiptModalProps {
  payment: PaymentRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  const { config, apartments } = useCondo();

  if (!payment) return null;

  const apartment = apartments.find((a) => a.id === payment.apartmentId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Comprobante Oficial de Pago</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition border border-slate-700"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aceptar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="receipt-printable-area" className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
              {config.condoName}
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              RIF: {config.rif} | {config.subTitle}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Email: {config.email} | Banco: {config.bankName} Cta: {config.bankAccountNumber}
            </p>
            <div className="mt-3 inline-block bg-slate-100 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full border border-slate-300">
              RECIBO DE CONDOMINIO Nº {payment.id}
            </div>
          </div>

          {/* Receipt Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Apartamento</p>
              <p className="font-bold text-slate-900 text-base">
                Apto. {apartment?.aptNumber || payment.apartmentId} ({payment.building})
              </p>
              <p className="text-xs text-slate-600">{apartment?.floor}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Propietario / Residente</p>
              <p className="font-semibold text-slate-900">{payment.ownerName}</p>
              <p className="text-xs text-slate-500">{apartment?.email || payment.notes}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Fecha de Registro</p>
              <p className="font-medium text-slate-800">{payment.date}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Estado del Pago</p>
              <span
                className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  payment.status === 'Aprobado'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : payment.status === 'Pendiente'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {payment.status}
              </span>
            </div>
          </div>

          {/* Payment Concepts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Conceptos Cancelados
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Concepto / Mes</th>
                    <th className="p-3 text-right">Monto ($ USD)</th>
                    <th className="p-3 text-right">Tasa BCV</th>
                    <th className="p-3 text-right">Monto (Bs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payment.monthsPaid.map((month, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">
                        Cuota de Condominio - {month}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900">
                        ${(payment.amountUSD / payment.monthsPaid.length).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        Bs. {payment.bcvRate.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900">
                        Bs.{' '}
                        {(
                          (payment.amountUSD / payment.monthsPaid.length) *
                          payment.bcvRate
                        ).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold">
                  <tr>
                    <td className="p-3">TOTAL CANCELADO</td>
                    <td className="p-3 text-right">${payment.amountUSD.toFixed(2)} USD</td>
                    <td className="p-3 text-right text-slate-300">Rate: {payment.bcvRate}</td>
                    <td className="p-3 text-right text-emerald-400">
                      Bs.{' '}
                      {payment.amountBs.toLocaleString('es-VE', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Method and Reference */}
          <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="font-semibold text-slate-500 block">Forma de Pago:</span>
              <span className="font-bold text-slate-900">{payment.paymentMethod}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block">Nº Referencia:</span>
              <span className="font-mono font-bold text-slate-900">{payment.referenceNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block">Banco Origen / Caja:</span>
              <span className="font-bold text-slate-900">{payment.bankOrigin}</span>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <span className="font-bold text-amber-900">Observaciones: </span>
              {payment.notes}
            </div>
          )}

          {/* Signatures & Seal */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-900">{payment.ownerName}</p>
              <p className="text-slate-500 text-[10px]">Firma de Conformidad / Propietario</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-900">Junta de Condominio Bloque 7</p>
              <p className="text-slate-500 text-[10px]">Sello y Firma Administradora</p>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-[10px] text-center text-slate-400 border-t border-slate-100 pt-3">
            <p>Recuerde que su pago a tiempo contribuye a ejecutar mejoras en la residencia y la revaloración de su inmueble.</p>
            <p className="mt-0.5">Generado electrónicamente por el Sistema de Condominio Bloque 7 Los Cocalitos.</p>
          </div>
        </div>

        {/* Modal Bottom Actions Bar (Hidden on print) */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pago registrado exitosamente en el sistema.</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aceptar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
