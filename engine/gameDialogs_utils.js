// engine/gameDialogs_utils.js - 对话框工具函数
import { app } from './gameState.js';

// 以下函数通过 gameLogic.js 注册，避免循环依赖
export function registerStartDialogue(fn) { startDialogue = fn; }
export function registerGoToTown(fn) { goToTown = fn; }

let startDialogue = function() { console.warn('startDialogue not yet registered'); };
let goToTown = function() { console.warn('goToTown not yet registered'); };

export { startDialogue, goToTown };

// ========== 工具函数 ==========

export function getWuhunFeature(wuhunName) {
    const wuhun = app.wuhunDatabase[wuhunName];
    if (!wuhun) return { feature: '未知', talentAttr: '未知' };
    return {
        feature: wuhun.feature || '未知',
        talentAttr: wuhun.talentAttr || '未知'
    };
}

export function getRandomWuhunOptions(count, excludeList = []) {
    const baseExclude = ['蓝银草', ...excludeList];
    const allWuhunNames = Object.keys(app.wuhunDatabase).filter(name => {
        const wuhun = app.wuhunDatabase[name];
        return wuhun && wuhun.category === 'hero' && !baseExclude.includes(name);
    });
    const shuffled = [...allWuhunNames].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// ========== 通用对话框样式 ==========

export const DIALOGUE_STYLES = {
    container: `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 650px;
        max-height: 80vh;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Segoe UI', sans-serif;
        padding: 30px 40px;
        box-sizing: border-box;
        z-index: 2000;
        border-radius: 12px;
        border: 2px solid #ffcc00;
        overflow-y: auto;
    `,
    containerNarrow: `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 620px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Segoe UI', sans-serif;
        padding: 30px 40px;
        box-sizing: border-box;
        z-index: 2000;
        border-radius: 12px;
        border: 2px solid #ffcc00;
    `,
    containerSmall: `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Segoe UI', sans-serif;
        padding: 30px 40px;
        box-sizing: border-box;
        z-index: 2000;
        border-radius: 12px;
        border: 2px solid #ffcc00;
    `,
    speaker: 'color:#ffcc88; font-style:italic; font-size:18px;',
    btnOrange: `
        display:block; margin:10px auto 0 auto; padding:12px 40px;
        background:#e67e22; color:white; border:none; border-radius:8px;
        cursor:pointer; font-size:18px; font-weight:bold;
    `,
    btnGreen: `
        display:block; margin:0 auto; padding:12px 40px;
        background:#2ecc71; color:white; border:none; border-radius:8px;
        cursor:pointer; font-size:18px; font-weight:bold;
    `,
    btnOption: `
        display:block; margin:8px 0; padding:12px 15px; width:100%;
        background:#2a3a4a; color:white; border:2px solid #4a6a7f; border-radius:8px;
        cursor:pointer; font-size:16px; text-align:left;
        transition: background 0.2s;
    `,
    infoBox: `
        margin-bottom:16px; padding:14px; background:#1a2a1a; border-radius:8px; border:1px solid #4a6a4a;
    `
};

// ========== 通用对话框创建/关闭 ==========

export function createDialogContainer(id, style = DIALOGUE_STYLES.container) {
    const container = document.createElement('div');
    container.id = id;
    container.style.cssText = style;
    document.body.appendChild(container);
    return container;
}

export function closeDialog(container) {
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
}
 