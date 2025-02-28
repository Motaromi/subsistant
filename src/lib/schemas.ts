import { z } from 'zod';

// Industry options
export const industryOptions = [
  { value: 'technology', label: 'Technology & Software' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'healthcare', label: 'Healthcare & Life Sciences' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'agri-food', label: 'Agriculture & Food' },
  { value: 'creative industry', label: 'Creative Industries' },
  { value: 'logistics', label: 'Logistics & Transport' },
  { value: 'construction', label: 'Construction & Real Estate' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'financial services', label: 'Financial Services' },
  { value: 'circular economy', label: 'Circular Economy' },
  { value: 'water', label: 'Water Technology' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'high tech', label: 'High Tech Systems' },
  { value: 'horticulture', label: 'Horticulture' },
  { value: 'life sciences', label: 'Life Sciences & Health' },
];

// Company size options
export const companySizeOptions = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small Business (11-50 employees)' },
  { value: 'medium', label: 'Medium Enterprise (51-250 employees)' },
  { value: 'large', label: 'Large Enterprise (250+ employees)' },
];

// Company stage options
export const companyStageOptions = [
  { value: 'early', label: 'Early Stage (Idea, MVP, Pre-revenue)' },
  { value: 'growth', label: 'Growth Stage (Revenue generating, Scaling)' },
  { value: 'established', label: 'Established (Stable revenue, Market presence)' },
];

// Needs options
export const needsOptions = [
  { value: 'research and development', label: 'Research & Development' },
  { value: 'capital expenditure', label: 'Capital Expenditure & Equipment' },
  { value: 'international expansion', label: 'International Expansion' },
  { value: 'hiring and workforce', label: 'Hiring & Workforce Development' },
  { value: 'innovation projects', label: 'Innovation Projects' },
  { value: 'sustainability initiatives', label: 'Sustainability Initiatives' },
  { value: 'digital transformation', label: 'Digital Transformation' },
  { value: 'product development', label: 'Product Development' },
  { value: 'market entry', label: 'Market Entry & Validation' },
  { value: 'covid recovery', label: 'COVID-19 Recovery' },
];

// Schema for the subsidy matching form
export const subsidyFormSchema = z.object({
  industry: z.string({
    required_error: 'Please select your company industry',
  }),
  companySize: z.string({
    required_error: 'Please select your company size',
  }),
  stage: z.string({
    required_error: 'Please select your company stage',
  }),
  needs: z.string().optional(),
});

// Type inference for the form schema
export type SubsidyFormValues = z.infer<typeof subsidyFormSchema>; 