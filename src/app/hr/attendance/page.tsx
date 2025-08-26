"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar as CalendarIcon, Upload, Download, AlertTriangle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type AttendanceRecord = {
  id: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: string;
  status: 'A Tiempo' | 'Atraso' | 'Ausente';
};

const initialRecords: AttendanceRecord[] = [
  { id: 'AT-001', employeeName: 'Juan Pérez', date: '2024-07-26', clockIn: '08:05', clockOut: '18:02', hoursWorked: '9h 57m', status: 'Atraso' },
  { id: 'AT-002', employeeName: 'Ana Gómez', date: '2024-07-26', clockIn: '07:58', clockOut: '18:01', hoursWorked: '10h 03m', status: 'A Tiempo' },
  { id: 'AT-003', employeeName: 'Luis Martínez', date: '2024-07-26', clockIn: '-', clockOut: '-', hoursWorked: '-', status: 'Ausente' },
  { id: 'AT-004', employeeName: 'María Rodríguez', date: '2024-07-26', clockIn: '08:00', clockOut: '17:59', hoursWorked: '9h 59m', status: 'A Tiempo' },
];

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <AppLayout pageTitle="Control de Asistencia">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle className="font-headline">Registro de Asistencia Diario</CardTitle>
              <CardDescription className="font-body">
                Visualiza los registros de entrada y salida del personal. Los datos se obtienen del sistema de control de acceso.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        locale={es}
                    />
                    </PopoverContent>
                </Popover>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Descargar Reporte</Button>
              <Button><Upload className="mr-2 h-4 w-4" /> Cargar Marcajes</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="text-center">{record.clockIn}</TableCell>
                  <TableCell className="text-center">{record.clockOut}</TableCell>
                  <TableCell className="text-center">{record.hoursWorked}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'A Tiempo' ? 'default' : record.status === 'Atraso' ? 'secondary' : 'destructive'}>
                      {record.status === 'Atraso' && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
