
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ArrowLeft, PlusCircle, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type FixedAsset = {
    id: string;
    name: string;
    acquisitionDate: string;
    cost: number;
    usefulLifeYears: number; // Vida útil en años
    accumulatedDepreciation: number;
    bookValue: number;
};

const initialAssets: FixedAsset[] = [
    { id: 'ASSET-001', name: 'Horno Industrial Modelo X', acquisitionDate: '2022-01-15', cost: 15000000, usefulLifeYears: 10, accumulatedDepreciation: 3750000, bookValue: 11250000 },
    { id: 'ASSET-002', name: 'Vehículo de Reparto (Patente XY-1234)', acquisitionDate: '2023-03-20', cost: 12000000, usefulLifeYears: 5, accumulatedDepreciation: 2400000, bookValue: 9600000 },
    { id: 'ASSET-003', name: 'Amasadora Industrial 200L', acquisitionDate: '2021-11-01', cost: 8000000, usefulLifeYears: 8, accumulatedDepreciation: 2750000, bookValue: 5250000 },
    { id: 'ASSET-004', name: 'Sistema de Refrigeración', acquisitionDate: '2022-06-30', cost: 5000000, usefulLifeYears: 7, accumulatedDepreciation: 1428571, bookValue: 3571429 },
];


const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
};

export default function FixedAssetsPage() {
    const [assets, setAssets] = useState<FixedAsset[]>(initialAssets);

    const totals = useMemo(() => {
        return assets.reduce((acc, asset) => {
            acc.cost += asset.cost;
            acc.accumulatedDepreciation += asset.accumulatedDepreciation;
            acc.bookValue += asset.bookValue;
            return acc;
        }, { cost: 0, accumulatedDepreciation: 0, bookValue: 0 });
    }, [assets]);

    return (
        <AppLayout pageTitle="Activos Fijos">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Gestión de Activos Fijos</CardTitle>
                            <CardDescription className="font-body">
                                Administra el ciclo de vida de los bienes de la empresa, su depreciación y valorización.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button asChild variant="outline">
                                <Link href="/accounting">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir Activo
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Activo</TableHead>
                                <TableHead>Fecha Adquisición</TableHead>
                                <TableHead className="text-right">Costo Original</TableHead>
                                <TableHead className="text-right">Depreciación Acumulada</TableHead>
                                <TableHead className="text-right">Valor Libro</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell className="font-medium">{asset.name}</TableCell>
                                    <TableCell>{new Date(asset.acquisitionDate).toLocaleDateString('es-CL')}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(asset.cost)}</TableCell>
                                    <TableCell className="text-right text-red-600">({formatCurrency(asset.accumulatedDepreciation)})</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(asset.bookValue)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem>Ver Detalle</DropdownMenuItem>
                                                <DropdownMenuItem>Registrar Depreciación</DropdownMenuItem>
                                                <DropdownMenuItem>Dar de Baja</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="font-bold text-base">
                                <TableCell colSpan={2}>Totales</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.cost)}</TableCell>
                                <TableCell className="text-right text-red-600">({formatCurrency(totals.accumulatedDepreciation)})</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.bookValue)}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
