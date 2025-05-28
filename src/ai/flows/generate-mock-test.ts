
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
    .describe('The total number of MCQ questions to generate for the mock test. This MUST be 180 for the current configuration.'),
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
  // Ensure the input adheres to the 180 total questions.
  if (input.numberOfQuestions !== 180) {
    throw new Error("Mock test generation is configured for exactly 180 questions (45 Physics, 45 Chemistry, 90 Biology).");
  }
  return generateMockTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMockTestPrompt',
  input: {schema: GenerateMockTestInputSchema},
  output: {schema: GenerateMockTestOutputSchema},
  prompt: `You are an expert test generator. Your task is to create a mock Multiple Choice Question (MCQ) test based on the class 11th and 12th syllabus.
You MUST generate a total of {{numberOfQuestions}} MCQs. The output MUST be a single JSON object containing a key "questions" which is an array of these {{numberOfQuestions}} question objects.

ABSOLUTE CRITICAL REQUIREMENT: For EVERY SINGLE ONE of the {{numberOfQuestions}} questions, you MUST provide all four (4) specified fields: 'subject', 'question', 'options', and 'answer'. The 'options' array for EVERY SINGLE question MUST contain EXACTLY four (4) string items. No exceptions.

The generation of questions MUST follow this specific subject distribution and structure:

1.  **Physics Questions (First 45 MCQs):**
    *   Generate EXACTLY 45 MCQs for Physics.
    *   For EACH of these 45 Physics questions, the following four fields are MANDATORY and MUST be provided:
        *   \`"subject": "Physics"\` (This exact string value is MANDATORY for these 45 questions).
        *   \`"question"\`: A string containing the question text. (MANDATORY).
        *   \`"options"\`: An array of EXACTLY four (4) string options. NO MORE, NO LESS. (MANDATORY, and the array length MUST be 4).
        *   \`"answer"\`: A string that is identical to one of the 4 provided options. (MANDATORY).
    *   Crucially, for EVERY one of these 45 Physics questions, all four fields ('subject' set to "Physics", 'question', 'options' with exactly 4 string items, 'answer') MUST be present. NO EXCEPTIONS. OMITTING ANY OF THESE FIELDS OR PROVIDING FEWER/MORE THAN 4 OPTIONS FOR ANY QUESTION IN THIS BLOCK WILL INVALIDATE THE ENTIRE TEST. Be meticulous.

2.  **Chemistry Questions (Next 45 MCQs, from question 46 to 90):**
    *   Generate EXACTLY 45 MCQs for Chemistry.
    *   For EACH of these 45 Chemistry questions, the following four fields are MANDATORY and MUST be provided:
        *   \`"subject": "Chemistry"\` (This exact string value is MANDATORY for these 45 questions).
        *   \`"question"\`: A string containing the question text. (MANDATORY).
        *   \`"options"\`: An array of EXACTLY four (4) string options. NO MORE, NO LESS. (MANDATORY, and the array length MUST be 4).
        *   \`"answer"\`: A string that is identical to one of the 4 provided options. (MANDATORY).
    *   Crucially, for EVERY one of these 45 Chemistry questions, all four fields ('subject' set to "Chemistry", 'question', 'options' with exactly 4 string items, 'answer') MUST be present. NO EXCEPTIONS. OMITTING ANY OF THESE FIELDS OR PROVIDING FEWER/MORE THAN 4 OPTIONS FOR ANY QUESTION IN THIS BLOCK WILL INVALIDATE THE ENTIRE TEST. Be meticulous.

3.  **Biology Questions (Final 90 MCQs, from question 91 to 180):**
    *   Generate EXACTLY 90 MCQs for Biology (covering both Botany and Zoology).
    *   For EACH of these 90 Biology questions, the following four fields are MANDATORY and MUST be provided:
        *   \`"subject": "Biology"\` (This exact string value is MANDATORY for these 90 questions).
        *   \`"question"\`: A string containing the question text. (MANDATORY).
        *   \`"options"\`: An array of EXACTLY four (4) string options. NO MORE, NO LESS. (MANDATORY, and the array length MUST be 4).
        *   \`"answer"\`: A string that is identical to one of the 4 provided options. (MANDATORY).
    *   Crucially, for EVERY one of these 90 Biology questions, all four fields ('subject' set to "Biology", 'question', 'options' with exactly 4 string items, 'answer') MUST be present. NO EXCEPTIONS. OMITTING ANY OF THESE FIELDS OR PROVIDING FEWER/MORE THAN 4 OPTIONS FOR ANY QUESTION IN THIS BLOCK WILL INVALIDATE THE ENTIRE TEST. Be meticulous. DOUBLE CHECK EACH QUESTION.

**Overall Requirements & Final Check:**
*   ULTRA-CRITICAL: Before outputting, please review your generated list of {{numberOfQuestions}} questions. Every single one of these question objects MUST contain all four fields: 'subject' (correctly set to "Physics", "Chemistry", or "Biology" as per its section), 'question', 'options' (an array of PRECISELY 4 strings), and 'answer'. There are no exceptions. Double-check each question for all four fields and the exact option count. Failure to meet these requirements for even a single question means the entire output is incorrect.
*   The total number of questions in the "questions" array MUST be exactly {{numberOfQuestions}}. This means 45 Physics, then 45 Chemistry, then 90 Biology, in that order.
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

