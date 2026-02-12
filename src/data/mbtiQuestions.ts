export type Dimension = 'E/I' | 'S/N' | 'T/F' | 'J/P';

export interface Question {
  id: number;
  dimension: Dimension;
  question: string;
  options: [
    { label: 'A', text: string, value: string },
    { label: 'B', text: string, value: string }
  ];
}

export const questions: Question[] = [
  // E/I Dimension
  {
    id: 1,
    dimension: 'E/I',
    question: '教会聚会结束后，你通常会：',
    options: [
      { label: 'A', text: '继续和人聊天交流', value: 'E' },
      { label: 'B', text: '安静离开或独自反思', value: 'I' }
    ]
  },
  {
    id: 2,
    dimension: 'E/I',
    question: '你在服事中更容易感到被充电的是：',
    options: [
      { label: 'A', text: '与人一起配搭', value: 'E' },
      { label: 'B', text: '独立完成任务', value: 'I' }
    ]
  },
  {
    id: 3,
    dimension: 'E/I',
    question: '小组中出现冷场时，你会：',
    options: [
      { label: 'A', text: '主动打破沉默', value: 'E' },
      { label: 'B', text: '等别人先开口', value: 'I' }
    ]
  },
  {
    id: 4,
    dimension: 'E/I',
    question: '你更享受的服事方式是：',
    options: [
      { label: 'A', text: '站在台前', value: 'E' },
      { label: 'B', text: '在幕后支持', value: 'I' }
    ]
  },
  {
    id: 5,
    dimension: 'E/I',
    question: '你在教会中结识新朋友通常：',
    options: [
      { label: 'A', text: '很自然', value: 'E' },
      { label: 'B', text: '需要时间', value: 'I' }
    ]
  },
  {
    id: 6,
    dimension: 'E/I',
    question: '听完一篇道后，你更可能：',
    options: [
      { label: 'A', text: '立刻找人讨论', value: 'E' },
      { label: 'B', text: '回去慢慢消化', value: 'I' }
    ]
  },
  {
    id: 7,
    dimension: 'E/I',
    question: '祷告会中你更常：',
    options: [
      { label: 'A', text: '开口祷告', value: 'E' },
      { label: 'B', text: '默祷', value: 'I' }
    ]
  },
  {
    id: 8,
    dimension: 'E/I',
    question: '你更适合的角色是：',
    options: [
      { label: 'A', text: '带动气氛', value: 'E' },
      { label: 'B', text: '稳定氛围', value: 'I' }
    ]
  },
  {
    id: 9,
    dimension: 'E/I',
    question: '你更容易被别人评价为：',
    options: [
      { label: 'A', text: '热情主动', value: 'E' },
      { label: 'B', text: '安静可靠', value: 'I' }
    ]
  },
  {
    id: 10,
    dimension: 'E/I',
    question: '多人服事 vs 独立服事，你更偏向：',
    options: [
      { label: 'A', text: '多人', value: 'E' },
      { label: 'B', text: '独立', value: 'I' }
    ]
  },

  // S/N Dimension
  {
    id: 11,
    dimension: 'S/N',
    question: '听见证时你更关注：',
    options: [
      { label: 'A', text: '具体发生了什么', value: 'S' },
      { label: 'B', text: '神在其中的意义', value: 'N' }
    ]
  },
  {
    id: 12,
    dimension: 'S/N',
    question: '你更容易被什么吸引：',
    options: [
      { label: 'A', text: '实际可行的方法', value: 'S' },
      { label: 'B', text: '未来的异象蓝图', value: 'N' }
    ]
  },
  {
    id: 13,
    dimension: 'S/N',
    question: '你读圣经时更在意：',
    options: [
      { label: 'A', text: '经文背景和细节', value: 'S' },
      { label: 'B', text: '属灵象征与预表', value: 'N' }
    ]
  },
  {
    id: 14,
    dimension: 'S/N',
    question: '面对新事工你更关心：',
    options: [
      { label: 'A', text: '能不能落地', value: 'S' },
      { label: 'B', text: '是否合神心意', value: 'N' }
    ]
  },
  {
    id: 15,
    dimension: 'S/N',
    question: '你更常被形容为：',
    options: [
      { label: 'A', text: '脚踏实地', value: 'S' },
      { label: 'B', text: '有异象感', value: 'N' }
    ]
  },
  {
    id: 16,
    dimension: 'S/N',
    question: '你做决定时更依赖：',
    options: [
      { label: 'A', text: '过往经验', value: 'S' },
      { label: 'B', text: '内心感动', value: 'N' }
    ]
  },
  {
    id: 17,
    dimension: 'S/N',
    question: '你更擅长：',
    options: [
      { label: 'A', text: '把事情做好', value: 'S' },
      { label: 'B', text: '提出方向', value: 'N' }
    ]
  },
  {
    id: 18,
    dimension: 'S/N',
    question: '你更容易注意到：',
    options: [
      { label: 'A', text: '现实问题', value: 'S' },
      { label: 'B', text: '潜在可能', value: 'N' }
    ]
  },
  {
    id: 19,
    dimension: 'S/N',
    question: '你更看重：',
    options: [
      { label: 'A', text: '当下责任', value: 'S' },
      { label: 'B', text: '长远使命', value: 'N' }
    ]
  },
  {
    id: 20,
    dimension: 'S/N',
    question: '你更享受的分享内容是：',
    options: [
      { label: 'A', text: '实用教导', value: 'S' },
      { label: 'B', text: '属灵启示', value: 'N' }
    ]
  },

  // T/F Dimension
  {
    id: 21,
    dimension: 'T/F',
    question: '当有人犯错时你更先想到：',
    options: [
      { label: 'A', text: '事情对不对', value: 'T' },
      { label: 'B', text: '人受不受伤', value: 'F' }
    ]
  },
  {
    id: 22,
    dimension: 'T/F',
    question: '你做决定时更看重：',
    options: [
      { label: 'A', text: '原则与逻辑', value: 'T' },
      { label: 'B', text: '感受与关系', value: 'F' }
    ]
  },
  {
    id: 23,
    dimension: 'T/F',
    question: '你更容易被评价为：',
    options: [
      { label: 'A', text: '理性清楚', value: 'T' },
      { label: 'B', text: '温柔体贴', value: 'F' }
    ]
  },
  {
    id: 24,
    dimension: 'T/F',
    question: '你劝勉别人时更倾向：',
    options: [
      { label: 'A', text: '直指问题', value: 'T' },
      { label: 'B', text: '先共情安慰', value: 'F' }
    ]
  },
  {
    id: 25,
    dimension: 'T/F',
    question: '你更在意：',
    options: [
      { label: 'A', text: '是否合真理', value: 'T' },
      { label: 'B', text: '是否让人被爱', value: 'F' }
    ]
  },
  {
    id: 26,
    dimension: 'T/F',
    question: '面对冲突你更可能：',
    options: [
      { label: 'A', text: '讨论是非', value: 'T' },
      { label: 'B', text: '调解情绪', value: 'F' }
    ]
  },
  {
    id: 27,
    dimension: 'T/F',
    question: '你更容易被打动的是：',
    options: [
      { label: 'A', text: '公义的呼召', value: 'T' },
      { label: 'B', text: '爱的故事', value: 'F' }
    ]
  },
  {
    id: 28,
    dimension: 'T/F',
    question: '你更习惯用什么方式影响人：',
    options: [
      { label: 'A', text: '说服', value: 'T' },
      { label: 'B', text: '感染', value: 'F' }
    ]
  },
  {
    id: 29,
    dimension: 'T/F',
    question: '你觉得服事中更重要的是：',
    options: [
      { label: 'A', text: '正确方向', value: 'T' },
      { label: 'B', text: '合一关系', value: 'F' }
    ]
  },
  {
    id: 30,
    dimension: 'T/F',
    question: '你更害怕自己：',
    options: [
      { label: 'A', text: '做错决定', value: 'T' },
      { label: 'B', text: '伤到别人', value: 'F' }
    ]
  },

  // J/P Dimension
  {
    id: 31,
    dimension: 'J/P',
    question: '服事前你更喜欢：',
    options: [
      { label: 'A', text: '提前安排好', value: 'J' },
      { label: 'B', text: '随机应变', value: 'P' }
    ]
  },
  {
    id: 32,
    dimension: 'J/P',
    question: '面对行程你更舒服的是：',
    options: [
      { label: 'A', text: '有清晰计划', value: 'J' },
      { label: 'B', text: '保持弹性', value: 'P' }
    ]
  },
  {
    id: 33,
    dimension: 'J/P',
    question: '你对突发变动的反应是：',
    options: [
      { label: 'A', text: '不太适应', value: 'J' },
      { label: 'B', text: '很自然', value: 'P' }
    ]
  },
  {
    id: 34,
    dimension: 'J/P',
    question: '你更喜欢：',
    options: [
      { label: 'A', text: '有明确目标', value: 'J' },
      { label: 'B', text: '开放可能', value: 'P' }
    ]
  },
  {
    id: 35,
    dimension: 'J/P',
    question: '你通常：',
    options: [
      { label: 'A', text: '先完成再放松', value: 'J' },
      { label: 'B', text: '边走边调整', value: 'P' }
    ]
  },
  {
    id: 36,
    dimension: 'J/P',
    question: '你更像：',
    options: [
      { label: 'A', text: '管理者', value: 'J' },
      { label: 'B', text: '参与者', value: 'P' }
    ]
  },
  {
    id: 37,
    dimension: 'J/P',
    question: '你更容易被称为：',
    options: [
      { label: 'A', text: '可靠守时', value: 'J' },
      { label: 'B', text: '自由灵活', value: 'P' }
    ]
  },
  {
    id: 38,
    dimension: 'J/P',
    question: '面对deadline你会：',
    options: [
      { label: 'A', text: '提前完成', value: 'J' },
      { label: 'B', text: '最后冲刺', value: 'P' }
    ]
  },
  {
    id: 39,
    dimension: 'J/P',
    question: '你更看重：',
    options: [
      { label: 'A', text: '秩序', value: 'J' },
      { label: 'B', text: '流动', value: 'P' }
    ]
  },
  {
    id: 40,
    dimension: 'J/P',
    question: '你更相信：',
    options: [
      { label: 'A', text: '神通过计划工作', value: 'J' },
      { label: 'B', text: '神通过当下带领工作', value: 'P' }
    ]
  }
];
