
'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, ArrowLeft, AreaChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import AppLayout from '@/components/layout/app-layout';

const reportData = [
  { month: "sep-24", "Aceites y Grasas": 560562, "aditivos": 5481100, "endulzantes": 543723, "envasado": 5442831, "harinas": 18596893, "masa madre": 984195, "semillas": 597202, "Facturacion": 146746100, "Dias": 21, "HH normal": 4018, "HH Extra": 430, "Unidades Producidas": null, "KG Harina": 39442, "$ Total Energia Electrica": 1826, "$ Energia Gas": 3229, "$ Demasia": 3004180, "HH Pnaderia (4P/4A)": 1543, "HH Extra Panaderia": 301 },
  { month: "oct-24", "Aceites y Grasas": 720126, "aditivos": 7112435, "endulzantes": 606741, "envasado": 8310285, "harinas": 23660389, "masa madre": 1299694, "semillas": 758255, "Facturacion": 190568169, "Dias": 25, "HH normal": 4219, "HH Extra": 361, "Unidades Producidas": 85692, "KG Harina": 50938, "$ Total Energia Electrica": 1772, "$ Energia Gas": 3649, "$ Demasia": 4003845, "HH Pnaderia (4P/4A)": 1406, "HH Extra Panaderia": 247 },
  { month: "nov-24", "Aceites y Grasas": 833104, "aditivos": 6980621, "endulzantes": 744854, "envasado": 8312237, "harinas": 23053504, "masa madre": 1265531, "semillas": 851053, "Facturacion": 187587889, "Dias": 25, "HH normal": 4327, "HH Extra": 306, "Unidades Producidas": null, "KG Harina": 49512, "$ Total Energia Electrica": 2304, "$ Energia Gas": 2528, "$ Demasia": 3721225, "HH Pnaderia (4P/4A)": 1446, "HH Extra Panaderia": 137 },
  { month: "dic-24", "Aceites y Grasas": 815253, "aditivos": 6550588, "endulzantes": 679045, "envasado": 7618281, "harinas": 21512224, "masa madre": 1218707, "semillas": 716112, "Facturacion": 177882225, "Dias": 25, "HH normal": 0, "HH Extra": 0, "Unidades Producidas": null, "KG Harina": 46315, "$ Total Energia Electrica": null, "$ Energia Gas": null, "$ Demasia": 3373441, "HH Pnaderia (4P/4A)": 0, "HH Extra Panaderia": 0 },
  { month: "ene-25", "Aceites y Grasas": 1012038, "aditivos": 7033319, "endulzantes": 664405, "envasado": 8583750, "harinas": 23174005, "masa madre": 1247686, "semillas": 798510, "Facturacion": 186383340, "Dias": 26, "HH normal": 0, "HH Extra": 0, "Unidades Producidas": null, "KG Harina": 49416, "$ Total Energia Electrica": 2580, "$ Energia Gas": 3237, "$ Demasia": 3751590, "HH Pnaderia (4P/4A)": 0, "HH Extra Panaderia": 0 }
];

const formatCurrency = (value: number | null) => {
  if (value === null || isNaN(value)) return 'N/A';
  return value.toLocaleString('es-CL', { maximumFractionDigits: 0 });
};

