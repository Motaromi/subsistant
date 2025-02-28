# Dutch Subsidy Matcher MVP

A RAG-powered application that helps Dutch startups find relevant subsidies and grants based on their company details. The system uses a retrieval-augmented generation (RAG) approach to match companies with the most appropriate subsidy opportunities.

## Features

- Clean, responsive user interface built with Next.js and Tailwind CSS
- Form-based input for company details (industry, size, stage, needs)
- RAG matching system using:
  - Vector embeddings for subsidy data
  - Semantic similarity search
  - LLM-generated personalized recommendations
- Detailed subsidy information including eligibility, deadlines, and funding amounts
- Mobile-friendly design

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **RAG Engine**: LangChain, OpenAI Embeddings, HNSWLib (vector store)
- **LLM Integration**: OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dutch-subsidy-matcher.git
   cd dutch-subsidy-matcher
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                # Next.js app directory
│   ├── api/            # API routes
│   │   └── match-subsidy/  # Subsidy matching endpoint
│   ├── page.tsx        # Main page
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── ui/             # UI components (button, card, etc.)
│   ├── SubsidyForm.tsx # Form for inputting company details
│   └── SubsidyResults.tsx # Display for subsidy matches
├── data/               # Static data
│   └── subsidies.json  # Subsidy database
├── lib/                # Utilities and library code
│   ├── utils.ts        # General utility functions
│   ├── rag.ts          # RAG implementation
│   └── schemas.ts      # Zod schemas for validation
```

## How It Works

1. Users input their company details (industry, size, development stage, and specific needs).
2. The application converts this input into a query vector using OpenAI embeddings.
3. The system performs a similarity search against pre-embedded subsidy records.
4. The top matching subsidies are sent to the LLM along with the company context.
5. The LLM generates a personalized recommendation explaining why each subsidy is relevant.
6. Results are displayed to the user in a clean, card-based interface.

## Future Improvements

- Integration with external subsidy databases
- Automated web crawling for up-to-date subsidy information
- User accounts for saving and tracking subsidy applications
- Intelligent document preparation assistance
- Premium features with Stripe payment integration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- Powered by [OpenAI](https://openai.com/) and [LangChain](https://js.langchain.com/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
