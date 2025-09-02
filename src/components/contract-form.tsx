
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Employee } from '../app/hr/data';


export type ContractFormData = {
    employeeRut: string;
    position: string;
    salary: number;
    contractType: 'Indefinido' | 'Plazo Fijo' | 'Part-time' | 'Reemplazo';
    startDate: Date;
    endDate?: Date;
};

type ContractFormProps = {
  employees: Pick<Employee, 'rut' | 'name' | 'position' | 'salary'>[];
  onSubmit: (data: ContractFormData) => void;
  isGenerating: boolean;
};

export default function ContractForm({ employees, onSubmit, isGenerating }: ContractFormProps) {
  const [employeeRut, setEmployeeRut] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState(0);
  const [contractType, setContractType] = useState<'Indefinido' | 'Plazo Fijo' | 'Part-time' | 'Reemplazo'>('Plazo Fijo');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleEmployeeSelect = (rut: string) => {
    const selectedEmployee = employees.find(e => e.rut === rut);
    if(selectedEmployee) {
        setEmployeeRut(selectedEmployee.rut);
        setPosition(selectedEmployee.position);
        setSalary(selectedEmployee.salary);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
        alert("Por favor, selecciona una fecha de inicio.");
        return;
    }
    onSubmit({ employeeRut, position, salary, contractType, startDate, endDate });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 font-body">
        <div className="space-y-2">
            <Label htmlFor="employeeRut">Trabajador</Label>
            <Select value={employeeRut} onValueChange={handleEmployeeSelect} required>
                <SelectTrigger id="employeeRut">
                    <SelectValue placeholder="Seleccionar trabajador..." />
                </SelectTrigger>
                <SelectContent>
                    {employees.map(e => (
                        <SelectItem key={e.rut} value={e.rut}>{e.name} ({e.rut})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input id="position" value={position} onChange={e => setPosition(e.target.value)} required disabled={!employeeRut} />
        </div>

        <div className="space-y-2">
            <Label htmlFor="salary">Sueldo Bruto</Label>
            <Input id="salary" type="number" value={salary || ''} onChange={e => setSalary(Number(e.target.value))} required disabled={!employeeRut} />
        </div>

         <div className="space-y-2">
            <Label htmlFor="contractType">Tipo de Contrato</Label>
             <Select value={contractType} onValueChange={(v) => setContractType(v as any)}>
                <SelectTrigger id="contractType">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Indefinido">Indefinido</SelectItem>
                    <SelectItem value="Plazo Fijo">Plazo Fijo</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Reemplazo">Reemplazo</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="startDate"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={es}/></PopoverContent>
            </Popover>
        </div>
            <div className="space-y-2">
            <Label htmlFor="endDate">Fecha de Término</Label>
                <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="endDate"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    disabled={contractType === 'Indefinido'}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : <span>(Opcional)</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={es}/></PopoverContent>
            </Popover>
        </div>
      
      <Button type="submit" disabled={isGenerating || !employeeRut}>
        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generar Borrador de Contrato
      </Button>
    </form>
  );
}
