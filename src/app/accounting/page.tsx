
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import InvoiceForm, { InvoiceFormData } from '@/components/invoice-form';

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
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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

    const handleSendByEmail = () => {
        toast({
            title: "Factura Enviada",
            description: `La factura ${selectedInvoice?.id} ha sido enviada por correo.`,
        });
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
                        <DropdownMenuItem onClick={handleSendByEmail}>Enviar por Correo</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Detalle de Factura: {selectedInvoice?.id}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="max-h-[75vh] overflow-y-auto p-1">
                <div ref={detailsModalContentRef} className="p-6 bg-white text-black">
                    <div className="border-b-2 border-gray-200 pb-4 mb-4 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 font-headline">Factura</h2>
                        <p className="text-sm text-gray-500 font-body">Vollkorn ERP</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-body mb-6">
                        <div><p className="font-semibold text-gray-600">Nº Factura:</p><p>{selectedInvoice.id}</p></div>
                        <div><p className="font-semibold text-gray-600">Fecha:</p><p>{new Date(selectedInvoice.date).toLocaleDateString('es-ES')}</p></div>
                        <div><p className="font-semibold text-gray-600">Cliente:</p><p>{selectedInvoice.client}</p></div>
                        <div><p className="font-semibold text-gray-600">Monto Total:</p><p>${selectedInvoice.total.toLocaleString('es-CL')}</p></div>
                        <div className="col-span-2"><p className="font-semibold text-gray-600">Estado:</p><p>{selectedInvoice.status}</p></div>
                        <div className="col-span-2"><p className="font-semibold text-gray-600">Detalles:</p><p className="whitespace-pre-wrap">{selectedInvoice.items}</p></div>
                    </div>
                    <div className="border-t-2 border-gray-200 pt-4 mt-4 text-center text-xs text-gray-500">
                        <p>Documento generado el {new Date().toLocaleDateString('es-ES')}</p>
                    </div>
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
      
    </AppLayout>
  );
}

