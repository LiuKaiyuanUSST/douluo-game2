import { STRONG_AGAINST } from './battleUtils.js';

export function getPos(unit) {
  return unit.side === 'player' ? (unit.gridCol === 1 ? 1 : 0) : (unit.gridCol === 1 ? 2 : 3);
}

export function inRange(battle, attacker, defender) {
  return Math.abs(getPos(attacker) - getPos(defender)) <= battle.getEffectiveRange(attacker);
}

export function resolveAttack(attacker, defender, battle, isNormalAttack = false) {
  // 闪避判定
  const attackerAgility = (attacker.speed + (attacker.speedBonus||0)) + (attacker.intel + (attacker.intelligenceBonus||0));
  const defenderAgility = (defender.speed + (defender.speedBonus||0)) + (defender.intel + (defender.intelligenceBonus||0));
  const diff = defenderAgility - attackerAgility;
  let dodgeChance = 0;
  if (diff >= 6) dodgeChance = 0.5;
  else if (diff >= 3) dodgeChance = 0.25;
  if (dodgeChance > 0 && Math.random() < dodgeChance) {
    const msg = attacker.side === 'player'
      ? `(我)${attacker.name} 攻击被 (敌)${defender.name} 闪避！`
      : `(敌)${attacker.name} 攻击被 (我)${defender.name} 闪避！`;
    return { damage: 0, message: msg };
  }

  // 基础伤害骰（属性加成已反映在 damageMin/Max 中）
  let baseDamage = attacker.damageMin + Math.floor(Math.random() * (attacker.damageMax - attacker.damageMin + 1));

  // 计算防御减伤（临时考虑肉盾标记）
  let defenseType = defender.defenseType || 0;
  if (defender.marks && defender.marks.some(m => m.type === 'shield')) {
    // 肉盾：防御档位+1，上限3
    defenseType = Math.min(3, defenseType + 1);
  }

  let reduction = 0;
  if (defenseType === 1) reduction = Math.random() < 0.5 ? 1 : 0;
  else if (defenseType === 2) reduction = 1;
  else if (defenseType === 3) reduction = 1 + (Math.random() < 0.5 ? 1 : 0);

  // 克制增伤
  let bonus = 0;
  if (STRONG_AGAINST[attacker.affinityUsed] === defender.affinityUsed) {
    if (Math.random() < 0.5) bonus = 1;
  }

  let damage = Math.max(0, baseDamage - reduction) + bonus;

  // 缠绕效果：普攻无法造成伤害（无论普攻还是技能中的普攻部分）
  if (attacker.marks && attacker.marks.some(m => m.type === 'bind')) {
    damage = 0;
  }



  // 天工减免
  if (defender.affinityUsed === '天工' && Math.random() < 0.05) damage = 0;

  // 天赋攻击效果
  let dmgInfo = { damage, bonusDamage: 0, extraAttack: false };
  if (attacker.talent && attacker.talent.onAttack) {
    attacker.talent.onAttack(attacker, defender, dmgInfo, battle);
  }
  if (defender.talent && defender.talent.onAttacked) {
    defender.talent.onAttacked(defender, attacker, dmgInfo, battle);
  }

  damage = dmgInfo.damage + dmgInfo.bonusDamage;

  defender.hp = Math.max(0, defender.hp - damage);
  if (defender.hp <= 0) defender.alive = false;

  const prefixAttack = attacker.side === 'player' ? '(我)' : '(敌)';
  const prefixDefend = defender.side === 'player' ? '(我)' : '(敌)';
  let msg = `${prefixAttack}${attacker.name} 对 ${prefixDefend}${defender.name} 造成 ${damage} 点伤害`;
  if (!defender.alive) msg += `，击败 ${defender.name}！`;
  if (bonus > 0) msg += '（克制+1）';

  // 昊天锤连击
  if (dmgInfo.extraAttack && !battle.finished && defender.alive) {
    msg += ' 昊天锤连击！';
    const followUp = resolveAttack(attacker, defender, battle);
    msg += ' ' + followUp.message;
  }

  return { damage, message: msg };
}