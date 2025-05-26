
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
  prompt: `You are a test generator that creates realistic mock Multiple Choice Question (MCQ) tests for students preparing for exams based on class 11th and 12th syllabus.

  Create a mock test with a total of {{numberOfQuestions}} MCQs. The distribution should be:
  - Physics: 45 MCQs
  - Chemistry: 45 MCQs
  - Biology (covering Botany and Zoology): 90 MCQs

  Each MCQ must have:
  - "subject": Physics, Chemistry, or Biology.
  - "question": The question text.
  - "options": An array of exactly 4 string options.
  - "answer": The text of the correct option, which must be one of the 4 provided options.

  The test should cover a diverse range of topics from the class 11th and 12th syllabus for each subject.
  Ensure the questions are challenging and accurately reflect typical exam standards.
  Return the questions in JSON format, conforming to the provided output schema.
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
