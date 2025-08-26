"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';

type Contract = {
  id: string;
  employeeName: string;
  employeeRut: string;
  contractType: 'Indefinido' | 'Plazo Fijo' | 'Por Obra' | 'Honorarios';
  startDate: string;
  endDate?: string;
  status: 'Activo' | 'Terminado' | 'Borrador';
};

const initialContracts: Contract[] = [
  { id: 'CON-001', employeeName: 'Juan Pérez', employeeRut: '12.345.678-9', contractType: 'Indefinido', startDate: '2022-01-15', status: 'Activo' },
  { id: 'CON-002', employeeName: 'Ana Gómez', employeeRut: '23.456.789-0', contractType: 'Plazo Fijo', startDate: '2023-03-01', endDate: '2024-02-29', status: 'Terminado' },
  { id: 'CON-003', employeeName: 'Luis Martínez', employeeRut: '11.222.333-4', contractType: 'Indefinido', startDate: '2021-08-20', status: 'Activo' },
  { id: 'CON-004', employeeName: 'Sofía Castro', employeeRut: '18.765.432-1', contractType: 'Borrador', startDate: '2024-09-01', status: 'Borrador' },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);

  return (
    <AppLayout pageTitle="Gestión de Contratos">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <CardTitle className="font-headline">Plantillas de Documentos</CardTitle>
                <CardDescription className="font-body">Gestiona las plantillas para contratos, anexos y otros documentos laborales.</CardDescription>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Plantilla
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg flex items-center gap-4 hover:bg-muted/50 cursor-pointer">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Contrato Indefinido</h3>
                  <p className="text-xs text-muted-foreground">Última actualización: 2024-01-10</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg flex items-center gap-4 hover:bg-muted/50 cursor-pointer">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Contrato Plazo Fijo</h3>
                  <p className="text-xs text-muted-foreground">Última actualización: 2024-01-10</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg flex items-center gap-4 hover:bg-muted/50 cursor-pointer">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Anexo de Contrato</h3>
                  <p className="text-xs text-muted-foreground">Última actualización: 2023-11-05</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <CardTitle className="font-headline">Contratos de Trabajadores</CardTitle>
                <CardDescription className="font-body">Administra los contratos laborales de todo el personal.</CardDescription>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Generar Nuevo Contrato
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trabajador</TableHead>
                  <TableHead>Tipo de Contrato</TableHead>
                  <TableHead>Fecha de Inicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div className="font-medium">{contract.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{contract.employeeRut}</div>
                    </TableCell>
                    <TableCell>{contract.contractType}</TableCell>
                    <TableCell>{new Date(contract.startDate).toLocaleDateString('es-CL')}</TableCell>
                    <TableCell>
                      <Badge variant={contract.status === 'Activo' ? 'default' : contract.status === 'Terminado' ? 'secondary' : 'outline'}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                          <DropdownMenuItem>Generar Anexo</DropdownMenuItem>
                          <DropdownMenuItem>Generar Finiquito</DropdownMenuItem>
                          <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Descargar PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
