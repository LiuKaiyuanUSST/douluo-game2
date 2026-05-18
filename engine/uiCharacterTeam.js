// engine/uiCharacterTeam.js
import { app } from './gameState.js';
import { calcDerivedStats } from './battleUtils.js';
import { setMoveTip } from './utilsCore.js';
import { getSkillById } from './skills.js';

const FORMATION_OPTIONS = [
    { key: 'front-front-front', label: '前-前-前' },
    { key: 'back-front-back', label: '后-前-后' },
    { key: 'front-back-front', label: '前-后-前' }
];

// ---------- 角色面板 ----------
function createCharacterPanel() {
    if (document.getElementById('character-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'character-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        max-height: 80vh;
        background: rgba(20,20,20,0.96);
        color: white;
        border: 2px solid gold;
        border-radius: 12px;
        z-index: 3000;
        display: none;
        font-family: 'Segoe UI', sans-serif;
        flex-direction: column;
    `;
    panel.innerHTML = `
        <div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; padding:20px 20px 15px 20px; border-bottom:1px solid #555;">
            <h2 style="margin:0;">👥 已获得角色</h2>
            <button id="close-character-panel" style="background:#666; color:white; border:none; padding:5px 15px; border-radius:6px; cursor:pointer; font-size:16px;">✕ 关闭</button>
        </div>
        <div id="character-list" style="flex:1; overflow-y:auto; padding:15px 20px 20px 20px;">
            <p style="text-align:center; color:#888;">加载中…</p>
        </div>
    `;
    document.body.appendChild(panel);
    document.getElementById('close-character-panel').addEventListener('click', () => {
        panel.style.display = 'none';
    });
}


function toggleCharacterAffinity(memberId) {
    const member = app.party.find(m => m.id === memberId);
    if (!member) return;
    const wuhun = app.wuhunDatabase[member.wuhun];
    if (!wuhun) return;
    if (!member.chosenAffinity || member.chosenAffinity === wuhun.mainAffinity) {
        member.chosenAffinity = wuhun.subAffinity;
        setMoveTip(`已切换为【${wuhun.subAffinity}】出战：主系魂技80%，副系魂技80%，其他系50%`);
    } else {
        member.chosenAffinity = wuhun.mainAffinity;
        setMoveTip(`已切换为【${wuhun.mainAffinity}】出战：主系魂技100%，副系魂技80%，其他系50%`);
    }
    updateCharacterList();
}

function updateCharacterList() {
    const list = document.getElementById('character-list');
    if (!list) return;
    let html = '';
    if (app.party.length === 0) {
        html = '<p style="text-align:center;">暂无角色</p>';
    } else {
        html = '<div style="display:flex; flex-direction:column; gap:12px;">';
        for (const member of app.party) {
            const wuhun = app.wuhunDatabase[member.wuhun];
            if (!wuhun) {
                html += '<div style="background:#2a2a2a; padding:12px; border-radius:10px;">未知武魂</div>';
                continue;
            }
            const stats = calcDerivedStats(wuhun.baseForce, wuhun.baseSpeed, wuhun.baseIntelligence, 0);
            const attackDisplay = `${stats.damageMin}-${stats.damageMax} (期望${((stats.damageMin + stats.damageMax)/2).toFixed(1)})`;
            const aliveText = member.alive ? `❤️ ${member.hp}/${member.maxHp}` : '💀 阵亡';
            const chosenAff = member.chosenAffinity || wuhun.mainAffinity;
            const agility = wuhun.baseSpeed + wuhun.baseIntelligence;

            html += `
                <div style="background:#2a2a2a; padding:12px; border-radius:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-size:20px;"><span style="color:${member.color || '#4a90e2'};">●</span> ${member.name} · ${member.wuhun}</div>
                        <div style="font-size:16px;">Lv.${member.level} ${aliveText}</div>
                    </div>
                    <div style="margin-top:6px; display:grid; grid-template-columns: auto auto; gap:4px 20px; font-size:15px;">
                        <div>💪力量: ${wuhun.baseForce}</div>
                        <div>⚡速度: ${wuhun.baseSpeed}</div>
                        <div>🧠智力: ${wuhun.baseIntelligence}</div>
                        <div>🛡️防御: ${stats.defenseType}级</div>
                        <div>⚔️攻击: ${attackDisplay}</div>
                        <div>💨灵巧: ${agility}</div>
                        <div>📏攻击范围: ${stats.attackRange}</div>
                        <div>🌀魂力回复: ${stats.spiritRecovery}</div>
                    </div>
                    <div style="margin-top:6px; padding:4px 0; border-top:1px solid #555; font-size:14px; color:#ccc;">
                        <div>🎯 武魂特色：${wuhun.feature || '无'} | 天赋属性：${wuhun.talentAttr || '无'}</div>
                        <div>🔮 主系：<span style="color:#f39c12;">${wuhun.mainAffinity}</span> | 副系：<span style="color:#8e44ad;">${wuhun.subAffinity}</span></div>
                        <div>✨ 天赋：${member.talent?.name || '无'} — ${member.talent?.desc || '无'}</div>
                    </div>
                    <div style="margin-top:6px; display:flex; flex-wrap: wrap; gap:4px;">
                        <span style="color:#aaa;">已学魂技:</span>
                        ${member.skills.map(s => `<span class="skill-tag" data-skill="${s}" style="background:#4a6a7f; padding:2px 8px; border-radius:4px; cursor:pointer;" title="点击查看详情">${s}</span>`).join('')}
                    </div>
                    ${member.soulRings && member.soulRings.length > 0 ? `
                    <div style="margin-top:6px; display:flex; flex-direction:column; gap:2px;">
                        ${member.soulRings.map((ring, i) => `
                            <div style="display:flex; align-items:center; gap:6px; font-size:13px; color:#ffd700;">
                                <span>第${i+1}魂环</span>
                                <span style="background:#3a2a1a; padding:1px 6px; border-radius:3px; color:#f39c12;">${ring.beastName}</span>
                                <span style="color:#aaa;">→</span>
                                <span style="background:#2a4a3a; padding:1px 6px; border-radius:3px; color:#2ecc71;">魂技 ${ring.skillName}</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    <div style="margin-top:6px; display:flex; flex-wrap: wrap; gap:4px;">
                        <span style="color:#aaa;">经验值:</span>
                        <span style="color:#e74c3c;">烈焰${member.exp?.['烈焰'] || 0}</span>
                        <span style="color:#27ae60;">苍木${member.exp?.['苍木'] || 0}</span>
                        <span style="color:#8e44ad;">蛊毒${member.exp?.['蛊毒'] || 0}</span>
                        <span style="color:#f39c12;">巨兽${member.exp?.['巨兽'] || 0}</span>
                        <span style="color:#3498db;">雷霆${member.exp?.['雷霆'] || 0}</span>
                        <span style="color:#1abc9c;">沧澜${member.exp?.['沧澜'] || 0}</span>
                        <span style="color:#e67e22;">天工${member.exp?.['天工'] || 0}</span>
                    </div>
                    <div style="margin-top:8px; padding:6px 0; border-top:1px solid #444; display:flex; align-items:center; gap:12px;">
                        <span style="font-weight:bold;">出战系别:</span>
                        <span style="background:#3a4a5f; padding:4px 12px; border-radius:6px;">${chosenAff}</span>
                        <button class="change-affinity-btn" data-id="${member.id}" style="background:#8e44ad; color:white; border:none; padding:4px 14px; border-radius:6px; cursor:pointer; font-size:14px;">
                            切换为 ${chosenAff === wuhun.mainAffinity ? wuhun.subAffinity : wuhun.mainAffinity}
                        </button>
                    </div>
                </div>
            `;
        }
        html += '</div>';
    }
    list.innerHTML = html;

    document.querySelectorAll('.change-affinity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            toggleCharacterAffinity(id);
        });
    });

    // 技能标签点击弹出说明
    document.querySelectorAll('.skill-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            const skillId = e.currentTarget.dataset.skill;
            showSkillInfoPopup(skillId);
        });
    });
}

// 弹出技能说明
function showSkillInfoPopup(skillId) {
    const existing = document.getElementById('skill-info-popup');
    if (existing) existing.remove();

    const skillDef = getSkillById(skillId);
    if (!skillDef) return;

    const popup = document.createElement('div');
    popup.id = 'skill-info-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 380px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        border: 2px solid #8e44ad;
        border-radius: 10px;
        padding: 20px 25px;
        z-index: 5000;
        font-family: 'Segoe UI', sans-serif;
        text-align: center;
    `;
    popup.innerHTML = `
        <h3 style="margin-top:0; color:#ffcc88;">⚡ ${skillDef.name}</h3>
        <div style="margin:12px 0; padding:10px; background:#1a1a2e; border-radius:6px; text-align:left;">
            <div style="margin-bottom:6px;"><strong style="color:#f39c12;">系别：</strong>${skillDef.affinity || '通用'}</div>
            ${skillDef.cost !== undefined ? `<div style="margin-bottom:6px;"><strong style="color:#f39c12;">消耗：</strong>${skillDef.cost} SP</div>` : ''}
            <div><strong style="color:#f39c12;">描述：</strong>${skillDef.desc || '无描述'}</div>
        </div>
        <button id="close-skill-info-popup" style="
            background:#666; color:white; border:none; padding:8px 30px;
            border-radius:6px; cursor:pointer; font-size:16px;
        ">关闭</button>
    `;
    document.body.appendChild(popup);

    document.getElementById('close-skill-info-popup').addEventListener('click', () => {
        if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    });
}

export function toggleCharacterPanel(show = null) {
    createCharacterPanel();
    const panel = document.getElementById('character-panel');
    if (!panel) return;
    if (show === false || panel.style.display !== 'none') {
        panel.style.display = 'none';
    } else {
        updateCharacterList();
        panel.style.display = 'flex';
    }
}

// ---------- 队伍面板 ----------
function createTeamPanel() {
    if (document.getElementById('team-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'team-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 700px;
        max-height: 80vh;
        background: rgba(20,20,20,0.96);
        color: white;
        border: 2px solid gold;
        border-radius: 12px;
        padding: 20px;
        z-index: 3000;
        display: none;
        font-family: 'Segoe UI', sans-serif;
    `;
    document.body.appendChild(panel);
}

function renderTeamPanel() {
    const panel = document.getElementById('team-panel');
    if (!panel) return;

    let formHtml = '<div style="margin-bottom:15px;"><strong>阵型：</strong>';
    FORMATION_OPTIONS.forEach(opt => {
        const active = app.selectedFormation === opt.key ? 'style="background:#e67e22;"' : 'style="background:#555;"';
        formHtml += `<button class="formation-opt" data-key="${opt.key}" ${active}>${opt.label}</button> `;
    });
    formHtml += '</div>';

    let slotHtml = '<div style="display:flex; justify-content:space-around; margin-bottom:20px;">';
    for (let i = 0; i < 3; i++) {
        const memberId = app.activeTeam[i];
        const member = memberId ? app.party.find(m => m.id === memberId) : null;
        const display = member ? `${member.name}·${member.wuhun}` : '空';
        const color = member ? member.color : '#666';
        slotHtml += `
            <div class="team-slot" data-slot="${i}" style="
                width:150px; height:100px; border:2px dashed #aaa; border-radius:8px;
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                cursor:pointer; background:#1e1e1e;
            ">
                <div style="font-size:24px; color:${color};">● ${display}</div>
                <div style="font-size:14px; color:#aaa;">第${i+1}位</div>
            </div>
        `;
    }
    slotHtml += '</div>';

    const usedIds = app.activeTeam.filter(id => id !== null);
    // 显示所有角色，但阵亡的标记为不可选
    let charListHtml = '<div style="max-height:200px; overflow-y:auto; border:1px solid #444; padding:5px;">';
    if (app.party.length === 0) {
        charListHtml += '<p>没有可用的角色</p>';
    } else {
        for (const member of app.party) {
            const isUsed = usedIds.includes(member.id);
            const isDead = member.alive === false;
            const wuhun = app.wuhunDatabase[member.wuhun];
            // 阵亡或已编入的角色不可选
            const disabled = isUsed || isDead;
            const style = disabled ? 'opacity:0.5; pointer-events:none;' : 'cursor:pointer;';
            const hpText = isDead ? '💀 阵亡' : `❤️ ${member.hp}/${member.maxHp}`;
            charListHtml += `
                <div class="team-char-option" data-id="${member.id}" style="
                    padding:8px; margin:3px; background:#2a2a2a; border-radius:5px;
                    ${style}
                ">
                    <span style="color:${member.color};">●</span> ${member.name}·${member.wuhun}
                    ${wuhun ? `(Lv.${member.level} 力:${wuhun.baseForce} 速:${wuhun.baseSpeed} 智:${wuhun.baseIntelligence})` : ''}
                    <span style="float:right; font-size:13px;">${hpText}</span>
                    ${isUsed ? ' <span style="color:#e74c3c;">(已编入)</span>' : ''}
                    ${isDead ? ' <span style="color:#e74c3c;">(阵亡)</span>' : ''}
                </div>
            `;
        }
    }
    charListHtml += '</div>';

    const html = `
        <h2 style="margin-top:0;">⚔️ 出战队伍</h2>
        ${formHtml}
        ${slotHtml}
        <p style="margin:10px 0;">💡 点击上方槽位选中，再点击下方角色来编入。选中槽位高亮。双击槽位清空。</p>
        ${charListHtml}
        <div style="margin-top:15px; display:flex; gap:10px;">
            <button id="save-team-btn" style="background:#2ecc71; color:white; border:none; padding:8px 20px; border-radius:6px; cursor:pointer; flex:1;">保存队伍</button>
            <button id="close-team-panel" style="background:#666; color:white; border:none; padding:8px 20px; border-radius:6px; cursor:pointer;">关闭</button>
        </div>
    `;
    panel.innerHTML = html;

    let selectedSlot = null;

    document.querySelectorAll('.formation-opt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = e.target.dataset.key;
            app.selectedFormation = key;
            renderTeamPanel();
        });
    });

    document.querySelectorAll('.team-slot').forEach(slotDiv => {
        slotDiv.addEventListener('click', (e) => {
            const slotIndex = parseInt(e.currentTarget.dataset.slot);
            // 如果点击的是已选中的槽位，则移除该槽位的角色
            if (selectedSlot === slotIndex) {
                app.activeTeam[slotIndex] = null;
                selectedSlot = null;
                renderTeamPanel();
                return;
            }
            document.querySelectorAll('.team-slot').forEach(s => s.style.borderColor = '#aaa');
            e.currentTarget.style.borderColor = 'lime';
            selectedSlot = slotIndex;
        });
    });

    document.querySelectorAll('.team-char-option').forEach(option => {
        option.addEventListener('click', (e) => {
            if (selectedSlot === null) {
                setMoveTip('请先选择一个槽位');
                return;
            }
            const charId = e.currentTarget.dataset.id;
            if (app.activeTeam.some((id, idx) => id === charId && idx !== selectedSlot)) {
                setMoveTip('该角色已在其他位置');
                return;
            }
            app.activeTeam[selectedSlot] = charId;
            renderTeamPanel();
            selectedSlot = null;
        });
    });

    document.getElementById('save-team-btn').addEventListener('click', () => {
        setMoveTip('出战队伍已保存');
        panel.style.display = 'none';
    });

    document.getElementById('close-team-panel').addEventListener('click', () => {
        panel.style.display = 'none';
    });
}

export function toggleTeamPanel(show = null) {
    createTeamPanel();
    const panel = document.getElementById('team-panel');
    if (!panel) return;
    if (show === false || panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        if (!app.activeTeam || app.activeTeam.length !== 3) {
            app.activeTeam = [null, null, null];
        }
        renderTeamPanel();
        panel.style.display = 'block';
    }
}
 