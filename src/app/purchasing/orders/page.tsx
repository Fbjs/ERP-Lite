
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, ArrowLeft, Download, FileSpreadsheet, Calendar as CalendarIcon, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import PurchaseOrderForm, { PurchaseOrderData, PurchaseOrderItem } from '@/components/purchase-order-form';
import { initialSuppliers } from '@/app/admin/suppliers/page';
import { format, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from '@/components/logo';

export type PurchaseOrder = {
    id: string;
    supplierId: string;
    supplierName: string;
    date: string;
    deliveryDate: string;
    items: PurchaseOrderItem[];
    total: number;
    status: 'Borrador' | 'Aprobado' | 'Recibido' | 'Cancelado';
};

export const initialPurchaseOrders: PurchaseOrder[] = [
    { id: 'OC-001', supplierId: '1', supplierName: 'Harinas del Sur S.A.', date: '2025-07-01', deliveryDate: '2025-07-05', items: [{ name: 'Harina de Trigo', quantity: 500, price: 1300 }, { name: 'Sal de Mar', quantity: 100, price: 500 }], total: 700000, status: 'Recibido' },
    { id: 'OC-002', supplierId: '2', supplierName: 'Distribuidora Lácteos del Maule', date: '2025-07-10', deliveryDate: '2025-07-12', items: [{ name: 'Levadura Fresca', quantity: 50, price: 8000 }], total: 400000, status: 'Aprobado' },
    { id: 'OC-003', supplierId: '3', supplierName: 'Insumos de Panadería ProPan', date: '2025-07-15', deliveryDate: '2025-07-18', items: [{ name: 'Bolsas de Papel', quantity: 2000, price: 100 }], total: 200000, status: 'Borrador' },
    { id: 'OC-004', supplierId: '1', supplierName: 'Harinas del Sur S.A.', date: '2025-06-20', deliveryDate: '2025-06-25', items: [{ name: 'Harina de Centeno', quantity: 200, price: 1500 }], total: 300000, status: 'Recibido' },
];

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};


