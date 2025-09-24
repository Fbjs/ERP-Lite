
'use client';

import { Suspense, useMemo } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { initialOrders, Order } from '@/app/production/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const QualityCheckContent = () => {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const order: Order | undefined = useMemo(() => {
        return initialOrders.find(o => o.id === orderId);
    }, [orderId]);

    if (!order) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Orden no encontrada</CardTitle>
                    <CardDescription>
                        No se pudo encontrar la orden de producción solicitada.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild variant="outline">
                        <Link href="/production">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Producción
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Example parameters for this product
    const parameters = [
        { name: 'Peso (gr)', min: 495, max: 505 },
        { name: 'pH Masa', min: 4.5, max: 5.5 },
        { name: 'Humedad (%)', min: 38, max: 42 },
        { name: 'Aspecto Visual', type: 'text' },
    ];

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline">Control de Calidad: Orden {order.id}</CardTitle>
                        <CardDescription>
                            Producto: <span className="font-semibold">{order.product}</span> | Cantidad: {order.quantity} unidades
                        </CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/production">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Parámetro</TableHead>
                                <TableHead>Rango Aceptable</TableHead>
                                <TableHead>Valor Medido</TableHead>
                                <TableHead>Resultado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parameters.map(param => (
                                <TableRow key={param.name}>
                                    <TableCell className="font-medium">{param.name}</TableCell>
                                    <TableCell>{param.type === 'text' ? 'N/A' : `${param.min} - ${param.max}`}</TableCell>
                                    <TableCell>
                                        <Input type={param.type === 'text' ? 'text' : 'number'} className="w-48"/>
                                    </TableCell>
                                    <TableCell>
                                        {/* Logic to show check/cross would go here */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="space-y-2">
                        <Label htmlFor="observations">Observaciones Generales</Label>
                        <textarea id="observations" className="w-full h-24 border rounded-md p-2"/>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="destructive" type="button">
                            <X className="mr-2 h-4 w-4" />
                            Rechazar Lote
                        </Button>
                        <Button type="submit">
                            <Check className="mr-2 h-4 w-4" />
                            Aprobar Lote
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default function QualityControlPage() {
    return (
        <AppLayout pageTitle="Control de Calidad por Lote">
            <Suspense fallback={<div>Cargando...</div>}>
                <QualityCheckContent />
            </Suspense>
        </AppLayout>
    );
}

