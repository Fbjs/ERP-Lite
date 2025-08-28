
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Banknote, BookCopy, BookOpen, Briefcase, FileText, Landmark, Library, PieChart, Scale, BookKey } from 'lucide-react';
import Link from 'next/link';


const modules = [
    {
        category: "Tesorería",
        links: [
            { href: '/accounting/cash-flow', title: 'Flujo de Caja', description: 'Proyecta y analiza los flujos de efectivo.', icon: AreaChart },
            { href: '/accounting/reconciliation', title: 'Conciliación Bancaria', description: 'Concilia extractos con movimientos.', icon: Landmark },
        ]
    },
    {
        category: "Facturación Electrónica",
        links: [
            { href: '/accounting/invoicing', title: 'Gestión de Documentos', description: 'Crea y administra facturas y notas.', icon: FileText },
        ]
    },
    {
        category: "Contabilidad",
        links: [
            { href: '/accounting/journal', title: 'Asientos Contables', description: 'Registra movimientos manuales.', icon: BookKey },
            { href: '/accounting/reports', title: 'Balances y Reportes', description: 'Genera balances y estados de resultados.', icon: Scale },
        ]
    },
    {
        category: "Libros Auxiliares",
        links: [
            { href: '/accounting/sales-ledger', title: 'Libro de Ventas', description: 'Consulta el registro de ventas.', icon: BookOpen },
            { href: '/accounting/purchase-ledger', title: 'Libro de Compras', description: 'Consulta el registro de compras.', icon: BookCopy },
            { href: '/accounting/fees-ledger', title: 'Libro de Honorarios', description: 'Administra las boletas de honorarios.', icon: Briefcase },
        ]
    }
];


export default function AccountingDashboardPage() {

    return (
        <AppLayout pageTitle="Contabilidad y Finanzas">
            <div className="space-y-8">
                {modules.map((module) => (
                    <div key={module.category}>
                        <h2 className="text-2xl font-headline font-semibold mb-4 text-primary">{module.category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {module.links.map((link) => (
                                <Link href={link.href} key={link.href} className="block hover:no-underline">
                                    <Card className="hover:border-primary hover:shadow-lg transition-all h-full flex flex-col">
                                        <CardHeader className="flex-grow">
                                            <div className="flex items-start gap-4">
                                                 <div className="p-3 bg-primary/10 rounded-full">
                                                    <link.icon className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="font-headline text-xl">{link.title}</CardTitle>
                                                    <CardDescription className="font-body mt-1">{link.description}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
