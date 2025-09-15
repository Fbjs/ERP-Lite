
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar as CalendarIcon, Upload, Download, AlertTriangle, Users, Clock, UserX, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo, useRef, useEffect } from 'react';
import { format, subDays, differenceInMinutes, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { initialEmployees } from '../data';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/logo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';

type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: string | null;
  status: 'A Tiempo' | 'Atraso' | 'Ausente';
};

const WORK_START_TIME = '08:00';

const generateMockRecords = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    const startDate = subDays(today, 30);
    
    for (let i = 0; i < 30; i++) {
        const currentDate = subDays(today, i);
        initialEmployees.forEach((emp, empIndex) => {
            // Make absence deterministic to avoid hydration errors
            if ((i + empIndex) % 20 !== 0) { 
                const clockInTime = new Date();
                // Make clock-in time deterministic
                clockInTime.setHours(7, 50 + ((i * empIndex) % 21)); // Between 07:50 and 08:10
                
                const clockOutTime = new Date();
                 // Make clock-out time deterministic
                clockOutTime.setHours(17, 50 + ((i * empIndex * 2) % 21));

                const clockIn = format(clockInTime, 'HH:mm');
                const clockOut = format(clockOutTime, 'HH:mm');

                const start = parse(clockIn, 'HH:mm', new Date());
                const end = parse(clockOut, 'HH:mm', new Date());
                const diff = differenceInMinutes(end, start);
                const hours = Math.floor(diff/60);
                const minutes = diff % 60;
                
                const workStart = parse(WORK_START_TIME, 'HH:mm', new Date());

                records.push({
                    id: `AT-${emp.id}-${format(currentDate, 'yyyy-MM-dd')}`,
                    employeeId: emp.id,
                    employeeName: emp.name,
                    department: emp.department,
                    date: format(currentDate, 'yyyy-MM-dd'),
                    clockIn,
                    clockOut,
                    hoursWorked: `${hours}h ${minutes}m`,
                    status: differenceInMinutes(start, workStart) > 5 ? 'Atraso' : 'A Tiempo',
                });

            } else {
                 records.push({
                    id: `AT-${emp.id}-${format(currentDate, 'yyyy-MM-dd')}`,
                    employeeId: emp.id,
                    employeeName: emp.name,
                    department: emp.department,
                    date: format(currentDate, 'yyyy-MM-dd'),
                    clockIn: null,
                    clockOut: null,
                    hoursWorked: null,
                    status: 'Ausente',
                });
            }
        });
    }
    return records;
};

const allRecords = generateMockRecords();

