"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EmployeeData = {
    name: string;
    rut: string;
    position: string;
    contractType: string;
    startDate: string;
    salary: number;
    phone: string;
    address: string;
    healthInsurance: string;
    pensionFund: string;
};

type EmployeeFormProps = {
  onSubmit: (data: EmployeeData) => void;
  onCancel: () => void;
  initialData?: Partial<EmployeeData>;
};

export default function EmployeeForm({ onSubmit, onCancel, initialData = {} }: EmployeeFormProps) {
  const [name, setName] = useState(initialData.name || '');
  const [rut, setRut] = useState(initialData.rut || '');
  const [position, setPosition] = useState(initialData.position || '');
  const [contractType, setContractType] = useState(initialData.contractType || 'Indefinido');
  const [startDate, setStartDate] = useState(initialData.startDate || '');
  const [salary, setSalary] = useState(initialData.salary || 0);
  const [phone, setPhone] = useState(initialData.phone || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [healthInsurance, setHealthInsurance] = useState(initialData.healthInsurance || '');
  const [pensionFund, setPensionFund] = useState(initialData.pensionFund || '');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, rut, position, contractType, startDate, salary, phone, address, healthInsurance, pensionFund });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body max-h-[70vh] overflow-y-auto px-2">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Nombre
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="rut" className="text-right">
          RUT
        </Label>
        <Input
          id="rut"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          className="col-span-3"
          placeholder="12.345.678-9"
          required
        />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right">
          Teléfono
        </Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="col-span-3"
          placeholder="+56912345678"
          required
        />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="address" className="text-right">
          Dirección
        </Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="position" className="text-right">
          Cargo
        </Label>
        <Input
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="startDate" className="text-right">
          Fecha Ingreso
        </Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="salary" className="text-right">
          Sueldo Bruto
        </Label>
        <Input
          id="salary"
          type="number"
          value={salary}
          onChange={(e) => setSalary(parseInt(e.target.value, 10) || 0)}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractType" className="text-right">
          Contrato
        </Label>
         <Select value={contractType} onValueChange={setContractType}>
            <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Indefinido">Indefinido</SelectItem>
                <SelectItem value="Plazo Fijo">Plazo Fijo</SelectItem>
                <SelectItem value="Por Obra">Por Obra o Faena</SelectItem>
                <SelectItem value="Honorarios">Honorarios</SelectItem>
            </SelectContent>
        </Select>
      </div>
        <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="healthInsurance" className="text-right">
          Previsión
        </Label>
        <Input
          id="healthInsurance"
          value={healthInsurance}
          onChange={(e) => setHealthInsurance(e.target.value)}
          className="col-span-3"
          placeholder="Ej: Fonasa, Consalud..."
          required
        />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="pensionFund" className="text-right">
          AFP
        </Label>
        <Input
          id="pensionFund"
          value={pensionFund}
          onChange={(e) => setPensionFund(e.target.value)}
          className="col-span-3"
          placeholder="Ej: Modelo, Habitat..."
          required
        />
      </div>
      <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-2 -mb-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Trabajador</Button>
      </DialogFooter>
    </form>
  );
}
