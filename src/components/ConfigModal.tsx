import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { Building2, RefreshCw, Save, Settings, X } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, resetAllData } = useCondo();

  const [formConfig, setFormConfig] = useState(config);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formConfig);
    onClose();
  };

  const handleReset = () => {
    if (
      window.confirm(
        '¿Está seguro de restablecer todos los datos a la configuración inicial? Esto restaurará las cuentas y apartamentos por defecto.'
      )
    ) {
      resetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Configuración del Condominio
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre del Conjunto Residencial</label>
            <input
              type="text"
              value={formConfig.condoName}
              onChange={(e) => setFormConfig({ ...formConfig, condoName: e.target.value })}
              className="w-full border rounded-xl p-2.5 font-bold text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">RIF de la Junta</label>
              <input
                type="text"
                value={formConfig.rif}
                onChange={(e) => setFormConfig({ ...formConfig, rif: e.target.value })}
                className="w-full border rounded-xl p-2.5 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formConfig.email}
                onChange={(e) => setFormConfig({ ...formConfig, email: e.target.value })}
                className="w-full border rounded-xl p-2.5 font-semibold"
                required
              />
            </div>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-bold text-slate-900 mb-2">Datos Bancarios para Recaudación</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Entidad Bancaria</label>
                <input
                  type="text"
                  value={formConfig.bankName}
                  onChange={(e) => setFormConfig({ ...formConfig, bankName: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Tipo de Cuenta</label>
                <input
                  type="text"
                  value={formConfig.bankAccountType}
                  onChange={(e) => setFormConfig({ ...formConfig, bankAccountType: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-semibold"
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="block font-medium text-slate-600 mb-1">Número de Cuenta</label>
              <input
                type="text"
                value={formConfig.bankAccountNumber}
                onChange={(e) => setFormConfig({ ...formConfig, bankAccountNumber: e.target.value })}
                className="w-full border rounded-xl p-2.5 font-mono font-bold text-slate-900"
                required
              />
            </div>

            <div className="mt-2">
              <label className="block font-medium text-slate-600 mb-1">Titular de la Cuenta</label>
              <input
                type="text"
                value={formConfig.bankAccountOwner}
                onChange={(e) => setFormConfig({ ...formConfig, bankAccountOwner: e.target.value })}
                className="w-full border rounded-xl p-2.5 font-semibold"
                required
              />
            </div>
          </div>

          <div className="border-t pt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tasa BCV Oficial (Bs/$)</label>
              <input
                type="number"
                step="0.01"
                value={formConfig.bcvRate}
                onChange={(e) => setFormConfig({ ...formConfig, bcvRate: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-xl p-2.5 font-mono font-bold text-emerald-700"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cuota Mensual ($ USD)</label>
              <input
                type="number"
                value={formConfig.monthlyFeeUSD}
                onChange={(e) => setFormConfig({ ...formConfig, monthlyFeeUSD: parseFloat(e.target.value) || 5 })}
                className="w-full border rounded-xl p-2.5 font-mono font-bold text-slate-900"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer Datos</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Ajustes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
