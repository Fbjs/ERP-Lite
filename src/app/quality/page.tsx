
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, SlidersHorizontal, BarChart3, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const qualityModules = [
    { href: '/quality/parameters', title: 'Parámetros de Calidad', description: 'Define los estándares y métricas para cada producto.', icon: SlidersHorizontal },
    { href: '#', title: 'Reportes de Calidad', description: 'Visualiza tendencias y tasas de no conformidad.', icon: BarChart3 },
    { href: '#', title: 'Documentación', description: 'Gestiona los manuales y procedimientos de calidad.', icon: FileText },
];

const recentChecks = [
    { id: 'QC-001', orderId: 'PROD021', product: 'PAN LINAZA 500 GRS', date: new Date(), result: 'Aprobado' },
    { id: 'QC-002', orderId: 'PROD022', product: 'PAN GUAGUA BLANCA 16X16', date: new Date(), result: 'Aprobado' },
    { id: 'QC-003', orderId: 'PROD019', product: 'PAN SCHWARZBROT 750 GRS', date: new Date(Date.now() - 86400000), result: 'Rechazado' },
];

export default function QualityPage() {
    return (
        <AppLayout pageTitle="Control de Calidad">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {qualityModules.map((module) => (
                        <Link href={module.href} key={module.href} className="block hover:no-underline">
                            <Card className="hover:border-primary hover:shadow-lg transition-all h-full flex flex-col">
                                <CardHeader className="flex-grow">
                                    <div className="flex items-start gap-4">
                                         <div className="p-3 bg-primary/10 rounded-full">
                                            <module.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="font-headline text-xl">{module.title}</CardTitle>
                                            <CardDescription className="font-body mt-1">{module.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Controles de Calidad Recientes</CardTitle>
                        <CardDescription>
                            Listado de los últimos controles realizados a las órdenes de producción.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Orden de Prod.</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Resultado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentChecks.map(check => (
                                    <TableRow key={check.id}>
                                        <TableCell>{check.orderId}</TableCell>
                                        <TableCell>{check.product}</TableCell>
                                        <TableCell>{format(check.date, 'dd-MM-yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={check.result === 'Aprobado' ? 'default' : 'destructive'}>
                                                {check.result}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">Ver Detalles</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
