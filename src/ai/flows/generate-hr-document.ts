'use server';

/**
 * @fileOverview Agente de IA para generar documentos de recursos humanos.
 *
 * - generateHrDocument - Una función que maneja la generación de documentos.
 */

import {ai} from '@/ai/genkit';
import {
    GenerateHrDocumentInput,
    GenerateHrDocumentInputSchema,
    GenerateHrDocumentOutput,
    GenerateHrDocumentOutputSchema
} from "@/ai/schemas/hr-document-schemas";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export async function generateHrDocument(input: GenerateHrDocumentInput): Promise<GenerateHrDocumentOutput> {
  return generateHrDocumentFlow(input);
}

const companyDetails = {
    name: "Panificadora Vollkorn SPA",
    rut: "76.123.456-7",
    address: "Avenida Principal 123, Santiago, Chile",
};

const prompt = ai.definePrompt({
  name: 'generateHrDocumentPrompt',
  input: {schema: GenerateHrDocumentInputSchema},
  output: {schema: GenerateHrDocumentOutputSchema},
  prompt: `Eres un asistente experto en Recursos Humanos para una empresa chilena. Tu tarea es generar un documento laboral en formato HTML bien estructurado y con estilos básicos.

Primero, crea un encabezado corporativo claro y profesional usando etiquetas HTML. Este encabezado debe incluir:
1. Un <h1> para el título del documento en mayúsculas (ej: "CONTRATO DE TRABAJO").
2. Un <div> con los datos completos de la empresa y la fecha de generación. Utiliza <p> y <strong> para dar formato.

Después del encabezado, genera el contenido del documento. El tono debe ser formal y el contenido preciso, cumpliendo con la estructura estándar para este tipo de documentos en Chile. No incluyas la fecha de nuevo en el cuerpo del documento. Usa párrafos <p>, listas <ul><li>, y placeholders como [Lugar de Trabajo] donde sea necesario.

Fecha de Generación: ${format(new Date(), 'PPP', { locale: es })}

Datos de la Empresa:
- Nombre: ${companyDetails.name}
- RUT: ${companyDetails.rut}
- Dirección: ${companyDetails.address}

Datos del Trabajador:
- Nombre: {{{employeeName}}}
- RUT: {{{employeeRut}}}
- Cargo: {{{employeePosition}}}
- Fecha de Ingreso: {{{employeeStartDate}}}
- Sueldo Bruto: {{{employeeSalary}}} CLP
- Tipo de Contrato: {{{employeeContractType}}}

Tipo de Documento a Generar: {{{documentType}}}

Contenido a generar:
- Si es un 'Certificado de Antigüedad', debe certificar en HTML que el empleado trabaja en la empresa desde su fecha de inicio, su cargo y que se extiende para los fines que el interesado estime convenientes.
- Si es un 'Contrato de Trabajo', debe ser un borrador HTML básico que incluya las cláusulas esenciales como identificación de las partes, descripción del cargo, jornada, remuneración y duración del contrato.
- Si es un 'Anexo de Contrato', debe ser un borrador HTML que modifique una cláusula específica del contrato original.
- Si es un 'Finiquito', debe ser un borrador HTML que detalle el término de la relación laboral, incluyendo causales y montos (usa placeholders como "[Causal de Término]", "[Monto Indemnización Años de Servicio]", "[Monto Vacaciones Proporcionales]").
`,
});

const generateHrDocumentFlow = ai.defineFlow(
  {
    name: 'generateHrDocumentFlow',
    inputSchema: GenerateHrDocumentInputSchema,
    outputSchema: GenerateHrDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
