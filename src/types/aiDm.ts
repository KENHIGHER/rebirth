import type { Message } from './game';
import type { RandomEventDefinition } from './randomEvent';

export interface AIDMWorld {
  title: string;
  briefing: string;
  itemMultipliers: Record<string, number>;
  financeMultipliers: Record<string, number>;
  rumors: Message[];
  events: RandomEventDefinition[];
}

export interface AIDMRequestContext {
  date: string;
  isDoomsday: boolean;
  cash: number;
  stats: {
    health: number;
    san: number;
    strength: number;
    constitution: number;
    intelligence: number;
    luck: number;
    leadership: number;
  };
}
