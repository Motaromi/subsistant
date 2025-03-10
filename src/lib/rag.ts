import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { Subsidy } from "./utils";
import subsidyData from "../data/subsidies.json";

// Add safer initialization of API key
const getOpenAIApiKey = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY is not set in environment variables");
  }
  return apiKey;
};

// Initialize OpenAI embeddings with the API key from environment variables
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: getOpenAIApiKey(),
  modelName: "text-embedding-3-small",
});

// Initialize the LLM for generating refined responses
const llm = new ChatOpenAI({
  openAIApiKey: getOpenAIApiKey(),
  modelName: "gpt-4o",
  temperature: 0.2,
  maxRetries: 3, // Add retries to handle temporary errors
  timeout: 60000, // Set a longer timeout (60 seconds)
});

// Create document objects for each subsidy with appropriate metadata
const createSubsidyDocuments = () => {
  console.log("Creating subsidy documents...");
  
  if (!subsidyData || !Array.isArray(subsidyData) || subsidyData.length === 0) {
    console.error("Subsidy data is missing or invalid:", subsidyData);
    return [];
  }
  
  return (subsidyData as Subsidy[]).map((subsidy) => {
    // Create a comprehensive text representation of the subsidy for embedding
    const content = `
      Subsidy Name: ${subsidy.name}
      Description: ${subsidy.description}
      Eligibility: ${subsidy.eligibility}
      Industry: ${Array.isArray(subsidy.industry) ? subsidy.industry.join(", ") : subsidy.industry}
      Company Size: ${Array.isArray(subsidy.companySize) ? subsidy.companySize.join(", ") : subsidy.companySize}
      Company Stage: ${Array.isArray(subsidy.stage) ? subsidy.stage.join(", ") : subsidy.stage}
      Deadline: ${subsidy.deadline}
      Application Process: ${subsidy.applicationProcess}
      Funding Amount: ${subsidy.fundingAmount}
    `;

    return new Document({
      pageContent: content,
      metadata: { id: subsidy.id },
    });
  });
};

// Initialize the vector store with subsidy documents
let vectorStore: MemoryVectorStore | null = null;

export const initializeVectorStore = async () => {
  if (vectorStore) {
    return vectorStore;
  }
  
  try {
    console.log("Initializing vector store...");
    const documents = createSubsidyDocuments();
    
    if (documents.length === 0) {
      throw new Error("No subsidy documents to create embeddings from");
    }
    
    // Use in-memory vector store which is more reliable for demo purposes
    // instead of HNSWLib which requires file system access
    vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
    console.log("Vector store initialized with subsidy data");
    return vectorStore;
  } catch (error) {
    console.error("Error initializing vector store:", error);
    // Fallback to an empty memory vector store
    vectorStore = new MemoryVectorStore(embeddings);
    return vectorStore;
  }
};

interface CompanyDetails {
  industry: string;
  companySize: string;
  stage: string;
  needs: string;
}

/**
 * Match subsidies based on company details using RAG
 */