export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

     useEffect(() => {
        setDateRange({
            from: subMonths(new Date(), 1),
            to: new Date()
        });
    }, []);

    const filteredOrders = useMemo(() => {
        if (!dateRange?.from) return orders;
        return orders.filter(order => {
            const orderDate = parseISO(order.date);
            return orderDate >= dateRange.from! && orderDate <= (dateRange.to || dateRange.from!);
        });
    }, [orders, dateRange]);

    const reportTotal = useMemo(() => {
        return filteredOrders.reduce((sum, order) => sum + order.total, 0);
    }, [filteredOrders]);


    const handleOpenForm = (order?: PurchaseOrder) => {
        setSelectedOrder(order || null);
        setFormModalOpen(true);
    };

    const handleFormSubmit = (data: PurchaseOrderData) => {
        const total = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        const supplier = initialSuppliers.find(s => s.id === data.supplierId);

        if (selectedOrder) {
            // Editing
            const updatedOrder: PurchaseOrder = {
                ...selectedOrder,
                ...data,
                supplierName: supplier?.name || 'N/A',
                total,
            };
            setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
            toast({ title: 'Orden Actualizada', description: `Se guardaron los cambios para la orden ${updatedOrder.id}.` });
        } else {
            // Creating
            const newOrder: PurchaseOrder = {
                ...data,
                id: `OC-${String(orders.length + 1).padStart(3, '0')}`,
                supplierName: supplier?.name || 'N/A',
                total,
                status: 'Borrador',
            };
            setOrders([...orders, newOrder]);
            toast({ title: 'Orden Creada', description: `Se ha creado la orden de compra ${newOrder.id}.` });
        }
        setFormModalOpen(false);
        setSelectedOrder(null);
    };

    const handleDelete = (orderId: string) => {
        setOrders(orders.filter(o => o.id !== orderId));
        toast({ title: 'Orden Eliminada', variant: 'destructive', description: 'La orden de compra ha sido eliminada.' });
    };
    
    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (input) {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'px', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = canvas.width / canvas.height;
            let newWidth = pdfWidth - 20;
            let newHeight = newWidth / ratio;
            if (newHeight > pdfHeight - 20) {
                newHeight = pdfHeight - 20;
                newWidth = newHeight * ratio;
            }
            const xOffset = (pdfWidth - newWidth) / 2;
            pdf.addImage(imgData, 'PNG', xOffset, 10, newWidth, newHeight);
            pdf.save(`reporte-compras-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        }
    };
    
    const handleDownloadExcel = () => {
        const dataForSheet = filteredOrders.map(o => ({
            'Nº Orden': o.id,
            'Proveedor': o.supplierName,
            'Fecha Emisión': format(parseISO(o.date), 'P', { locale: es }),
            'Fecha Entrega': format(parseISO(o.deliveryDate), 'P', { locale: es }),
            'Total': o.total,
            'Estado': o.status,
            'Items': o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes de Compra");
        XLSX.writeFile(workbook, `reporte-compras-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    return (
        <AppLayout pageTitle="Órdenes de Compra">
            <div ref={reportRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in' }}>
                 <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Reporte de Órdenes de Compra</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn</p>
                        </div>
                    </div>
                     <div className="text-right text-xs">
                         <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} a {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                         <p><span className="font-semibold">Fecha de Emisión:</span> {format(new Date(), "P p", { locale: es })}</p>
                     </div>
                </header>
                 <Table className="w-full text-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="p-1 font-bold">Nº Orden</TableHead>
                            <TableHead className="p-1 font-bold">Proveedor</TableHead>
                            <TableHead className="p-1 font-bold">F. Emisión</TableHead>
                            <TableHead className="p-1 font-bold text-right">Total</TableHead>
                            <TableHead className="p-1 font-bold">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                        {filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="p-1">{order.id}</TableCell>
                                <TableCell className="p-1">{order.supplierName}</TableCell>
                                <TableCell className="p-1">{format(parseISO(order.date), 'P', { locale: es })}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(order.total)}</TableCell>
                                <TableCell className="p-1">{order.status}</TableCell>
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
                            <CardTitle className="font-headline">Gestión de Órdenes de Compra</CardTitle>
                            <CardDescription className="font-body">
                                Administra tus solicitudes de compra a proveedores.
                            </CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                             <Button asChild variant="outline">
                                <Link href="/purchasing">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={() => handleOpenForm()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Crear Orden
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
                        <div className="flex-1 min-w-[280px] space-y-2">
                            <Label>Filtrar por Fecha de Emisión</Label>
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
                             <Button variant="outline" onClick={handleDownloadExcel} disabled={filteredOrders.length === 0}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
                             <Button variant="outline" onClick={handleDownloadPdf} disabled={filteredOrders.length === 0}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nº Orden</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>F. Entrega</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}<p className="text-xs text-muted-foreground">{format(parseISO(order.date), 'P', { locale: es })}</p></TableCell>
                                    <TableCell>{order.supplierName}</TableCell>
                                    <TableCell>{format(parseISO(order.deliveryDate), 'P', { locale: es })}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === 'Recibido' ? 'default' :
                                            order.status === 'Aprobado' ? 'secondary' :
                                            order.status === 'Cancelado' ? 'destructive' :
                                            'outline'
                                        }>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenForm(order)}>Editar</DropdownMenuItem>
                                                <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(order.id)}>Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No hay órdenes en el período seleccionado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="text-right font-bold">Total del Período</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(reportTotal)}</TableCell>
                                <TableCell colSpan={2}></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{selectedOrder ? 'Editar Orden de Compra' : 'Crear Nueva Orden de Compra'}</DialogTitle>
                    </DialogHeader>
                    <PurchaseOrderForm
                        order={selectedOrder}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setFormModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
