import { Apartment, CondoConfig, ExpenseRecord, MonthlySummary, PaymentRecord } from '../types';

export const initialConfig: CondoConfig = {
  condoName: 'CONJUNTO RESIDENCIAL BLOQUE 7 LOS COCALITOS',
  subTitle: 'CONDOMINIO BLOQUE 7 LOS COCALITOS',
  rif: 'J-505736027',
  email: 'condominio.bloque7.cocalitos@gmail.com',
  bankName: 'Banco de Venezuela',
  bankAccountType: 'Cuenta Corriente',
  bankAccountNumber: '0102-0662-61-0000501033',
  bankAccountOwner: 'CONJUNTO RESIDENCIAL BLOQUE 7 LOS COCALITOS',
  monthlyFeeUSD: 5,
  bcvRate: 370.25,
  lastBcvUpdate: '2026-02-01',
};

export const initialApartments: Apartment[] = [
  // Planta Baja (00-01 al 00-08)
  { id: '00-01', building: 'Edificio 1', floor: 'Planta Baja', aptNumber: '00-01', ownerName: 'Ángel López', phone: '0414-1234567', email: 'alopez@gmail.com', previousYearsDebtUSD: 0 },
  { id: '00-02', building: 'Edificio 1', floor: 'Planta Baja', aptNumber: '00-02', ownerName: 'Carolina Hernández', phone: '0412-2345678', email: 'caro.hernandez@hotmail.com', previousYearsDebtUSD: 0 },
  { id: '00-03', building: 'Edificio 1', floor: 'Planta Baja', aptNumber: '00-03', ownerName: 'Sabrina Pinto', phone: '0424-3456789', email: 'sabrina.pinto@yahoo.com', previousYearsDebtUSD: 0 },
  { id: '00-04', building: 'Edificio 1', floor: 'Planta Baja', aptNumber: '00-04', ownerName: 'Carmen Canache', phone: '0416-4567890', email: 'ccanache@cantv.net', previousYearsDebtUSD: 0 },
  { id: '00-05', building: 'Edificio 2', floor: 'Planta Baja', aptNumber: '00-05', ownerName: 'Luis Ñañez', phone: '0412-5678901', email: 'lnanez@gmail.com', previousYearsDebtUSD: 0 },
  { id: '00-06', building: 'Edificio 2', floor: 'Planta Baja', aptNumber: '00-06', ownerName: 'Yrina Rivas', phone: '0424-6789012', email: 'yrina.rivas@outlook.com', previousYearsDebtUSD: 0 },
  { id: '00-07', building: 'Edificio 2', floor: 'Planta Baja', aptNumber: '00-07', ownerName: 'Jesús López', phone: '0414-7890123', email: 'jlopez@gmail.com', previousYearsDebtUSD: 0 },
  { id: '00-08', building: 'Edificio 2', floor: 'Planta Baja', aptNumber: '00-08', ownerName: 'Uver Sánchez', phone: '0412-8901234', email: 'uver.sanchez@gmail.com', previousYearsDebtUSD: 0 },

  // Piso 1 (01-01 al 01-08)
  { id: '01-01', building: 'Edificio 1', floor: 'Piso 1', aptNumber: '01-01', ownerName: 'Julián Tapisquen', phone: '0414-9012345', email: 'jtapisquen@hotmail.com', previousYearsDebtUSD: 0 },
  { id: '01-02', building: 'Edificio 1', floor: 'Piso 1', aptNumber: '01-02', ownerName: 'José Luna', phone: '0424-0123456', email: 'jluna@yahoo.es', previousYearsDebtUSD: 0 },
  { id: '01-03', building: 'Edificio 1', floor: 'Piso 1', aptNumber: '01-03', ownerName: 'Héctor Montes', phone: '0416-1234567', email: 'hmontes@gmail.com', previousYearsDebtUSD: 0 },
  { id: '01-04', building: 'Edificio 1', floor: 'Piso 1', aptNumber: '01-04', ownerName: 'Domingo Rodríguez', phone: '0412-2345678', email: 'drodriguez@outlook.com', previousYearsDebtUSD: 0 },
  { id: '01-05', building: 'Edificio 2', floor: 'Piso 1', aptNumber: '01-05', ownerName: 'Lisbeth Rivero', phone: '0414-3456789', email: 'lrivero@gmail.com', previousYearsDebtUSD: 0 },
  { id: '01-06', building: 'Edificio 2', floor: 'Piso 1', aptNumber: '01-06', ownerName: 'Reina Coraspe', phone: '0424-4567890', email: 'rcoraspe@hotmail.com', previousYearsDebtUSD: 0 },
  { id: '01-07', building: 'Edificio 2', floor: 'Piso 1', aptNumber: '01-07', ownerName: 'Argenis Aguilera', phone: '0416-5678901', email: 'aaguilera@yahoo.es', previousYearsDebtUSD: 0 },
  { id: '01-08', building: 'Edificio 2', floor: 'Piso 1', aptNumber: '01-08', ownerName: 'Airza Morales', phone: '0412-6789012', email: 'amorales@gmail.com', previousYearsDebtUSD: 0 },

  // Piso 2 (02-01 al 02-08)
  { id: '02-01', building: 'Edificio 1', floor: 'Piso 2', aptNumber: '02-01', ownerName: 'Henry Nieves', phone: '0414-7890123', email: 'hnieves@gmail.com', previousYearsDebtUSD: 0 },
  { id: '02-02', building: 'Edificio 1', floor: 'Piso 2', aptNumber: '02-02', ownerName: 'Amarilis Monroy', phone: '0424-8901234', email: 'amonroy@hotmail.com', previousYearsDebtUSD: 0 },
  { id: '02-03', building: 'Edificio 1', floor: 'Piso 2', aptNumber: '02-03', ownerName: 'Heber Figueredo', phone: '0416-9012345', email: 'hfigueredo@cantv.net', previousYearsDebtUSD: 0 },
  { id: '02-04', building: 'Edificio 1', floor: 'Piso 2', aptNumber: '02-04', ownerName: 'Enma Gómez', phone: '0412-0123456', email: 'egomez@gmail.com', previousYearsDebtUSD: 0 },
  { id: '02-05', building: 'Edificio 2', floor: 'Piso 2', aptNumber: '02-05', ownerName: 'César Gil Palermo', phone: '0414-1234567', email: 'cgil@hotmail.com', previousYearsDebtUSD: 0 },
  { id: '02-06', building: 'Edificio 2', floor: 'Piso 2', aptNumber: '02-06', ownerName: 'Rubert Velásquez', phone: '0424-2345678', email: 'rvelasquez@yahoo.es', previousYearsDebtUSD: 0 },
  { id: '02-07', building: 'Edificio 2', floor: 'Piso 2', aptNumber: '02-07', ownerName: 'Elida Petrucci', phone: '0416-3456789', email: 'epetrucci@gmail.com', previousYearsDebtUSD: 0, isExonerated: true },
  { id: '02-08', building: 'Edificio 2', floor: 'Piso 2', aptNumber: '02-08', ownerName: 'Ingrid García', phone: '0412-4567890', email: 'igarcia@outlook.com', previousYearsDebtUSD: 0 },

  // Piso 3 (03-01 al 03-08)
  { id: '03-01', building: 'Edificio 1', floor: 'Piso 3', aptNumber: '03-01', ownerName: 'Surizardys Sánchez', phone: '0414-5678901', email: 'ssanchez@gmail.com', previousYearsDebtUSD: 0, isExonerated: true },
  { id: '03-02', building: 'Edificio 1', floor: 'Piso 3', aptNumber: '03-02', ownerName: 'Isabel Gómez', phone: '0424-6789012', email: 'igomez@hotmail.com', previousYearsDebtUSD: 0 },
  { id: '03-03', building: 'Edificio 1', floor: 'Piso 3', aptNumber: '03-03', ownerName: 'Zulay Boada', phone: '0416-7890123', email: 'zboada@cantv.net', previousYearsDebtUSD: 0 },
  { id: '03-04', building: 'Edificio 1', floor: 'Piso 3', aptNumber: '03-04', ownerName: 'Carlos Cabeza', phone: '0412-8901234', email: 'ccabeza@gmail.com', previousYearsDebtUSD: 0 },
  { id: '03-05', building: 'Edificio 2', floor: 'Piso 3', aptNumber: '03-05', ownerName: 'Eduardo Fernández', phone: '0414-9012345', email: 'efernandez@outlook.com', previousYearsDebtUSD: 0 },
  { id: '03-06', building: 'Edificio 2', floor: 'Piso 3', aptNumber: '03-06', ownerName: 'Mariángel Rojas', phone: '0424-0123456', email: 'mrojas@gmail.com', previousYearsDebtUSD: 0 },
  { id: '03-07', building: 'Edificio 2', floor: 'Piso 3', aptNumber: '03-07', ownerName: 'Gabriel Medina', phone: '0416-1234567', email: 'gmedina@hotmail.com', previousYearsDebtUSD: 0 },
  { id: '03-08', building: 'Edificio 2', floor: 'Piso 3', aptNumber: '03-08', ownerName: 'Patricia Colmenares', phone: '0412-2345678', email: 'pcolmenares@gmail.com', previousYearsDebtUSD: 0 },
];

// Initial state starting completely from 0
export const initialPayments: PaymentRecord[] = [];

export const initialExpenses: ExpenseRecord[] = [];

export const initialMonthlySummaries: MonthlySummary[] = [];
