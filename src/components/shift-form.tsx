
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Employee } from '@/app/hr/data';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

export type ShiftFormData = {
    employeeIds: string[];
    shift: 'Mañana' | 'Tarde' | 'Noche' | 'Libre';
};

type ShiftFormProps = {
    employees: Employee[];
    onSubmit: (data: ShiftFormData) => void;
    onCancel: () => void;
};

export default function ShiftForm({ employees, onSubmit, onCancel }: ShiftFormProps) {
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [shift, setShift] = useState<'Mañana' | 'Tarde' | 'Noche' | 'Libre'>('Mañana');
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ employeeIds: selectedEmployees, shift });
    };
    
    const handleSelectEmployee = (employeeId: string) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Trabajadores</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {selectedEmployees.length > 0 ? `${selectedEmployees.length} seleccionado(s)` : "Seleccionar trabajadores..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Buscar trabajador..." />
                            <CommandList>
                                <CommandEmpty>No se encontraron trabajadores.</CommandEmpty>
                                <CommandGroup>
                                    {employees.map((employee) => (
                                        <CommandItem
                                            key={employee.id}
                                            value={employee.name}
                                            onSelect={() => {
                                                handleSelectEmployee(employee.id);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedEmployees.includes(employee.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {employee.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="shift">Turno a Asignar</Label>
                <Select value={shift} onValueChange={value => setShift(value as any)}>
                    <SelectTrigger id="shift">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Mañana">Mañana (08:00 - 16:00)</SelectItem>
                        <SelectItem value="Tarde">Tarde (16:00 - 00:00)</SelectItem>
                        <SelectItem value="Noche">Noche (00:00 - 08:00)</SelectItem>
                        <SelectItem value="Libre">Libre</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={selectedEmployees.length === 0}>
                    Asignar Turno
                </Button>
            </DialogFooter>
        </form>
    );
}
