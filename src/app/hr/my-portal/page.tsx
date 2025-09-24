
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initialEmployees, Employee, initialLeaveRequests, LeaveRequest, LeaveType } from '../data';
import { FileText, Download, Calendar, Briefcase, Clock, Sun, Moon, AlertTriangle, UserCheck, Plane, History, UserX, Hourglass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, differenceInBusinessDays, startOfMonth, subDays, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo, useRef } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Logo from '@/components/logo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// Simulación de un trabajador logueado. En una app real, esto vendría de una sesión.
const loggedInEmployee: Employee = initialEmployees[0]; 

// Mock attendance data for the calendar
const mockAttendance = [
    { date: '2025-07-28', status: 'A Tiempo', clockIn: '07:58', clockOut: '18:02', hoursWorked: '9h 4m' },
    { date: '2025-07-29', status: 'A Tiempo', clockIn: '08:00', clockOut: '18:00', hoursWorked: '9h 0m' },
    { date: '2025-07-30', status: 'Atraso', clockIn: '08:12', clockOut: '18:15', hoursWorked: '9h 3m' },
    { date: '2025-07-31', status: 'A Tiempo', clockIn: '07:55', clockOut: '17:58', hoursWorked: '9h 3m' },
    { date: '2025-07-25', status: 'A Tiempo', clockIn: '08:01', clockOut: '18:05', hoursWorked: '9h 4m' },
    { date: '2025-07-24', status: 'Ausente', clockIn: null, clockOut: null, hoursWorked: null },
    { date: '2025-07-23', status: 'A Tiempo', clockIn: '07:59', clockOut: '18:01', hoursWorked: '9h 2m' },
    { date: '2025-07-22', status: 'A Tiempo', clockIn: '08:02', clockOut: '18:00', hoursWorked: '8h 58m' },
];


const mockShiftHistory = [
    { date: subDays(new Date(), 1), shift: 'Mañana' },
    { date: subDays(new Date(), 2), shift: 'Mañana' },
    { date: subDays(new Date(), 3), shift: 'Tarde' },
    { date: subDays(new Date(), 4), shift: 'Noche' },
    { date: subDays(new Date(), 5), shift: 'Libre' },
    { date: subDays(new Date(), 6), shift: 'Libre' },
    { date: subDays(new Date(), 7), shift: 'Mañana' },
];


const formatCurrency = (value: number) => {
    if (value === 0) return '$0';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(Math.round(value));
};

type PayslipData = {
    period: string;
    baseSalary: number;
    totalHaberes: number;
    totalDescuentos: number;
    liquidoAPagar: number;
};

const mockPayslips: PayslipData[] = [
    { period: 'Julio 2025', baseSalary: 850000, totalHaberes: 950000, totalDescuentos: 164877, liquidoAPagar: 785123 },
    { period: 'Junio 2025', baseSalary: 850000, totalHaberes: 940000, totalDescuentos: 159544, liquidoAPagar: 780456 },
];


