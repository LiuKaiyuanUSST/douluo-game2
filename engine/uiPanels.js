import { app } from './gameState.js';
import { useBackpackItem, goToTown } from './gameLogic.js';
import { setMoveTip, saveGame, loadGame, getSaveSlotInfo } from './utilsCore.js';
import { toggleCharacterPanel, toggleTeamPanel } from './uiCharacterTeam.js';
import { toggleHelpPanel } from './uiHelp.js';

// ---------- 按钮行 ----------
export function createButtonRow() {
    if (document.getElementById('button-row')) return document.getElementById('button-row');
    const container = document.getElementById('game-container');
    const row = document.createElement('div');
    row.id = 'button-row';
    row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 800px;
        margin-top: 10px;
    `;
    container.parentNode.insertBefore(row, container.nextSibling);
    return row;
}

// ---------- 存档按钮 ----------
export function createSaveButton(buttonRow) {
    if (document.getElementById('save-btn')) return;
    const btn = document.createElement('div');
    btn.id = 'save-btn';
    btn.innerHTML = '💾 存档';
    btn.style.cssText = `
        padding: 10px 20px;
        background: #4a6a7f;
        color: white;
        border: 2px solid #6a8a9f;
        border-radius: 12px;
        cursor: pointer;
        font-size: 18px;
        font-family: 'Segoe UI', sans-serif;
        user-select: none;
    `;
    btn.addEventListener('click', () => toggleSavePanel());
    buttonRow.appendChild(btn);
}

export function createReturnToTownButton(buttonRow) {
    if (document.getElementById('return-town-btn')) return;
    const btn = document.createElement('div');
    btn.id = 'return-town-btn';
    btn.innerHTML = '🏠 主城';
    btn.style.cssText = `
        padding: 10px 20px;
        background: #4a6a7f;
        color: white;
        border: 2px solid #6a8a9f;
        border-radius: 12px;
        cursor: pointer;
        font-size: 18px;
        font-family: 'Segoe UI', sans-serif;
        user-select: none;
    `;
    btn.addEventListener('click', () => {
        if (app.dialogActive) return;
        goToTown(true);
        setMoveTip("返回主城");
    });
    buttonRow.appendChild(btn);
}

export function createBackpackButton(buttonRow) {
    if (document.getElementById('backpack-btn')) return;
    const btn = document.createElement('div');
    btn.id = 'backpack-btn';
    btn.innerHTML = '🎒 背包';
    btn.style.cssText = `
        padding: 10px 20px;
        background: #4a6a7f;
        color: white;
        border: 2px solid #6a8a9f;
        border-radius: 12px;
        cursor: pointer;
        font-size: 18px;
        font-family: 'Segoe UI', sans-serif;
        user-select: none;
    `;
    btn.addEventListener('click', () => toggleBackpack());
    buttonRow.appendChild(btn);
}

export function createCharacterButton(buttonRow) {
    if (document.getElementById('character-btn')) return;
    const btn = document.createElement('div');
    btn.id = 'character-btn';
    btn.innerHTML = '👥 角色';
    btn.style.cssText = `
        padding: 10px 20px;
        background: #4a6a7f;
        color: white;
        border: 2px solid #6a8a9f;
        border-radius: 12px;
        cursor: pointer;
        font-size: 18px;
        font-family: 'Segoe UI', sans-serif;
        user-select: none;
    `;
    btn.addEventListener('click', () => toggleCharacterPanel());
    buttonRow.appendChild(btn);
}

export function createTeamButton(buttonRow) {
    if (document.getElementById('team-btn')) return;
    const btn = document.createElement('div');
    btn.id = 'team-btn';
    btn.innerHTML = '⚔️ 队伍';
    btn.style.cssText = `
        padding: 10px 20px;
        background: #4a6a7f;
        color: white;
        border: 2px solid #6a8a9f;
        border-radius: 12px;
        cursor: pointer;
        font-size: 18px;
        font-family: 'Segoe UI', sans-serif;
        user-select: none;
    `;
    btn.addEventListener('click', () => toggleTeamPanel());
    buttonRow.appendChild(btn);
}

export function createHelpButton(buttonRow) {
    if (document.getElementById('help-btn')) return;
    const btn = document.createElement('div');
    btn.id = 'help-btn';
    btn.innerHTML = '❓ 帮助';
    btn.style.cssText = `
        padding: 10px 20px;
        background: #4a6a7f;
        color: white;
        border: 2px solid #6a8a9f;
        border-radius: 12px;
        cursor: pointer;
        font-size: 18px;
        font-family: 'Segoe UI', sans-serif;
        user-select: none;
    `;
    btn.addEventListener('click', () => toggleHelpPanel());
    buttonRow.appendChild(btn);
}

// ---------- 存档面板（3个存档位） ----------
function createSavePanel() {
    if (document.getElementById('save-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'save-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        background: rgba(0,0,0,0.92);
        color: white;
        border: 2px solid #aaa;
        border-radius: 10px;
        padding: 20px;
        z-index: 3000;
        display: none;
        font-family: 'Segoe UI', sans-serif;
        text-align: center;
    `;
    panel.innerHTML = `
        <h3 style="margin-top:0;">💾 存档管理</h3>
        <div id="save-slots-container"></div>
        <button id="panel-new-game-btn" style="display:block; width:100%; margin:10px 0; padding:10px; background:#e67e22; color:white; border:none; border-radius:6px; cursor:pointer; font-size:16px;">🔄 开始新游戏</button>
        <button id="panel-close-btn" style="display:block; width:100%; margin:10px 0 0; padding:8px; background:#666; color:white; border:none; border-radius:6px; cursor:pointer;">关闭</button>
    `;
    document.body.appendChild(panel);

    document.getElementById('panel-new-game-btn').addEventListener('click', () => {
        if (confirm('确定要开始新游戏吗？当前进度将会丢失！')) {
            // 重置游戏状态（不清除存档）
            app.party = [];
            app.player = null;
            app.inventory = { jiupin: 0 };
            app.currentLevel = null;
            app.unlockedLevels = [];
            app.currentTown = 'noting';
            app.townPlayerPos = { x: 0, y: 0 };
            app.activeTeam = [null, null, null];
            app.selectedFormation = 'front-back-front';
            app.wuhunChosen = false;
            app.xwWuhunChosen = false;
            app.shrekPartnerChosen = false;
            app.shrekFirstMoveDone = false;
            app.fldRegistrationDone = false;
            app.firstLevelEntered = false;
            app.secondLevelEntered = false;
            app.pendingXiaoWuChoice = false;
            app.showAffinityHint = false;
            app.showResurrectionHint = false;
            app.state = 'TOWN';
            app.maze = null;
            app.battle = null;
            app.battleTargeting = false;
            app.battleEnemyTurnDone = false;
            app.backpackOpen = false;
            app.dialogActive = false;
            toggleSavePanel(false);
            location.reload();
        }
    });
    document.getElementById('panel-close-btn').addEventListener('click', () => toggleSavePanel(false));
}

