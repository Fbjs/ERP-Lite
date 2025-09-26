
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardList, Truck, FileText, BarChart3 } from 'lucide-react';
import AppLayout from '@/components/layout/app-layout';
import Link from 'next/link';

const purchasingSections = [
    { href: '/purchasing/orders', title: 'Órdenes de Compra', description: 'Crea y gestiona órdenes de compra a proveedores.', icon: ClipboardList },
    { href: '/purchasing/receptions', title: 'Recepción de Mercadería', description: 'Registra la entrada de productos al inventario.', icon: Truck },
    { href: '/purchasing/invoices', title: 'Facturas de Proveedores', description: 'Administra y registra las facturas de compra.', icon: FileText },
    { href: '/purchasing/cost-analysis', title: 'Análisis de Costos', description: 'Revisa el costo ponderado de entradas y salidas.', icon: BarChart3 },
]

export default function PurchasingPage() {
    return (
        <AppLayout pageTitle="Compras y Adquisiciones">
             <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Panel de Compras</CardTitle>
                        <CardDescription className="font-body">
                            Selecciona un módulo para gestionar el ciclo de adquisiciones de la empresa.
                        </CardDescription>
                    </CardHeader>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {purchasingSections.map((section) => (
                        <Link href={section.href} key={section.href} className="block hover:no-underline">
                            <Card className="hover:border-primary hover:shadow-lg transition-all h-full">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <section.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="font-headline text-xl">{section.title}</CardTitle>
                                        <CardDescription className="font-body">{section.description}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
