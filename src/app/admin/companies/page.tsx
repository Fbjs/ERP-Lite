'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type Company = {
    id: string;
    name: string;
    rut: string;
    activity: string;
    address: string;
    commune: string;
    city: string;
    phone: string;
    email: string;
};

const initialCompanies: Company[] = [
    {
        id: '1',
        name: 'Panificadora Vollkorn SPA',
        rut: '76.123.456-7',
        activity: 'Elaboración de productos de panadería',
        address: 'Avenida Principal 123',
        commune: 'Santiago',
        city: 'Santiago',
        phone: '+56 2 2123 4567',
        email: 'contacto@vollkorn.cl',
    },
];

const CompanyForm = ({ company, onSubmit, onCancel }: { company?: Company, onSubmit: (data: Company) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Company>(company || {
        id: '',
        name: '',
        rut: '',
        activity: '',
        address: '',
        commune: '',
        city: '',
        phone: '',
        email: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="name">Razón Social</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="rut">RUT</Label>
                    <Input id="rut" value={formData.rut} onChange={handleChange} required />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="activity">Giro</Label>
                <Input id="activity" value={formData.activity} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="address">Dirección</Label>
                    <Input id="address" value={formData.address} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="commune">Comuna</Label>
                    <Input id="commune" value={formData.commune} onChange={handleChange} required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={formData.phone} onChange={handleChange} required />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
             <DialogFooter className="sticky bottom-0 bg-background py-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{company ? 'Guardar Cambios' : 'Crear Empresa'}</Button>
            </DialogFooter>
        </form>
    );
};


export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>(initialCompanies);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);
    const { toast } = useToast();

    const handleOpenModal = (company?: Company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedCompany(undefined);
        setIsModalOpen(false);
    };

    const handleSubmit = (data: Company) => {
        if (selectedCompany) {
            // Editing
            setCompanies(companies.map(c => c.id === data.id ? data : c));
            toast({ title: 'Empresa Actualizada', description: `Los datos de ${data.name} han sido guardados.` });
        } else {
            // Creating
            const newCompany = { ...data, id: (companies.length + 1).toString() };
            setCompanies([...companies, newCompany]);
            toast({ title: 'Empresa Creada', description: `Se ha añadido ${data.name}.` });
        }
        handleCloseModal();
    };
    
    const handleDelete = (companyId: string) => {
        setCompanies(companies.filter(c => c.id !== companyId));
        toast({ title: 'Empresa Eliminada', variant: 'destructive', description: 'La empresa ha sido eliminada del sistema.' });
    };

    return (
        <AppLayout pageTitle="Mantenedor de Empresas">
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <CardTitle className="font-headline">Gestión de Empresas</CardTitle>
                                <CardDescription className="font-body">
                                    Administra las distintas razones sociales que operan en el sistema.
                                </CardDescription>
                            </div>
                            <Button onClick={() => handleOpenModal()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir Empresa
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Razón Social</TableHead>
                                    <TableHead>RUT</TableHead>
                                    <TableHead>Ciudad</TableHead>
                                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell className="font-medium">{company.name}</TableCell>
                                        <TableCell>{company.rut}</TableCell>
                                        <TableCell>{company.city}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleOpenModal(company)}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(company.id)}>
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
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{selectedCompany ? 'Editar Empresa' : 'Añadir Nueva Empresa'}</DialogTitle>
                        <DialogDescription className="font-body">
                            {selectedCompany ? 'Modifica los datos de la empresa.' : 'Completa el formulario para registrar una nueva empresa.'}
                        </DialogDescription>
                    </DialogHeader>
                    <CompanyForm company={selectedCompany} onSubmit={handleSubmit} onCancel={handleCloseModal} />
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
