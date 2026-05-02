export interface CountryData {
  id: string;
  name: string;
  flag: string;
  region: 'Europe' | 'Asia' | 'Africa' | 'Americas' | 'Oceania';
  eligibility?: string[];
  registration?: {
    steps: string[];
    link: string;
  };
  documents?: string[];
  method?: string;
  timeline?: string;
  isDetailed?: boolean;
  votingMethodDetails?: {
    type: string;
    description: string;
    pros: string[];
    cons: string[];
  };
  partySystem?: string;
  currentRulingParty?: string;
  rulingPartyDetails?: {
    foundedYear: number;
    history: string;
    origin: string;
  };
  topLeader?: {
    name: string;
    links: {
      wikipedia: string;
      twitter?: string;
    };
  };
  nextElectionDetails?: {
    month: string;
    year: string;
  };
  oppositionPartyDetails?: {
    name: string;
    wikipedia: string;
  };
  history?: {
    origin: string;
    milestones: { year: string; event: string; description: string }[];
    turnout?: { year: string; percentage: number }[];
  };
  leadership?: {
    current: { 
      name: string; 
      party: string; 
      role: string; 
      since: string; 
      voteShare: string;
      links?: { 
        wikipedia?: string; 
        official?: string; 
        twitter?: string;
        instagram?: string;
        facebook?: string;
      };
    };
    historical: { 
      name: string; 
      party: string; 
      term: string; 
      result: string; 
      context: string;
      links?: { wikipedia?: string };
    }[];
  };
}
