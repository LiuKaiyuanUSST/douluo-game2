// main.js
import { app, initApp } from './engine/gameState.js';
import {
    readConfigs, createMessageBar, setMoveTip,
    createSaveButton, createReturnToTownButton, createBackpackButton,
    createCharacterButton, createTeamButton, createHelpButton, createButtonRow, loadGame, createCharacter
} from './engine/utils.js';
import { initTownMap, goToTown, startLevel, initDialogue, onBattleWin, onBattleLoss, startDialogue, playCityMusic } from './engine/gameLogic.js';
import { drawTown, drawShop, drawMaze, drawBattle } from './engine/uiRenderer.js';
import { attachMouseHandler, attachKeyboardHandler } from './engine/eventHandlers.js';
import { BattleSystem } from './engine/battle.js';
import { calcDerivedStats } from './engine/battleUtils.js';
import { randomSkillFromAffinity, SKILL_POOL, getSkillById } from './engine/skills.js';

const SPEED_DELAY = { fast: 0, medium: 500, slow: 1000 };

function createInitialParty() {
    // 确保武魂数据库已加载
    if (!app.wuhunDatabase || Object.keys(app.wuhunDatabase).length === 0) {
        console.error('武魂数据库为空，无法创建初始队伍');
        return [];
    }
    // 主角：唐三·蓝银草（小舞在通关第一章后通过对话加入）
    const ts = createCharacter('蓝银草', '唐三', 1);
    if (ts) {
        ts.id = 'ts';
        ts.gold = 50;
        ts.skills = [];  // 初始无魂技
    }
    const party = [];
    if (ts) party.push(ts);
    return party;
}

window.initGame = async function() {
    try {
        initApp();
        createMessageBar();
        const buttonRow = createButtonRow();
        createSaveButton(buttonRow);
        createReturnToTownButton(buttonRow);
        createBackpackButton(buttonRow);
        createCharacterButton(buttonRow);
        createTeamButton(buttonRow);
        createHelpButton(buttonRow);
        await readConfigs();

        app.party = createInitialParty();
        if (app.party.length === 0) {
            setMoveTip("初始化失败：没有可用的角色");
            return;
        }
        app.player = { ...app.party[0], gold: 50, id: app.party[0].id };
        app.activeTeam = [
            app.party.find(m => m.id === 'ts')?.id || null,
            app.party.find(m => m.id === 'xw')?.id || null,
            null
        ];
        app.selectedFormation = 'front-back-front';

        initDialogue();
        initTownMap();
        app.state = 'TOWN';
        app.currentTown = 'noting';
        app.townPlayerPos = { x: 0, y: 0 };
        setMoveTip("");

        // 初始化主城背景音乐（在开场对话期间创建，对话结束后播放）
        if (!app.cityMusic) {
            app.cityMusic = new Audio('music/city1.mp3');
            app.cityMusic.loop = true;
            app.cityMusic.volume = 0.25;
        }


        await startDialogue('intro', 'intro.txt', () => {
            setMoveTip("请移动至战斗塔推进剧情");
            // 开场对话结束后，播放主城背景音乐（通过统一函数，确保currentMusicType正确更新）
            playCityMusic();
        });



        attachMouseHandler();
        attachKeyboardHandler();
        gameLoop();
    } catch (e) {
        console.error('初始化失败:', e);
        app.party = createInitialParty();
        if (app.party.length > 0) {
            app.player = { ...app.party[0], gold: 50, id: app.party[0].id };
        }
        app.state = 'TOWN';
        app.currentTown = 'noting';
        app.townPlayerPos = { x: 0, y: 0 };
        setMoveTip("初始化异常，但已恢复");
        attachMouseHandler();
        attachKeyboardHandler();
        gameLoop();
    }
};

