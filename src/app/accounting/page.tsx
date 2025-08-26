'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, Mail, Calendar as CalendarIcon, DollarSign, Clock, AlertTriangle, FileCheck, Landmark, FileMinus, BookOpen, FilePlus2, AreaChart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import InvoiceForm, { InvoiceFormData } from '@/components/invoice-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import Link from 'next/link';
import CreditNoteForm, { CreditNoteFormData } from '@/components/credit-note-form';
import DebitNoteForm, { DebitNoteFormData } from '@/components/debit-note-form';
import { initialCustomers } from '@/app/admin/customers/page';


type Document = {
  id: string;
  type: 'Factura' | 'Nota de Crédito' | 'Nota de Débito';
  client: string;
  date: string;
  total: number;
  status: 'Pagada' | 'Pendiente' | 'Vencida' | 'Anulada' | 'Aplicada';
  items: string;
  createdBy: string;
};

const initialDocuments: Document[] = [
  { id: 'F001', type: 'Factura', client: 'Panaderia San Jose', date: '2025-07-15', total: 450.00, status: 'Pagada', items: '100 x Pan de Masa Madre, 50 x Baguettes', createdBy: 'Ana Gómez' },
  { id: 'F002', type: 'Factura', client: 'Cafe Central', date: '2025-07-20', total: 1200.50, status: 'Pendiente', items: '200 x Croissants, 150 x Ciabattas', createdBy: 'Usuario Admin' },
  { id: 'F003', type: 'Factura', client: 'Supermercado del Sur', date: '2025-07-10', total: 875.00, status: 'Pagada', items: '50 x Pain au Levain, 50 x Baguette Tradition', createdBy: 'Ana Gómez' },
  { id: 'F004', type: 'Factura', client: 'Restaurante El Tenedor', date: '2025-06-25', total: 320.75, status: 'Vencida', items: '300 x Pan de Centeno', createdBy: 'Usuario Admin' },
];

