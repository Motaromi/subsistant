import { matchSubsidies, generateRecommendation } from '@/lib/rag';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log("Received subsidy matching request");
    
    // Parse the request body
    const body = await request.json();
    const { industry, companySize, stage, needs } = body;
    
    console.log("Request data:", { industry, companySize, stage, needs });

    // Validate required fields
    if (!industry || !companySize || !stage) {
      console.warn("Missing required fields in request");
      return NextResponse.json(
        { error: 'Missing required fields: industry, companySize, and stage are required' },
        { status: 400 }
      );
    }

    // Normalize the input data
    const companyDetails = {
      industry: industry.toLowerCase(),
      companySize: companySize.toLowerCase(),
      stage: stage.toLowerCase(),
      needs: needs?.toLowerCase() || 'funding and support'
    };

    console.log("Processing with normalized data:", companyDetails);

    // Match subsidies based on company details
    console.log("Starting subsidy matching...");
    const matchedSubsidies = await matchSubsidies(companyDetails);
    console.log(`Found ${matchedSubsidies.length} matching subsidies`);

    // Generate personalized recommendations if there are matches
    let recommendation = '';
    if (matchedSubsidies.length > 0) {
      console.log("Generating personalized recommendation...");
      recommendation = await generateRecommendation(companyDetails, matchedSubsidies);
      console.log("Recommendation generated successfully");
    } else {
      console.log("No matches found, skipping recommendation generation");
    }

    // Return the matched subsidies and recommendation
    console.log("Returning results to client");
    return NextResponse.json({
      matches: matchedSubsidies,
      recommendation,
      matchCount: matchedSubsidies.length
    });
  } catch (error) {
    console.error('Error matching subsidies:', error);
    return NextResponse.json(
      { error: 'Failed to process subsidy matching request. Please try again later.' },
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