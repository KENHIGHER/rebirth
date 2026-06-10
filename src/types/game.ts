import type { ActiveRandomEvent, Delta, EventSource, EventKind } from './randomEvent';
import type { AIDMWorld } from './aiDm';

export interface Message {
  id: string;
  text: string;
  triggerDate?: string;
  targetItem?: string;
  targetAssetId?: string;
  priceMultiplier?: number;
  type: 'finance' | 'material' | 'property' | 'metal' | 'location';
  source: 'peace' | 'doomsday';
  locationId?: string;
  locationName?: string;
}

export interface MarketEvent {
  id: string;
  date: string;
  itemId: string;
  multiplier: number;
}

export interface FinanceEvent {
  id: string;
  date: string;
  assetId: string;
  multiplier: number;
}

export interface LogEntry {
  id: string;
  date: string;
  time: number;
  text: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  buyPrice: number;
}

export interface FinancialAsset {
  id: string;
  name: string;
  type: 'stock' | 'metal';
  defaultPrice: number;
  volatility: number;
  description: string;
}

export interface FinancialHolding {
  id: string;
  name: string;
  type: 'stock' | 'metal';
  quantity: number;
  buyPrice: number;
}

export interface Property {
  id: string;
  name: string;
  price: number;
  structure: number;
  defense: number;
  space: number;
  comfort: number;
  baseStructure: number;
  baseDefense: number;
  baseSpace: number;
  baseComfort: number;
  structureLevel: number;
  defenseLevel: number;
  spaceLevel: number;
  comfortLevel: number;
  upgrades: string[];
}

export interface GameState {
  // Core Status
  num: number; // 轮回次数
  date: string; // 游戏内日期, e.g., '2027.5.1'
  time: number; // 8到24
  health: number; // 0-100
  san: number; // 0-100
  
  // Stats
  strength: number;
  constitution: number;
  intelligence: number;
  luck: number;
  leadership: number;

  // Assets
  cash: number;
  inventory: {
    items: Record<string, InventoryItem>;
    properties: Property[];
  };
  itemPrices: Record<string, number>;
  financeHoldings: Record<string, FinancialHolding>;
  financePrices: Record<string, number>;
  aiItemMultipliers: Record<string, number>;
  aiFinanceMultipliers: Record<string, number>;
  aiEvents: ActiveRandomEvent['def'][];
  aiRumors: Message[];
  aiDmTitle: string;
  aiDmBriefing: string;

  // Messages
  archivedMessages: Message[]; // from past lives
  currentMessages: Message[]; // gained in current life
  usedMemoryLocationIds: string[];

  // Logs
  logs: LogEntry[];

  // Status flags
  isDoomsday: boolean;
  isDead: boolean;
  deathReason: string;
  doomsdayDays: number;
  hasExercisedToday: boolean;
  balanceExerciseCooldown: number;
  lowSanForcedSleep: boolean;
  pendingForcedSleep: boolean;

  activeEvent: ActiveRandomEvent | null;
  eventBag: EventKind[];
  eventTestReport: string | null;

  // Actions
  advanceTime: (hours: number) => void;
  sleep: () => void;
  addHealth: (amount: number) => void;
  addSan: (amount: number) => void;
  addStat: (
    stat: 'strength' | 'constitution' | 'intelligence' | 'luck' | 'leadership',
    amount: number,
    source?: 'default' | 'randomEvent'
  ) => void;
  buyItem: (itemId: string, name: string, quantity: number, price: number) => void;
  sellItem: (itemId: string, quantity: number, price: number) => void;
  consumeItem: (itemId: string, quantity: number) => boolean;
  applyDeltas: (deltas: Delta[]) => void;
  startRandomEvent: (source: EventSource) => void;
  resolveRandomEvent: (choiceId: string) => void;
  closeRandomEvent: () => void;
  runEventSystemTest: () => string;
  buyProperty: (property: Property, price: number) => void;
  sellProperty: (propertyId: string) => void;
  upgradeProperty: (propertyId: string, direction: 'structure' | 'defense' | 'space' | 'comfort') => boolean;
  buyFinance: (assetId: string, quantity: number, price: number) => void;
  sellFinance: (assetId: string, quantity: number, price: number) => void;
  addMessage: (msg: Message) => void;
  addLog: (text: string) => void;
  markMemoryLocationUsed: (locationId: string) => void;
  applyAIDMWorld: (world: AIDMWorld) => void;
  clearAIDMWorld: () => void;
  consumeAIRumor: (rumorId: string) => void;
  setHasExercisedToday: (val: boolean) => void;
  setBalanceExerciseCooldown: (val: number) => void;
  applyDeveloperState: (patch: {
    cash?: number;
    date?: string;
    time?: number;
    health?: number;
    san?: number;
    strength?: number;
    constitution?: number;
    intelligence?: number;
    luck?: number;
    leadership?: number;
    isDoomsday?: boolean;
  }) => void;
  die: (reason: string) => void;
  rebirth: () => void;
}