function AccountingPageContent() {
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [isNewInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
    const [isNewCreditNoteModalOpen, setNewCreditNoteModalOpen] = useState(false);
    const [isNewDebitNoteModalOpen, setNewDebitNoteModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isSendEmailModalOpen, setSendEmailModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [emailToSend, setEmailToSend] = useState('');
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const detailsModalContentRef = useRef<HTMLDivElement>(null);
    const reportContentRef = useRef<HTMLDivElement>(null);
    const [generationDate, setGenerationDate] = useState<Date | null>(null);

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subMonths(new Date(2025, 6, 29), 1),
        to: new Date(2025, 6, 29)
    });

    const filteredDocuments = useMemo(() => {
        if (!dateRange?.from) return documents;
        const fromDate = dateRange.from;
        const toDate = dateRange.to || fromDate;

        return documents.filter(doc => {
            const docDate = new Date(doc.date);
            return docDate >= fromDate && docDate <= toDate;
        });
    }, [documents, dateRange]);


    const summaryTotals = useMemo(() => {
        const invoicesAndDebitNotes = filteredDocuments.filter(d => d.type === 'Factura' || d.type === 'Nota de Débito');
        const creditNotes = filteredDocuments.filter(d => d.type === 'Nota de Crédito');
        
        const totalInvoiced = invoicesAndDebitNotes.reduce((acc, i) => acc + i.total, 0);
        const totalCredited = creditNotes.reduce((acc, cn) => acc + cn.total, 0);
        const totalPaid = invoicesAndDebitNotes.filter(i => i.status === 'Pagada').reduce((acc, i) => acc + i.total, 0);
        const totalPending = invoicesAndDebitNotes.filter(i => i.status === 'Pendiente').reduce((acc, i) => acc + i.total, 0);
        const totalOverdue = invoicesAndDebitNotes.filter(i => i.status === 'Vencida').reduce((acc, i) => acc + i.total, 0);


        return {
            paid: totalPaid,
            pending: totalPending,
            overdue: totalOverdue,
            totalInvoiced: totalInvoiced,
            totalCredited: totalCredited,
            netTotal: totalInvoiced - totalCredited
        }
    }, [filteredDocuments]);


    useEffect(() => {
        setGenerationDate(new Date());
        
        const client = searchParams.get('client');
        const amount = searchParams.get('amount');
        const details = searchParams.get('details');

        if (client && amount && details) {
            const newInvoice: Document = {
                id: `F${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
                type: 'Factura',
                client,
                total: parseFloat(amount),
                date: new Date().toISOString().split('T')[0],
                status: 'Pendiente',
                items: details,
                createdBy: 'Usuario Admin', // Asignar creador
            };
            setDocuments(prev => [newInvoice, ...prev]);
            toast({
                title: "Factura Generada",
                description: `Se ha creado la factura para ${client}.`,
            });
            // Clean up URL to avoid creating invoice on refresh
            window.history.replaceState(null, '', '/accounting');
        }
    }, [searchParams, toast]);

    const handleCreateInvoice = (data: InvoiceFormData) => {
        const newInvoice: Document = {
            id: `F${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            type: 'Factura',
            client: data.client,
            total: data.amount,
            items: data.items,
            date: new Date().toISOString().split('T')[0],
            status: 'Pendiente',
            createdBy: 'Usuario Admin', // Asignar creador
        };
        setDocuments(prev => [newInvoice, ...prev]);
        setNewInvoiceModalOpen(false);
        toast({
            title: "Factura Creada",
            description: `Se ha creado la factura para ${data.client}.`
        });
    };

    const handleCreateCreditNote = (data: CreditNoteFormData) => {
        const newCreditNote: Document = {
            id: `NC${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            type: 'Nota de Crédito',
            client: data.client,
            total: data.amount,
            items: data.reason,
            date: new Date().toISOString().split('T')[0],
            status: 'Aplicada',
            createdBy: 'Usuario Admin', // Asignar creador
        };
        setDocuments(prev => [newCreditNote, ...prev]);
        setNewCreditNoteModalOpen(false);
        toast({
            title: "Nota de Crédito Creada",
            description: `Se ha creado una nota de crédito para ${data.client}.`
        });
    };
    
    const handleCreateDebitNote = (data: DebitNoteFormData) => {
        const newDebitNote: Document = {
            id: `ND${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            type: 'Nota de Débito',
            client: data.client,
            total: data.amount,
            items: data.reason,
            date: new Date().toISOString().split('T')[0],
            status: 'Pendiente',
            createdBy: 'Usuario Admin', // Asignar creador
        };
        setDocuments(prev => [newDebitNote, ...prev]);
        setNewDebitNoteModalOpen(false);
        toast({
            title: "Nota de Débito Creada",
            description: `Se ha creado una nota de débito para ${data.client}.`
        });
    };

    const handleOpenDetails = (doc: Document) => {
        setSelectedDocument(doc);
        setDetailsModalOpen(true);
    };

    const handleOpenSendEmail = (doc: Document) => {
        setSelectedDocument(doc);
        setEmailToSend('');
        setSendEmailModalOpen(true);
    };
    
    const handleConfirmSendEmail = () => {
        if (!emailToSend || !selectedDocument) return;
        toast({
            title: "Documento Enviado",
            description: `El documento ${selectedDocument.id} ha sido enviado a ${emailToSend}.`,
        });
        setSendEmailModalOpen(false);
        setEmailToSend('');
    };

    const handleDownloadPdf = async (contentRef: React.RefObject<HTMLDivElement>, fileName: string) => {
        const input = contentRef.current;
        if (input) {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            
            const canvas = await html2canvas(input, { scale: 2, backgroundColor: null });
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
            pdf.save(fileName);
            toast({
                title: "PDF Descargado",
                description: `El documento ${fileName} ha sido descargado.`,
            });
        }
    };


  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AppLayout pageTitle="Contabilidad">
    
      <div ref={reportContentRef} className="fixed -left-[9999px] top-0 bg-white text-black p-8 font-body" style={{ width: '8.5in', minHeight: '11in'}}>
          <header className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                  <Logo className="w-28 text-orange-600" />
                  <div>
                      <h1 className="text-3xl font-bold font-headline text-gray-800">Reporte Contable</h1>
                      <p className="text-sm text-gray-500">Panificadora Vollkorn</p>
                  </div>
              </div>
              <div className="text-right text-sm">
                  <p><span className="font-semibold">Período:</span> {dateRange?.from ? format(dateRange.from, "P", { locale: es }) : ''} - {dateRange?.to ? format(dateRange.to, "P", { locale: es }) : 'Ahora'}</p>
                  {generationDate && <p><span className="font-semibold">Fecha de Generación:</span> {format(generationDate, "P p", { locale: es })}</p>}
              </div>
          </header>

          <main>
              <h2 className="text-xl font-headline font-semibold text-gray-700 mb-4">Detalle de Documentos</h2>
              <Table className="w-full text-sm">
                  <TableHeader className="bg-gray-100">
                      <TableRow>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Nº Documento</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Fecha</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Cliente</TableHead>
                          <TableHead className="text-left font-bold text-gray-700 uppercase p-3">Estado</TableHead>
                          <TableHead className="text-right font-bold text-gray-700 uppercase p-3">Monto</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredDocuments.map((doc) => (
                          <TableRow key={doc.id} className="border-b border-gray-200">
                              <TableCell className="p-3">{doc.id}</TableCell>
                              <TableCell className="p-3">{format(new Date(doc.date), "P", { locale: es })}</TableCell>
                              <TableCell className="p-3">{doc.client}</TableCell>
                              <TableCell className="p-3">{doc.status}</TableCell>
                              <TableCell className="text-right p-3">${doc.total.toLocaleString('es-CL')}</TableCell>
                          </TableRow>
                      ))}
                      {filteredDocuments.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center p-4">No se encontraron documentos en el período seleccionado.</TableCell></TableRow>
                      )}
                  </TableBody>
              </Table>
          </main>
          
          <section className="mt-8 flex justify-end">
              <div className="w-1/2">
                  <h2 className="text-xl font-headline font-semibold text-gray-700 mb-4">Resumen del Período</h2>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-semibold text-gray-600">Total Facturado:</span>
                          <span className="font-medium text-gray-800">${summaryTotals.totalInvoiced.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-semibold text-gray-600">Total Notas de Crédito:</span>
                          <span className="font-medium text-red-600">-${summaryTotals.totalCredited.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 mt-2">
                          <span className="font-headline font-bold text-lg text-gray-800">Total Neto:</span>
                          <span className="font-headline font-bold text-xl text-gray-900">${summaryTotals.netTotal.toLocaleString('es-CL')}</span>
                      </div>
                  </div>
              </div>
          </section>

          <footer className="text-center text-xs text-gray-400 border-t pt-4 mt-8">
              <p>Reporte generado por Vollkorn ERP.</p>
          </footer>
      </div>

       <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Contabilidad y Finanzas</CardTitle>
                            <CardDescription className="font-body">Gestiona facturas, notas de crédito, pagos y conciliaciones.</CardDescription>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-[300px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                        ) : (
                                        <span>Selecciona un rango</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
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
                            <Button 
                                onClick={() => handleDownloadPdf(reportContentRef, `reporte-contable-${format(dateRange?.from ?? new Date(), 'yyyy-MM-dd')}-a-${format(dateRange?.to ?? new Date(), 'yyyy-MM-dd')}.pdf`)} 
                                disabled={!dateRange?.from || !dateRange?.to}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Generar Reporte
                            </Button>
                             <Button asChild variant="outline">
                                <Link href="/accounting/reconciliation">
                                    <Landmark className="mr-2 h-4 w-4" />
                                    Conciliación
                                </Link>
                            </Button>
                            <Button variant="secondary" onClick={() => setNewDebitNoteModalOpen(true)}>
                                <FilePlus2 className="mr-2 h-4 w-4" />
                                Nota de Débito
                            </Button>
                            <Button variant="secondary" onClick={() => setNewCreditNoteModalOpen(true)}>
                                <FileMinus className="mr-2 h-4 w-4" />
                                Nota de Crédito
                            </Button>
                            <Button onClick={() => setNewInvoiceModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nueva Factura
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Button asChild variant="outline" className="h-20 text-lg">
                           <Link href="/accounting/sales-ledger">
                            <BookOpen className="mr-4 h-6 w-6"/>
                            Libro de Ventas
                           </Link>
                        </Button>
                         <Button asChild variant="outline" className="h-20 text-lg">
                           <Link href="/accounting/purchase-ledger">
                            <BookOpen className="mr-4 h-6 w-6"/>
                             Libro de Compras
                           </Link>
                        </Button>
                         <Button asChild variant="outline" className="h-20 text-lg">
                           <Link href="/accounting/cash-flow">
                            <AreaChart className="mr-4 h-6 w-6"/>
                             Flujo de Caja
                           </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {dateRange?.from && (
                <div>
                    <h3 className="text-lg font-headline font-semibold mb-4">
                        Resumen del Período
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Facturado (Neto)</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${summaryTotals.netTotal.toLocaleString('es-CL')}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
                                <FileCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">${summaryTotals.paid.toLocaleString('es-CL')}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-500">${summaryTotals.pending.toLocaleString('es-CL')}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Vencido</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">${summaryTotals.overdue.toLocaleString('es-CL')}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Listado de Documentos</CardTitle>
                    <CardDescription className="font-body">
                        {dateRange?.from ? 'Mostrando facturas y notas para el período seleccionado.' : 'Mostrando todos los documentos.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Responsable</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>
                        <span className="sr-only">Acciones</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                        <TableCell>
                            <div className="font-medium">{doc.id}</div>
                            <div className="text-sm text-muted-foreground">{new Date(doc.date).toLocaleDateString('es-CL')}</div>
                        </TableCell>
                        <TableCell>{doc.client}</TableCell>
                        <TableCell className="text-muted-foreground">{doc.createdBy}</TableCell>
                        <TableCell className={`text-right ${doc.type === 'Nota de Crédito' ? 'text-red-600' : ''}`}>
                            {doc.type === 'Nota de Crédito' ? '-' : ''}${doc.total.toLocaleString('es-CL')}
                        </TableCell>
                        <TableCell>
                            <Badge variant={
                                doc.status === 'Pagada' || doc.status === 'Aplicada' ? 'default' : 
                                doc.status === 'Pendiente' ? 'secondary' : 'destructive'
                            }>
                            {doc.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menú</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleOpenDetails(doc)}>Ver Detalle</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenSendEmail(doc)}>Enviar por Correo</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
       </div>
      
      {/* Modal Nueva Factura */}
      <Dialog open={isNewInvoiceModalOpen} onOpenChange={setNewInvoiceModalOpen}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle className="font-headline">Crear Nueva Factura</DialogTitle>
                  <DialogDescription className="font-body">
                      Complete los detalles para crear una nueva factura.
                  </DialogDescription>
              </DialogHeader>
              <InvoiceForm
                  onSubmit={handleCreateInvoice}
                  onCancel={() => setNewInvoiceModalOpen(false)}
                  customers={initialCustomers}
              />
          </DialogContent>
      </Dialog>
      
        {/* Modal Nueva Nota de Crédito */}
        <Dialog open={isNewCreditNoteModalOpen} onOpenChange={setNewCreditNoteModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline">Crear Nota de Crédito</DialogTitle>
                    <DialogDescription className="font-body">
                        Completa los detalles para anular o corregir una factura.
                    </DialogDescription>
                </DialogHeader>
                <CreditNoteForm
                    onSubmit={handleCreateCreditNote}
                    onCancel={() => setNewCreditNoteModalOpen(false)}
                    invoices={documents.filter(d => d.type === 'Factura')}
                />
            </DialogContent>
        </Dialog>
        
        {/* Modal Nueva Nota de Débito */}
        <Dialog open={isNewDebitNoteModalOpen} onOpenChange={setNewDebitNoteModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline">Crear Nota de Débito</DialogTitle>
                    <DialogDescription className="font-body">
                        Completa los detalles para aumentar el valor de un documento.
                    </DialogDescription>
                </DialogHeader>
                <DebitNoteForm
                    onSubmit={handleCreateDebitNote}
                    onCancel={() => setNewDebitNoteModalOpen(false)}
                    invoices={documents.filter(d => d.type === 'Factura')}
                />
            </DialogContent>
        </Dialog>

      {/* Modal Ver Detalles */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Detalle de {selectedDocument?.type}: {selectedDocument?.id}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="max-h-[75vh] overflow-y-auto p-1">
                <div ref={detailsModalContentRef} className="p-8 bg-white text-black font-body">
                    <header className="flex justify-between items-start mb-10 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <Logo className="w-28 text-orange-600" />
                            <div>
                                <h1 className="text-2xl font-bold font-headline text-gray-800">Panificadora Vollkorn</h1>
                                <p className="text-sm text-gray-500">Avenida Principal 123, Santiago, Chile</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-headline font-bold uppercase text-gray-700">{selectedDocument.type}</h2>
                            <p className="text-sm text-gray-500">Nº: {selectedDocument.id}</p>
                        </div>
                    </header>

                    <section className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <h3 className="font-headline text-lg font-semibold text-gray-600 mb-2 border-b pb-1">Datos del Cliente:</h3>
                            <p className="font-bold text-gray-800">{selectedDocument.client}</p>
                        </div>
                        <div className="text-right">
                             <div className="mb-2">
                                <span className="font-semibold text-gray-600">Fecha de Emisión: </span>
                                <span>{new Date(selectedDocument.date).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Estado: </span>
                                <Badge 
                                    className={`text-white ${selectedDocument.status === 'Pagada' || selectedDocument.status === 'Aplicada' ? 'bg-green-600' : selectedDocument.status === 'Pendiente' ? 'bg-yellow-500' : 'bg-red-600'}`}
                                >
                                    {selectedDocument.status}
                                </Badge>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <Table className="w-full">
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead className="text-left font-bold text-gray-700 uppercase py-3 px-4">{selectedDocument.type === 'Factura' ? 'Descripción' : 'Motivo'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-b border-gray-200">
                                    <TableCell className="py-3 px-4 whitespace-pre-wrap">{selectedDocument.items}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </section>
                    
                    <section className="flex justify-end mb-12">
                       <div className="w-1/3">
                          <div className="flex justify-between items-center py-2 border-b-2 border-gray-800">
                              <span className="font-headline font-semibold text-lg text-gray-700">Total</span>
                              <span className={`font-headline font-bold text-xl ${selectedDocument.type === 'Nota de Crédito' ? 'text-red-600' : 'text-gray-800'}`}>
                                {selectedDocument.type === 'Nota de Crédito' ? '-' : ''}${selectedDocument.total.toLocaleString('es-CL')}
                              </span>
                          </div>
                       </div>
                    </section>

                    <footer className="text-center text-xs text-gray-400 border-t pt-4">
                        <p>Gracias por su compra. Documento generado por Vollkorn ERP.</p>
                        <p>Responsable: {selectedDocument.createdBy}</p>
                        {generationDate && <p>Generado el {format(generationDate, "Pp", { locale: es })}</p>}
                    </footer>
                </div>
            </div>
          )}
           <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
                <Button onClick={() => handleDownloadPdf(detailsModalContentRef, `${selectedDocument?.type.toLowerCase().replace(' ', '-')}-${selectedDocument?.id}.pdf`)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal Enviar por Correo */}
      <Dialog open={isSendEmailModalOpen} onOpenChange={setSendEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline">Enviar Documento por Correo</DialogTitle>
                <DialogDescription className="font-body">
                    Ingresa el correo electrónico para enviar el documento {selectedDocument?.id}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                        Correo
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={emailToSend}
                        onChange={(e) => setEmailToSend(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="col-span-3"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setSendEmailModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleConfirmSendEmail}>
                    <Mail className="mr-2 h-4 w-4"/>
                    Enviar
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </AppLayout>
    </Suspense>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AccountingPageContent />
    </Suspense>
  );
}
