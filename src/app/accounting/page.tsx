
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, Mail, Wheat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import InvoiceForm, { InvoiceFormData } from '@/components/invoice-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type Invoice = {
  id: string;
  client: string;
  date: string;
  total: number;
  status: 'Pagada' | 'Pendiente' | 'Vencida';
  items: string;
};

const initialInvoices: Invoice[] = [
  { id: 'F001', client: 'Panaderia San Jose', date: '2023-10-28', total: 450.00, status: 'Pagada', items: '100 x Pan de Masa Madre, 50 x Baguettes' },
  { id: 'F002', client: 'Cafe Central', date: '2023-10-28', total: 1200.50, status: 'Pendiente', items: '200 x Croissants, 150 x Ciabattas' },
  { id: 'F003', client: 'Supermercado del Sur', date: '2023-10-27', total: 875.00, status: 'Pagada', items: '50 x Pain au Levain, 50 x Baguette Tradition' },
  { id: 'F004', client: 'Restaurante El Tenedor', date: '2023-10-26', total: 320.75, status: 'Vencida', items: '300 x Pan de Centeno' },
];

export default function AccountingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [isNewInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isSendEmailModalOpen, setSendEmailModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [emailToSend, setEmailToSend] = useState('');
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const detailsModalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const client = searchParams.get('client');
        const amount = searchParams.get('amount');
        const details = searchParams.get('details');

        if (client && amount && details) {
            const newInvoice: Invoice = {
                id: `F${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
                client,
                total: parseFloat(amount),
                date: new Date().toISOString().split('T')[0],
                status: 'Pendiente',
                items: details,
            };
            setInvoices(prev => [newInvoice, ...prev]);
            toast({
                title: "Factura Generada",
                description: `Se ha creado la factura para ${client}.`,
            });
            // Clean up URL to avoid creating invoice on refresh
            window.history.replaceState(null, '', '/accounting');
        }
    }, [searchParams, toast]);

    const handleCreateInvoice = (data: InvoiceFormData) => {
        const newInvoice: Invoice = {
            id: `F${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            client: data.client,
            total: data.amount,
            items: data.items,
            date: new Date().toISOString().split('T')[0],
            status: 'Pendiente',
        };
        setInvoices(prev => [newInvoice, ...prev]);
        setNewInvoiceModalOpen(false);
        toast({
            title: "Factura Creada",
            description: `Se ha creado la factura para ${data.client}.`
        });
    };

    const handleOpenDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setDetailsModalOpen(true);
    };

    const handleOpenSendEmail = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setEmailToSend('');
        setSendEmailModalOpen(true);
    };
    
    const handleConfirmSendEmail = () => {
        if (!emailToSend || !selectedInvoice) return;
        toast({
            title: "Factura Enviada",
            description: `La factura ${selectedInvoice.id} ha sido enviada a ${emailToSend}.`,
        });
        setSendEmailModalOpen(false);
        setEmailToSend('');
    };

    const handleDownloadPdf = async () => {
        const input = detailsModalContentRef.current;
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
            pdf.save(`factura-${selectedInvoice?.id}.pdf`);
            toast({
                title: "PDF Descargado",
                description: `La factura ${selectedInvoice?.id} ha sido descargada.`,
            });
        }
    };


  return (
    <AppLayout pageTitle="Contabilidad">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Facturación y Cuentas</CardTitle>
                    <CardDescription className="font-body">Gestiona facturas, cuentas por pagar y cobrar.</CardDescription>
                </div>
                <Button onClick={() => setNewInvoiceModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Factura
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura No.</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString('es-CL')}</TableCell>
                  <TableCell className="text-right">${invoice.total.toLocaleString('es-CL')}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'Pagada' ? 'default' : invoice.status === 'Pendiente' ? 'secondary' : 'destructive'}>
                      {invoice.status}
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
                        <DropdownMenuItem onClick={() => handleOpenDetails(invoice)}>Ver Detalle</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenSendEmail(invoice)}>Enviar por Correo</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
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
              />
          </DialogContent>
      </Dialog>
      
      {/* Modal Ver Detalles */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Detalle de Factura: {selectedInvoice?.id}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="max-h-[75vh] overflow-y-auto p-1">
                <div ref={detailsModalContentRef} className="p-8 bg-white text-black font-body">
                    <header className="flex justify-between items-start mb-10 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <Wheat className="w-12 h-12 text-orange-600" />
                            <div>
                                <h1 className="text-2xl font-bold font-headline text-gray-800">Panificadora Vollkorn</h1>
                                <p className="text-sm text-gray-500">Avenida Principal 123, Santiago, Chile</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-headline font-bold uppercase text-gray-700">Factura</h2>
                            <p className="text-sm text-gray-500">Nº: {selectedInvoice.id}</p>
                        </div>
                    </header>

                    <section className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <h3 className="font-headline text-lg font-semibold text-gray-600 mb-2 border-b pb-1">Facturar a:</h3>
                            <p className="font-bold text-gray-800">{selectedInvoice.client}</p>
                        </div>
                        <div className="text-right">
                             <div className="mb-2">
                                <span className="font-semibold text-gray-600">Fecha de Emisión: </span>
                                <span>{new Date(selectedInvoice.date).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Estado: </span>
                                <Badge 
                                    className={`text-white ${selectedInvoice.status === 'Pagada' ? 'bg-green-600' : selectedInvoice.status === 'Pendiente' ? 'bg-yellow-500' : 'bg-red-600'}`}
                                >
                                    {selectedInvoice.status}
                                </Badge>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <Table className="w-full">
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead className="text-left font-bold text-gray-700 uppercase py-3 px-4">Descripción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-b border-gray-200">
                                    <TableCell className="py-3 px-4 whitespace-pre-wrap">{selectedInvoice.items}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </section>
                    
                    <section className="flex justify-end mb-12">
                       <div className="w-1/3">
                          <div className="flex justify-between items-center py-2 border-b-2 border-gray-800">
                              <span className="font-headline font-semibold text-lg text-gray-700">Total</span>
                              <span className="font-headline font-bold text-xl text-gray-800">${selectedInvoice.total.toLocaleString('es-CL')}</span>
                          </div>
                       </div>
                    </section>

                    <footer className="text-center text-xs text-gray-400 border-t pt-4">
                        <p>Gracias por su compra. Documento generado por Vollkorn ERP.</p>
                        <p>Generado el {new Date().toLocaleString('es-ES')}</p>
                    </footer>
                </div>
            </div>
          )}
           <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Cerrar</Button>
                <Button onClick={handleDownloadPdf}>
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
                <DialogTitle className="font-headline">Enviar Factura por Correo</DialogTitle>
                <DialogDescription className="font-body">
                    Ingresa el correo electrónico para enviar la factura {selectedInvoice?.id}.
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
  );
}

    