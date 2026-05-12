import { calcDerivedStats, STRONG_AGAINST } from './battleUtils.js';
import { getSkillById } from './skills.js';
import { applyTalent } from './talents.js';
import { initUnit, assignFormation, buildTurnOrder, getEffectiveRange, checkAndAdvanceLines } from './battleInit.js';
import { addMark, removeMark, hasMark, applyStartTurnEffects, applyEndTurnEffects } from './battleMark.js';
import { resolveAttack, inRange } from './battleAttack.js';
import { executeSkill } from './battleSkill.js';
import { app } from './gameState.js';

const FORMATIONS = ['front-back-front', 'back-front-back', 'front-front-front'];

// 攻击技能类型集合
const ATTACK_SKILL_TYPES = new Set([
  'normal', 'bind', 'lock', 'brute', 'poison', 'spread_poison',
  'burn', 'burn_mass', 'thunder_emp', 'thunder_mass', 'speed_up_self', 'smoke'
]);

export class BattleSystem {
  constructor(playerUnits, enemyUnits, options = {}) {
    const allLevels = playerUnits.concat(enemyUnits).map(u => u.level || 1);
    this.maxLevel = allLevels.length > 0 ? Math.max(...allLevels) : 1;

    this.playerTeam = playerUnits.slice(0, 3).map(u => initUnit(u, 'player', this.maxLevel));
    this.enemyTeam  = enemyUnits.slice(0, 3).map(u => initUnit(u, 'enemy', this.maxLevel));

    this.playerFormation = options.playerFormation ||
      FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
    this.enemyFormation  = options.enemyFormation ||
      FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];

    assignFormation(this.playerTeam, this.playerFormation);
    assignFormation(this.enemyTeam, this.enemyFormation);

    this.oneTurnTrigger = options.oneTurnTrigger || false;

    this.turnOrder = buildTurnOrder(this.playerTeam, this.enemyTeam);
    this.currentTurnIndex = 0;
    this.log = "战斗开始！";
    this.finished = false;
    this.winner = null;
    this.turnCount = 0;
    this.playerActed = false;
    this.effectsAppliedThisRound = new Set();

    // 日志历史
    app.battleLog = ["战斗开始！"];