function updateSaveSlots() {
    const container = document.getElementById('save-slots-container');
    if (!container) return;
    let html = '';
    for (let slot = 1; slot <= 3; slot++) {
        const info = getSaveSlotInfo(slot);
        const slotColor = info.exists ? '#2ecc71' : '#666';
        html += `
            <div style="border:1px solid #555; border-radius:8px; margin:8px 0; padding:10px; background:rgba(255,255,255,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-weight:bold; color:${slotColor};">存档位 ${slot}</span>
                    <span style="font-size:13px; color:#aaa;">${info.exists ? '有存档' : '空'}</span>
                </div>
                <div style="font-size:13px; color:#ddd; margin-bottom:8px; min-height:20px; word-break:break-all;">${info.displayName}</div>
                <div style="display:flex; gap:8px;">
                    <button class="save-slot-btn" data-slot="${slot}" style="flex:1; padding:8px; background:#2ecc71; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px;">💾 保存</button>
                    <button class="load-slot-btn" data-slot="${slot}" style="flex:1; padding:8px; background:#3498db; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px;">📂 读取</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;

    // 绑定保存按钮事件
    document.querySelectorAll('.save-slot-btn').forEach(btn => {
        btn.onclick = () => {
            const slot = parseInt(btn.dataset.slot);
            // 弹出确认对话框
            showSaveConfirmDialog(slot);
        };
    });

    // 绑定读取按钮事件
    document.querySelectorAll('.load-slot-btn').forEach(btn => {
        btn.onclick = () => {
            const slot = parseInt(btn.dataset.slot);
            const success = loadGame(slot);
            if (success) toggleSavePanel(false);
        };
    });
}

// ---------- 保存确认对话框 ----------
function showSaveConfirmDialog(slot) {
    // 如果已存在则移除
    const existing = document.getElementById('save-confirm-dialog');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'save-confirm-dialog';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6);
        z-index: 4000;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: rgba(30,30,40,0.95);
        color: white;
        border: 2px solid #888;
        border-radius: 12px;
        padding: 30px 40px;
        text-align: center;
        min-width: 320px;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
    `;
    dialog.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px;">💾</div>
        <div style="font-size: 20px; margin-bottom: 20px; line-height: 1.5;">
            确认保存到存档位 ${slot} 吗？<br>
            <span style="font-size: 14px; color: #aaa;">这会覆盖之前的存档</span>
        </div>
        <div style="display: flex; gap: 16px; justify-content: center;">
            <button id="confirm-save-yes" style="
                padding: 10px 30px;
                background: #2ecc71;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 18px;
                font-family: inherit;
            ">确认</button>
            <button id="confirm-save-no" style="
                padding: 10px 30px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 18px;
                font-family: inherit;
            ">取消</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    document.getElementById('confirm-save-yes').addEventListener('click', () => {
        saveGame(slot);
        updateSaveSlots();
        overlay.remove();
    });

    document.getElementById('confirm-save-no').addEventListener('click', () => {
        overlay.remove();
    });

    // 点击遮罩层也关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

