
// src/ai/flows/generate-practice-questions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating practice Multiple Choice Questions (MCQs) based on user-specified criteria.
 *
 * The flow takes subject, chapter, and number of questions as input and returns a list of MCQs.
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
  numberOfQuestions: z.number().int().positive().describe('The number of practice MCQs to generate.'),
  complexityLevel: z.enum(['easy', 'medium', 'hard']).default('medium').describe('The complexity level of the MCQs.'),
});

export type GeneratePracticeQuestionsInput = z.infer<typeof GeneratePracticeQuestionsInputSchema>;

const PracticeMCQSchema = z.object({
  questionText: z.string().describe('The text of the MCQ.'),
  options: z.array(z.string()).length(4).describe('An array of 4 multiple choice options.'),
  correctAnswer: z.string().describe('The text of the correct option. This must be one of the strings in the options array.'),
});

const GeneratePracticeQuestionsOutputSchema = z.object({
  generatedMcqs: z.array(PracticeMCQSchema).describe('An array of generated MCQs, each with question text, options, and the correct answer.'),
});

export type GeneratePracticeQuestionsOutput = z.infer<typeof GeneratePracticeQuestionsOutputSchema>;

export async function generatePracticeQuestions(input: GeneratePracticeQuestionsInput): Promise<GeneratePracticeQuestionsOutput> {
  return generatePracticeQuestionsFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GeneratePracticeQuestionsInputSchema},
  output: {schema: GeneratePracticeQuestionsOutputSchema},
  prompt: `You are a helpful AI assistant that generates practice Multiple Choice Questions (MCQs) for students.

  Generate {{numberOfQuestions}} practice MCQs for the subject of {{subject}}, specifically for chapter {{chapter}}.
  The questions should be of {{complexityLevel}} difficulty.

  Each MCQ must include:
  1.  "questionText": The main question.
  2.  "options": An array of exactly 4 string options.
  3.  "correctAnswer": The text of the correct option, which must be one of the 4 provided options.

  Subject: {{subject}}
  Chapter: {{chapter}}
  Number of Questions: {{numberOfQuestions}}
  Complexity Level: {{complexityLevel}}

  Ensure the output is a JSON object conforming to the provided output schema.
  `,
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
