import type { ComponentType } from "react";

export interface HowItWorksStep {
  title: string;
  description: string;
  code?: string;
}

export interface TradeoffData {
  pros: string[];
  cons: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  alternatives: { name: string; note: string }[];
}

export interface InterviewAnswerData {
  script: string;
  mistakes: string[];
  followUps: string[];
  redFlags: string[];
}

export interface ChallengeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicContent {
  visual: ComponentType;
  howItWorks: HowItWorksStep[];
  tradeoffs: TradeoffData;
  interviewAnswer: InterviewAnswerData;
  challenge: ChallengeQuestion[];
}
