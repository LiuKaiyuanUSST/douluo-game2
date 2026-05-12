import { getSkillById, getActualProb } from './skills.js';
import { resolveAttack, inRange } from './battleAttack.js';
import { recalcDerivedStats } from './battleUtils.js';

export function executeSkill(actor, skillId, target, battle) {
  const skill = getSkillById(skillId);
  if (!skill) return null;
  let cost = skill.cost;
  if (actor.talent && actor.talent.onSkillCost) cost = actor.talent.onSkillCost(skill, actor);
  if (actor.spirit < cost) return null;
  actor.spirit -= cost;

  const actorPrefix = actor.side === 'player' ? '(我)' : '(敌)';
  const actorName = actor.name;
  let message = '';

  const getTargetBySideIndex = (side, idx) => side === 'player' ? battle.playerTeam[idx] : battle.enemyTeam[idx];
  const unpack = (t) => {
    if (typeof t === 'object' && 'side' in t) return [t.side, t.index];
    return ['enemy', t[0] ?? 0];
  };

  // 返回使用者敌对的队伍（玩家敌人是 enemyTeam，敌方敌人是 playerTeam）
  const getOpposingTeam = () => actor.side === 'player' ? battle.enemyTeam : battle.playerTeam;

  switch (skill.type) {
    case 'bind': {
      const [side, idx] = unpack(target);
      const targetUnit = getTargetBySideIndex(side, idx);
      if (targetUnit && targetUnit.alive) {
        const dmgResult = resolveAttack(actor, targetUnit, battle);
        message = `${actorPrefix}${actorName} 使用【缠绕】！` + dmgResult.message;
        if (!battle.hasMark(targetUnit, 'bind')) {
          battle.addMark(targetUnit, 'bind', 1);
          message += ' 附加缠绕！';
        } else {
          message += ' 目标已有缠绕，不再附加。';
        }
        // 蓝银领域天赋：首回合额外指定一名敌方目标（无距离限制）
        if (battle.turnCount === 0 && actor.talentData?.extraBindTarget) {
          const opposing = getOpposingTeam();
          // 过滤掉原目标单位（对比单位对象，而非索引，因为不同阵营可能同名但不同对象）
          const others = opposing.filter(e => e.alive && e !== targetUnit);
          if (others.length > 0) {
            const extra = others[Math.floor(Math.random() * others.length)];
            const extraDmg = resolveAttack(actor, extra, battle);
            message += ` ${extra.name}也被缠绕！` + extraDmg.message;
            if (!battle.hasMark(extra, 'bind')) {
              battle.addMark(extra, 'bind', 1);
            }
          }
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【缠绕】，目标无效。`;
      }
      break;
    }
    case 'reborn': {
      const unit = getTargetBySideIndex(...unpack(target));
      if (unit && unit.alive) {
        message = `${actorPrefix}${actorName} 使用【复生】→ ${unit.name}`;
        if (!battle.hasMark(unit, 'reborn')) {
          battle.addMark(unit, 'reborn');
          message += ' 获得复生！';
        } else {
          message += ' 已有复生，不再施加。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【复生】，目标无效。`;
      }
      break;
    }
    case 'spread': {
      const spreadProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
      message = `${actorPrefix}${actorName} 使用【蔓延】`;
      if (Math.random() < spreadProb) {
        actor.permanentRangeBonus = (actor.permanentRangeBonus || 0) + 2;
        recalcDerivedStats(actor);
        message += '，攻击距离永久+2！';
      } else {
        message += '，但失败了。';
      }
      break;
    }
    case 'thunder_emp': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        const dmgResult = resolveAttack(actor, unit, battle);
        message = `${actorPrefix}${actorName} 使用【雷神变】！` + dmgResult.message;
        // 只有第一个目标命中（造成伤害）才可能触发额外攻击
        if (dmgResult.damage > 0) {
          const prob = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
          if (Math.random() < prob) {
            const opposing = getOpposingTeam();
            const others = opposing.filter(e => e.alive && e !== unit);
            if (others.length > 0) {
              const extra = others[Math.floor(Math.random() * others.length)];
              const extraDmg = resolveAttack(actor, extra, battle);
              message += ' 雷神变命中额外目标！' + extraDmg.message;
            }
          } else {
            message += ' 雷神变未触发连击。';
          }
        } else {
          message += ' 雷神变未命中，无法触发连击。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【雷神变】，目标无效。`;
      }
      break;
    }
    case 'thunder_mass': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        const dmgResult = resolveAttack(actor, unit, battle);
        message = `${actorPrefix}${actorName} 使用【雷霆万钧】！` + dmgResult.message;
        const prob = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        if (Math.random() < prob) {
          const opposing = getOpposingTeam();
          const others = opposing.filter(e => e.alive && e !== unit);
          for (let i = 0; i < Math.min(2, others.length); i++) {
            const extraDmg = resolveAttack(actor, others[i], battle);
            message += ` ${others[i].name}受到溅射！` + extraDmg.message;
          }
          if (others.length === 0) message += ' 无额外目标。';
        } else {
          message += ' 雷霆万钧未触发溅射。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【雷霆万钧】，目标无效。`;
      }
      break;
    }
    case 'lock': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        const dmgResult = resolveAttack(actor, unit, battle);
        message = `${actorPrefix}${actorName} 使用【柔骨锁】！` + dmgResult.message;
        if (!battle.hasMark(unit, 'lock')) {
          battle.addMark(unit, 'lock', 2);
          message += ' 附加柔骨锁！';
        } else {
          message += ' 目标已被柔骨锁锁住。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【柔骨锁】，目标无效。`;
      }
      break;
    }
    case 'beast_king': {
      message = `${actorPrefix}${actorName} 使用【兽王】→ 自身`;
      if (!battle.hasMark(actor, 'beast_king')) {
        battle.addMark(actor, 'beast_king');
        message += ' 开启兽王姿态！';
      } else {
        message += ' 已处于兽王姿态。';
      }
      break;
    }
    case 'shield': {
      message = `${actorPrefix}${actorName} 使用【肉盾】→ 自身`;
      if (!battle.hasMark(actor, 'shield')) {
        battle.addMark(actor, 'shield');
        message += ' 防御强化！';
      } else {
        message += ' 防御已强化。';
      }
      break;
    }
    case 'brute': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        let dmgResult = resolveAttack(actor, unit, battle);
        dmgResult.damage += 1;
        unit.hp = Math.max(0, unit.hp - 1);
        dmgResult.message += '（蛮力+1）';
        message = `${actorPrefix}${actorName} 使用【蛮力】！` + dmgResult.message;
        if (unit.hp <= 0) unit.alive = false;
      } else {
        message = `${actorPrefix}${actorName} 使用【蛮力】，目标无效。`;
      }
      break;
    }
    case 'poison': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        const dmgResult = resolveAttack(actor, unit, battle);
        message = `${actorPrefix}${actorName} 使用【中毒】！` + dmgResult.message;
        if (!battle.hasMark(unit, 'poison')) {
          battle.addMark(unit, 'poison');
          message += ' 附加中毒！';
        } else {
          message += ' 目标已中毒。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【中毒】，目标无效。`;
      }
      break;
    }
    case 'spread_poison': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        const dmgResult = resolveAttack(actor, unit, battle);
        message = `${actorPrefix}${actorName} 使用【扩散】！` + dmgResult.message;
        const opposing = getOpposingTeam();
        const others = [...opposing].filter(e => e.alive && e !== unit).sort(() => Math.random() - 0.5).slice(0, 2);
        if (others.length > 0) {
          others.forEach(e => {
            if (!battle.hasMark(e, 'poison')) {
              battle.addMark(e, 'poison');
              message += ` ${e.name}中毒！`;
            } else {
              message += ` ${e.name}已中毒。`;
            }
          });
        } else {
          message += ' 无其他目标可扩散。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【扩散】，目标无效。`;
      }
      break;
    }
    case 'cure_poison': {
      const unit = getTargetBySideIndex(...unpack(target));
      if (unit && unit.alive) {
        message = `${actorPrefix}${actorName} 使用【驱毒】→ ${unit.name}`;
        if (battle.hasMark(unit, 'poison')) {
          battle.removeMark(unit, 'poison');
          message += ' 驱散了中毒标记！';
        } else {
          message += ' 目标没有中毒标记。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【驱毒】，目标无效。`;
      }
      break;
    }
    case 'heal': {
      const unit = getTargetBySideIndex(...unpack(target));
      if (unit && unit.alive) {
        unit.hp = Math.min(unit.maxHp, unit.hp + 1);
        message = `${actorPrefix}${actorName} 使用【治疗】→ ${unit.name}，回复1点HP！`;
        if (actor.talentData?.extraHealTarget && battle.turnCount < (actor.talentData.healBonusTurns || 3)) {
          const ownTeam = actor.side === 'player' ? battle.playerTeam : battle.enemyTeam;
          const otherTargets = ownTeam.filter(u => u.alive && u !== unit);
          if (otherTargets.length > 0) {
            const extra = otherTargets[Math.floor(Math.random() * otherTargets.length)];
            extra.hp = Math.min(extra.maxHp, extra.hp + 1);
            message += ` 额外治疗了${extra.name}！`;
            if (actor.talentData?.healSPChance && Math.random() < actor.talentData.healSPChance) {
              extra.spirit = Math.min(extra.maxSpirit, extra.spirit + 1);
              message += ` ${extra.name}回复1SP！`;
            }
            if (actor.talentData?.healSPChance && Math.random() < actor.talentData.healSPChance) {
              unit.spirit = Math.min(unit.maxSpirit, unit.spirit + 1);
              message += ` ${unit.name}回复1SP！`;
            }
          }
        }
        if (actor.talentData?.healExtraChance && Math.random() < actor.talentData.healExtraChance) {
          unit.hp = Math.min(unit.maxHp, unit.hp + 1);
          message += ` ${unit.name}额外回复1HP！`;
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【治疗】，目标无效。`;
      }
      break;
    }
    case 'power_up': {
      const unit = getTargetBySideIndex(...unpack(target));
      if (unit && unit.alive) {
        const baseProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        const prob = actor.talent?.onSkillEffect ? actor.talent.onSkillEffect(actor, skill, baseProb) : baseProb;
        message = `${actorPrefix}${actorName} 使用【一曰力】→ ${unit.name}`;
        if (Math.random() < prob) {
          if (!battle.hasMark(unit, 'power_up')) {
            battle.addMark(unit, 'power_up');
            message += ' 力量提升成功！';
          } else {
            message += ' 已有巨力标记。';
          }
        } else {
          message += ' 力量提升失败！';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【一曰力】，目标无效。`;
      }
      break;
    }
    case 'speed_up': {
      const unit = getTargetBySideIndex(...unpack(target));
      if (unit && unit.alive) {
        const baseProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        const prob = actor.talent?.onSkillEffect ? actor.talent.onSkillEffect(actor, skill, baseProb) : baseProb;
        message = `${actorPrefix}${actorName} 使用【二曰速】→ ${unit.name}`;
        if (Math.random() < prob) {
          if (!battle.hasMark(unit, 'speed_up')) {
            battle.addMark(unit, 'speed_up');
            message += ' 速度提升成功！';
          } else {
            message += ' 已有极速标记。';
          }
        } else {
          message += ' 速度提升失败！';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【二曰速】，目标无效。`;
      }
      break;
    }
    case 'heal_all': {
      message = `${actorPrefix}${actorName} 使用【痊愈】！`;
      const ownTeam = actor.side === 'player' ? battle.playerTeam : battle.enemyTeam;
      const healProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
      let anyHealed = false;
      ownTeam.forEach(u => {
        if (u.alive && Math.random() < healProb) {
          u.hp = Math.min(u.maxHp, u.hp + 1);
          message += ` ${u.name}回复1HP！`;
          anyHealed = true;
          if (actor.talentData?.healExtraChance && Math.random() < actor.talentData.healExtraChance) {
            u.hp = Math.min(u.maxHp, u.hp + 1);
            message += ' (额外+1)';
          }
          if (actor.talentData?.healSPChance && Math.random() < actor.talentData.healSPChance) {
            u.spirit = Math.min(u.maxSpirit, u.spirit + 1);
            message += ` ${u.name}回复1SP！`;
          }
        }
      });
      if (!anyHealed) message += ' 无事发生。';
      break;
    }
    case 'speed_up_self': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        const dmgResult = resolveAttack(actor, unit, battle);
        message = `${actorPrefix}${actorName} 使用【怒涛】！` + dmgResult.message;
        if (!battle.hasMark(actor, 'speed_up')) {
          battle.addMark(actor, 'speed_up');
          message += ' 自身速度+2！';
        } else {
          message += ' 自身已有极速标记。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【怒涛】，目标无效。`;
      }
      break;
    }
    case 'cleanse': {
      message = `${actorPrefix}${actorName} 使用【净化】！`;
      const ownTeam = actor.side === 'player' ? battle.playerTeam : battle.enemyTeam;
      let anyCleansed = false;
      ownTeam.forEach(u => {
        const before = u.marks.length;
        u.marks = u.marks.filter(m => !['bind', 'lock', 'poison', 'burn', 'smoke'].includes(m.type));
        if (u.marks.length < before) anyCleansed = true;
      });
      if (anyCleansed) {
        message += ' 清除所有负面状态！';
      } else {
        message += ' 无负面状态可清除。';
      }
      break;
    }
    case 'burn': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        const dmgResult = resolveAttack(actor, unit, battle);
        message = `${actorPrefix}${actorName} 使用【灼烧】！` + dmgResult.message;
        if (!battle.hasMark(unit, 'burn')) {
          battle.addMark(unit, 'burn');
          message += ' 附加燃烧！';
        } else {
          message += ' 目标已燃烧。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【灼烧】，目标无效。`;
      }
      break;
    }
    case 'burn_mass': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        const dmgResult = resolveAttack(actor, unit, battle);
        message = `${actorPrefix}${actorName} 使用【爆裂】！` + dmgResult.message;
        const opposing = getOpposingTeam();
        const others = [...opposing].filter(e => e.alive && e !== unit).sort(() => Math.random() - 0.5).slice(0, 2);
        if (others.length > 0) {
          others.forEach(e => {
            if (!battle.hasMark(e, 'burn')) {
              battle.addMark(e, 'burn');
              message += ` ${e.name}燃烧！`;
            } else {
              message += ` ${e.name}已燃烧。`;
            }
          });
        } else {
          message += ' 无其他目标可蔓延。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【爆裂】，目标无效。`;
      }
      break;
    }
    case 'smoke': {
      message = `${actorPrefix}${actorName} 使用【浓烟弥漫】！`;
      const opposing = getOpposingTeam();
      const enemiesInRange = opposing.filter(e => e.alive && inRange(battle, actor, e));
      const targets = enemiesInRange.sort(() => Math.random() - 0.5).slice(0, 2);
      const smokeProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
      if (targets.length === 0) {
        message += ' 攻击范围内无敌人。';
      } else {
        targets.forEach(e => {
          if (Math.random() < smokeProb) {
            if (!battle.hasMark(e, 'smoke')) {
              battle.addMark(e, 'smoke');
              message += ` ${e.name}被烟雾笼罩！`;
            } else {
              message += ` ${e.name}已有烟雾标记。`;
            }
          } else {
            message += ` ${e.name}抵御了烟雾。`;
          }
        });
      }
      break;
    }
    default: message = `${actorPrefix}${actorName} 使用未知魂技(${skillId})`;
  }

  battle.setLog(message);
  battle.playerActed = true;
  battle.advanceTurn();
  return { message };
}