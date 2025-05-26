
// src/ai/flows/generate-mock-test.ts
'use server';

/**
 * @fileOverview Generates a mock test with MCQ questions covering Physics, Chemistry, and Biology from class 11th and 12th syllabus.
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
    .default(180) // Defaulting to 180 as per new requirement
    .describe('The total number of MCQ questions to generate for the mock test.'),
});
export type GenerateMockTestInput = z.infer<typeof GenerateMockTestInputSchema>;

const QuestionSchema = z.object({
  subject: z.enum(['Physics', 'Chemistry', 'Biology']).describe('The subject of the question.'),
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('An array of 4 multiple choice options.'),
  answer: z.string().describe('The correct answer to the question, which must be one of the options.'),
});

const GenerateMockTestOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated mock test MCQ questions.'),
});
export type GenerateMockTestOutput = z.infer<typeof GenerateMockTestOutputSchema>;

export async function generateMockTest(input: GenerateMockTestInput): Promise<GenerateMockTestOutput> {
  return generateMockTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMockTestPrompt',
  input: {schema: GenerateMockTestInputSchema},
  output: {schema: GenerateMockTestOutputSchema},
  prompt: `You are an expert test generator. Your task is to create a mock Multiple Choice Question (MCQ) test based on the class 11th and 12th syllabus.

  Generate exactly {{numberOfQuestions}} MCQs in total, with the following subject distribution:
  - Physics: 45 MCQs
  - Chemistry: 45 MCQs
  - Biology (covering both Botany and Zoology): 90 MCQs

  For EACH of the {{numberOfQuestions}} questions, you MUST provide the following fields:
  1. "subject": A string, which MUST be one of "Physics", "Chemistry", or "Biology".
  2. "question": A string containing the question text.
  3. "options": An array of exactly 4 strings, representing the multiple-choice options.
  4. "answer": A string, which MUST be identical to one of the 4 strings provided in the "options" array.

  It is crucial that every single question object in the output array is complete and adheres to this structure. Do not omit any fields for any question.
  The questions should cover a diverse range of topics from the specified syllabus for each subject and be of a standard reflecting typical exam difficulty.
  The output must be a JSON object that strictly conforms to the provided output schema.
  Pay close attention to the "required" fields in the schema for each question.
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

