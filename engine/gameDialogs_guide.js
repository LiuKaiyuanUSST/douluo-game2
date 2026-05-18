// engine/gameDialogs_guide.js - 引导说明对话框（系别克制、关卡提示、魂环引导等）
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { startStoryMusicTransition, endStoryMusicTransition } from './gameMusic.js';
import {
    DIALOGUE_STYLES, createDialogContainer, closeDialog,
    startDialogue, goToTown
} from './gameDialogs_utils.js';

// ========== 大师武魂克制说明 ==========

export function showAffinityGuideDialog() {
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('affinity-guide-container', DIALOGUE_STYLES.containerNarrow);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                唐三，在进入战斗之前，我要告诉你一个重要的知识——<strong style="color:#f39c12;">武魂系别克制</strong>。
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px; color:#ffcc88;">🔥 克制循环 🔥</div>
                <div style="text-align:center; font-size:15px; line-height:2;">
                    <span style="color:#e74c3c;">烈焰</span> → <span style="color:#27ae60;">苍木</span> → <span style="color:#8e44ad;">蛊毒</span> → <span style="color:#f39c12;">巨兽</span> → <span style="color:#3498db;">雷霆</span> → <span style="color:#1abc9c;">沧澜</span> → <span style="color:#e74c3c;">烈焰</span>
                </div>
                <div style="text-align:center; font-size:13px; color:#aaa; margin-top:6px;">（克制方对被克制方造成额外伤害）</div>
                <div style="text-align:center; font-size:14px; color:#e67e22; margin-top:8px; border-top:1px solid #3a5a3a; padding-top:8px;">
                    ⚖️ <strong>天工</strong> 为独立体系，不克制任何系别，也不被任何系别克制
                </div>
            </div>
            <button id="affinity-guide-next-btn" style="${DIALOGUE_STYLES.btnOrange}">继续</button>
        `;
        document.getElementById('affinity-guide-next-btn').addEventListener('click', showPhase2);
    }

    function showPhase2() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                你即将面对的对手是<strong style="color:#f39c12;">巨兽系</strong>，建议你在<strong style="color:#e67e22;">角色界面</strong>将出战系别切换为<strong style="color:#8e44ad;">蛊毒系</strong>，即可克制对手。
            </div>
            <div style="font-size:15px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                💡 你也可以随时在右下角「帮助 → 武魂」中查看完整的系别克制关系。
            </div>
            <div style="font-size:17px; line-height:1.7; margin-bottom:20px; color:#ffcc88;">
                好了，接下来就看你的了！
            </div>
            <button id="affinity-guide-ok-btn" style="${DIALOGUE_STYLES.btnGreen}">明白了，出发！</button>
        `;
        document.getElementById('affinity-guide-ok-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            setMoveTip("进入 七舍争雄，移动到三角形标记 Boss 格");
        });
    }

    showPhase1();
}

// ========== 第二关大师提醒 ==========

export function showSecondLevelHintDialog() {
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('second-level-hint-container', DIALOGUE_STYLES.containerNarrow);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                唐三，你已经掌握了系别克制的基本知识。这一关的对手依然是<strong style="color:#f39c12;">巨兽系</strong>。
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="margin-bottom:6px;">💡 克制提醒：</div>
                <div style="font-size:15px; line-height:1.8;">
                    <span style="color:#8e44ad;">蛊毒</span> 克制 <span style="color:#f39c12;">巨兽</span> ✅ 推荐出战<br>
                    <span style="color:#3498db;">雷霆</span> 被 <span style="color:#f39c12;">巨兽</span> 克制 ❌ 避免使用
                </div>
            </div>
            <div style="font-size:16px; line-height:1.7; margin-bottom:12px;">
                请记得在<strong style="color:#e67e22;">角色界面</strong>检查每个角色的出战系别，不要让角色以被克制的系别出战。
            </div>
            <button id="second-level-next-btn" style="${DIALOGUE_STYLES.btnOrange}">继续</button>
        `;
        document.getElementById('second-level-next-btn').addEventListener('click', showPhase2);
    }

    function showPhase2() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                另外，这一关的 Boss 戴沐白是<strong style="color:#f39c12;">巨兽系</strong>，实力不容小觑。合理利用系别克制，才能发挥出最大战力。
            </div>
            <div style="font-size:15px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                💡 你可以在右下角「帮助 → 武魂」中随时查看系别克制关系。
            </div>
            <div style="font-size:17px; line-height:1.7; margin-bottom:20px; color:#ffcc88;">
                好了，去吧！
            </div>
            <button id="second-level-ok-btn" style="${DIALOGUE_STYLES.btnGreen}">明白了，出发！</button>
        `;
        document.getElementById('second-level-ok-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            setMoveTip("进入 初识邪眸，移动到三角形标记 Boss 格");
        });
    }

    showPhase1();
}

