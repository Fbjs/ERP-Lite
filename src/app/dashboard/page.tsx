"use client"
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Circle, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { initialOrders as allProductionOrders } from '@/app/production/page';
import { initialOrders as allSalesOrders } from '@/app/sales/page';
import { initialInventoryItems } from '@/app/inventory/page';
import FinancialSummary from '@/components/financial-summary';
import FinancialIndicesChart from '@/components/financial-indices-chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