    [...this.playerTeam, ...this.enemyTeam].forEach(u => {
        if (!u.marks) u.marks = [];
        if (!u.permanentBuffs) u.permanentBuffs = {};
    });
  }

  setLog(message) {
    this.log = message;
    app.battleLog.push(message);
  }

  getCurrentActor() {
    if (this.finished) return null;
    while (this.currentTurnIndex < this.turnOrder.length) {
      const actor = this.turnOrder[this.currentTurnIndex];
      if (actor && actor.alive) {
        if (!this.effectsAppliedThisRound.has(actor)) {
          actor.spirit = Math.min(actor.maxSpirit, actor.spirit + (actor.spiritRecovery || 1));
          applyStartTurnEffects(actor, this);
          this.effectsAppliedThisRound.add(actor);
        }
        return actor;
      }
      this.currentTurnIndex++;
    }
    this.turnOrder = buildTurnOrder(this.playerTeam, this.enemyTeam);
    this.currentTurnIndex = 0;
    this.turnCount++;
    this.effectsAppliedThisRound.clear();
    app.battleLog.push(`== 第 ${this.turnCount} 回合 ==`);
    return this.getCurrentActor();
  }

  advanceTurn() {
    const actor = this.turnOrder[this.currentTurnIndex];
    if (actor) applyEndTurnEffects(actor, this);
    this.currentTurnIndex++;
    checkAndAdvanceLines(this);
    if (this.currentTurnIndex >= this.turnOrder.length) {
      this.turnOrder = buildTurnOrder(this.playerTeam, this.enemyTeam);
      this.currentTurnIndex = 0;
      this.turnCount++;
      this.effectsAppliedThisRound.clear();
      app.battleLog.push(`== 第 ${this.turnCount} 回合 ==`);
    }
    this._checkVictory();
  }

  _checkVictory() {
    const playerAlive = this.playerTeam.some(u => u.alive);
    const enemyAlive = this.enemyTeam.some(u => u.alive);
    if (!playerAlive) {
      this.finished = true;
      this.winner = 'enemy';
      this.setLog("队伍全灭...");
    } else if (!enemyAlive) {
      this.finished = true;
      this.winner = 'player';
      this.setLog("敌人全灭！");
    }
  }

  getEffectiveRange(unit) {
    return getEffectiveRange(unit, this.turnCount);
  }

  addMark(unit, type, duration, extra) {
    addMark(unit, type, duration, extra, this);
  }

  removeMark(unit, markType) {
    removeMark(unit, markType);
  }

  hasMark(unit, markType) {
    return hasMark(unit, markType);
  }

  getValidTargets(attacker) {
    if (attacker.side !== 'player') {
      // 敌人AI获取目标：敌方（玩家）存活且在范围内
      if (!attacker || attacker.side !== 'enemy') return [];
      return this.playerTeam.reduce((arr, unit, i) => {
        if (unit.alive && inRange(this, attacker, unit)) arr.push(i);
        return arr;
      }, []);
    }
    return this.enemyTeam.reduce((arr, enemy, i) => {
      if (enemy.alive && inRange(this, attacker, enemy)) arr.push(i);
      return arr;
    }, []);
  }

  getAllyTargets(attacker) {
    if (attacker.side === 'player') {
      return this.playerTeam.reduce((arr, unit, i) => {
        if (unit.alive) arr.push(i);
        return arr;
      }, []);
    } else {
      return this.enemyTeam.reduce((arr, unit, i) => {
        if (unit.alive) arr.push(i);
        return arr;
      }, []);
    }
  }

  getTargetsForSkill(actor, skillId) {
    const skill = getSkillById(skillId);
    if (!skill) return [];
    if (skill.target === 'self' || skill.target === 'all_ally') return [];
    if (skill.target === 'ally') return this.getAllyTargets(actor).map(idx => ({ side: actor.side, index: idx }));
    // 敌方目标
    if (actor.side === 'player') {
      return this.getValidTargets(actor).map(idx => ({ side: 'enemy', index: idx }));
    } else {
      return this.getValidTargets(actor).map(idx => ({ side: 'player', index: idx }));
    }
  }

  getAvailableSkills(actor) {
    const skills = [];
    skills.push({ id: 'normal', name: '普通攻击', cost: 0, type: 'normal', desc: '基本攻击' });
    if (this.hasMark(actor, 'lock')) return skills;
    if (!actor.skillIds) return skills;
    for (let skillId of actor.skillIds) {
      const skill = getSkillById(skillId);
      if (!skill) continue;
      // 跳过被动技能（不消耗SP，不显示在主动技能栏）
      if (skill.cost === undefined) continue;
      let cost = skill.cost;
      if (actor.talent && actor.talent.onSkillCost) cost = actor.talent.onSkillCost(skill, actor);
      if (actor.spirit >= cost) skills.push({ ...skill, actualCost: cost });
      else skills.push({ ...skill, actualCost: cost, disabled: true });
    }
    return skills;
  }

  // 判断技能是否为攻击技能
  isAttackSkill(skillId) {
    if (skillId === 'normal') return true;
    const skill = getSkillById(skillId);
    return skill ? ATTACK_SKILL_TYPES.has(skill.type) : false;
  }

  // 判断技能是否为其他技能（非攻击技能）
  isOtherSkill(skillId) {
    if (skillId === 'normal') return false;
    return !this.isAttackSkill(skillId);
  }

  playerAttack(attackerIndex, targetIndex) {
    const attacker = this.playerTeam[attackerIndex];
    const target = this.enemyTeam[targetIndex];
    if (!attacker || !attacker.alive || !target || !target.alive) return null;

    const result = resolveAttack(attacker, target, this);

    if (attacker.talent?.name === '邪火余烬' && target.alive) {
      this.addMark(target, 'burn');
      result.message += ' 附加燃烧！';
    }

    this.setLog(result.message);
    this.playerActed = true;
    this.advanceTurn();

    if (this.oneTurnTrigger && !this.finished) {
      this.finished = true;
      this.winner = 'player';
      this.setLog(result.message + ' 战斗短暂交锋后，对方停了下来。');
    }
    return result;
  }

  // ---------- 敌方AI ----------
  enemyAI() {
    const actor = this.turnOrder[this.currentTurnIndex];
    if (!actor || actor.side !== 'enemy' || !actor.alive) return;

    // 被缠绕直接跳过（已经在 getCurrentActor 中处理，但以防万一）
    if (this.hasMark(actor, 'bind')) {
      this.setLog(`${actor.name} 被缠绕，无法行动！`);
      this.removeMark(actor, 'bind');
      this.advanceTurn();
      return;
    }

    // 检查是否有 _useShieldFirst 标记（认真戴沐白第一回合放肉盾）
    if (actor._useShieldFirst && this.turnCount === 0) {
      const shieldSkill = this.getAvailableSkills(actor).find(s => s.id === '肉盾');
      if (shieldSkill && !shieldSkill.disabled) {
        this.executeSkill(actor, '肉盾', null);
        return;
      }
    }

    // 获取所有可用技能（含普攻）
    const allSkills = this.getAvailableSkills(actor);
    // 分离攻击技和其他技（仅看类型，不考虑SP，因为后面会筛选）
    const attackSkills = allSkills.filter(s => this.isAttackSkill(s.id) && !s.disabled);
    const otherSkills = allSkills.filter(s => this.isOtherSkill(s.id) && !s.disabled);


    const isPowerType = (actor.force >= actor.intel); // 力系：力量>=智力
    let chooseAttack = false; // 是否选择攻击技能

    if (isPowerType) {
      // 力系：70% 攻击，30% 其他
      chooseAttack = Math.random() < 0.7;
    } else {
      // 智系：70% 其他，30% 攻击
      chooseAttack = Math.random() < 0.3;
    }

    // 尝试用攻击技能
    const tryAttack = () => {
      if (attackSkills.length === 0) return false;
      // 按SP消耗降序排列
      const sorted = [...attackSkills].sort((a, b) => (b.actualCost || b.cost) - (a.actualCost || a.cost) || b.cost - a.cost);
      const maxCost = sorted[0].actualCost ?? sorted[0].cost;
      const candidates = sorted.filter(s => (s.actualCost ?? s.cost) === maxCost);
      const chosenSkill = candidates[Math.floor(Math.random() * candidates.length)];

      let target = null;
      if (chosenSkill.id === 'normal') {
        // 普通攻击：需要攻击范围内的敌方目标
        const validTargets = this.getValidTargets(actor);
        if (validTargets.length === 0) return false;
        // 选择血量最低的
        const targets = validTargets.map(i => this.playerTeam[i]);
        const minHp = Math.min(...targets.map(t => t.hp));
        const lowest = validTargets.filter(i => this.playerTeam[i].hp === minHp);
        target = { side: 'player', index: lowest[Math.floor(Math.random() * lowest.length)] };
        // 执行普通攻击（使用 resolveAttack 并推进回合）
        const defender = this.playerTeam[target.index];
        const result = resolveAttack(actor, defender, this);
        if (actor.talent?.name === '邪火余烬' && defender.alive) {
          this.addMark(defender, 'burn');
          result.message += ' 附加燃烧！';
        }
        this.setLog(result.message);
      } else {
        // 攻击技能：需要获取该技能的目标列表
        const targets = this.getTargetsForSkill(actor, chosenSkill.id);
        if (!targets || targets.length === 0) return false;
        // 选择血量最低的敌方
        const targetUnits = targets.map(t => {
          const team = t.side === 'player' ? this.playerTeam : this.enemyTeam;
          return { index: t.index, unit: team[t.index] };
        }).filter(t => t.unit && t.unit.alive);
        if (targetUnits.length === 0) return false;
        const minHp = Math.min(...targetUnits.map(t => t.unit.hp));
        const lowest = targetUnits.filter(t => t.unit.hp === minHp);
        const chosen = lowest[Math.floor(Math.random() * lowest.length)];
        target = { side: 'player', index: chosen.index }; // 攻击技能目标始终是玩家方

        // 执行技能
        this.executeSkill(actor, chosenSkill.id, target);
        // executeSkill 内部会推进回合，不需要再手动 advance
        return true;
      }

      this.playerActed = true;
      this.advanceTurn();
      return true;
    };

    // 尝试用其他技能
    const tryOther = () => {
      if (otherSkills.length === 0) return false;
      // 按SP消耗降序排列
      const sorted = [...otherSkills].sort((a, b) => (b.actualCost || b.cost) - (a.actualCost || a.cost) || b.cost - a.cost);
      const maxCost = sorted[0].actualCost ?? sorted[0].cost;
      const candidates = sorted.filter(s => (s.actualCost ?? s.cost) === maxCost);
      const chosenSkill = candidates[Math.floor(Math.random() * candidates.length)];

      let target = null;
      const skill = getSkillById(chosenSkill.id);
      if (!skill) return false;

      // 根据技能目标类型选择目标
      if (skill.target === 'self') {
        target = null; // 自释放
      } else if (skill.target === 'ally') {
        // 随机选择一个友方存活单位
        const allies = this.getAllyTargets(actor);
        if (allies.length === 0) return false;
        target = { side: actor.side, index: allies[Math.floor(Math.random() * allies.length)] };
      } else if (skill.target === 'all_ally') {
        target = null; // 全体友方，executeSkill 会自己处理
      } else {
        // 其他目标（理论不会出现，因为其他技能不应有攻击型目标）
        return false;
      }

      this.executeSkill(actor, chosenSkill.id, target);
      // executeSkill 内部会推进回合
      return true;
    };

    // 主要选择逻辑
    let acted = false;
    if (chooseAttack) {
      acted = tryAttack();
      if (!acted) acted = tryOther(); // 攻击失败，尝试用其他技能
    } else {
      acted = tryOther();
      if (!acted) acted = tryAttack(); // 其他技能失败，退回去用攻击
    }

    // 如果仍然无法行动（例如没有任何可用技能或目标），跳过
    if (!acted) {
      this.setLog(`${actor.name} 无法行动，跳过。`);
      this.playerActed = true;
      this.advanceTurn();
    }
  }

  executeSkill(actor, skillId, target) {
    if (skillId === 'normal') {
      const idx = this.playerTeam.indexOf(actor);
      if (idx === -1) return null;
      if (typeof target === 'object') return this.playerAttack(idx, target.index);
      return this.playerAttack(idx, target[0]);
    }
    return executeSkill(actor, skillId, target, this);
  }

  skipPlayerTurn() {
    const actor = this.turnOrder[this.currentTurnIndex];
    if (!actor || actor.side !== 'player' || !actor.alive) return;
    this.setLog(`${actor.name} 跳过行动。`);
    this.playerActed = true;
    this.advanceTurn();
    if (this.oneTurnTrigger && !this.finished) {
      this.finished = true;
      this.winner = 'player';
      this.setLog(this.log + ' 战斗短暂交锋后，对方停了下来。');
    }
  }
}