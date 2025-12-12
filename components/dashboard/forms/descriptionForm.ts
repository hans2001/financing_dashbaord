import { z } from "zod";

export const DESCRIPTION_MAX_LENGTH = 500;

const descriptionValueSchema = z
  .string()
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, {
    message: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer`,
  });

export const descriptionSchema = z.object({
  description: descriptionValueSchema,
});

export type DescriptionFormValues = z.infer<typeof descriptionSchema>;

export { descriptionValueSchema };
