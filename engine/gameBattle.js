// engine/gameBattle.js - 战斗相关逻辑（战斗辅助、Boss战、战斗流程）
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { BattleSystem } from './battle.js';
import { findCharacterDef } from './utilsCore.js';
import { playFightMusic, stopCityMusic, startStoryMusicTransition, endStoryMusicTransition } from './gameMusic.js';
import { DialogueEngine } from './dialogue.js';

let dialogueEngine = null;

export function initDialogue() {
    dialogueEngine = new DialogueEngine();
    app.dialogueEngine = dialogueEngine;
}

/**
 * 开始剧情对话（播放剧情音乐，结束后恢复背景音乐）
 */
export function startStoryDialogue(eventName, fileName, onComplete) {
    if (!dialogueEngine) {
        console.error('DialogueEngine not initialized');
        if (onComplete) onComplete();
        return;
    }
    startStoryMusicTransition();
    const wrappedCallback = () => {
        endStoryMusicTransition(onComplete);
    };
    dialogueEngine.startEvent(eventName, fileName, wrappedCallback);
}

// 为了兼容性，保留 startDialogue 作为 startStoryDialogue 的别名
export async function startDialogue(eventName, fileName, onComplete) {
    return startStoryDialogue(eventName, fileName, onComplete);
}

function syncPartyHP() {
    if (!app.battle) return;
    for (let i = 0; i < app.party.length; i++) {
        const member = app.party[i];
        const battleUnit = app.battle.playerTeam.find(u => u.name === member.name && u.side === 'player');
        if (battleUnit) {
            member.hp = battleUnit.hp;
            member.alive = battleUnit.alive;
        }
    }
    const ts = app.party.find(m => m.id === 'ts');
    if (ts && app.player) {
        app.player.hp = ts.hp;
        app.player.maxHp = ts.maxHp;
        app.player.alive = ts.alive;
    }
}

// 根据 activeTeam 构建战斗单位数据
function buildUnitsFromActiveTeam(level = 1) {
    const units = [];
    for (const id of app.activeTeam) {
        if (!id) continue;
        const member = app.party.find(m => m.id === id);
        if (member && member.alive !== false) {
            units.push({
                name: member.name,
                wuhun: member.wuhun,
                level: member.level,
                skills: member.skills || [],
                chosenAffinity: member.chosenAffinity || app.wuhunDatabase[member.wuhun]?.mainAffinity || '巨兽',
                color: member.color || '#4a90e2',
                hp: member.hp,
                maxHp: member.maxHp,
                alive: member.alive
            });
        }
    }
    return units;
}

// 从所有存活队友构建单位（后备方案）
export function buildUnitsFromParty(level = 1) {
    const activeUnits = buildUnitsFromActiveTeam(level);
    if (activeUnits.length > 0) return activeUnits;
    return app.party.filter(m => m.alive !== false).slice(0, 3).map(m => ({
        name: m.name,
        wuhun: m.wuhun,
        level: m.level,
        skills: m.skills || [],
        chosenAffinity: m.chosenAffinity || app.wuhunDatabase[m.wuhun]?.mainAffinity || '巨兽',
        color: m.color || '#4a90e2',
        hp: m.hp,
        maxHp: m.maxHp,
        alive: m.alive
    }));
}

function randomAffinities() {
    const all = ['烈焰', '苍木', '蛊毒', '巨兽', '雷霆', '沧澜', '天工'];
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return { main: shuffled[0], sub: shuffled[1] };
}

