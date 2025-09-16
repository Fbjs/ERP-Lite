
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
    name: string; // Descriptive name for the rule
    rate: number;
    // Optional fields for matching. If a field is null, it matches all.
    vendor: string | null; // e.g., 'RENE', null for all vendors
    productId: string | null; // e.g., 'GUABCO16', null for all products
    locationId: string | null; // e.g., 'loc2', null for all locations
};

export const initialCommissionRules: CommissionRule[] = [
    { id: '1', name: 'Tasa General', rate: 0.01, vendor: null, productId: null, locationId: null },
    { id: '2', name: 'Comisión Especial RENE', rate: 0.02, vendor: 'RENE', productId: null, locationId: null },
    { id: '3', name: 'Bono Producto Estrella', rate: 0.05, vendor: null, productId: 'GUABCO16', locationId: null },
    { id: '4', name: 'Bono Sucursal Providencia', rate: 0.03, vendor: null, productId: null, locationId: 'loc2' },
    { id: '5', name: 'Campaña RENE en Providencia', rate: 0.04, vendor: 'RENE', productId: null, locationId: 'loc2' },
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
                                            {rule.productId && <Badge variant="secondary">Producto: {initialRecipes.find(r=>r.id === rule.productId)?.name || rule.productId}</Badge>}
                                            {rule.locationId && <Badge variant="secondary">Local: {rule.locationId}</Badge>}
                                            {!rule.vendor && !rule.productId && !rule.locationId && <Badge>General</Badge>}
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
