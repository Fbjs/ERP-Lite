

'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, Mail, Calendar as CalendarIcon, DollarSign, Clock, AlertTriangle, FileCheck, Landmark, FileMinus, BookOpen, FilePlus2, AreaChart, User, Briefcase, BookKey, BarChart3, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import InvoiceForm, { InvoiceFormData, InvoiceItem } from '@/components/invoice-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subMonths, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import Link from 'next/link';
import CreditNoteForm, { CreditNoteFormData } from '@/components/credit-note-form';
import DebitNoteForm, { DebitNoteFormData } from '@/components/debit-note-form';
import { initialCustomers } from '@/app/admin/customers/page';
import { initialRecipes } from '@/app/recipes/page';
import * as XLSX from 'xlsx';


type Document = {
  id: string;
  type: 'Factura' | 'Nota de Crédito' | 'Nota de Débito';
  client: {
    name: string;
    rut: string;
    giro: string;
    address: string;
    commune: string;
    city: string;
  };
  date: string;
  dueDate: string;
  vendedor: string;
  local: string;
  neto: number;
  iva: number;
  total: number;
  status: 'Pagada' | 'Pendiente' | 'Vencida' | 'Anulada' | 'Aplicada';
  details?: string; // Kept for backward compatibility
  items?: InvoiceItem[];
  createdBy: string;
  purchaseOrderNumber?: string;
  condicionVenta: string;
};

