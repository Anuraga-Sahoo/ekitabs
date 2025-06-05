
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
    .default(360) // Defaulting to 360 as per PRD
    .describe('The total number of MCQ questions to generate for the mock test. For a full 360-question test, the distribution is typically 86 Physics, 94 Chemistry, and 180 Biology.'),
});
export type GenerateMockTestInput = z.infer<typeof GenerateMockTestInputSchema>;

const QuestionSchema = z.object({
  subject: z.enum(['Physics', 'Chemistry', 'Biology']).describe('The subject of the question. This field is MANDATORY for every question.'),
  question: z.string().describe('The question text. This field is MANDATORY for every question.'),
  options: z.array(z.string()).length(4).describe('An array of 4 multiple choice options. This field is MANDATORY for every question, and MUST contain exactly 4 string items.'),
  answer: z.string().describe('The correct answer to the question, which must be one of the options. This field is MANDATORY for every question.'),
});

const GenerateMockTestOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated mock test MCQ questions.'),
});
export type GenerateMockTestOutput = z.infer<typeof GenerateMockTestOutputSchema>;

export async function generateMockTest(input: GenerateMockTestInput): Promise<GenerateMockTestOutput> {
  // The check for exactly 50 questions has been removed to support 360 questions.
  // The prompt has been updated to reflect the new distribution for 360 questions.
  // If a number other than 360 is passed, the prompt's specific counts will be static (86, 94, 180)
  // but {{numberOfQuestions}} will reflect the input. For best results, send 360.
  return generateMockTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMockTestPrompt',
  input: {schema: GenerateMockTestInputSchema},
  output: {schema: GenerateMockTestOutputSchema},
  prompt: `You are an expert test generator. Your task is to create a mock Multiple Choice Question (MCQ) test based on the class 11th and 12th syllabus.
You MUST generate a total of {{numberOfQuestions}} MCQs. The output MUST be a single JSON object containing a key "questions" which is an array of these {{numberOfQuestions}} question objects.

ABSOLUTE CRITICAL REQUIREMENT: For EVERY SINGLE ONE of the {{numberOfQuestions}} questions, you MUST provide all four (4) specified fields: 'subject', 'question', 'options', and 'answer'. The 'options' array for EVERY SINGLE question MUST contain EXACTLY four (4) string items. No exceptions.

The generation of questions MUST follow this specific subject distribution and structure for a {{numberOfQuestions}}-question test:

1.  **Physics Questions (First 86 MCQs):**
    *   Generate EXACTLY 86 MCQs for Physics.
    *   For EACH of these 86 Physics questions, the following four fields are MANDATORY and MUST be provided:
        *   \`"subject": "Physics"\` (This exact string value is MANDATORY for these 86 questions).
        *   \`"question"\`: A string containing the question text. (MANDATORY).
        *   \`"options"\`: An array of EXACTLY four (4) string options. NO MORE, NO LESS. (MANDATORY, and the array length MUST be 4).
        *   \`"answer"\`: A string that is identical to one of the 4 provided options. (MANDATORY).
    *   Crucially, for EVERY one of these 86 Physics questions, all four fields ('subject' set to "Physics", 'question', 'options' with exactly 4 string items, 'answer') MUST be present. NO EXCEPTIONS. OMITTING ANY OF THESE FIELDS OR PROVIDING FEWER/MORE THAN 4 OPTIONS FOR ANY QUESTION IN THIS BLOCK WILL INVALIDATE THE ENTIRE TEST. Be meticulous.

2.  **Chemistry Questions (Next 94 MCQs, from question 87 to 180):**
    *   Generate EXACTLY 94 MCQs for Chemistry.
    *   For EACH of these 94 Chemistry questions, the following four fields are MANDATORY and MUST be provided:
        *   \`"subject": "Chemistry"\` (This exact string value is MANDATORY for these 94 questions).
        *   \`"question"\`: A string containing the question text. (MANDATORY).
        *   \`"options"\`: An array of EXACTLY four (4) string options. NO MORE, NO LESS. (MANDATORY, and the array length MUST be 4).
        *   \`"answer"\`: A string that is identical to one of the 4 provided options. (MANDATORY).
    *   Crucially, for EVERY one of these 94 Chemistry questions, all four fields ('subject' set to "Chemistry", 'question', 'options' with exactly 4 string items, 'answer') MUST be present. NO EXCEPTIONS. OMITTING ANY OF THESE FIELDS OR PROVIDING FEWER/MORE THAN 4 OPTIONS FOR ANY QUESTION IN THIS BLOCK WILL INVALIDATE THE ENTIRE TEST. Be meticulous.

3.  **Biology Questions (Final 180 MCQs, from question 181 to 360):**
    *   Generate EXACTLY 180 MCQs for Biology (covering both Botany and Zoology).
    *   For EACH of these 180 Biology questions, the following four fields are MANDATORY and MUST be provided:
        *   \`"subject": "Biology"\` (This exact string value is MANDATORY for these 180 questions).
        *   \`"question"\`: A string containing the question text. (MANDATORY).
        *   \`"options"\`: An array of EXACTLY four (4) string options. NO MORE, NO LESS. (MANDATORY, and the array length MUST be 4).
        *   \`"answer"\`: A string that is identical to one of the 4 provided options. (MANDATORY).
    *   Crucially, for EVERY one of these 180 Biology questions, all four fields ('subject' set to "Biology", 'question', 'options' with exactly 4 string items, 'answer') MUST be present. NO EXCEPTIONS. OMITTING ANY OF THESE FIELDS OR PROVIDING FEWER/MORE THAN 4 OPTIONS FOR ANY QUESTION IN THIS BLOCK WILL INVALIDATE THE ENTIRE TEST. Be meticulous. DOUBLE CHECK EACH QUESTION.

**Overall Requirements & Final Check:**
*   ULTRA-CRITICAL: Before outputting, please review your generated list of {{numberOfQuestions}} questions. Every single one of these question objects MUST contain all four fields: 'subject' (correctly set to "Physics", "Chemistry", or "Biology" as per its section), 'question', 'options' (an array of PRECISELY 4 strings), and 'answer'. There are no exceptions. Double-check each question for all four fields and the exact option count. Failure to meet these requirements for even a single question means the entire output is incorrect.
*   The total number of questions in the "questions" array MUST be exactly {{numberOfQuestions}}. This means 86 Physics, then 94 Chemistry, then 180 Biology, in that order.
*   The questions should cover a diverse range of topics from the specified syllabus for each subject and be of a standard reflecting typical exam difficulty.
*   The output MUST be a JSON object that strictly conforms to the provided output schema. Pay extremely close attention to the "required" fields (subject, question, options, answer) and array lengths (options must have 4 items) detailed above for EVERY question.
*   Do not, under ANY circumstances, omit any of the four mandatory fields for any of the {{numberOfQuestions}} questions. Ensure every question has a 'subject', 'question', 'options' (an array of exactly 4 strings), and 'answer'.
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
    // Basic validation to ensure the model tried to follow the count. More complex validation is handled by Zod.
    if (output?.questions?.length !== input.numberOfQuestions) {
        console.warn(`AI returned ${output?.questions?.length} questions, expected ${input.numberOfQuestions}. Zod validation will handle schema errors.`);
    }
    return output!;
  }
);

