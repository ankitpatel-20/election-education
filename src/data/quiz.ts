/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  india: [
    {
      question: "What is the minimum age to vote in India?",
      options: ["16", "18", "21", "25"],
      correctAnswer: 1,
      explanation: "The minimum age to vote in India is 18 years, as per the 61st Amendment Act."
    },
    {
      question: "Which machine is used for voting in India?",
      options: ["ATM", "Scanner", "EVM", "Paper Ballot only"],
      correctAnswer: 2,
      explanation: "Electronic Voting Machines (EVMs) are used in Indian elections."
    },
    {
      question: "What is the official portal for voter registration in India?",
      options: ["Digital India", "NVSP", "Aadhaar Portal", "MyGov"],
      correctAnswer: 1,
      explanation: "The National Voters' Service Portal (NVSP) is the official platform."
    }
  ],
  usa: [
    {
      question: "Every how many years is a Presidential election held in the US?",
      options: ["2", "4", "5", "6"],
      correctAnswer: 1,
      explanation: "U.S. Presidential elections are held every 4 years."
    },
    {
      question: "Which website is recommended for starting the registration process in the US?",
      options: ["usa.gov", "vote.org", "vote.gov", "elections.gov"],
      correctAnswer: 2,
      explanation: "Vote.gov is the official government site for finding registration info."
    },
    {
      question: "True or False: All US states have the same voter ID laws.",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "Voter ID laws vary significantly from state to state."
    }
  ],
  uk: [
    {
      question: "Who is eligible to vote in a UK general election?",
      options: ["Tourists", "16-year-olds in England", "British, Irish or qualifying Commonwealth citizens", "Anyone living in the UK for 1 week"],
      correctAnswer: 2,
      explanation: "British, Irish, and qualifying Commonwealth citizens resident in the UK are eligible."
    },
    {
      question: "What is required to register to vote online in the UK?",
      options: ["Bank Statement", "National Insurance number", "Utility Bill", "Letter from the King"],
      correctAnswer: 1,
      explanation: "You need your National Insurance number to register online at gov.uk."
    },
    {
      question: "Can you vote by post in the UK?",
      options: ["Yes", "No", "Only if you are over 80", "Only for local elections"],
      correctAnswer: 0,
      explanation: "Yes, anyone registered to vote can apply for a postal vote."
    }
  ]
};
