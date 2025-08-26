import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import CashFlowProjection from '@/components/cash-flow-projection';
import { Suspense } from 'react';

export default function CashFlowPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <AppLayout pageTitle="Flujo de Caja">
                <CashFlowProjection />
            </AppLayout>
        </Suspense>
    );
}
