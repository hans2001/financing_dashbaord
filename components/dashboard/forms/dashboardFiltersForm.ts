import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const isIsoDateString = (value: string) => ISO_DATE_REGEX.test(value);

// Keep these tuples aligned with the exported filter options in dashboard-utils.ts.
const FLOW_FILTER_VALUES = ["all", "spending", "inflow"] as const;
const SORT_OPTION_VALUES = [
  "date_desc",
  "date_asc",
  "amount_desc",
  "amount_asc",
  "merchant_asc",
  "merchant_desc",
] as const;
const PAGE_SIZE_STRING_VALUES = [
  "25",
  "50",
  "100",
  "250",
  "500",
  "1000",
  "all",
] as const;

const dashboardFiltersSchema = z
  .object({
    accountId: z.string().min(1, { message: "Account is required" }),
    start: z
      .string()
      .regex(ISO_DATE_REGEX, { message: "Start date must be YYYY-MM-DD" }),
    end: z
      .string()
      .regex(ISO_DATE_REGEX, { message: "End date must be YYYY-MM-DD" }),
    pageSize: z.enum(PAGE_SIZE_STRING_VALUES),
    flowFilter: z.enum(FLOW_FILTER_VALUES),
    categoryFilter: z.string(),
    sortOption: z.enum(SORT_OPTION_VALUES),
  })
  .superRefine((values, ctx) => {
    if (values.start > values.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be before or equal to end date",
        path: ["end"],
      });
    }
  });

export type DashboardFiltersFormValues = z.infer<typeof dashboardFiltersSchema>;
export const dashboardFiltersResolver = zodResolver(dashboardFiltersSchema);
