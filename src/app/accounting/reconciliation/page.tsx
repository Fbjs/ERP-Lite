
'use client';

import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import BankReconciliation from '@/components/bank-reconciliation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReconciliationPage() {
    return (
        <AppLayout pageTitle="Conciliación Bancaria">
             <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Herramienta de Conciliación Bancaria</CardTitle>
                            <CardDescription className="font-body">
                                Carga un extracto bancario y concilia las transacciones con los movimientos del sistema.
                            </CardDescription>
                        </div>
                         <Button asChild variant="outline">
                            <Link href="/accounting">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <BankReconciliation />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
