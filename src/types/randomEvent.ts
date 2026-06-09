export type CoreAttribute = 'strength' | 'intelligence' | 'luck' | 'leadership';

export type StatKey =
  | 'health'
  | 'san'
  | 'strength'
  | 'constitution'
  | 'intelligence'
  | 'luck'
  | 'leadership';

export type EventKind = 'reward' | 'punish';
export type EventSource = 'explore' | 'stroll' | 'nextDay';

export type Delta =
  | { type: 'stat'; key: StatKey; amount: number }
  | { type: 'item'; itemId: string; itemName: string; amount: number }
  | { type: 'cash'; amount: number };

export interface EventOutcome {
  text: string;
  deltas: Delta[];
}

export interface EventCheck {
  attribute: CoreAttribute;
  difficulty: 0 | 1 | 2 | 3;
}

export interface EventChoice {
  id: string;
  label: string;
  check?: EventCheck;
  success?: EventOutcome;
  failure?: EventOutcome;
  always?: EventOutcome;
}

export interface RandomEventDefinition {
  id: string;
  kind: EventKind;
  title: string;
  scene: string;
  source: EventSource;
  tags: string[];
  choices: EventChoice[];
}

export type EventStage = 'scene' | 'choose' | 'result';

export interface ActiveRandomEvent {
  id: string;
  def: RandomEventDefinition;
  pages: string[];
  pageIndex: number;
  stage: EventStage;
  lastResult?: {
    choiceId: string;
    isSuccess: boolean | null;
    outcome: EventOutcome;
    successChance?: number;
    roll?: number;
  };
}

