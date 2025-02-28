import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Subsidy, truncateText } from "@/lib/utils";

interface SubsidyResultsProps {
  matches: Subsidy[];
  recommendation: string;
  matchCount: number;
  onReset: () => void;
}

export function SubsidyResults({ 
  matches, 
  recommendation, 
  matchCount,
  onReset 
}: SubsidyResultsProps) {
  if (matchCount === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-yellow-800">No matches found</h3>
          <p className="text-yellow-700 mt-2">
            We couldn&apos;t find any subsidies matching your specific criteria. Try adjusting your 
            search parameters or contact a subsidy expert for personalized advice.
          </p>
        </div>
        <Button onClick={onReset} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Format the recommendation with line breaks
  const formattedRecommendation = recommendation.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
        <h3 className="text-xl font-medium text-blue-800 mb-4">
          Personalized Recommendation
        </h3>
        <div className="text-blue-700 whitespace-pre-line">
          {formattedRecommendation}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-medium mb-4">
          Matching Subsidies ({matchCount})
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          {matches.map((subsidy) => (
            <Card key={subsidy.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{subsidy.name}</CardTitle>
                <CardDescription>
                  {truncateText(subsidy.description, 120)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Eligibility</h4>
                    <p className="text-sm">{truncateText(subsidy.eligibility, 150)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Funding Amount</h4>
                    <p className="text-sm font-medium">{subsidy.fundingAmount}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Deadline</h4>
                    <p className="text-sm">{subsidy.deadline}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <a 
                  href={subsidy.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Visit Website →
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Button onClick={onReset} variant="outline" className="mt-4">
        Start New Search
      </Button>
    </div>
  );
} 