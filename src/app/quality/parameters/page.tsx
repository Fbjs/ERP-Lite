
'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import QualityParameterForm from '@/components/quality-parameter-form';


type QualityParameter = {
    id: string;
    productName: string;
    parameter: string; // e.g., 'pH', 'Peso', 'Color', 'Humedad'
    minValue: number | null;
    maxValue: number | null;
    unit: string; // e.g., '', 'gr', '%', 'escala 1-10'
};

const initialParameters: QualityParameter[] = [
    { id: '1', productName: 'PAN LINAZA 500 GRS', parameter: 'Peso (gr)', minValue: 495, maxValue: 505, unit: 'gr' },
    { id: '2', productName: 'PAN LINAZA 500 GRS', parameter: 'pH Masa', minValue: 4.5, maxValue: 5.5, unit: '' },
    { id: '3', productName: 'PAN LINAZA 500 GRS', parameter: 'Humedad (%)', minValue: 38, maxValue: 42, unit: '%' },
    { id: '4', productName: 'PAN GUAGUA BLANCA 16X16', parameter: 'Peso (gr)', minValue: 90, maxValue: 110, unit: 'gr' },
];


export default function QualityParametersPage() {
    const [parameters, setParameters] = useState<QualityParameter[]>(initialParameters);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParameter, setSelectedParameter] = useState<QualityParameter | null>(null);
    const { toast } = useToast();

    const handleOpenForm = (param: QualityParameter | null) => {
        setSelectedParameter(param);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (data: Omit<QualityParameter, 'id'>) => {
        if (selectedParameter) {
            // Editing
            const updatedParam = { ...selectedParameter, ...data };
            setParameters(parameters.map(p => p.id === selectedParameter.id ? updatedParam : p));
            toast({ title: 'Parámetro Actualizado', description: `Se guardaron los cambios para ${data.parameter}.` });
        } else {
            // Creating
            const newParam = { ...data, id: `PARAM-${Date.now()}` };
            setParameters([newParam, ...parameters]);
            toast({ title: 'Parámetro Creado', description: `Se ha añadido el parámetro ${data.parameter}.` });
        }
        setIsModalOpen(false);
        setSelectedParameter(null);
    };

    const handleDelete = (paramId: string) => {
        setParameters(parameters.filter(p => p.id !== paramId));
        toast({ title: 'Parámetro Eliminado', variant: 'destructive' });
    };

    return (
        <AppLayout pageTitle="Parámetros de Control de Calidad">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Mantenedor de Parámetros de Calidad</CardTitle>
                            <CardDescription>
                                Define los rangos aceptables para cada métrica de calidad de tus productos.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/quality">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button onClick={() => handleOpenForm(null)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nuevo Parámetro
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Parámetro</TableHead>
                                <TableHead className="text-center">Valor Mínimo</TableHead>
                                <TableHead className="text-center">Valor Máximo</TableHead>
                                <TableHead>Unidad</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parameters.map(param => (
                                <TableRow key={param.id}>
                                    <TableCell className="font-medium">{param.productName}</TableCell>
                                    <TableCell>{param.parameter}</TableCell>
                                    <TableCell className="text-center">{param.minValue}</TableCell>
                                    <TableCell className="text-center">{param.maxValue}</TableCell>
                                    <TableCell>{param.unit}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenForm(param)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. Se eliminará el parámetro de calidad para este producto.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(param.id)}>Sí, eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">{selectedParameter ? 'Editar Parámetro' : 'Nuevo Parámetro de Calidad'}</DialogTitle>
                    </DialogHeader>
                    <QualityParameterForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsModalOpen(false)}
                        initialData={selectedParameter}
                    />
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
