import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import CashFlowProjection from '@/components/cash-flow-projection';
import { Suspense } from 'react';

export default function CashFlowPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <AppLayout pageTitle="Flujo de Caja">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Proyección de Flujo de Caja</CardTitle>
                        <CardDescription className="font-body">
                            Analiza el flujo de caja mensual actual y proyecta los saldos futuros para una mejor toma de decisiones financieras.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CashFlowProjection />
                    </CardContent>
                </Card>
            </AppLayout>
        </Suspense>
    );
}
