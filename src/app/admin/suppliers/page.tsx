
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import SupplierForm from '@/components/supplier-form';

export type Supplier = {
    id: string;
    name: string;
    rut: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
};

const initialSuppliers: Supplier[] = [
    { id: '1', name: 'Harinas del Sur S.A.', rut: '77.890.123-4', contactPerson: 'Carlos Fuentes', phone: '+56 2 2987 6543', email: 'ventas@harinasdelsur.cl', address: 'El Molino 123, Colchagua' },
    { id: '2', name: 'Distribuidora Lácteos del Maule', rut: '76.543.210-9', contactPerson: 'Beatriz Soto', phone: '+56 71 234 5678', email: 'contacto@lacteosmaule.cl', address: 'Ruta 5 Sur Km 250, Talca' },
    { id: '3', name: 'Insumos de Panadería ProPan', rut: '78.111.222-3', contactPerson: 'Jorge Rivera', phone: '+56 2 2111 2233', email: 'jrivera@propan.cl', address: 'Av. Matta 456, Santiago' },
];

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>(undefined);
    const { toast } = useToast();

    const handleOpenModal = (supplier?: Supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedSupplier(undefined);
        setIsModalOpen(false);
    };

    const handleSubmit = (data: Omit<Supplier, 'id'>) => {
        if (selectedSupplier) {
            // Editing
            const updatedSupplier = { ...data, id: selectedSupplier.id };
            setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? updatedSupplier : s));
            toast({ title: 'Proveedor Actualizado', description: `Los datos de ${data.name} han sido guardados.` });
        } else {
            // Creating
            const newSupplier = { ...data, id: (suppliers.length + 1).toString() };
            setSuppliers([...suppliers, newSupplier]);
            toast({ title: 'Proveedor Creado', description: `Se ha añadido a ${data.name}.` });
        }
        handleCloseModal();
    };

    const handleDelete = (supplierId: string) => {
        const supplierToDelete = suppliers.find(s => s.id === supplierId);
        setSuppliers(suppliers.filter(s => s.id !== supplierId));
        toast({ title: 'Proveedor Eliminado', variant: 'destructive', description: `El proveedor ${supplierToDelete?.name} ha sido eliminado.` });
    };

    return (
        <AppLayout pageTitle="Mantenedor de Proveedores">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Proveedores</CardTitle>
                            <CardDescription className="font-body">
                                Administra la información de contacto, productos y condiciones de tus proveedores.
                            </CardDescription>
                        </div>
                        <Button onClick={() => handleOpenModal()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Proveedor
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell className="font-medium">{supplier.name}</TableCell>
                                    <TableCell>{supplier.contactPerson}</TableCell>
                                    <TableCell>{supplier.phone}</TableCell>
                                    <TableCell>{supplier.email}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenModal(supplier)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(supplier.id)}>
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{selectedSupplier ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor'}</DialogTitle>
                        <DialogDescription className="font-body">
                            {selectedSupplier ? 'Modifica los datos del proveedor.' : 'Completa el formulario para registrar un nuevo proveedor.'}
                        </DialogDescription>
                    </DialogHeader>
                    <SupplierForm 
                        supplier={selectedSupplier}
                        onSubmit={handleSubmit} 
                        onCancel={handleCloseModal} 
                    />
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
