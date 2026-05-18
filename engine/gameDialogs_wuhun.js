// engine/gameDialogs_wuhun.js - 武魂觉醒对话框（大师武魂觉醒、小舞武魂觉醒）
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { createCharacter } from './utilsCore.js';
import { startStoryMusicTransition, endStoryMusicTransition } from './gameMusic.js';
import {
    getWuhunFeature, getRandomWuhunOptions,
    DIALOGUE_STYLES, createDialogContainer, closeDialog,
    startDialogue, goToTown
} from './gameDialogs_utils.js';

// ========== 大师武魂觉醒对话 ==========

export function showMasterWuhunChoice() {
    if (app.wuhunChosen) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('master-dialogue-container');

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                唐三你好，我是大师，我愿意做你的老师，你愿意成为我的弟子吗？
            </div>
            <button id="master-accept-btn" style="
                display:block; margin:15px auto; padding:12px 40px;
                background:#e67e22; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:20px; font-weight:bold;
            ">我愿意</button>
        `;
        document.getElementById('master-accept-btn').addEventListener('click', () => {
            showPhase2();
        });
    }

    function showPhase2() {
        const blueSilverFeature = getWuhunFeature('蓝银草');
        const blueSilverOption = {
            name: '蓝银草',
            mainAffinity: '苍木',
            subAffinity: '蛊毒',
            feature: blueSilverFeature.feature,
            talentAttr: blueSilverFeature.talentAttr,
            isRecommended: true,
            recText: '新手推荐'
        };

        const haotianFeature = getWuhunFeature('昊天锤');
        const haotianOption = {
            name: '昊天锤',
            mainAffinity: '天工',
            subAffinity: '巨兽',
            feature: haotianFeature.feature,
            talentAttr: haotianFeature.talentAttr,
            isRecommended: true,
            recText: '新手强烈推荐'
        };

        const randomNames = getRandomWuhunOptions(3, ['昊天锤']);
        const randomOptions = randomNames.map(name => {
            const wuhun = app.wuhunDatabase[name];
            return {
                name: name,
                mainAffinity: wuhun.mainAffinity,
                subAffinity: wuhun.subAffinity,
                feature: wuhun.feature || '未知',
                talentAttr: wuhun.talentAttr || '未知',
                isRecommended: false,
                recText: ''
            };
        });

        const allOptions = [haotianOption, blueSilverOption, ...randomOptions];

        let optionsHtml = '';
        allOptions.forEach((opt, index) => {
            const recText = opt.isRecommended ? ` <span style="color:#ff6b6b; font-size:14px;">（${opt.recText}）</span>` : '';
            optionsHtml += `
                <button class="wuhun-choice-btn" data-index="${index}" style="${DIALOGUE_STYLES.btnOption}"
                    onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style="font-weight:bold; font-size:18px;">${opt.name}${recText}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        主系：${opt.mainAffinity} | 副系：${opt.subAffinity} | 武魂特色：${opt.feature} | 天赋属性：${opt.talentAttr}
                    </div>
                </button>
            `;
        });

        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px;">
                在斗罗大陆，每个人都有自己的武魂。请你先觉醒自己的武魂，我还有更多的武魂知识需要教你。
            </div>
            <div style="margin-bottom:10px; color:#ffcc88; font-size:16px;">请选择你的武魂：</div>
            ${optionsHtml}
        `;

        document.querySelectorAll('.wuhun-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const chosenWuhun = allOptions[index].name;
                applyWuhunChoice(chosenWuhun);
            });
        });
    }

    function applyWuhunChoice(wuhunName) {
        const ts = app.party.find(m => m.id === 'ts');
        if (!ts) {
            console.error('唐三角色不存在');
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            return;
        }

        const newTs = createCharacter(wuhunName, '唐三', 1);
        if (!newTs) {
            console.error(`创建武魂 ${wuhunName} 失败`);
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            return;
        }

        newTs.id = 'ts';
        newTs.gold = ts.gold || 50;
        newTs.skills = [];

        const tsIndex = app.party.findIndex(m => m.id === 'ts');
        if (tsIndex !== -1) {
            app.party[tsIndex] = newTs;
        }

        app.player = { ...newTs, gold: newTs.gold, id: newTs.id };
        app.wuhunChosen = true;

        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                很好！你的武魂是「${wuhunName}」。记住，武魂是魂师的根本，好好修炼，未来不可限量！
            </div>
            <button id="master-finish-btn" style="${DIALOGUE_STYLES.btnGreen}">继续冒险</button>
        `;
        document.getElementById('master-finish-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            setMoveTip("💡 点击相邻格子移动，或使用方向键/WASD");
        });
    }

    showPhase1();
}

// ========== 小舞武魂觉醒对话 ==========

export function showXiaoWuWuhunChoice() {
    if (app.xwWuhunChosen) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('xw-wuhun-dialogue-container');

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                唐三，恭喜你觉醒了武魂！现在你有了新伙伴小舞，她也是一位很有潜力的魂师。
            </div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                小舞，你也需要觉醒自己的武魂。你希望你的武魂是什么？
            </div>
            <button id="xw-wuhun-next-btn" style="${DIALOGUE_STYLES.btnOrange}">开始觉醒</button>
        `;
        document.getElementById('xw-wuhun-next-btn').addEventListener('click', () => {
            showPhase2();
        });
    }

    function showPhase2() {
        const rouguFeature = getWuhunFeature('柔骨兔');
        const rouguOption = {
            name: '柔骨兔',
            mainAffinity: '雷霆',
            subAffinity: '巨兽',
            feature: rouguFeature.feature,
            talentAttr: rouguFeature.talentAttr,
            isRecommended: true
        };

        const randomNames = getRandomWuhunOptions(4, ['柔骨兔']);
        const randomOptions = randomNames.map(name => {
            const wuhun = app.wuhunDatabase[name];
            return {
                name: name,
                mainAffinity: wuhun.mainAffinity,
                subAffinity: wuhun.subAffinity,
                feature: wuhun.feature || '未知',
                talentAttr: wuhun.talentAttr || '未知',
                isRecommended: false
            };
        });

        const allOptions = [rouguOption, ...randomOptions];

        let optionsHtml = '';
        allOptions.forEach((opt, index) => {
            const recText = opt.isRecommended ? ' <span style="color:#ff6b6b; font-size:14px;">（强烈建议新玩家选择）</span>' : '';
            optionsHtml += `
                <button class="xw-wuhun-choice-btn" data-index="${index}" style="${DIALOGUE_STYLES.btnOption}"
                    onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style="font-weight:bold; font-size:18px;">${opt.name}${recText}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        主系：${opt.mainAffinity} | 副系：${opt.subAffinity} | 武魂特色：${opt.feature} | 天赋属性：${opt.talentAttr}
                    </div>
                </button>
            `;
        });

        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px;">
                小舞，请选择你的武魂：
            </div>
            ${optionsHtml}
        `;

        document.querySelectorAll('.xw-wuhun-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const chosenWuhun = allOptions[index].name;
                applyXiaoWuWuhunChoice(chosenWuhun);
            });
        });
    }

    function applyXiaoWuWuhunChoice(wuhunName) {
        const newXw = createCharacter(wuhunName, '小舞', 1);
        if (!newXw) {
            console.error(`创建武魂 ${wuhunName} 失败`);
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            return;
        }

        newXw.skills = [];
        app.party.push(newXw);

        for (let i = 0; i < app.activeTeam.length; i++) {
            if (!app.activeTeam[i]) {
                app.activeTeam[i] = newXw.id;
                break;
            }
        }

        app.xwWuhunChosen = true;
        app.pendingXiaoWuChoice = false;

        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                很好！小舞的武魂是「${wuhunName}」。唐三，你有了新伙伴小舞，她的武魂是${wuhunName}。
            </div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                你可以点击右下角的「队伍」按钮调整阵型，把她编入出战队伍。
            </div>
            <button id="xw-wuhun-finish-btn" style="${DIALOGUE_STYLES.btnGreen}">继续冒险</button>
        `;
        document.getElementById('xw-wuhun-finish-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            setMoveTip("💡 点击右下角「队伍」按钮调整阵型");
        });
    }

    showPhase1();
}
 