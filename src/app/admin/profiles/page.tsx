
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilesPage() {
    return (
        <AppLayout pageTitle="Mantenedor de Perfiles">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Gestión de Perfiles y Roles</CardTitle>
                    <CardDescription className="font-body">
                        Define los roles de los usuarios y asigna permisos específicos para cada módulo del sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-body text-muted-foreground">Funcionalidad en construcción.</p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
