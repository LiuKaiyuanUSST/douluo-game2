// engine/gameSoulRing.js - 魂环吸收迷宫（独立模块，后续可扩展）
// 复用 MazeManager 的迷宫生成、drawMaze 的渲染、tryMoveMaze 的移动逻辑
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { MazeManager } from './maze.js';
import { SKILL_POOL } from './skills.js';

// ========== 超参配置 ==========
// 魂环能量收集次数（1级需要3次）
export const SOUL_RING_COLLECT_TIMES = 3;

// ========== 进入魂环吸收迷宫 ==========
// 由 gameBeastForest.js 在结算选择角色后调用
export function startSoulRingMaze(selectedChar, bossInfo, playerLevel) {
    // 保存当前猎魂森林迷宫（以便后续恢复）
    app._savedHuntingForestMaze = app.maze;
    
    // 保存魂环吸收状态
    app._soulRingChar = selectedChar;
    app._soulRingBoss = bossInfo;
    app._soulRingPlayerLevel = playerLevel;
    app._soulRingCollected = 0;
    app._soulRingTotal = SOUL_RING_COLLECT_TIMES;
    
    // 创建5x5迷宫（使用 MazeManager 复用现有迷宫生成逻辑）
    const mazeSize = 5;
    const center = Math.floor(mazeSize / 2);
    const soulMaze = new MazeManager(mazeSize);
    
    // 标记为魂环吸收迷宫
    soulMaze._isSoulRingMaze = true;
    soulMaze._soulRingCollected = 0;
    soulMaze._soulRingTotal = SOUL_RING_COLLECT_TIMES;
    soulMaze._soulRingCharName = selectedChar.name;
    soulMaze._currentOrbColor = null;
    soulMaze._orbX = -1;
    soulMaze._orbY = -1;
    
    // 初始全迷雾，只露出中心魂核
    soulMaze.explored = Array(mazeSize).fill().map(() => Array(mazeSize).fill(false));
    soulMaze.explored[center][center] = true; // 中心魂核可见
    
    // 生成第一个能量球（同时会露出其位置和四周墙壁）
    spawnOrb(soulMaze);
    
    // 玩家起始位置 = 能量球位置
    soulMaze.px = soulMaze._orbX;
    soulMaze.py = soulMaze._orbY;
    
    // 切换到魂环吸收迷宫
    app.maze = soulMaze;
    app.state = 'MAZE';
    app._soulRingActive = true;
    
    // 立即弹出大师提示
    setTimeout(() => {
        showSoulRingHint(selectedChar, bossInfo);
    }, 100);
    
    setMoveTip("请引导魂环能量进入中心魂核。");
}

// 生成随机颜色
function randomColor() {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#ff6b6b', '#48dbfb', '#ff9ff3'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 生成能量球（随机非中心位置）
function spawnOrb(maze) {
    const size = maze.size;
    const center = Math.floor(size / 2);
    
    let x, y;
    do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
    } while (x === center && y === center);
    
    const color = randomColor();
    maze._currentOrbColor = color;
    maze._orbX = x;
    maze._orbY = y;
    
    // 露出能量球位置（墙壁由 drawSoulRingMaze 根据 orb 位置自动显示）
    if (maze.explored && maze.explored[y] !== undefined) {
        maze.explored[y][x] = true;
    }
}