export const matchSubsidies = async (companyDetails: CompanyDetails): Promise<Subsidy[]> => {
  try {
    console.log("Matching subsidies for:", JSON.stringify(companyDetails));

    // Validate inputs to make sure they're not empty
    if (!companyDetails.industry || !companyDetails.companySize || !companyDetails.stage) {
      console.warn("Missing required company details, using fallback");
      return fallbackMatchSubsidies(companyDetails);
    }

    // Initialize vector store if not already done
    const store = await initializeVectorStore();

    // Create a detailed query based on company details
    const query = `
      Find subsidies for a ${companyDetails.companySize} company in the ${companyDetails.industry} industry, 
      at ${companyDetails.stage} stage, with specific needs for ${companyDetails.needs}.
    `;

    console.log("Search query:", query);

    // Perform similarity search to get relevant subsidy documents
    const results = await store.similaritySearch(query, 5);

    console.log("Search results:", results.length ? "Found matches" : "No matches from vector search");

    if (!results || results.length === 0) {
      // Fallback: If vector search fails, use direct filtering
      console.log("Using fallback direct filtering method");
      return fallbackMatchSubsidies(companyDetails);
    }

    // Extract subsidy IDs from the search results
    const relevantSubsidyIds = results.map((doc) => doc.metadata.id);
    console.log("Matched subsidy IDs:", relevantSubsidyIds);

    // Get the complete subsidy objects for the matched IDs
    const matchedSubsidies = (subsidyData as Subsidy[]).filter((subsidy) =>
      relevantSubsidyIds.includes(subsidy.id)
    );

    console.log(`Found ${matchedSubsidies.length} matched subsidies`);
    
    if (matchedSubsidies.length === 0) {
      // If vector search found documents but no subsidies matched, use fallback
      console.log("Vector search returned no matches, using fallback");
      return fallbackMatchSubsidies(companyDetails);
    }

    return matchedSubsidies;
  } catch (error) {
    console.error("Error during subsidy matching:", error);
    // Fallback to direct filtering if vector search fails
    return fallbackMatchSubsidies(companyDetails);
  }
};

/**
 * Fallback method that directly filters subsidies without using vector search
 */
const fallbackMatchSubsidies = (companyDetails: CompanyDetails): Subsidy[] => {
  console.log("Using direct filtering for subsidy matching with criteria:", companyDetails);
  
  // If subsidyData is not valid, return empty array
  if (!subsidyData || !Array.isArray(subsidyData) || subsidyData.length === 0) {
    console.error("Subsidy data is missing or invalid");
    return [];
  }

  console.log("Total subsidies to filter:", subsidyData.length);
  
  // Normalize inputs for more flexible matching
  const normalizedIndustry = companyDetails.industry.toLowerCase().trim();
  const normalizedSize = companyDetails.companySize.toLowerCase().trim();
  const normalizedStage = companyDetails.stage.toLowerCase().trim();
  
  // Make matching more flexible
  const industryMatchers = [normalizedIndustry, "all", "any"];
  // Add tech industry variations
  if (normalizedIndustry.includes("tech") || normalizedIndustry.includes("technology")) {
    industryMatchers.push("technology", "tech", "software", "it", "information technology");
  }
  
  // Add size variations
  const sizeMatchers = [normalizedSize, "all", "any"];
  if (normalizedSize.includes("small") || normalizedSize.includes("startup")) {
    sizeMatchers.push("small", "startup", "small business", "sme");
  }
  
  // Add stage variations
  const stageMatchers = [normalizedStage, "all", "any"];
  if (normalizedStage.includes("start") || normalizedStage.includes("early")) {
    stageMatchers.push("early stage", "startup", "beginning", "initial");
  }
  
  console.log("Matchers:", { industryMatchers, sizeMatchers, stageMatchers });
  
  const result = (subsidyData as Subsidy[]).filter((subsidy) => {
    // Helper function to check if any element in array matches any of our matchers
    const hasMatch = (field: string | string[], matchers: string[]) => {
      if (!field) return false;
      
      if (typeof field === "string") {
        const normalizedField = field.toLowerCase().trim();
        return matchers.some(matcher => normalizedField.includes(matcher));
      }
      
      if (Array.isArray(field)) {
        return field.some(item => {
          const normalizedItem = item.toLowerCase().trim();
          return matchers.some(matcher => normalizedItem.includes(matcher));
        });
      }
      
      return false;
    };
    
    // Check if industry matches
    const industryMatches = hasMatch(subsidy.industry, industryMatchers);
    
    // Check if company size matches
    const sizeMatches = hasMatch(subsidy.companySize, sizeMatchers);
    
    // Check if stage matches
    const stageMatches = hasMatch(subsidy.stage, stageMatchers);
    
    const isMatch = industryMatches && (sizeMatches || stageMatches);
    
    if (isMatch) {
      console.log(`Matched subsidy: ${subsidy.name}, industry: ${subsidy.industry}, size: ${subsidy.companySize}, stage: ${subsidy.stage}`);
    }
    
    return isMatch;
  });
  
  console.log(`Fallback matching found ${result.length} subsidies`);
  
  // If no results, return at least a few subsidies that might be relevant
  if (result.length === 0) {
    console.log("No exact matches, returning general subsidies");
    return (subsidyData as Subsidy[]).slice(0, 3); // Return first 3 subsidies as a fallback
  }
  
  return result;
};

