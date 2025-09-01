
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type WasteType = {
    id: string;
    name: string;
    description: string;
};

const initialWasteTypes: WasteType[] = [
    { id: '1', name: 'Por Forma', description: 'Merma debido a problemas con la forma o el moldeado del producto.' },
    { id: '2', name: 'Por Calidad', description: 'Merma por no cumplir los estándares de calidad (quemado, crudo, etc.).' },
    { id: '3', name: 'Otro', description: 'Cualquier otra causa de merma no especificada.' },
];


const WasteTypeForm = ({ wasteType, onSubmit, onCancel }: { wasteType?: WasteType, onSubmit: (data: Omit<WasteType, 'id'>) => void, onCancel: () => void }) => {
    const [name, setName] = useState(wasteType?.name || '');
    const [description, setDescription] = useState(wasteType?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, description });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
                <Label htmlFor="name">Nombre del Tipo de Merma</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
             <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{wasteType ? 'Guardar Cambios' : 'Crear Tipo'}</Button>
            </DialogFooter>
        </form>
    )
};


export default function WasteTypesPage() {
    const [wasteTypes, setWasteTypes] = useState<WasteType[]>(initialWasteTypes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWasteType, setSelectedWasteType] = useState<WasteType | undefined>(undefined);
    const { toast } = useToast();

    const handleOpenModal = (wasteType?: WasteType) => {
        setSelectedWasteType(wasteType);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setSelectedWasteType(undefined);
        setIsModalOpen(false);
    };

    const handleSubmit = (data: Omit<WasteType, 'id'>) => {
        if (selectedWasteType) {
            // Editing
            const updated = { ...data, id: selectedWasteType.id };
            setWasteTypes(wasteTypes.map(wt => wt.id === selectedWasteType.id ? updated : wt));
            toast({ title: 'Tipo de Merma Actualizado', description: `Se ha guardado "${data.name}".` });
        } else {
            // Creating
            const newWasteType = { ...data, id: (wasteTypes.length + 1).toString() };
            setWasteTypes([...wasteTypes, newWasteType]);
            toast({ title: 'Tipo de Merma Creado', description: `Se ha añadido "${data.name}".` });
        }
        handleCloseModal();
    };
    
    const handleDelete = (id: string) => {
        const toDelete = wasteTypes.find(wt => wt.id === id);
        setWasteTypes(wasteTypes.filter(wt => wt.id !== id));
        toast({ title: 'Tipo de Merma Eliminado', variant: 'destructive', description: `Se ha eliminado "${toDelete?.name}".` });
    };

    return (
        <AppLayout pageTitle="Tipos de Merma">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Mantenedor de Tipos de Merma</CardTitle>
                            <CardDescription className="font-body">
                                Administra las causas por las que se puede registrar una merma en producción.
                            </CardDescription>
                        </div>
                        <Button onClick={() => handleOpenModal()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Tipo de Merma
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {wasteTypes.map((wasteType) => (
                                <TableRow key={wasteType.id}>
                                    <TableCell className="font-medium">{wasteType.name}</TableCell>
                                    <TableCell>{wasteType.description}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenModal(wasteType)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(wasteType.id)}>
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
                        <DialogTitle className="font-headline">{selectedWasteType ? 'Editar Tipo de Merma' : 'Añadir Nuevo Tipo de Merma'}</DialogTitle>
                    </DialogHeader>
                    <WasteTypeForm 
                        wasteType={selectedWasteType} 
                        onSubmit={handleSubmit} 
                        onCancel={handleCloseModal} 
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