export default function AttendancePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [department, setDepartment] = useState('all');
  const [employee, setEmployee] = useState('all');
  const reportContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

   useEffect(() => {
    setDateRange({ from: new Date(), to: new Date()});
  }, []);

  const filteredRecords = useMemo(() => {
    return allRecords.filter(record => {
        const recordDate = new Date(record.date);
        const isInDateRange = dateRange?.from && dateRange.to ? recordDate >= dateRange.from && recordDate <= dateRange.to : true;
        const isInDepartment = department === 'all' || record.department === department;
        const isEmployee = employee === 'all' || record.employeeId === employee;
        return isInDateRange && isInDepartment && isEmployee;
    });
  }, [dateRange, department, employee]);
  
  const summary = useMemo(() => {
    const delays = filteredRecords.filter(r => r.status === 'Atraso').length;
    const absences = filteredRecords.filter(r => r.status === 'Ausente').length;
    return {delays, absences, totalRecords: filteredRecords.length};
  }, [filteredRecords]);
  
  const handleDownloadPdf = async () => {
    const input = reportContentRef.current;
    if (input) {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'px', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;

      let pdfImageWidth = pdfWidth - 20;
      let pdfImageHeight = pdfImageWidth / ratio;

      if (pdfImageHeight > pdfHeight - 20) {
        pdfImageHeight = pdfHeight - 20;
        pdfImageWidth = pdfImageHeight * ratio;
      }
      
      const xOffset = (pdfWidth - pdfImageWidth) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, 10, pdfImageWidth, pdfImageHeight);
      pdf.save(`reporte-asistencia-${new Date().toISOString().split('T')[0]}.pdf`);
       toast({
          title: "PDF Descargado",
          description: "El reporte de asistencia ha sido descargado.",
       });
    }
  };

  const resetFilters = () => {
    setDateRange({ from: new Date(), to: new Date() });
    setDepartment('all');
    setEmployee('all');
  }

  return (
    <AppLayout pageTitle="Control de Asistencia">
        <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in', minHeight: '8.5in' }}>
            <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                <div className="flex items-center gap-3">
                    <Logo className="w-24" />
                    <div>
                        <h1 className="text-xl font-bold font-headline text-gray-800">Reporte de Asistencia</h1>
                        <p className="text-xs text-gray-500">Panificadora Vollkorn</p>
                    </div>
                </div>
                 <div className="text-right text-xs">
                    <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} a {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                    <p><span className="font-semibold">Filtros:</span> Depto: {department}, Empleado: {employee === 'all' ? 'Todos' : initialEmployees.find(e => e.id === employee)?.name}</p>
                 </div>
            </header>
            <Table className="w-full text-xs">
                <TableHeader className="bg-gray-100">
                    <TableRow>
                        <TableHead className="p-1 font-bold text-gray-700">Trabajador</TableHead>
                        <TableHead className="p-1 font-bold text-gray-700">Fecha</TableHead>
                        <TableHead className="p-1 font-bold text-gray-700 text-center">Entrada</TableHead>
                        <TableHead className="p-1 font-bold text-gray-700 text-center">Salida</TableHead>
                        <TableHead className="p-1 font-bold text-gray-700 text-center">Hrs Trab.</TableHead>
                        <TableHead className="p-1 font-bold text-gray-700">Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="p-1">{record.employeeName}</TableCell>
                            <TableCell className="p-1">{format(new Date(record.date), 'P', {locale: es})}</TableCell>
                            <TableCell className="p-1 text-center">{record.clockIn || '-'}</TableCell>
                            <TableCell className="p-1 text-center">{record.clockOut || '-'}</TableCell>
                            <TableCell className="p-1 text-center">{record.hoursWorked || '-'}</TableCell>
                            <TableCell className="p-1">{record.status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Registros</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalRecords}</div>
                        <p className="text-xs text-muted-foreground">En el período y filtros seleccionados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atrasos</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{summary.delays}</div>
                        <p className="text-xs text-muted-foreground">Llegadas después de las 08:05</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ausencias</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{summary.absences}</div>
                        <p className="text-xs text-muted-foreground">Sin marcajes registrados en el día</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                    <CardTitle className="font-headline">Reporte de Asistencia</CardTitle>
                    <CardDescription className="font-body">
                        Filtra y visualiza los registros de entrada y salida del personal.
                    </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/hr">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Cargar Marcajes</Button>
                     <Button onClick={handleDownloadPdf} disabled={filteredRecords.length === 0}><Download className="mr-2 h-4 w-4" /> Descargar Reporte</Button>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
                        <div className="flex-1 min-w-[280px]">
                            <Label>Rango de Fechas</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                        {format(dateRange.to, "LLL dd, y", { locale: es })}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y", { locale: es })
                                    )
                                    ) : (
                                    <span>Selecciona un rango</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    locale={es}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <Label>Departamento</Label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por depto..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Deptos.</SelectItem>
                                    {[...new Set(initialEmployees.map(e => e.department))].map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex-1 min-w-[240px]">
                            <Label>Trabajador</Label>
                            <Select value={employee} onValueChange={setEmployee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por trabajador..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Trabajadores</SelectItem>
                                    {initialEmployees.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button variant="ghost" onClick={resetFilters}>
                                <RefreshCcw className="mr-2 h-4 w-4" /> Limpiar
                            </Button>
                        </div>
                    </div>

                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Trabajador</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-center">Entrada</TableHead>
                        <TableHead className="text-center">Salida</TableHead>
                        <TableHead className="text-center">Horas Trabajadas</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{format(new Date(record.date), 'P', {locale: es})}</TableCell>
                        <TableCell className="text-center">{record.clockIn || '-'}</TableCell>
                        <TableCell className="text-center">{record.clockOut || '-'}</TableCell>
                        <TableCell className="text-center">{record.hoursWorked || '-'}</TableCell>
                        <TableCell>
                            <Badge variant={record.status === 'A Tiempo' ? 'default' : record.status === 'Atraso' ? 'secondary' : 'destructive'}>
                            {record.status === 'Atraso' && <AlertTriangle className="mr-1 h-3 w-3" />}
                            {record.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No se encontraron registros con los filtros seleccionados.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}

    