window.startFromSave = async function() {
    try {
        initApp();
        createMessageBar();
        const buttonRow = createButtonRow();
        createSaveButton(buttonRow);
        createReturnToTownButton(buttonRow);
        createBackpackButton(buttonRow);
        createCharacterButton(buttonRow);
        createTeamButton(buttonRow);
        createHelpButton(buttonRow);
        await readConfigs();
        initDialogue();
        initTownMap();

        const loaded = loadGame();
        if (!loaded) {
            app.party = createInitialParty();
            app.player = { ...app.party[0], gold: 50, id: app.party[0].id };
            app.state = 'TOWN';
            app.currentTown = 'noting';
            app.townPlayerPos = { x: 0, y: 0 };
            setMoveTip("💡 点击相邻格子移动");
            app.activeTeam = [
                app.party.find(m => m.id === 'ts')?.id || null,
                app.party.find(m => m.id === 'xw')?.id || null,
                null
            ];
            app.selectedFormation = 'front-back-front';
        }

        // 读档后，如果处于主城状态，播放主城背景音乐
        if (app.state === 'TOWN') {
            if (!app.cityMusic) {
                app.cityMusic = new Audio('music/city1.mp3');
                app.cityMusic.loop = true;
                app.cityMusic.volume = 0.25;
            }
            playCityMusic();
        }


        attachMouseHandler();
        attachKeyboardHandler();
        gameLoop();
    } catch (e) {
        console.error('读档失败:', e);

        app.party = createInitialParty();
        app.player = { ...app.party[0], gold: 50, id: app.party[0].id };
        app.state = 'TOWN';
        app.currentTown = 'noting';
        app.townPlayerPos = { x: 0, y: 0 };
        attachMouseHandler();
        attachKeyboardHandler();
        gameLoop();
    }
};

document.getElementById('new-game-btn').addEventListener('click', () => {
    document.getElementById('ui-layer').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    window.initGame();
});
document.getElementById('load-game-btn').addEventListener('click', () => {
    if (!localStorage.getItem('douluo_save_slot_1')) return;
    document.getElementById('ui-layer').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    window.startFromSave();
});

// 战斗测试
document.getElementById('test-battle-btn').addEventListener('click', async () => {
    document.getElementById('ui-layer').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    initApp();
    createMessageBar();
    const buttonRow = createButtonRow();
    createSaveButton(buttonRow);
    createReturnToTownButton(buttonRow);
    createBackpackButton(buttonRow);
    createCharacterButton(buttonRow);
    createTeamButton(buttonRow);
    createHelpButton(buttonRow);

    try { await readConfigs(); } catch (e) { console.warn(e); }

    if (!app.wuhunDatabase || Object.keys(app.wuhunDatabase).length === 0) {
        setMoveTip('武魂数据库加载失败，请刷新页面重试');
        return;
    }

    // 随机名字池
    const namePool = ['小明', '小红', '小刚', '阿强', '大壮', '翠花', '铁柱', '狗蛋', '建国', '秀英'];
    const allWuhunNames = Object.keys(app.wuhunDatabase);
    const shuffledNames = [...namePool].sort(() => Math.random() - 0.5);
    const shuffledWuhun = [...allWuhunNames].sort(() => Math.random() - 0.5);

    // 从skills.js获取随机技能函数
    function pickSkillFromAffinity(aff) {
        const pool = SKILL_POOL[aff];
        if (!pool || pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)].id;
    }

    // 获取所有其他系别的技能池（排除主副系）
    function pickSkillFromOtherAffinities(mainAff, subAff) {
        const otherSkills = [];
        for (const a in SKILL_POOL) {
            if (a !== mainAff && a !== subAff) {
                otherSkills.push(...SKILL_POOL[a]);
            }
        }
        if (otherSkills.length === 0) return null;
        return otherSkills[Math.floor(Math.random() * otherSkills.length)].id;
    }

    // 生成一个单位（玩家或敌人）
    function makeTestUnit(wuhunName, name, isPlayer) {
        const wuhun = app.wuhunDatabase[wuhunName];
        if (!wuhun) return null;
        const stats = calcDerivedStats(wuhun.baseForce, wuhun.baseSpeed, wuhun.baseIntelligence);
        const chosenAffinity = Math.random() < 0.5 ? wuhun.mainAffinity : wuhun.subAffinity;
        const otherAffinity = chosenAffinity === wuhun.mainAffinity ? wuhun.subAffinity : wuhun.mainAffinity;

        // 技能：主系1个 + 副系1个 + 其他系1个
        let skills = [];
        // 主系技能
        const mainSkill = pickSkillFromAffinity(chosenAffinity);
        if (mainSkill) skills.push(mainSkill);
        // 副系技能
        const subSkill = pickSkillFromAffinity(otherAffinity);
        if (subSkill && !skills.includes(subSkill)) skills.push(subSkill);
        // 其他系技能（从所有非主副系中随机）
        const otherSkill = pickSkillFromOtherAffinities(chosenAffinity, otherAffinity);
        if (otherSkill && !skills.includes(otherSkill)) skills.push(otherSkill);
        // 去重并限制最多3个
        skills = [...new Set(skills)].slice(0, 3);

        return {
            name: name,
            wuhun: wuhunName,
            level: Math.floor(Math.random() * 2) + 1, // 1-2级
            hp: stats.maxHp,
            skills: skills,
            chosenAffinity: chosenAffinity,
            color: isPlayer ? '#4a90e2' : '#e74c3c'
        };
    }

    // 生成3个玩家单位 + 3个敌方单位
    const playerUnits = [];
    const enemyUnits = [];
    for (let i = 0; i < 3 && i < shuffledWuhun.length; i++) {
        const wuhun = shuffledWuhun[i];
        const name = shuffledNames[i] || ('角色' + (i + 1));
        const unit = makeTestUnit(wuhun, name, true);
        if (unit) playerUnits.push(unit);
    }
    for (let i = 3; i < 6 && i < shuffledWuhun.length; i++) {
        const wuhun = shuffledWuhun[i];
        const name = shuffledNames[i] || ('敌人' + (i - 2));
        const unit = makeTestUnit(wuhun, name, false);
        if (unit) enemyUnits.push(unit);
    }

    app.party = playerUnits.map((u, idx) => ({
        id: 'test_' + idx,
        name: u.name,
        wuhun: u.wuhun,
        level: u.level,
        skills: u.skills,
        exp: { '烈焰':0, '苍木':0, '蛊毒':0, '巨兽':0, '雷霆':0, '沧澜':0, '天工':0 },
        color: u.color,
        hp: u.hp,
        maxHp: u.hp,
        alive: true,
        chosenAffinity: u.chosenAffinity
    }));
    app.player = { ...app.party[0], gold: 0, id: app.party[0].id };
    app.battle = new BattleSystem(playerUnits, enemyUnits);
    app.state = 'BATTLE';
    app.battleTargeting = false;
    app.battleSkillMode = false;
    app.selectedSkill = null;
    app.applyDelay = false;
    attachMouseHandler();
    attachKeyboardHandler();
    gameLoop();
});

