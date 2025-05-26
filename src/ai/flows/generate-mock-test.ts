
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
  subject: z.enum(['Physics', 'Chemistry', 'Biology']).describe('The subject of the question. This field is MANDATORY for every question.'),
  question: z.string().describe('The question text. This field is MANDATORY for every question.'),
  options: z.array(z.string()).length(4).describe('An array of 4 multiple choice options. This field is MANDATORY for every question.'),
  answer: z.string().describe('The correct answer to the question, which must be one of the options. This field is MANDATORY for every question.'),
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

  Generate exactly {{numberOfQuestions}} MCQs in total.
  The distribution MUST be as follows:
  - Physics: Exactly 45 MCQs. Each of these questions MUST have "subject": "Physics".
  - Chemistry: Exactly 45 MCQs. Each of these questions MUST have "subject": "Chemistry".
  - Biology (covering both Botany and Zoology): Exactly 90 MCQs. Each of these questions MUST have "subject": "Biology".

  It is CRITICAL that for EACH of the {{numberOfQuestions}} questions, you provide ALL of the following fields:
  1. "subject": A string, which MUST be one of "Physics", "Chemistry", or "Biology". THIS FIELD IS ABSOLUTELY MANDATORY FOR EVERY QUESTION.
  2. "question": A string containing the question text. THIS FIELD IS ABSOLUTELY MANDATORY FOR EVERY QUESTION.
  3. "options": An array of exactly 4 strings, representing the multiple-choice options. THIS FIELD IS ABSOLUTELY MANDATORY FOR EVERY QUESTION.
  4. "answer": A string, which MUST be identical to one of the 4 strings provided in the "options" array. THIS FIELD IS ABSOLUTELY MANDATORY FOR EVERY QUESTION.

  Do not, under any circumstances, omit any of these four fields for any question.
  The questions should cover a diverse range of topics from the specified syllabus for each subject and be of a standard reflecting typical exam difficulty.
  The output must be a JSON object that strictly conforms to the provided output schema.
  Pay extremely close attention to the "required" fields in the schema for each question. Ensure every question has a "subject", "question", "options", and "answer".
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

