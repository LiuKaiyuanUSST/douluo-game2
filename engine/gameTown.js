// engine/gameTown.js - 城镇相关逻辑（城镇移动、商店、关卡选择）
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { MazeManager } from './maze.js';
import { playCityMusic, stopCityMusic, playFightMusic, stopFightMusic } from './gameMusic.js';

export function initTownMap() { app.townPlayerPos = { x: 0, y: 0 }; }

export function goToTown(resetPos = true) {
    if (resetPos) app.townPlayerPos = { x: 0, y: 0 };
    app.state = 'TOWN'; app.maze = null; app.battle = null;
    app.battleTargeting = false; app.battleSkillMode = false; app.selectedSkill = null;
    app.battleEnemyTurnDone = false; app.backpackOpen = false;
    const ts = app.party.find(m => m.id === 'ts');
    if (ts && app.player) {
        app.player.hp = ts.hp; app.player.maxHp = ts.maxHp; app.player.alive = ts.alive;
    }

    // 停止战斗音乐，播放主城背景音乐
    stopFightMusic();
    playCityMusic();

    // 检查是否需要触发小舞武魂选择
    if (app.pendingXiaoWuChoice && !app.xwWuhunChosen) {
        showXiaoWuWuhunChoice();
        return;
    }

    const hasDead = app.party.some(m => m.alive === false);
    if (app.showAffinityHint) {
        setMoveTip("敌人为巨兽系，请在角色界面切换唐三为蛊毒系以克制对手");
        app.lastMoveWasAffinityHint = true;
    } else if (hasDead) {
        app.showResurrectionHint = true;
        setMoveTip("请到商店购买九品紫芝并在背包中使用以复活角色");
    } else {
        app.showResurrectionHint = false;
        setMoveTip("💡 点击相邻格子移动，或使用方向键/WASD");
    }
}

