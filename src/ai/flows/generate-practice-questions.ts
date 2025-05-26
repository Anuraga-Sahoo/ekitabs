// src/ai/flows/generate-practice-questions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating practice questions based on user-specified criteria.
 *
 * The flow takes subject, chapter, and number of questions as input and returns a list of questions.
 *
 * @interface GeneratePracticeQuestionsInput - The input type for the generatePracticeQuestions function.
 * @interface GeneratePracticeQuestionsOutput - The output type for the generatePracticeQuestions function.
 * @function generatePracticeQuestions - A function that generates practice questions based on the input.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePracticeQuestionsInputSchema = z.object({
  subject: z.string().describe('The subject of the practice questions (e.g., Physics, Chemistry, Biology).'),
  chapter: z.string().describe('The chapter for which to generate practice questions.'),
  numberOfQuestions: z.number().int().positive().describe('The number of practice questions to generate.'),
  complexityLevel: z.enum(['easy', 'medium', 'hard']).default('medium').describe('The complexity level of the questions.'),
});

export type GeneratePracticeQuestionsInput = z.infer<typeof GeneratePracticeQuestionsInputSchema>;

const GeneratePracticeQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of generated practice questions.'),
  answers: z.array(z.string()).describe('An array of answers to the generated practice questions.'),
});

export type GeneratePracticeQuestionsOutput = z.infer<typeof GeneratePracticeQuestionsOutputSchema>;

export async function generatePracticeQuestions(input: GeneratePracticeQuestionsInput): Promise<GeneratePracticeQuestionsOutput> {
  return generatePracticeQuestionsFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GeneratePracticeQuestionsInputSchema},
  output: {schema: GeneratePracticeQuestionsOutputSchema},
  prompt: `You are a helpful AI assistant that generates practice questions for students.

  Generate {{numberOfQuestions}} practice questions for the subject of {{subject}}, specifically for chapter {{chapter}}.
  The questions should be of {{complexityLevel}} difficulty.
  Also generate the answers to the questions. The answers should be in the same order as the questions.

  Subject: {{subject}}
  Chapter: {{chapter}}
  Number of Questions: {{numberOfQuestions}}
  Complexity Level: {{complexityLevel}}

  Questions:
  {{#each questions}}
    {{@index}}. {{this}}
  {{/each}}

  Answers:
  {{#each answers}}
    {{@index}}. {{this}}
  {{/each}}`,
});

const generatePracticeQuestionsFlow = ai.defineFlow(
  {
    name: 'generatePracticeQuestionsFlow',
    inputSchema: GeneratePracticeQuestionsInputSchema,
    outputSchema: GeneratePracticeQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuestionsPrompt(input);
    return output!;
  }
);
