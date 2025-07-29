"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import EmployeeForm from '@/components/employee-form';

type Employee = {
    id: string;
    name: string;
    position: string;
    contractType: string;
    status: string;
};

const initialEmployees: Employee[] = [
  { id: 'EMP001', name: 'Juan Pérez', position: 'Panadero Jefe', contractType: 'Indefinido', status: 'Activo' },
  { id: 'EMP002', name: 'Ana Gómez', position: 'Auxiliar de Pastelería', contractType: 'Plazo Fijo', status: 'Activo' },
  { id: 'EMP003', name: 'Luis Martínez', position: 'Conductor Despacho', contractType: 'Indefinido', status: 'Vacaciones' },
  { id: 'EMP004', name: 'María Rodríguez', position: 'Administrativa', contractType: 'Indefinido', status: 'Activo' },
];

export default function HRPage() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [isNewEmployeeModalOpen, setNewEmployeeModalOpen] = useState(false);

    const handleCreateEmployee = (newEmployeeData: Omit<Employee, 'id' | 'status'>) => {
        const newEmployee: Employee = {
            ...newEmployeeData,
            id: `EMP${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            status: 'Activo',
        };
        setEmployees(prev => [newEmployee, ...prev]);
        setNewEmployeeModalOpen(false);
    };

  return (
    <AppLayout pageTitle="Recursos Humanos">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Gestión de Personal</CardTitle>
                    <CardDescription className="font-body">Administra la información y documentos de los trabajadores.</CardDescription>
                </div>
                <Button onClick={() => setNewEmployeeModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Trabajador
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.contractType}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Ver Ficha</DropdownMenuItem>
                        <DropdownMenuItem>Generar Documento</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Modal Nuevo Trabajador */}
      <Dialog open={isNewEmployeeModalOpen} onOpenChange={setNewEmployeeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Añadir Nuevo Trabajador</DialogTitle>
            <DialogDescription className="font-body">
              Completa los detalles para registrar a un nuevo trabajador.
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            onSubmit={handleCreateEmployee}
            onCancel={() => setNewEmployeeModalOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
