// engine/battleInit.js
import { calcDerivedStats, recalcDerivedStats } from './battleUtils.js';
import { applyTalent } from './talents.js';
import { app } from './gameState.js';
import { PASSIVE_SKILLS } from './skills.js';


export function initUnit(character, side, maxLevel) {
  // character: 包含 wuhun, level 等字段的角色对象
  const wuhun = app.wuhunDatabase[character.wuhun];
  if (!wuhun) {
    console.error(`武魂 ${character.wuhun} 不存在`);
    // 后备默认
    const stats = calcDerivedStats(2, 2, 2);
    return {
      ...character,
      force: stats.force,
      speed: stats.speed,
      intel: stats.intel,
      hp: character.hp || stats.maxHp,
      maxHp: stats.maxHp,
      alive: character.alive !== false,
      spirit: 0,
      maxSpirit: 3,
      side,
      gridRow: 0,
      gridCol: 0,
      affinityUsed: '巨兽',
      color: character.color || '#4a90e2',
      skillIds: character.skills || [],
      attackRange: stats.attackRange,
      damageMin: stats.damageMin,
      damageMax: stats.damageMax,
      defenseType: stats.defenseType,
      spiritRecovery: stats.spiritRecovery,
      powerBonus: 0,
      speedBonus: 0,
      intelligenceBonus: 0,
      immuneControl: false,
      talent: null,
      talentData: {},
      marks: [],
      permanentBuffs: {},
      permanentRangeBonus: 0,
      wuhun: character.wuhun
    };
  }

  const level = character.level || 1;
  const levelDiff = maxLevel - level;
  const stats = calcDerivedStats(wuhun.baseForce, wuhun.baseSpeed, wuhun.baseIntelligence, levelDiff);

  const currentHp = character.hp !== undefined ? Math.min(character.hp, stats.maxHp) : stats.maxHp;

  const newUnit = {
    name: character.name,
    wuhun: character.wuhun,        // 保存武魂名，用于绘制等
    level: level,                  // 保存等级
    force: stats.force,
    speed: stats.speed,
    intel: stats.intel,
    hp: currentHp,
    maxHp: stats.maxHp,
    alive: currentHp > 0,
    spirit: 0,
    maxSpirit: 3,
    side,
    gridRow: 0,
    gridCol: 0,
    affinityUsed: character.chosenAffinity || wuhun.mainAffinity,
    mainAffinity: wuhun.mainAffinity,
    subAffinity: character.subAffinity || wuhun.subAffinity,

    color: character.color || (side === 'player' ? '#4a90e2' : '#e74c3c'),
    skillIds: character.skills || [],
    attackRange: stats.attackRange,
    damageMin: stats.damageMin,
    damageMax: stats.damageMax,
    defenseType: stats.defenseType,
    spiritRecovery: stats.spiritRecovery,
    powerBonus: 0,
    speedBonus: 0,
    intelligenceBonus: 0,
    immuneControl: false,
    talent: null,
    talentData: {},
    marks: [],
    permanentBuffs: {},
    permanentRangeBonus: 0,
    // 保留原始角色引用以便更新（如果需要）
    _characterRef: character,
    // 复制特殊标记
    _useShieldFirst: character._useShieldFirst || false
  };


  applyTalent(newUnit);
  // 应用被动技能（增力/增速/增智）
  applyPassiveSkills(newUnit);
  recalcDerivedStats(newUnit);
  return newUnit;

}

/**
 * 应用角色的被动技能（增力/增速/增智）
 * 在战斗开始时自动触发，不消耗SP
 */
function applyPassiveSkills(unit) {
    if (!unit.skillIds || unit.skillIds.length === 0) return;
    for (const skillId of unit.skillIds) {
        const passive = PASSIVE_SKILLS.find(s => s.id === skillId);
        if (!passive) continue;
        switch (passive.type) {
            case 'passive_force':
                unit.force += 1;
                break;
            case 'passive_speed':
                unit.speed += 1;
                break;
            case 'passive_intel':
                unit.intel += 1;
                break;
        }
    }
}

// 以下函数保持不变
export function assignFormation(team, formation) {
  const parts = formation.split('-');
  const rows = [0, 1, 2];
  for (let i = 0; i < team.length && i < 3; i++) {
    team[i].gridRow = rows[i];
    team[i].gridCol = (parts[i] === 'front') ? 1 : 0;
  }
}

export function buildTurnOrder(playerTeam, enemyTeam) {
  let all = [...playerTeam, ...enemyTeam].filter(u => u.alive);
  all.sort((a, b) => (b.speed + (b.speedBonus||0)) - (a.speed + (a.speedBonus||0)) || Math.random() - 0.5);
  return all;
}

export function getEffectiveRange(unit, turnCount) {
  let range = unit.attackRange;
  if (turnCount < 2 && unit.talentData?.firstTurnRangeBonus) {
    range += unit.talentData.firstTurnRangeBonus;
  }
  return range;
}

export function checkAndAdvanceLines(battle) {
  if (!battle.playerTeam.some(u => u.alive && u.gridCol === 1)) {
    battle.playerTeam.forEach(u => { if (u.alive && u.gridCol === 0) u.gridCol = 1; });
    battle.log = "我方阵线前移！";
  }
  if (!battle.enemyTeam.some(u => u.alive && u.gridCol === 1)) {
    battle.enemyTeam.forEach(u => { if (u.alive && u.gridCol === 0) u.gridCol = 1; });
    battle.log = "敌方阵线前移！";
  }
}