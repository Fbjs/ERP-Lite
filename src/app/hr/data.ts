

export type Document = {
    name: string;
    url: string;
};

export type WorkHistoryEvent = {
    date: string;
    event: string;
    description: string;
};

export type Employee = {
    id: string;
    name: string;
    rut: string;
    email: string;
    nationality: string;
    birthDate: string;
    position: string;
    department: 'Producción' | 'Ventas' | 'Logística' | 'Administración' | 'Gerencia';
    contractType: string;
    startDate: string;
    salary: number;
    status: string;
    phone: string;
    address: string;
    healthInsurance: string;
    pensionFund: string;
    dependents: number;
    unionMember: boolean;
    bankDetails: {
        bank: string;
        accountType: string;
        accountNumber: string;
    };
    documents: Document[];
    photoUrl?: string;
    emergencyContact: {
        name: string;
        phone: string;
    };
    supervisor: string;
    workHistory: WorkHistoryEvent[];
    diasVacacionesDisponibles: number;
    diasProgresivos: number;
    shift: 'Mañana' | 'Tarde' | 'Noche' | 'Libre';
};

export const initialEmployees: Employee[] = [
  { id: 'EMP001', name: 'Juan Pérez', rut: '12.345.678-9', email: 'juan.perez@vollkorn.cl', nationality: 'Chilena', birthDate: '1985-05-20', position: 'Panadero Jefe', department: 'Producción', contractType: 'Indefinido', startDate: '2022-01-15', salary: 850000, status: 'Activo', phone: '+56987654321', address: 'Av. Siempre Viva 742', healthInsurance: 'Fonasa', pensionFund: 'Modelo', dependents: 2, unionMember: true, bankDetails: { bank: 'BancoEstado', accountType: 'CuentaRUT', accountNumber: '12345678-9' }, documents: [{name: 'Contrato.pdf', url: '#'}], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=JP', emergencyContact: { name: 'Ana Pérez', phone: '+56911112222'}, supervisor: 'Carlos Araya', workHistory: [{date: '2023-01-15', event: 'Promoción', description: 'Promovido a Panadero Jefe.'}], diasVacacionesDisponibles: 12, diasProgresivos: 2, shift: 'Mañana' },
  { id: 'EMP002', name: 'Ana Gómez', rut: '23.456.789-0', email: 'ana.gomez@vollkorn.cl', nationality: 'Peruana', birthDate: '1995-11-10', position: 'Auxiliar de Pastelería', department: 'Producción', contractType: 'Plazo Fijo', startDate: '2023-03-01', salary: 600000, status: 'Activo', phone: '+56912345678', address: 'Calle Falsa 123', healthInsurance: 'Consalud', pensionFund: 'Habitat', dependents: 0, unionMember: false, bankDetails: { bank: 'BCI', accountType: 'Corriente', accountNumber: '98765432-1' }, documents: [], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=AG', emergencyContact: { name: 'Luis Gómez', phone: '+56933334444'}, supervisor: 'Juan Pérez', workHistory: [], diasVacacionesDisponibles: 15, diasProgresivos: 0, shift: 'Tarde' },
  { id: 'EMP003', name: 'Luis Martínez', rut: '11.222.333-4', email: 'luis.martinez@vollkorn.cl', nationality: 'Chilena', birthDate: '1980-01-30', position: 'Conductor Despacho', department: 'Logística', contractType: 'Indefinido', startDate: '2021-08-20', salary: 750000, status: 'Activo', phone: '+56955554444', address: 'Pasaje Corto 45', healthInsurance: 'Cruz Blanca', pensionFund: 'Capital', dependents: 3, unionMember: true, bankDetails: { bank: 'Santander', accountType: 'Corriente', accountNumber: '0001234567' }, documents: [], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=LM', emergencyContact: { name: 'Marta Soto', phone: '+56955556666'}, supervisor: 'Ricardo Soto', workHistory: [], diasVacacionesDisponibles: 8, diasProgresivos: 1, shift: 'Mañana' },
  { id: 'EMP004', name: 'María Rodríguez', rut: '15.678.901-2', email: 'maria.rodriguez@vollkorn.cl', nationality: 'Colombiana', birthDate: '1992-09-15', position: 'Administrativa', department: 'Administración', contractType: 'Indefinido', startDate: '2020-05-10', salary: 950000, status: 'Activo', phone: '+56999998888', address: 'El Roble 1010', healthInsurance: 'Fonasa', pensionFund: 'PlanVital', dependents: 1, unionMember: false, bankDetails: { bank: 'Banco de Chile', accountType: 'Corriente', accountNumber: '1122334455' }, documents: [], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=MR', emergencyContact: { name: 'Jorge Rodríguez', phone: '+56977778888'}, supervisor: 'Carlos Araya', workHistory: [], diasVacacionesDisponibles: 18, diasProgresivos: 3, shift: 'Mañana' },
];


export type LeaveType = 'Vacaciones' | 'Licencia Médica' | 'Permiso sin Goce' | 'Permiso Justificado';

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Employee['department'];
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  justification?: string;
};

export const initialLeaveRequests: LeaveRequest[] = [
  { id: 'LV-001', employeeId: 'EMP003', employeeName: 'Luis Martínez', department: 'Logística', leaveType: 'Vacaciones', startDate: new Date(2024, 6, 20), endDate: new Date(2024, 6, 26), days: 5, status: 'Aprobado', justification: 'Viaje familiar' },
  { id: 'LV-002', employeeId: 'EMP002', employeeName: 'Ana Gómez', department: 'Producción', leaveType: 'Licencia Médica', startDate: new Date(2024, 6, 22), endDate: new Date(2024, 6, 24), days: 3, status: 'Aprobado', justification: 'Reposo médico por 3 días' },
  { id: 'LV-003', employeeId: 'EMP001', employeeName: 'Juan Pérez', department: 'Producción', leaveType: 'Vacaciones', startDate: new Date(2024, 7, 5), endDate: new Date(2024, 7, 16), days: 10, status: 'Pendiente' },
  { id: 'LV-004', employeeId: 'EMP004', employeeName: 'María Rodríguez', department: 'Administración', leaveType: 'Permiso sin Goce', startDate: new Date(2024, 6, 30), endDate: new Date(2024, 6, 30), days: 1, status: 'Rechazado', justification: 'Motivos personales' },
];
