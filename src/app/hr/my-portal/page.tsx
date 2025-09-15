
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initialEmployees, Employee, initialLeaveRequests, LeaveRequest } from '../data';
import { FileText, Download, Calendar, Briefcase, Clock, Sun, Moon, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Simulación de un trabajador logueado. En una app real, esto vendría de una sesión.
const loggedInEmployee: Employee = initialEmployees[0]; 
const employeeLeaveRequests: LeaveRequest[] = initialLeaveRequests.filter(req => req.employeeId === loggedInEmployee.id);

export default function MyPortalPage() {

    const lastPayslipDate = new Date(2025, 6, 31);
    const lastAttendanceRecords = [
        { date: '2025-07-28', status: 'A Tiempo' },
        { date: '2025-07-29', status: 'A Tiempo' },
        { date: '2025-07-30', status: 'Atraso' },
        { date: '2025-07-31', status: 'A Tiempo' },
    ];

    return (
        <AppLayout pageTitle={`Portal de ${loggedInEmployee.name}`}>
            <div className="space-y-6">
                 <Card>
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={loggedInEmployee.photoUrl} alt={loggedInEmployee.name} />
                            <AvatarFallback className="text-3xl">{loggedInEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                             <CardTitle className="font-headline text-3xl">Bienvenido, {loggedInEmployee.name}</CardTitle>
                             <CardDescription className="font-body text-lg text-muted-foreground">{loggedInEmployee.position} - {loggedInEmployee.department}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <FileText className="w-5 h-5"/> Mis Documentos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="divide-y">
                                <li className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Contrato de Trabajo</p>
                                        <p className="text-sm text-muted-foreground">Tipo: {loggedInEmployee.contractType} - Desde: {format(parseISO(loggedInEmployee.startDate), 'P', { locale: es })}</p>
                                    </div>
                                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/>Descargar</Button>
                                </li>
                                <li className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Liquidación de Sueldo - {format(lastPayslipDate, 'MMMM yyyy', {locale: es})}</p>
                                        <p className="text-sm text-muted-foreground">Sueldo líquido: $785,123</p>
                                    </div>
                                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/>Descargar</Button>
                                </li>
                                 <li className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Liquidación de Sueldo - {format(new Date(2025, 5, 30), 'MMMM yyyy', {locale: es})}</p>
                                        <p className="text-sm text-muted-foreground">Sueldo líquido: $780,456</p>
                                    </div>
                                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/>Descargar</Button>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Calendar className="w-5 h-5"/> Mis Vacaciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="text-center p-4 bg-secondary rounded-lg">
                                <p className="text-sm text-muted-foreground">Días Disponibles</p>
                                <p className="text-5xl font-bold">{loggedInEmployee.diasVacacionesDisponibles}</p>
                                {loggedInEmployee.diasProgresivos > 0 && <p className="text-xs text-muted-foreground">(+{loggedInEmployee.diasProgresivos} días progresivos)</p>}
                           </div>
                           <div>
                                <h4 className="font-semibold mb-2">Últimas Solicitudes</h4>
                               <ul className="text-sm space-y-2">
                                   {employeeLeaveRequests.map(req => (
                                       <li key={req.id} className="flex justify-between items-center">
                                           <span>{req.leaveType} ({req.days} días)</span>
                                           <Badge variant={req.status === 'Aprobado' ? 'default' : req.status === 'Pendiente' ? 'secondary' : 'destructive'}>{req.status}</Badge>
                                       </li>
                                   ))}
                               </ul>
                           </div>
                           <Button className="w-full">Solicitar Ausencia</Button>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                         <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Clock className="w-5 h-5"/> Mi Asistencia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold mb-3">Últimos Registros</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {lastAttendanceRecords.map(rec => (
                                    <div key={rec.date} className="p-3 border rounded-lg flex flex-col items-center justify-center gap-1">
                                        <p className="font-bold">{format(parseISO(rec.date), 'EEE dd', {locale: es})}</p>
                                        {rec.status === 'A Tiempo' ? (
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">A Tiempo</Badge>
                                        ) : (
                                            <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1"/>{rec.status}</Badge>
                                        )}
                                        <p className="text-xs text-muted-foreground">08:05 - 17:32</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

