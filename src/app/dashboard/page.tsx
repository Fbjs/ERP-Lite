"use client"
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Circle, Package, ShoppingCart, BarChart3, Warehouse, Trash2, AreaChart, TrendingUp, TrendingDown, Scale, Users, Banknote, FileText, Factory } from 'lucide-react';
import { initialOrders as allProductionOrders } from '@/app/production/page';
import { initialOrders as allSalesOrders } from '@/app/sales/page';
import { initialInventoryItems } from '@/app/inventory/page';
import FinancialSummary from '@/components/financial-summary';
import FinancialIndicesChart from '@/components/financial-indices-chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const reportSections = [
    {
        area: "Área de Manufactura",
        icon: Factory,
        reports: [
            { title: "Reporte de Producción", href: "/production", description: "Informe del total de panes producidos por tipo." },
            { title: "Reporte de Calidad y Mermas", href: "/production/waste-report", description: "Análisis de fallos, motivos y porcentajes de incidencia." },
            { title: "Reporte de Consumo Mensual", href: "/production/consumption-report", description: "Consumo de materias primas vs. venta." },
        ]
    },
    {
        area: "Área Financiera",
        icon: Banknote,
        reports: [
            { title: "Balances y EERR", href: "/accounting/reports", description: "Balances generales y estados de resultados." },
            { title: "Flujo de Caja", href: "/accounting/cash-flow", description: "Proyección y análisis de los flujos de efectivo." },
            { title: "Inventario", href: "/inventory", description: "Control de stock de materias primas y productos." },
        ]
    },
    {
        area: "Área Comercial",
        icon: ShoppingCart,
        reports: [
            { title: "Reporte General de Ventas", href: "/sales/general-report", description: "Análisis de ventas por producto, vendedor y más." },
            { title: "Reporte por Vendedor", href: "/sales/daily-vendor-report", description: "Pedidos consolidados para cada vendedor." },
            { title: "Reporte Industrial", href: "/sales/industrial-report", description: "Vista detallada de pedidos industriales." },
        ]
    },
    {
        area: "Área de Personal",
        icon: Users,
        reports: [
            { title: "Reporte de Asistencia", href: "/hr/attendance", description: "Control de ausencias, atrasos y horas trabajadas." },
            { title: "Gestión de Vacaciones", href: "/hr/leave", description: "Solicitudes y calendario de vacaciones y permisos." },
            { title: "Indicadores de RRHH", href: "/hr/reports", description: "Métricas de rotación, ausentismo y costos." },
        ]
    }
];

export default function DashboardPage() {

  const productionData = allProductionOrders
    .filter(order => order.status !== 'Completado')
    .map(order => ({
        name: order.product.length > 15 ? order.product.substring(0,12) + '...' : order.product,
        produced: order.quantity,
    }));
    
  const recentOrders = allSalesOrders.slice(0, 4);

  const completedProductionOrders = allProductionOrders.filter(o => o.status === 'Completado').length;
  const totalProductionOrders = allProductionOrders.length;
  const productionCompletionPercentage = totalProductionOrders > 0 ? Math.round((completedProductionOrders / totalProductionOrders) * 100) : 0;

  const totalFinishedGoods = initialInventoryItems
    .filter(item => item.category === 'Producto Terminado')
    .reduce((acc, item) => acc + item.stock, 0);


  return (
    <AppLayout pageTitle="Panel de Control">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Estado de Producción</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{productionCompletionPercentage}% Completado</div>
            <p className="text-xs text-muted-foreground font-body">{completedProductionOrders} de {totalProductionOrders} órdenes completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Niveles de Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{totalFinishedGoods.toLocaleString('es-CL')} unidades</div>
            <p className="text-xs text-muted-foreground font-body">Total de productos terminados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Pedidos Recientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">+{recentOrders.length}</div>
            <p className="text-xs text-muted-foreground font-body">Últimas 24 horas</p>
          </CardContent>
        </Card>
      </div>

       <div className="mt-6">
        <FinancialSummary />
      </div>

       <div className="mt-6">
          <h2 className="text-2xl font-headline font-semibold mb-4 text-primary">Central de Reportes por Área</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportSections.map(section => (
                <Card key={section.area}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-xl">
                            <section.icon className="w-6 h-6 text-primary" />
                            {section.area}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {section.reports.map(report => (
                             <Button asChild variant="outline" className="justify-start text-left h-auto py-2">
                                <Link href={report.href}>
                                    <div>
                                        <p className="font-semibold">{report.title}</p>
                                        <p className="text-xs text-muted-foreground font-normal">{report.description}</p>
                                    </div>
                                </Link>
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            ))}
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Ventas Recientes</CardTitle>
            <CardDescription className="font-body">Una lista de las órdenes de venta más recientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID de Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                            order.status === 'Completado' ? 'default' :
                            order.status === 'Enviado' ? 'secondary' :
                            order.status === 'Cancelado' ? 'destructive' :
                            'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">${order.amount.toLocaleString('es-CL')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Volumen de Producción en Curso</CardTitle>
            <CardDescription className="font-body">Unidades en estado "En Cola" o "En Progreso".</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                            fontFamily: "var(--font-body)",
                            borderRadius: "var(--radius)"
                        }}
                    />
                    <Bar dataKey="produced" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
            <CardHeader>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <CardTitle className="font-headline">Evolución de Indicadores Financieros</CardTitle>
                        <CardDescription>Principales ratios financieros desde Enero 2021.</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/accounting/reports">
                           <BarChart3 className="mr-2 h-4 w-4" /> Ver Historial Detallado
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="h-[400px]">
                <FinancialIndicesChart />
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
