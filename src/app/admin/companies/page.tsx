
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompaniesPage() {
    return (
        <AppLayout pageTitle="Mantenedor de Empresas">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Gestión de Empresas</CardTitle>
                    <CardDescription className="font-body">
                        Aquí podrás añadir, editar y gestionar las diferentes empresas de tu organización.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-body text-muted-foreground">Funcionalidad en construcción.</p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
