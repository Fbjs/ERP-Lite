
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { MoreHorizontal, Download, FileText, Upload, CalendarIcon, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from '@/components/logo';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type PayrollItem = {
  id: string;
  employeeName: string;
  baseSalary: number;
  overtime: number;
  bonusNocturno: number;
  bonusProduccion: number;
  bonusMetas: number;
  asignacionColacion: number;
  asignacionMovilizacion: number;
  totalImponible: number;
  totalNoImponible: number;
  totalHaberes: number;
  
  afpDiscount: number;
  healthDiscount: number; 
  cesantiaDiscount: number;
  taxDiscount: number;
  totalDescuentos: number;

  liquidoAPagar: number;
};

const initialEmployees = [
  { id: 'EMP001', name: 'Juan Pérez', salary: 850000, afpRate: 0.11, healthRate: 0.07 },
  { id: 'EMP002', name: 'Ana Gómez', salary: 600000, afpRate: 0.11, healthRate: 0.07 },
  { id: 'EMP003', name: 'Luis Martínez', salary: 750000, afpRate: 0.11, healthRate: 0.07 },
  { id: 'EMP004', name: 'María Rodríguez', salary: 950000, afpRate: 0.11, healthRate: 0.07 },
];

const formatCurrency = (value: number) => {
    if (value === 0) return '$0';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(Math.round(value));
};

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2024-07');
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PayrollItem | null>(null);
  const payslipRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleProcessPayroll = () => {
    const data = initialEmployees.map(emp => {
      const baseSalary = emp.salary;
      const overtime = Math.random() > 0.5 ? Math.floor(Math.random() * 8) * 6500 : 0;
      const bonusNocturno = Math.random() > 0.8 ? 50000 : 0;
      const bonusProduccion = Math.random() > 0.5 ? Math.floor(Math.random() * 4) * 15000 : 0;
      const bonusMetas = Math.random() > 0.6 ? 45000 : 0;
      
      const asignacionColacion = 55000;
      const asignacionMovilizacion = 45000;

      const totalImponible = baseSalary + overtime + bonusNocturno + bonusProduccion + bonusMetas;
      const totalNoImponible = asignacionColacion + asignacionMovilizacion;
      const totalHaberes = totalImponible + totalNoImponible;
      
      const healthDiscount = totalImponible * emp.healthRate;
      const afpDiscount = totalImponible * emp.afpRate;
      const cesantiaDiscount = totalImponible * 0.006; // Empleador paga el resto 2.4%
      const taxDiscount = totalImponible > 900000 ? (totalImponible - 900000) * 0.04 : 0;

      const totalDescuentos = healthDiscount + afpDiscount + cesantiaDiscount + taxDiscount;
      const liquidoAPagar = totalHaberes - totalDescuentos;

      return {
        id: emp.id,
        employeeName: emp.name,
        baseSalary,
        overtime,
        bonusNocturno,
        bonusProduccion,
        bonusMetas,
        asignacionColacion,
        asignacionMovilizacion,
        totalImponible,
        totalNoImponible,
        totalHaberes,
        afpDiscount,
        healthDiscount,
        cesantiaDiscount,
        taxDiscount,
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

  const handleShowDetails = (item: PayrollItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };
  
  const handleDownloadPayslip = async () => {
    const input = payslipRef.current;
    if (!input) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar el contenido para generar el PDF.' });
        return;
    }

    const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'px', 'a4');
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
    pdf.save(`liquidacion-${selectedItem?.employeeName.replace(' ', '_')}-${selectedMonth}.pdf`);
    toast({ title: 'PDF Descargado', description: 'La liquidación de sueldo ha sido descargada.' });
  };
  
  const handleExportPrevired = () => {
    const dataForSheet = payrollData.map(p => ({
        'RUT': '12.345.678-9', // Placeholder
        'Apellido Paterno': p.employeeName.split(' ')[1],
        'Apellido Materno': 'N/A',
        'Nombres': p.employeeName.split(' ')[0],
        'Sueldo Imponible': p.totalImponible,
        'Cotización AFP': p.afpDiscount,
        'Cotización Salud': p.healthDiscount,
        'Cotización Seguro Cesantía': p.cesantiaDiscount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Previred");
    XLSX.writeFile(workbook, `Previred-${selectedMonth}.xlsx`);

    toast({ title: "Archivo Generado", description: "Se ha exportado el archivo para Previred." });
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
                <Button variant="secondary" disabled={payrollData.length === 0} onClick={handleExportPrevired}>
                    <FileText className="mr-2 h-4 w-4" /> Exportar a Previred
                </Button>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trabajador</TableHead>
                <TableHead className="text-right">Total Haberes</TableHead>
                <TableHead className="text-right">Total Descuentos</TableHead>
                <TableHead className="text-right font-bold">Líquido a Pagar</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeName}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(item.totalHaberes)}</TableCell>
                  <TableCell className="text-right text-red-600">{formatCurrency(item.totalDescuentos)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(item.liquidoAPagar)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleShowDetails(item)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Detalle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {payrollData.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Selecciona un período y procesa la nómina para ver los resultados.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
            {payrollData.length > 0 && (
            <TableFooter>
                <TableRow className="font-bold">
                    <TableCell>Totales</TableCell>
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
       <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Detalle Liquidación de Sueldo</DialogTitle>
                        <DialogDescription>
                            {selectedItem?.employeeName} - Período: {selectedMonth}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="max-h-[70vh] overflow-y-auto p-1">
                            <div ref={payslipRef} className="p-6 bg-white text-black font-body text-sm">
                                <header className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-2">
                                     <div className="flex items-center gap-3">
                                        <Logo className="w-28 text-orange-600" />
                                        <div>
                                            <h1 className="text-lg font-bold font-headline text-gray-800">Panificadora Vollkorn</h1>
                                            <p className="text-xs text-gray-500">Avenida Principal 123, Santiago</p>
                                            <p className="text-xs text-gray-500">RUT: 76.123.456-7</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-headline font-bold uppercase text-gray-700">Liquidación de Sueldo</h2>
                                        <p className="text-xs text-gray-500">Período: {format(new Date(selectedMonth + '-02'), 'MMMM yyyy', { locale: es })}</p>
                                    </div>
                                </header>
                                <section className="mb-4">
                                    <p><span className="font-semibold w-24 inline-block">Trabajador:</span> {selectedItem.employeeName}</p>
                                    <p><span className="font-semibold w-24 inline-block">RUT:</span> {initialEmployees.find(e => e.id === selectedItem.id)?.rut || 'N/A'}</p>
                                </section>
                                <section className="grid grid-cols-2 gap-x-8">
                                    {/* HABERES */}
                                    <div>
                                        <h3 className="font-bold font-headline text-base text-center bg-gray-100 border-b-2 border-gray-800 py-1">HABERES</h3>
                                        <div className="flex justify-between py-1 border-b"><p>Sueldo Base</p><p>{formatCurrency(selectedItem.baseSalary)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Horas Extras</p><p>{formatCurrency(selectedItem.overtime)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Bono Turno Noche</p><p>{formatCurrency(selectedItem.bonusNocturno)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Bono Producción</p><p>{formatCurrency(selectedItem.bonusProduccion)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Bono Metas</p><p>{formatCurrency(selectedItem.bonusMetas)}</p></div>
                                        <div className="flex justify-between py-1 border-b font-semibold"><p>Total Imponible</p><p>{formatCurrency(selectedItem.totalImponible)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Asignación Colación</p><p>{formatCurrency(selectedItem.asignacionColacion)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Asignación Movilización</p><p>{formatCurrency(selectedItem.asignacionMovilizacion)}</p></div>
                                        <div className="flex justify-between py-1 border-b font-semibold"><p>Total No Imponible</p><p>{formatCurrency(selectedItem.totalNoImponible)}</p></div>
                                        <div className="flex justify-between py-2 mt-2 bg-gray-100 font-bold"><p>TOTAL HABERES</p><p>{formatCurrency(selectedItem.totalHaberes)}</p></div>
                                    </div>
                                    {/* DESCUENTOS */}
                                    <div>
                                         <h3 className="font-bold font-headline text-base text-center bg-gray-100 border-b-2 border-gray-800 py-1">DESCUENTOS</h3>
                                        <div className="flex justify-between py-1 border-b"><p>Cotización AFP</p><p>{formatCurrency(selectedItem.afpDiscount)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Cotización Salud (7%)</p><p>{formatCurrency(selectedItem.healthDiscount)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Seguro de Cesantía</p><p>{formatCurrency(selectedItem.cesantiaDiscount)}</p></div>
                                        <div className="flex justify-between py-1 border-b"><p>Impuesto Único</p><p>{formatCurrency(selectedItem.taxDiscount)}</p></div>
                                        <div className="flex justify-between py-2 mt-2 bg-gray-100 font-bold"><p>TOTAL DESCUENTOS</p><p>{formatCurrency(selectedItem.totalDescuentos)}</p></div>
                                    </div>
                                </section>
                                 <section className="mt-6 flex justify-end">
                                    <div className="w-1/2 bg-gray-200 p-2 text-lg font-bold flex justify-between">
                                        <p>ALCANCE LÍQUIDO</p>
                                        <p>{formatCurrency(selectedItem.liquidoAPagar)}</p>
                                    </div>
                                </section>
                                <footer className="grid grid-cols-2 gap-8 mt-16 text-center">
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
                    )}
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
                        <Button onClick={handleDownloadPayslip}><Download className="mr-2 h-4 w-4"/>Descargar PDF</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    </AppLayout>
  );
}
