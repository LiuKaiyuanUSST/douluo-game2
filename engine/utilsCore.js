// engine/utilsCore.js
import { app } from './gameState.js';
import { calcDerivedStats, recalcDerivedStats } from './battleUtils.js';
import { randomSkillFromAffinity } from './skills.js';
import { applyTalent } from './talents.js';

const SAVE_SLOTS = 3;
function getSaveKey(slot) { return `douluo_save_slot_${slot}`; }

export function createMessageBar() {
  if (document.getElementById('game-message-bar')) return;
  const container = document.getElementById('game-container');
  const bar = document.createElement('div');
  bar.id = 'game-message-bar';
  bar.style.cssText = `
    margin-top: 10px;
    padding: 8px;
    background: rgba(0,0,0,0.7);
    color: #ffcc88;
    font-family: 'Segoe UI', sans-serif;
    font-size: 24px;
    text-align: center;
    border-radius: 5px;
    width: 800px;
    box-sizing: border-box;
    white-space: pre-line;
  `;
  container.parentNode.insertBefore(bar, container.nextSibling);
}

export function setMoveTip(text) {
  let bar = document.getElementById('game-message-bar');
  if (!bar) {
    createMessageBar();
    bar = document.getElementById('game-message-bar');
  }
  // 金魂币不足30时，优先提示（优先级高于其他提示）
  const gold = (app.player && app.player.gold) || 0;
  if (gold < 30) {
    bar.innerText = "您的金魂币余额过少，建议前往低等级地图赚取金币哦";
  } else if (app.showResurrectionHint) {
    bar.innerText = "请到商店购买九品紫芝并在背包中使用以复活角色";
  } else {
    bar.innerText = text;
  }
}

/**
 * 从 characters.json 中查找角色定义
 */
export function findCharacterDef(charId) {
  // 先查 players
  if (app.characterDatabase.players && app.characterDatabase.players[charId]) {
    return app.characterDatabase.players[charId];
  }
  // 再查 enemies
  if (app.characterDatabase.enemies && app.characterDatabase.enemies[charId]) {
    return app.characterDatabase.enemies[charId];
  }
  return null;
}

export async function readConfigs() {
  const loadJson = async (relativePath) => {
    const response = await fetch(relativePath);
    if (!response.ok) throw new Error(`Failed to load ${relativePath}`);
    return await response.json();
  };
  
  // 加载武魂数据库
  app.wuhunDatabase = await loadJson('./config/wuhun.json');
  // 加载角色数据库
  app.characterDatabase = await loadJson('./config/characters.json');
  // 加载关卡配置
  app.config.stages = await loadJson('./config/stages.json');

  if (!app.wuhunDatabase) app.wuhunDatabase = {};
  if (!app.characterDatabase) app.characterDatabase = { players: {}, enemies: {} };
}

/**
 * 根据武魂名创建一个基础角色对象（不包含运行时状态）
 */
export function createCharacter(wuhunName, charName = null, level = 1) {
  const wuhun = app.wuhunDatabase[wuhunName];
  if (!wuhun) {
    console.error(`武魂 ${wuhunName} 不存在`);
    return null;
  }

  const stats = calcDerivedStats(wuhun.baseForce, wuhun.baseSpeed, wuhun.baseIntelligence, 0);

  // 技能选择：从可用技能池中随机抽取2个
  let skills = [];
  const pool = wuhun.availableSkillIds || [];
  while (skills.length < 2 && pool.length > 0) {
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (!skills.includes(r)) skills.push(r);
  }
  skills = skills.slice(0, 6);

  const char = {
    id: charName ? charName.toLowerCase().replace(/\s+/g, '_') : wuhunName.toLowerCase(),
    name: charName || wuhunName,
    wuhun: wuhunName,
    level: level,
    skills: skills,
    exp: {
      '烈焰': 0, '苍木': 0, '蛊毒': 0,
      '巨兽': 0, '雷霆': 0, '沧澜': 0, '天工': 0
    },
    color: getDefaultColor(wuhunName),
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    alive: true,
    gold: 0
  };
  // 应用武魂天赋（用于角色面板显示）
  applyTalent(char);
  return char;
}

function getDefaultColor(wuhunName) {
  const colorMap = {
    '蓝银草': '#4a90e2',
    '柔骨兔': '#e24a90',
    '邪眸白虎': '#f1c40f',
  };
  return colorMap[wuhunName] || '#4a90e2';
}

// ---------- 存档（3个存档位） ----------

const TOWN_NAMES = {
  'noting': '诺丁城',
  'shrek': '史莱克学院门口',
  'shrek_academy': '史莱克学院',
  'suotuo': '索托城'
};

export function getSaveSlotInfo(slot) {
  const json = localStorage.getItem(getSaveKey(slot));
  if (!json) return { exists: false, displayName: '空' };
  try {
    const data = JSON.parse(json);
    if (!data.party || data.party.length === 0) return { exists: false, displayName: '空' };
    const names = data.party.slice(0, 3).map(m => `${m.name} Lv.${m.level}`);
    const townName = TOWN_NAMES[data.currentTown] || data.currentTown || '未知';
    return { exists: true, displayName: `${names.join(' | ')}（${townName}）` };
  } catch (e) {
    return { exists: false, displayName: '损坏' };
  }
}

