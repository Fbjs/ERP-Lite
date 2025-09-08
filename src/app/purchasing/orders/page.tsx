
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import PurchaseOrderForm, { PurchaseOrderData, PurchaseOrderItem } from '@/components/purchase-order-form';
import { initialSuppliers } from '@/app/admin/suppliers/page';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

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

const initialPurchaseOrders: PurchaseOrder[] = [
    { id: 'OC-001', supplierId: '1', supplierName: 'Harinas del Sur S.A.', date: '2025-07-01', deliveryDate: '2025-07-05', items: [{ name: 'Harina de Trigo', quantity: 500, price: 1300 }, { name: 'Sal de Mar', quantity: 100, price: 500 }], total: 700000, status: 'Recibido' },
    { id: 'OC-002', supplierId: '2', supplierName: 'Distribuidora Lácteos del Maule', date: '2025-07-10', deliveryDate: '2025-07-12', items: [{ name: 'Levadura Fresca', quantity: 50, price: 8000 }], total: 400000, status: 'Aprobado' },
    { id: 'OC-003', supplierId: '3', supplierName: 'Insumos de Panadería ProPan', date: '2025-07-15', deliveryDate: '2025-07-18', items: [{ name: 'Bolsas de Papel', quantity: 2000, price: 100 }], total: 200000, status: 'Borrador' },
];

export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const { toast } = useToast();

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
        // Here you would also check if the order can be deleted based on its status
        setOrders(orders.filter(o => o.id !== orderId));
        toast({ title: 'Orden Eliminada', variant: 'destructive', description: 'La orden de compra ha sido eliminada.' });
    };

    return (
        <AppLayout pageTitle="Órdenes de Compra">
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
                                Crear Orden de Compra
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nº Orden</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Fecha Emisión</TableHead>
                                <TableHead>Fecha Entrega</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.supplierName}</TableCell>
                                    <TableCell>{format(new Date(order.date), 'P', { locale: es })}</TableCell>
                                    <TableCell>{format(new Date(order.deliveryDate), 'P', { locale: es })}</TableCell>
                                    <TableCell className="text-right">${order.total.toLocaleString('es-CL')}</TableCell>
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
                            ))}
                        </TableBody>
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
