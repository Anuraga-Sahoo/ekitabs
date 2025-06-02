
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PracticeTestConfig } from "@/types";
import { Atom, BookCopy, FlaskConical, Brain, Loader2 } from "lucide-react";
import { chapterData } from "@/lib/chapters";
import React, { useEffect, useState } from "react";

const subjects = [
  { value: "Physics", label: "Physics", icon: Atom },
  { value: "Chemistry", label: "Chemistry", icon: FlaskConical },
  { value: "Biology", label: "Biology", icon: Brain },
];

const complexityLevels: PracticeTestConfig['complexityLevel'][] = ["easy", "medium", "hard"];

const formSchema = z.object({
  subject: z.string().min(1, "Please select a subject."),
  chapter: z.string().min(1, "Please select a chapter."),
  numberOfQuestions: z.coerce.number().int().min(1, "Minimum 1 question.").max(50, "Maximum 50 questions."),
  complexityLevel: z.enum(complexityLevels, { required_error: "Please select a complexity level." }),
});

type PracticeTestSetupFormValues = z.infer<typeof formSchema>;

interface PracticeTestSetupFormProps {
  onSubmit: (data: PracticeTestConfig) => void;
  isLoading: boolean;
}

export default function PracticeTestSetupForm({ onSubmit, isLoading }: PracticeTestSetupFormProps) {
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);

  const form = useForm<PracticeTestSetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      chapter: "",
      numberOfQuestions: 10,
      complexityLevel: "medium",
    },
  });

  const selectedSubject = form.watch("subject");

  useEffect(() => {
    if (selectedSubject) {
      setAvailableChapters(chapterData[selectedSubject] || []);
      form.setValue("chapter", ""); 
    } else {
      setAvailableChapters([]);
      form.setValue("chapter", ""); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]); 

  function handleSubmit(values: PracticeTestSetupFormValues) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 p-6 border rounded-lg shadow-lg bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        <div className="flex items-center">
                          <subject.icon className="mr-2 h-4 w-4" />
                          {subject.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chapter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chapter</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value} 
                  disabled={!selectedSubject || availableChapters.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a chapter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-72">
                    {availableChapters.map((chapterName) => (
                      <SelectItem key={chapterName} value={chapterName}>
                        {chapterName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the chapter you want to practice.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numberOfQuestions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Questions</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field} />
                </FormControl>
                 <FormDescription>
                  Min 1, Max 50 questions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complexityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complexity Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {complexityLevels.map((level) => (
                      <SelectItem key={level} value={level} className="capitalize">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Test...
            </>
          ) : (
            "Start Practice Test"
          )}
        </Button>
      </form>
    </Form>
  );
}
