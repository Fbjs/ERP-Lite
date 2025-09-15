
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, FileCheck, Clock, AlertTriangle, Users, DollarSign, ArrowLeft, Download, FileSpreadsheet } from 'lucide-react';
import { useMemo, useRef, useState, useEffect } from 'react';
import { initialOrders } from '@/app/sales/page';
import { differenceInDays, parseISO, addDays, format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/logo';
import * as XLSX from 'xlsx';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

type ReceivableDocument = {
    id: string;
    customer: string;
    amount: number;
    issueDate: Date;
    dueDate: Date;
    daysOverdue: number;
    agingCategory: 'Corriente' | '0-30 Días' | '31-60 Días' | '>60 Días';
};

const AccountsReceivablePage = () => {
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [generationDate, setGenerationDate] = useState<Date | null>(null);

    const initialReceivableDocuments: ReceivableDocument[] = useMemo(() => {
         return initialOrders
            .filter(order => order.status === 'Pendiente' || order.status === 'Enviado')
            .map(order => {
                const issueDate = parseISO(order.date);
                const dueDate = addDays(issueDate, 30);
                const daysOverdue = differenceInDays(new Date(), dueDate);
                
                let agingCategory: 'Corriente' | '0-30 Días' | '31-60 Días' | '>60 Días' = 'Corriente';
                if (daysOverdue > 60) agingCategory = '>60 Días';
                else if (daysOverdue > 30) agingCategory = '31-60 Días';
                else if (daysOverdue > 0) agingCategory = '0-30 Días';

                return {
                    id: order.id,
                    customer: order.customer,
                    amount: order.amount,
                    issueDate,
                    dueDate,
                    daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
                    agingCategory,
                };
            });
    }, []);

    const [receivableInvoices, setReceivableInvoices] = useState<ReceivableDocument[]>(initialReceivableDocuments);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<ReceivableDocument | null>(null);


     useEffect(() => {
        setGenerationDate(new Date());
    }, []);
    
    const summary = useMemo(() => {
        const totalReceivable = receivableInvoices.reduce((acc, inv) => acc + inv.amount, 0);
        const byAging = receivableInvoices.reduce((acc, inv) => {
            acc[inv.agingCategory] = (acc[inv.agingCategory] || 0) + inv.amount;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalReceivable,
            current: byAging['Corriente'] || 0,
            due30: byAging['0-30 Días'] || 0,
            due60: byAging['31-60 Días'] || 0,
            dueOver60: byAging['>60 Días'] || 0,
        };
    }, [receivableInvoices]);

    const handleOpenEditModal = (invoice: ReceivableDocument) => {
        setEditingInvoice(invoice);
        setIsEditModalOpen(true);
    };

    const handleSaveChanges = (updatedInvoice: ReceivableDocument) => {
        setReceivableInvoices(receivableInvoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
        setIsEditModalOpen(false);
        toast({ title: "Registro Actualizado", description: "La factura por cobrar ha sido actualizada." });
    };

    const handleDeleteInvoice = (invoiceId: string) => {
        setReceivableInvoices(receivableInvoices.filter(inv => inv.id !== invoiceId));
        toast({ title: "Registro Eliminado", variant: "destructive", description: "La factura por cobrar ha sido eliminada." });
    };
    
    const agingChartData = [
        { name: 'Corriente', value: summary.current },
        { name: '0-30 Días', value: summary.due30 },
        { name: '31-60 Días', value: summary.due60 },
        { name: '>60 Días', value: summary.dueOver60 },
    ];
    
    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (input) {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            
            const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
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
            pdf.save(`reporte-cuentas-cobrar-${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: "El reporte de cuentas por cobrar ha sido descargado.",
            });
        }
    };
    
    const handleDownloadExcel = () => {
        const dataToExport = receivableInvoices.map(inv => ({
            'Cliente': inv.customer,
            'Factura / OV': inv.id,
            'Fecha Vencimiento': inv.dueDate.toLocaleDateString('es-CL'),
            'Monto': inv.amount,
            'Estado': inv.agingCategory,
            'Días Vencido': inv.daysOverdue,
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cuentas por Cobrar");

        XLSX.utils.sheet_add_aoa(worksheet, [
            ["Total por Cobrar", summary.totalReceivable]
        ], { origin: "A" + (dataToExport.length + 3) });
        
        XLSX.writeFile(workbook, `reporte-cuentas-cobrar-${new Date().toISOString().split('T')[0]}.xlsx`);

         toast({
            title: "Excel Descargado",
            description: "El reporte de cuentas por cobrar ha sido exportado a Excel.",
        });
    };


    return (
        <AppLayout pageTitle="Cuentas por Cobrar">
            <div ref={reportRef} className="fixed -left-[9999px] top-0 bg-white text-black p-4 font-body" style={{ width: '11in', minHeight: '8.5in' }}>
                 <header className="flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                        <Logo className="w-24" />
                        <div>
                            <h1 className="text-xl font-bold font-headline text-gray-800">Reporte de Cuentas por Cobrar</h1>
                            <p className="text-xs text-gray-500">Panificadora Vollkorn</p>
                        </div>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-semibold">Fecha de Emisión:</span> {generationDate ? format(generationDate, "P p", { locale: es }) : ''}</p>
                    </div>
                </header>
                <Table className="w-full text-xs">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="p-1 font-bold text-gray-700">Cliente</TableHead>
                            <TableHead className="p-1 font-bold text-gray-700">Factura / OV</TableHead>
                            <TableHead className="p-1 font-bold text-gray-700">Fecha Venc.</TableHead>
                            <TableHead className="p-1 font-bold text-gray-700 text-right">Monto</TableHead>
                            <TableHead className="p-1 font-bold text-gray-700">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receivableInvoices.map((inv) => (
                            <TableRow key={inv.id}>
                                <TableCell className="p-1">{inv.customer}</TableCell>
                                <TableCell className="p-1">{inv.id}</TableCell>
                                <TableCell className="p-1">{inv.dueDate.toLocaleDateString('es-CL')}</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(inv.amount)}</TableCell>
                                <TableCell className="p-1">{inv.agingCategory}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-gray-100 font-bold">
                            <TableCell colSpan={3} className="text-right p-1">Total por Cobrar</TableCell>
                            <TableCell className="text-right p-1">{formatCurrency(summary.totalReceivable)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                 <footer className="text-center text-xs text-gray-400 border-t pt-2 mt-4">
                    <p>Reporte generado por Vollkorn ERP.</p>
                </footer>
            </div>
            
            <div className="space-y-6">
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalReceivable)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Corriente</CardTitle>
                            <FileCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.current)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vencido 0-30 Días</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">{formatCurrency(summary.due30)}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vencido >30 Días</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.due60 + summary.dueOver60)}</div>
                        </CardContent>
                    </Card>
                </div>
                
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <CardTitle className="font-headline">Detalle de Cuentas por Cobrar</CardTitle>
                                    <CardDescription className="font-body">Listado de facturas pendientes de pago.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button asChild variant="outline">
                                        <Link href="/accounting">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Volver
                                        </Link>
                                    </Button>
                                    <Button variant="outline" onClick={handleDownloadExcel}><FileSpreadsheet className="mr-2 h-4 w-4"/>Excel</Button>
                                    <Button variant="outline" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4"/>PDF</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Factura / OV</TableHead>
                                            <TableHead>Fecha Vencimiento</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead><span className="sr-only">Acciones</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {receivableInvoices.map(inv => (
                                            <TableRow key={inv.id}>
                                                <TableCell>{inv.customer}</TableCell>
                                                <TableCell>{inv.id}</TableCell>
                                                <TableCell>{inv.dueDate.toLocaleDateString('es-CL')}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(inv.amount)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={inv.agingCategory === 'Corriente' ? 'default' : 'destructive'}>
                                                        {inv.agingCategory}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleOpenEditModal(inv)}>Editar</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Eliminar</DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                                                                        <AlertDialogDescription>Esta acción es permanente y no se puede deshacer.</AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDeleteInvoice(inv.id)}>Sí, eliminar</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(summary.totalReceivable)}</TableCell>
                                            <TableCell colSpan={2}></TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Antigüedad de la Deuda</CardTitle>
                            <CardDescription>Distribución de las cuentas por cobrar.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={agingChartData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{background: "hsl(var(--background))"}} formatter={(value: number) => formatCurrency(value)} />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

             {editingInvoice && (
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Factura por Cobrar</DialogTitle>
                             <DialogDescription>
                                Modifica los detalles de la factura #{editingInvoice.id}.
                            </DialogDescription>
                        </DialogHeader>
                        <EditInvoiceForm
                            invoice={editingInvoice}
                            onSubmit={handleSaveChanges}
                            onCancel={() => setIsEditModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}

        </AppLayout>
    );
};

const EditInvoiceForm = ({ invoice, onSubmit, onCancel }: { invoice: ReceivableDocument, onSubmit: (data: ReceivableDocument) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(invoice);
    
    useEffect(() => {
        setFormData(invoice);
    }, [invoice]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        let newDate;
        if (id === 'dueDate') {
            newDate = parseISO(value);
            if(isValid(newDate)) {
                setFormData(prev => ({ ...prev, dueDate: newDate }));
            }
        } else {
             setFormData(prev => ({ ...prev, [id]: id === 'amount' ? Number(value) : value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="customer">Cliente</Label>
                <Input id="customer" value={formData.customer} onChange={handleChange} required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" value={formData.amount} onChange={handleChange} required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                <Input id="dueDate" type="date" value={format(formData.dueDate, 'yyyy-MM-dd')} onChange={handleChange} required />
            </div>
             <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
        </form>
    );
};


export default AccountsReceivablePage;
