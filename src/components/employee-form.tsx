
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EmployeeData = {
    name: string;
    rut: string;
    position: string;
    department: 'Producción' | 'Ventas' | 'Logística' | 'Administración' | 'Gerencia';
    contractType: string;
    startDate: string;
    salary: number;
    phone: string;
    address: string;
    healthInsurance: string;
    pensionFund: string;
    supervisor: string;
    emergencyContact: {
        name: string;
        phone: string;
    };
    photoUrl?: string;
};

type EmployeeFormProps = {
  onSubmit: (data: Omit<EmployeeData, 'photoUrl'>) => void;
  onCancel: () => void;
  initialData?: Partial<EmployeeData> | null;
};

const defaultFormData: Omit<EmployeeData, 'photoUrl'> = {
    name: '',
    rut: '',
    position: '',
    department: 'Producción',
    contractType: 'Indefinido',
    startDate: '',
    salary: 0,
    phone: '',
    address: '',
    healthInsurance: '',
    pensionFund: '',
    supervisor: '',
    emergencyContact: {
        name: '',
        phone: '',
    },
};


export default function EmployeeForm({ onSubmit, onCancel, initialData = {} }: EmployeeFormProps) {
    const [formData, setFormData] = useState(defaultFormData);
    
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                rut: initialData.rut || '',
                position: initialData.position || '',
                department: initialData.department || 'Producción',
                contractType: initialData.contractType || 'Indefinido',
                startDate: initialData.startDate || '',
                salary: initialData.salary || 0,
                phone: initialData.phone || '',
                address: initialData.address || '',
                healthInsurance: initialData.healthInsurance || '',
                pensionFund: initialData.pensionFund || '',
                supervisor: initialData.supervisor || '',
                emergencyContact: initialData.emergencyContact || { name: '', phone: '' },
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
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
      <h3 className="font-headline text-lg">Datos Personales</h3>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Nombre</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="col-span-3" required/>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="rut" className="text-right">RUT</Label>
        <Input id="rut" value={formData.rut} onChange={(e) => setFormData(p => ({...p, rut: e.target.value}))} className="col-span-3" placeholder="12.345.678-9" required/>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right">Teléfono</Label>
        <Input id="phone" value={formData.phone} onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))} className="col-span-3" placeholder="+56912345678" required/>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="address" className="text-right">Dirección</Label>
        <Input id="address" value={formData.address} onChange={(e) => setFormData(p => ({...p, address: e.target.value}))} className="col-span-3" required/>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="emergencyContactName" className="text-right">Cont. Emergencia</Label>
        <Input id="emergencyContactName" value={formData.emergencyContact.name} onChange={(e) => setFormData(p => ({...p, emergencyContact: {...p.emergencyContact, name: e.target.value}}))} className="col-span-3" placeholder="Nombre del contacto" required/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="emergencyContactPhone" className="text-right">Tel. Emergencia</Label>
        <Input id="emergencyContactPhone" value={formData.emergencyContact.phone} onChange={(e) => setFormData(p => ({...p, emergencyContact: {...p.emergencyContact, phone: e.target.value}}))} className="col-span-3" placeholder="+569..." required/>
      </div>

      <h3 className="font-headline text-lg pt-4 border-t">Datos Laborales</h3>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="position" className="text-right">Cargo</Label>
        <Input id="position" value={formData.position} onChange={(e) => setFormData(p => ({...p, position: e.target.value}))} className="col-span-3" required/>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="department" className="text-right">Área/Depto.</Label>
         <Select value={formData.department} onValueChange={(value) => setFormData(p => ({...p, department: value as any}))}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="Producción">Producción</SelectItem>
                <SelectItem value="Ventas">Ventas</SelectItem>
                <SelectItem value="Logística">Logística</SelectItem>
                <SelectItem value="Administración">Administración</SelectItem>
                <SelectItem value="Gerencia">Gerencia</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="supervisor" className="text-right">Supervisor</Label>
        <Input id="supervisor" value={formData.supervisor} onChange={(e) => setFormData(p => ({...p, supervisor: e.target.value}))} className="col-span-3" placeholder="Nombre del supervisor directo" required/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="startDate" className="text-right">Fecha Ingreso</Label>
        <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({...p, startDate: e.target.value}))} className="col-span-3" required/>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="salary" className="text-right">Sueldo Bruto</Label>
        <Input id="salary" type="number" value={formData.salary} onChange={(e) => setFormData(p => ({...p, salary: parseInt(e.target.value, 10) || 0}))} className="col-span-3" required/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractType" className="text-right">Contrato</Label>
         <Select value={formData.contractType} onValueChange={(value) => setFormData(p => ({...p, contractType: value}))}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="Indefinido">Indefinido</SelectItem>
                <SelectItem value="Plazo Fijo">Plazo Fijo</SelectItem>
                <SelectItem value="Por Obra">Por Obra o Faena</SelectItem>
                <SelectItem value="Honorarios">Honorarios</SelectItem>
            </SelectContent>
        </Select>
      </div>
        <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="healthInsurance" className="text-right">Previsión</Label>
        <Input id="healthInsurance" value={formData.healthInsurance} onChange={(e) => setFormData(p => ({...p, healthInsurance: e.target.value}))} className="col-span-3" placeholder="Ej: Fonasa, Consalud..." required/>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="pensionFund" className="text-right">AFP</Label>
        <Input id="pensionFund" value={formData.pensionFund} onChange={(e) => setFormData(p => ({...p, pensionFund: e.target.value}))} className="col-span-3" placeholder="Ej: Modelo, Habitat..." required/>
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