export function tryMoveTown(dx, dy) {
    const townData = app.townMaps[app.currentTown];
    if (!townData) return false;
    const map = townData.map;
    const nx = app.townPlayerPos.x + dx, ny = app.townPlayerPos.y + dy;
    if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5) return false;

    // 第一次移动时触发大师武魂觉醒对话
    if (!app.wuhunChosen && app.currentTown === 'noting') {
        showMasterWuhunChoice();
        return false;
    }

    // 第一次在史莱克学院门口移动时触发伙伴选择对话
    if (app.currentTown === 'shrek' && !app.shrekFirstMoveDone) {
        app.shrekFirstMoveDone = true;
        showShrekPartnerChoice();
        return false;
    }

    // 在史莱克学院地图移动时触发大师对话（猎魂森林引导）
    if (app.currentTown === 'shrek_academy' && !app.shrekAcademyFirstMove) {
        showShrekAcademyMasterDialog();
        return false;
    }

    const targetType = map[ny][nx];
    if (targetType === 1) { openShop(); return false; }
    if (targetType === 2) {
        // 在史莱克学院进入战斗塔时检查是否有魂技
        if (app.currentTown === 'shrek_academy') {
            const hasSkills = app.party.some(m => m.skills && m.skills.length > 0);
            if (!hasSkills) {
                setMoveTip("💡 你的角色还没有任何魂技！请前往猎魂森林猎取魂环获取魂技！");
                return false;
            }
        }
        openLevelSelect();
        return false;
    }
    if (targetType === 5) {
        setMoveTip("💡 猎魂森林尚未开放，敬请期待！");
        return false;
    }
    if (targetType === 3 || targetType === 4) {
        const exitInfo = townData.exits[targetType];
        if (!exitInfo) return false;
        if (app.currentTown === 'noting' && targetType === 3) {
            if (!app.unlockedLevels.includes(1)) { setMoveTip("前方区域尚未开放"); return false; }
        }
        // 在索托城走到下一关出口时触发赵无极报名费对话
        if (app.currentTown === 'suotuo' && targetType === 3 && !app.fldRegistrationDone) {
            showZwjRegistrationDialog();
            return false;
        }
        app.currentTown = exitInfo.targetTown;
        app.townPlayerPos = { ...exitInfo.targetPos };
        // 进入新主城，播放主城背景音乐
        playCityMusic();
        setMoveTip(`前往 ${app.townMaps[app.currentTown].name}`);

        return true;
    }

    app.townPlayerPos = { x: nx, y: ny };
    if (app.lastMoveWasAffinityHint) {
        app.showAffinityHint = false;
        app.lastMoveWasAffinityHint = false;
    }
    const alive = app.party.filter(m => m.alive !== false);
    const dead = app.party.filter(m => m.alive === false);
    if (dead.length > 0) {
        app.showResurrectionHint = true;
        if (alive.length > 0) {
            alive.sort((a,b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
            const t = alive[0];
            if (t.hp < t.maxHp) {
                t.hp = Math.min(t.maxHp, t.hp + 1);
                setMoveTip(`${t.name} 恢复1点生命，当前 ${t.hp}/${t.maxHp}（您的队伍有人倒下了，请到商店购买九品紫芝复活）`);
            } else {
                setMoveTip("您的队伍有人倒下了，请到商店购买九品紫芝并在背包中使用以复活角色");
            }
        } else {
            setMoveTip("您的队伍有人倒下了，请到商店购买九品紫芝并在背包中使用以复活角色");
        }
    } else if (alive.length > 0) {
        alive.sort((a,b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
        const t = alive[0];
        if (t.hp < t.maxHp) {
            t.hp = Math.min(t.maxHp, t.hp + 1);
            setMoveTip(`${t.name} 恢复1点生命，当前 ${t.hp}/${t.maxHp}`);
        } else {
            const townLevelMap = { noting: [0], suotuo: [1], shrek: [2] };
            const currentLevelIndices = townLevelMap[app.currentTown] || [];
            let allCleared = true;
            for (const levelIdx of currentLevelIndices) {
                const nextLevelIdx = levelIdx + 1;
                if (nextLevelIdx < app.config.stages.levels.length) {
                    if (!app.unlockedLevels.includes(nextLevelIdx)) {
                        allCleared = false;
                        break;
                    }
                }
            }
            if (allCleared) {
                setMoveTip("请前往下一关地图");
            } else {
                setMoveTip("请前往战斗塔推进剧情");
            }
        }
    } else setMoveTip("移动了一步（队伍全灭）");
    const ts = app.party.find(m => m.id === 'ts');
    if (ts && app.player) {
        app.player.hp = ts.hp; app.player.maxHp = ts.maxHp; app.player.alive = ts.alive;
    }
    return true;
}

export function openShop() {
    app.state = 'SHOP'; app.battleTargeting = false; app.battleEnemyTurnDone = false;
    app.showResurrectionHint = false;
    setMoveTip("🛒 点击商品购买，或点击「返回主城」");
}

export function openLevelSelect() {
    if (app.levelSelectDiv) return;
    const townLevelMap = { noting: [0], suotuo: [1], shrek: [2] };
    const allowed = townLevelMap[app.currentTown] || [];
    const available = app.unlockedLevels.filter(idx => allowed.includes(idx));
    if (available.length === 0) { setMoveTip("当前区域暂无可用关卡"); return; }
    const div = document.createElement('div');
    div.id = 'level-select-panel';
    div.style.cssText = 'position:fixed; left:30%; top:30%; width:300px; background:#2c3e2f; border:3px solid gold; padding:20px; z-index:1000; text-align:center; color:white;';
    div.innerHTML = '<h3>选择关卡</h3><hr>';
    const list = document.createElement('ul');
    list.style.listStyle = 'none'; list.style.padding = 0;
    for (let idx of available) {
        const stage = app.config.stages.levels[idx];
        const li = document.createElement('li');
        li.style.cssText = 'margin:10px; cursor:pointer; background:#4a6a7f; padding:8px;';
        li.innerText = `${stage.name} (${stage.size}x${stage.size})`;
        li.onclick = () => { document.body.removeChild(div); app.levelSelectDiv = null; startLevel(idx); };
        list.appendChild(li);
    }
    div.appendChild(list);
    const closeBtn = document.createElement('button');
    closeBtn.innerText = '取消'; closeBtn.style.marginTop = '15px';
    closeBtn.onclick = () => { document.body.removeChild(div); app.levelSelectDiv = null; };
    div.appendChild(closeBtn);
    document.body.appendChild(div);
    app.levelSelectDiv = div;
}

export function startLevel(levelIdx) {
    // 离开主城进入迷宫，停止主城音乐，播放战斗副本音乐
    stopCityMusic();
    playFightMusic();

    const stage = app.config.stages.levels[levelIdx];
    if (!stage) return;
    app.currentLevel = levelIdx; app.currentBossPhase = 0;
    app.maze = new MazeManager(stage.size);
    app.state = 'MAZE';

    app.battleTargeting = false; app.battleEnemyTurnDone = false; app.showResurrectionHint = false;
    // 第一次进入关卡时弹出大师武魂克制说明
    if (!app.firstLevelEntered) {
        app.firstLevelEntered = true;
        showAffinityGuideDialog();
        return;
    }
    // 第一次进入第二关时弹出大师提醒
    if (levelIdx === 1 && !app.secondLevelEntered) {
        app.secondLevelEntered = true;
        showSecondLevelHintDialog();
        return;
    }
    setMoveTip(`进入 ${stage.name}，移动到三角形标记 Boss 格`);
}

export function tryMoveMaze(dx, dy) {
    if (app.state !== 'MAZE') return false;
    if (!app.maze.move(dx, dy)) return false;
    if (app.maze.isBossCell()) {
        const stage = app.config.stages.levels[app.currentLevel];
        if (stage.bosses && stage.bosses.length) startBossFight(stage.bosses[0]);
    } else if (Math.random() < 0.2) {
        const count = (app.currentLevel === 1) ? 2 : (app.currentLevel === 2) ? 3 : 1;
        const enemyId = (app.currentLevel === 0) ? 'student' : (app.currentLevel === 2) ? 'beast_outskirt' : 'beast';
        const enemies = [];
        for (let i = 0; i < count; i++) {
            const e = buildEnemyFromMonster(enemyId, 1, true);
            if (e) enemies.push(e);
        }
        if (!enemies.length) {
            enemies.push({
                name:'野怪', wuhun:'豹子', level:1, skills:[],
                chosenAffinity:'巨兽', subAffinity:'雷霆', color:'#e74c3c'
            });
        }
        // 进入战斗，停止主城音乐
        stopCityMusic();

        const players = buildUnitsFromParty(1);
        app.battle = new BattleSystem(players, enemies, {
            playerFormation: app.selectedFormation
        });
        app.state = 'BATTLE'; app.battleTargeting = false; app.battleEnemyTurnDone = false;
        setMoveTip("⚔️ 遭遇小怪！");

    } else {
        const hasDead = app.party.some(m => m.alive === false);
        if (hasDead) {
            setMoveTip("您的队伍有人倒下了，您可以点击下方主城按钮补给后再来挑战哦");
        } else {
            if (Math.random() < 0.3) {
                setMoveTip("如需获取金魂币，您可以选择低等级关卡战斗哦");
            } else {
                setMoveTip("您可以随时点击下方主城按钮回到主城");
            }
        }
    }
    return true;
}

// 以下函数通过 gameLogic.js 注册，避免循环依赖
export function registerShowMasterWuhunChoice(fn) { showMasterWuhunChoice = fn; }
export function registerShowXiaoWuWuhunChoice(fn) { showXiaoWuWuhunChoice = fn; }
export function registerShowShrekPartnerChoice(fn) { showShrekPartnerChoice = fn; }
export function registerShowZwjRegistrationDialog(fn) { showZwjRegistrationDialog = fn; }
export function registerShowAffinityGuideDialog(fn) { showAffinityGuideDialog = fn; }
export function registerShowSecondLevelHintDialog(fn) { showSecondLevelHintDialog = fn; }
export function registerShowShrekAcademyMasterDialog(fn) { showShrekAcademyMasterDialog = fn; }
export function registerBuildEnemyFromMonster(fn) { buildEnemyFromMonster = fn; }
export function registerBuildUnitsFromParty(fn) { buildUnitsFromParty = fn; }
export function registerStartBossFight(fn) { startBossFight = fn; }

let showMasterWuhunChoice = function() { console.warn('showMasterWuhunChoice not registered'); };
let showXiaoWuWuhunChoice = function() { console.warn('showXiaoWuWuhunChoice not registered'); };
let showShrekPartnerChoice = function() { console.warn('showShrekPartnerChoice not registered'); };
let showZwjRegistrationDialog = function() { console.warn('showZwjRegistrationDialog not registered'); };
let showAffinityGuideDialog = function() { console.warn('showAffinityGuideDialog not registered'); };
let showSecondLevelHintDialog = function() { console.warn('showSecondLevelHintDialog not registered'); };
let showShrekAcademyMasterDialog = function() { console.warn('showShrekAcademyMasterDialog not registered'); };
let buildEnemyFromMonster = function() { console.warn('buildEnemyFromMonster not registered'); };
let buildUnitsFromParty = function() { console.warn('buildUnitsFromParty not registered'); };
let startBossFight = function() { console.warn('startBossFight not registered'); };

// Import BattleSystem for maze encounters
import { BattleSystem } from './battle.js';
