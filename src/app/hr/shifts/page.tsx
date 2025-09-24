
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { initialEmployees, Employee } from '../data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ShiftForm, { ShiftFormData } from '@/components/shift-form';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Shift = {
    id: string;
    employeeId: string;
    shift: 'Mañana' | 'Tarde' | 'Noche' | 'Libre';
    date: Date;
};

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ShiftsPage() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const { toast } = useToast();

    const uniqueDepartments = useMemo(() => {
        return ['all', ...Array.from(new Set(employees.map(e => e.department)))];
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        if (selectedDepartment === 'all') {
            return employees;
        }
        return employees.filter(e => e.department === selectedDepartment);
    }, [employees, selectedDepartment]);

    const handleShiftSubmit = (data: ShiftFormData) => {
        setEmployees(prev =>
            prev.map(emp =>
                data.employeeIds.includes(emp.id)
                    ? { ...emp, shift: data.shift }
                    : emp
            )
        );
        setIsModalOpen(false);
        toast({
            title: 'Turnos Actualizados',
            description: `Se ha asignado el turno de ${data.shift} a ${data.employeeIds.length} trabajador(es).`,
        });
    };

    return (
        <AppLayout pageTitle="Gestión de Turnos">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Planificación de Turnos Semanal</CardTitle>
                            <CardDescription className="font-body">
                                Visualiza y asigna los turnos de trabajo para el personal.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button asChild variant="outline">
                                <Link href="/hr">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Asignar Turno
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
                        <div className="flex-1 min-w-[250px] space-y-2">
                            <Label>Filtrar por Departamento</Label>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar departamento..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueDepartments.map(dept => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept === 'all' ? 'Todos los Departamentos' : dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-secondary">
                                    <th className="p-2 border font-semibold w-1/4">Trabajador</th>
                                    {daysOfWeek.map(day => (
                                        <th key={day} className="p-2 border font-semibold">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-muted/50">
                                        <td className="p-2 border font-medium">{emp.name}</td>
                                        {daysOfWeek.map(day => (
                                            <td key={day} className="p-2 border text-center">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    emp.shift === 'Mañana' ? 'bg-blue-100 text-blue-800' :
                                                    emp.shift === 'Tarde' ? 'bg-orange-100 text-orange-800' :
                                                    emp.shift === 'Noche' ? 'bg-indigo-100 text-indigo-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {emp.shift}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Asignar Turno</DialogTitle>
                        <DialogDescription>
                            Selecciona los trabajadores y el turno a asignar para la semana actual.
                        </DialogDescription>
                    </DialogHeader>
                    <ShiftForm
                        employees={filteredEmployees}
                        onSubmit={handleShiftSubmit}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
