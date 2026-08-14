import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import {
  Building2,
  Calculator,
  CheckCircle,
  CreditCard,
  Database,
  FileSpreadsheet,
  History,
  Mail,
  RefreshCw,
  Settings,
  Users,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenConfig }) => {
  const { config, updateConfig, isDbConnected } = useCondo();
  const [isEditingBcv, setIsEditingBcv] = useState(false);
  const [tempBcv, setTempBcv] = useState(config.bcvRate.toString());

  const handleSaveBcv = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(tempBcv);
    if (!isNaN(rate) && rate > 0) {
      updateConfig({
        bcvRate: rate,
        lastBcvUpdate: new Date().toISOString().split('T')[0],
      });
      setIsEditingBcv(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'register-payment', label: 'Registrar Pago', icon: CreditCard },
    { id: 'transactions', label: 'Historial', icon: History },
    { id: 'apartments', label: 'Morosidad y Aptos', icon: Users },
    { id: 'reports', label: 'Reportes Oficiales', icon: FileSpreadsheet },
    { id: 'notifications', label: 'Notificar Morosos', icon: Mail },
    { id: 'expenses', label: 'Gastos y Ajustes', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 print:hidden">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-md">
            B7
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white leading-tight">
              {config.condoName}
            </h1>
            <p className="text-xs font-medium text-emerald-400 flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <span>RIF: {config.rif}</span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span>2 Edificios • 32 Apartamentos</span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Database className="w-3 h-3 text-emerald-400" />
                {isDbConnected ? 'SQLite (BD Activa)' : 'Conectando SQLite...'}
              </span>
            </p>
          </div>
        </div>

        {/* BCV Tasa & Quick Stats */}
        <div className="flex items-center gap-3">
          {/* BCV Rate Pill */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow-inner">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Tasa BCV Oficial
              </span>
              {isEditingBcv ? (
                <form onSubmit={handleSaveBcv} className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="number"
                    step="0.01"
                    value={tempBcv}
                    onChange={(e) => setTempBcv(e.target.value)}
                    className="w-20 bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded text-xs font-bold border border-emerald-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[11px] font-bold"
                  >
                    OK
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingBcv(true)}
                  className="font-extrabold text-white hover:text-emerald-300 transition flex items-center gap-1 text-sm"
                  title="Haz clic para actualizar la Tasa BCV"
                >
                  Bs. {config.bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} / $
                  <span className="text-[10px] text-emerald-400 font-normal underline">
                    (Cambiar)
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Monthly Fee Pill */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-1.5 hidden sm:block">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Cuota Mensual
            </span>
            <span className="text-sm font-extrabold text-emerald-400">
              ${config.monthlyFeeUSD} USD{' '}
              <span className="text-slate-300 text-xs font-normal">
                (Bs.{' '}
                {(config.monthlyFeeUSD * config.bcvRate).toLocaleString('es-VE', {
                  maximumFractionDigits: 2,
                })}
                )
              </span>
            </span>
          </div>

          {/* Config Button */}
          <button
            onClick={onOpenConfig}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition shadow-sm"
            title="Configuración de Datos Bancarios y Condominio"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
