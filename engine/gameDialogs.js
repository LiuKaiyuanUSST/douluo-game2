// engine/gameDialogs.js - 所有对话框函数（武魂觉醒、系别说明、伙伴选择、报名费等）
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { createCharacter } from './utilsCore.js';
import { startStoryMusicTransition, endStoryMusicTransition } from './gameMusic.js';

// 以下函数通过 gameLogic.js 注册，避免循环依赖
export function registerStartDialogue(fn) { startDialogue = fn; }
export function registerGoToTown(fn) { goToTown = fn; }

let startDialogue = function() { console.warn('startDialogue not yet registered'); };
let goToTown = function() { console.warn('goToTown not yet registered'); };

// ========== 工具函数 ==========

function getWuhunFeature(wuhunName) {
    const wuhun = app.wuhunDatabase[wuhunName];
    if (!wuhun) return { feature: '未知', talentAttr: '未知' };
    return {
        feature: wuhun.feature || '未知',
        talentAttr: wuhun.talentAttr || '未知'
    };
}

function getRandomWuhunOptions(count, excludeList = []) {
    const baseExclude = ['蓝银草', ...excludeList];
    const allWuhunNames = Object.keys(app.wuhunDatabase).filter(name => {
        const wuhun = app.wuhunDatabase[name];
        return wuhun && wuhun.category === 'hero' && !baseExclude.includes(name);
    });
    const shuffled = [...allWuhunNames].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// ========== 大师武魂觉醒对话 ==========

export function showMasterWuhunChoice() {
    if (app.wuhunChosen) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = document.createElement('div');
    container.id = 'master-dialogue-container';
    container.style.cssText = `
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
    `;
    document.body.appendChild(container);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
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
            isRecommended: true
        };

        const randomNames = getRandomWuhunOptions(4);
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

        const allOptions = [blueSilverOption, ...randomOptions];

        let optionsHtml = '';
        allOptions.forEach((opt, index) => {
            const recText = opt.isRecommended ? ' <span style="color:#ff6b6b; font-size:14px;">（强烈建议新玩家选择）</span>' : '';
            optionsHtml += `
                <button class="wuhun-choice-btn" data-index="${index}" style="
                    display:block; margin:8px 0; padding:12px 15px; width:100%;
                    background:#2a3a4a; color:white; border:2px solid #4a6a7f; border-radius:8px;
                    cursor:pointer; font-size:16px; text-align:left;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style="font-weight:bold; font-size:18px;">${opt.name}${recText}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        主系：${opt.mainAffinity} | 副系：${opt.subAffinity} | 武魂特色：${opt.feature} | 天赋属性：${opt.talentAttr}
                    </div>
                </button>
            `;
        });

        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
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
            closeDialogue();
            return;
        }

        const newTs = createCharacter(wuhunName, '唐三', 1);
        if (!newTs) {
            console.error(`创建武魂 ${wuhunName} 失败`);
            closeDialogue();
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
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                很好！你的武魂是「${wuhunName}」。记住，武魂是魂师的根本，好好修炼，未来不可限量！
            </div>
            <button id="master-finish-btn" style="
                display:block; margin:15px auto; padding:12px 40px;
                background:#2ecc71; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:20px; font-weight:bold;
            ">继续冒险</button>
        `;
        document.getElementById('master-finish-btn').addEventListener('click', () => {
            closeDialogue();
            setMoveTip("💡 点击相邻格子移动，或使用方向键/WASD");
        });
    }

    function closeDialogue() {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        app.dialogActive = false;
        endStoryMusicTransition();
    }

    showPhase1();
}

// ========== 小舞武魂觉醒对话 ==========

export function showXiaoWuWuhunChoice() {
    if (app.xwWuhunChosen) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = document.createElement('div');
    container.id = 'xw-wuhun-dialogue-container';
    container.style.cssText = `
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
    `;
    document.body.appendChild(container);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                唐三，恭喜你觉醒了武魂！现在你有了新伙伴小舞，她也是一位很有潜力的魂师。
            </div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                小舞，你也需要觉醒自己的武魂。你希望你的武魂是什么？
            </div>
            <button id="xw-wuhun-next-btn" style="
                display:block; margin:15px auto; padding:12px 40px;
                background:#e67e22; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:20px; font-weight:bold;
            ">开始觉醒</button>
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
                <button class="xw-wuhun-choice-btn" data-index="${index}" style="
                    display:block; margin:8px 0; padding:12px 15px; width:100%;
                    background:#2a3a4a; color:white; border:2px solid #4a6a7f; border-radius:8px;
                    cursor:pointer; font-size:16px; text-align:left;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style="font-weight:bold; font-size:18px;">${opt.name}${recText}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        主系：${opt.mainAffinity} | 副系：${opt.subAffinity} | 武魂特色：${opt.feature} | 天赋属性：${opt.talentAttr}
                    </div>
                </button>
            `;
        });

        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
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
            closeDialogue();
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
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                很好！小舞的武魂是「${wuhunName}」。唐三，你有了新伙伴小舞，她的武魂是${wuhunName}。
            </div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                你可以点击右下角的「队伍」按钮调整阵型，把她编入出战队伍。
            </div>
            <button id="xw-wuhun-finish-btn" style="
                display:block; margin:15px auto; padding:12px 40px;
                background:#2ecc71; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:20px; font-weight:bold;
            ">继续冒险</button>
        `;
        document.getElementById('xw-wuhun-finish-btn').addEventListener('click', () => {
            closeDialogue();
            setMoveTip("💡 点击右下角「队伍」按钮调整阵型");
        });
    }

    function closeDialogue() {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        app.dialogActive = false;
        endStoryMusicTransition();
    }

    showPhase1();
}

// ========== 大师武魂克制说明 ==========

export function showAffinityGuideDialog() {
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = document.createElement('div');
    container.id = 'affinity-guide-container';
    container.style.cssText = `
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
    `;
    document.body.appendChild(container);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:12px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                唐三，在进入战斗之前，我要告诉你一个重要的知识——<strong style="color:#f39c12;">武魂系别克制</strong>。
            </div>
            <div style="font-size:16px; line-height:1.8; margin-bottom:16px; padding:14px; background:#1a2a1a; border-radius:8px; border:1px solid #4a6a4a;">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px; color:#ffcc88;">🔥 克制循环 🔥</div>
                <div style="text-align:center; font-size:15px; line-height:2;">
                    <span style="color:#e74c3c;">烈焰</span> → <span style="color:#27ae60;">苍木</span> → <span style="color:#8e44ad;">蛊毒</span> → <span style="color:#f39c12;">巨兽</span> → <span style="color:#3498db;">雷霆</span> → <span style="color:#1abc9c;">沧澜</span> → <span style="color:#e74c3c;">烈焰</span>
                </div>
                <div style="text-align:center; font-size:13px; color:#aaa; margin-top:6px;">（克制方对被克制方造成额外伤害）</div>
                <div style="text-align:center; font-size:14px; color:#e67e22; margin-top:8px; border-top:1px solid #3a5a3a; padding-top:8px;">
                    ⚖️ <strong>天工</strong> 为独立体系，不克制任何系别，也不被任何系别克制
                </div>
            </div>
            <button id="affinity-guide-next-btn" style="
                display:block; margin:10px auto 0 auto; padding:12px 40px;
                background:#e67e22; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:18px; font-weight:bold;
            ">继续</button>
        `;
        document.getElementById('affinity-guide-next-btn').addEventListener('click', showPhase2);
    }

    function showPhase2() {
        container.innerHTML = `
            <div style="margin-bottom:12px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                你即将面对的对手是<strong style="color:#f39c12;">巨兽系</strong>，建议你在<strong style="color:#e67e22;">角色界面</strong>将出战系别切换为<strong style="color:#8e44ad;">蛊毒系</strong>，即可克制对手。
            </div>
            <div style="font-size:15px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                💡 你也可以随时在右下角「帮助 → 武魂」中查看完整的系别克制关系。
            </div>
            <div style="font-size:17px; line-height:1.7; margin-bottom:20px; color:#ffcc88;">
                好了，接下来就看你的了！
            </div>
            <button id="affinity-guide-ok-btn" style="
                display:block; margin:0 auto; padding:12px 40px;
                background:#2ecc71; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:18px; font-weight:bold;
            ">明白了，出发！</button>
        `;
        document.getElementById('affinity-guide-ok-btn').addEventListener('click', () => {
            container.remove();
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

    const container = document.createElement('div');
    container.id = 'second-level-hint-container';
    container.style.cssText = `
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
    `;
    document.body.appendChild(container);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:12px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                唐三，你已经掌握了系别克制的基本知识。这一关的对手依然是<strong style="color:#f39c12;">巨兽系</strong>。
            </div>
            <div style="font-size:16px; line-height:1.8; margin-bottom:16px; padding:14px; background:#1a2a1a; border-radius:8px; border:1px solid #4a6a4a;">
                <div style="margin-bottom:6px;">💡 克制提醒：</div>
                <div style="font-size:15px; line-height:1.8;">
                    <span style="color:#8e44ad;">蛊毒</span> 克制 <span style="color:#f39c12;">巨兽</span> ✅ 推荐出战<br>
                    <span style="color:#3498db;">雷霆</span> 被 <span style="color:#f39c12;">巨兽</span> 克制 ❌ 避免使用
                </div>
            </div>
            <div style="font-size:16px; line-height:1.7; margin-bottom:12px;">
                请记得在<strong style="color:#e67e22;">角色界面</strong>检查每个角色的出战系别，不要让角色以被克制的系别出战。
            </div>
            <button id="second-level-next-btn" style="
                display:block; margin:10px auto 0 auto; padding:12px 40px;
                background:#e67e22; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:18px; font-weight:bold;
            ">继续</button>
        `;
        document.getElementById('second-level-next-btn').addEventListener('click', showPhase2);
    }

    function showPhase2() {
        container.innerHTML = `
            <div style="margin-bottom:12px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                另外，这一关的 Boss 戴沐白是<strong style="color:#f39c12;">巨兽系</strong>，实力不容小觑。合理利用系别克制，才能发挥出最大战力。
            </div>
            <div style="font-size:15px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                💡 你可以在右下角「帮助 → 武魂」中随时查看系别克制关系。
            </div>
            <div style="font-size:17px; line-height:1.7; margin-bottom:20px; color:#ffcc88;">
                好了，去吧！
            </div>
            <button id="second-level-ok-btn" style="
                display:block; margin:0 auto; padding:12px 40px;
                background:#2ecc71; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:18px; font-weight:bold;
            ">明白了，出发！</button>
        `;
        document.getElementById('second-level-ok-btn').addEventListener('click', () => {
            container.remove();
            app.dialogActive = false;
            endStoryMusicTransition();
            setMoveTip("进入 初识邪眸，移动到三角形标记 Boss 格");
        });
    }

    showPhase1();
}

// ========== 史莱克伙伴选择对话 ==========

export function showShrekPartnerChoice() {
    if (app.shrekPartnerChosen) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = document.createElement('div');
    container.id = 'shrek-partner-container';
    container.style.cssText = `
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
    `;
    document.body.appendChild(container);

    const partners = [
        {
            id: 'dmb',
            name: '戴沐白',
            wuhun: '邪眸白虎',
            desc: '邪眸白虎，正面强攻型魂师，力量惊人',
            color: '#f1c40f'
        },
        {
            id: 'zzq',
            name: '朱竹清',
            wuhun: '幽冥灵猫',
            desc: '敏攻刺杀型魂师，速度极快，擅长一击制敌',
            color: '#9b59b6'
        },
        {
            id: 'nrr',
            name: '宁荣荣',
            wuhun: '七宝琉璃塔',
            desc: '最强增幅辅助型魂师，七宝琉璃塔传人',
            color: '#e91e63'
        }
    ];

    function showPartnerSelection() {
        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                唐三，你认识了更多的伙伴。史莱克学院人才济济，请选择一位加入你的队伍：
            </div>
            ${partners.map((p, idx) => `
                <button class="partner-choice-btn" data-index="${idx}" style="
                    display:block; margin:8px 0; padding:12px 15px; width:100%;
                    background:#2a3a4a; color:white; border:2px solid ${p.color}; border-radius:8px;
                    cursor:pointer; font-size:16px; text-align:left;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style="font-weight:bold; font-size:18px; color:${p.color};">${p.name}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        武魂：${p.wuhun} | ${p.desc}
                    </div>
                </button>
            `).join('')}
        `;

        document.querySelectorAll('.partner-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const chosen = partners[index];
                showPartnerWuhunChoice(chosen);
            });
        });
    }

    function showPartnerWuhunChoice(chosen) {
        const defaultWuhun = chosen.wuhun;
        const defaultFeature = getWuhunFeature(defaultWuhun);
        const defaultOption = {
            name: defaultWuhun,
            mainAffinity: app.wuhunDatabase[defaultWuhun].mainAffinity,
            subAffinity: app.wuhunDatabase[defaultWuhun].subAffinity,
            feature: defaultFeature.feature,
            talentAttr: defaultFeature.talentAttr,
            isRecommended: true
        };

        const randomNames = getRandomWuhunOptions(4, [defaultWuhun]);
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

        const allOptions = [defaultOption, ...randomOptions];

        let optionsHtml = '';
        allOptions.forEach((opt, index) => {
            const recText = opt.isRecommended ? ' <span style="color:#ff6b6b; font-size:14px;">（推荐）</span>' : '';
            optionsHtml += `
                <button class="partner-wuhun-btn" data-index="${index}" style="
                    display:block; margin:8px 0; padding:12px 15px; width:100%;
                    background:#2a3a4a; color:white; border:2px solid #4a6a7f; border-radius:8px;
                    cursor:pointer; font-size:16px; text-align:left;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style="font-weight:bold; font-size:18px;">${opt.name}${recText}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        主系：${opt.mainAffinity} | 副系：${opt.subAffinity} | 武魂特色：${opt.feature} | 天赋属性：${opt.talentAttr}
                    </div>
                </button>
            `;
        });

        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px;">
                ${chosen.name}，请觉醒你的武魂：
            </div>
            ${optionsHtml}
        `;

        document.querySelectorAll('.partner-wuhun-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const chosenWuhun = allOptions[index].name;
                applyPartnerWuhun(chosen, chosenWuhun);
            });
        });
    }

    function applyPartnerWuhun(chosen, wuhunName) {
        const newChar = createCharacter(wuhunName, chosen.name, 1);
        if (!newChar) {
            console.error(`创建角色 ${chosen.name} 武魂 ${wuhunName} 失败`);
            closeDialog();
            return;
        }

        newChar.id = chosen.id;
        newChar.skills = [];
        newChar.color = chosen.color;
        app.party.push(newChar);

        for (let i = 0; i < app.activeTeam.length; i++) {
            if (!app.activeTeam[i]) {
                app.activeTeam[i] = newChar.id;
                break;
            }
        }

        app.shrekPartnerChosen = true;

        container.innerHTML = `
            <div style="margin-bottom:10px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                很好！${chosen.name}的武魂是「${wuhunName}」。
            </div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                唐三，你现在已经拥有了三位伙伴。请点击右下角的「队伍」按钮，根据每个角色的攻击距离和武魂特色合理安排站位。相信以你的智慧，一定能发挥出队伍的最大潜力！
            </div>
            <button id="partner-finish-btn" style="
                display:block; margin:15px auto; padding:12px 40px;
                background:#2ecc71; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:20px; font-weight:bold;
            ">继续冒险</button>
        `;
        document.getElementById('partner-finish-btn').addEventListener('click', () => {
            closeDialog();
            setMoveTip("💡 点击右下角「队伍」按钮调整阵型和站位");
        });
    }

    function closeDialog() {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        app.dialogActive = false;
        endStoryMusicTransition();
    }

    showPartnerSelection();
}

// ========== 赵无极报名费对话 ==========

export function showZwjRegistrationDialog() {
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = document.createElement('div');
    container.id = 'zwj-dialogue-container';
    container.style.cssText = `
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
    `;
    document.body.appendChild(container);

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
            closeDialog();
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
            closeDialog();
            setMoveTip("金魂币不足，无法进入史莱克学院，请先去赚取金魂币！");
        });
    }

    function closeDialog() {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        app.dialogActive = false;
        endStoryMusicTransition();
    }

    renderDialog();
}

// ========== 史莱克学院大师对话（猎魂森林引导） ==========

export function showShrekAcademyMasterDialog() {
    if (app.shrekAcademyFirstMove) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = document.createElement('div');
    container.id = 'shrek-academy-master-container';
    container.style.cssText = `
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
    `;
    document.body.appendChild(container);

    function showPhase1() {
        container.innerHTML = `
            <div style="margin-bottom:12px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                唐三，欢迎来到史莱克学院。既然你已经通过了入学考试，是时候告诉你关于<strong style="color:#f39c12;">魂环</strong>的事了。
            </div>
            <div style="font-size:16px; line-height:1.8; margin-bottom:16px; padding:14px; background:#1a2a1a; border-radius:8px; border:1px solid #4a6a4a;">
                <div style="margin-bottom:6px;">💡 魂师修炼之道：</div>
                <div style="font-size:15px; line-height:1.8;">
                    魂师需要通过猎杀魂兽来获取<strong style="color:#e74c3c;">魂环</strong>，<br>
                    吸收魂环后才能获得<strong style="color:#3498db;">魂技</strong>，提升实力。<br><br>
                    没有魂环就没有魂技，没有魂技就无法在战斗中发挥真正的力量！
                </div>
            </div>
            <button id="shrek-master-next-btn" style="
                display:block; margin:10px auto 0 auto; padding:12px 40px;
                background:#e67e22; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:18px; font-weight:bold;
            ">继续</button>
        `;
        document.getElementById('shrek-master-next-btn').addEventListener('click', showPhase2);
    }

    function showPhase2() {
        container.innerHTML = `
            <div style="margin-bottom:12px; color:#ffcc88; font-style:italic; font-size:18px;">大师</div>
            <div style="font-size:18px; line-height:1.7; margin-bottom:16px;">
                在史莱克学院附近有一处<strong style="color:#2ecc71;">猎魂森林</strong>，那里有各种魂兽出没。
            </div>
            <div style="font-size:16px; line-height:1.8; margin-bottom:16px; padding:14px; background:#1a2a1a; border-radius:8px; border:1px solid #4a6a4a;">
                <div style="font-size:15px; line-height:1.8;">
                    🗺️ 前往<strong style="color:#2ecc71;">猎魂森林</strong>猎杀魂兽，获取魂环，<br>
                    就能获得强大的<strong style="color:#3498db;">魂技</strong>！<br><br>
                    记住，只有不断获取魂环，才能不断提升实力！
                </div>
            </div>
            <button id="shrek-master-ok-btn" style="
                display:block; margin:0 auto; padding:12px 40px;
                background:#2ecc71; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:18px; font-weight:bold;
            ">前往猎魂森林</button>
        `;
        document.getElementById('shrek-master-ok-btn').addEventListener('click', () => {
            container.remove();
            app.dialogActive = false;
            app.shrekAcademyFirstMove = true;
            endStoryMusicTransition();
            setMoveTip("💡 前往猎魂森林猎取魂环，获取魂技！");
        });
    }

    showPhase1();
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
        container.remove();
        app.dialogActive = false;
        endStoryMusicTransition();
        goToTown(true);
    });
}
