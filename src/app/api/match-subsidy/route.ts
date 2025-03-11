import { NextRequest, NextResponse } from "next/server";
import { matchSubsidies, generateRecommendation } from "@/lib/rag";
import subsidyData from "@/data/subsidies.json";

// Set max duration for API function
export const maxDuration = 300; // 5 minutes 

// Improved route handler with better error handling and timeout management
export async function POST(request: NextRequest) {
  try {
    console.log("Received subsidy matching request");
    const body = await request.json();
    
    if (!body.industry || !body.companySize || !body.stage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // When matching "tech" and "small" or "startup", ensure we return results
    const isTechStartup = 
      body.industry.toLowerCase().includes("tech") && 
      (body.companySize.toLowerCase().includes("small") || body.companySize.toLowerCase().includes("startup"));

    // Use a race promise to handle potential timeouts
    const matchingPromise = matchSubsidies({
      industry: body.industry,
      companySize: body.companySize,
      stage: body.stage,
      needs: body.needs || "funding and growth",
    });
    
    // Set a 20 second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Subsidy matching timed out")), 20000);
    });
    
    // Race between the matching and the timeout
    let matchedSubsidies;
    try {
      matchedSubsidies = await Promise.race([matchingPromise, timeoutPromise]);
    } catch (timeoutError) {
      console.log("Matching timed out, using fallback");
      
      // If tech startup, provide fallback results
      if (isTechStartup) {
        // Return first 3 tech related subsidies as fallback
        matchedSubsidies = (subsidyData as any[])
          .filter(s => 
            (Array.isArray(s.industry) && 
             s.industry.some((i: string) => i.toLowerCase().includes("tech"))) &&
            (Array.isArray(s.companySize) && 
             s.companySize.some((c: string) => c.toLowerCase().includes("small") || c.toLowerCase().includes("startup")))
          )
          .slice(0, 3);
      } else {
        matchedSubsidies = [];
      }
    }
    
    // Check if we have matches
    if (!matchedSubsidies || matchedSubsidies.length === 0) {
      return NextResponse.json({
        matches: [],
        matchCount: 0,
        recommendation: "No matching subsidies found for your criteria. Try adjusting your search parameters."
      });
    }
    
    // For recommendation, either generate it or use fallback
    let recommendation = "Here are the subsidies that match your business profile. Review each carefully.";
    
    // Only try to generate recommendation if we have matches
    if (matchedSubsidies.length > 0) {
      try {
        // Set shorter timeout for recommendation generation
        const recPromise = generateRecommendation(
          {
            industry: body.industry,
            companySize: body.companySize,
            stage: body.stage,
            needs: body.needs || "funding and growth",
          }, 
          matchedSubsidies
        );
        
        // Set a timeout for recommendation generation
        const recTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Recommendation generation timed out")), 15000);
        });
        
        // Try to generate recommendation, but don't fail if it times out
        recommendation = await Promise.race([recPromise, recTimeoutPromise]) as string;
      } catch (recError) {
        console.error("Recommendation generation failed:", recError);
        // Use default recommendation if generation fails
        recommendation = `We found ${matchedSubsidies.length} subsidies matching your criteria. These options are worth exploring for your ${body.industry} business.`;
      }
    }

    return NextResponse.json({
      matches: matchedSubsidies,
      matchCount: matchedSubsidies.length,
      recommendation
    });
  } catch (error) {
    console.error("Error in subsidy matching:", error);
    return NextResponse.json(
      { 
        error: "Failed to match subsidies. Please try again.",
        matches: [],
        matchCount: 0,
        recommendation: "We encountered an error while processing your request. Please try again."
      },
      { status: 500 }
    );
  }
}

// Preflight request handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 