const initialDocuments: Document[] = [
  { 
    id: 'F001', 
    type: 'Factura', 
    client: { name: 'Panaderia San Jose', rut: '76.111.222-3', giro: 'Panadería', address: 'Calle Larga 45', commune: 'Maipú', city: 'Santiago'},
    date: '2025-07-15', 
    dueDate: '2025-08-14',
    vendedor: 'Ana Gómez',
    local: 'SJ-MAIPU',
    neto: 378151,
    iva: 71849,
    total: 450000, 
    status: 'Pagada', 
    items: [{recipeId: 'GUABCO16', formatSku: 'GUABCO16-9.5', quantity: 100, unitPrice: 4100}, {recipeId: 'GUBL1332', formatSku: 'GUBL1332-11', quantity: 10, unitPrice: 3900}], 
    createdBy: 'Ana Gómez', 
    purchaseOrderNumber: 'OC-2025-101',
    condicionVenta: 'A 30 días'
  },
  { 
    id: 'F002', 
    type: 'Factura', 
    client: { name: 'Cafe Central', rut: '77.222.333-4', giro: 'Cafetería', address: 'Av. Providencia 1234', commune: 'Providencia', city: 'Santiago' },
    date: '2025-07-20', 
    dueDate: '2025-08-19',
    vendedor: 'Carlos Diaz',
    local: 'CC-PROVI',
    neto: 1008824,
    iva: 191676,
    total: 1200500, 
    status: 'Pendiente', 
    items: [{recipeId: 'CERE0027', formatSku: 'CERE0027-1K', quantity: 300, unitPrice: 4001.6}], 
    createdBy: 'Usuario Admin',
    condicionVenta: 'A 30 días'
  },
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

    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    useEffect(() => {
        setDateRange({
            from: subMonths(new Date(), 1),
            to: new Date()
        });
        setGenerationDate(new Date());
    }, []);

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
        const clientParam = searchParams.get('client');
        if (clientParam) {
            const decodedClient = JSON.parse(clientParam);
            const newInvoice: Document = {
                id: `F${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
                type: 'Factura',
                client: decodedClient.clientData,
                date: new Date().toISOString().split('T')[0],
                dueDate: addDays(new Date(), 30).toISOString().split('T')[0],
                vendedor: decodedClient.vendedor,
                local: decodedClient.local,
                neto: decodedClient.neto,
                iva: decodedClient.iva,
                total: decodedClient.total,
                status: 'Pendiente',
                items: decodedClient.items,
                createdBy: 'Usuario Admin',
                purchaseOrderNumber: decodedClient.purchaseOrderNumber,
                condicionVenta: 'A 30 días'
            };
            setDocuments(prev => [newInvoice, ...prev]);
            toast({
                title: "Factura Generada",
                description: `Se ha creado la factura para ${newInvoice.client.name}.`,
            });
            window.history.replaceState(null, '', '/accounting/invoicing');
        }
    }, [searchParams, toast]);

    const handleCreateInvoice = (data: InvoiceFormData) => {
        const customer = initialCustomers.find(c => c.id === data.customerId);
        if (!customer) return;
        
        const neto = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const iva = neto * 0.19;
        const totalAmount = neto + iva;

        const location = customer.deliveryLocations.find(l => l.id === data.locationId);

        const newInvoice: Document = {
            id: `F${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            type: 'Factura',
            client: {
                name: customer.name,
                rut: customer.rut,
                giro: 'N/A', // Assuming giro isn't in customer data
                address: location?.address || customer.deliveryLocations[0].address,
                commune: 'N/A',
                city: 'N/A'
            },
            date: new Date().toISOString().split('T')[0],
            dueDate: addDays(new Date(), 30).toISOString().split('T')[0],
            vendedor: data.salesperson,
            local: location?.name || 'N/A',
            neto: neto,
            iva: iva,
            total: totalAmount,
            status: 'Pendiente',
            items: data.items,
            createdBy: 'Usuario Admin',
            purchaseOrderNumber: data.purchaseOrderNumber,
            condicionVenta: 'A 30 días'
        };
        setDocuments(prev => [newInvoice, ...prev]);
        setNewInvoiceModalOpen(false);
        toast({
            title: "Factura Creada",
            description: `Se ha creado la factura para ${newInvoice.client.name}.`
        });
    };

    const handleCreateCreditNote = (data: CreditNoteFormData) => {
        const relatedInvoice = documents.find(doc => doc.id === data.originalInvoiceId);
        const newCreditNote: Document = {
            id: `NC${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            type: 'Nota de Crédito',
            client: relatedInvoice?.client || {name: data.client, rut: '', giro: '', address: '', commune: '', city: ''},
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            vendedor: relatedInvoice?.vendedor || '',
            local: relatedInvoice?.local || '',
            neto: data.amount / 1.19,
            iva: data.amount - (data.amount / 1.19),
            total: data.amount,
            details: data.reason,
            status: 'Aplicada',
            createdBy: 'Usuario Admin',
            condicionVenta: relatedInvoice?.condicionVenta || ''
        };
        setDocuments(prev => [newCreditNote, ...prev]);
        setNewCreditNoteModalOpen(false);
        toast({
            title: "Nota de Crédito Creada",
            description: `Se ha creado una nota de crédito para ${data.client}.`
        });
    };
    
    const handleCreateDebitNote = (data: DebitNoteFormData) => {
        const relatedInvoice = documents.find(doc => doc.id === data.originalInvoiceId);
        const newDebitNote: Document = {
            id: `ND${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            type: 'Nota de Débito',
            client: relatedInvoice?.client || {name: data.client, rut: '', giro: '', address: '', commune: '', city: ''},
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            vendedor: relatedInvoice?.vendedor || '',
            local: relatedInvoice?.local || '',
            neto: data.amount / 1.19,
            iva: data.amount - (data.amount / 1.19),
            total: data.amount,
            details: data.reason,
            status: 'Pendiente',
            createdBy: 'Usuario Admin',
            condicionVenta: relatedInvoice?.condicionVenta || ''
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
            pdf.save(fileName);
            toast({
                title: "PDF Descargado",
                description: `El documento ${fileName} ha sido descargado.`,
            });
        }
    };
    
    const handleExportExcel = () => {
        const dataToExport = filteredDocuments.map(doc => ({
            'Documento': doc.id,
            'Tipo': doc.type,
            'Fecha': new Date(doc.date + 'T00:00:00').toLocaleDateString('es-CL', { timeZone: 'UTC' }),
            'Cliente': doc.client.name,
            'Responsable': doc.createdBy,
            'Total': doc.total,
            'Estado': doc.status,
            'Detalles': doc.items ? doc.items.map(i => `${i.quantity}x ${initialRecipes.find(r=>r.id === i.recipeId)?.name}`).join('; ') : doc.details,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Documentos");
        XLSX.writeFile(workbook, `reporte-documentos-${new Date().toISOString().split('T')[0]}.xlsx`);

         toast({
            title: "Excel Descargado",
            description: "El listado de documentos ha sido exportado a Excel.",
        });
    }


  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AppLayout pageTitle="Facturación Electrónica">
    
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
                              <TableCell className="p-3">{new Date(doc.date + 'T00:00:00').toLocaleDateString('es-CL', { timeZone: 'UTC' })}</TableCell>
                              <TableCell className="p-3">{doc.client.name}</TableCell>
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
                            <CardTitle className="font-headline">Gestión de Documentos</CardTitle>
                            <CardDescription className="font-body">Gestiona facturas, notas de crédito, pagos y conciliaciones.</CardDescription>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                           <Button asChild variant="outline">
                                <Link href="/accounting">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
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
                     <div className="flex flex-wrap items-end gap-4 border-t pt-6">
                        <div className="flex-1 min-w-[280px]">
                            <Label>Filtrar por Fecha de Documento</Label>
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
                        </div>
                        <div className="flex items-center gap-2">
                             <Button 
                                variant="outline"
                                onClick={handleExportExcel} 
                                disabled={!dateRange?.from || !dateRange?.to}
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Exportar Detalle
                            </Button>
                            <Button 
                                onClick={() => handleDownloadPdf(reportContentRef, `reporte-contable-${format(dateRange?.from ?? new Date(), 'yyyy-MM-dd')}-a-${format(dateRange?.to ?? new Date(), 'yyyy-MM-dd')}.pdf`)} 
                                disabled={!dateRange?.from || !dateRange?.to}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Reporte Contable
                            </Button>
                        </div>
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
                            <div className="text-sm text-muted-foreground">{new Date(doc.date + 'T00:00:00').toLocaleDateString('es-CL', { timeZone: 'UTC' })}</div>
                        </TableCell>
                        <TableCell>{doc.client.name}</TableCell>
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
      
      <Dialog open={isNewInvoiceModalOpen} onOpenChange={setNewInvoiceModalOpen}>
          <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                  <DialogTitle className="font-headline">Crear Nueva Factura</DialogTitle>
                  <DialogDescription className="font-body">
                      Completa los detalles para crear una nueva factura.
                  </DialogDescription>
              </DialogHeader>
              <InvoiceForm
                  onSubmit={handleCreateInvoice}
                  onCancel={() => setNewInvoiceModalOpen(false)}
                  customers={initialCustomers}
                  recipes={initialRecipes}
              />
          </DialogContent>
      </Dialog>
      
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

      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-4xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="font-headline">Detalle de {selectedDocument?.type}: {selectedDocument?.id}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <>
            <div className="max-h-[75vh] overflow-y-auto p-1">
                <div ref={detailsModalContentRef} className="p-8 bg-white text-black font-body text-xs" style={{ width: '21cm', minHeight: '29.7cm' }}>
                    <header className="flex justify-between items-start mb-4">
                        <div className='w-1/2'>
                            <h2 className="font-bold text-sm">ALIMENTOS VOLLKORN SPA</h2>
                            <p>Giro: FABRICACIÓN DE PAN, PRODUCTOS DE PANADERIA Y PASTELERIA</p>
                            <p>Dirección: TERUEL 7282</p>
                            <p>LA REINA - SANTIAGO</p>
                            <p>www.vollkorn.cl</p>
                        </div>
                        <div className='w-1/3'>
                           <Logo className="w-full" />
                        </div>
                        <div className="w-1/3 border-2 border-black p-2 text-center">
                            <p className="font-bold text-red-600">R.U.T.: 81.767.400-3</p>
                            <h2 className="font-bold text-lg">{selectedDocument.type.toUpperCase()}</h2>
                            <p>No. {selectedDocument.id}</p>
                            <p>S.I.I. - NUÑOA</p>
                        </div>
                    </header>

                    <section className="grid grid-cols-2 gap-4 mb-2 border-2 border-black p-2 text-xs">
                        <div className="border-r pr-2">
                             <div className="grid grid-cols-3"><strong className="col-span-1">Señor(es):</strong><span className="col-span-2">{selectedDocument.client.name}</span></div>
                             <div className="grid grid-cols-3"><strong className="col-span-1">R.U.T.:</strong><span className="col-span-2">{selectedDocument.client.rut}</span></div>
                             <div className="grid grid-cols-3"><strong className="col-span-1">Giro:</strong><span className="col-span-2">{selectedDocument.client.giro}</span></div>
                             <div className="grid grid-cols-3"><strong className="col-span-1">Dirección:</strong><span className="col-span-2">{selectedDocument.client.address}</span></div>
                             <div className="grid grid-cols-3"><strong className="col-span-1">Comuna:</strong><span className="col-span-2">{selectedDocument.client.commune}</span></div>
                             <div className="grid grid-cols-3"><strong className="col-span-1">Ciudad:</strong><span className="col-span-2">{selectedDocument.client.city}</span></div>
                        </div>
                        <div>
                             <div className="grid grid-cols-2"><strong className="col-span-1">F. Emisión:</strong><span>{format(new Date(selectedDocument.date + 'T00:00:00'), "dd 'de' MMMM 'del' yyyy", { locale: es })}</span></div>
                             <div className="grid grid-cols-2"><strong className="col-span-1">F. Vencimiento:</strong><span>{format(new Date(selectedDocument.dueDate + 'T00:00:00'), "dd 'de' MMMM 'del' yyyy", { locale: es })}</span></div>
                             <div className="grid grid-cols-2"><strong className="col-span-1">Vendedor:</strong><span>{selectedDocument.vendedor}</span></div>
                             <div className="grid grid-cols-2"><strong className="col-span-1">Local:</strong><span>{selectedDocument.local}</span></div>
                        </div>
                    </section>
                    
                    <section className="border-2 border-black p-2 text-xs">
                        <div className="grid grid-cols-2">
                            <div><strong>CONDICION DE VENTA:</strong> {selectedDocument.condicionVenta}</div>
                            <div className="text-right"><strong>VENCIMIENTOS:</strong> {format(new Date(selectedDocument.dueDate + 'T00:00:00'), 'yyyy-MM-dd')}</div>
                        </div>
                    </section>
                    
                    <section className="border-2 border-t-0 border-black text-xs">
                        <Table>
                           <TableHeader>
                                <TableRow>
                                    <TableHead className="text-black p-1 h-auto border-r">No.</TableHead>
                                    <TableHead className="text-black p-1 h-auto border-r">Código</TableHead>
                                    <TableHead className="text-black p-1 h-auto border-r">Detalle</TableHead>
                                    <TableHead className="text-black p-1 h-auto border-r">U.M.</TableHead>
                                    <TableHead className="text-black p-1 h-auto border-r text-right">Precio</TableHead>
                                    <TableHead className="text-black p-1 h-auto border-r text-right">Cantidad</TableHead>
                                    <TableHead className="text-black p-1 h-auto border-r text-right">Descto.</TableHead>
                                    <TableHead className="text-black p-1 h-auto text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedDocument.items?.map((item, index) => {
                                    const recipe = initialRecipes.find(r => r.id === item.recipeId);
                                    const format = recipe?.formats.find(f => f.sku === item.formatSku);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="p-1 border-r">{index + 1}</TableCell>
                                            <TableCell className="p-1 border-r">{format?.sku}</TableCell>
                                            <TableCell className="p-1 border-r">{recipe?.name}</TableCell>
                                            <TableCell className="p-1 border-r">CJ</TableCell>
                                            <TableCell className="p-1 border-r text-right">${item.unitPrice.toLocaleString('es-CL')}</TableCell>
                                            <TableCell className="p-1 border-r text-right">{item.quantity}</TableCell>
                                            <TableCell className="p-1 border-r text-right"></TableCell>
                                            <TableCell className="p-1 text-right">${(item.quantity * item.unitPrice).toLocaleString('es-CL')}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </section>

                    <section className="border-2 border-t-0 border-black p-2 text-xs">
                        <div><strong>Referencia:</strong> {selectedDocument.purchaseOrderNumber}</div>
                    </section>
                    
                    <footer className="mt-2 text-xs">
                       <div className="h-10"></div>
                       <div className="flex justify-end">
                            <div className="w-1/3">
                                <div className="grid grid-cols-2 border-b"><p>Neto:</p><p className="text-right">${selectedDocument.neto.toLocaleString('es-CL')}</p></div>
                                <div className="grid grid-cols-2 border-b"><p>Exento:</p><p className="text-right">$0</p></div>
                                <div className="grid grid-cols-2 border-b"><p>IVA 19%:</p><p className="text-right">${selectedDocument.iva.toLocaleString('es-CL')}</p></div>
                                <div className="grid grid-cols-2 font-bold"><p>Total:</p><p className="text-right">${selectedDocument.total.toLocaleString('es-CL')}</p></div>
                            </div>
                       </div>
                       <div className="h-20"></div>
                       <div className="text-center">Timbre Electrónico SII</div>
                    </footer>
                </div>
            </div>
           <DialogFooter className="p-6 pt-0">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
                <Button onClick={() => handleDownloadPdf(detailsModalContentRef, `${selectedDocument?.type.toLowerCase().replace(/ /g, '-')}-${selectedDocument?.id}.pdf`)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                </Button>
            </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
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
