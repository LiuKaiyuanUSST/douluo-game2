// engine/talents.js
export const TALENT_MAP = {
  '蓝电霸王龙': {
    name: '雷电掌控',
    desc: '使用雷霆系魂技时减少1点魂力消耗。',
    onSkillCost(skill, actor) {
      if (skill.affinity === '雷霆') return Math.max(0, skill.cost - 1);
      return skill.cost;
    }
  },
  '柔骨兔': {
    name: '柔骨迅击',
    desc: '前两回合攻击距离+2。',
    onBattleStart(unit) {
      unit.talentData = { ...unit.talentData, firstTurnRangeBonus: 2 };
    }
  },
  '幽冥灵猫': {
    name: '幽冥疾步',
    desc: '攻击距离+1。',
    onBattleStart(unit) {
      unit.permanentRangeBonus = (unit.permanentRangeBonus || 0) + 1;
    }
  },
  '海神': {
    name: '海神亲和',
    desc: '使用沧澜系魂技时减少1点魂力消耗。',
    onSkillCost(skill, actor) {
      if (skill.affinity === '沧澜') return Math.max(0, skill.cost - 1);
      return skill.cost;
    }
  },
  '邪火凤凰': {
    name: '邪火余烬',
    desc: '攻击时为目标对手附加燃烧标记。',
    onAttack(attacker, defender, dmgInfo, battle) {
      if (battle) battle.addMark(defender, 'burn');
    }
  },

  '蓝银草': {
    name: '蓝银领域',
    desc: '使用缠绕时无距离限制。首回合使用缠绕可额外缠绕1名目标（只缠绕不普攻）。',
    onBattleStart(unit) {
      unit.talentData = { ...unit.talentData, extraBindAndRebornTarget: true };
    }
  },

  '奇茸通天菊': {
    name: '奇茸巨力',
    desc: '战斗开始时为自身附加巨力标记。',
    onBattleStart(unit) {
      unit.powerBonus = (unit.powerBonus || 0) + 2;
      if (unit.marks) unit.marks.push({ type: 'power_up' });
    }
  },
  '九心海棠': {
    name: '九心芬芳',
    desc: '前三回合释放治疗类魂技时额外指定1名目标。',
    onBattleStart(unit) {
      unit.talentData = { ...unit.talentData, extraHealTarget: true, healBonusTurns: 3 };
    }
  },
  '治愈权杖': {
    name: '治愈祈愿',
    desc: '前三回合释放治疗类魂技时，对每个目标以50%概率额外回复2点生命。',
    onBattleStart(unit) {
      unit.talentData = { ...unit.talentData, healExtraChance: 0.5, healExtraAmount: 2, healBonusTurns: 3 };
    }
  },
  '碧磷蛇皇': {
    name: '碧磷毒尊',
    desc: '使用蛊毒系魂技时减少1点魂力消耗。',
    onSkillCost(skill, actor) {
      if (skill.affinity === '蛊毒') return Math.max(0, skill.cost - 1);
      return skill.cost;
    }
  },
  '鬼王': {
    name: '鬼影潜行',
    desc: '攻击距离+1。',
    onBattleStart(unit) {
      unit.permanentRangeBonus = (unit.permanentRangeBonus || 0) + 1;
    }
  },
  '邪眸白虎': {
    name: '霸体',
    desc: '免疫控制。',
    onBattleStart(unit) {
      unit.immuneControl = true;
    }
  },
  '骨龙': {
    name: '骨毒反噬',
    desc: '受到攻击时为攻击方附加中毒标记。',
    onAttacked(defender, attacker, dmgInfo, battle) {
      if (attacker && attacker.alive && dmgInfo.damage > 0) {
        battle.addMark(attacker, 'poison');
      }
    }
  },
  '七杀剑': {
    name: '七杀锋芒',
    desc: '攻击命中时以50%概率额外增加2点伤害。',
    onAttack(attacker, defender, dmgInfo) {
      if (Math.random() < 0.5) dmgInfo.bonusDamage = (dmgInfo.bonusDamage || 0) + 2;
    }
  },
  '昊天锤': {
    name: '乱披风',
    desc: '攻击命中时以25%概率立即额外执行1次普通攻击。',
    onAttack(attacker, defender, dmgInfo) {
      if (Math.random() < 0.25) dmgInfo.extraAttack = true;
    }
  },
  '七宝琉璃塔': {
    name: '七宝增幅',
    desc: '使用天工系魂技时成功率翻倍。',
    onSkillEffect(actor, skill, effectProb) {
      if (skill.affinity === '天工') return effectProb * 2;
      return effectProb;
    }
  },
  '香肠': {
    name: '香肠滋补',
    desc: '前三回合释放治疗类魂技时额外指定1名目标，并对每个目标额外回复1点魂力。',
    onBattleStart(unit) {
      unit.talentData = {
        ...unit.talentData,
        extraHealTarget: true,
        healSPChance: 1.0,
        healBonusTurns: 3
      };
    }
  },
  '破魂枪': {},
  '猫鹰': {},
  '月刃': {},
  '风铃鸟': {},
  '火龙': {},
  '火焰领主': {},
  '烈火苍狼': {},
  '妖狐': {},
  '罗三炮': {},
  '碧磷蛇': {},
  '大力猩': {},
  '大力金刚熊': {}
};

export function applyTalent(unit) {
  const talent = TALENT_MAP[unit.wuhun];
  if (talent) {
    unit.talent = talent;
    unit.talentData = {};
    if (talent.onBattleStart) {
      talent.onBattleStart(unit);
    }
  }
} 