import AppLayout from '@/components/layout/app-layout';
import ForecastForm from '@/components/forecast-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ForecastPage() {
    return (
        <AppLayout pageTitle="Production Forecast">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Production Volume Forecast</CardTitle>
                        <CardDescription className="font-body">
                            Based on recent sales data and current inventory, this tool will recommend a production volume forecast.
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
