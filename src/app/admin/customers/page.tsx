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
import CustomerForm from '@/components/customer-form';

export type Customer = {
    id: string;
    name: string;
    rut: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    priceList: string;
};

const initialCustomers: Customer[] = [
    { id: '1', name: 'Panaderia San Jose', rut: '76.111.222-3', contactPerson: 'Mariana Rojas', phone: '+56 9 8877 6655', email: 'compras@sanjose.cl', address: 'Calle Larga 45, Maipú', priceList: 'Mayorista A' },
    { id: '2', name: 'Cafe Central', rut: '77.222.333-4', contactPerson: 'Pedro Pascal', phone: '+56 2 2333 4455', email: 'pedro@cafecentral.cl', address: 'Av. Providencia 1234, Providencia', priceList: 'Cafetería Especial' },
    { id: '3', name: 'Supermercado del Sur', rut: '78.333.444-5', contactPerson: 'Luisa Perez', phone: '+56 9 1122 3344', email: 'lperez@delsur.cl', address: 'Gran Avenida 5678, La Cisterna', priceList: 'Supermercado' },
];

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
    const { toast } = useToast();

    const handleOpenModal = (customer?: Customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedCustomer(undefined);
        setIsModalOpen(false);
    };

    const handleSubmit = (data: Omit<Customer, 'id'>) => {
        if (selectedCustomer) {
            // Editing
            const updatedCustomer = { ...data, id: selectedCustomer.id };
            setCustomers(customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
            toast({ title: 'Cliente Actualizado', description: `Los datos de ${data.name} han sido guardados.` });
        } else {
            // Creating
            const newCustomer = { ...data, id: (customers.length + 1).toString() };
            setCustomers([...customers, newCustomer]);
            toast({ title: 'Cliente Creado', description: `Se ha añadido a ${data.name}.` });
        }
        handleCloseModal();
    };

    const handleDelete = (customerId: string) => {
        const customerToDelete = customers.find(c => c.id === customerId);
        setCustomers(customers.filter(c => c.id !== customerId));
        toast({ title: 'Cliente Eliminado', variant: 'destructive', description: `El cliente ${customerToDelete?.name} ha sido eliminado.` });
    };

    return (
        <AppLayout pageTitle="Mantenedor de Clientes">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Clientes</CardTitle>
                            <CardDescription className="font-body">
                                Centraliza la información de tus clientes, incluyendo datos de contacto, facturación y listas de precios.
                            </CardDescription>
                        </div>
                         <Button onClick={() => handleOpenModal()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Cliente
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
                                <TableHead>Lista de Precios</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.contactPerson}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>{customer.priceList}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenModal(customer)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(customer.id)}>
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
                        <DialogTitle className="font-headline">{selectedCustomer ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</DialogTitle>
                        <DialogDescription className="font-body">
                            {selectedCustomer ? 'Modifica los datos del cliente.' : 'Completa el formulario para registrar un nuevo cliente.'}
                        </DialogDescription>
                    </DialogHeader>
                    <CustomerForm 
                        customer={selectedCustomer}
                        onSubmit={handleSubmit} 
                        onCancel={handleCloseModal} 
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
