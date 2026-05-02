/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
}

export const COUNTRIES: Record<string, CountryData> = {
  india: {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    region: 'Asia',
    isDetailed: true,
    eligibility: [
      'Must be a citizen of India',
      'Must be 18 years of age or older',
      'Must be a resident of the polling area',
      'Must not be disqualified by law'
    ],
    registration: {
      steps: [
        'Step 1: Visit NVSP website (voters.eci.gov.in)',
        'Step 2: Fill out Form 6',
        'Step 3: Upload ID and Address proof',
        'Step 4: Track status until name appears in list'
      ],
      link: 'https://voters.eci.gov.in'
    },
    documents: ['Aadhaar Card', 'Passport/Birth Proof', 'Utility Bill', 'Photo'],
    method: 'Offline (EVM machine at polling booth)',
    timeline: 'General elections every 5 years. Next: 2029.'
  },
  usa: {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    region: 'Americas',
    isDetailed: true,
    eligibility: [
      'U.S. Citizen',
      '18 years old by Election Day',
      'Meet state residency requirements'
    ],
    registration: {
      steps: [
        'Step 1: Visit Vote.gov',
        'Step 2: Select your state',
        'Step 3: Register Online, by Mail, or In-person',
        'Step 4: Confirm status 30 days before election'
      ],
      link: 'https://vote.gov'
    },
    documents: ['State ID/Driver\'s License', 'SSN', 'Address Proof'],
    method: 'Hybrid (In-person, Mail-in, or Drop-box)',
    timeline: 'Presidential every 4 years. Midterms every 2 years.'
  },
  uk: {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    isDetailed: true,
    eligibility: [
      'Registered to vote',
      '18+ on Election Day',
      'British, Irish, or qualifying Commonwealth citizen'
    ],
    registration: {
      steps: [
        'Step 1: Go to gov.uk/register-to-vote',
        'Step 2: Provide National Insurance number',
        'Step 3: Provide Passport details (if abroad)',
        'Step 4: Only register once per address'
      ],
      link: 'https://www.gov.uk/register-to-vote'
    },
    documents: ['National Insurance number', 'Voter Photo ID (for polling stations)'],
    method: 'Offline/Mail (Polling booths or postal)',
    timeline: 'General elections at least every 5 years.'
  },
  // Adding more requested countries (Basic info, AI will handle details)
  germany: { id: 'germany', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  france: { id: 'france', name: 'France', flag: '🇫🇷', region: 'Europe' },
  australia: { id: 'australia', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  canada: { id: 'canada', name: 'Canada', flag: '🇨🇦', region: 'Americas' },
  japan: { id: 'japan', name: 'Japan', flag: '🇯🇵', region: 'Asia' },
  brazil: { id: 'brazil', name: 'Brazil', flag: '🇧🇷', region: 'Americas' },
  south_africa: { id: 'south_africa', name: 'South Africa', flag: '🇿🇦', region: 'Africa' },
  nigeria: { id: 'nigeria', name: 'Nigeria', flag: '🇳🇬', region: 'Africa' },
  indonesia: { id: 'indonesia', name: 'Indonesia', flag: '🇮🇩', region: 'Asia' },
  south_korea: { id: 'south_korea', name: 'South Korea', flag: '🇰🇷', region: 'Asia' },
  mexico: { id: 'mexico', name: 'Mexico', flag: '🇲🇽', region: 'Americas' },
  italy: { id: 'italy', name: 'Italy', flag: '🇮🇹', region: 'Europe' },
  spain: { id: 'spain', name: 'Spain', flag: '🇪🇸', region: 'Europe' },
  netherlands: { id: 'netherlands', name: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
  sweden: { id: 'sweden', name: 'Sweden', flag: '🇸🇪', region: 'Europe' },
  norway: { id: 'norway', name: 'Norway', flag: '🇳🇴', region: 'Europe' },
  denmark: { id: 'denmark', name: 'Denmark', flag: '🇩🇰', region: 'Europe' },
  new_zealand: { id: 'new_zealand', name: 'New Zealand', flag: '🇳🇿', region: 'Oceania' },
  papua_new_guinea: { id: 'papua_new_guinea', name: 'Papua New Guinea', flag: '🇵🇬', region: 'Oceania' },
  kenya: { id: 'kenya', name: 'Kenya', flag: '🇰🇪', region: 'Africa' },
  ghana: { id: 'ghana', name: 'Ghana', flag: '🇬🇭', region: 'Africa' },
  // Europe
  belgium: { id: 'belgium', name: 'Belgium', flag: '🇧🇪', region: 'Europe' },
  austria: { id: 'austria', name: 'Austria', flag: '🇦🇹', region: 'Europe' },
  ireland: { id: 'ireland', name: 'Ireland', flag: '🇮🇪', region: 'Europe' },
  poland: { id: 'poland', name: 'Poland', flag: '🇵🇱', region: 'Europe' },
  portugal: { id: 'portugal', name: 'Portugal', flag: '🇵🇹', region: 'Europe' },
  czech_republic: { id: 'czech_republic', name: 'Czech Republic', flag: '🇨🇿', region: 'Europe' },
  hungary: { id: 'hungary', name: 'Hungary', flag: '🇭🇺', region: 'Europe' },
  greece: { id: 'greece', name: 'Greece', flag: '🇬🇷', region: 'Europe' },
  romania: { id: 'romania', name: 'Romania', flag: '🇷🇴', region: 'Europe' },
  finland: { id: 'finland', name: 'Finland', flag: '🇫🇮', region: 'Europe' },
  switzerland: { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭', region: 'Europe' },
  // Asia
  philippines: { id: 'philippines', name: 'Philippines', flag: '🇵🇭', region: 'Asia' },
  thailand: { id: 'thailand', name: 'Thailand', flag: '🇹🇭', region: 'Asia' },
  malaysia: { id: 'malaysia', name: 'Malaysia', flag: '🇲🇾', region: 'Asia' },
  singapore: { id: 'singapore', name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  nepal: { id: 'nepal', name: 'Nepal', flag: '🇳🇵', region: 'Asia' },
  bangladesh: { id: 'bangladesh', name: 'Bangladesh', flag: '🇧🇩', region: 'Asia' },
  sri_lanka: { id: 'sri_lanka', name: 'Sri Lanka', flag: '🇱🇰', region: 'Asia' },
  mongolia: { id: 'mongolia', name: 'Mongolia', flag: '🇲🇳', region: 'Asia' },
  taiwan: { id: 'taiwan', name: 'Taiwan', flag: '🇹🇼', region: 'Asia' },
  israel: { id: 'israel', name: 'Israel', flag: '🇮🇱', region: 'Asia' },
  // Africa
  botswana: { id: 'botswana', name: 'Botswana', flag: '🇧🇼', region: 'Africa' },
  namibia: { id: 'namibia', name: 'Namibia', flag: '🇳🇦', region: 'Africa' },
  senegal: { id: 'senegal', name: 'Senegal', flag: '🇸🇳', region: 'Africa' },
  zambia: { id: 'zambia', name: 'Zambia', flag: '🇿🇲', region: 'Africa' },
  tanzania: { id: 'tanzania', name: 'Tanzania', flag: '🇹🇿', region: 'Africa' },
  morocco: { id: 'morocco', name: 'Morocco', flag: '🇲🇦', region: 'Africa' },
  // Americas
  argentina: { id: 'argentina', name: 'Argentina', flag: '🇦🇷', region: 'Americas' },
  chile: { id: 'chile', name: 'Chile', flag: '🇨🇱', region: 'Americas' },
  colombia: { id: 'colombia', name: 'Colombia', flag: '🇨🇴', region: 'Americas' },
  peru: { id: 'peru', name: 'Peru', flag: '🇵🇪', region: 'Americas' },
  costa_rica: { id: 'costa_rica', name: 'Costa Rica', flag: '🇨🇷', region: 'Americas' },
  uruguay: { id: 'uruguay', name: 'Uruguay', flag: '🇺🇾', region: 'Americas' },
  // Additional Global Countries
  jamaica: { id: 'jamaica', name: 'Jamaica', flag: '🇯🇲', region: 'Americas' },
  panama: { id: 'panama', name: 'Panama', flag: '🇵🇦', region: 'Americas' },
  egypt: { id: 'egypt', name: 'Egypt', flag: '🇪🇬', region: 'Africa' },
  ethiopia: { id: 'ethiopia', name: 'Ethiopia', flag: '🇪🇹', region: 'Africa' },
  vietnam: { id: 'vietnam', name: 'Vietnam', flag: '🇻🇳', region: 'Asia' },
  fiji: { id: 'fiji', name: 'Fiji', flag: '🇫🇯', region: 'Oceania' },
  samoa: { id: 'samoa', name: 'Samoa', flag: '🇼🇸', region: 'Oceania' },
  // Middle East & West Asia
  saudi_arabia: { id: 'saudi_arabia', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Asia' },
  uae: { id: 'uae', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Asia' },
  pakistan: { id: 'pakistan', name: 'Pakistan', flag: '🇵🇰', region: 'Asia' },
  turkey: { id: 'turkey', name: 'Turkey', flag: '🇹🇷', region: 'Europe' },
  qatar: { id: 'qatar', name: 'Qatar', flag: '🇶🇦', region: 'Asia' },
  kuwait: { id: 'kuwait', name: 'Kuwait', flag: '🇰🇼', region: 'Asia' },
  oman: { id: 'oman', name: 'Oman', flag: '🇴🇲', region: 'Asia' },
  jordan: { id: 'jordan', name: 'Jordan', flag: '🇯🇴', region: 'Asia' },
  // Europe Extended
  ukraine: { id: 'ukraine', name: 'Ukraine', flag: '🇺🇦', region: 'Europe' },
  iceland: { id: 'iceland', name: 'Iceland', flag: '🇮🇸', region: 'Europe' },
  estonia: { id: 'estonia', name: 'Estonia', flag: '🇪🇪', region: 'Europe' },
  latvia: { id: 'latvia', name: 'Latvia', flag: '🇱🇻', region: 'Europe' },
  lithuania: { id: 'lithuania', name: 'Lithuania', flag: '🇱🇹', region: 'Europe' },
  croatia: { id: 'croatia', name: 'Croatia', flag: '🇭🇷', region: 'Europe' },
  slovenia: { id: 'slovenia', name: 'Slovenia', flag: '🇸🇮', region: 'Europe' },
  // Africa Extended
  algeria: { id: 'algeria', name: 'Algeria', flag: '🇩🇿', region: 'Africa' },
  tunisia: { id: 'tunisia', name: 'Tunisia', flag: '🇹🇳', region: 'Africa' },
  uganda: { id: 'uganda', name: 'Uganda', flag: '🇺🇬', region: 'Africa' },
  rwanda: { id: 'rwanda', name: 'Rwanda', flag: '🇷🇼', region: 'Africa' },
  zimbabwe: { id: 'zimbabwe', name: 'Zimbabwe', flag: '🇿🇼', region: 'Africa' },
  madagascar: { id: 'madagascar', name: 'Madagascar', flag: '🇲🇬', region: 'Africa' },
  mali: { id: 'mali', name: 'Mali', flag: '🇲🇱', region: 'Africa' },
  ivory_coast: { id: 'ivory_coast', name: 'Ivory Coast', flag: '🇨🇮', region: 'Africa' },
  cameroon: { id: 'cameroon', name: 'Cameroon', flag: '🇨🇲', region: 'Africa' },
  angola: { id: 'angola', name: 'Angola', flag: '🇦🇴', region: 'Africa' },
  malawi: { id: 'malawi', name: 'Malawi', flag: '🇲🇼', region: 'Africa' },
  burkina_faso: { id: 'burkina_faso', name: 'Burkina Faso', flag: '🇧🇫', region: 'Africa' },
  niger: { id: 'niger', name: 'Niger', flag: '🇳🇪', region: 'Africa' },
  chad: { id: 'chad', name: 'Chad', flag: '🇹🇩', region: 'Africa' },
  somalia: { id: 'somalia', name: 'Somalia', flag: '🇸🇴', region: 'Africa' },
  libya: { id: 'libya', name: 'Libya', flag: '🇱🇾', region: 'Africa' },
  sudan: { id: 'sudan', name: 'Sudan', flag: '🇸🇩', region: 'Africa' },
  south_sudan: { id: 'south_sudan', name: 'South Sudan', flag: '🇸🇸', region: 'Africa' },
  dr_congo: { id: 'dr_congo', name: 'DR Congo', flag: '🇨🇩', region: 'Africa' },
  republic_congo: { id: 'republic_congo', name: 'Republic of the Congo', flag: '🇨🇬', region: 'Africa' },
  gabon: { id: 'gabon', name: 'Gabon', flag: '🇬🇦', region: 'Africa' },
  togo: { id: 'togo', name: 'Togo', flag: '🇹🇬', region: 'Africa' },
  benin: { id: 'benin', name: 'Benin', flag: '🇧🇯', region: 'Africa' },
  sierra_leone: { id: 'sierra_leone', name: 'Sierra Leone', flag: '🇸🇱', region: 'Africa' },
  liberia: { id: 'liberia', name: 'Liberia', flag: '🇱🇷', region: 'Africa' },
  mauritius: { id: 'mauritius', name: 'Mauritius', flag: '🇲🇺', region: 'Africa' },
  mozambique: { id: 'mozambique', name: 'Mozambique', flag: '🇲🇿', region: 'Africa' },
  // Central & West Asia Extended
  kazakhstan: { id: 'kazakhstan', name: 'Kazakhstan', flag: '🇰🇿', region: 'Asia' },
  uzbekistan: { id: 'uzbekistan', name: 'Uzbekistan', flag: '🇺🇿', region: 'Asia' },
  azerbaijan: { id: 'azerbaijan', name: 'Azerbaijan', flag: '🇦🇿', region: 'Asia' },
  georgia: { id: 'georgia', name: 'Georgia', flag: '🇬🇪', region: 'Asia' },
  armenia: { id: 'armenia', name: 'Armenia', flag: '🇦🇲', region: 'Asia' },
  // Americas Extended
  ecuador: { id: 'ecuador', name: 'Ecuador', flag: '🇪🇨', region: 'Americas' },
  paraguay: { id: 'paraguay', name: 'Paraguay', flag: '🇵🇾', region: 'Americas' },
  guatemala: { id: 'guatemala', name: 'Guatemala', flag: '🇬🇹', region: 'Americas' },
  bolivia: { id: 'bolivia', name: 'Bolivia', flag: '🇧🇴', region: 'Americas' },
  honduras: { id: 'honduras', name: 'Honduras', flag: '🇭🇳', region: 'Americas' },
  // Oceania Extended
  solomon_islands: { id: 'solomon_islands', name: 'Solomon Islands', flag: '🇸🇧', region: 'Oceania' },
  vanuatu: { id: 'vanuatu', name: 'Vanuatu', flag: '🇻🇺', region: 'Oceania' },
  tonga: { id: 'tonga', name: 'Tonga', flag: '🇹🇴', region: 'Oceania' },
  // Missing Requested
  slovakia: { id: 'slovakia', name: 'Slovakia', flag: '🇸🇰', region: 'Europe' },
  albania: { id: 'albania', name: 'Albania', flag: '🇦🇱', region: 'Europe' },
  north_macedonia: { id: 'north_macedonia', name: 'North Macedonia', flag: '🇲🇰', region: 'Europe' },
  china: { id: 'china', name: 'China', flag: '🇨🇳', region: 'Asia' },
  russia: { id: 'russia', name: 'Russia', flag: '🇷🇺', region: 'Europe' },
  iran: { id: 'iran', name: 'Iran', flag: '🇮🇷', region: 'Asia' },
  belarus: { id: 'belarus', name: 'Belarus', flag: '🇧🇾', region: 'Europe' },
  venezuela: { id: 'venezuela', name: 'Venezuela', flag: '🇻🇪', region: 'Americas' },
  cuba: { id: 'cuba', name: 'Cuba', flag: '🇨🇺', region: 'Americas' },
  north_korea: { id: 'north_korea', name: 'North Korea', flag: '🇰🇵', region: 'Asia' }
};