function toggleSavePanel(show = null) {
    createSavePanel();
    const panel = document.getElementById('save-panel');
    if (!panel) return;
    if (show === false || panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        updateSaveSlots();
        panel.style.display = 'block';
    }
}

// ---------- 背包 ----------
export function createBackpackPanel() {
    if (document.getElementById('backpack-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'backpack-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 320px;
        background: rgba(0,0,0,0.92);
        color: white;
        border: 2px solid #aaa;
        border-radius: 10px;
        padding: 20px;
        z-index: 3000;
        display: none;
        font-family: 'Segoe UI', sans-serif;
        text-align: center;
    `;
    panel.innerHTML = `
        <h3 style="margin-top:0;">🎒 背包</h3>
        <div id="backpack-list" style="max-height: 200px; overflow-y:auto; text-align:left;"></div>
        <button id="close-backpack" style="margin-top:10px; background:#666; color:white; border:none; padding:5px 10px; cursor:pointer;">关闭</button>
        <p style="margin-top:15px; color:#aaa; font-size:14px;">💡 按 <b>Q</b> 键可快速打开/关闭背包</p>
    `;
    document.body.appendChild(panel);
    document.getElementById('close-backpack').addEventListener('click', () => toggleBackpack(false));
}

function updateBackpackList() {
    const list = document.getElementById('backpack-list');
    if (!list) return;
    const items = [];
    if (app.inventory.jiupin > 0) {
        items.push({ name: '九品紫芝', count: app.inventory.jiupin, type: 'jiupin' });
    }
    if (app.inventory.wanghun > 0) {
        items.push({ name: '忘魂草', count: app.inventory.wanghun, type: 'wanghun' });
    }
    if (items.length === 0) {
        list.innerHTML = '<p style="text-align:center;">背包空空如也</p>';
        return;
    }

    let html = '';
    items.forEach(item => {
        html += `<div style="display:flex; justify-content:space-between; align-items:center; margin:5px 0;">
            <span>${item.name} ×${item.count}</span>
            <button class="use-item" data-type="${item.type}" style="background:#4a6a7f; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">使 用</button>
        </div>`;
    });
    list.innerHTML = html;
    document.querySelectorAll('.use-item').forEach(btn => {
        btn.onclick = () => {
            const type = btn.dataset.type;
            const success = useBackpackItem(type);
            if (success) {
                updateBackpackList();
                toggleBackpack(false);
            }
        };
    });
}

export function toggleBackpack(show = null) {
    if (app.dialogActive) return;
    createBackpackPanel();
    const panel = document.getElementById('backpack-panel');
    if (!panel) return;
    if (show === false || (panel.style.display === 'block' && show !== true)) {
        panel.style.display = 'none';
        app.backpackOpen = false;
    } else {
        updateBackpackList();
        panel.style.display = 'block';
        app.backpackOpen = true;
    }
}



