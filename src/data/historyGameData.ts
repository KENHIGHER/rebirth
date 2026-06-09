import { Badge, ChapterStage, CharacterCard } from '../types/historyGame';

export const characterCards: CharacterCard[] = [
  {
    id: 'li-dazhao',
    name: '李大钊',
    title: '信仰播火者',
    description: '他以先进思想唤醒青年，推动马克思主义在中国传播，为建党事业奠定思想基础。',
  },
  {
    id: 'zhou-enlai',
    name: '周恩来',
    title: '长征组织者',
    description: '在革命危急关头坚持理想与组织纪律，展现了卓越的统筹能力与坚定信念。',
  },
  {
    id: 'dong-biwu',
    name: '董必武',
    title: '曙光见证人',
    description: '从建党初期一路走来，见证民族独立与人民解放，体现了初心不改的革命品格。',
  },
];

export const badges: Badge[] = [
  {
    id: 'first-light',
    name: '初心如磐',
    description: '完成第一章，迈出红色经典旅程的第一步。',
  },
  {
    id: 'long-march',
    name: '长征先锋',
    description: '完成第二章，在艰难抉择中保持坚定方向。',
  },
  {
    id: 'inherit-fire',
    name: '薪火传承',
    description: '通关全部章节，点亮党史长卷。',
  },
  {
    id: 'full-belief',
    name: '信念满格',
    description: '任意时刻将信念值保持在 100。',
  },
  {
    id: 'perfect-score',
    name: '党史小先生',
    description: '所有答题全部正确，获得完美成绩。',
  },
];