/**
 * Generate a personalized subsidy recommendation with explanations
 */
export const generateRecommendation = async (
  companyDetails: CompanyDetails,
  matchedSubsidies: Subsidy[]
): Promise<string> => {
  try {
    console.log("Generating recommendation for matched subsidies:", matchedSubsidies.length);
    
    // Check if we have subsidies to work with
    if (!matchedSubsidies || matchedSubsidies.length === 0) {
      return "No matching subsidies were found for your criteria. Try adjusting your search parameters.";
    }

    // Verify API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OpenAI API key");
      return generateFallbackRecommendation(matchedSubsidies);
    }

    // Create a detailed prompt for the LLM
    const prompt = `
      I'm helping a ${companyDetails.companySize} company in the ${companyDetails.industry} industry, 
      currently at ${companyDetails.stage} stage of development. They need assistance with ${companyDetails.needs}.
      
      Based on their profile, I found these potential subsidies:
      ${matchedSubsidies
        .map(
          (subsidy) => `
        - ${subsidy.name}: ${subsidy.description}
          Eligibility: ${subsidy.eligibility}
          Funding: ${subsidy.fundingAmount}
          Deadline: ${subsidy.deadline}
      `
        )
        .join("\n")}
      
      Please provide a concise but comprehensive recommendation for this company. For each subsidy:
      1. Explain why it's relevant to their specific situation
      2. Highlight key eligibility factors they should be aware of
      3. Provide a priority order (most promising first)
      4. Add brief next steps they should take to apply
      
      Keep the tone professional and practical, focusing on actionable information.
    `;

    console.log("Calling OpenAI with prompt length:", prompt.length);
    
    // Generate the recommendation using the LLM
    try {
      const response = await llm.invoke(prompt);
      console.log("Successfully received response from OpenAI");
      return response.content.toString();
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      // If OpenAI fails, use our fallback recommendation generator
      return generateFallbackRecommendation(matchedSubsidies);
    }
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return generateFallbackRecommendation(matchedSubsidies);
  }
};

/**
 * Generate a fallback recommendation without using the OpenAI API
 */
const generateFallbackRecommendation = (matchedSubsidies: Subsidy[]): string => {
  try {
    if (!matchedSubsidies || matchedSubsidies.length === 0) {
      return "No subsidies matched your criteria. Try adjusting your search parameters.";
    }

    // Create a simple templated recommendation
    const recommendation = `
# Subsidy Recommendations

We've found ${matchedSubsidies.length} subsidies that match your criteria:

${matchedSubsidies.map((subsidy, index) => `
## ${index + 1}. ${subsidy.name}

**Description:** ${subsidy.description}

**Why it's relevant:** This subsidy is available for ${Array.isArray(subsidy.companySize) ? subsidy.companySize.join(', ') : subsidy.companySize} companies in the ${Array.isArray(subsidy.industry) ? subsidy.industry.join(', ') : subsidy.industry} industry.

**Eligibility:** ${subsidy.eligibility}

**Funding amount:** ${subsidy.fundingAmount || 'Not specified'}

**Deadline:** ${subsidy.deadline || 'Not specified'}

**Next steps:** ${subsidy.applicationProcess || 'Contact the subsidy provider for more details.'}
`).join('\n')}

We recommend reviewing each subsidy's details carefully and preparing your application materials well in advance of deadlines.
`;

    return recommendation;
  } catch (error) {
    console.error("Error generating fallback recommendation:", error);
    return "We encountered an issue generating your personalized recommendation. Please try again later.";
  }
}; 