// ========== 史莱克学院大师对话（猎魂森林引导） ==========

export function showShrekAcademyMasterDialog() {
    if (app.shrekAcademyFirstMove) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('shrek-academy-master-container', DIALOGUE_STYLES.containerNarrow);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                唐三，欢迎来到史莱克学院。既然你已经通过了入学考试，是时候告诉你关于<strong style="color:#f39c12;">魂环</strong>的事了。
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="margin-bottom:6px;">💡 魂师修炼之道：</div>
                <div style="font-size:15px; line-height:1.8;">
                    魂师需要通过猎杀魂兽来获取<strong style="color:#e74c3c;">魂环</strong>，<br>
                    吸收魂环后才能获得<strong style="color:#3498db;">魂技</strong>，提升实力。<br><br>
                    没有魂环就没有魂技，没有魂技就无法在战斗中发挥真正的力量！
                </div>
            </div>
            <button id="shrek-master-next-btn" style="${DIALOGUE_STYLES.btnOrange}">继续</button>
        `;
        document.getElementById('shrek-master-next-btn').addEventListener('click', showPhase2);
    }

    function showPhase2() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                在史莱克学院附近有一处<strong style="color:#2ecc71;">圈养森林</strong>，那里有各种魂兽出没。
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="font-size:15px; line-height:1.8;">
                    🗺️ 前往<strong style="color:#2ecc71;">圈养森林</strong>猎杀魂兽，获取魂环，<br>
                    就能获得强大的<strong style="color:#3498db;">魂技</strong>！<br><br>
                    这是天斗帝国圈养低等级魂兽的地方，非常适合你们这些刚入门的魂师。<br><br>
                    记住，只有不断获取魂环，才能不断提升实力！
                </div>
            </div>
            <button id="shrek-master-ok-btn" style="${DIALOGUE_STYLES.btnGreen}">前往圈养森林</button>
        `;
        document.getElementById('shrek-master-ok-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            app.shrekAcademyFirstMove = true;
            endStoryMusicTransition();
            setMoveTip("💡 前往猎魂森林猎取魂环，获取魂技！");
        });
    }

    showPhase1();
}

// ========== 第一次从猎魂森林返回主城对话框 ==========

