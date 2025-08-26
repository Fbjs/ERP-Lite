"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { es } from 'date-fns/locale';

type LeaveRequest = {
  id: string;
  employeeName: string;
  leaveType: 'Vacaciones' | 'Licencia Médica' | 'Permiso sin Goce';
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
};

const initialLeaveRequests: LeaveRequest[] = [
  { id: 'LV-001', employeeName: 'Luis Martínez', leaveType: 'Vacaciones', startDate: new Date('2024-07-20'), endDate: new Date('2024-07-25'), days: 5, status: 'Aprobado' },
  { id: 'LV-002', employeeName: 'Ana Gómez', leaveType: 'Licencia Médica', startDate: new Date('2024-07-22'), endDate: new Date('2024-07-24'), days: 3, status: 'Aprobado' },
  { id: 'LV-003', employeeName: 'Juan Pérez', leaveType: 'Vacaciones', startDate: new Date('2024-08-05'), endDate: new Date('2024-08-10'), days: 6, status: 'Pendiente' },
  { id: 'LV-004', employeeName: 'María Rodríguez', leaveType: 'Permiso sin Goce', startDate: new Date('2024-07-30'), endDate: new Date('2024-07-30'), days: 1, status: 'Rechazado' },
];

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <AppLayout pageTitle="Vacaciones y Ausencias">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Solicitudes</CardTitle>
                            <CardDescription className="font-body">Revisa y aprueba las solicitudes de vacaciones y permisos.</CardDescription>
                        </div>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva Solicitud
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Trabajador</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Días</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.employeeName}</TableCell>
                            <TableCell>{req.leaveType}</TableCell>
                            <TableCell>{`${req.startDate.toLocaleDateString('es-CL')} - ${req.endDate.toLocaleDateString('es-CL')}`}</TableCell>
                            <TableCell>{req.days}</TableCell>
                            <TableCell>
                            <Badge variant={req.status === 'Aprobado' ? 'default' : req.status === 'Rechazado' ? 'destructive' : 'secondary'}>
                                {req.status}
                            </Badge>
                            </TableCell>
                            <TableCell>
                                {req.status === 'Pendiente' && (
                                     <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                         <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Calendario del Equipo</CardTitle>
                <CardDescription className="font-body">Vista mensual de las ausencias planificadas.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border p-0"
                    locale={es}
                    modifiers={{
                         vacaciones: requests.filter(r => r.leaveType === 'Vacaciones' && r.status === 'Aprobado').map(r => ({ from: r.startDate, to: r.endDate })),
                         licencia: requests.filter(r => r.leaveType === 'Licencia Médica' && r.status === 'Aprobado').map(r => ({ from: r.startDate, to: r.endDate })),
                    }}
                     modifiersStyles={{
                        vacaciones: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' },
                        licencia: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' },
                    }}
                />
            </CardContent>
             <CardContent>
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span>Vacaciones</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive"></div>
                        <span>Licencia Médica</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
