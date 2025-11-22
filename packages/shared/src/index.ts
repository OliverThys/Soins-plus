import { z } from "zod";

export const trainingFiltersSchema = z.object({
  type: z.enum(["VIDEO", "PRESENTIEL", "DISTANCIEL"]).optional(),
  accreditation: z.boolean().optional(),
  theme: z.string().optional(),
  date: z.string().optional(),
});

export type TrainingFilters = z.infer<typeof trainingFiltersSchema>;

export const quizSubmissionSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answerIds: z.array(z.string()),
    })
  ),
});

export type QuizSubmission = z.infer<typeof quizSubmissionSchema>;

