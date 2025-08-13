
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuppliersPage() {
    return (
        <AppLayout pageTitle="Mantenedor de Proveedores">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Gestión de Proveedores</CardTitle>
                    <CardDescription className="font-body">
                        Administra la información de contacto, productos y condiciones de tus proveedores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-body text-muted-foreground">Funcionalidad en construcción.</p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
