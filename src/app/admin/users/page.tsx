
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
    return (
        <AppLayout pageTitle="Mantenedor de Usuarios">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Gestión de Usuarios</CardTitle>
                    <CardDescription className="font-body">
                        Crea, edita y gestiona los usuarios que tienen acceso al sistema, y asigna sus perfiles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-body text-muted-foreground">Funcionalidad en construcción.</p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
