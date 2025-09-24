
'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type ProductFamily = {
    id: string;
    name: string;
};

export const initialProductFamilies: ProductFamily[] = [
    { id: '1', name: 'PAN INDUSTRIAL' },
    { id: '2', name: 'TOSTADAS' },
    { id: '3', name: 'PASTELERIA' },
    { id: '4', name: 'PAN BLANCO' },
    { id: '5', name: 'PAN CENTENO' },
];

const FamilyForm = ({ family, onSubmit, onCancel }: { family?: ProductFamily, onSubmit: (name: string) => void, onCancel: () => void }) => {
    const [name, setName] = useState(family?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
                <Label htmlFor="name">Nombre de la Familia</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} required />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{family ? 'Guardar Cambios' : 'Crear Familia'}</Button>
            </DialogFooter>
        </form>
    );
};

export default function ProductFamiliesPage() {
    const [families, setFamilies] = useState<ProductFamily[]>(initialProductFamilies);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<ProductFamily | undefined>(undefined);
    const { toast } = useToast();

    const handleOpenModal = (family?: ProductFamily) => {
        setSelectedFamily(family);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedFamily(undefined);
        setIsModalOpen(false);
    };

    const handleSubmit = (name: string) => {
        if (selectedFamily) {
            setFamilies(families.map(f => f.id === selectedFamily.id ? { ...f, name } : f));
            toast({ title: 'Familia Actualizada', description: `La familia ha sido renombrada a "${name}".` });
        } else {
            const newFamily: ProductFamily = { id: (families.length + 1).toString(), name };
            setFamilies([...families, newFamily]);
            toast({ title: 'Familia Creada', description: `Se ha añadido la familia "${name}".` });
        }
        handleCloseModal();
    };

    const handleDelete = (familyId: string) => {
        setFamilies(families.filter(f => f.id !== familyId));
        toast({ title: 'Familia Eliminada', variant: 'destructive', description: 'La familia de productos ha sido eliminada.' });
    };

    return (
        <AppLayout pageTitle="Familias de Productos">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Mantenedor de Familias de Productos</CardTitle>
                            <CardDescription className="font-body">
                                Administra las categorías o familias en las que se agrupan tus recetas.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button asChild variant="outline">
                                <Link href="/admin">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={() => handleOpenModal()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir Familia
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre de la Familia</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {families.map((family) => (
                                <TableRow key={family.id}>
                                    <TableCell className="font-mono">{family.id}</TableCell>
                                    <TableCell className="font-medium">{family.name}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenModal(family)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(family.id)}>
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{selectedFamily ? 'Editar Familia' : 'Añadir Nueva Familia'}</DialogTitle>
                    </DialogHeader>
                    <FamilyForm
                        family={selectedFamily}
                        onSubmit={handleSubmit}
                        onCancel={handleCloseModal}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
