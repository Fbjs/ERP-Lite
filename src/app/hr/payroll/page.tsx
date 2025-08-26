"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, FileText, Upload, CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type PayrollItem = {
  id: string;
  employeeName: string;
  baseSalary: number;
  bonus: number;
  overtime: number;
  healthDiscount: number; // 7%
  pensionDiscount: number; // ~11%
  totalHaberes: number;
  totalDescuentos: number;
  liquidoAPagar: number;
};

const initialEmployees = [
  { id: 'EMP001', name: 'Juan Pérez', salary: 850000 },
  { id: 'EMP002', name: 'Ana Gómez', salary: 600000 },
  { id: 'EMP003', name: 'Luis Martínez', salary: 750000 },
  { id: 'EMP004', name: 'María Rodríguez', salary: 950000 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2024-07');
  const { toast } = useToast();

  const handleProcessPayroll = () => {
    const data = initialEmployees.map(emp => {
      const baseSalary = emp.salary;
      const bonus = Math.random() > 0.7 ? Math.floor(Math.random() * 100000) : 0; // Random bonus
      const overtime = Math.random() > 0.5 ? Math.floor(Math.random() * 50000) : 0; // Random overtime
      const totalHaberes = baseSalary + bonus + overtime;
      
      const healthDiscount = baseSalary * 0.07;
      const pensionDiscount = baseSalary * 0.11;
      const totalDescuentos = healthDiscount + pensionDiscount;

      const liquidoAPagar = totalHaberes - totalDescuentos;

      return {
        id: emp.id,
        employeeName: emp.name,
        baseSalary,
        bonus,
        overtime,
        healthDiscount,
        pensionDiscount,
        totalHaberes,
        totalDescuentos,
        liquidoAPagar,
      };
    });
    setPayrollData(data);
    toast({
        title: "Nómina Procesada",
        description: `Se ha procesado la nómina para el período seleccionado.`,
    });
  };

  const totals = payrollData.reduce((acc, item) => {
    acc.totalHaberes += item.totalHaberes;
    acc.totalDescuentos += item.totalDescuentos;
    acc.liquidoAPagar += item.liquidoAPagar;
    return acc;
  }, { totalHaberes: 0, totalDescuentos: 0, liquidoAPagar: 0 });

  return (
    <AppLayout pageTitle="Nómina y Liquidaciones">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle className="font-headline">Proceso de Nómina Mensual</CardTitle>
              <CardDescription className="font-body">Calcula y gestiona las liquidaciones de sueldo del personal.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Seleccionar Mes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024-07">Julio 2024</SelectItem>
                        <SelectItem value="2024-06">Junio 2024</SelectItem>
                        <SelectItem value="2024-05">Mayo 2024</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleProcessPayroll}>Procesar Nómina</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Cargar Horas Extras</Button>
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Cargar Bonos/Descuentos</Button>
                <Button variant="secondary" disabled={payrollData.length === 0}><FileText className="mr-2 h-4 w-4" /> Exportar a Previred</Button>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trabajador</TableHead>
                <TableHead className="text-right">Sueldo Base</TableHead>
                <TableHead className="text-right">Haberes</TableHead>
                <TableHead className="text-right">Descuentos</TableHead>
                <TableHead className="text-right font-bold">Líquido a Pagar</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.baseSalary)}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(item.totalHaberes)}</TableCell>
                  <TableCell className="text-right text-red-600">{formatCurrency(item.totalDescuentos)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(item.liquidoAPagar)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Ver Detalle</DropdownMenuItem>
                        <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Descargar Liquidación</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {payrollData.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Selecciona un período y procesa la nómina para ver los resultados.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
            {payrollData.length > 0 && (
            <TableFooter>
                <TableRow className="font-bold">
                    <TableCell colSpan={2}>Totales</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.totalHaberes)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.totalDescuentos)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.liquidoAPagar)}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
