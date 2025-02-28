"use client";

import { useState } from "react";
import { SubsidyForm } from "@/components/SubsidyForm";
import { SubsidyResults } from "@/components/SubsidyResults";
import { Subsidy } from "@/lib/utils";

interface Results {
  matches: Subsidy[];
  recommendation: string;
  matchCount: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  const handleFormResults = (data: Results) => {
    setResults(data);
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dutch Subsidy Matcher
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect subsidies for your startup by entering your company details below.
            Our AI-powered system will match you with the most relevant opportunities.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {!results ? (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Enter Your Company Details
              </h2>
              <SubsidyForm
                onResults={handleFormResults}
                setLoading={setIsLoading}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <SubsidyResults
              matches={results.matches}
              recommendation={results.recommendation}
              matchCount={results.matchCount}
              onReset={handleReset}
            />
          )}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Dutch Subsidy Matcher - 
            An AI-powered subsidy matching service for Dutch startups
          </p>
        </div>
      </div>
    </main>
  );
}
