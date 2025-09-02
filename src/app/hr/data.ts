
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
    documents: Document[];
    photoUrl?: string;
    emergencyContact: {
        name: string;
        phone: string;
    };
    supervisor: string;
    workHistory: WorkHistoryEvent[];
};

export const initialEmployees: Employee[] = [
  { id: 'EMP001', name: 'Juan Pérez', rut: '12.345.678-9', position: 'Panadero Jefe', department: 'Producción', contractType: 'Indefinido', startDate: '2022-01-15', salary: 850000, status: 'Activo', phone: '+56987654321', address: 'Av. Siempre Viva 742', healthInsurance: 'Fonasa', pensionFund: 'Modelo', documents: [{name: 'Contrato.pdf', url: '#'}], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=JP', emergencyContact: { name: 'Ana Pérez', phone: '+56911112222'}, supervisor: 'Carlos Araya', workHistory: [{date: '2023-01-15', event: 'Promoción', description: 'Promovido a Panadero Jefe.'}] },
  { id: 'EMP002', name: 'Ana Gómez', rut: '23.456.789-0', position: 'Auxiliar de Pastelería', department: 'Producción', contractType: 'Plazo Fijo', startDate: '2023-03-01', salary: 600000, status: 'Activo', phone: '+56912345678', address: 'Calle Falsa 123', healthInsurance: 'Consalud', pensionFund: 'Habitat', documents: [], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=AG', emergencyContact: { name: 'Luis Gómez', phone: '+56933334444'}, supervisor: 'Juan Pérez', workHistory: [] },
  { id: 'EMP003', name: 'Luis Martínez', rut: '11.222.333-4', position: 'Conductor Despacho', department: 'Logística', contractType: 'Indefinido', startDate: '2021-08-20', salary: 750000, status: 'Vacaciones', phone: '+56955554444', address: 'Pasaje Corto 45', healthInsurance: 'Cruz Blanca', pensionFund: 'Capital', documents: [], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=LM', emergencyContact: { name: 'Marta Soto', phone: '+56955556666'}, supervisor: 'Ricardo Soto', workHistory: [] },
  { id: 'EMP004', name: 'María Rodríguez', rut: '15.678.901-2', position: 'Administrativa', department: 'Administración', contractType: 'Indefinido', startDate: '2020-05-10', salary: 950000, status: 'Activo', phone: '+56999998888', address: 'El Roble 1010', healthInsurance: 'Fonasa', pensionFund: 'PlanVital', documents: [], photoUrl: 'https://placehold.co/100x100/D2AD5B/131011/png?text=MR', emergencyContact: { name: 'Jorge Rodríguez', phone: '+56977778888'}, supervisor: 'Carlos Araya', workHistory: [] },
];

    