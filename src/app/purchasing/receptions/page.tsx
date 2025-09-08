
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

const ReceptionForm = ({ order, onConfirm, onCancel }: { order: PurchaseOrder, onConfirm: (receivedItems: any[]) => void, onCancel: () => void }) => {
    const [receivedItems, setReceivedItems] = useState(() =>
        order.items.map(item => ({ ...item, receivedQuantity: item.quantity, notes: '' }))
    );

    const handleQuantityChange = (index: number, value: string) => {
        const newItems = [...receivedItems];
        newItems[index].receivedQuantity = Number(value);
        setReceivedItems(newItems);
    };

    const handleNotesChange = (index: number, value: string) => {
        const newItems = [...receivedItems];
        newItems[index].notes = value;
        setReceivedItems(newItems);
    };

    return (
        <div className="space-y-4">
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
                    {receivedItems.map((item, index) => (
                        <TableRow key={item.name}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={item.receivedQuantity}
                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    className="w-24 mx-auto text-center"
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    placeholder="Condición, lote, etc."
                                    value={item.notes}
                                    onChange={(e) => handleNotesChange(index, e.target.value)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <DialogFooter className="pt-4">
                <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button onClick={() => onConfirm(receivedItems)}>Confirmar Recepción</Button>
            </DialogFooter>
        </div>
    );
};

export default function ReceptionsPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const { toast } = useToast();

    const pendingReceptionOrders = useMemo(() => {
        return orders.filter(o => o.status === 'Aprobado');
    }, [orders]);

    const handleOpenModal = (order: PurchaseOrder) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };
    
    const handleConfirmReception = (receivedItems: any[]) => {
        if (!selectedOrder) return;
        
        // Here you would typically update inventory levels
        console.log("Received Items:", receivedItems);
        
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? {...o, status: 'Recibido'} : o));

        setIsModalOpen(false);
        setSelectedOrder(null);
        
        toast({
            title: 'Recepción Confirmada',
            description: `Se ha registrado la recepción para la orden ${selectedOrder.id}. El stock ha sido actualizado.`,
        });
    };

    return (
        <AppLayout pageTitle="Recepción de Mercadería">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Recepción de Mercadería</CardTitle>
                            <CardDescription className="font-body">
                                Registra la entrada de productos de órdenes de compra aprobadas.
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
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingReceptionOrders.length > 0 ? pendingReceptionOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.supplierName}</TableCell>
                                    <TableCell>{format(parseISO(order.deliveryDate), 'P', { locale: es })}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button onClick={() => handleOpenModal(order)}>
                                            <Truck className="mr-2 h-4 w-4" />
                                            Registrar Recepción
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No hay órdenes de compra pendientes de recepción.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Registrar Recepción de Orden: {selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            Verifica las cantidades recibidas y añade notas si es necesario.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <ReceptionForm
                            order={selectedOrder}
                            onConfirm={handleConfirmReception}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