export function saveGame(slot) {
  const saveData = {
    currentLevel: app.currentLevel,
    unlockedLevels: app.unlockedLevels,
    player: app.player ? {
      id: app.player.id,
      name: app.player.name,
      wuhun: app.player.wuhun,
      level: app.player.level,
      skills: app.player.skills,
      exp: app.player.exp,
      gold: app.player.gold,
      hp: app.player.hp,
      maxHp: app.player.maxHp,
      alive: app.player.alive,
      color: app.player.color
    } : null,
    party: app.party.map(m => ({
      id: m.id,
      name: m.name,
      wuhun: m.wuhun,
      level: m.level,
      skills: m.skills,
      exp: m.exp,
      color: m.color,
      hp: m.hp,
      maxHp: m.maxHp,
      alive: m.alive,
      chosenAffinity: m.chosenAffinity,
      soulRings: m.soulRings
    })),
    inventory: { ...app.inventory },
    currentTown: app.currentTown,
    townPlayerPos: { ...app.townPlayerPos },
    activeTeam: app.activeTeam.slice(),
    selectedFormation: app.selectedFormation,
    wuhunChosen: app.wuhunChosen,
    xwWuhunChosen: app.xwWuhunChosen,
    shrekPartnerChosen: app.shrekPartnerChosen,
    shrekFirstMoveDone: app.shrekFirstMoveDone,
    fldRegistrationDone: app.fldRegistrationDone,
    firstLevelEntered: app.firstLevelEntered,
    secondLevelEntered: app.secondLevelEntered,
    pendingXiaoWuChoice: app.pendingXiaoWuChoice,
    showAffinityHint: app.showAffinityHint
  };
  try {
    localStorage.setItem(getSaveKey(slot), JSON.stringify(saveData));
    setMoveTip(`💾 已保存到存档位 ${slot}`);
  } catch (e) {
    setMoveTip('保存失败：存储空间不足');
  }
}

export function loadGame(slot) {
  const json = localStorage.getItem(getSaveKey(slot));
  if (!json) {
    setMoveTip(`存档位 ${slot} 没有存档`);
    return false;
  }
  try {
    const data = JSON.parse(json);
    app.currentLevel = data.currentLevel;
    app.unlockedLevels = data.unlockedLevels;

    // 恢复队伍
    app.party = data.party.map(m => {
      if (m.wuhun) {
        const wuhun = app.wuhunDatabase[m.wuhun];
        if (!wuhun) {
          console.warn(`武魂 ${m.wuhun} 不存在，使用默认属性`);
          return createCharacter('蓝银草', m.name, m.level);
        }
        const stats = calcDerivedStats(wuhun.baseForce, wuhun.baseSpeed, wuhun.baseIntelligence, 0);
        const member = {
          id: m.id,
          name: m.name,
          wuhun: m.wuhun,
          level: m.level,
          skills: m.skills || [],
          exp: m.exp || { '烈焰':0, '苍木':0, '蛊毒':0, '巨兽':0, '雷霆':0, '沧澜':0, '天工':0 },
          color: m.color || '#4a90e2',
          hp: Math.min(m.hp, stats.maxHp),
          maxHp: stats.maxHp,
          alive: m.alive,
          chosenAffinity: m.chosenAffinity || undefined,
          soulRings: m.soulRings || []
        };
        applyTalent(member);
        return member;
      } else {
        alert('检测到旧版存档，已自动转换为武魂系统，部分数据可能丢失。');
        return createCharacter('蓝银草', m.name, 1);
      }
    });

    // 重建主角快捷引用
    app.player = data.player ? app.party.find(m => m.id === data.player.id) || app.party[0] : app.party[0];
    if (app.player) {
      app.player.gold = data.player.gold || 0;
    }

    app.inventory = data.inventory || { jiupin: 0 };
    app.currentTown = data.currentTown || 'noting';
    app.townPlayerPos = data.townPlayerPos || { x:0, y:0 };
    app.activeTeam = data.activeTeam ? data.activeTeam.slice() : [null, null, null];
    app.selectedFormation = data.selectedFormation || 'front-back-front';
    app.wuhunChosen = data.wuhunChosen || false;
    app.xwWuhunChosen = data.xwWuhunChosen || false;
    app.shrekPartnerChosen = data.shrekPartnerChosen || false;
    app.shrekFirstMoveDone = data.shrekFirstMoveDone || false;
    app.fldRegistrationDone = data.fldRegistrationDone || false;
    app.firstLevelEntered = data.firstLevelEntered || false;
    app.secondLevelEntered = data.secondLevelEntered || false;
    app.pendingXiaoWuChoice = data.pendingXiaoWuChoice || false;
    app.showAffinityHint = data.showAffinityHint || false;

    app.state = 'TOWN';
    app.maze = null;
    app.battle = null;
    app.battleTargeting = false;
    app.battleEnemyTurnDone = false;
    app.backpackOpen = false;
    app.dialogActive = false;

    for (let member of app.party) {
      const wuhun = app.wuhunDatabase[member.wuhun];
      if (wuhun) {
        const stats = calcDerivedStats(wuhun.baseForce, wuhun.baseSpeed, wuhun.baseIntelligence, 0);
        member.maxHp = stats.maxHp;
        member.hp = Math.min(member.hp, member.maxHp);
      }
      member.alive = member.hp > 0;
    }

    setMoveTip(`📂 从存档位 ${slot} 读取成功`);
    return true;
  } catch (e) {
    setMoveTip('存档损坏，无法读取');
    return false;
  }
}