export default function MyPortalPage() {

    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests.filter(req => req.employeeId === loggedInEmployee.id));
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [isRequestsHistoryModalOpen, setIsRequestsHistoryModalOpen] = useState(false);
    const [isShiftHistoryModalOpen, setIsShiftHistoryModalOpen] = useState(false);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState<PayslipData | null>(null);
    const payslipRef = useRef<HTMLDivElement>(null);
    const [newRequest, setNewRequest] = useState<{leaveType: LeaveType, dateRange: DateRange | undefined, justification: string}>({leaveType: 'Vacaciones', dateRange: undefined, justification: ''});
    const { toast } = useToast();
    const [attendanceDateRange, setAttendanceDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date('2025-07-31'), 7),
        to: new Date('2025-07-31'),
    });

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

    const attendanceSummary = useMemo(() => {
        if (!attendanceDateRange?.from) return { records: [], totalHours: 0, totalLates: 0, totalAbsences: 0 };
        
        const filtered = mockAttendance.filter(a => {
            const date = parseISO(a.date);
            return isWithinInterval(date, { start: attendanceDateRange.from!, end: attendanceDateRange.to || attendanceDateRange.from! });
        });

        const totalMinutes = filtered.reduce((acc, curr) => {
            if (!curr.hoursWorked) return acc;
            const parts = curr.hoursWorked.match(/(\d+)h\s*(\d+)m/);
            if (parts) {
                const hours = parseInt(parts[1], 10) || 0;
                const minutes = parseInt(parts[2], 10) || 0;
                return acc + (hours * 60) + minutes;
            }
            return acc;
        }, 0);

        return {
            records: filtered.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
            totalHours: Math.floor(totalMinutes / 60),
            totalLates: filtered.filter(r => r.status === 'Atraso').length,
            totalAbsences: filtered.filter(r => r.status === 'Ausente').length
        };
    }, [attendanceDateRange]);
    
    const handleViewPayslip = (payslip: PayslipData) => {
        setSelectedPayslip(payslip);
        setIsPayslipModalOpen(true);
    };

    const handleDownloadPayslip = async () => {
        const input = payslipRef.current;
        if (!input) return;

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'px', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, 0);
        pdf.save(`liquidacion-${loggedInEmployee.name.replace(' ', '_')}-${selectedPayslip?.period.replace(' ', '_')}.pdf`);
        toast({ title: 'PDF Descargado', description: 'Tu liquidación de sueldo ha sido descargada.' });
    };


    return (
        <AppLayout pageTitle={`Portal de ${loggedInEmployee.name}`}>
            <div className="space-y-6">
                 <Card>
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={loggedInEmployee.photoUrl} alt={loggedInEmployee.name} data-ai-hint="person portrait" />
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
                                {mockPayslips.map(p => (
                                <li key={p.period} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Liquidación de Sueldo - {p.period}</p>
                                        <p className="text-sm text-muted-foreground">Sueldo líquido: {formatCurrency(p.liquidoAPagar)}</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => handleViewPayslip(p)}><Download className="mr-2 h-4 w-4"/>Descargar</Button>
                                </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <Clock className="w-5 h-5"/> Mi Turno Actual
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                               <p className="text-4xl font-bold text-primary">{loggedInEmployee.shift}</p>
                               <Button variant="secondary" className="w-full" onClick={() => setIsShiftHistoryModalOpen(true)}>
                                    <History className="mr-2 h-4 w-4" /> Ver Historial de Turnos
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <Plane className="w-5 h-5"/> Mis Vacaciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                            <div className="text-center p-4 bg-secondary rounded-lg">
                                    <p className="text-sm text-muted-foreground">Días Disponibles</p>
                                    <p className="text-5xl font-bold">{loggedInEmployee.diasVacacionesDisponibles}</p>
                                    {loggedInEmployee.diasProgresivos > 0 && <p className="text-xs text-muted-foreground">(+{loggedInEmployee.diasProgresivos} días progresivos)</p>}
                            </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                <Button className="w-full" onClick={() => setIsRequestModalOpen(true)}>Solicitar Ausencia</Button>
                                <Button variant="secondary" className="w-full" onClick={() => setIsRequestsHistoryModalOpen(true)}>
                                    <History className="mr-2 h-4 w-4" /> Ver Historial
                                </Button>
                            </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="lg:col-span-3">
                         <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Clock className="w-5 h-5"/> Mi Asistencia
                            </CardTitle>
                            <CardDescription>Resumen de tus últimos registros de asistencia.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Entrada</TableHead>
                                        <TableHead>Salida</TableHead>
                                        <TableHead>Hrs. Trabajadas</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockAttendance.slice(0, 5).map(record => (
                                        <TableRow key={record.date}>
                                            <TableCell>{format(parseISO(record.date), 'PPPP', {locale: es})}</TableCell>
                                            <TableCell>{record.clockIn || '-'}</TableCell>
                                            <TableCell>{record.clockOut || '-'}</TableCell>
                                            <TableCell>{record.hoursWorked || '-'}</TableCell>
                                            <TableCell>
                                                 <Badge variant={record.status === 'A Tiempo' ? 'default' : record.status === 'Atraso' ? 'secondary' : 'destructive'}>
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                            <Button variant="outline" className="w-full mt-4" onClick={() => setIsCalendarModalOpen(true)}>
                                <Calendar className="mr-2 h-4 w-4"/> Ver Calendario Completo
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal para solicitar ausencia */}
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

             {/* Modal para calendario de asistencia */}
            <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Calendario de Asistencia</DialogTitle>
                         <DialogDescription>
                           Selecciona un rango de fechas para ver tu historial y resumen de asistencia.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="grid md:grid-cols-2 gap-6 items-start py-4">
                        <div>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="attendance-date"
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !attendanceDateRange && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {attendanceDateRange?.from ? (
                                        attendanceDateRange.to ? (
                                            <>{format(attendanceDateRange.from, "PPP", { locale: es })} - {format(attendanceDateRange.to, "PPP", { locale: es })}</>
                                        ) : (format(attendanceDateRange.from, "PPP", { locale: es }))) : (<span>Selecciona un rango</span>)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="center">
                                    <CalendarComponent
                                        initialFocus
                                        mode="range"
                                        defaultMonth={attendanceDateRange?.from}
                                        selected={attendanceDateRange}
                                        onSelect={setAttendanceDateRange}
                                        numberOfMonths={2}
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                             <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                <div className="p-2 border rounded-lg bg-secondary">
                                    <p className="text-xs text-muted-foreground">Hrs. Trabajadas</p>
                                    <p className="text-lg font-bold">{attendanceSummary.totalHours}</p>
                                </div>
                                <div className="p-2 border rounded-lg bg-secondary">
                                    <p className="text-xs text-muted-foreground">Atrasos</p>
                                    <p className="text-lg font-bold">{attendanceSummary.totalLates}</p>
                                </div>
                                 <div className="p-2 border rounded-lg bg-secondary">
                                    <p className="text-xs text-muted-foreground">Ausencias</p>
                                    <p className="text-lg font-bold">{attendanceSummary.totalAbsences}</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-96 overflow-y-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Horas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceSummary.records.map(r => (
                                        <TableRow key={r.date}>
                                            <TableCell>{format(parseISO(r.date), 'P', {locale: es})}</TableCell>
                                            <TableCell><Badge variant={r.status === 'A Tiempo' ? 'default' : r.status === 'Atraso' ? 'secondary' : 'destructive'}>{r.status}</Badge></TableCell>
                                            <TableCell>{r.hoursWorked || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {attendanceSummary.records.length === 0 && (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">Sin registros</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

             {/* Modal para historial de solicitudes */}
            <Dialog open={isRequestsHistoryModalOpen} onOpenChange={setIsRequestsHistoryModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Historial de Solicitudes</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Período</TableHead>
                                    <TableHead>Días</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell>{req.leaveType}</TableCell>
                                        <TableCell>{`${format(req.startDate, 'P', { locale: es })} - ${format(req.endDate, 'P', { locale: es })}`}</TableCell>
                                        <TableCell>{req.days}</TableCell>
                                        <TableCell>
                                            <Badge variant={req.status === 'Aprobado' ? 'default' : req.status === 'Pendiente' ? 'secondary' : 'destructive'}>{req.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

             {/* Modal para historial de turnos */}
            <Dialog open={isShiftHistoryModalOpen} onOpenChange={setIsShiftHistoryModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Historial de Turnos</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Turno Asignado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockShiftHistory.map((shift, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{format(shift.date, 'PPPP', { locale: es })}</TableCell>
                                        <TableCell>
                                            <Badge variant={shift.shift === 'Libre' ? 'outline' : 'secondary'}>
                                                {shift.shift}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
            
             {/* Modal para ver liquidación */}
            <Dialog open={isPayslipModalOpen} onOpenChange={setIsPayslipModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Liquidación de Sueldo</DialogTitle>
                        <DialogDescription>{loggedInEmployee.name} - {selectedPayslip?.period}</DialogDescription>
                    </DialogHeader>
                    {selectedPayslip && (
                        <>
                        <div className="max-h-[60vh] overflow-y-auto my-4">
                            <div ref={payslipRef} className="p-6 bg-white text-black font-body text-sm">
                                <header className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-2">
                                    <div className="flex items-center gap-3">
                                        <Logo className="w-24 text-orange-600" />
                                        <div>
                                            <h1 className="text-lg font-bold font-headline text-gray-800">Panificadora Vollkorn</h1>
                                            <p className="text-xs text-gray-500">RUT: 76.123.456-7</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-xl font-headline font-bold uppercase text-gray-700">Liquidación de Sueldo</h2>
                                        <p className="text-xs text-gray-500">Período: {selectedPayslip.period}</p>
                                    </div>
                                </header>
                                <section className="mb-4">
                                    <p><span className="font-semibold w-24 inline-block">Trabajador:</span> {loggedInEmployee.name}</p>
                                    <p><span className="font-semibold w-24 inline-block">RUT:</span> {loggedInEmployee.rut}</p>
                                </section>
                                <section className="grid grid-cols-2 gap-x-8">
                                    <div>
                                        <h3 className="font-bold font-headline text-base text-center bg-gray-100 border-b-2 border-gray-800 py-1">HABERES</h3>
                                        <div className="flex justify-between py-1 border-b"><p>Sueldo Base</p><p>{formatCurrency(selectedPayslip.baseSalary)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Otros Haberes</p><p>{formatCurrency(selectedPayslip.totalHaberes - selectedPayslip.baseSalary)}</p></div>
                                        <div className="flex justify-between py-2 mt-2 bg-gray-100 font-bold"><p>TOTAL HABERES</p><p>{formatCurrency(selectedPayslip.totalHaberes)}</p></div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold font-headline text-base text-center bg-gray-100 border-b-2 border-gray-800 py-1">DESCUENTOS</h3>
                                        <div className="flex justify-between py-1 border-b"><p>Cotizaciones Previsionales</p><p>{formatCurrency(selectedPayslip.totalDescuentos)}</p></div>
                                        <div className="flex justify-between py-2 mt-2 bg-gray-100 font-bold"><p>TOTAL DESCUENTOS</p><p>{formatCurrency(selectedPayslip.totalDescuentos)}</p></div>
                                    </div>
                                </section>
                                <section className="mt-6 flex justify-end">
                                    <div className="w-1/2 bg-gray-200 p-2 text-base font-bold flex justify-between">
                                        <p>ALCANCE LÍQUIDO</p>
                                        <p>{formatCurrency(selectedPayslip.liquidoAPagar)}</p>
                                    </div>
                                </section>
                                <footer className="grid grid-cols-2 gap-8 mt-12 text-center text-xs">
                                    <div>
                                        <div className="border-t-2 border-gray-400 pt-2 w-48 mx-auto">
                                            <p className="font-semibold text-gray-700">Firma Empleador</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="border-t-2 border-gray-400 pt-2 w-48 mx-auto">
                                            <p className="font-semibold text-gray-700">Firma Trabajador</p>
                                        </div>
                                    </div>
                                </footer>
                            </div>
                        </div>
                         <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPayslipModalOpen(false)}>Cerrar</Button>
                            <Button onClick={handleDownloadPayslip}>Descargar PDF</Button>
                        </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
