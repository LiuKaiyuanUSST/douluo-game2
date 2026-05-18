// engine/gameTown.js - 城镇相关逻辑（城镇移动、商店、关卡选择）
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { MazeManager } from './maze.js';
import { playCityMusic, stopCityMusic, playFightMusic, stopFightMusic } from './gameMusic.js';
import { startBeastForestBossFight } from './gameBeastForest.js';
import { tryMoveSoulRingMaze } from './gameSoulRing.js';

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

    // 第一次从猎魂森林返回主城时弹出大师提示
    if (app.currentLevel === -1 && !app.firstForestReturnDialogShown) {
        showFirstForestReturnDialog();
        return;
    }

    // 马红俊剧情完成后回城时弹出新伙伴选择
    if (app.mhjStoryCompleted && !app.mhjNewPartnerChosen) {
        showMhjNewPartnerChoice();
        return;
    }

    // 七怪跑步第一次非通关回城时弹出提示（仅当从迷宫中途回城，不是通关后回城）
    if (app.currentLevel === 4 && !app.qiGuaiFirstReturnHintShown && !app.qiGuaiMazeCompleted) {
        showQiGuaiFirstReturnHint();
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

    // 史莱克村通关后第一次进入史莱克学院时触发大师来访剧情
    if (app.currentTown === 'shrek_academy' && app.qiGuaiMazeCompleted && !app.masterArrivesDialogShown) {
        app.masterArrivesDialogShown = true;
        // 大师来访剧情中弗兰德提到"那帮孩子全都突破二十级了"，所以将唐三等级提升至2级
        const ts = app.party.find(m => m.id === 'ts');
        if (ts) {
            ts.level = 2;
            // 同步 app.player 引用
            if (app.player && app.player.id === 'ts') {
                app.player.level = 2;
            }
        }
        startDialogue('master_arrives', 'chapter6_master.txt', () => {
            // 大师来访剧情结束后，弹出第二魂环引导对话框
            showMasterSecondSoulRingDialog();
        });
        return false;
    }



    // 在史莱克学院地图移动时触发大师对话（猎魂森林引导）
    // 如果大师来访剧情已触发过，则跳过此引导（说明玩家已通关七怪跑步，不需要再引导猎魂森林）
    if (app.currentTown === 'shrek_academy' && !app.shrekAcademyFirstMove && !app.masterArrivesDialogShown) {

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
            openLevelSelect();
        }
        // 史莱克村战斗塔直接进入"七怪跑步"迷宫
        else if (app.currentTown === 'shrek_village') {
            startLevel(4);
        }
        else {
            openLevelSelect();
        }
        return false;
    }

    if (targetType === 5) {
        // 进入猎魂森林
        startHuntingForest();
        return false;
    }
    if (targetType === 6 && app.qiGuaiMazeCompleted) {
        // 进入高级圈养森林（通关七怪跑步/史莱克村副本后开放）
        // 需要提交皇家试炼令
        showRoyalTrialTokenDialog(
            () => {
                // 提交成功，进入高级圈养森林
                startAdvancedHuntingForest();
            },
            () => {
                // 放弃进入，停留在原地
                setMoveTip("💡 前往商店购买皇家试炼令，即可进入高级圈养森林！");

            }
        );
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
        // 在史莱克学院门口，必须通关战斗塔才能进入史莱克学院
        if (app.currentTown === 'shrek' && targetType === 3 && !app.shrekBattleTowerCleared) {
            setMoveTip("💡 请先通关战斗塔才能进入史莱克学院！");
            return false;
        }
        // 在史莱克学院，必须击败邪火凤凰（马红俊）才能进入下一张地图
        if (app.currentTown === 'shrek_academy' && targetType === 3 && !app.mhjStoryCompleted) {
            setMoveTip("💡 请先击败邪火凤凰马红俊才能进入下一张地图！");
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
    const townLevelMap = { noting: [0], suotuo: [1], shrek: [2], shrek_academy: [3], shrek_village: [4] };



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
                if (app.currentTown === 'shrek_village') {
                    setMoveTip("请返回史莱克学院");
                } else {
                    setMoveTip("请前往下一关地图");
                }
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
    const townLevelMap = { noting: [0], suotuo: [1], shrek: [2], shrek_academy: [3], shrek_village: [4] };


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

function setupQiGuaiRunningMaze(stage) {
    // 七怪跑步：9x9自定义迷宫
    // 起点 (0,0), 终点 (4,0) 第一行第五格
    // 中央3x3挖空: (3,3)~(5,5)
    // 第4列1-3行挖空: (3,0),(3,1),(3,2)
    const blockedCells = [];
    // 中央3x3
    for (let y = 3; y <= 5; y++) {
        for (let x = 3; x <= 5; x++) {
            blockedCells.push([x, y]);
        }
    }
    // 第4列1-3行
    for (let y = 0; y <= 2; y++) {
        blockedCells.push([3, y]);
    }
    
    // 预先设置挖空区域四周的所有墙壁（在随机生成之前）
    // 对每个挖空格子，将其四周的4堵墙全部设为true
    const preSetWalls = [];
    for (const [bx, by] of blockedCells) {
        preSetWalls.push({ x: bx, y: by, dir: 'right' });
        preSetWalls.push({ x: bx, y: by, dir: 'left' });
        preSetWalls.push({ x: bx, y: by, dir: 'down' });
        preSetWalls.push({ x: bx, y: by, dir: 'up' });
    }
    
    app.maze = new MazeManager(stage.size, {
        startX: 0,
        startY: 0,
        endX: 4,
        endY: 0,
        blockedCells: blockedCells,
        preSetWalls: preSetWalls,
        isCustomMaze: true,
        customMazeName: '七怪跑步'
    });
}




export function startLevel(levelIdx) {
    // 离开主城进入迷宫，停止主城音乐，播放战斗副本音乐
    stopCityMusic();
    playFightMusic();

    const stage = app.config.stages.levels[levelIdx];
    if (!stage) return;
    app.currentLevel = levelIdx; app.currentBossPhase = 0;
    
    // 第5关（七怪跑步）使用自定义迷宫
    if (levelIdx === 4) {
        setupQiGuaiRunningMaze(stage);
    } else {
        app.maze = new MazeManager(stage.size);
    }
    
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
    // 七怪跑步：第一次进入时播放弗兰德训话剧情 + 伙伴选择
    // 如果玩家已有5个或以上角色（唐三+小舞+3个史莱克伙伴），说明已经触发过，不再重复触发
    if (levelIdx === 4 && !app.qiGuaiFlenderSpeechDone && app.party.length < 5) {
        app.qiGuaiFlenderSpeechDone = true;
        startDialogue('flender_speech', 'chapter5_qiGuai.txt', () => {
            // 弗兰德训话结束后，弹出大师伙伴选择
            showQiGuaiPartnerChoice();
        });
        return;
    }
    setMoveTip(`进入 ${stage.name}，移动到三角形标记 Boss 格`);

}

export function tryMoveMaze(dx, dy) {
    if (app.state !== 'MAZE') return false;
    
    // 魂环吸收迷宫模式 - 使用独立的移动逻辑
    if (app.maze._isSoulRingMaze) {
        return tryMoveSoulRingMaze(dx, dy);
    }
    
    if (!app.maze.move(dx, dy)) return false;
    
    // 猎魂森林模式
    if (app.maze.isHuntingForest) {
        if (app.maze.isBossCell()) {
            const bossInfo = app.maze.getCurrentBossInfo();
            if (bossInfo) {
                if (bossInfo.defeated) {
                    setMoveTip(`🌲 该魂兽已被击败`);
                } else {
                    // 触发魂兽森林Boss战斗
                    startBeastForestBossFight(bossInfo);
                }
            }
        } else {
            setMoveTip("🌲 猎魂森林 - 探索并找到所有魂兽");
        }
        return true;
    }
    
    // 七怪跑步自定义迷宫：触发剧情事件 + 随机小怪
    if (app.maze._isCustomMaze && app.currentLevel === 4) {
        const px = app.maze.px;
        const py = app.maze.py;
        // 首次进入第4列（x=3）时触发抱怨剧情
        if (!app.qiGuaiComplainDone && px === 3) {
            app.qiGuaiComplainDone = true;
            startDialogue('complain', 'chapter5_qiGuai.txt', () => {
                setMoveTip("继续前进...");
            });
            return true;
        }
        // 首次进入前三行（y=0,1,2）且第5-9列（x=4~8）时触发互相帮助剧情
        if (!app.qiGuaiHelpDone && py >= 0 && py <= 2 && px >= 4 && px <= 8) {
            app.qiGuaiHelpDone = true;
            startDialogue('help_each_other', 'chapter5_qiGuai.txt', () => {
                setMoveTip("继续前进...");
            });
            return true;
        }
        // 非Boss格随机遭遇小怪（50%概率）
        if (!app.maze.isBossCell() && Math.random() < 0.5) {
            // 十年魂兽池
            const decadeBeasts = [
                { name: '孤竹', wuhun: '孤竹', level: 1, skills: [], chosenAffinity: '苍木', subAffinity: '苍木', color: '#27ae60' },
                { name: '闪电兔', wuhun: '闪电兔', level: 1, skills: [], chosenAffinity: '雷霆', subAffinity: '雷霆', color: '#f1c40f' },
                { name: '尖尾雨燕', wuhun: '尖尾雨燕', level: 1, skills: [], chosenAffinity: '沧澜', subAffinity: '沧澜', color: '#3498db' },
                { name: '斑斓猫', wuhun: '斑斓猫', level: 1, skills: [], chosenAffinity: '烈焰', subAffinity: '烈焰', color: '#e74c3c' },
                { name: '断肠草', wuhun: '断肠草', level: 1, skills: [], chosenAffinity: '蛊毒', subAffinity: '蛊毒', color: '#8e44ad' },
                { name: '大角羊', wuhun: '大角羊', level: 1, skills: [], chosenAffinity: '巨兽', subAffinity: '巨兽', color: '#d35400' },
                { name: '锄头', wuhun: '锄头', level: 1, skills: [], chosenAffinity: '天工', subAffinity: '天工', color: '#7f8c8d' }
            ];
            // 随机选3个
            const shuffled = [...decadeBeasts].sort(() => Math.random() - 0.5);
            const enemies = shuffled.slice(0, 3);
            // 随机阵型
            const formations = ['front-front-front', 'front-front-back', 'front-back-back'];
            const formation = formations[Math.floor(Math.random() * formations.length)];
            // 进入战斗
            stopCityMusic();
            const players = buildUnitsFromParty(1);
            app.battle = new BattleSystem(players, enemies, {
                playerFormation: app.selectedFormation,
                enemyFormation: formation
            });
            app.state = 'BATTLE'; app.battleTargeting = false; app.battleEnemyTurnDone = false;
            setMoveTip("⚔️ 遭遇十年魂兽！");
            return true;
        }
    }
    
    // 普通迷宫逻辑
    if (app.maze.isBossCell()) {


        const stage = app.config.stages.levels[app.currentLevel];
        if (stage.bosses && stage.bosses.length) {
            const bossDef = stage.bosses[app.currentBossPhase] || stage.bosses[0];
            // 第2关（戴沐白）：进Boss格先播放剧情，再开始Boss战（仅第一次进入时播放）
            if (app.currentLevel === 1 && app.currentBossPhase === 0) {
                startDialogue('before_boss_dmb', 'chapter2_dmb.txt', () => {
                    startBossFight(bossDef);
                });
            }
            // 第4关（马红俊）：进Boss格先播放剧情，再开始Boss战
            else if (app.currentLevel === 3) {
                startDialogue('village_walk', 'chapter4_mhj.txt', () => {
                    startDialogue('separate', 'chapter4_mhj.txt', () => {
                        startDialogue('meet_mhj', 'chapter4_mhj.txt', () => {
                            startDialogue('boss_mhj', 'chapter4_mhj.txt', () => {
                                startBossFight(bossDef);
                            });
                        });
                    });
                });
            }
            // 第5关（七怪跑步）：到达终点播放结束剧情
            else if (app.currentLevel === 4) {
                app.qiGuaiMazeCompleted = true;
                startDialogue('after_battle_summary', 'chapter5_qiGuai.txt', () => {
                    setMoveTip("🏁 七怪跑步完成！");
                    // 解锁下一关
                    const next = app.currentLevel + 1;
                    if (next < app.config.stages.levels.length && !app.unlockedLevels.includes(next)) {
                        app.unlockedLevels.push(next);
                        app.unlockedLevels.sort((a,b)=>a-b);
                    }
                    // 返回主城
                    goToTown();
                });
            }

            else {
                startBossFight(bossDef);
            }
        }
    } else if (!app.maze._isCustomMaze && Math.random() < 0.2) {


        let enemies = [];
        // 邪火凤凰关卡（关卡索引3）：小怪改为火蜥蜴（2级灼烧）、斑斓猫（1级）、闪电兔（1级），全部以烈焰系出战
        if (app.currentLevel === 3) {
            enemies = [
                {
                    name: '火蜥蜴',
                    wuhun: '火蜥蜴',
                    level: 2,
                    skills: ['灼烧'],
                    chosenAffinity: '烈焰',
                    subAffinity: '巨兽',
                    color: '#e67e22'
                },
                {
                    name: '斑斓猫',
                    wuhun: '斑斓猫',
                    level: 1,
                    skills: [],
                    chosenAffinity: '烈焰',
                    subAffinity: '蛊毒',
                    color: '#e74c3c'
                },
                {
                    name: '闪电兔',
                    wuhun: '闪电兔',
                    level: 1,
                    skills: [],
                    chosenAffinity: '烈焰',
                    subAffinity: '烈焰',
                    color: '#f39c12'
                }
            ];
        } else {
            const count = (app.currentLevel === 1) ? 2 : (app.currentLevel === 2) ? 3 : 1;
            const enemyId = (app.currentLevel === 0) ? 'student' : (app.currentLevel === 2) ? 'beast_outskirt' : 'beast';
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

// ---------- 猎魂森林相关函数 ----------

// 进入猎魂森林
export function startHuntingForest() {
    stopCityMusic();
    playFightMusic();

    app.currentLevel = -1; // 特殊标记为猎魂森林
    app.maze = new MazeManager(5);
    app.maze.setupHuntingForest();
    app.state = 'MAZE';

    app.battleTargeting = false;
    app.battleEnemyTurnDone = false;
    app.showResurrectionHint = false;

    setMoveTip("🌲 欢迎来到圈养森林！请探索并找到你需要的魂兽");
}

// 进入高级圈养森林
export function startAdvancedHuntingForest() {
    stopCityMusic();
    playFightMusic();

    app.currentLevel = -2; // 特殊标记为高级圈养森林
    app.maze = new MazeManager(5);
    app.maze.setupAdvancedHuntingForest();
    app.state = 'MAZE';

    app.battleTargeting = false;
    app.battleEnemyTurnDone = false;
    app.showResurrectionHint = false;

    setMoveTip("🌲 欢迎来到高级圈养森林！这里的魂兽更加强大！");
}

// 构建猎魂森林boss敌人
function buildHuntingForestBoss(bossInfo) {
    // 根据系别确定武魂和技能
    const affinityWuhunMap = {
        '苍木': { wuhun: '鬼藤', skill: '缠绕' },
        '雷霆': { wuhun: '幽冥狼', skill: '雷霆万钧' },
        '沧澜': { wuhun: '海蝰蛇', skill: '怒涛' },
        '烈焰': { wuhun: '火蜥蜴', skill: '灼烧' },
        '蛊毒': { wuhun: '曼陀罗蛇', skill: '中毒' },
        '巨兽': { wuhun: '蛮牛', skill: '蛮力' },
        '天工': { wuhun: '板斧', skill: '一曰力' }
    };

    const wuhunData = affinityWuhunMap[bossInfo.affinity] || { wuhun: '豹子', skill: '蛮力' };

    return {
        name: `百年${bossInfo.affinity}${bossInfo.name}`,
        wuhun: wuhunData.wuhun,
        level: 1,
        skills: [wuhunData.skill],
        chosenAffinity: bossInfo.affinity,
        subAffinity: bossInfo.affinity,
        color: bossInfo.color || '#e74c3c',
        desc: bossInfo.desc
    };
}

// 以下函数通过 gameLogic.js 注册，避免循环依赖
export function registerShowMasterWuhunChoice(fn) { showMasterWuhunChoice = fn; }
export function registerShowXiaoWuWuhunChoice(fn) { showXiaoWuWuhunChoice = fn; }
export function registerShowShrekPartnerChoice(fn) { showShrekPartnerChoice = fn; }
export function registerShowZwjRegistrationDialog(fn) { showZwjRegistrationDialog = fn; }
export function registerShowAffinityGuideDialog(fn) { showAffinityGuideDialog = fn; }
export function registerShowSecondLevelHintDialog(fn) { showSecondLevelHintDialog = fn; }
export function registerShowShrekAcademyMasterDialog(fn) { showShrekAcademyMasterDialog = fn; }
export function registerShowFirstForestReturnDialog(fn) { showFirstForestReturnDialog = fn; }
export function registerShowMhjNewPartnerChoice(fn) { showMhjNewPartnerChoice = fn; }
export function registerShowQiGuaiPartnerChoice(fn) { showQiGuaiPartnerChoice = fn; }
export function registerShowQiGuaiFirstReturnHint(fn) { showQiGuaiFirstReturnHint = fn; }
export function registerShowMasterSecondSoulRingDialog(fn) { showMasterSecondSoulRingDialog = fn; }
export function registerShowRoyalTrialTokenDialog(fn) { showRoyalTrialTokenDialog = fn; }

export function registerBuildEnemyFromMonster(fn) { buildEnemyFromMonster = fn; }

export function registerBuildUnitsFromParty(fn) { buildUnitsFromParty = fn; }
export function registerStartBossFight(fn) { startBossFight = fn; }
export function registerStartDialogue(fn) { startDialogue = fn; }

let showMasterWuhunChoice = function() { console.warn('showMasterWuhunChoice not registered'); };
let showXiaoWuWuhunChoice = function() { console.warn('showXiaoWuWuhunChoice not registered'); };
let showShrekPartnerChoice = function() { console.warn('showShrekPartnerChoice not registered'); };
let showZwjRegistrationDialog = function() { console.warn('showZwjRegistrationDialog not registered'); };
let showAffinityGuideDialog = function() { console.warn('showAffinityGuideDialog not registered'); };
let showSecondLevelHintDialog = function() { console.warn('showSecondLevelHintDialog not registered'); };
let showShrekAcademyMasterDialog = function() { console.warn('showShrekAcademyMasterDialog not registered'); };
let showFirstForestReturnDialog = function() { console.warn('showFirstForestReturnDialog not registered'); };
let showMhjNewPartnerChoice = function() { console.warn('showMhjNewPartnerChoice not registered'); };
let showQiGuaiPartnerChoice = function() { console.warn('showQiGuaiPartnerChoice not registered'); };
let showQiGuaiFirstReturnHint = function() { console.warn('showQiGuaiFirstReturnHint not registered'); };
let showMasterSecondSoulRingDialog = function() { console.warn('showMasterSecondSoulRingDialog not registered'); };
let showRoyalTrialTokenDialog = function() { console.warn('showRoyalTrialTokenDialog not registered'); };
let buildEnemyFromMonster = function() { console.warn('buildEnemyFromMonster not registered'); };


let buildUnitsFromParty = function() { console.warn('buildUnitsFromParty not registered'); };
let startBossFight = function() { console.warn('startBossFight not registered'); };
let startDialogue = function() { console.warn('startDialogue not registered'); };

// Import BattleSystem for maze encounters
import { BattleSystem } from './battle.js';
