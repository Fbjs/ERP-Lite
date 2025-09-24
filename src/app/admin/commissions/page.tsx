
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import CommissionRuleForm from '@/components/commission-rule-form';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { initialRecipes } from '@/app/recipes/page';
import { initialOrders } from '@/app/sales/page';

export type CommissionRule = {
    id: string;
    name: string; 
    rate: number;
    vendor: string | null; 
    productFamily: 'Panes Retail' | 'Panes guguas / industriales' | 'Pan rallado' | null;
    locationId: string | null; 
};

export const initialCommissionRules: CommissionRule[] = [
    // Felipe Campos
    { id: '1', name: 'Felipe Campos - Retail', rate: 0.105, vendor: 'Felipe Campos', productFamily: 'Panes Retail', locationId: null },
    { id: '2', name: 'Felipe Campos - Industrial', rate: 0.06, vendor: 'Felipe Campos', productFamily: 'Panes guguas / industriales', locationId: null },
    { id: '3', name: 'Felipe Campos - Pan Rallado', rate: 0.15, vendor: 'Felipe Campos', productFamily: 'Pan rallado', locationId: null },
    // Diego Cid
    { id: '4', name: 'Diego Cid - Retail', rate: 0.10, vendor: 'Diego Cid', productFamily: 'Panes Retail', locationId: null },
    { id: '5', name: 'Diego Cid - Industrial', rate: 0.06, vendor: 'Diego Cid', productFamily: 'Panes guguas / industriales', locationId: null },
    { id: '6', name: 'Diego Cid - Pan Rallado', rate: 0.15, vendor: 'Diego Cid', productFamily: 'Pan rallado', locationId: null },
    // Gabriel Martinez
    { id: '7', name: 'Gabriel Martinez - Retail', rate: 0.13, vendor: 'Gabriel Martinez', productFamily: 'Panes Retail', locationId: null },
    { id: '8', name: 'Gabriel Martinez - Industrial', rate: 0.06, vendor: 'Gabriel Martinez', productFamily: 'Panes guguas / industriales', locationId: null },
    { id: '9', name: 'Gabriel Martinez - Pan Rallado', rate: 0.15, vendor: 'Gabriel Martinez', productFamily: 'Pan rallado', locationId: null },
    // Francisca Sandoval
    { id: '10', name: 'Francisca Sandoval - Retail', rate: 0.105, vendor: 'Francisca Sandoval', productFamily: 'Panes Retail', locationId: null },
    { id: '11', name: 'Francisca Sandoval - Industrial', rate: 0.06, vendor: 'Francisca Sandoval', productFamily: 'Panes guguas / industriales', locationId: null },
    { id: '12', name: 'Francisca Sandoval - Pan Rallado', rate: 0.15, vendor: 'Francisca Sandoval', productFamily: 'Pan rallado', locationId: null },
    // Alejandro Zuñiga
    { id: '13', name: 'Alejandro Zuñiga - Retail', rate: 0.10, vendor: 'Alejandro Zuñiga', productFamily: 'Panes Retail', locationId: null },
    { id: '14', name: 'Alejandro Zuñiga - Industrial', rate: 0.06, vendor: 'Alejandro Zuñiga', productFamily: 'Panes guguas / industriales', locationId: null },
    { id: '15', name: 'Alejandro Zuñiga - Pan Rallado', rate: 0.15, vendor: 'Alejandro Zuñiga', productFamily: 'Pan rallado', locationId: null },
    // Esteban Troncoso
    { id: '16', name: 'Esteban Troncoso - Retail', rate: 0.10, vendor: 'Esteban Troncoso', productFamily: 'Panes Retail', locationId: null },
    { id: '17', name: 'Esteban Troncoso - Industrial', rate: 0.06, vendor: 'Esteban Troncoso', productFamily: 'Panes guguas / industriales', locationId: null },
    { id: '18', name: 'Esteban Troncoso - Pan Rallado', rate: 0.15, vendor: 'Esteban Troncoso', productFamily: 'Pan rallado', locationId: null },
    // Rene Medel - Jumbo Rancagua
    { id: '19', name: 'Rene Medel - Retail (Jumbo)', rate: 0.05, vendor: 'Rene Medel', productFamily: 'Panes Retail', locationId: 'Jumbo Rancagua' },
    { id: '20', name: 'Rene Medel - Industrial (Jumbo)', rate: 0.05, vendor: 'Rene Medel', productFamily: 'Panes guguas / industriales', locationId: 'Jumbo Rancagua' },
    { id: '21', name: 'Rene Medel - Pan Rallado (Jumbo)', rate: 0.05, vendor: 'Rene Medel', productFamily: 'Pan rallado', locationId: 'Jumbo Rancagua' },
];

export default function CommissionsPage() {
    const [rules, setRules] = useState<CommissionRule[]>(initialCommissionRules);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<CommissionRule | undefined>(undefined);
    const { toast } = useToast();

    const uniqueVendors = useMemo(() => {
        return [...new Set(initialOrders.map(order => order.dispatcher))];
    }, []);


    const handleOpenModal = (rule?: CommissionRule) => {
        setSelectedRule(rule);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedRule(undefined);
        setIsModalOpen(false);
    };

    const handleSubmit = (data: Omit<CommissionRule, 'id'>) => {
        if (selectedRule) {
            // Editing
            const updatedRule = { ...selectedRule, ...data };
            setRules(rules.map(r => r.id === selectedRule.id ? updatedRule : r));
            toast({ title: 'Regla Actualizada', description: `Se guardaron los cambios para la regla "${data.name}".` });
        } else {
            // Creating
            const newRule = { ...data, id: (rules.length + 1).toString() };
            setRules([...rules, newRule]);
            toast({ title: 'Regla Creada', description: `Se ha añadido la nueva regla de comisión "${data.name}".` });
        }
        handleCloseModal();
    };

    const handleDelete = (ruleId: string) => {
        setRules(rules.filter(r => r.id !== ruleId));
        toast({ title: 'Regla Eliminada', variant: 'destructive', description: `La regla de comisión ha sido eliminada.` });
    };

    return (
        <AppLayout pageTitle="Configuración de Comisiones">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Reglas de Comisión</CardTitle>
                            <CardDescription className="font-body">
                                Define las tasas de comisión combinando vendedor, producto o local.
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
                                Añadir Regla
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre de la Regla</TableHead>
                                <TableHead>Condiciones</TableHead>
                                <TableHead className="text-right">Tasa de Comisión</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {rule.vendor && <Badge variant="secondary">Vendedor: {rule.vendor}</Badge>}
                                            {rule.productFamily && <Badge variant="secondary">Familia: {rule.productFamily}</Badge>}
                                            {rule.locationId && <Badge variant="secondary">Local: {rule.locationId}</Badge>}
                                            {!rule.vendor && !rule.productFamily && !rule.locationId && <Badge>General</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{(rule.rate * 100).toFixed(2)}%</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenModal(rule)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(rule.id)}>
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
                        <DialogTitle className="font-headline">{selectedRule ? 'Editar Regla de Comisión' : 'Añadir Nueva Regla'}</DialogTitle>
                    </DialogHeader>
                    <CommissionRuleForm
                        rule={selectedRule}
                        onSubmit={handleSubmit}
                        onCancel={handleCloseModal}
                        recipes={initialRecipes}
                        vendors={uniqueVendors}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
