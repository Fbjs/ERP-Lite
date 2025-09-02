
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Check, X, Calendar as CalendarIcon, Filter, Users, Plane, Stethoscope, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo } from 'react';
import { es } from 'date-fns/locale';
import { format, differenceInBusinessDays, parseISO } from 'date-fns';
import { initialEmployees, Employee } from '../data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

type LeaveType = 'Vacaciones' | 'Licencia Médica' | 'Permiso sin Goce' | 'Permiso Justificado';

type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Employee['department'];
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  justification?: string;
};

const initialLeaveRequests: LeaveRequest[] = [
  { id: 'LV-001', employeeId: 'EMP003', employeeName: 'Luis Martínez', department: 'Logística', leaveType: 'Vacaciones', startDate: new Date(2024, 6, 20), endDate: new Date(2024, 6, 26), days: 5, status: 'Aprobado', justification: 'Viaje familiar' },
  { id: 'LV-002', employeeId: 'EMP002', employeeName: 'Ana Gómez', department: 'Producción', leaveType: 'Licencia Médica', startDate: new Date(2024, 6, 22), endDate: new Date(2024, 6, 24), days: 3, status: 'Aprobado', justification: 'Reposo médico por 3 días' },
  { id: 'LV-003', employeeId: 'EMP001', employeeName: 'Juan Pérez', department: 'Producción', leaveType: 'Vacaciones', startDate: new Date(2024, 7, 5), endDate: new Date(2024, 7, 16), days: 10, status: 'Pendiente' },
  { id: 'LV-004', employeeId: 'EMP004', employeeName: 'María Rodríguez', department: 'Administración', leaveType: 'Permiso sin Goce', startDate: new Date(2024, 6, 30), endDate: new Date(2024, 6, 30), days: 1, status: 'Rechazado', justification: 'Motivos personales' },
];

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState<{employeeId: string, leaveType: LeaveType, dateRange: DateRange | undefined, justification: string}>({employeeId: '', leaveType: 'Vacaciones', dateRange: undefined, justification: ''});
  const { toast } = useToast();

  const handleStatusChange = (id: string, newStatus: 'Aprobado' | 'Rechazado') => {
    let updatedRequests = [...requests];
    const requestIndex = updatedRequests.findIndex(r => r.id === id);
    if(requestIndex === -1) return;
    
    const originalRequest = updatedRequests[requestIndex];
    updatedRequests[requestIndex].status = newStatus;
    setRequests(updatedRequests);

    if (newStatus === 'Aprobado' && originalRequest.leaveType === 'Vacaciones') {
      const employeeIndex = employees.findIndex(e => e.id === originalRequest.employeeId);
      if (employeeIndex !== -1) {
        let updatedEmployees = [...employees];
        updatedEmployees[employeeIndex].diasVacacionesDisponibles -= originalRequest.days;
        setEmployees(updatedEmployees);
        toast({ title: 'Vacaciones Aprobadas', description: `Se han descontado ${originalRequest.days} días del saldo de ${originalRequest.employeeName}.` });
      }
    } else {
       toast({ title: 'Solicitud Actualizada', description: `La solicitud de ${originalRequest.employeeName} ha sido marcada como '${newStatus}'.` });
    }
  };
  
   const handleCreateRequest = () => {
    if (!newRequest.employeeId || !newRequest.dateRange?.from || !newRequest.dateRange?.to) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, completa todos los campos del formulario.' });
      return;
    }

    const employee = employees.find(e => e.id === newRequest.employeeId);
    if (!employee) return;

    const days = differenceInBusinessDays(newRequest.dateRange.to, newRequest.dateRange.from) + 1;
    
    if (newRequest.leaveType === 'Vacaciones' && days > employee.diasVacacionesDisponibles) {
         toast({ variant: 'destructive', title: 'Saldo Insuficiente', description: `${employee.name} solo tiene ${employee.diasVacacionesDisponibles} días disponibles.` });
        return;
    }

    const createdRequest: LeaveRequest = {
        id: `LV-${(Math.random() * 1000).toFixed(0)}`,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        leaveType: newRequest.leaveType,
        startDate: newRequest.dateRange.from,
        endDate: newRequest.dateRange.to,
        days,
        status: 'Pendiente',
        justification: newRequest.justification,
    };

    setRequests(prev => [createdRequest, ...prev]);
    setIsFormModalOpen(false);
    setNewRequest({employeeId: '', leaveType: 'Vacaciones', dateRange: undefined, justification: ''});
    toast({ title: 'Solicitud Creada', description: `Se ha registrado la solicitud para ${employee.name}.` });
  };


  const summaryData = useMemo(() => ({
    totalAvailableDays: employees.reduce((acc, e) => acc + e.diasVacacionesDisponibles, 0),
    pendingRequests: requests.filter(r => r.status === 'Pendiente').length,
    onLeaveToday: requests.filter(r => r.status === 'Aprobado' && new Date() >= r.startDate && new Date() <= r.endDate).length
  }), [employees, requests]);

  return (
    <AppLayout pageTitle="Vacaciones y Ausencias">
       <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Días de Vacaciones Disponibles</CardTitle>
                        <Plane className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.totalAvailableDays}</div>
                        <p className="text-xs text-muted-foreground">Total en la empresa</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                        <Plane className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">Esperando aprobación</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Personal Ausente Hoy</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.onLeaveToday}</div>
                        <p className="text-xs text-muted-foreground">Con permiso o licencia aprobada</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <CardTitle className="font-headline">Gestión de Solicitudes</CardTitle>
                                    <CardDescription className="font-body">Revisa y aprueba las solicitudes de vacaciones y permisos.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="outline">
                                        <Link href="/hr">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Volver
                                        </Link>
                                    </Button>
                                    <Button onClick={() => setIsFormModalOpen(true)}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Nueva Solicitud
                                    </Button>
                                </div>
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
                                    <TableCell>{`${format(req.startDate, 'P', { locale: es })} - ${format(req.endDate, 'P', { locale: es })}`}</TableCell>
                                    <TableCell>{req.days}</TableCell>
                                    <TableCell>
                                    <Badge variant={req.status === 'Aprobado' ? 'default' : req.status === 'Rechazado' ? 'destructive' : 'secondary'}>
                                        {req.status}
                                    </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {req.status === 'Pendiente' && (
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleStatusChange(req.id, 'Aprobado')}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => handleStatusChange(req.id, 'Rechazado')}>
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
                            className="rounded-md border p-0"
                            locale={es}
                            modifiers={{
                                vacaciones: requests.filter(r => r.leaveType === 'Vacaciones' && r.status === 'Aprobado').map(r => ({ from: r.startDate, to: r.endDate })),
                                licencia: requests.filter(r => r.leaveType === 'Licencia Médica' && r.status === 'Aprobado').map(r => ({ from: r.startDate, to: r.endDate })),
                                permiso: requests.filter(r => r.leaveType.includes('Permiso') && r.status === 'Aprobado').map(r => ({ from: r.startDate, to: r.endDate })),
                            }}
                            modifiersStyles={{
                                vacaciones: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' },
                                licencia: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' },
                                permiso: { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }
                            }}
                        />
                    </CardContent>
                    <CardContent>
                        <div className="flex flex-col gap-2 text-sm">
                             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div><span>Vacaciones</span></div>
                             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div><span>Licencia Médica</span></div>
                             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary"></div><span>Permiso</span></div>
                        </div>
                    </CardContent>
                </Card>
                </div>
            </div>
      </div>
      
       <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Nueva Solicitud de Ausencia</DialogTitle>
                        <DialogDescription>
                            Registra una nueva solicitud para un trabajador.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee">Trabajador</Label>
                            <Select value={newRequest.employeeId} onValueChange={(val) => setNewRequest(p => ({...p, employeeId: val}))}>
                                <SelectTrigger id="employee">
                                    <SelectValue placeholder="Selecciona un trabajador..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name} (Saldo Vac: {e.diasVacacionesDisponibles})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                                            {format(newRequest.dateRange.from, "LLL dd, y")} - {format(newRequest.dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : ( format(newRequest.dateRange.from, "LLL dd, y") )
                                        ) : ( <span>Selecciona un rango</span> )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
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
                                placeholder="Añade detalles relevantes para la solicitud..."
                                value={newRequest.justification}
                                onChange={e => setNewRequest(p => ({...p, justification: e.target.value}))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateRequest}>Crear Solicitud</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

    </AppLayout>
  );
}
