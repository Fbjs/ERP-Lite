
"use client";
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Download, FileText, Bell, ShieldAlert, FileWarning, ArrowLeft, Search, Wand2, Loader2, Clipboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useMemo, useRef } from 'react';
import { addDays, differenceInDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import ContractForm, { ContractFormData } from '@/components/contract-form';
import { useToast } from '@/hooks/use-toast';
import { initialEmployees } from '../data';
import { generateHrDocument, GenerateHrDocumentOutput } from '@/ai/flows/generate-hr-document';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';

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
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isGenerateDocModalOpen, setGenerateDocModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [docType, setDocType] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState<GenerateHrDocumentOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const pdfContentRef = useRef<HTMLDivElement>(null);


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
    c.trialPeriodEndDate && c.status === 'Activo' && differenceInDays(parseISO(c.trialPeriodEndDate!), today) <= 15 && differenceInDays(parseISO(c.trialPeriodEndDate!), today) >= 0
  );

  const handleOpenForm = () => {
    setGeneratedDoc(null);
    setIsGenerating(false);
    setIsFormModalOpen(true);
  }
  
  const handleOpenDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setDetailsModalOpen(true);
  }
  
  const handleOpenGenerateDoc = (contract: Contract) => {
    setSelectedContract(contract);
    setDocType('');
    setGeneratedDoc(null);
    setGenerateDocModalOpen(true);
  };
  
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
  
  const handleGenerateOtherDocument = async () => {
        if (!selectedContract || !docType) return;
        setIsGenerating(true);
        setGeneratedDoc(null);
        try {
            const employee = initialEmployees.find(e => e.rut === selectedContract.employeeRut);
            if (!employee) throw new Error("Empleado no encontrado.");

            const result = await generateHrDocument({
                employeeName: employee.name,
                employeeRut: employee.rut,
                employeePosition: employee.position,
                employeeStartDate: selectedContract.startDate,
                employeeSalary: employee.salary,
                employeeContractType: selectedContract.contractType,
                documentType: docType as any,
            });
            setGeneratedDoc(result);
            toast({
                title: 'Documento Generado',
                description: `El ${docType} para ${employee.name} ha sido generado.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Ocurrió un error al generar el documento.',
            });
        } finally {
            setIsGenerating(false);
        }
    };
  
    const handleCopyToClipboard = (content: string) => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        toast({
            title: "Copiado",
            description: "El contenido del documento se ha copiado al portapapeles.",
        });
    };

    const handleDownloadPdf = async () => {
        const input = pdfContentRef.current;
        if (input) {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            
            const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'px', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            
            pdf.addImage(imgData, 'PNG', 15, 15, pdfWidth - 30, 0);
            pdf.save(`contrato-${selectedContract?.id}.pdf`);
            
            toast({
                title: "PDF Descargado",
                description: `El contrato de ${selectedContract?.employeeName} ha sido descargado.`,
            });
        }
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
                          <DropdownMenuItem onClick={() => handleOpenDetails(contract)}>Ver Detalles</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPdf()}><Download className="mr-2 h-4 w-4" />Descargar PDF</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenGenerateDoc(contract)}>Generar Documento con IA</DropdownMenuItem>
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
                         <Button variant="outline" onClick={() => handleCopyToClipboard(generatedDoc?.documentContent || '')} disabled={!generatedDoc || isGenerating}>
                            <Clipboard className="mr-2 h-4 w-4" />
                            Copiar al Portapapeles
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

         <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Detalles del Contrato: {selectedContract?.id}</DialogTitle>
                </DialogHeader>
                {selectedContract && (
                     <div ref={pdfContentRef}>
                        <div className="space-y-4 p-4 rounded-lg border">
                             <div className="flex justify-between items-center">
                                <Logo className="w-24" />
                                <h3 className="text-xl font-bold font-headline text-primary">CONTRATO DE TRABAJO</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold">Trabajador:</span> {selectedContract.employeeName}</div>
                                <div><span className="font-semibold">RUT:</span> {selectedContract.employeeRut}</div>
                                <div><span className="font-semibold">Tipo:</span> <Badge>{selectedContract.contractType}</Badge></div>
                                <div><span className="font-semibold">Estado:</span> <Badge variant={selectedContract.status === 'Activo' ? 'default' : 'secondary'}>{selectedContract.status}</Badge></div>
                                <div><span className="font-semibold">Fecha de Inicio:</span> {format(parseISO(selectedContract.startDate), 'P', {locale: es})}</div>
                                <div><span className="font-semibold">Fecha de Término:</span> {selectedContract.endDate ? format(parseISO(selectedContract.endDate), 'P', {locale: es}) : 'Indefinido'}</div>
                                {selectedContract.trialPeriodEndDate && (
                                     <div className="col-span-2 text-amber-700"><span className="font-semibold">Fin Período Prueba:</span> {format(parseISO(selectedContract.trialPeriodEndDate), 'P', {locale: es})}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
        
        <Dialog open={isGenerateDocModalOpen} onOpenChange={setGenerateDocModalOpen}>
            <DialogContent className="sm:max-w-xl">
                 <DialogHeader>
                    <DialogTitle className="font-headline">Generar Documento con IA</DialogTitle>
                     <DialogDescription className="font-body">
                        Genera un anexo o finiquito para {selectedContract?.employeeName}.
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="doc-type" className="font-body">Tipo de Documento a Generar</Label>
                        <Select value={docType} onValueChange={setDocType}>
                            <SelectTrigger id="doc-type">
                                <SelectValue placeholder="Selecciona un tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Anexo de Contrato">Anexo de Contrato</SelectItem>
                                <SelectItem value="Finiquito">Finiquito</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleGenerateOtherDocument} disabled={isGenerating || !docType} className="w-full">
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generar Documento
                    </Button>
                </div>

                {isGenerating ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : generatedDoc && (
                     <div className="space-y-4">
                        <Label className="font-body">Contenido Generado</Label>
                        <Textarea readOnly value={generatedDoc.documentContent} className="min-h-[250px] font-mono text-xs bg-secondary"/>
                         <Button variant="outline" onClick={() => handleCopyToClipboard(generatedDoc.documentContent)}><Clipboard className="mr-2 h-4 w-4" />Copiar</Button>
                    </div>
                )}

            </DialogContent>
        </Dialog>


      </div>
    </AppLayout>
  );
}
