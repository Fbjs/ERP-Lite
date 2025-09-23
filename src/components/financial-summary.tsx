
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Landmark } from 'lucide-react';

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
};

const financialData = {
    activos: {
        circulantes: [
            { item: 'CAJA Y BANCOS', amount: 62183501 },
            { item: 'INVERSIONES FINNACIERAS', amount: 70105969 },
            { item: 'CLIENTES', amount: 137505651 },
            { item: 'DOCUMENTOS POR COBRAR', amount: 29699877 },
            { item: 'OBLIGACIONES DEL PERSONAL', amount: 7500106 },
            { item: 'EXISTENCIAS', amount: 45819888 },
            { item: 'PPM Y OTROS IMPUESTOS ANUALES', amount: 3060481 },
            { item: 'OTROS ACTIVOS CIRCULANTES', amount: 17834356 },
        ],
        fijos: [
            { item: 'Maquinarias', amount: 316616745 },
            { item: 'Vehiculos', amount: 7051240 },
            { item: 'Equipos', amount: 65094943 },
            { item: 'Muebles', amount: 15525199 },
            { item: 'Herramientas', amount: 7373406 },
            { item: 'Software', amount: 4265556 },
            { item: 'Repuesto A.Fijo', amount: 7827629 },
            { item: 'DEPRECIACION ACUMULADA', amount: -210883525 },
        ],
        otros: [
            { item: 'OPERACIONES PENDIENTES', amount: -120100 },
        ]
    },
    pasivos: {
        cortoPlazo: [
            { item: 'PROVEEDORES', amount: 56038609 },
            { item: 'REMUNERACIONES POR PAGAR', amount: 20434002 },
            { item: 'OTROS IMPUESTOS POR PAGAR', amount: 11812519 },
            { item: 'OTRAS OBLIGACIONES C/P', amount: 29551259 },
        ],
        largoPlazo: [
            { item: 'BANCOS L/P', amount: 189446104 },
        ]
    },
    patrimonio: [
        { item: 'CAPITAL PAGADO', amount: 74000000 },
        { item: 'RESERVAS', amount: 67522015 },
        { item: 'RESULTADO EJ ANTERIORES', amount: 73040991 },
        { item: 'RESULTADO DEL EJERCICIO', amount: 64615423 },
    ]
};

const calculateTotal = (items: { item: string; amount: number }[]) => items.reduce((acc, item) => acc + item.amount, 0);

const totalActivoCirculante = calculateTotal(financialData.activos.circulantes);
const totalActivoFijo = calculateTotal(financialData.activos.fijos);
const totalOtrosActivos = calculateTotal(financialData.activos.otros);
const totalActivos = totalActivoCirculante + totalActivoFijo + totalOtrosActivos;

const totalPasivoCortoPlazo = calculateTotal(financialData.pasivos.cortoPlazo);
const totalPasivoLargoPlazo = calculateTotal(financialData.pasivos.largoPlazo);
const totalPasivos = totalPasivoCortoPlazo + totalPasivoLargoPlazo;

const totalPatrimonio = calculateTotal(financialData.patrimonio);
const totalPasivoPatrimonio = totalPasivos + totalPatrimonio;

const DetailTable = ({ items }: { items: { item: string; amount: number }[] }) => (
    <Table>
        <TableBody>
            {items.map((data, index) => (
                <TableRow key={index}>
                    <TableCell className="py-1">{data.item}</TableCell>
                    <TableCell className="text-right py-1">{formatCurrency(data.amount)}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);


export default function FinancialSummary() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="font-headline">Balance Financiero General</CardTitle>
                <CardDescription>Resumen de la posición financiera de la empresa (Año 2021).</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                    <div className="p-4 bg-secondary rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><TrendingUp /> TOTAL ACTIVOS</h3>
                        <p className="text-2xl font-bold">{formatCurrency(totalActivos)}</p>
                    </div>
                     <div className="p-4 bg-secondary rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><TrendingDown /> TOTAL PASIVOS</h3>
                        <p className="text-2xl font-bold">{formatCurrency(totalPasivos)}</p>
                    </div>
                     <div className="p-4 bg-secondary rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Landmark /> TOTAL PATRIMONIO</h3>
                        <p className="text-2xl font-bold">{formatCurrency(totalPatrimonio)}</p>
                    </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="activos">
                        <AccordionTrigger className="font-semibold">Activos ({formatCurrency(totalActivos)})</AccordionTrigger>
                        <AccordionContent>
                            <Accordion type="single" collapsible>
                                <AccordionItem value="act-circulantes">
                                    <AccordionTrigger className="pl-4 text-base">Activo Circulante ({formatCurrency(totalActivoCirculante)})</AccordionTrigger>
                                    <AccordionContent className="pl-8"><DetailTable items={financialData.activos.circulantes} /></AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="act-fijos">
                                    <AccordionTrigger className="pl-4 text-base">Activo Fijo ({formatCurrency(totalActivoFijo)})</AccordionTrigger>
                                    <AccordionContent className="pl-8"><DetailTable items={financialData.activos.fijos} /></AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="act-otros">
                                    <AccordionTrigger className="pl-4 text-base">Otros Activos ({formatCurrency(totalOtrosActivos)})</AccordionTrigger>
                                    <AccordionContent className="pl-8"><DetailTable items={financialData.activos.otros} /></AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pasivos-patrimonio">
                        <AccordionTrigger className="font-semibold">Pasivos y Patrimonio ({formatCurrency(totalPasivoPatrimonio)})</AccordionTrigger>
                        <AccordionContent>
                            <Accordion type="single" collapsible>
                                <AccordionItem value="pas-circulantes">
                                    <AccordionTrigger className="pl-4 text-base">Pasivo a Corto Plazo ({formatCurrency(totalPasivoCortoPlazo)})</AccordionTrigger>
                                    <AccordionContent className="pl-8"><DetailTable items={financialData.pasivos.cortoPlazo} /></AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="pas-largo-plazo">
                                    <AccordionTrigger className="pl-4 text-base">Pasivo a Largo Plazo ({formatCurrency(totalPasivoLargoPlazo)})</AccordionTrigger>
                                    <AccordionContent className="pl-8"><DetailTable items={financialData.pasivos.largoPlazo} /></AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="patrimonio">
                                    <AccordionTrigger className="pl-4 text-base">Patrimonio ({formatCurrency(totalPatrimonio)})</AccordionTrigger>
                                    <AccordionContent className="pl-8"><DetailTable items={financialData.patrimonio} /></AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}