const formatNumber = (value: number | null, decimals = 2) => {
  if (value === null || isNaN(value) || !isFinite(value)) return 'N/A';
  return value.toLocaleString('es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatPercent = (value: number | null) => {
    if (value === null || isNaN(value)) return 'N/A';
    return `${formatNumber(value * 100, 1)}%`;
}

export default function ConsumptionReportPage() {
    const { toast } = useToast();

    const processedData = useMemo(() => {
        return reportData.map(d => {
            const totalMateriales = d["Aceites y Grasas"] + d["aditivos"] + d["endulzantes"] + d["envasado"] + d["harinas"] + d["masa madre"] + d["semillas"];
            const HH_Total = d["HH normal"] + d["HH Extra"];
            const HH_Totale_Panaderia = d["HH Pnaderia (4P/4A)"] + d["HH Extra Panaderia"];

            return {
                ...d,
                totalMateriales,
                "MP/Facturacion": d.Facturacion > 0 ? totalMateriales / d.Facturacion : 0,
                "Venta/dia": d.Dias > 0 ? d.Facturacion / d.Dias : 0,
                "HH Total": HH_Total,
                "Productividad HH": HH_Total > 0 ? d.Facturacion / HH_Total : 0,
                "Unidades/HH": d["Unidades Producidas"] && HH_Total > 0 ? d["Unidades Producidas"] / HH_Total : null,
                "HH/Unidades": d["Unidades Producidas"] && HH_Total > 0 ? HH_Total / d["Unidades Producidas"] : null,
                "Factor (Facturacion/Costo MP)": totalMateriales > 0 ? d.Facturacion / totalMateriales : 0,
                "Fact/Kg Harina": d["KG Harina"] > 0 ? d.Facturacion / d["KG Harina"] : 0,
                "Kg Harina/HH": HH_Total > 0 ? d["KG Harina"] / HH_Total : 0,
                "$ Electricidad/Kg Harina": d["$ Total Energia Electrica"] && d["KG Harina"] > 0 ? d["$ Total Energia Electrica"] / d["KG Harina"] : null,
                "$Gas/Kg Harina": d["$ Energia Gas"] && d["KG Harina"] > 0 ? d["$ Energia Gas"] / d["KG Harina"] : null,
                "HH Totale Panaderia": HH_Totale_Panaderia,
                "Demasia$/kg Harina": d["$ Demasia"] && d["KG Harina"] > 0 ? d["$ Demasia"] / d["KG Harina"] : null,
                "Demasi$/HH Totales panaderia": d["$ Demasia"] && HH_Totale_Panaderia > 0 ? d["$ Demasia"] / HH_Totale_Panaderia : null,
                "Kg Harina/Demasia$": d["$ Demasia"] > 0 ? d["KG Harina"] / d["$ Demasia"] : null
            };
        })
    }, []);

    const metrics = [
        { label: "Aceites y Grasas", key: "Aceites y Grasas", isCurrency: true },
        { label: "Aditivos", key: "aditivos", isCurrency: true },
        { label: "Endulzantes", key: "endulzantes", isCurrency: true },
        { label: "Envasado", key: "envasado", isCurrency: true },
        { label: "Harinas", key: "harinas", isCurrency: true },
        { label: "Masa Madre", key: "masa madre", isCurrency: true },
        { label: "Semillas", key: "semillas", isCurrency: true },
        { label: "Total MP", key: "totalMateriales", isCurrency: true, isBold: true },
        { label: "MP / Facturación", key: "MP/Facturacion", isPercent: true },
        { label: "Facturación", key: "Facturacion", isCurrency: true },
        { label: "Días", key: "Dias" },
        { label: "Venta/día", key: "Venta/dia", isCurrency: true },
        { label: "HH Normal", key: "HH normal" },
        { label: "HH Extra", key: "HH Extra" },
        { label: "HH Total", key: "HH Total", isBold: true },
        { label: "Productividad HH ($Fact/HH)", key: "Productividad HH", isCurrency: true },
        { label: "Unidades Producidas", key: "Unidades Producidas" },
        { label: "Unidades/HH", key: "Unidades/HH" },
        { label: "HH/Unidades", key: "HH/Unidades" },
        { label: "Factor (Fact/Costo MP)", key: "Factor (Facturacion/Costo MP)" },
        { label: "KG Harina", key: "KG Harina" },
        { label: "Fact/Kg Harina", key: "Fact/Kg Harina" },
        { label: "Kg Harina/HH", key: "Kg Harina/HH" },
        { label: "$ Total Energía Eléctrica", key: "$ Total Energia Electrica" },
        { label: "$ Electricidad/Kg Harina", key: "$ Electricidad/Kg Harina" },
        { label: "$ Energía Gas", key: "$ Energia Gas" },
        { label: "$Gas/Kg Harina", key: "$Gas/Kg Harina" },
        { label: "$ Demasía", key: "$ Demasia", isCurrency: true },
        { label: "HH Panadería", key: "HH Pnaderia (4P/4A)" },
        { label: "HH Extra Panadería", key: "HH Extra Panaderia" },
        { label: "HH Total Panadería", key: "HH Totale Panaderia", isBold: true },
        { label: "Demasía$/kg Harina", key: "Demasia$/kg Harina" },
        { label: "Demasía$/HH Totales", key: "Demasi$/HH Totales panaderia" },
        { label: "Kg Harina/Demasía$", key: "Kg Harina/Demasia$" },
    ];


    return (
        <AppLayout pageTitle="Reporte de Consumo y Productividad">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="font-headline">Informe de Consumo de Materias Primas y KPIs</CardTitle>
                            <CardDescription className="font-body">Análisis mensual de los indicadores clave de producción.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/production">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver a Producción
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-secondary">Familia</TableHead>
                                {processedData.map(d => (
                                    <TableHead key={d.month} className="text-center">{d.month}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics.map(metric => (
                                <TableRow key={metric.key} className={metric.isBold ? 'font-bold' : ''}>
                                    <TableCell className="sticky left-0 bg-secondary">{metric.label}</TableCell>
                                    {processedData.map(d => (
                                        <TableCell key={d.month} className="text-right">
                                            {metric.isCurrency ? formatCurrency(d[metric.key as keyof typeof d] as number)
                                             : metric.isPercent ? formatPercent(d[metric.key as keyof typeof d] as number)
                                             : formatNumber(d[metric.key as keyof typeof d] as number, metric.key === 'Dias' || metric.key.includes('HH') ? 0 : 2)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

