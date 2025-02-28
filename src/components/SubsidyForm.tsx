import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { 
  subsidyFormSchema, 
  SubsidyFormValues,
  industryOptions,
  companySizeOptions,
  companyStageOptions,
  needsOptions
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Subsidy } from "@/lib/utils";

interface SubsidyFormProps {
  onResults: (data: {
    matches: Subsidy[];
    recommendation: string;
    matchCount: number;
  }) => void;
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
    setServerError(null);

    try {
      const response = await fetch("/api/match-subsidy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      onResults(result);
    } catch (error) {
      console.error("Error submitting form:", error);
      setServerError(
        "Failed to match subsidies. Please try again later."
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
            options={industryOptions}
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
            options={companySizeOptions}
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
            options={companyStageOptions}
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