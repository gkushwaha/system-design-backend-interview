export interface RequirementsData {
  functional: string[];
  nonFunctional: string[];
}

export interface DiagramNode {
  id: string;
  label: string;
  x: number; // 0-100 percent
  y: number; // 0-100 percent
  kind?: "client" | "server" | "db" | "cache" | "queue" | "storage" | "external";
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface SolutionStep {
  title: string;
  description: string;
  revealNodeIds: string[];
  revealEdgeIds: string[];
}

export interface CapacityInput {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit: string;
}

export interface CapacityOutput {
  label: string;
  value: string;
}

export interface CapacityData {
  inputs: CapacityInput[];
  compute: (values: Record<string, number>) => CapacityOutput[];
  chartData: (values: Record<string, number>) => { name: string; value: number }[];
  chartUnit: string;
}

export interface KeyDecision {
  decision: string;
  why: string;
}

export interface ProblemContent {
  requirements: RequirementsData;
  diagramNodes: DiagramNode[];
  diagramEdges: DiagramEdge[];
  solutionSteps: SolutionStep[];
  capacity: CapacityData;
  keyDecisions: KeyDecision[];
  commonMistakes: string[];
  companyNote: { company: string; note: string };
}