export function showFirstForestReturnDialog() {
    if (app.firstForestReturnDialogShown) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('first-forest-return-container', DIALOGUE_STYLES.containerNarrow);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                唐三，你从圈养森林回来了。感觉如何？
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="margin-bottom:6px;">💡 魂环吸收提示：</div>
                <div style="font-size:15px; line-height:1.8;">
                    猎杀魂兽后，你可以选择一位角色吸收魂环，获得魂技。<br><br>
                    如果对获得的魂技不满意，可以到<strong style="color:#f39c12;">商店</strong>购买<strong style="color:#e74c3c;">忘魂草</strong>（100金魂币），<br>
                    使用后可以遗忘角色的第一魂技和第一魂环，重新获取。
                </div>
            </div>
            <button id="forest-return-next-btn" style="${DIALOGUE_STYLES.btnOrange}">继续</button>
        `;
        document.getElementById('forest-return-next-btn').addEventListener('click', showPhase2);
    }

    function showPhase2() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                另外，你可以在<strong style="color:#e67e22;">角色界面</strong>查看每个角色的武魂系别，<br>
                在<strong style="color:#e67e22;">队伍界面</strong>调整出战阵型和站位。
            </div>
            <div style="font-size:17px; line-height:1.7; margin-bottom:20px; color:#ffcc88;">
                好了，继续你的冒险吧！
            </div>
            <button id="forest-return-ok-btn" style="${DIALOGUE_STYLES.btnGreen}">明白了</button>
        `;
        document.getElementById('forest-return-ok-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            app.firstForestReturnDialogShown = true;
            endStoryMusicTransition();
            setMoveTip("💡 点击相邻格子移动，或使用方向键/WASD");
        });
    }

    showPhase1();
}

// ========== 大师来访后 - 第二魂环与皇家试炼令引导 ==========

export function showMasterSecondSoulRingDialog() {
    if (app.masterSecondSoulRingDialogShown) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('master-second-soulring-container', DIALOGUE_STYLES.containerNarrow);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                唐三，你们已经突破二十级了。以你们现在的实力，有资格获取<strong style="color:#f39c12;">第二个魂环</strong>了。
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="margin-bottom:6px;">💡 第二魂环须知：</div>
                <div style="font-size:15px; line-height:1.8;">
                    每个角色最多可拥有的魂技数量等于其等级。<br>
                    唐三已提升至<strong style="color:#f39c12;">2级</strong>，现在每个角色最多可以拥有<strong style="color:#f39c12;">2个魂技</strong>。<br>
                    前往猎魂森林猎杀魂兽后，可以为角色附加第二个魂环！<br><br>
                    想要获取更强大的第二魂环，需要前往更高级的魂兽栖息地。
                </div>
            </div>
            <button id="master-second-soulring-next-btn" style="${DIALOGUE_STYLES.btnOrange}">继续</button>
        `;
        document.getElementById('master-second-soulring-next-btn').addEventListener('click', showPhase2);
    }


    function showPhase2() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                获取第二魂环不仅能让你获得新的魂技，还能提升你的等级。
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="margin-bottom:6px;">⚔️ 等级压制规则：</div>
                <div style="font-size:15px; line-height:1.8;">
                    战斗中，以全场等级最高者为基准计算等级差。<br>
                    等级差会带来属性修正——<br>
                    低等级的角色，力量、速度、智力都会受到影响。<br><br>
                    所以，提升等级在战斗中至关重要！
                </div>
            </div>
            <button id="master-second-soulring-next2-btn" style="${DIALOGUE_STYLES.btnOrange}">继续</button>
        `;
        document.getElementById('master-second-soulring-next2-btn').addEventListener('click', showPhase3);
    }

    function showPhase3() {
        container.innerHTML = `
            <div style="margin-bottom:12px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                在史莱克学院内有一处<strong style="color:#e74c3c;">高级圈养森林</strong>，那里圈养着天斗帝国的高级魂兽，实力远超普通圈养森林。
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="margin-bottom:6px;">🏛️ 关于高级圈养森林：</div>
                <div style="font-size:15px; line-height:1.8;">
                    由于圈养高级魂兽的成本极高，天斗帝国规定——<br>
                    进入者必须持有<strong style="color:#f39c12;">皇家试炼令</strong>。<br><br>
                    你可以前往<strong style="color:#e67e22;">商店</strong>购买皇家试炼令。
                </div>
            </div>
            <button id="master-second-soulring-ok-btn" style="${DIALOGUE_STYLES.btnGreen}">明白了</button>
        `;
        document.getElementById('master-second-soulring-ok-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            app.masterSecondSoulRingDialogShown = true;
            endStoryMusicTransition();
            setMoveTip("💡 前往商店购买皇家试炼令，即可进入高级圈养森林获取第二魂环！");
        });
    }


    showPhase1();
}

