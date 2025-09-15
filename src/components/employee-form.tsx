
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '../app/hr/data';
import { Checkbox } from './ui/checkbox';

type EmployeeData = Omit<Employee, 'id' | 'photoUrl' | 'documents' | 'workHistory' | 'status'>;

type EmployeeFormProps = {
  onSubmit: (data: Omit<Employee, 'id' | 'photoUrl' | 'documents' | 'workHistory' | 'status'>) => void;
  onCancel: () => void;
  initialData?: Partial<Employee> | null;
};

const defaultFormData: EmployeeData = {
    name: '',
    rut: '',
    email: '',
    nationality: '',
    birthDate: '',
    position: '',
    department: 'Producción',
    contractType: 'Indefinido',
    startDate: '',
    salary: 0,
    phone: '',
    address: '',
    healthInsurance: '',
    pensionFund: '',
    dependents: 0,
    unionMember: false,
    bankDetails: {
        bank: '',
        accountType: 'Cuenta Corriente',
        accountNumber: ''
    },
    supervisor: '',
    emergencyContact: {
        name: '',
        phone: '',
    },
    diasVacacionesDisponibles: 0,
    diasProgresivos: 0,
};


export default function EmployeeForm({ onSubmit, onCancel, initialData = {} }: EmployeeFormProps) {
    const [formData, setFormData] = useState(defaultFormData);
    
    useEffect(() => {
        if (initialData && initialData.rut) {
            setFormData({
                name: initialData.name || '',
                rut: initialData.rut || '',
                email: initialData.email || '',
                nationality: initialData.nationality || '',
                birthDate: initialData.birthDate || '',
                position: initialData.position || '',
                department: initialData.department || 'Producción',
                contractType: initialData.contractType || 'Indefinido',
                startDate: initialData.startDate || '',
                salary: initialData.salary || 0,
                phone: initialData.phone || '',
                address: initialData.address || '',
                healthInsurance: initialData.healthInsurance || '',
                pensionFund: initialData.pensionFund || '',
                dependents: initialData.dependents || 0,
                unionMember: initialData.unionMember || false,
                bankDetails: initialData.bankDetails || { bank: '', accountType: 'Cuenta Corriente', accountNumber: '' },
                supervisor: initialData.supervisor || '',
                emergencyContact: initialData.emergencyContact || { name: '', phone: '' },
                diasVacacionesDisponibles: initialData.diasVacacionesDisponibles || 0,
                diasProgresivos: initialData.diasProgresivos || 0,
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [initialData]);

  const isEditing = !!initialData?.name;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
      <div>
        <h3 className="font-headline text-lg mb-2">Datos Personales</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Nombre</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} required/></div>
            <div className="space-y-1"><Label>RUT</Label><Input value={formData.rut} onChange={(e) => setFormData(p => ({...p, rut: e.target.value}))} placeholder="12.345.678-9" required/></div>
            <div className="space-y-1"><Label>Correo Electrónico</Label><Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} required/></div>
            <div className="space-y-1"><Label>Teléfono</Label><Input value={formData.phone} onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))} placeholder="+56912345678" required/></div>
            <div className="space-y-1"><Label>Fecha de Nacimiento</Label><Input type="date" value={formData.birthDate} onChange={(e) => setFormData(p => ({...p, birthDate: e.target.value}))} required/></div>
            <div className="space-y-1"><Label>Nacionalidad</Label><Input value={formData.nationality} onChange={(e) => setFormData(p => ({...p, nationality: e.target.value}))} required/></div>
            <div className="space-y-1 col-span-2"><Label>Dirección</Label><Input value={formData.address} onChange={(e) => setFormData(p => ({...p, address: e.target.value}))} required/></div>
            <div className="space-y-1"><Label>Contacto de Emergencia</Label><Input value={formData.emergencyContact.name} onChange={(e) => setFormData(p => ({...p, emergencyContact: {...p.emergencyContact, name: e.target.value}}))} placeholder="Nombre" required/></div>
            <div className="space-y-1"><Label>Teléfono de Emergencia</Label><Input value={formData.emergencyContact.phone} onChange={(e) => setFormData(p => ({...p, emergencyContact: {...p.emergencyContact, phone: e.target.value}}))} placeholder="+569..." required/></div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-headline text-lg mb-2">Datos Laborales</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Cargo</Label><Input value={formData.position} onChange={(e) => setFormData(p => ({...p, position: e.target.value}))} required/></div>
            <div className="space-y-1"><Label>Área/Depto.</Label><Select value={formData.department} onValueChange={(value) => setFormData(p => ({...p, department: value as any}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Producción">Producción</SelectItem><SelectItem value="Ventas">Ventas</SelectItem><SelectItem value="Logística">Logística</SelectItem><SelectItem value="Administración">Administración</SelectItem><SelectItem value="Gerencia">Gerencia</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label>Supervisor Directo</Label><Input value={formData.supervisor} onChange={(e) => setFormData(p => ({...p, supervisor: e.target.value}))} required/></div>
            <div className="space-y-1"><Label>Fecha de Ingreso</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({...p, startDate: e.target.value}))} required/></div>
            <div className="space-y-1"><Label>Tipo de Contrato</Label><Select value={formData.contractType} onValueChange={(value) => setFormData(p => ({...p, contractType: value}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Indefinido">Indefinido</SelectItem><SelectItem value="Plazo Fijo">Plazo Fijo</SelectItem><SelectItem value="Por Obra">Por Obra o Faena</SelectItem><SelectItem value="Honorarios">Honorarios</SelectItem></SelectContent></Select></div>
        </div>
      </div>
      
       <div className="border-t pt-4">
        <h3 className="font-headline text-lg mb-2">Datos Previsionales y de Pago</h3>
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Sueldo Bruto</Label><Input type="number" value={formData.salary} onChange={(e) => setFormData(p => ({...p, salary: parseInt(e.target.value, 10) || 0}))} required/></div>
            <div className="space-y-1"><Label>Cargas Familiares</Label><Input type="number" value={formData.dependents} onChange={(e) => setFormData(p => ({...p, dependents: parseInt(e.target.value, 10) || 0}))} required/></div>
            <div className="space-y-1"><Label>Previsión de Salud</Label><Input value={formData.healthInsurance} onChange={(e) => setFormData(p => ({...p, healthInsurance: e.target.value}))} placeholder="Ej: Fonasa, Consalud..." required/></div>
            <div className="space-y-1"><Label>AFP</Label><Input value={formData.pensionFund} onChange={(e) => setFormData(p => ({...p, pensionFund: e.target.value}))} placeholder="Ej: Modelo, Habitat..." required/></div>
            <div className="col-span-2 space-y-1">
                <Label>Datos Bancarios</Label>
                <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Banco" value={formData.bankDetails.bank} onChange={(e) => setFormData(p => ({...p, bankDetails: {...p.bankDetails, bank: e.target.value}}))} required/>
                    <Select value={formData.bankDetails.accountType} onValueChange={(value) => setFormData(p => ({...p, bankDetails: {...p.bankDetails, accountType: value}}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                            <SelectItem value="Cuenta Vista">Cuenta Vista</SelectItem>
                            <SelectItem value="Cuenta de Ahorro">Cuenta de Ahorro</SelectItem>
                            <SelectItem value="CuentaRUT">CuentaRUT</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Número de Cuenta" value={formData.bankDetails.accountNumber} onChange={(e) => setFormData(p => ({...p, bankDetails: {...p.bankDetails, accountNumber: e.target.value}}))} required/>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="unionMember" checked={formData.unionMember} onCheckedChange={(checked) => setFormData(p => ({...p, unionMember: !!checked}))} />
                <Label htmlFor="unionMember">Es miembro del sindicato (se aplicará descuento de cuota)</Label>
            </div>
        </div>
      </div>

      <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-2 -mb-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Trabajador'}</Button>
      </DialogFooter>
    </form>
  );
}
