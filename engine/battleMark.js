import { recalcDerivedStats } from './battleUtils.js';

export function addMark(unit, type, duration = 1, extra = {}, battle = null) {
  if ((type === 'bind' || type === 'lock') && unit.immuneControl) {
    if (battle) battle.log += ` ${unit.name}免疫控制！`;
    return;
  }
  const logPrefix = battle ? (msg) => (battle.log += ` ${msg}`) : () => {};

  // 检查重复标记（除极少数可叠加的标记外，多数标记不可重复）
  if (['poison','burn','bind','lock','reborn','power_up','speed_up','smoke','beast_king','shield'].includes(type)) {
    if (unit.marks.some(m => m.type === type)) {
      if (battle) battle.log += ` ${unit.name}已有${type}标记，不再施加。`;
      return;
    }
  }

  if (type === 'bind') {
    unit.marks.push({ type: 'bind', remaining: 1 });
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
    // 只添加标记，不直接修改防御属性，伤害结算时再计算
    unit.marks.push({ type: 'shield' });
    logPrefix(`${unit.name}肉盾加身，防御上升！`);
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

export function applyStartTurnEffects(unit, battle) {
  unit.marks = unit.marks.filter(m => {
    if (m.type === 'poison' || m.type === 'burn') {
      if (Math.random() < 0.5) {
        unit.hp = Math.max(0, unit.hp - 1);
        battle.log += ` ${unit.name}受到${m.type==='poison'?'中毒':'燃烧'}伤害1点！`;
        m.count = (m.count || 0) + 1;
      }
      if (m.count >= 2) return false;
    }
    if (m.type === 'bind' || m.type === 'lock') {
      m.remaining--;
      if (m.remaining <= 0) return false;
    }
    return true;
  });
  if (unit.hp <= 0) unit.alive = false;
}

export function applyEndTurnEffects(unit, battle) {
  unit.marks.forEach(m => {
    if (m.type === 'reborn' && unit.alive) {
      if (Math.random() < 0.5) {
        unit.hp = Math.min(unit.maxHp, unit.hp + 1);
        battle.log += ` ${unit.name}复生回复1HP！`;
      }
    }
  });
}