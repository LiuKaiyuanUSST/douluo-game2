// engine/gameBeastForest.js - 魂兽森林战斗、结算、魂环吸收入口
// 通用模块，可用于圈养森林、落日森林、星斗大森林等
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { buildUnitsFromParty } from './gameBattle.js';
import { startSoulRingMaze } from './gameSoulRing.js';

// ========== 1. 进入魂兽森林Boss战斗 ==========
// 在魂兽森林走到Boss格时触发战斗
export function startBeastForestBossFight(bossInfo) {
    // 随机选取主系（70%）或副系（30%）出战
    const chosenAffinity = Math.random() < 0.7 ? bossInfo.affinity : getSubAffinity(bossInfo.affinity);
    
    // 构建敌人
    const enemy = buildBeastForestEnemy(bossInfo, chosenAffinity);
    
    const playerUnits = buildUnitsFromParty(1);
    if (!playerUnits || playerUnits.length === 0) {
        setMoveTip("没有可战斗的角色！");
        return;
    }
    
    // 导入 BattleSystem
    import('./battle.js').then(({ BattleSystem }) => {
        app.battle = new BattleSystem(playerUnits, [enemy], {
            playerFormation: app.selectedFormation
        });
        app.state = 'BATTLE';
        app.battleTargeting = false;
        app.battleSkillMode = false;
        app.selectedSkill = null;
        app.battleEnemyTurnDone = false;
        app._beastForestBossInfo = bossInfo; // 保存当前战斗的魂兽信息
        app._beastForestChosenAffinity = chosenAffinity; // 保存出战系别
        setMoveTip(`⚔️ 与 ${bossInfo.name} 战斗！`);
    }).catch(e => {
        console.error('Failed to load BattleSystem:', e);
    });
}

function getSubAffinity(mainAffinity) {
    const subMap = {
        '苍木': '蛊毒',
        '雷霆': '沧澜',
        '沧澜': '雷霆',
        '烈焰': '巨兽',
        '蛊毒': '苍木',
        '巨兽': '天工',
        '天工': '烈焰'
    };
    return subMap[mainAffinity] || '巨兽';
}

function buildBeastForestEnemy(bossInfo, chosenAffinity) {
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
        chosenAffinity: chosenAffinity,
        subAffinity: bossInfo.affinity,
        color: bossInfo.color || '#e74c3c',
        desc: bossInfo.desc,
        _hideWuhun: true // 魂兽森林敌人隐藏武魂名称（与魂兽名称重复）
    };
}

// ========== 2. 魂兽森林战斗胜利处理 ==========
export function handleBeastForestBattleWin() {
    const bossInfo = app._beastForestBossInfo;
    if (!bossInfo) return;
    
    // 同步队伍HP
    syncPartyHP();
    
    // 获取唐三等级
    const ts = app.party.find(m => m.id === 'ts');
    const playerLevel = ts ? ts.level : 1;
    
    // 筛选存活角色：已有技能数 < 主角等级
    const eligibleCharacters = app.party.filter(m => {
        if (m.alive === false) return false;
        const skillCount = (m.skills && m.skills.length) || 0;
        return skillCount < playerLevel;
    });
    
    // 显示结算对话框
    showSettlementDialog(bossInfo, playerLevel, eligibleCharacters);
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

// ========== 3. 结算对话框 ==========
function showSettlementDialog(bossInfo, playerLevel, eligibleCharacters) {
    app.dialogActive = true;
    
    const container = document.createElement('div');
    container.id = 'beast-forest-settlement';
    container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Segoe UI', sans-serif;
        padding: 30px 40px;
        box-sizing: border-box;
        z-index: 2000;
        border-radius: 12px;
        border: 2px solid #ffcc00;
        text-align: center;
    `;
    document.body.appendChild(container);
    
    const bossName = `百年${bossInfo.affinity}${bossInfo.name}`;
    
    if (eligibleCharacters.length === 0) {
        // 没有可用角色
        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                您战胜了${bossName}。<br>
                您的等级为${playerLevel}级，您的角色最多可以拥有${playerLevel}个魂技。
            </div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px; color:#e74c3c;">
                您没有待升级角色。
            </div>
            <button id="settlement-confirm-btn" style="
                display:block; margin:15px auto; padding:12px 40px;
                background:#2ecc71; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:20px; font-weight:bold;
            ">确认</button>
        `;
        document.getElementById('settlement-confirm-btn').addEventListener('click', () => {
            closeDialog(container);
            markBossDefeatedAndReturn(bossInfo);
        });
    } else {
        // 显示可选角色列表
        let optionsHtml = '';
        eligibleCharacters.forEach((char, index) => {
            const skillCount = (char.skills && char.skills.length) || 0;
            optionsHtml += `
                <button class="soul-ring-char-btn" data-index="${index}" style="
                    display:block; margin:8px 0; padding:12px 15px; width:100%;
                    background:#2a3a4a; color:white; border:2px solid ${char.color || '#4a90e2'}; border-radius:8px;
                    cursor:pointer; font-size:16px; text-align:left;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style="font-weight:bold; font-size:18px; color:${char.color || '#4a90e2'};">${char.name} · ${char.wuhun}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        已有魂技：${skillCount}/${playerLevel}
                    </div>
                </button>
            `;
        });
        
        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                您战胜了${bossName}。<br>
                您的等级为${playerLevel}级，您的角色最多可以拥有${playerLevel}个魂技。
            </div>
            <div style="font-size:16px; line-height:1.6; margin-bottom:10px; color:#aaa;">
                魂兽系别：<span style="color:#f39c12;">${bossInfo.affinity}</span>
            </div>
            <div style="font-size:16px; line-height:1.6; margin-bottom:15px; color:#ffcc88;">
                请选择您要附加魂环的存活角色（可吸收该${bossInfo.affinity}系魂环）：
            </div>
            ${optionsHtml}
            <button id="settlement-giveup-btn" style="
                display:block; margin:15px auto 0; padding:10px 30px;
                background:#666; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:16px;
            ">放弃（不吸收魂环）</button>
        `;
        
        document.querySelectorAll('.soul-ring-char-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const selectedChar = eligibleCharacters[index];
                closeDialog(container);
                // 进入魂环吸收迷宫（调用 gameSoulRing.js）
                startSoulRingMaze(selectedChar, bossInfo, playerLevel);
            });
        });
        
        document.getElementById('settlement-giveup-btn').addEventListener('click', () => {
            closeDialog(container);
            markBossDefeatedAndReturn(bossInfo);
        });
    }
}

function closeDialog(container) {
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
    app.dialogActive = false;
}

function markBossDefeatedAndReturn(bossInfo) {
    if (app.maze && app.maze.isHuntingForest) {
        app.maze.markBossDefeated(bossInfo.x, bossInfo.y);
    }
    app.state = 'MAZE';
    app.battle = null;
    app._beastForestBossInfo = null;
    app._beastForestChosenAffinity = null;
    setMoveTip("🌲 魂兽森林 - 继续探索");
}
