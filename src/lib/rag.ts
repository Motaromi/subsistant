import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Subsidy } from "./utils";
import subsidyData from "../data/subsidies.json";

// Initialize OpenAI embeddings with the API key from environment variables
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

// Initialize the LLM for generating refined responses
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
  temperature: 0.2,
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
  console.log("Using direct filtering for subsidy matching");
  
  return (subsidyData as Subsidy[]).filter((subsidy) => {
    // Check if industry matches
    const industryMatches = 
      subsidy.industry === "all" || 
      (Array.isArray(subsidy.industry) && 
        (subsidy.industry.includes(companyDetails.industry) || subsidy.industry.includes("all")));

    // Check if company size matches
    const sizeMatches = 
      (Array.isArray(subsidy.companySize) && 
        subsidy.companySize.includes(companyDetails.companySize));

    // Check if stage matches
    const stageMatches = 
      (Array.isArray(subsidy.stage) && 
        subsidy.stage.includes(companyDetails.stage));

    return industryMatches && sizeMatches && stageMatches;
  });
};

/**
 * Generate a personalized subsidy recommendation with explanations
 */
export const generateRecommendation = async (
  companyDetails: CompanyDetails,
  matchedSubsidies: Subsidy[]
): Promise<string> => {
  try {
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

    // Generate the recommendation using the LLM
    const response = await llm.invoke(prompt);
    
    return response.content.toString();
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return "We encountered an issue generating your personalized recommendation. Please try again later.";
  }
}; 