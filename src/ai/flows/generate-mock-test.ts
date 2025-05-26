// src/ai/flows/generate-mock-test.ts
'use server';

/**
 * @fileOverview Generates a mock test with questions covering Physics, Chemistry, and Biology.
 *
 * - generateMockTest - A function that generates a mock test.
 * - GenerateMockTestInput - The input type for the generateMockTest function.
 * - GenerateMockTestOutput - The return type for the generateMockTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMockTestInputSchema = z.object({
  numberOfQuestions: z
    .number()
    .default(360)
    .describe('The number of questions to generate for the mock test.'),
});
export type GenerateMockTestInput = z.infer<typeof GenerateMockTestInputSchema>;

const QuestionSchema = z.object({
  subject: z.enum(['Physics', 'Chemistry', 'Biology']).describe('The subject of the question.'),
  question: z.string().describe('The question text.'),
  answer: z.string().describe('The correct answer to the question.'),
});

const GenerateMockTestOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated mock test questions.'),
});
export type GenerateMockTestOutput = z.infer<typeof GenerateMockTestOutputSchema>;

export async function generateMockTest(input: GenerateMockTestInput): Promise<GenerateMockTestOutput> {
  return generateMockTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMockTestPrompt',
  input: {schema: GenerateMockTestInputSchema},
  output: {schema: GenerateMockTestOutputSchema},
  prompt: `You are a test generator that creates realistic mock tests for students.

  Create a mock test with a total of {{numberOfQuestions}} questions, covering Physics, Chemistry, and Biology.
  Return the questions in JSON format.

  The test should cover a range of topics within each subject.

  Each question should have a subject, question, and answer field.

  Ensure the questions are challenging and suitable for students preparing for exams.

  Here is the schema for the output:
  ${JSON.stringify(QuestionSchema)}
  `,
});

const generateMockTestFlow = ai.defineFlow(
  {
    name: 'generateMockTestFlow',
    inputSchema: GenerateMockTestInputSchema,
    outputSchema: GenerateMockTestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