// 从角色数据库构建敌人单位
export function buildEnemyFromMonster(monsterId, level = 1, randomAff = false) {
    const charDef = findCharacterDef(monsterId);
    if (!charDef) {
        const aff = randomAff ? randomAffinities() : { main: '巨兽', sub: '雷霆' };
        return {
            name: '野怪',
            wuhun: '豹子',
            level: level || 1,
            skills: [],
            chosenAffinity: aff.main,
            subAffinity: aff.sub,
            color: '#e74c3c'
        };
    }
    const wuhun = app.wuhunDatabase[charDef.wuhun];
    if (!wuhun) {
        return {
            name: charDef.name,
            wuhun: charDef.wuhun || '豹子',
            level: charDef.level || level,
            skills: [],
            chosenAffinity: '巨兽',
            subAffinity: '雷霆',
            color: charDef.color || '#e74c3c'
        };
    }
    let skills = [];
    if (wuhun.innateSkill) skills.push(wuhun.innateSkill);
    const pool = wuhun.availableSkillIds.filter(s => s !== wuhun.innateSkill);
    while (skills.length < Math.min(pool.length, 2)) {
        const r = pool[Math.floor(Math.random() * pool.length)];
        if (!skills.includes(r)) skills.push(r);
    }
    return {
        name: charDef.name,
        wuhun: charDef.wuhun,
        level: charDef.level || level,
        skills: skills,
        chosenAffinity: charDef.chosenAffinity || wuhun.mainAffinity,
        subAffinity: wuhun.subAffinity,
        color: charDef.color || '#e74c3c'
    };
}

export function startBossFight(bossDef) {
    stopCityMusic();
    playFightMusic();

    const enemyData = buildEnemyFromMonster(bossDef.enemyId, 1, false);
    if (!enemyData) return;

    if (bossDef.enemyId === 'boss_dmb') {
        if (!enemyData.skills.includes('肉盾')) {
            enemyData.skills.push('肉盾');
        }
        enemyData._useShieldFirst = true;
    }

    const enemyUnits = [enemyData];
    const playerUnits = buildUnitsFromParty(1);
    app.battle = new BattleSystem(playerUnits, enemyUnits, {
        playerFormation: app.selectedFormation,
        oneTurnTrigger: bossDef.oneTurnTrigger || false
    });
    app.state = 'BATTLE';
    app.battleTargeting = false;
    app.battleSkillMode = false;
    app.selectedSkill = null;
    setMoveTip('⚔️ Boss战！');
}

export function performAttack(targetIndex) {
    if (app.state !== 'BATTLE' || !app.battle || app.battle.finished) return;
    const actor = app.battle.getCurrentActor();
    if (!actor || actor.side !== 'player') return;
    const idx = app.battle.playerTeam.indexOf(actor);
    if (idx === -1) return;
    try {
        app.battle.playerAttack.call(app.battle, idx, targetIndex);
    } catch (e) {
        console.error(e);
        setMoveTip(`攻击失败: ${e.message}`);
        return;
    }
    app.battleTargeting = false;
    if (app.battle.finished) setTimeout(() => {
        if (app.battle.winner === 'player') onBattleWin(app.maze && app.maze.isBossCell());
        else onBattleLoss();
    }, 1000);
}

export function skipPlayerTurn() {
    if (!app.battle || app.battle.finished) return;
    app.battle.skipPlayerTurn();
    app.battleTargeting = false;
    app.battleSkillMode = false;
    app.selectedSkill = null;
    if (app.battle.finished) setTimeout(() => {
        if (app.battle.winner === 'player') onBattleWin(app.maze && app.maze.isBossCell());
        else onBattleLoss();
    }, 1000);
}

export function onBattleWin(isBoss) {
    syncPartyHP();
    const stage = app.config.stages.levels[app.currentLevel];
    if (app.battle) {
        app.battleLog.push("战斗胜利！");
    }
    if (!isBoss) {
        app.player.gold = (app.player.gold || 0) + Math.floor(Math.random()*5)+3;
        setMoveTip(`战斗胜利！获得 ${Math.floor(Math.random()*5)+3} 金魂币`);
        app.state = 'MAZE'; app.battle = null; return;
    }
    if (!stage?.bosses) { goToTown(true); return; }
    const bossDef = stage.bosses[app.currentBossPhase];
    if (!bossDef) { goToTown(true); return; }
    if (bossDef.dialogAfter) {
        const file = (app.currentLevel===0) ? 'chapter1_ws_xw.txt' : (app.currentLevel===2) ? 'chapter3_fld.txt' : 'chapter2_dmb.txt';
        startDialogue(bossDef.dialogAfter, file, () => {
            if (bossDef.lose) handleBossLoss(bossDef);
            else proceedToNextBoss();
        });
    } else proceedToNextBoss();
}

