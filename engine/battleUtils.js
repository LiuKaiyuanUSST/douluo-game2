export const AFFINITIES = ['烈焰', '苍木', '蛊毒', '巨兽', '雷霆', '沧澜', '天工'];

export const STRONG_AGAINST = {
  '烈焰': '苍木',
  '苍木': '蛊毒',
  '蛊毒': '巨兽',
  '巨兽': '雷霆',
  '雷霆': '沧澜',
  '沧澜': '烈焰'
};

// 初始计算所有衍生属性，包括生命
export function calcDerivedStats(baseForce, baseSpeed, baseIntel, levelDiff = 0) {
  let force = baseForce;
  let speed = baseSpeed;
  let intel = baseIntel;
  if (levelDiff >= 3) {
    force = Math.max(0, baseForce - 3);
    speed = Math.max(0, baseSpeed - 3);
    intel = Math.max(0, baseIntel - 3);
  } else if (levelDiff === 2) {
    force = Math.max(0, baseForce - 2);
    speed = Math.max(0, baseSpeed - 2);
    intel = Math.max(0, baseIntel - 1);
  } else if (levelDiff === 1) {
    force = Math.max(0, baseForce - 1);
    speed = Math.max(0, baseSpeed - 1);
  }

  const maxHp = force + 3;
  const attackStat = force * 1.5 + speed * 0.5;
  const defenseStat = intel * 1.5 + force * 0.5;

  let attackRange;
  if (speed >= 7) attackRange = 3;
  else if (speed >= 4) attackRange = 2;
  else attackRange = 1;

  let spiritRecovery;
  if (intel >= 7) spiritRecovery = 3;
  else if (intel >= 4) spiritRecovery = 2;
  else spiritRecovery = 1;

  let damageMin, damageMax;
  const atk = attackStat;
  if (atk < 1) { damageMin = 1; damageMax = 1; }
  else if (atk <= 2) { damageMin = 1; damageMax = 2; }
  else if (atk <= 4) { damageMin = 1; damageMax = 3; }
  else if (atk <= 6) { damageMin = 2; damageMax = 3; }
  else if (atk <= 8) { damageMin = 2; damageMax = 4; }
  else if (atk <= 10) { damageMin = 3; damageMax = 4; }
  else { damageMin = 3; damageMax = 5; }

  let defenseType;
  if (defenseStat >= 10) defenseType = 3;
  else if (defenseStat >= 7) defenseType = 2;
  else if (defenseStat >= 4) defenseType = 1;
  else defenseType = 0;

  return {
    force, speed, intel, maxHp, attackRange,
    damageMin, damageMax, defenseType, spiritRecovery
  };
}

// 重新计算单位衍生属性（不改变当前生命值，但更新最大生命值）
export function recalcDerivedStats(unit) {
  const currentForce = (unit.force || 0) + (unit.powerBonus || 0);
  const currentSpeed = (unit.speed || 0) + (unit.speedBonus || 0);
  const currentIntel = (unit.intel || 0) + (unit.intelligenceBonus || 0);

  const attackStat = currentForce * 1.5 + currentSpeed * 0.5;
  const defenseStat = currentIntel * 1.5 + currentForce * 0.5;

  // 更新最大生命值（基于当前力量）
  unit.maxHp = currentForce + 3;

  // 攻击距离基础
  let baseRange;
  if (currentSpeed >= 7) baseRange = 3;
  else if (currentSpeed >= 4) baseRange = 2;
  else baseRange = 1;

  // 攻击距离 = 基础 + 永久加成（天赋、蔓延等）
  unit.attackRange = baseRange + (unit.permanentRangeBonus || 0);

  // 魂力恢复
  if (currentIntel >= 7) unit.spiritRecovery = 3;
  else if (currentIntel >= 4) unit.spiritRecovery = 2;
  else unit.spiritRecovery = 1;

  // 伤害范围
  const atk = attackStat;
  if (atk < 1) { unit.damageMin = 1; unit.damageMax = 1; }
  else if (atk <= 2) { unit.damageMin = 1; unit.damageMax = 2; }
  else if (atk <= 4) { unit.damageMin = 1; unit.damageMax = 3; }
  else if (atk <= 6) { unit.damageMin = 2; unit.damageMax = 3; }
  else if (atk <= 8) { unit.damageMin = 2; unit.damageMax = 4; }
  else if (atk <= 10) { unit.damageMin = 3; unit.damageMax = 4; }
  else { unit.damageMin = 3; unit.damageMax = 5; }

  // 防御类型
  if (defenseStat >= 10) unit.defenseType = 3;
  else if (defenseStat >= 7) unit.defenseType = 2;
  else if (defenseStat >= 4) unit.defenseType = 1;
  else unit.defenseType = 0;
}
