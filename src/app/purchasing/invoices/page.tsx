
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SupplierInvoicesPage() {
    return (
        <AppLayout pageTitle="Facturas de Proveedores">
            <Card>
                <CardHeader>
                     <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Facturas de Proveedores</CardTitle>
                            <CardDescription className="font-body">
                                Esta funcionalidad está en construcción. Aquí podrás registrar y administrar las facturas de tus proveedores.
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/purchasing">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>
        </AppLayout>
    );
}
