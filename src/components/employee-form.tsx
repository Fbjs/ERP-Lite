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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, rut, position, contractType, startDate, salary });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
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
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Trabajador</Button>
      </DialogFooter>
    </form>
  );
}
