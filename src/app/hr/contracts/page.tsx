
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, FileText, Bell, ShieldAlert, FileWarning, ArrowLeft, Search, Wand2, Loader2, Clipboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useMemo, useRef } from 'react';
import { addDays, differenceInDays, parseISO, format } from 'date-fns';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import ContractForm, { ContractFormData } from '@/components/contract-form';
import { useToast } from '@/hooks/use-toast';
import { initialEmployees } from './data';
import { generateHrDocument, GenerateHrDocumentOutput } from '@/ai/flows/generate-hr-document';
import { Textarea } from '@/components/ui/textarea';

type ContractType = 'Indefinido' | 'Plazo Fijo' | 'Part-time' | 'Reemplazo' | 'Borrador';

type Contract = {
  id: string;
  employeeName: string;
  employeeRut: string;
  contractType: ContractType;
  startDate: string;
  endDate?: string;
  trialPeriodEndDate?: string;
  status: 'Activo' | 'Terminado' | 'Borrador';
};

const initialContracts: Contract[] = [
  { id: 'CON-001', employeeName: 'Juan Pérez', employeeRut: '12.345.678-9', contractType: 'Indefinido', startDate: '2022-01-15', status: 'Activo', trialPeriodEndDate: '2022-04-15' },
  { id: 'CON-002', employeeName: 'Ana Gómez', employeeRut: '23.456.789-0', contractType: 'Plazo Fijo', startDate: '2024-06-01', endDate: '2024-08-31', status: 'Activo' },
  { id: 'CON-003', employeeName: 'Luis Martínez', employeeRut: '11.222.333-4', contractType: 'Indefinido', startDate: '2021-08-20', status: 'Activo' },
  { id: 'CON-004', employeeName: 'Sofía Castro', employeeRut: '18.765.432-1', contractType: 'Borrador', startDate: '2024-09-01', status: 'Borrador' },
  { id: 'CON-005', employeeName: 'Carlos Diaz', employeeRut: '19.876.543-2', contractType: 'Reemplazo', startDate: '2024-07-01', endDate: '2024-09-30', status: 'Activo', trialPeriodEndDate: '2024-07-15' },
  { id: 'CON-006', employeeName: 'Laura Fernandez', employeeRut: '20.123.456-7', contractType: 'Part-time', startDate: '2023-02-01', status: 'Activo' },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<GenerateHrDocumentOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const filteredContracts = useMemo(() => {
    if (!searchQuery) {
        return contracts;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return contracts.filter(contract =>
        contract.employeeName.toLowerCase().includes(lowercasedQuery) ||
        contract.employeeRut.toLowerCase().includes(lowercasedQuery) ||
        contract.contractType.toLowerCase().includes(lowercasedQuery) ||
        contract.status.toLowerCase().includes(lowercasedQuery)
    );
  }, [contracts, searchQuery]);

  const today = new Date();
  const expiringContracts = contracts.filter(c => 
    c.endDate && c.status === 'Activo' && differenceInDays(parseISO(c.endDate), today) <= 30 && differenceInDays(parseISO(c.endDate), today) >= 0
  );
  
  const expiringTrials = contracts.filter(c => 
    c.trialPeriodEndDate && c.status === 'Activo' && differenceInDays(parseISO(c.trialPeriodEndDate), today) <= 15 && differenceInDays(parseISO(c.trialPeriodEndDate), today) >= 0
  );

  const handleOpenForm = () => {
    setGeneratedDoc(null);
    setIsGenerating(false);
    setIsFormModalOpen(true);
  }

  const handleGenerateContract = async (data: ContractFormData) => {
    setIsGenerating(true);
    setGeneratedDoc(null);
    try {
        const employee = initialEmployees.find(e => e.rut === data.employeeRut);
        if (!employee) {
            throw new Error("Empleado no encontrado.");
        }
        
        const result = await generateHrDocument({
            employeeName: employee.name,
            employeeRut: employee.rut,
            employeePosition: data.position,
            employeeStartDate: format(data.startDate, 'yyyy-MM-dd'),
            employeeSalary: data.salary,
            employeeContractType: data.contractType,
            documentType: 'Contrato de Trabajo',
        });

        const newContractRecord: Contract = {
            id: `CON-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            employeeName: employee.name,
            employeeRut: employee.rut,
            contractType: data.contractType as ContractType,
            startDate: format(data.startDate, 'yyyy-MM-dd'),
            endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : undefined,
            status: 'Borrador',
        };
        setContracts(prev => [newContractRecord, ...prev]);

        setGeneratedDoc(result);
        toast({
            title: 'Borrador de Contrato Generado',
            description: `Revisa el documento generado por la IA. Se ha añadido un registro de contrato en estado "Borrador".`,
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Ocurrió un error al generar el contrato.',
        });
    } finally {
        setIsGenerating(false);
    }
  };
  
    const handleCopyToClipboard = () => {
        if (!generatedDoc?.documentContent) return;
        navigator.clipboard.writeText(generatedDoc.documentContent);
        toast({
            title: "Copiado",
            description: "El contenido del contrato se ha copiado al portapapeles.",
        });
    };

  return (
    <AppLayout pageTitle="Gestión de Contratos">
      <div className="space-y-6">

        {(expiringContracts.length > 0 || expiringTrials.length > 0) && (
            <Card className="border-amber-400 bg-amber-50/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Bell className="h-6 w-6 text-amber-600"/>
                        <CardTitle className="font-headline text-amber-700">Alertas Importantes</CardTitle>
                    </div>
                    <CardDescription className="text-amber-600">Revisa los siguientes vencimientos y toma las acciones necesarias.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expiringContracts.map(c => (
                        <div key={c.id} className="p-3 border rounded-lg bg-background flex items-center gap-3">
                            <FileWarning className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-sm font-semibold">{c.employeeName}</p>
                                <p className="text-xs text-muted-foreground">
                                    Contrato vence en {differenceInDays(parseISO(c.endDate!), today)} días ({new Date(c.endDate!).toLocaleDateString('es-CL')})
                                </p>
                            </div>
                        </div>
                    ))}
                     {expiringTrials.map(c => (
                        <div key={c.id} className="p-3 border rounded-lg bg-background flex items-center gap-3">
                            <ShieldAlert className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-sm font-semibold">{c.employeeName}</p>
                                <p className="text-xs text-muted-foreground">
                                    Período de prueba vence en {differenceInDays(parseISO(c.trialPeriodEndDate!), today)} días ({new Date(c.trialPeriodEndDate!).toLocaleDateString('es-CL')})
                                </p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <CardTitle className="font-headline">Contratos de Trabajadores</CardTitle>
                <CardDescription className="font-body">Administra los contratos laborales de todo el personal.</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          type="search"
                          placeholder="Buscar contrato..."
                          className="pl-8 sm:w-[300px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                   <Button asChild variant="outline">
                      <Link href="/hr">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Volver
                      </Link>
                  </Button>
                  <Button onClick={handleOpenForm}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Generar Nuevo Contrato
                  </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trabajador</TableHead>
                  <TableHead>Tipo Contrato</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div className="font-medium">{contract.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{contract.employeeRut}</div>
                    </TableCell>
                    <TableCell>{contract.contractType}</TableCell>
                    <TableCell>{new Date(contract.startDate + 'T00:00:00').toLocaleDateString('es-CL')}</TableCell>
                     <TableCell>{contract.endDate ? new Date(contract.endDate + 'T00:00:00').toLocaleDateString('es-CL') : 'N/A'}</TableCell>
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

        <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
            <DialogContent className="sm:max-w-3xl">
                 <DialogHeader>
                    <DialogTitle className="font-headline">Generar Nuevo Contrato</DialogTitle>
                     <DialogDescription className="font-body">
                        Completa los datos para generar un borrador del contrato de trabajo usando IA.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <ContractForm 
                        employees={initialEmployees}
                        onSubmit={handleGenerateContract}
                        isGenerating={isGenerating}
                    />
                    <div className="space-y-4">
                         <h3 className="font-headline text-lg">Documento Generado</h3>
                         <div className="h-[450px] border rounded-md p-4 bg-secondary/50 overflow-y-auto">
                            {isGenerating ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : generatedDoc ? (
                                <Textarea readOnly value={generatedDoc.documentContent} className="min-h-full font-mono text-xs bg-white" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                                    <p>El borrador del contrato aparecerá aquí.</p>
                                </div>
                            )}
                         </div>
                         <Button variant="outline" onClick={handleCopyToClipboard} disabled={!generatedDoc || isGenerating}>
                            <Clipboard className="mr-2 h-4 w-4" />
                            Copiar al Portapapeles
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  );
}

    