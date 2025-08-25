import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import BankReconciliation from '@/components/bank-reconciliation';

export default function ReconciliationPage() {
    return (
        <AppLayout pageTitle="Conciliación Bancaria">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Herramienta de Conciliación Bancaria</CardTitle>
                    <CardDescription className="font-body">
                        Carga un extracto bancario y concilia las transacciones con los movimientos del sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BankReconciliation />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