function showSoulRingHint(selectedChar, bossInfo) {
    const hintContainer = document.createElement('div');
    hintContainer.id = 'soul-ring-hint';
    hintContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Segoe UI';
        padding: 30px 40px;
        box-sizing: border-box;
        z-index: 2100;
        border-radius: 12px;
        border: 2px solid #ffcc00;
        text-align: center;
    `;
    hintContainer.innerHTML = `
        <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
        <div style="font-size:18px; line-height:1.7; margin-bottom:20px;">
            魂环的能量正从四面八方涌动，每一份散逸的力量都需要你亲手牵引，通过魂力的引导融入中心魂核。请开始吧。
        </div>
        <button id="soul-ring-hint-btn" style="
            display:block; margin:15px auto; padding:12px 40px;
            background:#2ecc71; color:white; border:none; border-radius:8px;
            cursor:pointer; font-size:20px; 
        ">开始引导</button>
    `;
    document.body.appendChild(hintContainer);
    
    document.getElementById('soul-ring-hint-btn').addEventListener('click', () => {
        if (hintContainer && hintContainer.parentNode) {
            hintContainer.parentNode.removeChild(hintContainer);
        }
    });
}

// ========== 魂环迷宫移动处理 ==========
// 由 gameTown.js 的 tryMoveMaze 在检测到魂环吸收模式时调用
export function tryMoveSoulRingMaze(dx, dy) {
    const maze = app.maze;
    if (!maze || !maze._isSoulRingMaze) return false;
    
    // 使用 MazeManager 的移动逻辑
    if (!maze.canMove(dx, dy)) return false;
    maze.move(dx, dy);
    
    const center = Math.floor(maze.size / 2);
    
    // 检查是否到达中心（魂核）
    if (maze.px === center && maze.py === center) {
        // 能量球到达中心，被魂核吸收
        maze._soulRingCollected++;
        app._soulRingCollected = maze._soulRingCollected;
        
        if (maze._soulRingCollected >= maze._soulRingTotal) {
            // 全部收集完成
            setMoveTip("您已经完成所有魂环能量收集！");
            setTimeout(() => {
                showSoulRingComplete();
            }, 300);
        } else {
            // 生成新的能量球（随机位置，中心除外）
            spawnOrb(maze);
            // 将玩家（能量球）移动到新能量球的位置
            maze.px = maze._orbX;
            maze.py = maze._orbY;
            // 重置迷雾，只露出中心魂核和新能量球位置（墙壁由 drawSoulRingMaze 根据 orb 位置自动显示）
            maze.explored = Array(maze.size).fill().map(() => Array(maze.size).fill(false));
            maze.explored[maze.py][maze.px] = true;
            maze.explored[center][center] = true; // 中心魂核始终可见
            setMoveTip(`您已经完成${maze._soulRingCollected}/${maze._soulRingTotal}的魂环能量收集！`);
        }
    } else {
        setMoveTip("请引导魂环能量进入中心魂核。");
    }
    
    return true;
}

// ========== 魂环吸收完成 ==========
function showSoulRingComplete() {
    const selectedChar = app._soulRingChar;
    const bossInfo = app._soulRingBoss;
    const chosenAffinity = app._beastForestChosenAffinity || (bossInfo ? bossInfo.affinity : null);
    const isSecondSoulRing = app._isSecondSoulRing || false;
    
    if (!selectedChar || !bossInfo) return;
    
    // 随机魂技：从 增力、增智、加速 + 对面魂兽系别的3个技能 中随机
    const passiveSkills = ['增力', '增智', '增速'];
    
    // 获取对面魂兽系别的技能
    const affinitySkills = SKILL_POOL[bossInfo.affinity] || [];
    const affinitySkillIds = affinitySkills.map(s => s.id);
    
    // 合并所有可选技能
    const allPossibleSkills = [...passiveSkills, ...affinitySkillIds];
    
    // 随机选择一个
    const randomSkill = allPossibleSkills[Math.floor(Math.random() * allPossibleSkills.length)];
    
    // 添加到角色
    if (!selectedChar.skills) selectedChar.skills = [];
    selectedChar.skills.push(randomSkill);
    
    // 构建魂环信息
    const soulRingInfo = {
        beastName: bossInfo.name,
        beastAffinity: bossInfo.affinity,
        skillName: randomSkill,
        skillId: randomSkill
    };
    
    if (!selectedChar.soulRings) selectedChar.soulRings = [];
    selectedChar.soulRings.push(soulRingInfo);
    
    // 第二魂环附加：等级处理
    let levelUpMessage = '';
    if (isSecondSoulRing) {
        if (selectedChar.level < 2) {
            // 1级角色吸取第二魂环后提升至2级
            selectedChar.level = 2;
            // 同步唐三的 app.player 引用
            if (selectedChar.id === 'ts' && app.player) {
                app.player.level = 2;
            }
            levelUpMessage = `<div style="font-size:16px; margin-top:10px; color:#2ecc71;">${selectedChar.name} 提升至 <strong>2级</strong>！</div>`;
        } else {
            // 2级以上角色等级不变
            levelUpMessage = `<div style="font-size:16px; margin-top:10px; color:#aaa;">${selectedChar.name} 等级不变（当前 ${selectedChar.level}级）</div>`;
        }
        // 清除标记
        app._isSecondSoulRing = false;
    }
    
    // 显示恭喜对话框
    app.dialogActive = true;
    
    const container = document.createElement('div');
    container.id = 'soul-ring-complete';
    container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Segoe UI';
        padding: 30px 40px;
        box-sizing: border-box;
        z-index: 2200;
        border-radius: 12px;
        border: 2px solid #ffcc00;
        text-align: center;
    `;
    container.innerHTML = `
        <div style="font-size:24px; margin-bottom:20px; color:#ffd700;">✨ 魂环吸收成功！</div>
        <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
            恭喜${selectedChar.name}成功吸收${bossInfo.name}魂环，魂技为 <strong style="color:#f39c12;">${randomSkill}</strong>。
        </div>
        ${levelUpMessage}
        <button id="soul-ring-complete-btn" style="
            display:block; margin:15px auto; padding:12px 40px;
            background:#2ecc71; color:white; border:none; border-radius:8px;
            cursor:pointer; font-size:20px; 
        ">确认</button>
    `;
    document.body.appendChild(container);
    
    document.getElementById('soul-ring-complete-btn').addEventListener('click', () => {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        app.dialogActive = false;
        
        // 关闭魂环迷宫，恢复猎魂森林
        closeSoulRingMaze();
        
        // 标记Boss已击败，回到猎魂森林
        markBossDefeatedAndReturn(bossInfo);
    });
}


function closeSoulRingMaze() {
    // 恢复之前保存的猎魂森林迷宫
    if (app._savedHuntingForestMaze) {
        app.maze = app._savedHuntingForestMaze;
        app._savedHuntingForestMaze = null;
    }
    app._soulRingActive = false;
    app._soulRingChar = null;
    app._soulRingBoss = null;
    app._soulRingPlayerLevel = null;
    app._soulRingCollected = null;
    app._soulRingTotal = null;
}

function markBossDefeatedAndReturn(bossInfo) {
    if (app.maze && app.maze.isHuntingForest) {
        app.maze.markBossDefeated(bossInfo.x, bossInfo.y);
    }
    app.state = 'MAZE';
    app.battle = null;
    app._beastForestBossInfo = null;
    app._beastForestChosenAffinity = null;
    setMoveTip("🌲 猎魂森林 - 继续探索");
}
 