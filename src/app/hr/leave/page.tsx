
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Check, X, Calendar as CalendarIcon, Filter, Users, Plane, Stethoscope, ArrowLeft, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo, useRef, useEffect } from 'react';
import { es } from 'date-fns/locale';
import { format, differenceInBusinessDays, parseISO } from 'date-fns';
import { initialEmployees, Employee, initialLeaveRequests, LeaveRequest, LeaveType } from '../data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from '@/components/logo';

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState<{employeeId: string, leaveType: LeaveType, dateRange: DateRange | undefined, justification: string}>({employeeId: '', leaveType: 'Vacaciones', dateRange: undefined, justification: ''});
  const { toast } = useToast();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState<{employee: Employee, request: LeaveRequest} | null>(null);
  const voucherRef = useRef<HTMLDivElement>(null);
  const [onLeaveToday, setOnLeaveToday] = useState<number | null>(null);

  useEffect(() => {
    // Calculate on client side to avoid hydration mismatch
    const today = new Date();
    const onLeave = requests.filter(r => r.status === 'Aprobado' && today >= r.startDate && today <= r.endDate).length;
    setOnLeaveToday(onLeave);
  }, [requests]);


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
        const employee = updatedEmployees[employeeIndex];
        const previousAvailableDays = employee.diasVacacionesDisponibles;

        employee.diasVacacionesDisponibles -= originalRequest.days;
        setEmployees(updatedEmployees);
        
        setVoucherData({
            employee: { ...employee, diasVacacionesDisponibles: previousAvailableDays }, // Pass old balance to voucher
            request: originalRequest,
        });
        setIsVoucherModalOpen(true);
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
  
    const handleDownloadVoucher = async () => {
        const input = voucherRef.current;
        if (input) {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = canvas.width / canvas.height;
            let newWidth = pdfWidth - 20;
            let newHeight = newWidth / ratio;
            if (newHeight > pdfHeight - 20) {
                newHeight = pdfHeight - 20;
                newWidth = newHeight * ratio;
            }
            const x = (pdfWidth - newWidth) / 2;
            pdf.addImage(imgData, 'PNG', x, 10, newWidth, newHeight);
            pdf.save(`comprobante-feriado-${voucherData?.employee.rut}.pdf`);
            toast({ title: "Comprobante Descargado", description: `Se ha descargado el comprobante para ${voucherData?.employee.name}.` });
        }
    };


  const summaryData = useMemo(() => {
    return {
    totalAvailableDays: employees.reduce((acc, e) => acc + e.diasVacacionesDisponibles, 0),
    pendingRequests: requests.filter(r => r.status === 'Pendiente').length,
    }
  }, [employees, requests]);

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
                        {onLeaveToday === null ? (
                            <div className="text-2xl font-bold animate-pulse">...</div>
                        ) : (
                            <div className="text-2xl font-bold">{onLeaveToday}</div>
                        )}
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
            
             <Dialog open={isVoucherModalOpen} onOpenChange={setIsVoucherModalOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Comprobante de Feriado Generado</DialogTitle>
                         <DialogDescription>
                            La solicitud de vacaciones ha sido aprobada. Revisa y descarga el comprobante.
                        </DialogDescription>
                    </DialogHeader>
                     {voucherData && (
                        <>
                         <div className="max-h-[70vh] overflow-y-auto p-1 my-4">
                            <div ref={voucherRef} className="p-6 bg-white text-black font-sans text-xs">
                                <h1 className="text-center font-bold text-lg mb-4">COMPROBANTE DE FERIADO</h1>
                                <div className="border border-black p-2">
                                     <p className="mb-2">En cumplimiento a las disposiciones legales vigentes se deja constancia que a contar de las fechas que se indican, el trabajador.</p>
                                     <div className="grid grid-cols-3 gap-2 border-b border-black pb-1">
                                        <p><strong>Don(ña):</strong> {voucherData.employee.name}</p>
                                        <p><strong>RUT:</strong> {voucherData.employee.rut}</p>
                                        <p><strong>Empleado(a) N°:</strong> {voucherData.employee.id.replace('EMP','')}</p>
                                     </div>
                                     <p className="py-1">hará uso <strong>Parcial</strong> de su feriado legal de acuerdo al siguiente detalle:</p>
                                </div>
                                <div className="border border-black border-t-0 p-2 grid grid-cols-4 gap-2">
                                    <div className="col-span-3">
                                        <p className="font-bold">DESCANSO EFECTIVO ENTRE LAS FECHAS QUE SE INDICAN:</p>
                                        <p><strong>Desde:</strong> {format(voucherData.request.startDate, 'dd/MM/yyyy')} <strong>Hasta:</strong> {format(voucherData.request.endDate, 'dd/MM/yyyy')}</p>
                                    </div>
                                    <div className="grid grid-cols-3 border border-black text-center">
                                        <div className="border-r border-black"><p className="font-bold text-xs">Hab.</p><p>{voucherData.request.days}</p></div>
                                        <div className="border-r border-black"><p className="font-bold text-xs">Prog.</p><p>0</p></div>
                                        <div><p className="font-bold text-xs">Inhab.</p><p>0</p></div>
                                    </div>
                                </div>
                                <div className="border border-black border-t-0 p-2">
                                    <p>Se hace presente que la remuneración correspondiente al periodo del feriado se incluirá en la liquidación correspondiente al presente mes.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="border border-black">
                                        <div className="grid grid-cols-2 border-b border-black font-bold text-center"><p className="p-1 border-r border-black">DETALLE DEL FERIADO</p><p className="p-1">DÍAS</p></div>
                                        <div className="grid grid-cols-2 border-b"><p className="p-1 border-r border-black">Saldo Anterior</p><p className="p-1 text-center">{voucherData.employee.diasVacacionesDisponibles.toFixed(2)}</p></div>
                                        <div className="grid grid-cols-2 border-b"><p className="p-1 border-r border-black">Días Hábiles (-)</p><p className="p-1 text-center">{voucherData.request.days}</p></div>
                                        <div className="grid grid-cols-2"><p className="p-1 border-r border-black">Días Progresivos (-)</p><p className="p-1 text-center">0</p></div>
                                    </div>
                                     <div className="border border-black h-fit">
                                        <div className="grid grid-cols-2 border-b border-black font-bold text-center"><p className="p-1 border-r border-black">DETALLE DEL PERIODO</p><p className="p-1">Saldo utilizado</p></div>
                                        <div className="grid grid-cols-2"><p className="p-1 border-r border-black">Periodo {voucherData.request.startDate.getFullYear()}-{voucherData.request.startDate.getFullYear() + 1}</p><p className="p-1 text-center">{voucherData.request.days}</p></div>
                                    </div>
                                </div>
                                <div className="border border-black p-1 mt-4 text-sm">
                                    <p className="flex justify-between"><span>Saldo pendiente días hábiles</span> <span>{(voucherData.employee.diasVacacionesDisponibles - voucherData.request.days).toFixed(2)}</span></p>
                                    <p className="flex justify-between"><span>Saldo pendiente días progresivos</span> <span>{voucherData.employee.diasProgresivos}</span></p>
                                    <p className="flex justify-between font-bold"><span>Saldo Pendiente</span> <span>{(voucherData.employee.diasVacacionesDisponibles - voucherData.request.days + voucherData.employee.diasProgresivos).toFixed(2)}</span></p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-12">
                                    <div className="border border-black p-2 text-center text-xs">
                                        <div className="h-16"></div>
                                        <p className="border-t border-black pt-1">FIRMA 817674003 ALIMENTOS VOLLKORN SOC LTDA</p>
                                    </div>
                                    <div className="border border-black p-2 text-center text-xs">
                                        <p className="text-left text-xs mb-2">Declaro hacer uso del feriado indicado en este documento</p>
                                        <div className="h-10"></div>
                                        <p className="border-t border-black pt-1">FIRMA {voucherData.employee.rut} {voucherData.employee.name}</p>
                                        <p className="border-t border-black pt-1 mt-2 text-left">FECHA: {format(new Date(), 'dd/MM/yyyy')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsVoucherModalOpen(false)}>Cerrar</Button>
                            <Button onClick={handleDownloadVoucher}><Download className="mr-2 h-4 w-4"/>Descargar Comprobante</Button>
                        </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

    </AppLayout>
  );
}
