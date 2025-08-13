
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomersPage() {
    return (
        <AppLayout pageTitle="Mantenedor de Clientes">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Gestión de Clientes</CardTitle>
                    <CardDescription className="font-body">
                        Centraliza la información de tus clientes, incluyendo datos de contacto, facturación y listas de precios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-body text-muted-foreground">Funcionalidad en construcción.</p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
