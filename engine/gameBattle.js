// engine/gameBattle.js - 战斗相关逻辑（战斗辅助、Boss战、战斗流程）
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { BattleSystem } from './battle.js';
import { findCharacterDef } from './utilsCore.js';
import { playFightMusic, stopCityMusic, startStoryMusicTransition, endStoryMusicTransition } from './gameMusic.js';
import { DialogueEngine } from './dialogue.js';
import { handleBeastForestBattleWin } from './gameBeastForest.js';

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

    // 邪火凤凰马红俊：魂技为爆裂
    if (bossDef.enemyId === 'boss_mhj') {
        if (!enemyData.skills.includes('爆裂')) {
            enemyData.skills.push('爆裂');
        }
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
    
    // 检测是否为魂兽森林战斗
    if (app._beastForestBossInfo) {
        handleBeastForestBattleWin();
        return;
    }
    
    const stage = app.config.stages.levels[app.currentLevel];
    if (app.battle) {
        app.battleLog.push("战斗胜利！");
    }
    if (!isBoss) {
        // 每个敌方单位各自掉落随机金币
        const enemyUnits = app.battle ? app.battle.enemyTeam : [];
        let totalGold = 0;
        for (let i = 0; i < enemyUnits.length; i++) {
            totalGold += Math.floor(Math.random() * 5) + 3;
        }
        app.player.gold = (app.player.gold || 0) + totalGold;
        setMoveTip(`战斗胜利！获得 ${totalGold} 金魂币（${enemyUnits.length}人掉落）`);
        app.state = 'MAZE'; app.battle = null; return;
    }
    if (!stage?.bosses) { goToTown(true); return; }
    const bossDef = stage.bosses[app.currentBossPhase];
    if (!bossDef) { goToTown(true); return; }
    if (bossDef.dialogAfter) {
        const file = (app.currentLevel===0) ? 'chapter1_ws_xw.txt' : (app.currentLevel===2) ? 'chapter3_fld.txt' : (app.currentLevel===3) ? 'chapter4_mhj.txt' : 'chapter2_dmb.txt';
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
        // 通关史莱克学院门口的战斗塔（关卡索引2）后标记已通关
        if (app.currentLevel === 2) {
            app.shrekBattleTowerCleared = true;
        }
        // 通关邪火凤凰马红俊关卡（关卡索引3）后标记剧情完成
        if (app.currentLevel === 3) {
            app.mhjStoryCompleted = true;
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

    // 检查是否全灭（有3位及以上角色时）
    const aliveCount = app.party.filter(m => m.alive !== false).length;
    const totalCount = app.party.length;
    if (totalCount >= 3 && aliveCount === 0) {
        // 唐三1血复活
        const ts = app.party.find(m => m.id === 'ts');
        if (ts) {
            ts.hp = 1;
            ts.alive = true;
        }
        if (app.player) {
            app.player.hp = 1;
            app.player.alive = true;
        }
    }

    // 非Boss战（小怪战）全灭时弹出提示
    const isMobFight = !app.maze?.isBossCell();
    if (isMobFight && aliveCount === 0) {
        goToTown(true);
        // 延迟弹出提示，确保主城已加载
        setTimeout(() => {
            showBattleLossHint();
        }, 300);
        return;
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
    const file = (app.currentLevel===0) ? 'chapter1_ws_xw.txt' : (app.currentLevel===2) ? 'chapter3_fld.txt' : (app.currentLevel===3) ? 'chapter4_mhj.txt' : 'chapter2_dmb.txt';

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
    if (itemType === 'wanghun') {
        // 忘魂草：仅对只有1个魂环的角色生效，移除第一魂技和第一魂环
        const eligible = app.party.filter(m => m.soulRings && m.soulRings.length === 1);
        if (eligible.length === 0) { setMoveTip("没有符合条件的角色（仅对拥有1个魂环的角色生效）"); return false; }
        showForgetSkillDialog(eligible);
        return false; // 不立即关闭背包，由对话框处理
    }
    return false;
}

function showForgetSkillDialog(eligible) {
    app.dialogActive = true;
    const container = document.createElement('div');
    container.id = 'forget-skill-dialog';
    container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Segoe UI';
        padding: 30px 40px;
        box-sizing: border-box;
        z-index: 3000;
        border-radius: 12px;
        border: 2px solid #e74c3c;
        text-align: center;
    `;
    container.innerHTML = `
        <div style="font-size:20px; margin-bottom:15px; color:#e74c3c;">🌿 忘魂草</div>
        <div style="font-size:16px; line-height:1.6; margin-bottom:20px;">
            选择要遗忘第一魂技的角色（仅拥有1个魂环的角色）：
        </div>
        <div id="forget-char-list"></div>
        <button id="forget-cancel-btn" style="
            display:block; margin:15px auto 0; padding:10px 30px;
            background:#666; color:white; border:none; border-radius:8px;
            cursor:pointer; font-size:16px;
        ">取消</button>
    `;
    document.body.appendChild(container);

    const listDiv = document.getElementById('forget-char-list');
    eligible.forEach((char, index) => {
        const btn = document.createElement('button');
        btn.style.cssText = `
            display:block; margin:8px 0; padding:12px 15px; width:100%;
            background:#2a3a4a; color:white; border:2px solid ${char.color || '#4a90e2'}; border-radius:8px;
            cursor:pointer; font-size:16px; text-align:left;
            transition: background 0.2s;
        `;
        const skillName = char.skills && char.skills.length > 0 ? char.skills[0] : '未知';
        btn.innerHTML = `
            <div style=" font-size:18px; color:${char.color || '#4a90e2'};">${char.name} · ${char.wuhun}</div>
            <div style="font-size:13px; color:#aaa; margin-top:4px;">
                第一魂技：${skillName}
            </div>
        `;
        btn.onmouseover = () => btn.style.background = '#3a5a6f';
        btn.onmouseout = () => btn.style.background = '#2a3a4a';
        btn.onclick = () => {
            // 显示确认对话框
            showForgetConfirmDialog(char, skillName, container);
        };
        listDiv.appendChild(btn);
    });

    document.getElementById('forget-cancel-btn').onclick = () => {
        if (container.parentNode) container.parentNode.removeChild(container);
        app.dialogActive = false;
    };
}

// 忘魂草确认对话框（游戏内样式）
function showForgetConfirmDialog(char, skillName, parentContainer) {
    const confirmContainer = document.createElement('div');
    confirmContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 380px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Segoe UI';
        padding: 30px 35px;
        box-sizing: border-box;
        z-index: 3100;
        border-radius: 12px;
        border: 2px solid #e74c3c;
        text-align: center;
    `;
    confirmContainer.innerHTML = `
        <div style="font-size:22px; margin-bottom:15px; color:#e74c3c;">⚠️ 确认遗忘</div>
        <div style="font-size:16px; line-height:1.8; margin-bottom:20px;">
            确定要遗忘 <strong style="color:${char.color || '#4a90e2'};">${char.name}</strong> 的第一魂技<br>
            「<strong style="color:#f39c12;">${skillName}</strong>」吗？
        </div>
        <div style="display:flex; gap:12px; justify-content:center;">
            <button id="forget-confirm-yes" style="
                padding:10px 30px;
                background:#e74c3c; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:16px; 
            ">确认遗忘</button>
            <button id="forget-confirm-no" style="
                padding:10px 30px;
                background:#666; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:16px;
            ">取消</button>
        </div>
    `;
    document.body.appendChild(confirmContainer);

    document.getElementById('forget-confirm-yes').onclick = () => {
        // 移除第一魂技和第一魂环
        if (char.skills && char.skills.length > 0) char.skills.shift();
        if (char.soulRings && char.soulRings.length > 0) char.soulRings.shift();
        app.inventory.wanghun = (app.inventory.wanghun || 1) - 1;

        // 关闭确认对话框
        if (confirmContainer.parentNode) confirmContainer.parentNode.removeChild(confirmContainer);
        // 关闭忘魂草选择对话框
        if (parentContainer.parentNode) parentContainer.parentNode.removeChild(parentContainer);
        app.dialogActive = false;

        // 关闭背包面板
        const backpackPanel = document.getElementById('backpack-panel');
        if (backpackPanel) {
            backpackPanel.style.display = 'none';
        }

        setMoveTip(`${char.name} 的第一魂技已被遗忘！`);
    };

    document.getElementById('forget-confirm-no').onclick = () => {
        if (confirmContainer.parentNode) confirmContainer.parentNode.removeChild(confirmContainer);
    };
}

// 战斗失败提示对话框（小怪全灭时弹出）
function showBattleLossHint() {
    const hintContainer = document.createElement('div');
    hintContainer.id = 'battle-loss-hint';
    hintContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 420px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Segoe UI';
        padding: 30px 35px;
        box-sizing: border-box;
        z-index: 3100;
        border-radius: 12px;
        border: 2px solid #e74c3c;
        text-align: center;
    `;
    hintContainer.innerHTML = `
        <div style="font-size:28px; margin-bottom:10px;">💀</div>
        <div style="font-size:20px; margin-bottom:15px; color:#e74c3c;">战斗失败</div>
        <div style="font-size:16px; line-height:1.8; margin-bottom:20px;">
            如果战斗中生命状态不佳，<br>
            建议点击下方<strong style="color:#f39c12;">主城</strong>按钮补给之后再返回战斗塔哦！
        </div>
        <button id="battle-loss-ok-btn" style="
            padding:10px 40px;
            background:#2ecc71; color:white; border:none; border-radius:8px;
            cursor:pointer; font-size:16px; 
        ">知道了</button>
    `;
    document.body.appendChild(hintContainer);

    document.getElementById('battle-loss-ok-btn').onclick = () => {
        if (hintContainer.parentNode) hintContainer.parentNode.removeChild(hintContainer);
    };
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
 