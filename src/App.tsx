import React, { useState } from 'react';
import { CondoProvider } from './context/CondoContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PaymentForm } from './components/PaymentForm';
import { TransactionHistory } from './components/TransactionHistory';
import { ApartmentsList } from './components/ApartmentsList';
import { ReportsViewer } from './components/ReportsViewer';
import { DebtorNotifications } from './components/DebtorNotifications';
import { ExpenseManager } from './components/ExpenseManager';
import { ReceiptModal } from './components/ReceiptModal';
import { ConfigModal } from './components/ConfigModal';
import { Apartment, PaymentRecord } from './types';

function CondoApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [notifyTargetApt, setNotifyTargetApt] = useState<Apartment | null>(null);

  const handlePaymentRegistered = (payment: PaymentRecord) => {
    setSelectedReceiptPayment(payment);
  };

  const handleOpenNotifyDebtor = (apt: Apartment) => {
    setNotifyTargetApt(apt);
    setActiveTab('notifications');
  };

  const handleRegisterPaymentForApt = (aptId: string) => {
    setActiveTab('register-payment');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onSelectPayment={(p) => setSelectedReceiptPayment(p)}
          />
        )}

        {activeTab === 'register-payment' && (
          <PaymentForm onPaymentRegistered={handlePaymentRegistered} />
        )}

        {activeTab === 'transactions' && (
          <TransactionHistory
            onSelectPayment={(p) => setSelectedReceiptPayment(p)}
          />
        )}

        {activeTab === 'apartments' && (
          <ApartmentsList
            onOpenNotifyDebtor={handleOpenNotifyDebtor}
            onRegisterPaymentForApt={handleRegisterPaymentForApt}
          />
        )}

        {activeTab === 'reports' && <ReportsViewer />}

        {activeTab === 'notifications' && (
          <DebtorNotifications initialTargetApt={notifyTargetApt} />
        )}

        {activeTab === 'expenses' && <ExpenseManager />}
      </main>

      {/* Modals */}
      <ReceiptModal
        payment={selectedReceiptPayment}
        onClose={() => setSelectedReceiptPayment(null)}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 print:hidden">
        <p className="font-bold text-slate-200">
          CONJUNTO RESIDENCIAL BLOQUE 7 LOS COCALITOS • RIF: J-505736027
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          2 Edificios • 32 Apartamentos (Planta Baja al Piso 3) • Tasa Oficial BCV ($5/mes)
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CondoProvider>
      <CondoApp />
    </CondoProvider>
  );
}
