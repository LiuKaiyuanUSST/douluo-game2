// engine/gameDialogs_events.js - 事件对话框（赵无极报名费、黑屏显示等）
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { startStoryMusicTransition, endStoryMusicTransition } from './gameMusic.js';
import {
    DIALOGUE_STYLES, createDialogContainer, closeDialog,
    startDialogue, goToTown
} from './gameDialogs_utils.js';

// ========== 赵无极报名费对话 ==========

export function showZwjRegistrationDialog() {
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('zwj-dialogue-container', DIALOGUE_STYLES.containerSmall);

    function renderDialog() {
        const hasEnoughGold = (app.player.gold || 0) >= 100;
        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">赵无极（史莱克学院副院长）</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:15px;">
                报名费，一百个金魂币，先交钱。
            </div>
            <div style="margin-bottom:15px; color:#aaa; font-size:16px;">
                当前金魂币：${app.player.gold || 0}
            </div>
            <button id="zwj-pay-btn" style="
                display:block; margin:10px 0; padding:12px; width:100%;
                background:${hasEnoughGold ? '#2ecc71' : '#555'}; color:white; border:none; border-radius:8px;
                cursor:${hasEnoughGold ? 'pointer' : 'not-allowed'}; font-size:18px;
            " ${hasEnoughGold ? '' : 'disabled'}>
                缴纳100金魂币${hasEnoughGold ? '' : '（金魂币不足）'}
            </button>
            <button id="zwj-nomoney-btn" style="
                display:block; margin:10px 0; padding:12px; width:100%;
                background:#e67e22; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:18px;
            ">我没有钱</button>
        `;

        document.getElementById('zwj-pay-btn').addEventListener('click', () => {
            if (!hasEnoughGold) return;
            app.player.gold -= 100;
            app.fldRegistrationDone = true;
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            // 缴费成功后，依次播放赵无极报名对话剧情
            startDialogue('registration_fee', 'chapter3_fld.txt', () => {
                startDialogue('zzq_enters', 'chapter3_fld.txt', () => {
                    startDialogue('nrr_enters', 'chapter3_fld.txt', () => {
                        startDialogue('exam_announce', 'chapter3_fld.txt', () => {
                            // 对话结束后直接前往史莱克学院门口
                            app.currentTown = 'shrek';
                            goToTown(true);
                        });
                    });
                });
            });
        });

        document.getElementById('zwj-nomoney-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            setMoveTip("金魂币不足，无法进入史莱克学院，请先去赚取金魂币！");
        });
    }

    renderDialog();
}

// ========== 黑屏显示（史莱克学院入口） ==========

export function showBlackScreen() {
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = document.createElement('div');
    container.id = 'black-screen-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        color: white;
        font-family: 'Segoe UI', sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 3000;
    `;
    container.innerHTML = `
        <div style="font-size:36px; margin-bottom:20px;">🖤</div>
        <div style="font-size:24px; color:#ffcc88; margin-bottom:10px;">史莱克学院门口</div>
        <div style="font-size:16px; color:#aaa; margin-bottom:30px;">缴纳报名费成功，你已来到史莱克学院门口...</div>
        <button id="black-screen-close-btn" style="
            padding:12px 40px;
            background:#4a6a7f; color:white; border:none; border-radius:8px;
            cursor:pointer; font-size:18px;
        ">返回主城</button>
    `;
    document.body.appendChild(container);

    document.getElementById('black-screen-close-btn').addEventListener('click', () => {
        closeDialog(container);
        app.dialogActive = false;
        endStoryMusicTransition();
        goToTown(true);
    });
}
 