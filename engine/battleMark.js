import { recalcDerivedStats } from './battleUtils.js';

export function addMark(unit, type, duration = 1, extra = {}, battle = null) {
  if ((type === 'bind' || type === 'lock') && unit.immuneControl) {
    if (battle) {
      const msg = `${unit.name}免疫控制！`;
      battle.log += ` ${msg}`;
      battle.setLog(msg);
    }
    return false;
  }
  const logPrefix = battle ? (msg) => {
    battle.log += ` ${msg}`;
    battle.setLog(msg);
  } : () => {};

  // 检查重复标记（除极少数可叠加的标记外，多数标记不可重复）
  if (['poison','burn','bind','lock','reborn','power_up','speed_up','smoke','beast_king','shield','delay'].includes(type)) {
    if (unit.marks.some(m => m.type === type)) {
      if (battle) {
        const msg = `${unit.name}已有${type}标记，不再施加。`;
        battle.log += ` ${msg}`;
        battle.setLog(msg);
      }
      return false;
    }
  }

  if (type === 'bind') {
    unit.marks.push({ type: 'bind' });
    logPrefix(`${unit.name}被缠绕！`);
  }


  else if (type === 'lock') {
    unit.marks.push({ type: 'lock', remaining: 2 });
    logPrefix(`${unit.name}被柔骨锁锁住！`);
  }
  else if (type === 'poison') {
    unit.marks.push({ type: 'poison', count: 0 });
    logPrefix(`${unit.name}中毒！`);
  }
  else if (type === 'burn') {
    unit.marks.push({ type: 'burn', count: 0 });
    logPrefix(`${unit.name}燃烧！`);
  }
  else if (type === 'smoke') {
    unit.intelligenceBonus -= 2;
    unit.marks.push({ type: 'smoke' });
    logPrefix(`${unit.name}被烟雾笼罩，智力-2！`);
    recalcDerivedStats(unit);
  }
  else if (type === 'reborn') {
    unit.marks.push({ type: 'reborn' });
    logPrefix(`${unit.name}获得复生！`);
  }
  else if (type === 'beast_king') {
    unit.immuneControl = true;
    unit.marks.push({ type: 'beast_king' });
    logPrefix(`${unit.name}兽王姿态，免疫控制！`);
  }
  else if (type === 'shield') {
    // 肉盾：每回合抵挡1点伤害，每回合只触发一次
    unit.marks.push({ type: 'shield', usedThisTurn: false });
    logPrefix(`${unit.name}肉盾加身，每回合可抵挡1点伤害！`);
  }

  else if (type === 'power_up') {
    unit.powerBonus += 2;
    unit.marks.push({ type: 'power_up' });
    logPrefix(`${unit.name}力量+2！`);
    recalcDerivedStats(unit);
  }
  else if (type === 'speed_up') {
    unit.speedBonus += 2;
    unit.marks.push({ type: 'speed_up' });
    logPrefix(`${unit.name}速度+2！`);
    recalcDerivedStats(unit);
  }
  else if (type === 'delay') {
    unit.speedBonus -= 2;
    unit.marks.push({ type: 'delay' });
    logPrefix(`${unit.name}被迟滞，速度-2！`);
    recalcDerivedStats(unit);
  }
  return true;
}

export function removeMark(unit, markType) {
  // 移除烟雾标记时恢复智力
  if (markType === 'smoke') {
    if (unit.marks.some(m => m.type === 'smoke')) {
      unit.intelligenceBonus += 2;
    }
  }
  // 肉盾标记移除不需要特殊操作，因为防御是实时计算的
  unit.marks = unit.marks.filter(m => m.type !== markType);
  recalcDerivedStats(unit);
}

export function hasMark(unit, markType) {
  return unit.marks.some(m => m.type === markType);
}

/**
 * 重置所有肉盾标记的 usedThisTurn 状态（每回合开始时调用）
 */
export function resetShieldUsedThisTurn(battle) {
  const allUnits = [...battle.playerTeam, ...battle.enemyTeam];
  allUnits.forEach(unit => {
    unit.marks.forEach(m => {
      if (m.type === 'shield') {
        m.usedThisTurn = false;
      }
    });
  });
}

export function applyStartTurnEffects(unit, battle) {

  unit.marks = unit.marks.filter(m => {
    if (m.type === 'poison' || m.type === 'burn') {
      if (Math.random() < 0.5) {
        unit.hp = Math.max(0, unit.hp - 1);
        const msg = `${unit.name}受到${m.type==='poison'?'中毒':'燃烧'}伤害1点！`;
        battle.log += ` ${msg}`;
        battle.setLog(msg);
        m.count = (m.count || 0) + 1;
      }
      if (m.count >= 2) return false;
    }
    if (m.type === 'lock') {
      m.remaining--;
      if (m.remaining <= 0) return false;
    }

    return true;
  });
  if (unit.hp <= 0) unit.alive = false;
}

export function applyEndTurnEffects(unit, battle) {
  // 缠绕效果：目标行动一次后解除
  if (unit.marks.some(m => m.type === 'bind')) {
    unit.marks = unit.marks.filter(m => m.type !== 'bind');
    const msg = `${unit.name}的缠绕效果解除。`;
    battle.log += ` ${msg}`;
    battle.setLog(msg);
  }
  unit.marks.forEach(m => {
    if (m.type === 'reborn' && unit.alive) {
      if (Math.random() < 0.5) {
        unit.hp = Math.min(unit.maxHp, unit.hp + 1);
        const msg = `${unit.name}复生回复1HP！`;
        battle.log += ` ${msg}`;
        battle.setLog(msg);
      }
    }
  });
}


