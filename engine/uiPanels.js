import { app } from './gameState.js';
import { useBackpackItem, goToTown } from './gameLogic.js';
import { setMoveTip } from './utilsCore.js';
import { saveGame, loadGame } from './utilsCore.js';
import { toggleCharacterPanel, toggleTeamPanel } from './uiCharacterTeam.js';

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

// ---------- 存档面板 ----------
function createSavePanel() {
    if (document.getElementById('save-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'save-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
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
        <button id="panel-save-game-btn" style="display:block; width:100%; margin:10px 0; padding:10px; background:#2ecc71; color:white; border:none; border-radius:6px; cursor:pointer; font-size:16px;">保存当前进度</button>
        <button id="panel-load-game-btn" style="display:block; width:100%; margin:10px 0; padding:10px; background:#3498db; color:white; border:none; border-radius:6px; cursor:pointer; font-size:16px;">读取进度</button>
        <button id="panel-new-game-btn" style="display:block; width:100%; margin:10px 0; padding:10px; background:#e67e22; color:white; border:none; border-radius:6px; cursor:pointer; font-size:16px;">🔄 开始新游戏</button>
        <button id="panel-close-btn" style="display:block; width:100%; margin:10px 0 0; padding:8px; background:#666; color:white; border:none; border-radius:6px; cursor:pointer;">关闭</button>
    `;
    document.body.appendChild(panel);

    document.getElementById('panel-save-game-btn').addEventListener('click', () => {
        saveGame();
        toggleSavePanel(false);
    });
    document.getElementById('panel-load-game-btn').addEventListener('click', () => {
        const success = loadGame();
        if (success) toggleSavePanel(false);
    });
    document.getElementById('panel-new-game-btn').addEventListener('click', () => {
        if (confirm('确定要开始新游戏吗？当前进度将会丢失！')) {
            localStorage.removeItem('douluo_save_slot_1');
            location.reload();
        }
    });
    document.getElementById('panel-close-btn').addEventListener('click', () => toggleSavePanel(false));
}

function toggleSavePanel(show = null) {
    createSavePanel();
    const panel = document.getElementById('save-panel');
    if (!panel) return;
    if (show === false || panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
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

// ---------- 帮助面板 ----------
let currentHelpTab = 'battle';

function createHelpPanel() {
    if (document.getElementById('help-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'help-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 700px;
        max-height: 80vh;
        background: rgba(0,0,0,0.95);
        color: #eee;
        border: 2px solid #888;
        border-radius: 12px;
        z-index: 3000;
        display: none;
        font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
        line-height: 1.6;
        flex-direction: column;
    `;
    // 固定头部：标题行 + 标签行
    panel.innerHTML = `
        <div style="flex-shrink:0; padding:20px 30px 0 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #555; padding-bottom:10px;">
                <h2 style="margin:0; color:#ffcc88;">📖 帮助</h2>
                <button id="close-help" style="background:#666; color:white; border:none; padding:5px 15px; border-radius:6px; cursor:pointer; font-size:16px;">✕ 关闭</button>
            </div>
            <div style="display:flex; gap:10px; margin:12px 0 0 0; padding-bottom:10px; border-bottom:1px solid #444;">
                <button id="help-tab-battle" class="help-tab-btn" data-tab="battle" style="flex:1; padding:8px 0; background:#5a7a8f; color:white; border:none; border-radius:6px; cursor:pointer; font-size:15px; font-weight:bold;">🗡️ 战斗</button>
                <button id="help-tab-wuhun" class="help-tab-btn" data-tab="wuhun" style="flex:1; padding:8px 0; background:#4a6a7f; color:white; border:none; border-radius:6px; cursor:pointer; font-size:15px;">🌀 武魂</button>
                <button id="help-tab-skill" class="help-tab-btn" data-tab="skill" style="flex:1; padding:8px 0; background:#4a6a7f; color:white; border:none; border-radius:6px; cursor:pointer; font-size:15px;">⚡ 魂技</button>
                <button id="help-tab-level" class="help-tab-btn" data-tab="level" style="flex:1; padding:8px 0; background:#4a6a7f; color:white; border:none; border-radius:6px; cursor:pointer; font-size:15px;">⬆️ 等级</button>
            </div>
        </div>
        <div id="help-content" style="flex:1; overflow-y:auto; white-space:pre-wrap; font-size:15px; color:#ddd; padding:15px 30px 20px 30px;">
            <p style="text-align:center; color:#888;">加载中…</p>
        </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('close-help').addEventListener('click', () => toggleHelpPanel(false));

    // 标签切换事件
    document.querySelectorAll('.help-tab-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const tab = btn.dataset.tab;
            if (tab === currentHelpTab) return;
            currentHelpTab = tab;
            // 更新按钮高亮
            document.querySelectorAll('.help-tab-btn').forEach(b => {
                b.style.background = '#4a6a7f';
                b.style.fontWeight = 'normal';
            });
            btn.style.background = '#5a7a8f';
            btn.style.fontWeight = 'bold';
            // 加载对应内容
            const fileName = `help_${tab}.txt`;
            const contentDiv = document.getElementById('help-content');
            contentDiv.textContent = '加载中…';
            try {
                const response = await fetch(`./dialogues/${fileName}`);
                if (!response.ok) throw new Error(`无法加载帮助文件: ${fileName}`);
                const text = await response.text();
                contentDiv.textContent = text;
            } catch (e) {
                contentDiv.innerHTML = `<p style="color:#e74c3c;">加载失败: ${e.message}</p>`;
            }
        });
    });
}

export async function toggleHelpPanel(show = null) {
    if (app.dialogActive) return;
    createHelpPanel();
    const panel = document.getElementById('help-panel');
    if (!panel) return;
    if (show === false || (panel.style.display !== 'none' && show !== true)) {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'flex';
        // 默认加载战斗帮助
        if (currentHelpTab === 'battle') {
            const contentDiv = document.getElementById('help-content');
            if (contentDiv && contentDiv.textContent === '加载中…') {
                try {
                    const response = await fetch('./dialogues/help_battle.txt');
                    if (!response.ok) throw new Error('无法加载帮助文件');
                    const text = await response.text();
                    contentDiv.textContent = text;
                } catch (e) {
                    contentDiv.innerHTML = `<p style="color:#e74c3c;">加载失败: ${e.message}</p>`;
                }
            }
        }
    }
}
