
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, MoreHorizontal, Truck } from 'lucide-react';
import Link from 'next/link';
import { initialPurchaseOrders, PurchaseOrder } from '../orders/page';
import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};


export default function ReceptionsPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [receptionDetails, setReceptionDetails] = useState<{[key: string]: {received: number, notes: string}}>({});
    const { toast } = useToast();

    const pendingReceptions = useMemo(() => {
        return orders.filter(o => o.status === 'Aprobado');
    }, [orders]);

    const handleOpenReception = (order: PurchaseOrder) => {
        setSelectedOrder(order);
        const initialDetails = order.items.reduce((acc, item) => {
            acc[item.name] = { received: item.quantity, notes: '' };
            return acc;
        }, {} as {[key: string]: {received: number, notes: string}});
        setReceptionDetails(initialDetails);
    };

    const handleReceptionDetailChange = (itemName: string, field: 'received' | 'notes', value: string | number) => {
        setReceptionDetails(prev => ({
            ...prev,
            [itemName]: {
                ...prev[itemName],
                [field]: value
            }
        }));
    };
    
    const handleConfirmReception = () => {
        if (!selectedOrder) return;
        
        // Update order status
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'Recibido' } : o));

        // Display toast notifications
        toast({
            title: "Recepción Registrada",
            description: `Se ha registrado la recepción para la orden ${selectedOrder.id}.`,
        });
         toast({
            title: "Inventario Actualizado",
            description: `El stock de los productos recibidos ha sido actualizado.`,
        });

        // Close modal
        setSelectedOrder(null);
    };


    return (
        <AppLayout pageTitle="Recepción de Mercadería">
            <Card>
                <CardHeader>
                     <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Recepción de Mercadería</CardTitle>
                            <CardDescription className="font-body">
                                Registra la entrada de productos desde órdenes de compra aprobadas.
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/purchasing">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
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
                            {pendingReceptions.length > 0 ? pendingReceptions.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.supplierName}</TableCell>
                                    <TableCell>{format(parseISO(order.deliveryDate), 'P', { locale: es })}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                    <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
                                    <TableCell>
                                        <Dialog onOpenChange={(open) => !open && setSelectedOrder(null)}>
                                            <DialogTrigger asChild>
                                                <Button onClick={() => handleOpenReception(order)}>
                                                    <Truck className="mr-2 h-4 w-4" />
                                                    Registrar Recepción
                                                </Button>
                                            </DialogTrigger>
                                            {selectedOrder && (
                                            <DialogContent className="sm:max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle className="font-headline">Registrar Recepción para OC: {selectedOrder.id}</DialogTitle>
                                                    <DialogDescription>
                                                        Confirma las cantidades recibidas del proveedor: <strong>{selectedOrder.supplierName}</strong>.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="max-h-[60vh] overflow-y-auto p-1">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Producto</TableHead>
                                                                <TableHead className="text-center">Cant. Pedida</TableHead>
                                                                <TableHead className="text-center">Cant. Recibida</TableHead>
                                                                <TableHead>Notas</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {selectedOrder.items.map(item => (
                                                                <TableRow key={item.name}>
                                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                                                    <TableCell>
                                                                        <Input 
                                                                            type="number"
                                                                            className="text-center"
                                                                            value={receptionDetails[item.name]?.received || ''}
                                                                            onChange={(e) => handleReceptionDetailChange(item.name, 'received', Number(e.target.value))}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                         <Input 
                                                                            placeholder="Lote, Vencimiento, etc."
                                                                            value={receptionDetails[item.name]?.notes || ''}
                                                                            onChange={(e) => handleReceptionDetailChange(item.name, 'notes', e.target.value)}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setSelectedOrder(null)}>Cancelar</Button>
                                                    <Button onClick={handleConfirmReception}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Confirmar Recepción y Actualizar Stock
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                            )}
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No hay órdenes de compra pendientes de recepción.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
