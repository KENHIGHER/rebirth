import { create } from 'zustand';
import {
  FINANCE_ASSETS,
  FINANCE_EVENTS,
  GameState,
  ITEMS,
  MARKET_EVENTS,
  Message,
  Property,
} from '../types/game';
import { DOOMSDAY_EVENTS } from '../events/doomsdayEvents';
import { ActiveRandomEvent, Delta, EventKind, EventOutcome, RandomEventDefinition } from '../types/randomEvent';

const INITIAL_DATE = '2027.5.1';
const DOOMSDAY_DATE = '2027.5.6';

const hashString = (str: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededRandom01 = (seed: string): number => {
  return (hashString(seed) % 10000) / 10000;
};

const calcItemPrices = (date: string): Record<string, number> => {
  const prices: Record<string, number> = {};
  const dayEvents = MARKET_EVENTS.filter((e) => e.date === date);

  Object.values(ITEMS).forEach((item) => {
    const base = item.defaultPrice;
    const eventMultiplier = dayEvents
      .filter((e) => e.itemId === item.id)
      .reduce((acc, e) => acc * e.multiplier, 1);

    if (eventMultiplier !== 1) {
      prices[item.id] = Math.max(1, Math.round(base * eventMultiplier));
      return;
    }

    const factor = 0.9 + seededRandom01(`${date}|${item.id}`) * 0.2;
    prices[item.id] = Math.max(1, Math.round(base * factor));
  });

  return prices;
};

const calcFinancePrices = (date: string): Record<string, number> => {
  const prices: Record<string, number> = {};
  const dayEvents = FINANCE_EVENTS.filter((e) => e.date === date);

  FINANCE_ASSETS.forEach((asset) => {
    const eventMultiplier = dayEvents
      .filter((e) => e.assetId === asset.id)
      .reduce((acc, e) => acc * e.multiplier, 1);

    if (eventMultiplier !== 1) {
      prices[asset.id] = Math.max(1, Math.round(asset.defaultPrice * eventMultiplier));
      return;
    }

    const variance = seededRandom01(`${date}|finance|${asset.id}`);
    const factor = 1 - asset.volatility / 2 + variance * asset.volatility;
    prices[asset.id] = Math.max(1, Math.round(asset.defaultPrice * factor));
  });

  return prices;
};

const DOOMSDAY_LOCATION_HINTS = [
  { id: 'east_fuel', name: '城东加油站', itemId: 'fuel' },
  { id: 'north_hardware', name: '北区五金仓库', itemId: 'materials' },
  { id: 'old_pharmacy', name: '老城区药房', itemId: 'medicine' },
  { id: 'riverside_store', name: '河畔便利店', itemId: 'food' },
  { id: 'water_plant', name: '自来水厂旁', itemId: 'water' },
] as const;

const DOOMSDAY_MESSAGE_TEMPLATES = [
  {
    type: 'location' as const,
    build: () => {
      const hint = DOOMSDAY_LOCATION_HINTS[Math.floor(Math.random() * DOOMSDAY_LOCATION_HINTS.length)];
      const itemName = Object.values(ITEMS).find((i) => i.id === hint.itemId)?.name || '物资';
      return {
        text: `【广播消息】深夜收音机里传来断续讯号：“${hint.name}附近还有${itemName}，别去晚了。”`,
        locationId: hint.id,
        locationName: hint.name,
        targetItem: hint.itemId,
      };
    },
  },
  {
    type: 'material' as const,
    build: () => ({
      text: '【物资消息】你听到幸存者电台提到，明天东区净水片会紧缺，瓶装水和食物会被抢得更凶。',
      targetItem: Math.random() < 0.5 ? 'water' : 'food',
    }),
  },
  {
    type: 'metal' as const,
    build: () => ({
      text: '【贵金属消息】废弃金店的卷帘门已经被撬开，黄金和燃料会在地下交易里一起暴涨。',
      targetItem: Math.random() < 0.5 ? 'fuel' : 'materials',
    }),
  },
  {
    type: 'property' as const,
    build: () => ({
      text: '【地产消息】临时避难区开始清场，带地下室的房产和可加固据点会迅速升值。',
      targetItem: 'materials',
    }),
  },
  {
    type: 'finance' as const,
    build: () => ({
      text: '【金融消息】你从断断续续的旧财经频道中听见，有企业正悄悄高价回收药品和燃料储备。',
      targetItem: Math.random() < 0.5 ? 'medicine' : 'fuel',
    }),
  },
];

const getNextDate = (currentDate: string): string => {
  const parts = currentDate.split('.');
  let year = parseInt(parts[0]);
  let month = parseInt(parts[1]);
  let day = parseInt(parts[2]);

  day += 1;
  // Simple assumption for May (31 days)
  if (day > 31) {
    day = 1;
    month += 1;
  }
  return `${year}.${month}.${day}`;
};

const dateToNumber = (value: string) => {
  const [year, month, day] = value.split('.').map((x) => parseInt(x, 10));
  return year * 10000 + month * 100 + day;
};

const checkDoomsday = (date: string, time: number): boolean => {
  return date === DOOMSDAY_DATE && time >= 8;
};

const isOnOrAfterDoomsday = (date: string, time: number) => {
  const current = dateToNumber(date);
  const threshold = dateToNumber(DOOMSDAY_DATE);
  return current > threshold || (current === threshold && time >= 8);
};

const createOwnedProperty = (property: Property): Property => ({
  ...property,
  upgrades: [],
  structure: property.baseStructure,
  defense: property.baseDefense,
  space: property.baseSpace,
  comfort: property.baseComfort,
  structureLevel: 1,
  defenseLevel: 1,
  spaceLevel: 1,
  comfortLevel: 1,
});

const getPrimaryProperty = (properties: Property[]) => properties[0] || null;

const getStorageCapacity = (property: Property | null) => 500 + (property?.space || 0) * 50;

const clampFoodWaterAddition = (
  items: Record<string, { id: string; name: string; quantity: number; buyPrice: number }>,
  itemId: string,
  amount: number,
  property: Property | null,
) => {
  if (amount <= 0 || (itemId !== 'food' && itemId !== 'water')) return amount;
  const otherId = itemId === 'food' ? 'water' : 'food';
  const otherQty = items[otherId]?.quantity || 0;
  const currentQty = items[itemId]?.quantity || 0;
  const capacity = getStorageCapacity(property);
  return Math.max(0, Math.min(amount, capacity - otherQty - currentQty));
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const clamp = (min: number, max: number, n: number) => Math.max(min, Math.min(max, n));

const paginateText = (text: string, maxChars: number) => {
  const t = text.trim();
  if (!t) return [''];
  const parts: string[] = [];
  let i = 0;
  while (i < t.length) {
    parts.push(t.slice(i, i + maxChars));
    i += maxChars;
  }
  return parts;
};

const createDoomsdayMessage = (): Message => {
  const tpl = DOOMSDAY_MESSAGE_TEMPLATES[Math.floor(Math.random() * DOOMSDAY_MESSAGE_TEMPLATES.length)];
  const built = tpl.build();
  const locationFields =
    'locationId' in built && 'locationName' in built
      ? { locationId: built.locationId as string, locationName: built.locationName as string }
      : {};
  return {
    id: Math.random().toString(36).substr(2, 9),
    text: built.text,
    type: tpl.type,
    source: 'doomsday',
    targetItem: built.targetItem,
    ...locationFields,
  };
};

const buildSystemEvent = (title: string, scene: string, text: string): ActiveRandomEvent => ({
  id: Math.random().toString(36).slice(2, 10),
  def: {
    id: `system_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'reward',
    title,
    scene,
    source: 'nextDay',
    tags: ['系统'],
    choices: [],
  },
  pages: paginateText(scene, 150),
  pageIndex: 0,
  stage: 'result',
  lastResult: {
    choiceId: 'system',
    isSuccess: null,
    outcome: { text, deltas: [] },
  },
});

const buildEventBag = () => {
  const bag: EventKind[] = [];
  for (let i = 0; i < 70; i++) bag.push('reward');
  for (let i = 0; i < 30; i++) bag.push('punish');
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};

const computeSuccessChance = (
  def: RandomEventDefinition,
  attribute: 'strength' | 'intelligence' | 'luck' | 'leadership',
  difficulty: 0 | 1 | 2 | 3,
  stats: { strength: number; intelligence: number; luck: number; leadership: number },
) => {
  const s = clamp(0, 100, stats.strength);
  const i = clamp(0, 100, stats.intelligence);
  const l = clamp(0, 100, stats.luck);
  const lead = clamp(0, 100, stats.leadership);

  const norm = (x: number) => (x - 50) / 100;
  const diff = difficulty * 0.15;

  if (attribute === 'strength') {
    return clamp01(0.45 + norm(s) * 0.45 + norm(l) * 0.05 - diff);
  }
  if (attribute === 'intelligence') {
    return clamp01(0.45 + norm(i) * 0.45 + norm(l) * 0.05 - diff);
  }
  if (attribute === 'luck') {
    return clamp01(0.38 + norm(l) * 0.55 - difficulty * 0.12);
  }
  return clamp01(0.45 + norm(lead) * 0.45 + norm(i) * 0.05 - diff);
};

const createSuperHarvestBonus = () => {
  const bonusItemIds = ['food', 'water', 'medicine', 'fuel', 'materials'] as const;
  const bonusItemId = bonusItemIds[Math.floor(Math.random() * bonusItemIds.length)];
  const item = Object.values(ITEMS).find((x) => x.id === bonusItemId)!;
  const deltas: Delta[] = [
    { type: 'item', itemId: item.id, itemName: item.name, amount: 2 + Math.floor(Math.random() * 3) },
    { type: 'cash', amount: 500 + Math.floor(Math.random() * 700) },
  ];

  const statPool = [
    { key: 'strength', amount: 2 },
    { key: 'constitution', amount: 2 },
    { key: 'intelligence', amount: 2 },
    { key: 'luck', amount: 1 },
    { key: 'leadership', amount: 1 },
    { key: 'san', amount: 4 },
  ] as const;

  const stat1 = statPool[Math.floor(Math.random() * statPool.length)];
  const stat2 = statPool[Math.floor(Math.random() * statPool.length)];
  deltas.push({ type: 'stat', key: stat1.key, amount: stat1.amount });
  if (stat2.key !== stat1.key) {
    deltas.push({ type: 'stat', key: stat2.key, amount: stat2.amount });
  }

  return {
    text: `你撞上了超级收获：不仅带回更多补给，还摸到了一份额外线索，整个人都像被末日逼出新的本能。`,
    deltas,
  };
};

const boostRewardOutcome = (outcome: EventOutcome): EventOutcome => {
  const boostedDeltas = outcome.deltas.map((delta) => {
    if (delta.type === 'item' && delta.amount > 0) {
      return { ...delta, amount: delta.amount + 1 };
    }
    if (delta.type === 'cash' && delta.amount > 0) {
      return { ...delta, amount: Math.floor(delta.amount * 1.4) };
    }
    if (delta.type === 'stat' && delta.amount > 0) {
      const bonus = delta.key === 'san' || delta.key === 'health' ? 2 : 1;
      return { ...delta, amount: delta.amount + bonus };
    }
    return delta;
  });

  return {
    ...outcome,
    text: `${outcome.text} 你这次带回的收益比预想更多。`,
    deltas: boostedDeltas,
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  num: 0,
  date: INITIAL_DATE,
  time: 8,
  health: 100,
  san: 50,
  strength: 50,
  constitution: 50,
  intelligence: 50,
  luck: 50,
  leadership: 50,
  cash: 10000,
  inventory: {
    items: {},
    properties: [],
  },
  itemPrices: calcItemPrices(INITIAL_DATE),
  financeHoldings: {},
  financePrices: calcFinancePrices(INITIAL_DATE),
  archivedMessages: [],
  currentMessages: [],
  logs: [{ id: 'init', date: INITIAL_DATE, time: 8, text: '轮回开始，你回到了末日爆发前...' }],
  isDoomsday: false,
  isDead: false,
  deathReason: '',
  doomsdayDays: 0,
  hasExercisedToday: false,
  balanceExerciseCooldown: 0,
  lowSanForcedSleep: false,
  pendingForcedSleep: false,

  activeEvent: null,
  eventBag: buildEventBag(),
  eventTestReport: null,

  advanceTime: (hours: number) => {
    const { time, sleep, isDead } = get();
    if (isDead) return;

    let newTime = time + hours;
    if (newTime >= 24) {
      // It's time to sleep
      sleep();
    } else {
      set({ time: newTime });
      // If we crossed into doomsday time
      if (checkDoomsday(get().date, newTime)) {
        set({ isDoomsday: true });
        get().addLog('警报声撕裂了清晨，末日降临了。');
      }
    }
  },

  sleep: () => {
    const { date, isDead, isDoomsday, inventory, health, constitution, balanceExerciseCooldown, die } = get();
    if (isDead) return;

    const nextDate = getNextDate(date);
    const nextTime = 8;
    const newBalanceCooldown = Math.max(0, balanceExerciseCooldown - 1);
    const nextPrices = calcItemPrices(nextDate);
    const nextFinancePrices = calcFinancePrices(nextDate);
    const nextSan = get().san;
    const shelter = getPrimaryProperty(inventory.properties);
    
    // Check if Doomsday starts tomorrow
    let newIsDoomsday = isDoomsday;
    if (nextDate === DOOMSDAY_DATE) {
      newIsDoomsday = true;
    }

    if (newIsDoomsday) {
      // Doomsday logic
      const food = inventory.items['food']?.quantity || 0;
      const water = inventory.items['water']?.quantity || 0;
      
      const newItems = { ...inventory.items };
      let newHealth = health;
      let newSan = nextSan;
      let logText = '末日生存中：';
      
      const foodNeed = constitution >= 100 ? 1 : 2;
      const waterNeed = constitution >= 100 ? 1 : 3;

      if (food >= foodNeed && water >= waterNeed) {
        if (newItems['food']) newItems['food'].quantity -= foodNeed;
        if (newItems['water']) newItems['water'].quantity -= waterNeed;
        logText += `消耗了${foodNeed}份食物和${waterNeed}份水。`;
      } else {
        // Not enough food/water, take damage
        newHealth -= 40;
        logText += '物资不足！健康大幅下降。';
      }

      if (shelter?.comfort) {
        const sanRecovery = Math.floor(shelter.comfort * 0.1);
        if (sanRecovery > 0) {
          newSan = Math.min(100, newSan + sanRecovery);
          logText += ` 安全屋舒适度让你恢复了${sanRecovery}点理智。`;
        }
      }
      
      if (newHealth <= 0) {
        die('在末日中饥寒交迫而死');
        return;
      }

      const newDoomsdayDays = get().doomsdayDays + 1;
      const newMessages = [...get().currentMessages];
      let systemEvent: ActiveRandomEvent | null = null;
      if (newDoomsdayDays % 2 === 0) {
        const msg = createDoomsdayMessage();
        newMessages.push(msg);
        systemEvent = buildSystemEvent(
          '夜半广播',
          '风从墙缝里灌进来，收音机突然自己亮了一瞬。噪音之后，一段含混却关键的消息钻进了你的耳朵。',
          msg.text,
        );
        logText += ` 获得新消息。`;
      }
      
      set({ 
        date: nextDate, 
        time: nextTime, 
        isDoomsday: newIsDoomsday,
        health: newHealth,
        san: newSan,
        doomsdayDays: newDoomsdayDays,
        currentMessages: newMessages,
        inventory: { ...inventory, items: newItems },
        itemPrices: nextPrices,
        financePrices: nextFinancePrices,
        hasExercisedToday: false,
        balanceExerciseCooldown: newBalanceCooldown,
        lowSanForcedSleep: false,
        pendingForcedSleep: false,
        activeEvent: systemEvent,
        logs: [{
          id: Math.random().toString(36).substr(2, 9),
          date: nextDate,
          time: nextTime,
          text: logText
        }, ...get().logs]
      });
      
    } else {
      // Peacetime logic
      set({ 
        date: nextDate, 
        time: nextTime, 
        isDoomsday: newIsDoomsday,
        san: nextSan,
        itemPrices: nextPrices,
        financePrices: nextFinancePrices,
        hasExercisedToday: false,
        balanceExerciseCooldown: newBalanceCooldown,
        lowSanForcedSleep: false,
        pendingForcedSleep: false,
        logs: [{
          id: Math.random().toString(36).substr(2, 9),
          date: nextDate,
          time: nextTime,
          text: newIsDoomsday ? '末日降临了！' : `新的一天开始了。今日市场报价已更新：食物¥${nextPrices.food} 水¥${nextPrices.water}`
        }, ...get().logs]
      });
    }
  },

  addHealth: (amount: number) => {
    set((state) => {
      const newHealth = Math.min(100, Math.max(0, state.health + amount));
      if (newHealth <= 0) {
        state.die('健康归零');
      }
      return { health: newHealth };
    });
  },

  addSan: (amount: number) => {
    const { isDead, san, die } = get();
    if (isDead) return;

    const nextSan = Math.min(100, Math.max(0, san + amount));
    set({ san: nextSan });

    if (nextSan <= 0) {
      die('理智崩溃');
      return;
    }

    if (nextSan < 5 && !get().lowSanForcedSleep) {
      set((state) => {
        const halvedItems = Object.fromEntries(
          Object.entries(state.inventory.items)
            .map(([key, item]) => {
              const quantity = Math.floor(item.quantity / 2);
              return quantity > 0 ? [key, { ...item, quantity }] : null;
            })
            .filter(Boolean) as [string, typeof state.inventory.items[string]][]
        );

        return {
          health: Math.floor(state.health / 2),
          cash: Math.floor(state.cash / 2),
          strength: Math.floor(state.strength / 2),
          constitution: Math.floor(state.constitution / 2),
          intelligence: Math.floor(state.intelligence / 2),
          luck: Math.floor(state.luck / 2),
          leadership: Math.floor(state.leadership / 2),
          san: 30,
          inventory: { ...state.inventory, items: halvedItems },
          lowSanForcedSleep: true,
          pendingForcedSleep: true,
          logs: [{
            id: Math.random().toString(36).substr(2, 9),
            date: state.date,
            time: state.time,
            text: '理智濒临崩溃！你当场精神失序，仓皇间丢失了一半资源与能力，直到夜里才勉强把理智拉回30。'
          }, ...state.logs],
        };
      });
      if (!get().activeEvent) {
        set({ pendingForcedSleep: false });
        get().sleep();
      }
    }
  },

  addStat: (
    stat: 'strength' | 'constitution' | 'intelligence' | 'luck' | 'leadership',
    amount: number,
    source = 'default',
  ) => {
    if ((stat === 'luck' || stat === 'leadership') && source !== 'randomEvent') {
      return;
    }
    set((state) => ({ [stat]: Math.min(100, Math.max(0, state[stat] + amount)) } as any));
  },

  applyDeltas: (deltas: Delta[]) => {
    set((state) => {
      let cash = state.cash;
      let health = state.health;
      let san = state.san;
      let strength = state.strength;
      let constitution = state.constitution;
      let intelligence = state.intelligence;
      let luck = state.luck;
      let leadership = state.leadership;
      const items = { ...state.inventory.items };
      const shelter = getPrimaryProperty(state.inventory.properties);

      const addItem = (itemId: string, itemName: string, amount: number) => {
        if (!items[itemId]) {
          items[itemId] = { id: itemId, name: itemName, quantity: 0, buyPrice: 0 };
        }
        const safeAmount = amount > 0 ? clampFoodWaterAddition(items, itemId, amount, shelter) : amount;
        items[itemId].quantity += safeAmount;
        if (items[itemId].quantity <= 0) {
          delete items[itemId];
        }
      };

      const addStatValue = (key: string, amount: number) => {
        if (key === 'health') health = Math.min(100, Math.max(0, health + amount));
        else if (key === 'san') san = Math.min(100, Math.max(0, san + amount));
        else if (key === 'strength') strength = Math.min(100, Math.max(0, strength + amount));
        else if (key === 'constitution') constitution = Math.min(100, Math.max(0, constitution + amount));
        else if (key === 'intelligence') intelligence = Math.min(100, Math.max(0, intelligence + amount));
        else if (key === 'luck') luck = Math.min(100, Math.max(0, luck + amount));
        else if (key === 'leadership') leadership = Math.min(100, Math.max(0, leadership + amount));
      };

      deltas.forEach((d) => {
        if (d.type === 'cash') cash += d.amount;
        if (d.type === 'item') addItem(d.itemId, d.itemName, d.amount);
        if (d.type === 'stat') addStatValue(d.key, d.amount);
      });

      return {
        cash,
        health,
        san,
        strength,
        constitution,
        intelligence,
        luck,
        leadership,
        inventory: { ...state.inventory, items },
      };
    });

    const st = get();
    if (st.health <= 0) {
      st.die('健康归零');
      return;
    }
    if (st.san <= 0) {
      st.die('理智崩溃');
      return;
    }
    if (st.san < 5 && !st.lowSanForcedSleep) {
      get().addSan(0);
    }
  },

  startRandomEvent: (source) => {
    const st = get();
    if (st.isDead) return;
    if (!st.isDoomsday) return;
    if (st.activeEvent) return;

    const bag = st.eventBag.length > 0 ? [...st.eventBag] : buildEventBag();
    const kind = bag.shift() as EventKind;
    const candidates = DOOMSDAY_EVENTS.filter((e) => e.kind === kind && e.source === source);
    if (candidates.length === 0) {
      set({ eventBag: bag });
      return;
    }
    const def = candidates[Math.floor(Math.random() * candidates.length)];
    const ev: ActiveRandomEvent = {
      id: Math.random().toString(36).slice(2, 10),
      def,
      pages: paginateText(def.scene, 150),
      pageIndex: 0,
      stage: 'choose',
    };
    set({ activeEvent: ev, eventBag: bag });
  },

  resolveRandomEvent: (choiceId: string) => {
    const st = get();
    const active = st.activeEvent;
    if (!active) return;
    if (active.stage === 'result') return;

    const choice = active.def.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    let isSuccess: boolean | null = null;
    let outcome: EventOutcome | undefined;
    let successChance: number | undefined;
    let roll: number | undefined;

    if (choice.check) {
      successChance = computeSuccessChance(
        active.def,
        choice.check.attribute,
        choice.check.difficulty,
        {
          strength: st.strength,
          intelligence: st.intelligence,
          luck: st.luck,
          leadership: st.leadership,
        },
      );
      roll = Math.random();
      isSuccess = roll < successChance;
      outcome = isSuccess ? choice.success : choice.failure;
    } else {
      outcome = choice.always;
    }

    if (!outcome) return;

    let finalOutcome = active.def.kind === 'reward' ? boostRewardOutcome(outcome) : outcome;
    let bonusMessage: Message | null = null;
    const canSuperHarvest = active.def.kind === 'reward' && finalOutcome.deltas.some((d) => d.amount > 0);
    if (canSuperHarvest && Math.random() < 0.1) {
      const bonus = createSuperHarvestBonus();
      bonusMessage = createDoomsdayMessage();
      finalOutcome = {
        text: `${finalOutcome.text}\n\n${bonus.text}\n${bonusMessage.text}`,
        deltas: [...finalOutcome.deltas, ...bonus.deltas],
      };
    }

    get().applyDeltas(finalOutcome.deltas);
    if (bonusMessage) {
      get().addMessage(bonusMessage);
    }
    get().addLog(`【事件】${active.def.title}：${finalOutcome.text}`);

    set({
      activeEvent: {
        ...active,
        stage: 'result',
        lastResult: { choiceId, isSuccess, outcome: finalOutcome, successChance, roll },
      },
    });
  },

  closeRandomEvent: () => {
    const { pendingForcedSleep } = get();
    set({ activeEvent: null });
    if (pendingForcedSleep) {
      set({ pendingForcedSleep: false });
      get().sleep();
    }
  },

  runEventSystemTest: () => {
    let bag: EventKind[] = buildEventBag();
    let reward = 0;
    let punish = 0;

    for (let i = 0; i < 1000; i++) {
      if (bag.length === 0) bag = buildEventBag();
      const k = bag.shift() as EventKind;
      if (k === 'reward') reward += 1;
      else punish += 1;
    }

    const rewardRatio = reward / 1000;
    const punishRatio = punish / 1000;

    const samples = [
      { v: 10, name: '低' },
      { v: 50, name: '中' },
      { v: 90, name: '高' },
    ];

    const mkChance = (attr: any, v: number, diff: any) =>
      computeSuccessChance(
        DOOMSDAY_EVENTS[0],
        attr,
        diff,
        { strength: v, intelligence: v, luck: v, leadership: v },
      );

    const reportLines = [
      `随机事件系统测试报告`,
      `1) 事件比例（1000次）：奖励 ${reward} (${Math.round(rewardRatio * 1000) / 10}%) | 惩罚 ${punish} (${Math.round(punishRatio * 1000) / 10}%)`,
      `2) 成功率梯度采样（difficulty=2）：`,
      `- 力量类：${samples.map((s) => `${s.name}${Math.round(mkChance('strength', s.v, 2) * 100)}%`).join(' / ')}`,
      `- 智力类：${samples.map((s) => `${s.name}${Math.round(mkChance('intelligence', s.v, 2) * 100)}%`).join(' / ')}`,
      `- 幸运类：${samples.map((s) => `${s.name}${Math.round(mkChance('luck', s.v, 2) * 100)}%`).join(' / ')}`,
      `- 领导力类：${samples.map((s) => `${s.name}${Math.round(mkChance('leadership', s.v, 2) * 100)}%`).join(' / ')}`,
      `3) 动画与布局：弹窗固定视口展示，内容分页横向切换（需人工目测确认60fps与无纵向扩展）。`,
    ];

    const report = reportLines.join('\n');
    set({ eventTestReport: report });
    return report;
  },

  setHasExercisedToday: (val: boolean) => {
    set({ hasExercisedToday: val });
  },

  setBalanceExerciseCooldown: (val: number) => {
    set({ balanceExerciseCooldown: val });
  },

  applyDeveloperState: (patch) => {
    set((state) => {
      const nextDate = patch.date ?? state.date;
      const nextTime = patch.time ?? state.time;
      const derivedDoomsday = patch.isDoomsday ?? isOnOrAfterDoomsday(nextDate, nextTime);
      return {
        ...state,
        ...patch,
        date: nextDate,
        time: nextTime,
        itemPrices: calcItemPrices(nextDate),
        financePrices: calcFinancePrices(nextDate),
        isDoomsday: derivedDoomsday,
      };
    });
  },

  buyItem: (itemId: string, name: string, quantity: number, price: number) => {
    set((state) => {
      const newItems = { ...state.inventory.items };
      const shelter = getPrimaryProperty(state.inventory.properties);
      const actualQuantity = clampFoodWaterAddition(newItems, itemId, quantity, shelter);
      const totalCost = actualQuantity * price;
      if (actualQuantity <= 0 || state.cash < totalCost) return state;

      if (!newItems[itemId]) {
        newItems[itemId] = { id: itemId, name, quantity: 0, buyPrice: price };
      }
      // Simple average price calculation
      const oldQty = newItems[itemId].quantity;
      const oldPrice = newItems[itemId].buyPrice;
      newItems[itemId].buyPrice = (oldQty * oldPrice + totalCost) / (oldQty + actualQuantity);
      newItems[itemId].quantity += actualQuantity;

      return {
        cash: state.cash - totalCost,
        inventory: { ...state.inventory, items: newItems },
        logs: [{
          id: Math.random().toString(36).substr(2, 9),
          date: state.date,
          time: state.time,
          text: `购买了 ${actualQuantity} 份 ${name}，花费 ¥${totalCost}`
        }, ...state.logs],
      };
    });
  },

  sellItem: (itemId: string, quantity: number, price: number) => {
    set((state) => {
      const item = state.inventory.items[itemId];
      if (!item || item.quantity < quantity) return state;

      const newItems = { ...state.inventory.items };
      newItems[itemId].quantity -= quantity;
      if (newItems[itemId].quantity <= 0) {
        delete newItems[itemId];
      }

      return {
        cash: state.cash + quantity * price,
        inventory: { ...state.inventory, items: newItems },
        logs: [{
          id: Math.random().toString(36).substr(2, 9),
          date: state.date,
          time: state.time,
          text: `卖出了 ${quantity} 份 ${item.name}，获得 ¥${quantity * price}`
        }, ...state.logs],
      };
    });
  },

  consumeItem: (itemId: string, quantity: number) => {
    const state = get();
    const item = state.inventory.items[itemId];
    if (!item || item.quantity < quantity) return false;

    set((s) => {
      const newItems = { ...s.inventory.items };
      newItems[itemId].quantity -= quantity;
      if (newItems[itemId].quantity <= 0) {
        delete newItems[itemId];
      }
      return { inventory: { ...s.inventory, items: newItems } };
    });

    return true;
  },

  buyProperty: (property: Property, price: number) => {
    set((state) => {
      if (state.cash < price || state.inventory.properties.length > 0) return state;
      return {
        cash: state.cash - price,
        inventory: {
          ...state.inventory,
          properties: [createOwnedProperty(property)],
        },
        logs: [{
          id: Math.random().toString(36).substr(2, 9),
          date: state.date,
          time: state.time,
          text: `购买了地产：${property.name}，花费 ¥${price}`
        }, ...state.logs],
      };
    });
  },

  sellProperty: (propertyId: string) => {
    set((state) => {
      const property = state.inventory.properties.find((p) => p.id === propertyId);
      if (!property) return state;
      const refund = Math.floor(property.price * 0.7);
      return {
        cash: state.cash + refund,
        inventory: {
          ...state.inventory,
          properties: state.inventory.properties.filter((p) => p.id !== propertyId),
        },
        logs: [{
          id: Math.random().toString(36).substr(2, 9),
          date: state.date,
          time: state.time,
          text: `出售了地产：${property.name}，回收 ¥${refund}`
        }, ...state.logs],
      };
    });
  },

  upgradeProperty: (propertyId, direction) => {
    let upgraded = false;
    set((state) => {
      const property = state.inventory.properties.find((p) => p.id === propertyId);
      if (!property) return state;

      const levelKey = `${direction}Level` as 'structureLevel' | 'defenseLevel' | 'spaceLevel' | 'comfortLevel';
      const baseKey = `base${direction.charAt(0).toUpperCase()}${direction.slice(1)}` as 'baseStructure' | 'baseDefense' | 'baseSpace' | 'baseComfort';
      const currentLevel = property[levelKey];
      const cost = direction === 'structure' || direction === 'defense' ? currentLevel * 3 : currentLevel * 2;
      const materials = state.inventory.items['materials']?.quantity || 0;
      if (materials < cost) return state;

      const items = { ...state.inventory.items };
      if (items.materials) {
        items.materials = {
          ...items.materials,
          quantity: items.materials.quantity - cost,
        };
        if (items.materials.quantity <= 0) {
          delete items.materials;
        }
      }

      const upgradedProperty = {
        ...property,
        [levelKey]: currentLevel + 1,
        [direction]: property[direction] + property[baseKey],
        upgrades: [...property.upgrades, `${direction}-${currentLevel + 1}`],
      } as Property;

      upgraded = true;
      return {
        inventory: {
          ...state.inventory,
          items,
          properties: state.inventory.properties.map((p) => p.id === propertyId ? upgradedProperty : p),
        },
        logs: [{
          id: Math.random().toString(36).substr(2, 9),
          date: state.date,
          time: state.time,
          text: `你用 ${cost} 份建材升级了安全屋的${direction === 'structure' ? '结构' : direction === 'defense' ? '防护' : direction === 'space' ? '空间' : '舒适'}。`
        }, ...state.logs],
      };
    });
    return upgraded;
  },

  buyFinance: (assetId, quantity, price) => {
    set((state) => {
      const asset = FINANCE_ASSETS.find((x) => x.id === assetId);
      if (!asset) return state;
      const totalCost = quantity * price;
      if (quantity <= 0 || state.cash < totalCost) return state;

      const nextHoldings = { ...state.financeHoldings };
      if (!nextHoldings[assetId]) {
        nextHoldings[assetId] = {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          quantity: 0,
          buyPrice: price,
        };
      }

      const oldQty = nextHoldings[assetId].quantity;
      const oldPrice = nextHoldings[assetId].buyPrice;
      nextHoldings[assetId].buyPrice = (oldQty * oldPrice + totalCost) / (oldQty + quantity);
      nextHoldings[assetId].quantity += quantity;

      return {
        cash: state.cash - totalCost,
        financeHoldings: nextHoldings,
        logs: [{
          id: Math.random().toString(36).substr(2, 9),
          date: state.date,
          time: state.time,
          text: `买入了 ${quantity} 份 ${asset.name}，花费 ¥${totalCost}`
        }, ...state.logs],
      };
    });
  },

  sellFinance: (assetId, quantity, price) => {
    set((state) => {
      const holding = state.financeHoldings[assetId];
      if (!holding || holding.quantity < quantity || quantity <= 0) return state;
      const nextHoldings = { ...state.financeHoldings };
      nextHoldings[assetId] = { ...holding, quantity: holding.quantity - quantity };
      if (nextHoldings[assetId].quantity <= 0) {
        delete nextHoldings[assetId];
      }

      const totalGain = quantity * price;
      return {
        cash: state.cash + totalGain,
        financeHoldings: nextHoldings,
        logs: [{
          id: Math.random().toString(36).substr(2, 9),
          date: state.date,
          time: state.time,
          text: `卖出了 ${quantity} 份 ${holding.name}，获得 ¥${totalGain}`
        }, ...state.logs],
      };
    });
  },

  addMessage: (msg: Message) => {
    set((state) => ({
      currentMessages: [...state.currentMessages, msg],
    }));
  },

  addLog: (text: string) => {
    set((state) => ({
      logs: [{
        id: Math.random().toString(36).substr(2, 9),
        date: state.date,
        time: state.time,
        text
      }, ...state.logs],
    }));
  },

  die: (reason: string) => {
    set({ isDead: true, deathReason: reason });
  },

  rebirth: () => {
    set((state) => ({
      num: state.num + 1,
      date: INITIAL_DATE,
      time: 8,
      health: 100,
      san: 50,
      strength: 50,
      constitution: 50,
      intelligence: 50,
      luck: 50,
      leadership: 50,
      cash: 10000,
      inventory: {
        items: {},
        properties: [],
      },
      itemPrices: calcItemPrices(INITIAL_DATE),
      financeHoldings: {},
      financePrices: calcFinancePrices(INITIAL_DATE),
      archivedMessages: state.currentMessages.filter(m => m.source === 'doomsday'),
      currentMessages: [],
      logs: [{ id: Math.random().toString(36).substr(2, 9), date: INITIAL_DATE, time: 8, text: `第 ${state.num + 1} 次轮回开始了...` }],
      isDoomsday: false,
      isDead: false,
      deathReason: '',
      doomsdayDays: 0,
      hasExercisedToday: false,
      balanceExerciseCooldown: 0,
      lowSanForcedSleep: false,
      pendingForcedSleep: false,
      activeEvent: null,
      eventBag: buildEventBag(),
      eventTestReport: null,
    }));
  },
}));
