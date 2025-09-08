
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, MoreHorizontal, Download, FileSpreadsheet, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { initialPurchaseOrders, PurchaseOrder } from '../orders/page';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from '@/components/logo';


type SupplierInvoice = {
    id: string;
    purchaseOrderId: string;
    supplierName: string;
    invoiceNumber: string;
    date: string;
    amount: number;
    status: 'Pendiente de Pago' | 'Pagada' | 'Vencida';
};

const initialInvoices: SupplierInvoice[] = [
    { id: 'INV-001', purchaseOrderId: 'OC-001', supplierName: 'Harinas del Sur S.A.', invoiceNumber: 'F-78901', date: '2025-07-05', amount: 700000, status: 'Pendiente de Pago' },
    { id: 'INV-002', purchaseOrderId: 'OC-004', supplierName: 'Harinas del Sur S.A.', invoiceNumber: 'F-79100', date: '2025-06-25', amount: 300000, status: 'Pagada' },
];

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

const InvoiceForm = ({
  orders,
  onSubmit,
  onCancel,
}: {
  orders: PurchaseOrder[];
  onSubmit: (data: Omit<SupplierInvoice, 'id' | 'status'>) => void;
  onCancel: () => void;
}) => {
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === purchaseOrderId);
  }, [purchaseOrderId, orders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    onSubmit({
      purchaseOrderId,
      supplierName: selectedOrder.supplierName,
      invoiceNumber,
      date,
      amount: selectedOrder.total,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="purchaseOrderId">Orden de Compra Asociada</Label>
        <Select value={purchaseOrderId} onValueChange={setPurchaseOrderId} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una orden de compra recibida..." />
          </SelectTrigger>
          <SelectContent>
            {orders.map(order => (
              <SelectItem key={order.id} value={order.id}>
                {order.id} - {order.supplierName} ({formatCurrency(order.total)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedOrder && (
        <>
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Folio de la Factura</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              required
              placeholder="Número del documento del proveedor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha de la Factura</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
           <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input id="amount" type="text" value={formatCurrency(selectedOrder.total)} disabled />
          </div>
        </>
      )}
       <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={!selectedOrder || !invoiceNumber}>Registrar Factura</Button>
        </DialogFooter>
    </form>
  );
};


export default function SupplierInvoicesPage() {
    const [invoices, setInvoices] = useState<SupplierInvoice[]>(initialInvoices);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [generationDate, setGenerationDate] = useState<Date | null>(null);

    useEffect(() => {
        setDateRange({
            from: subMonths(new Date(), 1),
            to: new Date()
        });
        setGenerationDate(new Date());
    }, []);
    
    const availableOrders = useMemo(() => {
        return initialPurchaseOrders.filter(order => order.status === 'Recibido');
    }, []);

    const filteredInvoices = useMemo(() => {
        if (!dateRange?.from) return invoices;
        return invoices.filter(invoice => {
            const invoiceDate = parseISO(invoice.date);
            return invoiceDate >= dateRange.from! && invoiceDate <= (dateRange.to || dateRange.from!);
        });
    }, [invoices, dateRange]);

    const reportTotal = useMemo(() => {
        return filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    }, [filteredInvoices]);

    const handleRegisterInvoice = (data: Omit<SupplierInvoice, 'id' | 'status'>) => {
        const newInvoice: SupplierInvoice = {
            ...data,
            id: `INV-${Date.now()}`,
            status: 'Pendiente de Pago',
        };
        setInvoices(prev => [newInvoice, ...prev]);
        setIsFormModalOpen(false);
        toast({
            title: 'Factura Registrada',
            description: `La factura ${data.invoiceNumber} ha sido registrada y enviada a cuentas por pagar.`,
        });
    };
    
    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (input) {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'px', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, 0);
            pdf.save(`reporte-facturas-proveedor-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        }
    };
    
    const handleDownloadExcel = () => {
        const dataForSheet = filteredInvoices.map(inv => ({
            'Nº Factura': inv.invoiceNumber,
            'Proveedor': inv.supplierName,
            'Nº OC': inv.purchaseOrderId,
            'Fecha Factura': format(parseISO(inv.date), 'P', { locale: es }),
            'Monto': inv.amount,
            'Estado': inv.status,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas Proveedores");
        XLSX.writeFile(workbook, `reporte-facturas-proveedor-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    return (
        <AppLayout pageTitle="Facturas de Proveedores">
             <div ref={reportRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '8.5in' }}>
                 <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Reporte de Facturas de Proveedor</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn</p>
                        </div>
                    </div>
                     <div className="text-right text-xs">
                         <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} a {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                         {generationDate && <p><span className="font-semibold">Fecha de Emisión:</span> {format(generationDate, "P p", { locale: es })}</p>}
                     </div>
                </header>
                 <Table className="w-full text-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="p-1 font-bold">Nº Factura</TableHead>
                            <TableHead className="p-1 font-bold">Proveedor</TableHead>
                            <TableHead className="p-1 font-bold">Fecha</TableHead>
                            <TableHead className="p-1 font-bold text-right">Monto</TableHead>
                            <TableHead className="p-1 font-bold">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                        {filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="p-1">{invoice.invoiceNumber}</TableCell>
                                <TableCell className="p-1">{invoice.supplierName}</TableCell>
                                <TableCell className="p-1">{format(parseISO(invoice.date), 'P', { locale: es })}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(invoice.amount)}</TableCell>
                                <TableCell className="p-1">{invoice.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                     <TableFooter>
                        <TableRow className="font-bold bg-gray-100">
                            <TableCell colSpan={3} className="text-right p-1">Total del Período</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(reportTotal)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            <Card>
                <CardHeader>
                     <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Facturas de Proveedores</CardTitle>
                            <CardDescription className="font-body">
                                Registra las facturas recibidas de tus proveedores para gestionar los pagos.
                            </CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/purchasing">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={() => setIsFormModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Registrar Factura
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
                        <div className="flex-1 min-w-[280px] space-y-2">
                            <Label>Filtrar por Fecha de Factura</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                        dateRange.to ? (<>{format(dateRange.from, "P", { locale: es })} - {format(dateRange.to, "P", { locale: es })}</>)
                                        : (format(dateRange.from, "P", { locale: es })))
                                        : (<span>Selecciona un rango</span>)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es} />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="flex items-end gap-2">
                             <Button variant="outline" onClick={handleDownloadExcel} disabled={filteredInvoices.length === 0}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
                             <Button variant="outline" onClick={handleDownloadPdf} disabled={filteredInvoices.length === 0}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Folio Factura</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.length > 0 ? filteredInvoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{invoice.supplierName}</TableCell>
                                    <TableCell>{format(parseISO(invoice.date), 'P', { locale: es })}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'Pagada' ? 'default' : invoice.status === 'Vencida' ? 'destructive' : 'secondary'}>
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No hay facturas registradas en el período seleccionado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        {filteredInvoices.length > 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold">Total del Período</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(reportTotal)}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </CardContent>
            </Card>
            
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Registrar Factura de Proveedor</DialogTitle>
                        <DialogDescription>
                            Asocia una factura a una orden de compra ya recibida.
                        </DialogDescription>
                    </DialogHeader>
                    <InvoiceForm 
                        orders={availableOrders}
                        onSubmit={handleRegisterInvoice}
                        onCancel={() => setIsFormModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
