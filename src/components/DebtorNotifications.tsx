import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { Apartment } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Mail,
  Send,
  UserCheck,
  X,
} from 'lucide-react';

interface DebtorNotificationsProps {
  initialTargetApt?: Apartment | null;
}

export const DebtorNotifications: React.FC<DebtorNotificationsProps> = ({ initialTargetApt }) => {
  const {
    apartments,
    config,
    getApartmentDebt,
    notifications,
    sendEmailNotification,
    sendBulkNotifications,
  } = useCondo();

  const [selectedAptId, setSelectedAptId] = useState<string>(
    initialTargetApt ? initialTargetApt.id : 'ALL'
  );

  const [emailSubject, setEmailSubject] = useState<string>(
    'RECORDATORIO URGENTE DE PAGO DE CONDOMINIO - BLOQUE 7 LOS COCALITOS'
  );

  const [emailTemplate, setEmailTemplate] = useState<string>(
    `Estimado(a) {propietario},

Le saludamos desde la Junta de Condominio del CONJUNTO RESIDENCIAL BLOQUE 7 LOS COCALITOS (RIF: J-505736027).

Le recordamos cordialmente que el Apartamento {apartamento} presenta una cuota pendiente de pago:
• Deuda Total USD: ${"{deuda_usd}"} USD
• Deuda Total Bolívares (Tasa BCV {tasa_bcv}): Bs. ${"{deuda_bs}"}

Agradecemos realizar su transferencia o Pago Móvil a la mayor brevedad posible para mantener al día los servicios esenciales de nuestro conjunto (Agua, Servicio de Aseo Recibar, Electricidad Corpoelec y Limpieza de Áreas Comunes).

Datos Bancarios Oficiales:
- Banco de Venezuela (Cuenta Corriente)
- Nº de Cuenta: 0102-0662-61-0000501033
- RIF: J-505736027
- Titular: CONJUNTO RESIDENCIAL BLOQUE 7 LOS COCALITOS
- Email de soporte: condominiolacolinaetapaoncec7@gmail.com

Al realizar su pago, por favor remita la captura o número de referencia por esta vía.

Atentamente,
Junta de Condominio Bloque 7 Los Cocalitos`
  );

  const [previewApt, setPreviewApt] = useState<Apartment | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Debtor list calculation
  const debtorsList = apartments
    .map((apt) => ({ apt, debt: getApartmentDebt(apt.id) }))
    .filter((item) => item.debt.totalUSD > 0 && !item.apt.isExonerated);

  const handleSendSingle = (apt: Apartment) => {
    const debtInfo = getApartmentDebt(apt.id);
    const parsedMessage = emailTemplate
      .replace(/{propietario}/g, apt.ownerName)
      .replace(/{apartamento}/g, apt.aptNumber)
      .replace(/{deuda_usd}/g, debtInfo.totalUSD.toFixed(2))
      .replace(
        /{deuda_bs}/g,
        debtInfo.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })
      )
      .replace(/{tasa_bcv}/g, config.bcvRate.toFixed(2));

    sendEmailNotification({
      apartmentId: apt.id,
      ownerName: apt.ownerName,
      email: apt.email,
      subject: emailSubject,
      message: parsedMessage,
      status: 'Enviado',
      debtMonthsCount: debtInfo.unpaidMonthsList.length,
      debtAmountUSD: debtInfo.totalUSD,
      debtAmountBs: debtInfo.totalBs,
    });

    setSuccessMsg(`Notificación enviada con éxito a ${apt.ownerName} (${apt.email})`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSendAll = () => {
    if (
      window.confirm(
        `¿Desea enviar la notificación por correo electrónico a los ${debtorsList.length} apartamentos morosos?`
      )
    ) {
      const debtorIds = debtorsList.map((d) => d.apt.id);
      const count = sendBulkNotifications(debtorIds, emailSubject, undefined);
      setSuccessMsg(`¡Se enviaron ${count} notificaciones automáticas por correo exitosamente!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            <span>Notificaciones Automáticas a Morosos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Módulo de cobro preventivo vía correo electrónico para asegurar la puntualidad en los pagos del Bloque 7.
          </p>
        </div>

        <button
          onClick={handleSendAll}
          disabled={debtorsList.length === 0}
          className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs sm:text-sm transition shadow-md"
        >
          <Send className="w-4 h-4" />
          <span>Enviar Notificación Masiva a Todos ({debtorsList.length} Morosos)</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Email Template Config */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">
            Plantilla de Correo Personalizable
          </h3>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Asunto del Mensaje
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Cuerpo del Mensaje
            </label>
            <textarea
              rows={12}
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono leading-relaxed"
            ></textarea>
            <p className="text-[10px] text-slate-400 mt-1">
              Variables dinámicas: <code className="font-bold text-slate-700">{'{propietario}'}</code>,{' '}
              <code className="font-bold text-slate-700">{'{apartamento}'}</code>,{' '}
              <code className="font-bold text-slate-700">{'{deuda_usd}'}</code>,{' '}
              <code className="font-bold text-slate-700">{'{deuda_bs}'}</code>,{' '}
              <code className="font-bold text-slate-700">{'{tasa_bcv}'}</code>
            </p>
          </div>
        </div>

        {/* Column 2: Debtors Table & Send Controls */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Lista de Apartamentos con Deuda ({debtorsList.length})
            </h3>
            <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Total Acumulado: $
              {debtorsList
                .reduce((acc, d) => acc + d.debt.totalUSD, 0)
                .toFixed(2)}{' '}
              USD
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Apto</th>
                  <th className="p-3">Propietario / Correo</th>
                  <th className="p-3 text-right">Deuda ($)</th>
                  <th className="p-3 text-right">Deuda (Bs)</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {debtorsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-emerald-600 font-bold">
                      🎉 ¡Felicidades! Todos los apartamentos están al día en sus pagos de condominio.
                    </td>
                  </tr>
                ) : (
                  debtorsList.map(({ apt, debt }) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-extrabold text-slate-900">
                        {apt.aptNumber} ({apt.building})
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{apt.ownerName}</span>
                        <span className="text-slate-500 text-[11px]">{apt.email}</span>
                      </td>
                      <td className="p-3 text-right font-black text-rose-600">
                        ${debt.totalUSD.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        Bs. {debt.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPreviewApt(apt)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="Previsualizar mensaje"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSendSingle(apt)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] transition flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Enviar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Notifications Log */}
          <div className="pt-4 border-t">
            <h4 className="font-bold text-slate-800 text-xs mb-3">
              Histórico de Notificaciones Enviadas ({notifications.length})
            </h4>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border rounded-xl text-xs">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  No se han despachado correos de cobranza en esta sesión.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{notif.ownerName}</span>{' '}
                      <span className="text-slate-500 text-[11px]">({notif.email})</span>
                      <p className="text-[10px] text-slate-400">
                        {notif.sentAt} • Deuda notificada: ${notif.debtAmountUSD} USD
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {notif.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Email Modal */}
      {previewApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Vista Previa del Correo para {previewApt.ownerName}
              </h3>
              <button
                onClick={() => setPreviewApt(null)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono space-y-2 whitespace-pre-wrap">
              <p className="font-bold text-slate-800 border-b pb-1 font-sans">
                Para: {previewApt.email}
              </p>
              <p className="font-bold text-slate-800 border-b pb-1 font-sans">
                Asunto: {emailSubject}
              </p>
              <div className="pt-2 text-slate-700 leading-relaxed">
                {emailTemplate
                  .replace(/{propietario}/g, previewApt.ownerName)
                  .replace(/{apartamento}/g, previewApt.aptNumber)
                  .replace(
                    /{deuda_usd}/g,
                    getApartmentDebt(previewApt.id).totalUSD.toFixed(2)
                  )
                  .replace(
                    /{deuda_bs}/g,
                    getApartmentDebt(previewApt.id).totalBs.toLocaleString('es-VE', {
                      minimumFractionDigits: 2,
                    })
                  )
                  .replace(/{tasa_bcv}/g, config.bcvRate.toFixed(2))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewApt(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  handleSendSingle(previewApt);
                  setPreviewApt(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Ahora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