export const ITEMS = {
  food: { id: 'food', name: '食物', defaultPrice: 50, use: '每日消耗' },
  water: { id: 'water', name: '水', defaultPrice: 30, use: '每日消耗' },
  medicine: { id: 'medicine', name: '药品', defaultPrice: 200, use: '受伤使用' },
  weapon: { id: 'weapon', name: '武器', defaultPrice: 500, use: '提升探索安全性' },
  fuel: { id: 'fuel', name: '燃料', defaultPrice: 100, use: '发电、出行' },
  materials: { id: 'materials', name: '建材', defaultPrice: 300, use: '安全屋升级' },
};

export const MARKET_EVENTS: MarketEvent[] = [
  { id: 'fuel_spike', date: '2027.5.2', itemId: 'fuel', multiplier: 2 },
  { id: 'medicine_spike', date: '2027.5.3', itemId: 'medicine', multiplier: 3 },
  { id: 'materials_spike', date: '2027.5.3', itemId: 'materials', multiplier: 2 },
  { id: 'food_spike', date: '2027.5.4', itemId: 'food', multiplier: 2 },
  { id: 'weapon_spike', date: '2027.5.5', itemId: 'weapon', multiplier: 2 },
  { id: 'water_spike', date: '2027.5.5', itemId: 'water', multiplier: 2 },
];

export const FINANCE_ASSETS: FinancialAsset[] = [
  { id: 'hope_bio', name: '希望制药', type: 'stock', defaultPrice: 120, volatility: 0.18, description: '药品储备与应急需求强相关。' },
  { id: 'ironwall_ind', name: '铁壁工业', type: 'stock', defaultPrice: 90, volatility: 0.15, description: '建材、工具与防御工程概念股。' },
  { id: 'shelter_reit', name: '避难所地产', type: 'stock', defaultPrice: 150, volatility: 0.2, description: '与安全屋、地下设施炒作相关。' },
  { id: 'gold', name: '黄金', type: 'metal', defaultPrice: 480, volatility: 0.12, description: '乱世中的常见硬通货。' },
  { id: 'silver', name: '白银', type: 'metal', defaultPrice: 160, volatility: 0.14, description: '更容易入手的贵金属。' },
  { id: 'platinum', name: '铂金', type: 'metal', defaultPrice: 620, volatility: 0.16, description: '高波动的稀缺贵金属。' },
];

export const FINANCE_EVENTS: FinanceEvent[] = [
  { id: 'hope_bio_spike', date: '2027.5.3', assetId: 'hope_bio', multiplier: 2.8 },
  { id: 'ironwall_spike', date: '2027.5.4', assetId: 'ironwall_ind', multiplier: 2.1 },
  { id: 'shelter_reit_spike', date: '2027.5.5', assetId: 'shelter_reit', multiplier: 2.4 },
  { id: 'gold_spike', date: '2027.5.2', assetId: 'gold', multiplier: 1.8 },
  { id: 'silver_spike', date: '2027.5.4', assetId: 'silver', multiplier: 2.2 },
  { id: 'platinum_spike', date: '2027.5.5', assetId: 'platinum', multiplier: 2.5 },
];

export const PROPERTIES = [
  {
    id: 'suburb',
    name: '郊区平房',
    price: 50000,
    structure: 10,
    defense: 5,
    space: 20,
    comfort: 10,
    baseStructure: 10,
    baseDefense: 5,
    baseSpace: 20,
    baseComfort: 10,
    structureLevel: 1,
    defenseLevel: 1,
    spaceLevel: 1,
    comfortLevel: 1,
    upgrades: [],
  },
  {
    id: 'city',
    name: '市中心公寓',
    price: 200000,
    structure: 30,
    defense: 15,
    space: 10,
    comfort: 30,
    baseStructure: 30,
    baseDefense: 15,
    baseSpace: 10,
    baseComfort: 30,
    structureLevel: 1,
    defenseLevel: 1,
    spaceLevel: 1,
    comfortLevel: 1,
    upgrades: [],
  },
  {
    id: 'factory',
    name: '废弃工厂',
    price: 80000,
    structure: 50,
    defense: 5,
    space: 50,
    comfort: 5,
    baseStructure: 50,
    baseDefense: 5,
    baseSpace: 50,
    baseComfort: 5,
    structureLevel: 1,
    defenseLevel: 1,
    spaceLevel: 1,
    comfortLevel: 1,
    upgrades: [],
  },
  {
    id: 'bunker',
    name: '地下掩体',
    price: 150000,
    structure: 80,
    defense: 40,
    space: 15,
    comfort: 15,
    baseStructure: 80,
    baseDefense: 40,
    baseSpace: 15,
    baseComfort: 15,
    structureLevel: 1,
    defenseLevel: 1,
    spaceLevel: 1,
    comfortLevel: 1,
    upgrades: [],
  },
];
