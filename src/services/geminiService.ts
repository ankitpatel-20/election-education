import { GoogleGenAI, Type } from "@google/genai";
import { CountryData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Sequential request queue to strictly prevent concurrent bursts causing 429s
let requestQueue: Promise<any> = Promise.resolve();
const REQUEST_COOLDOWN = 10000; // 10 seconds between ANY AI requests (max 6 RPM)
let circuitBreakerUntil = 0;

function getCacheKey(type: string, country: string): string {
  return `voting_cache_v7_${type}_${country.toLowerCase().replace(/\s+/g, '_')}`;
}

function getCachedData<T>(type: string, country: string): T | null {
  try {
    const cached = localStorage.getItem(getCacheKey(type, country));
    if (!cached) return null;
    
    // 7-day cache TTL for maximum stability during quota issues
    const item = JSON.parse(cached);
    if (Date.now() - item.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(getCacheKey(type, country));
      return null;
    }
    return item.data;
  } catch {
    return null;
  }
}

function setCachedData(type: string, country: string, data: any): void {
  try {
    const item = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(getCacheKey(type, country), JSON.stringify(item));
  } catch (e) {
    localStorage.clear(); // Clear all if full
  }
}

async function generateAiContent(prompt: string, schema: any, model = "gemini-1.5-flash"): Promise<any> {
  // Check circuit breaker
  if (Date.now() < circuitBreakerUntil) {
    const remaining = Math.ceil((circuitBreakerUntil - Date.now()) / 1000);
    throw new Error(`API Limit reached. Cooldown active (${remaining}s).`);
  }

  const execute = async () => {
    try {
      // Small randomized additional delay to avoid synchronized burst patterns
      const jitter = Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, REQUEST_COOLDOWN + jitter));

      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (error: any) {
      const errorString = JSON.stringify(error).toLowerCase();
      const isQuotaError = errorString.includes('429') || 
                           errorString.includes('quota') || 
                           errorString.includes('resource_exhausted') ||
                           error?.status === 'RESOURCE_EXHAUSTED';
      
      if (isQuotaError) {
        // Trip breaker for 180 seconds (3 mins) to allow quota window to reset
        circuitBreakerUntil = Date.now() + 180000;
        console.warn("CRITICAL: Quota Limit Hit. Circuit breaker active for 3 minutes.");
        throw new Error("API Daily Quota reached. Please try again in a few minutes.");
      }
      throw error;
    }
  };

  const result = requestQueue.then(execute);
  requestQueue = result.catch(() => {});
  return result;
}

