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
        const bindProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        if (Math.random() < bindProb) {
          if (battle.addMark(targetUnit, 'bind', 1, {}, battle)) {
            message += ' 缠绕成功！';
          } else {
            message += ' 目标已有缠绕标记或免疫控制。';
          }
        } else {
          message += ' 缠绕技能失败。';
        }
        // 蓝银领域天赋：首回合额外缠绕1名目标（只缠绕不普攻，独立结算概率）
        if (battle.turnCount === 0 && actor.talentData?.extraBindAndRebornTarget) {
          const opposing = getOpposingTeam();
          const others = opposing.filter(e => e.alive && e !== targetUnit);
          if (others.length > 0) {
            const extra = others[Math.floor(Math.random() * others.length)];
            const extraBindProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
            if (Math.random() < extraBindProb) {
              if (battle.addMark(extra, 'bind', 1, {}, battle)) {
                message += ` ${extra.name}缠绕成功！`;
              } else {
                message += ` ${extra.name}已有缠绕标记或免疫控制。`;
              }
            } else {
              message += ` ${extra.name}缠绕技能失败。`;
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
        const healProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        const healBonusTurns = actor.talentData?.healBonusTurns || 3;
        message = `${actorPrefix}${actorName} 使用【复生】→ ${unit.name}`;
        // 主目标治疗
        if (Math.random() < healProb) {
          unit.hp = Math.min(unit.maxHp, unit.hp + 1);
          message += ' 回复1点生命！';
        } else {
          message += ' 回复失败。';
        }
        if (battle.addMark(unit, 'reborn', 1, {}, battle)) {
          message += ' 获得复生！';
        } else {
          message += ' 已有复生，不再施加。';
        }
        // 治愈祈愿天赋：前三回合对主目标以50%概率额外回复2点生命（独立于前置治疗，不论是否成功）
        if (actor.talentData?.healExtraChance && battle.turnCount < healBonusTurns) {
          if (Math.random() < actor.talentData.healExtraChance) {
            const extraAmount = actor.talentData.healExtraAmount || 1;
            unit.hp = Math.min(unit.maxHp, unit.hp + extraAmount);
            message += ` ${unit.name}额外回复${extraAmount}HP！`;
          }
        }
        // 香肠滋补天赋：前三回合对主目标回复1点魂力
        if (actor.talentData?.healSPChance && battle.turnCount < healBonusTurns) {
          if (Math.random() < actor.talentData.healSPChance) {
            unit.spirit = Math.min(unit.maxSpirit, unit.spirit + 1);
            message += ` ${unit.name}回复1SP！`;
          }
        }
        // 九心海棠/香肠天赋：前三回合额外指定1名目标
        if (actor.talentData?.extraHealTarget && battle.turnCount < healBonusTurns) {
          const ownTeam = actor.side === 'player' ? battle.playerTeam : battle.enemyTeam;
          const otherTargets = ownTeam.filter(u => u.alive && u !== unit);
          if (otherTargets.length > 0) {
            const extra = otherTargets[Math.floor(Math.random() * otherTargets.length)];
            // 额外目标独立结算50%概率回复1HP（独立计算概率）
            const extraHealProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
            if (Math.random() < extraHealProb) {
              extra.hp = Math.min(extra.maxHp, extra.hp + 1);
              message += ` 额外治疗了${extra.name}，回复1点生命！`;
            }
            if (battle.addMark(extra, 'reborn', 1, {}, battle)) {
              message += ` ${extra.name}获得复生！`;
            } else {
              message += ` ${extra.name}已有复生，不再施加。`;
            }
            // 治愈祈愿天赋：前三回合对额外目标以50%概率额外回复2点生命（独立于前置治疗，不论是否成功）
            if (actor.talentData?.healExtraChance && battle.turnCount < healBonusTurns) {
              if (Math.random() < actor.talentData.healExtraChance) {
                const extraAmount = actor.talentData.healExtraAmount || 1;
                extra.hp = Math.min(extra.maxHp, extra.hp + extraAmount);
                message += ` ${extra.name}额外回复${extraAmount}HP！`;
              }
            }
            // 香肠滋补天赋：前三回合对额外目标回复1点魂力
            if (actor.talentData?.healSPChance && battle.turnCount < healBonusTurns) {
              if (Math.random() < actor.talentData.healSPChance) {
                extra.spirit = Math.min(extra.maxSpirit, extra.spirit + 1);
                message += ` ${extra.name}回复1SP！`;
              }
            }
          }
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
        const lockProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        if (Math.random() < lockProb) {
          if (battle.addMark(unit, 'lock', 2, {}, battle)) {
            message += ' 柔骨锁成功！';
          } else {
            message += ' 目标已被柔骨锁锁住或免疫控制。';
          }
        } else {
          message += ' 柔骨锁技能失败。';
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【柔骨锁】，目标无效。`;
      }
      break;
    }

    case 'beast_king': {
      message = `${actorPrefix}${actorName} 使用【兽王】→ 自身`;
      const beastProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
      if (Math.random() < beastProb) {
        if (battle.addMark(actor, 'beast_king', 1, {}, battle)) {
          message += ' 兽王姿态成功！';
        } else {
          message += ' 已有兽王标记。';
        }
      } else {
        message += ' 兽王技能失败。';
      }
      break;
    }

    case 'shield': {
      message = `${actorPrefix}${actorName} 使用【肉盾】→ 自身`;
      const shieldProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
      if (Math.random() < shieldProb) {
        if (battle.addMark(actor, 'shield', 1, {}, battle)) {
          message += ' 防御强化！';
        } else {
          message += ' 已有肉盾标记。';
        }
      } else {
        message += ' 肉盾技能失败。';
      }
      break;
    }

    case 'brute': {
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        let dmgResult = resolveAttack(actor, unit, battle);
        const bruteProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        if (Math.random() < bruteProb) {
          dmgResult.damage += 1;
          unit.hp = Math.max(0, unit.hp - 1);
          dmgResult.message += '（蛮力+1）';
          message = `${actorPrefix}${actorName} 使用【蛮力】！` + dmgResult.message;
          if (unit.hp <= 0) unit.alive = false;
        } else {
          message = `${actorPrefix}${actorName} 使用【蛮力】！` + dmgResult.message + ' 蛮力增伤失败。';
        }
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
        const poisonProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        if (Math.random() < poisonProb) {
          if (battle.addMark(unit, 'poison', 1, {}, battle)) {
            message += ' 附加中毒！';
          } else {
            message += ' 目标已中毒。';
          }
        } else {
          message += ' 目标抵御了中毒。';
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
        // 对全场所有角色100%概率附加中毒标记
        const allUnits = [...battle.playerTeam, ...battle.enemyTeam].filter(e => e.alive);
        const poisonProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        allUnits.forEach(e => {
          if (Math.random() < poisonProb) {
            if (battle.addMark(e, 'poison', 1, {}, battle)) {
              message += ` ${e.name}中毒！`;
            } else {
              message += ` ${e.name}已中毒。`;
            }
          } else {
            message += ` ${e.name}抵御了中毒。`;
          }
        });
        // 对己方所有中毒角色100%附加激发标记（智力+3，本场战斗）
        const ownTeam = actor.side === 'player' ? battle.playerTeam : battle.enemyTeam;
        const exciteProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        ownTeam.filter(e => e.alive && battle.hasMark(e, 'poison')).forEach(e => {
          if (Math.random() < exciteProb) {
            if (battle.addMark(e, 'excite', 1, {}, battle)) {
              message += ` ${e.name}获得激发！`;
            } else {
              message += ` ${e.name}已有激发标记。`;
            }
          } else {
            message += ` ${e.name}激发失败。`;
          }
        });
      } else {
        message = `${actorPrefix}${actorName} 使用【扩散】，目标无效。`;
      }
      break;
    }
    case 'cure_poison': {
      message = `${actorPrefix}${actorName} 使用【驱毒】！`;
      const cureProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
      const ownTeam = actor.side === 'player' ? battle.playerTeam : battle.enemyTeam;
      ownTeam.filter(e => e.alive).forEach(e => {
        if (Math.random() < cureProb) {
          if (battle.hasMark(e, 'poison')) {
            battle.removeMark(e, 'poison');
            message += ` ${e.name}驱毒成功！`;
          } else {
            message += ` ${e.name}没有中毒标记。`;
          }
        } else {
          message += ` ${e.name}驱毒失败。`;
        }
      });
      break;
    }

    case 'heal': {
      const unit = getTargetBySideIndex(...unpack(target));
      if (unit && unit.alive) {
        const healProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        const healBonusTurns = actor.talentData?.healBonusTurns || 3;
        message = `${actorPrefix}${actorName} 使用【治疗】→ ${unit.name}`;
        // 主目标治疗
        if (Math.random() < healProb) {
          unit.hp = Math.min(unit.maxHp, unit.hp + 2);
          message += '，回复2点HP！';
        } else {
          message += '，治疗失败。';
        }
        // 治愈祈愿天赋：前三回合对主目标以50%概率额外回复2点生命（独立于前置治疗，不论是否成功）
        if (actor.talentData?.healExtraChance && battle.turnCount < healBonusTurns) {
          if (Math.random() < actor.talentData.healExtraChance) {
            const extraAmount = actor.talentData.healExtraAmount || 1;
            unit.hp = Math.min(unit.maxHp, unit.hp + extraAmount);
            message += ` ${unit.name}额外回复${extraAmount}HP！`;
          }
        }
        // 香肠滋补天赋：前三回合对主目标回复1点魂力
        if (actor.talentData?.healSPChance && battle.turnCount < healBonusTurns) {
          if (Math.random() < actor.talentData.healSPChance) {
            unit.spirit = Math.min(unit.maxSpirit, unit.spirit + 1);
            message += ` ${unit.name}回复1SP！`;
          }
        }
        // 九心海棠/香肠天赋：前三回合额外指定1名目标
        if (actor.talentData?.extraHealTarget && battle.turnCount < healBonusTurns) {
          const ownTeam = actor.side === 'player' ? battle.playerTeam : battle.enemyTeam;
          const otherTargets = ownTeam.filter(u => u.alive && u !== unit);
          if (otherTargets.length > 0) {
            const extra = otherTargets[Math.floor(Math.random() * otherTargets.length)];
            // 额外目标独立结算50%概率回复2HP（独立计算概率）
            const extraHealProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
            if (Math.random() < extraHealProb) {
              extra.hp = Math.min(extra.maxHp, extra.hp + 2);
              message += ` 额外治疗了${extra.name}，回复2点HP！`;
            }
            // 治愈祈愿天赋：前三回合对额外目标以50%概率额外回复2点生命（独立于前置治疗，不论是否成功）
            if (actor.talentData?.healExtraChance && battle.turnCount < healBonusTurns) {
              if (Math.random() < actor.talentData.healExtraChance) {
                const extraAmount = actor.talentData.healExtraAmount || 1;
                extra.hp = Math.min(extra.maxHp, extra.hp + extraAmount);
                message += ` ${extra.name}额外回复${extraAmount}HP！`;
              }
            }
            // 香肠滋补天赋：前三回合对额外目标回复1点魂力
            if (actor.talentData?.healSPChance && battle.turnCount < healBonusTurns) {
              if (Math.random() < actor.talentData.healSPChance) {
                extra.spirit = Math.min(extra.maxSpirit, extra.spirit + 1);
                message += ` ${extra.name}回复1SP！`;
              }
            }
          }
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
          if (battle.addMark(unit, 'power_up', 1, {}, battle)) {
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
          if (battle.addMark(unit, 'speed_up', 1, {}, battle)) {
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
      const healBonusTurns = actor.talentData?.healBonusTurns || 3;
      let anyHealed = false;
      ownTeam.forEach(u => {
        if (u.alive) {
          // 痊愈：对每个目标独立结算50%概率回复1HP（每个目标独立计算概率）
          const healProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
          if (Math.random() < healProb) {
            u.hp = Math.min(u.maxHp, u.hp + 1);
            message += ` ${u.name}回复1HP！`;
            anyHealed = true;
          }
          // 治愈祈愿天赋：前三回合对每个目标以50%概率额外回复2点生命（独立于前置治疗，不论是否成功）
          if (actor.talentData?.healExtraChance && battle.turnCount < healBonusTurns) {
            if (Math.random() < actor.talentData.healExtraChance) {
              const extraAmount = actor.talentData.healExtraAmount || 1;
              u.hp = Math.min(u.maxHp, u.hp + extraAmount);
              message += ` ${u.name}额外回复${extraAmount}HP！`;
            }
          }
          // 香肠滋补天赋：前三回合对每个目标以50%概率额外回复1点魂力
          if (actor.talentData?.healSPChance && battle.turnCount < healBonusTurns) {
            if (Math.random() < actor.talentData.healSPChance) {
              u.spirit = Math.min(u.maxSpirit, u.spirit + 1);
              message += ` ${u.name}回复1SP！`;
            }
          }
        }
      });

      if (!anyHealed) message += ' 无事发生。';
      break;
    }
    case 'ocean_delay': {
      message = `${actorPrefix}${actorName} 使用【海渊迟滞】！`;
      const opposing = getOpposingTeam();
      const enemiesInRange = opposing.filter(e => e.alive && inRange(battle, actor, e));
      const targets = enemiesInRange.sort(() => Math.random() - 0.5).slice(0, 2);
      if (targets.length === 0) {
        message += ' 攻击范围内无敌人。';
      } else {
        // 先对主目标进行普攻
        const mainTarget = targets[0];
        const dmgResult = resolveAttack(actor, mainTarget, battle);
        message += dmgResult.message;
        // 再为攻击范围内最多2名敌人附加迟滞标记（每个目标独立结算概率）
        targets.forEach(e => {
          const delayProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
          if (Math.random() < delayProb) {
            if (battle.addMark(e, 'delay', 1, {}, battle)) {
              message += ` ${e.name}被迟滞！`;
            } else {
              message += ` ${e.name}已有迟滞标记。`;
            }
          } else {
            message += ` ${e.name}迟滞技能失败。`;
          }
        });
      }
      break;
    }

    case 'cleanse': {
      message = `${actorPrefix}${actorName} 使用【净化】！`;
      const ownTeam = actor.side === 'player' ? battle.playerTeam : battle.enemyTeam;
      let anyCleansed = false;
      ownTeam.forEach(u => {
        // 每个目标独立结算净化概率
        const cleanseProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        if (Math.random() < cleanseProb) {
          const before = u.marks.length;
          u.marks = u.marks.filter(m => !['bind', 'lock', 'poison', 'burn', 'smoke', 'delay'].includes(m.type));
          if (u.marks.length < before) anyCleansed = true;
        }
      });
      if (anyCleansed) {
        message += ' 清除部分负面状态！';
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
        const burnProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
        if (Math.random() < burnProb) {
          if (battle.addMark(unit, 'burn', 1, {}, battle)) {
            message += ' 燃烧成功！';
          } else {
            message += ' 目标已燃烧。';
          }
        } else {
          message += ' 灼烧技能失败。';
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
            // 每个额外目标独立结算概率
            const burnProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
            if (Math.random() < burnProb) {
              if (battle.addMark(e, 'burn', 1, {}, battle)) {
                message += ` ${e.name}燃烧！`;
              } else {
                message += ` ${e.name}已燃烧。`;
              }
            } else {
              message += ` ${e.name}燃烧技能失败。`;
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
      const [side, idx] = unpack(target);
      const unit = getTargetBySideIndex(side, idx);
      if (unit && unit.alive) {
        // 先进行普攻
        const dmgResult = resolveAttack(actor, unit, battle);
        message = `${actorPrefix}${actorName} 使用【浓烟弥漫】！` + dmgResult.message;
        // 再为攻击范围内随机2名敌人附加烟雾
        const opposing = getOpposingTeam();
        const enemiesInRange = opposing.filter(e => e.alive && inRange(battle, actor, e));
        const targets = enemiesInRange.sort(() => Math.random() - 0.5).slice(0, 2);
        if (targets.length === 0) {
          message += ' 攻击范围内无其他敌人可附加烟雾。';
        } else {
          targets.forEach(e => {
            // 每个目标独立结算概率
            const smokeProb = getActualProb(skill.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, skill.baseProb);
            if (Math.random() < smokeProb) {
              if (battle.addMark(e, 'smoke', 1, {}, battle)) {
                message += ` ${e.name}被烟雾笼罩！`;
              } else {
                message += ` ${e.name}已有烟雾标记。`;
              }
            } else {
              message += ` ${e.name}抵御了烟雾。`;
            }
          });
        }
      } else {
        message = `${actorPrefix}${actorName} 使用【浓烟弥漫】，目标无效。`;
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