// 主循环
function gameLoop() {
    try {
        const { ctx, canvas } = app;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const buttonRow = document.getElementById('button-row');
        if (buttonRow) buttonRow.style.display = app.dialogActive ? 'none' : 'flex';

        if (app.dialogActive) {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            requestAnimationFrame(gameLoop);
            return;
        }

        let nextDelay = 0;

        if (app.state === 'BATTLE' && app.battle && !app.battle.finished) {
            const actor = app.battle.getCurrentActor();
            if (actor) {
                if (actor.side === 'enemy') {
                    app.battle.enemyAI();
                    app.applyDelay = true;
                    if (app.battle.finished) {
                        nextDelay = SPEED_DELAY[app.battleSpeed] || 0;
                        setTimeout(() => {
                            try {
                                if (app.battle.winner === 'player') onBattleWin(app.maze && app.maze.isBossCell());
                                else onBattleLoss();
                                requestAnimationFrame(gameLoop);
                            } catch (e) { console.error(e); requestAnimationFrame(gameLoop); }
                        }, nextDelay);
                        drawBattle();
                        return;
                    }
                } else {
                    if (!app.battleTargeting && !app.battleSkillMode && app.battle.hasMark(actor, 'bind')) {
                        app.battle.log = `${actor.name} 被缠绕，无法行动！`;
                        app.battle.removeMark(actor, 'bind');
                        app.battle.playerActed = true;
                        app.battle.advanceTurn();
                        app.applyDelay = true;
                        if (app.battle.finished) {
                            setTimeout(() => {
                                if (app.battle.winner === 'player') onBattleWin(app.maze && app.maze.isBossCell());
                                else onBattleLoss();
                                requestAnimationFrame(gameLoop);
                            }, SPEED_DELAY[app.battleSpeed] || 0);
                            drawBattle();
                            return;
                        }
                    }
                }
            }
        }

        if (app.applyDelay) {
            app.applyDelay = false;
            nextDelay = SPEED_DELAY[app.battleSpeed] || 0;
        }

        switch (app.state) {
            case 'TOWN': drawTown(); break;
            case 'SHOP': drawShop(); break;
            case 'MAZE': drawMaze(); break;
            case 'BATTLE': drawBattle(); break;
            default: ctx.fillStyle="white"; ctx.fillText("未知状态",100,100);
        }

        if (nextDelay > 0) {
            setTimeout(() => {
                try { gameLoop(); } catch(e) { console.error(e); requestAnimationFrame(gameLoop); }
            }, nextDelay);
        } else {
            requestAnimationFrame(gameLoop);
        }
    } catch (e) {
        console.error('gameLoop error:', e);
        requestAnimationFrame(gameLoop);
    }
}