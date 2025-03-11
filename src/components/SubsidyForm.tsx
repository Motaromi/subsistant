import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { 
  subsidyFormSchema, 
  SubsidyFormValues, 
  COMPANY_SIZES, 
  COMPANY_STAGES, 
  INDUSTRIES 
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Subsidy } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SubsidyFormProps {
  onResults: (result: { matches: Subsidy[], recommendation: string, matchCount: number }) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

export function SubsidyForm({ onResults, setLoading, isLoading }: SubsidyFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubsidyFormValues>({
    resolver: zodResolver(subsidyFormSchema),
    defaultValues: {
      industry: "",
      companySize: "",
      stage: "",
      needs: "",
    },
  });

  const onSubmit = async (data: SubsidyFormValues) => {
    setLoading(true);
    setServerError("");

    try {
      // Set up timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("/api/match-subsidy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      // Clear timeout since the request completed
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 504) {
          throw new Error("Request timed out. Please try again with different criteria.");
        }
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      onResults(result);
    } catch (error) {
      console.error("Error submitting form:", error);
      setServerError(
        error instanceof Error 
          ? error.message 
          : "Failed to match subsidies. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Industry
          </label>
          <Select
            id="industry"
            options={INDUSTRIES}
            placeholder="Select your industry"
            error={errors.industry?.message}
            {...register("industry")}
          />
        </div>

        <div>
          <label
            htmlFor="companySize"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Company Size
          </label>
          <Select
            id="companySize"
            options={COMPANY_SIZES}
            placeholder="Select your company size"
            error={errors.companySize?.message}
            {...register("companySize")}
          />
        </div>

        <div>
          <label
            htmlFor="stage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Development Stage
          </label>
          <Select
            id="stage"
            options={COMPANY_STAGES}
            placeholder="Select your development stage"
            error={errors.stage?.message}
            {...register("stage")}
          />
        </div>

        <div>
          <label
            htmlFor="needs"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Specific Needs (Optional)
          </label>
          <Select
            id="needs"
            options={needsOptions}
            placeholder="Select your specific needs"
            error={errors.needs?.message}
            {...register("needs")}
          />
        </div>
      </div>

      {serverError && (
        <div className="text-red-500 text-sm mt-2">{serverError}</div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Find Matching Subsidies
      </Button>
    </form>
  );
} 