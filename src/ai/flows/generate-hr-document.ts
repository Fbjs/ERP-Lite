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
  prompt: `Eres un asistente experto en Recursos Humanos para una empresa chilena. Tu tarea es generar un documento laboral basado en la información proporcionada. El tono debe ser formal y el contenido debe ser preciso y cumplir con la estructura estándar para este tipo de documentos en Chile.

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

Por favor, genera el contenido del documento.
- Si es un 'Certificado de Antigüedad', debe certificar que el empleado trabaja en la empresa desde su fecha de inicio, su cargo y que se extiende para los fines que el interesado estime convenientes.
- Si es un 'Contrato de Trabajo', debe ser un borrador básico que incluya las cláusulas esenciales como identificación de las partes, descripción del cargo, jornada, remuneración y duración del contrato. Utiliza placeholders como "[Lugar de Trabajo]" o "[Descripción de Funciones Específicas]" donde sea necesario.
- No incluyas la fecha de generación dentro del contenido del documento, solo el cuerpo principal del mismo.
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
