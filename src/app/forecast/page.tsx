import AppLayout from '@/components/layout/app-layout';
import ForecastForm from '@/components/forecast-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ForecastPage() {
    return (
        <AppLayout pageTitle="Pronóstico de Producción">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Pronóstico de Volumen de Producción</CardTitle>
                        <CardDescription className="font-body">
                            Basado en datos de ventas recientes e inventario actual, esta herramienta recomendará un pronóstico de volumen de producción.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ForecastForm />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
