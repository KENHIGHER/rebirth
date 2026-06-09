import { ITEMS } from '../types/game';
import { RandomEventDefinition, StatKey } from '../types/randomEvent';

const I = ITEMS;

const itemDelta = (itemId: string, amount: number) => {
  const item = Object.values(I).find((x) => x.id === itemId);
  return { type: 'item' as const, itemId, itemName: item?.name || itemId, amount };
};

const statDelta = (key: StatKey, amount: number) => ({ type: 'stat' as const, key, amount });

export const DOOMSDAY_EVENTS: RandomEventDefinition[] = [
  {
    id: 'dd_reward_broken_vending',
    kind: 'reward',
    title: '破损的自动贩卖机',
    scene: '铁皮外壳被撬开，里面的零食和矿泉水散落一地。你听见远处传来犬吠。',
    source: 'explore',
    tags: ['资源获取', '机遇'],
    choices: [
      {
        id: 'take_fast',
        label: '快速扫走能拿的',
        check: { attribute: 'luck', difficulty: 1 },
        success: { text: '你手脚麻利，带走了更多补给。', deltas: [itemDelta('food', 2), itemDelta('water', 2)] },
        failure: { text: '你动作太慢，只捡到一点，脚步声逼近。', deltas: [itemDelta('food', 1), itemDelta('water', 1), statDelta('san', -2)] },
      },
      {
        id: 'leave',
        label: '放弃，立刻离开',
        always: { text: '你不贪心，保住了体力与神经。', deltas: [statDelta('san', 1)] },
      },
    ],
  },
  {
    id: 'dd_reward_rooftop_tarp',
    kind: 'reward',
    title: '屋顶的防雨篷布',
    scene: '楼顶风很大，篷布被压在水箱旁，下面还有一些工具。',
    source: 'explore',
    tags: ['建材', '耐久'],
    choices: [
      {
        id: 'haul',
        label: '硬扛回去',
        check: { attribute: 'strength', difficulty: 2 },
        success: { text: '你扛着篷布一路滑下楼梯，手臂酸痛但值得。', deltas: [itemDelta('materials', 2), statDelta('health', -5)] },
        failure: { text: '你扛不稳，摔了一跤，什么也没带走。', deltas: [statDelta('health', -15), statDelta('san', -3)] },
      },
      {
        id: 'take_tools',
        label: '只拿工具',
        always: { text: '你挑了更轻便的东西。', deltas: [itemDelta('materials', 1)] },
      },
    ],
  },
  {
    id: 'dd_reward_radio_parts',
    kind: 'reward',
    title: '短波电台的零件',
    scene: '废弃车厢里躺着一台半截的短波电台，线路勉强还通。',
    source: 'explore',
    tags: ['属性提升', '智力'],
    choices: [
      {
        id: 'repair',
        label: '尝试修好',
        check: { attribute: 'intelligence', difficulty: 2 },
        success: { text: '你接好线路，电台吱啦一声亮了。你学到了点东西。', deltas: [statDelta('intelligence', 2), statDelta('san', 1)] },
        failure: { text: '你把线路弄短路了，冒出焦臭味，心态也崩了一点。', deltas: [statDelta('san', -4)] },
      },
      {
        id: 'salvage',
        label: '拆下可用零件',
        always: { text: '你把能用的拆走，留到以后再说。', deltas: [itemDelta('materials', 1)] },
      },
    ],
  },
  {
    id: 'dd_reward_stray_dog',
    kind: 'reward',
    title: '跟随你的流浪狗',
    scene: '一条瘦狗远远跟着你。它不叫，只在你停下时抬头看你。',
    source: 'explore',
    tags: ['团队协作', '领导力'],
    choices: [
      {
        id: 'calm',
        label: '试着安抚并喂一点',
        check: { attribute: 'leadership', difficulty: 1 },
        success: { text: '它靠近了。你感觉自己不再那么孤单。', deltas: [itemDelta('food', -1), statDelta('leadership', 1), statDelta('san', 3)] },
        failure: { text: '它抢食后逃跑，你徒增失落。', deltas: [itemDelta('food', -1), statDelta('san', -2)] },
      },
      {
        id: 'ignore',
        label: '无视它',
        always: { text: '你不敢分出任何资源。', deltas: [] },
      },
    ],
  },
  {
    id: 'dd_reward_hidden_medkit',
    kind: 'reward',
    title: '柜台下的急救包',
    scene: '药店的柜台下面有个灰尘厚厚的急救包，胶布还没过期。',
    source: 'explore',
    tags: ['医疗', '资源获取'],
    choices: [
      {
        id: 'take',
        label: '带走',
        always: { text: '你把急救包塞进背包。', deltas: [itemDelta('medicine', 1), statDelta('san', 1)] },
      },
      {
        id: 'use_now',
        label: '顺便处理伤口',
        always: { text: '你简单处理，疼痛缓解了一些。', deltas: [itemDelta('medicine', 1), statDelta('health', 10)] },
      },
    ],
  },
  {
    id: 'dd_reward_black_market_cache',
    kind: 'reward',
    title: '黑市的暗格',
    scene: '你在倒塌的货架后摸到一个暗格，里面用油纸包着东西。',
    source: 'explore',
    tags: ['机遇', '幸运'],
    choices: [
      {
        id: 'open',
        label: '打开看看',
        check: { attribute: 'luck', difficulty: 2 },
        success: { text: '你摸到的是干净的燃料罐。', deltas: [itemDelta('fuel', 2)] },
        failure: { text: '你摸到的是腐烂的东西，恶臭让你反胃。', deltas: [statDelta('san', -6)] },
      },
      {
        id: 'leave',
        label: '不碰，快走',
        always: { text: '你不想在这种地方赌命。', deltas: [statDelta('san', 1)] },
      },
    ],
  },
  {
    id: 'dd_reward_library_notes',
    kind: 'reward',
    title: '图书馆的笔记本',
    scene: '一摞潮湿的笔记本夹在书架缝里，有人把路线和物资清单写得很详细。',
    source: 'explore',
    tags: ['智力', '线索'],
    choices: [
      {
        id: 'read',
        label: '仔细翻阅',
        check: { attribute: 'intelligence', difficulty: 1 },
        success: { text: '你整理出一套更有效的搜刮方法。', deltas: [statDelta('intelligence', 1), statDelta('luck', 1)] },
        failure: { text: '纸太潮，你看得头疼，记住的不多。', deltas: [statDelta('san', -2)] },
      },
      {
        id: 'take',
        label: '直接带走',
        always: { text: '你先收起来，等回去再看。', deltas: [statDelta('san', 1)] },
      },
    ],
  },
  {
    id: 'dd_reward_water_tank',
    kind: 'reward',
    title: '楼顶水箱还有余水',
    scene: '水箱锈得厉害，但里面还有一点沉淀后相对清澈的水。',
    source: 'explore',
    tags: ['资源获取', '水'],
    choices: [
      {
        id: 'filter',
        label: '尽量过滤再装走',
        check: { attribute: 'intelligence', difficulty: 2 },
        success: { text: '你用布和炭灰过滤，装走了更多水。', deltas: [itemDelta('water', 3), statDelta('san', 1)] },
        failure: { text: '你过滤得不够，喝下去胃里翻腾。', deltas: [itemDelta('water', 2), statDelta('health', -10)] },
      },
      {
        id: 'skip',
        label: '不冒险',
        always: { text: '你担心感染，选择离开。', deltas: [] },
      },
    ],
  },
  {
    id: 'dd_reward_abandoned_cart',
    kind: 'reward',
    title: '遗弃的购物车',
    scene: '购物车翻倒在路边，里面还有没被翻走的袋子。',
    source: 'explore',
    tags: ['资源获取', '机遇'],
    choices: [
      {
        id: 'check',
        label: '翻找',
        check: { attribute: 'luck', difficulty: 1 },
        success: { text: '你找到还能吃的罐头。', deltas: [itemDelta('food', 2)] },
        failure: { text: '你翻到一堆碎玻璃，手指被割伤。', deltas: [statDelta('health', -8)] },
      },
    ],
  },
  {
    id: 'dd_reward_street_fight',
    kind: 'reward',
    title: '巷口的争斗',
    scene: '两个拾荒者在抢一个袋子。你靠近时，他们同时看向你。',
    source: 'explore',
    tags: ['冲突', '力量'],
    choices: [
      {
        id: 'intimidate',
        label: '强硬喝止',
        check: { attribute: 'strength', difficulty: 2 },
        success: { text: '他们退开了，你拿走了袋子里的补给。', deltas: [itemDelta('food', 1), itemDelta('water', 1), statDelta('san', -1)] },
        failure: { text: '你被围住推搡，狼狈撤退。', deltas: [statDelta('health', -15), statDelta('san', -4)] },
      },
      {
        id: 'mediate',
        label: '试着调停',
        check: { attribute: 'leadership', difficulty: 2 },
        success: { text: '你让他们各退一步，拿到一些“报酬”。', deltas: [itemDelta('water', 1), statDelta('leadership', 1)] },
        failure: { text: '没人听你说话，你只好退走。', deltas: [statDelta('san', -2)] },
      },
    ],
  },
  {
    id: 'dd_punish_ambush',
    kind: 'punish',
    title: '废墟里的伏击',
    scene: '你刚转过拐角，阴影里就有人冲出来。对方的刀刃闪着冷光。',
    source: 'explore',
    tags: ['灾难', '受伤'],
    choices: [
      {
        id: 'fight',
        label: '反击',
        check: { attribute: 'strength', difficulty: 3 },
        success: { text: '你拼命逼退对方，但也挂了彩。', deltas: [statDelta('health', -20), statDelta('san', -6), itemDelta('food', 1)] },
        failure: { text: '你被刺伤倒地，血流不止。', deltas: [statDelta('health', -45), statDelta('san', -10)] },
      },
      {
        id: 'run',
        label: '立刻逃跑',
        check: { attribute: 'luck', difficulty: 2 },
        success: { text: '你冲进小巷甩掉对方，背包却被撕开。', deltas: [itemDelta('water', -1), statDelta('san', -4)] },
        failure: { text: '你被追上摔倒，重重磕在碎石上。', deltas: [statDelta('health', -35), statDelta('san', -8)] },
      },
    ],
  },
  {
    id: 'dd_punish_toxic_smoke',
    kind: 'punish',
    title: '刺鼻的有毒烟雾',
    scene: '一股化学味从地下涌出，喉咙像被砂纸刮过。',
    source: 'explore',
    tags: ['灾难', '减益'],
    choices: [
      {
        id: 'hold_breath',
        label: '屏息穿过',
        check: { attribute: 'luck', difficulty: 2 },
        success: { text: '你憋着气冲过去，眼泪直流。', deltas: [statDelta('health', -10), statDelta('san', -3)] },
        failure: { text: '你咳到失控，胸口发痛。', deltas: [statDelta('health', -25), statDelta('san', -6)] },
      },
      {
        id: 'detour',
        label: '绕路离开',
        always: { text: '你避开了最危险的气团，但时间被浪费。', deltas: [statDelta('san', -2)] },
      },
    ],
  },
  {
    id: 'dd_punish_raid',
    kind: 'punish',
    title: '被搜刮过的仓库',
    scene: '你到得太晚，仓库里只剩空箱子和散落的弹壳。有人刚走不久。',
    source: 'explore',
    tags: ['挫败', '损失'],
    choices: [
      {
        id: 'chase',
        label: '追上去试试',
        check: { attribute: 'luck', difficulty: 3 },
        success: { text: '你捡到他们丢下的一小包补给。', deltas: [itemDelta('water', 1), statDelta('san', -2)] },
        failure: { text: '你追错方向，差点迷路。', deltas: [statDelta('san', -6)] },
      },
      {
        id: 'accept',
        label: '接受现实，回去',
        always: { text: '你咬牙忍住沮丧。', deltas: [statDelta('san', -3)] },
      },
    ],
  },
  {
    id: 'dd_punish_collapse',
    kind: 'punish',
    title: '楼板塌陷',
    scene: '你脚下一空，整层楼板像烂纸一样碎开。',
    source: 'explore',
    tags: ['受伤', '灾难'],
    choices: [
      {
        id: 'grab',
        label: '抓住边缘',
        check: { attribute: 'strength', difficulty: 2 },
        success: { text: '你死死抓住钢筋，拖着身子爬上来。', deltas: [statDelta('health', -15), statDelta('san', -4)] },
        failure: { text: '你摔得头昏眼花，身上到处是伤。', deltas: [statDelta('health', -35), statDelta('san', -8)] },
      },
    ],
  },
  {
    id: 'dd_punish_nightmares',
    kind: 'punish',
    title: '挥之不去的噩梦',
    scene: '你看到的血与黑影在脑子里回放，连呼吸都变得困难。',
    source: 'explore',
    tags: ['精神压力', '减益'],
    choices: [
      {
        id: 'grounding',
        label: '强迫自己冷静',
        check: { attribute: 'intelligence', difficulty: 2 },
        success: { text: '你用规律呼吸把自己拉回现实。', deltas: [statDelta('san', -2)] },
        failure: { text: '你越想控制越崩溃。', deltas: [statDelta('san', -10)] },
      },
      {
        id: 'push_on',
        label: '硬扛着继续',
        always: { text: '你继续前进，但手在发抖。', deltas: [statDelta('san', -6)] },
      },
    ],
  },
];
