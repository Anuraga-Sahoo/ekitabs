
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
  options: z.array(z.string()).length(4).describe('An array of 4 multiple choice options. This field is MANDATORY for every question.'),
  answer: z.string().describe('The correct answer to the question, which must be one of the options. This field is MANDATORY for every question.'),
});

const GenerateMockTestOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated mock test MCQ questions.'),
});
export type GenerateMockTestOutput = z.infer<typeof GenerateMockTestOutputSchema>;

export async function generateMockTest(input: GenerateMockTestInput): Promise<GenerateMockTestOutput> {
  // Ensure the input adheres to the 180 total questions, with specific subject counts.
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

The generation of questions MUST follow this specific subject distribution and structure:

1.  **Physics Questions (First 45 MCQs):**
    *   Generate EXACTLY 45 MCQs for Physics.
    *   For EACH of these 45 Physics questions, you ABSOLUTELY MUST provide the following four fields:
        *   \`"subject": "Physics"\` (This exact string value is mandatory for these 45 questions).
        *   \`"question"\`: A string containing the question text. (Mandatory)
        *   \`"options"\`: An array of EXACTLY 4 string options. (Mandatory, must be 4 options)
        *   \`"answer"\`: A string that is identical to one of the 4 provided options. (Mandatory)
    *   Do NOT omit any of these fields for any of the 45 Physics questions. Ensure each of these 45 questions has "subject": "Physics".

2.  **Chemistry Questions (Next 45 MCQs, from question 46 to 90):**
    *   Generate EXACTLY 45 MCQs for Chemistry.
    *   For EACH of these 45 Chemistry questions, you ABSOLUTELY MUST provide the following four fields:
        *   \`"subject": "Chemistry"\` (This exact string value is mandatory for these 45 questions).
        *   \`"question"\`: A string containing the question text. (Mandatory)
        *   \`"options"\`: An array of EXACTLY 4 string options. (Mandatory, must be 4 options)
        *   \`"answer"\`: A string that is identical to one of the 4 provided options. (Mandatory)
    *   Do NOT omit any of these fields for any of the 45 Chemistry questions. Ensure each of these 45 questions has "subject": "Chemistry".

3.  **Biology Questions (Final 90 MCQs, from question 91 to 180):**
    *   Generate EXACTLY 90 MCQs for Biology (covering both Botany and Zoology).
    *   For EACH of these 90 Biology questions, you ABSOLUTELY MUST provide the following four fields:
        *   \`"subject": "Biology"\` (This exact string value is mandatory for these 90 questions).
        *   \`"question"\`: A string containing the question text. (Mandatory)
        *   \`"options"\`: An array of EXACTLY 4 string options. (Mandatory, must be 4 options)
        *   \`"answer"\`: A string that is identical to one of the 4 provided options. (Mandatory)
    *   Do NOT omit any of these fields for any of the 90 Biology questions. Ensure each of these 90 questions has "subject": "Biology".

**Overall Requirements:**
*   The total number of questions in the "questions" array MUST be exactly {{numberOfQuestions}}. This means 45 Physics, then 45 Chemistry, then 90 Biology, in that order.
*   Every single question object in the array, from the first to the {{numberOfQuestions}}th, MUST strictly adhere to the four required fields: "subject" (which MUST be "Physics", "Chemistry", or "Biology" as specified for each block), "question", "options" (which MUST be an array of exactly 4 string items), and "answer".
*   The questions should cover a diverse range of topics from the specified syllabus for each subject and be of a standard reflecting typical exam difficulty.
*   The output MUST be a JSON object that strictly conforms to the provided output schema. Pay extremely close attention to the "required" fields (subject, question, options, answer) and array lengths (options must have 4 items) detailed above for EVERY question.
*   Do not, under ANY circumstances, omit any of the four mandatory fields for any of the {{numberOfQuestions}} questions. Ensure every question has a 'subject', 'question', 'options' (array of 4 strings), and 'answer'.
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