function proceedToNextBoss() {
    syncPartyHP();
    const stage = app.config.stages.levels[app.currentLevel];
    app.currentBossPhase++;
    if (app.currentBossPhase < stage.bosses.length) startBossFight(stage.bosses[app.currentBossPhase]);
    else {
        const next = app.currentLevel + 1;
        if (next < app.config.stages.levels.length && !app.unlockedLevels.includes(next)) {
            app.unlockedLevels.push(next); app.unlockedLevels.sort((a,b)=>a-b);
        }
        goToTown(true);
    }
}

export function onBattleLoss() {
    syncPartyHP();
    const stage = app.config.stages.levels[app.currentLevel];
    if (app.battle) {
        app.battleLog.push("战斗失败...");
    }
    if (app.maze?.isBossCell() && stage?.bosses) {
        const bossDef = stage.bosses[app.currentBossPhase];
        if (bossDef?.lose) { handleBossLoss(bossDef); return; }
    }
    if (app.currentLevel === 0) {
        app.showAffinityHint = true;
        setMoveTip("敌人为巨兽系，请在角色界面切换唐三为蛊毒系以克制对手");
    } else {
        setMoveTip("战败昏迷，被送回主城");
    }
    goToTown(true);
}

function handleBossLoss(bossDef) {
    const unlock = () => {
        if (bossDef.finalReward === 'chapter_end') {
            const next = app.currentLevel + 1;
            if (next < app.config.stages.levels.length && !app.unlockedLevels.includes(next)) {
                app.unlockedLevels.push(next); app.unlockedLevels.sort((a,b)=>a-b);
            }
        }
    };
    if (!bossDef.dialogAfter) { unlock(); goToTown(true); return; }
    const file = (app.currentLevel===0) ? 'chapter1_ws_xw.txt' : (app.currentLevel===2) ? 'chapter3_fld.txt' : 'chapter2_dmb.txt';
    startDialogue(bossDef.dialogAfter, file, () => {
        startDialogue('chapter_end', file, () => { unlock(); goToTown(true); });
    });
}

export function handleShopPurchase(item) {
    if (app.player.gold >= item.price) {
        app.player.gold -= item.price; item.effect(); setMoveTip(`购买了 ${item.name}`);
    } else setMoveTip("金魂币不足");
}

export function useBackpackItem(itemType) {
    if (itemType === 'jiupin') {
        const dead = app.party.filter(m => m.alive === false);
        if (!dead.length) { setMoveTip("没有阵亡的队友"); return false; }
        dead[0].hp = 1; dead[0].alive = true;
        app.inventory.jiupin--;
        setMoveTip(`${dead[0].name} 被九品紫芝复活了！`);
        const ts = app.party.find(m => m.id === 'ts');
        if (ts && app.player) { app.player.hp = ts.hp; app.player.maxHp = ts.maxHp; app.player.alive = ts.alive; }
        if (!app.party.some(m => m.alive === false)) app.showResurrectionHint = false;
        return true;
    }
    return false;
}

// 以下函数通过 gameLogic.js 注册，避免循环依赖
// goToTown, startLevel 等由 gameLogic.js 在初始化时注入
export function registerGoToTown(fn) {
    goToTown = fn;
}
export function registerStartLevel(fn) {
    startLevel = fn;
}

let goToTown = function(resetPos = true) {
    console.warn('goToTown not yet registered');
};
let startLevel = function(levelIdx) {
    console.warn('startLevel not yet registered');
};