export const chapters: ChapterStage[] = [
  {
    id: 'nanhu',
    title: '南湖启航',
    year: '1921',
    theme: '开天辟地',
    narrative: [
      '夜色沉沉，石库门里灯火微明，一群怀抱理想的人正在激烈讨论民族命运。',
      '局势复杂，环境并不安全，但越是风雨如晦，越要有人点燃信仰之火。',
      '你将化身青年记录者，帮助大家守护会场秩序，并在关键时刻做出判断。',
    ],
    quote: '“伟大的开端，往往始于最不平凡的坚守。”',
    choicePrompt: '会场外出现可疑动静，此时你应该如何行动？',
    choiceOptions: [
      {
        id: 'nanhu-a',
        label: '冷静转移联络，优先保证会议继续进行',
        consequence: '你迅速协助转移并保护资料，保障了重要会议顺利延续，信念更加坚定。',
        beliefDelta: 12,
        scoreDelta: 25,
        isCorrect: true,
      },
      {
        id: 'nanhu-b',
        label: '原地等待观察，不主动处理风险',
        consequence: '迟疑让会场短暂陷入被动，虽然局势最终稳住，但你意识到革命行动需要更强的担当。',
        beliefDelta: -8,
        scoreDelta: 8,
        isCorrect: false,
      },
    ],
    quiz: [
      {
        id: 'nanhu-q1',
        prompt: '中国共产党第一次全国代表大会最终完成会议议程的重要地点是哪里？',
        options: [
          { id: 'a', text: '上海外滩' },
          { id: 'b', text: '嘉兴南湖红船' },
          { id: 'c', text: '广州黄埔' },
          { id: 'd', text: '武汉长江边' },
        ],
        answerId: 'b',
        explanation: '中共一大后期转移到浙江嘉兴南湖的一艘游船上继续举行，因此“红船”成为重要的精神象征。',
      },
      {
        id: 'nanhu-q2',
        prompt: '“红船精神”所体现的核心内涵，不包括以下哪一项？',
        options: [
          { id: 'a', text: '开天辟地、敢为人先' },
          { id: 'b', text: '坚定理想、百折不挠' },
          { id: 'c', text: '立党为公、忠诚为民' },
          { id: 'd', text: '享乐至上、安于现状' },
        ],
        answerId: 'd',
        explanation: '“红船精神”强调的是首创、奋斗和奉献，绝不可能与安于现状、享乐主义相联系。',
      },
      {
        id: 'nanhu-q3',
        prompt: '中共一大的召开，标志着什么？',
        options: [
          { id: 'a', text: '中国共产党正式成立' },
          { id: 'b', text: '抗日战争全面爆发' },
          { id: 'c', text: '中华人民共和国成立' },
          { id: 'd', text: '土地改革全面完成' },
        ],
        answerId: 'a',
        explanation: '1921 年中共一大的召开，是中国共产党正式成立的标志，具有开天辟地的大事变意义。',
      },
    ],
    unlockCharacterId: 'li-dazhao',
    summary: '从南湖启航开始，中国革命有了坚强领导核心，也由此点燃了改变中国命运的星火。',
  },
  {
    id: 'changzheng',
    title: '长征抉择',
    year: '1935',
    theme: '信念征途',
    narrative: [
      '群山连绵，风雪扑面，队伍已经连续行军多日。体力在流失，意志却不能倒下。',
      '在极端困难条件下，每一个选择都关系到队伍去向与革命前途。',
      '你将协助传递命令、稳定士气，在险境中见证革命精神如何锻造成钢。',
    ],
    quote: '“长征是宣言书，长征是宣传队，长征是播种机。”',
    choicePrompt: '粮草紧张、道路险阻时，最关键的选择是什么？',
    choiceOptions: [
      {
        id: 'cz-a',
        label: '服从统一指挥，优先保证大部队战略方向',
        consequence: '你协助传递命令，队伍在统一意志下凝聚力量，险境中更显坚定。',
        beliefDelta: 10,
        scoreDelta: 25,
        isCorrect: true,
      },
      {
        id: 'cz-b',
        label: '各自分散寻找出路，优先顾及局部安全',
        consequence: '分散行动看似灵活，却会削弱整体战斗力，你更加明白纪律和团结的重要性。',
        beliefDelta: -10,
        scoreDelta: 8,
        isCorrect: false,
      },
    ],
    quiz: [
      {
        id: 'cz-q1',
        prompt: '遵义会议在中国革命历史上的重大意义是？',
        options: [
          { id: 'a', text: '开始全面抗战' },
          { id: 'b', text: '确立了党对军队的绝对领导' },
          { id: 'c', text: '在危急关头事实上确立了正确领导' },
          { id: 'd', text: '宣布新中国成立' },
        ],
        answerId: 'c',
        explanation: '遵义会议是在长征途中召开的重要会议，在危急关头挽救了党、红军和中国革命。',
      },
      {
        id: 'cz-q2',
        prompt: '长征精神最能体现下列哪种品质？',
        options: [
          { id: 'a', text: '理想信念坚定、百折不挠' },
          { id: 'b', text: '因循守旧、消极等待' },
          { id: 'c', text: '个人主义至上' },
          { id: 'd', text: '只顾眼前得失' },
        ],
        answerId: 'a',
        explanation: '长征精神的核心在于坚定理想信念、顾全大局、严守纪律、紧密团结。',
      },
      {
        id: 'cz-q3',
        prompt: '红军长征胜利会师的标志性事件是？',
        options: [
          { id: 'a', text: '飞夺泸定桥' },
          { id: 'b', text: '三大主力红军会师' },
          { id: 'c', text: '渡过金沙江' },
          { id: 'd', text: '攻克锦州' },
        ],
        answerId: 'b',
        explanation: '1936 年三大主力红军会师，标志着长征取得伟大胜利。',
      },
    ],
    unlockCharacterId: 'zhou-enlai',
    summary: '长征用事实证明，坚定的理想信念和严密的组织纪律，是战胜艰难险阻的根本保证。',
  },
  {
    id: 'dawn',
    title: '曙光新生',
    year: '1949',
    theme: '人民胜利',
    narrative: [
      '黎明前的城市仍旧紧张，但新的希望已经在街巷间传递，人们期待一个崭新时代到来。',
      '你走入人群，记录普通百姓对和平、独立与新生活的热望。',
      '经历过漫长奋斗后，历史即将翻开新的一页，而你的选择也将决定这段旅程的最终成绩。',
    ],
    quote: '“人民就是江山，江山就是人民。”',
    choicePrompt: '面对胜利前夕最珍贵的成果，你应当坚持什么？',
    choiceOptions: [
      {
        id: 'dawn-a',
        label: '坚持人民立场，把胜利果实交给人民',
        consequence: '你把关注点放在人民需要上，真正理解了革命的出发点和落脚点。',
        beliefDelta: 10,
        scoreDelta: 30,
        isCorrect: true,
      },
      {
        id: 'dawn-b',
        label: '只关注个人功劳和一时荣誉',
        consequence: '历史从来不是个人表演，你在反思中更加懂得“为人民而奋斗”的意义。',
        beliefDelta: -12,
        scoreDelta: 6,
        isCorrect: false,
      },
    ],
    quiz: [
      {
        id: 'dawn-q1',
        prompt: '中华人民共和国成立于哪一年？',
        options: [
          { id: 'a', text: '1921 年' },
          { id: 'b', text: '1937 年' },
          { id: 'c', text: '1945 年' },
          { id: 'd', text: '1949 年' },
        ],
        answerId: 'd',
        explanation: '1949 年 10 月 1 日，中华人民共和国中央人民政府成立，开辟了中国历史新纪元。',
      },
      {
        id: 'dawn-q2',
        prompt: '中国共产党领导人民取得全国胜利的重要根本原因之一是？',
        options: [
          { id: 'a', text: '始终代表最广大人民根本利益' },
          { id: 'b', text: '依赖少数特权阶层' },
          { id: 'c', text: '远离群众' },
          { id: 'd', text: '放弃独立自主' },
        ],
        answerId: 'a',
        explanation: '党始终坚持人民立场，紧紧依靠人民，这是取得革命胜利的重要根本原因。',
      },
      {
        id: 'dawn-q3',
        prompt: '新中国成立的历史意义不包括哪一项？',
        options: [
          { id: 'a', text: '实现民族独立和人民解放' },
          { id: 'b', text: '中国人民从此站起来了' },
          { id: 'c', text: '为国家发展进步奠定基础' },
          { id: 'd', text: '标志着中国进入殖民统治时期' },
        ],
        answerId: 'd',
        explanation: '新中国成立意味着摆脱压迫和半殖民地半封建局面，绝不是进入殖民统治时期。',
      },
    ],
    unlockCharacterId: 'dong-biwu',
    summary: '新中国的成立，是无数革命先辈和人民群众共同奋斗的成果，也标志着中国发展进入崭新阶段。',
  },
];
