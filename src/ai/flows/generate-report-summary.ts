'use server';

/**
 * @fileOverview AI-powered report summarization flow.
 *
 * - generateReportSummary - A function that generates a summary of a report.
 * - GenerateReportSummaryInput - The input type for the generateReportSummary function.
 * - GenerateReportSummaryOutput - The return type for the generateReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportSummaryInputSchema = z.object({
  reportData: z.string().describe('The data of the report to summarize.'),
  reportType: z.string().describe('The type of the report (daily, weekly, termly).'),
  dateRange: z.string().describe('The date range for the report.'),
  userRole: z.string().describe('The role of the user requesting the summary.'),
  screenContext: z.string().describe('The context of the screen where the summary will be displayed.'),
});

export type GenerateReportSummaryInput = z.infer<typeof GenerateReportSummaryInputSchema>;

const GenerateReportSummaryOutputSchema = z.object({
  summary: z.string().describe('The summary of the report.'),
});

export type GenerateReportSummaryOutput = z.infer<typeof GenerateReportSummaryOutputSchema>;

export async function generateReportSummary(input: GenerateReportSummaryInput): Promise<GenerateReportSummaryOutput> {
  return generateReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportSummaryPrompt',
  input: {schema: GenerateReportSummaryInputSchema},
  output: {schema: GenerateReportSummaryOutputSchema},
  prompt: `You are an AI assistant that generates summaries of reports.

You will be provided with the following information:
- Report Data: {{{reportData}}}
- Report Type: {{{reportType}}}
- Date Range: {{{dateRange}}}
- User Role: {{{userRole}}}
- Screen Context: {{{screenContext}}}

Based on this information, generate a concise and informative summary of the report.
The summary should be tailored to the user's role and the screen context.
Consider whether to add or subtract details based on the user and screen context to keep the summary concise and relevant.
`, // Removed conditional logic from here
});

const generateReportSummaryFlow = ai.defineFlow(
  {
    name: 'generateReportSummaryFlow',
    inputSchema: GenerateReportSummaryInputSchema,
    outputSchema: GenerateReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
