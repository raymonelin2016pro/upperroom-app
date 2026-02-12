export interface MbtiResult {
  type: string;
  name: string; // e.g., 使徒保罗型
  character: string; // e.g., 使徒保罗
  keywords: string[];
  description: string;
  ministry: string[];
  quote?: string;
}

export const mbtiResults: Record<string, MbtiResult> = {
  // Image 1
  ENFJ: {
    type: 'ENFJ',
    name: '使徒保罗型',
    character: '使徒保罗',
    keywords: ['使命', '带领', '建立'],
    description: '你有强烈的呼召感，擅长激励他人，为真理而活。',
    ministry: ['带领', '教导', '开拓型事工'],
    quote: '“我却不以性命为念，只要行完我的路程。”'
  },
  ENTJ: {
    type: 'ENTJ',
    name: '摩西型',
    character: '摩西',
    keywords: ['权柄', '组织', '执行'],
    description: '你善于承担责任，在混乱中建立秩序。',
    ministry: ['核心同工', '事工统筹']
  },
  ENFP: {
    type: 'ENFP',
    name: '大卫型',
    character: '大卫',
    keywords: ['热情', '敬拜', '感染力'],
    description: '你情感丰富，对神真实敞开。',
    ministry: ['敬拜', '见证', '关怀']
  },
  ENTP: {
    type: 'ENTP',
    name: '彼得型',
    character: '彼得',
    keywords: ['行动', '突破', '勇敢'],
    description: '你愿意尝试、敢走在前面。',
    ministry: ['外展', '行动事工']
  },
  INFJ: {
    type: 'INFJ',
    name: '耶利米型',
    character: '耶利米',
    keywords: ['洞察', '负担', '深度'],
    description: '你对属灵状态极其敏锐。',
    ministry: ['代祷', '辅导', '牧养']
  },

  // Image 2
  INFP: {
    type: 'INFP',
    name: '使徒约翰型',
    character: '使徒约翰',
    keywords: ['爱', '深情', '属灵感受'],
    description: '你看重关系与真实。',
    ministry: ['陪伴', '文字', '灵修']
  },
  INTJ: {
    type: 'INTJ',
    name: '尼希米型',
    character: '尼希米',
    keywords: ['策略', '重建', '坚定'],
    description: '你能看见结构性问题并解决。',
    ministry: ['规划', '长期建设']
  },
  INTP: {
    type: 'INTP',
    name: '所罗门型',
    character: '所罗门',
    keywords: ['思考', '智慧', '分析'],
    description: '你追求真理的本质。',
    ministry: ['查经', '神学', '思辨']
  },
  ESFJ: {
    type: 'ESFJ',
    name: '巴拿巴型',
    character: '巴拿巴',
    keywords: ['鼓励', '连接', '支持'],
    description: '你让人感到被接纳。',
    ministry: ['关怀', '陪伴']
  },
  ESTJ: {
    type: 'ESTJ',
    name: '约书亚型',
    character: '约书亚',
    keywords: ['执行', '果断', '忠心'],
    description: '你把使命落到行动。',
    ministry: ['执行负责人']
  },
  ISFJ: {
    type: 'ISFJ',
    name: '马利亚（耶稣母亲）型',
    character: '马利亚（耶稣母亲）',
    keywords: ['顺服', '忠心', '默默付出'],
    description: '你安静却极其重要。',
    ministry: ['后勤', '照顾']
  },

  // Image 3
  ISTJ: {
    type: 'ISTJ',
    name: '但以理型',
    character: '但以理',
    keywords: ['纪律', '原则', '忠诚'],
    description: '你在压力中仍站立得稳。',
    ministry: ['秩序维护', '榜样']
  },
  ESFP: {
    type: 'ESFP',
    name: '撒玛利亚妇人型',
    character: '撒玛利亚妇人',
    keywords: ['真实', '生命见证'],
    description: '你的人生故事能祝福别人。',
    ministry: ['见证', '外展']
  },
  ISFP: {
    type: 'ISFP',
    name: '路得型',
    character: '路得',
    keywords: ['忠诚', '温柔', '行动的爱'],
    description: '你用行动回应呼召。',
    ministry: ['实际关怀', '具体服事'] // Inferred
  },
  ESTP: {
    type: 'ESTP',
    name: '参孙型', // Note: ⚠️提醒型 in image, treated as subtype or note
    character: '参孙',
    keywords: ['力量', '冲动', '潜力'],
    description: '你有很强行动力，但需要节制。',
    ministry: ['突击任务', '体力服事'] // Inferred
  },
  ISTP: {
    type: 'ISTP',
    name: '基甸型',
    character: '基甸',
    keywords: ['谨慎', '行动派'],
    description: '你在软弱中经历神的使用。',
    ministry: ['技术支持', '策略执行'] // Inferred
  }
};
