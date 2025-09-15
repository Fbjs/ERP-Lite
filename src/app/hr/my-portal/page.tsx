
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initialEmployees, Employee, initialLeaveRequests, LeaveRequest, LeaveType } from '../data';
import { FileText, Download, Calendar, Briefcase, Clock, Sun, Moon, AlertTriangle, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, differenceInBusinessDays, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { DateRange } from 'react-day-picker';

// Simulación de un trabajador logueado. En una app real, esto vendría de una sesión.
const loggedInEmployee: Employee = initialEmployees[0]; 

// Mock attendance data for the calendar
const mockAttendance = [
    { date: '2025-07-28', status: 'A Tiempo' },
    { date: '2025-07-29', status: 'A Tiempo' },
    { date: '2025-07-30', status: 'Atraso' },
    { date: '2025-07-31', status: 'A Tiempo' },
    { date: '2025-07-25', status: 'A Tiempo' },
    { date: '2025-07-24', status: 'Ausente' },
    { date: '2025-07-23', status: 'A Tiempo' },
    { date: '2025-07-22', status: 'A Tiempo' },
];

export default function MyPortalPage() {

    const lastPayslipDate = new Date(2025, 6, 31);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests.filter(req => req.employeeId === loggedInEmployee.id));
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [newRequest, setNewRequest] = useState<{leaveType: LeaveType, dateRange: DateRange | undefined, justification: string}>({leaveType: 'Vacaciones', dateRange: undefined, justification: ''});
    const { toast } = useToast();

    const handleCreateRequest = () => {
        if (!newRequest.dateRange?.from || !newRequest.dateRange?.to) {
          toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona un rango de fechas.' });
          return;
        }

        const days = differenceInBusinessDays(newRequest.dateRange.to, newRequest.dateRange.from) + 1;
        
        if (newRequest.leaveType === 'Vacaciones' && days > loggedInEmployee.diasVacacionesDisponibles) {
             toast({ variant: 'destructive', title: 'Saldo Insuficiente', description: `Solo tienes ${loggedInEmployee.diasVacacionesDisponibles} días de vacaciones disponibles.` });
            return;
        }

        const createdRequest: LeaveRequest = {
            id: `LV-${(Math.random() * 1000).toFixed(0)}`,
            employeeId: loggedInEmployee.id,
            employeeName: loggedInEmployee.name,
            department: loggedInEmployee.department,
            leaveType: newRequest.leaveType,
            startDate: newRequest.dateRange.from,
            endDate: newRequest.dateRange.to,
            days,
            status: 'Pendiente',
            justification: newRequest.justification,
        };

        setLeaveRequests(prev => [createdRequest, ...prev]);
        setIsRequestModalOpen(false);
        setNewRequest({leaveType: 'Vacaciones', dateRange: undefined, justification: ''});
        toast({ title: 'Solicitud Enviada', description: `Tu solicitud de ${newRequest.leaveType} ha sido enviada para aprobación.` });
    };
    
    const attendanceModifiers = {
        onTime: mockAttendance.filter(a => a.status === 'A Tiempo').map(a => parseISO(a.date)),
        late: mockAttendance.filter(a => a.status === 'Atraso').map(a => parseISO(a.date)),
        absent: mockAttendance.filter(a => a.status === 'Ausente').map(a => parseISO(a.date)),
    };


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
                                   {leaveRequests.map(req => (
                                       <li key={req.id} className="flex justify-between items-center">
                                           <span>{req.leaveType} ({req.days} días)</span>
                                           <Badge variant={req.status === 'Aprobado' ? 'default' : req.status === 'Pendiente' ? 'secondary' : 'destructive'}>{req.status}</Badge>
                                       </li>
                                   ))}
                               </ul>
                           </div>
                           <Button className="w-full" onClick={() => setIsRequestModalOpen(true)}>Solicitar Ausencia</Button>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                         <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Clock className="w-5 h-5"/> Mi Asistencia - {format(new Date(2025, 6, 1), 'MMMM yyyy', {locale: es})}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                             <CalendarComponent
                                mode="single"
                                month={startOfMonth(new Date(2025, 6, 1))}
                                selected={new Date()} // Highlight today, for example
                                className="rounded-md border p-0"
                                locale={es}
                                modifiers={{
                                    onTime: attendanceModifiers.onTime,
                                    late: attendanceModifiers.late,
                                    absent: attendanceModifiers.absent
                                }}
                                modifiersStyles={{
                                    onTime: { backgroundColor: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' },
                                    late: { backgroundColor: 'hsl(48 96.5% 53.1% / 0.2)', color: 'hsl(48 96.5% 53.1%)' },
                                    absent: { backgroundColor: 'hsl(var(--destructive) / 0.2)', color: 'hsl(var(--destructive))' }
                                }}
                            />
                            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: 'hsl(var(--primary) / 0.2)'}}></div><span>A Tiempo</span></div>
                                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: 'hsl(48 96.5% 53.1% / 0.2)'}}></div><span>Atraso</span></div>
                                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: 'hsl(var(--destructive) / 0.2)'}}></div><span>Ausente</span></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Solicitar Ausencia</DialogTitle>
                        <DialogDescription>
                            Completa los detalles para tu solicitud.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="grid gap-4 py-4">
                         <div className="space-y-2">
                            <Label htmlFor="leaveType">Tipo de Ausencia</Label>
                             <Select value={newRequest.leaveType} onValueChange={(val: LeaveType) => setNewRequest(p => ({...p, leaveType: val}))}>
                                <SelectTrigger id="leaveType">
                                    <SelectValue placeholder="Selecciona un tipo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                                    <SelectItem value="Licencia Médica">Licencia Médica</SelectItem>
                                    <SelectItem value="Permiso sin Goce">Permiso sin Goce</SelectItem>
                                    <SelectItem value="Permiso Justificado">Permiso Justificado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                             <Label>Período</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !newRequest.dateRange && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newRequest.dateRange?.from ? (
                                        newRequest.dateRange.to ? (
                                            <>
                                            {format(newRequest.dateRange.from, "PPP", {locale: es})} - {format(newRequest.dateRange.to, "PPP", {locale: es})}
                                            </>
                                        ) : ( format(newRequest.dateRange.from, "PPP", {locale: es}) )
                                        ) : ( <span>Selecciona un rango</span> )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                        initialFocus
                                        mode="range"
                                        defaultMonth={newRequest.dateRange?.from}
                                        selected={newRequest.dateRange}
                                        onSelect={(range) => setNewRequest(p => ({...p, dateRange: range}))}
                                        numberOfMonths={1}
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="justification">Justificación / Comentarios</Label>
                            <Textarea 
                                id="justification" 
                                placeholder="Añade detalles relevantes para tu solicitud..."
                                value={newRequest.justification}
                                onChange={e => setNewRequest(p => ({...p, justification: e.target.value}))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateRequest}>Enviar Solicitud</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
