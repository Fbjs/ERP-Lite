
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { initialPurchaseOrders, PurchaseOrder } from '../orders/page';

type SupplierInvoice = {
    id: string;
    purchaseOrderId: string;
    supplierName: string;
    invoiceNumber: string;
    date: string;
    amount: number;
    status: 'Pendiente de Pago' | 'Pagada' | 'Vencida';
};

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
    const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const { toast } = useToast();
    
    const availableOrders = useMemo(() => {
        return initialPurchaseOrders.filter(order => order.status === 'Recibido');
    }, []);

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

    return (
        <AppLayout pageTitle="Facturas de Proveedores">
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
                            {invoices.length > 0 ? invoices.map(invoice => (
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
                                        No hay facturas registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
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