// ========== 高级圈养森林 - 皇家试炼令提交对话框 ==========

export function showRoyalTrialTokenDialog(onSubmit, onCancel) {
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('royal-trial-token-dialog', DIALOGUE_STYLES.containerSmall);

    const hasToken = (app.inventory.royalTrialToken || 0) > 0;

    if (!hasToken) {
        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">门卫</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                站住！前方是天斗帝国<strong style="color:#e74c3c;">高级圈养森林</strong>，闲人不得入内！
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="font-size:15px; line-height:1.8;">
                    进入需要出示<strong style="color:#f39c12;">皇家试炼令</strong>。<br>
                    你可以在<strong style="color:#e67e22;">商店</strong>购买。

                </div>
            </div>
            <button id="royal-trial-token-ok-btn" style="${DIALOGUE_STYLES.btnGreen}">知道了</button>
        `;
        document.getElementById('royal-trial-token-ok-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            if (onCancel) onCancel();
        });
    } else {
        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">门卫</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                站住！前方是天斗帝国<strong style="color:#e74c3c;">高级圈养森林</strong>，闲人不得入内！
            </div>
            <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
                <div style="font-size:15px; line-height:1.8;">
                    嗯？你身上有<strong style="color:#f39c12;">皇家试炼令</strong>？<br>
                    是否要提交试炼令，进入高级圈养森林？
                </div>
            </div>
            <div style="display:flex; gap:12px; justify-content:center; margin-top:16px;">
                <button id="royal-trial-token-submit-btn" style="
                    padding:12px 30px;
                    background:#2ecc71; color:white; border:none; border-radius:8px;
                    cursor:pointer; font-size:18px; font-weight:bold;
                ">✅ 提交试炼令</button>
                <button id="royal-trial-token-cancel-btn" style="
                    padding:12px 30px;
                    background:#e74c3c; color:white; border:none; border-radius:8px;
                    cursor:pointer; font-size:18px;
                ">❌ 放弃进入</button>
            </div>
        `;
        document.getElementById('royal-trial-token-submit-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            app.inventory.royalTrialToken = (app.inventory.royalTrialToken || 1) - 1;
            endStoryMusicTransition();
            if (onSubmit) onSubmit();
        });
        document.getElementById('royal-trial-token-cancel-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            if (onCancel) onCancel();
        });
    }
}

// ========== 七怪跑步第一次回城提示 ==========


export function showQiGuaiFirstReturnHint() {
    if (app.qiGuaiFirstReturnHintShown) return;
    app.qiGuaiFirstReturnHintShown = true;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('qigui-return-hint-container', DIALOGUE_STYLES.containerSmall);

    container.innerHTML = `
        <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
        <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
            唐三，七怪跑步的挑战并不轻松。你的伙伴们还没有附加魂环，战斗力有限。
        </div>
        <div style="font-size:16px; line-height:1.8; ${DIALOGUE_STYLES.infoBox}">
            <div style="margin-bottom:6px;">💡 建议：</div>
            <div style="font-size:15px; line-height:1.8;">
                你可以先前往<strong style="color:#2ecc71;">猎魂森林</strong>为伙伴附加魂环，获取魂技后再来挑战，会轻松很多！
            </div>
        </div>
        <div style="font-size:17px; line-height:1.7; margin-bottom:20px; color:#ffcc88;">
            当然，如果你觉得现在的队伍足够强大，直接挑战也可以。
        </div>
        <button id="qigui-return-hint-ok-btn" style="${DIALOGUE_STYLES.btnGreen}">知道了</button>
    `;
    document.getElementById('qigui-return-hint-ok-btn').addEventListener('click', () => {
        closeDialog(container);
        app.dialogActive = false;
        endStoryMusicTransition();
        setMoveTip("💡 点击右下角「队伍」按钮调整阵型和站位");
    });
}