export async function fetchCountryDetails(countryName: string): Promise<Partial<CountryData>> {
  const cached = getCachedData<Partial<CountryData>>('details', countryName);
  if (cached) return cached;

  const prompt = `Provide a FULL profile for ${countryName} as of ${new Date().toDateString()}.
  Requirements: 
  1. Eligibility (3-4 strings), 4-step Registration guide, Docs (ID list), Method (FPTP/Proportional).
  2. Ruling Party: Name, Founded, History, Origin Story.
  3. Leadership: Current head name, party, role, since (YYYY), vote share (%) and social/wikipedia links.
  4. History: List 4 key democratic milestones or leaders (year, event, leader, significance).
  5. Opposition: Main opposition party name and Wikipedia URL.
  6. Next Election: Specific month and year.
  7. Turnout: Last 4 election turnout percentages.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      eligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
      registration: {
        type: Type.OBJECT,
        properties: {
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          link: { type: Type.STRING }
        },
        required: ["steps", "link"]
      },
      documents: { type: Type.ARRAY, items: { type: Type.STRING } },
      method: { type: Type.STRING },
      timeline: { type: Type.STRING },
      partySystem: { type: Type.STRING },
      currentRulingParty: { type: Type.STRING },
      rulingPartyDetails: {
        type: Type.OBJECT,
        properties: {
          foundedYear: { type: Type.NUMBER },
          history: { type: Type.STRING },
          origin: { type: Type.STRING }
        },
        required: ["foundedYear", "history", "origin"]
      },
      topLeader: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          links: {
            type: Type.OBJECT,
            properties: { wikipedia: { type: Type.STRING }, twitter: { type: Type.STRING } },
            required: ["wikipedia"]
          }
        },
        required: ["name", "links"]
      },
      leadership: {
        type: Type.OBJECT,
        properties: {
          current: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              party: { type: Type.STRING },
              role: { type: Type.STRING },
              since: { type: Type.STRING },
              voteShare: { type: Type.STRING },
              links: {
                type: Type.OBJECT,
                properties: {
                  wikipedia: { type: Type.STRING },
                  official: { type: Type.STRING },
                  twitter: { type: Type.STRING }
                }
              }
            },
            required: ["name", "role"]
          }
        },
        required: ["current"]
      },
      history: {
        type: Type.OBJECT,
        properties: {
          origin: { type: Type.STRING },
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.STRING },
                event: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["year", "event"]
            }
          },
          turnout: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { year: { type: Type.STRING }, percentage: { type: Type.NUMBER } }
            }
          }
        },
        required: ["origin", "milestones"]
      },
      nextElectionDetails: {
        type: Type.OBJECT,
        properties: { month: { type: Type.STRING }, year: { type: Type.STRING } },
        required: ["month", "year"]
      },
      oppositionPartyDetails: {
        type: Type.OBJECT,
        properties: { name: { type: Type.STRING }, wikipedia: { type: Type.STRING } },
        required: ["name"]
      },
      votingMethodDetails: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          description: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["type", "description"]
      }
    },
    required: ["eligibility", "registration", "currentRulingParty", "rulingPartyDetails", "nextElectionDetails", "leadership", "history"]
  };

  try {
    const data = await generateAiContent(prompt, schema);
    if (data && data.currentRulingParty) {
      setCachedData('details', countryName, data);
      return data;
    }
    throw new Error("Received incomplete profile from AI.");
  } catch (error) {
    console.warn("API Error, falling back to static/simulated data:", error);
    
    // Fallback logic for common countries if API is down/quota limited
    const fallbacks: Record<string, any> = {
      "United States": {
        eligibility: ["Citizen at birth", "18+ years old", "30-day residency"],
        registration: { steps: ["Step 1: Check eligibility", "Step 2: Register online/mail", "Step 3: Receive voter card", "Step 4: Verify polling location"], link: "https://vote.gov" },
        currentRulingParty: "Republican Party",
        rulingPartyDetails: { foundedYear: "1854", history: "GOP, major US party.", origin: "Founded by anti-slavery activists." },
        leadership: { current: { name: "Donald J. Trump", role: "President", since: "2025" } },
        nextElectionDetails: { month: "November", year: "2028" },
        history: { origin: "Constitution 1787", milestones: [{ year: "1920", event: "19th Amendment" }] }
      },
      "United Kingdom": {
        eligibility: ["18+ years old", "British/Commonwealth citizen", "Registered address"],
        registration: { steps: ["Step 1: Check ID requirements", "Step 2: Apply for Voter ID", "Step 3: Register via GOV.UK", "Step 4: Receive poll card"], link: "https://gov.uk/register-to-vote" },
        currentRulingParty: "Labour Party",
        rulingPartyDetails: { foundedYear: "1900", history: "Center-left democratic socialist.", origin: "Born from trade union movement." },
        leadership: { current: { name: "Keir Starmer", role: "Prime Minister", since: "2024" } },
        nextElectionDetails: { month: "July", year: "2029" },
        history: { origin: "Magna Carta heritage", milestones: [{ year: "1928", event: "Equal Franchise" }] }
      }
    };

    if (fallbacks[countryName]) {
      return { ...fallbacks[countryName], isSimulated: true };
    }

    if (error instanceof Error && (error.message.includes('API Limit') || error.message.includes('Cooldown') || error.message.includes('Quota'))) {
       // Return a generic "Emergency Profile" if even no static fallback exists
       return {
         eligibility: ["Loading requirements..."],
         registration: { steps: ["API is currently busy.", "Please wait 60s.", "Refresh to retry.", "Data will sync soon."], link: "#" },
         currentRulingParty: "Syncing...",
         rulingPartyDetails: { foundedYear: 0, history: "Historical data is currently queued for sync.", origin: "-" },
         leadership: { current: { name: "Executive Leader", role: "Syncing Data", since: "2024" } },
         nextElectionDetails: { month: "Upcoming", year: "202x" },
         history: { origin: "Democracy in this region is well-established. Full archives will load once API quota resets.", milestones: [] },
         isSimulated: true,
         isErrorState: true
       };
    }
    throw error;
  }
}

export async function fetchCountryHistory(countryName: string): Promise<any> {
  const data = await fetchCountryDetails(countryName);
  return data.history || { origin: "Unavailable", milestones: [], turnout: [] };
}

export async function fetchLeadershipData(countryName: string): Promise<any> {
  const data = await fetchCountryDetails(countryName);
  return data.leadership || { current: { name: "N/A", party: "-", role: "-", since: "-", voteShare: "-" }, historical: [] };
}


export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function fetchQuizQuestions(countryName: string): Promise<QuizQuestion[]> {
  const cached = getCachedData<QuizQuestion[]>('quiz', countryName);
  if (cached && cached.length > 0) return cached;

  const seed = Math.random().toString(36).substring(7);
  const prompt = `Generate 5 unique, high-quality, and challenging situational quiz questions about the voting process and democratic rights in ${countryName}.
  
  CRITICAL: 
  - Do NOT ask simple facts (e.g., "What is the voting age?").
  - DO ask real-life situational questions (e.g., "If a voter has moved to a new district 10 days before an election, what is their legal requirement?", "If a voter loses their primary ID on election day, what secondary measures are available?").
  - Include scenarios about accessibility, registration disputes, and absentee voting.
  - Every question must have 4 options and a detailed 'explanation' field that explains the legal/procedural 'why' behind the correct answer.
  - VARIETY: Ensure these questions are DIFFERENT from previous ones by considering unique niche cases (Internal Reference: ${seed}).
  - The format must be a JSON array of objects.`;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswer: { type: Type.NUMBER, description: "Index of the correct option (0-3)" },
        explanation: { type: Type.STRING, description: "Detailed explanation of why this is correct based on real laws/situations." }
      },
      required: ["question", "options", "correctAnswer", "explanation"]
    }
  };

  try {
    const data = await generateAiContent(prompt, schema);
    if (data && data.length > 0) {
      setCachedData('quiz', countryName, data);
    }
    return data;
  } catch (error) {
    console.error("fetchQuizQuestions failed:", error);
    return [];
  }
}
