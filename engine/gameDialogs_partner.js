// engine/gameDialogs_partner.js - 伙伴选择对话框（史莱克伙伴、马红俊后新伙伴、七怪跑步伙伴）
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { createCharacter } from './utilsCore.js';
import { startStoryMusicTransition, endStoryMusicTransition } from './gameMusic.js';
import {
    getWuhunFeature, getRandomWuhunOptions,
    DIALOGUE_STYLES, createDialogContainer, closeDialog,
    startDialogue, goToTown
} from './gameDialogs_utils.js';

// ========== 史莱克伙伴选择对话 ==========

export function showShrekPartnerChoice() {
    if (app.shrekPartnerChosen) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('shrek-partner-container');

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
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                唐三，你认识了更多的伙伴。史莱克学院人才济济，请选择一位加入你的队伍：
            </div>
            ${partners.map((p, idx) => `
                <button class="partner-choice-btn" data-index="${idx}" style="${DIALOGUE_STYLES.btnOption}"
                    style="border-color:${p.color};" onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style=" font-size:18px; color:${p.color};">${p.name}</div>
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
                <button class="partner-wuhun-btn" data-index="${index}" style="${DIALOGUE_STYLES.btnOption}"
                    onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style=" font-size:18px;">${opt.name}${recText}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        主系：${opt.mainAffinity} | 副系：${opt.subAffinity} | 武魂特色：${opt.feature} | 天赋属性：${opt.talentAttr}
                    </div>
                </button>
            `;
        });

        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
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
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
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
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                很好！${chosen.name}的武魂是「${wuhunName}」。
            </div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                唐三，你现在已经拥有了三位伙伴。请点击右下角的「队伍」按钮，根据每个角色的攻击距离和武魂特色合理安排站位。相信以你的智慧，一定能发挥出队伍的最大潜力！
            </div>
            <button id="partner-finish-btn" style="${DIALOGUE_STYLES.btnGreen}">继续冒险</button>
        `;
        document.getElementById('partner-finish-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            setMoveTip("💡 点击右下角「队伍」按钮调整阵型和站位");
        });
    }

    showPartnerSelection();
}

// ========== 马红俊剧情后新伙伴选择对话 ==========

export function showMhjNewPartnerChoice() {
    if (app.mhjNewPartnerChosen) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('mhj-partner-container');

    // 史莱克七怪完整列表
    const allShrekSeven = [
        { id: 'dmb', name: '戴沐白', wuhun: '邪眸白虎', desc: '邪眸白虎，正面强攻型魂师，力量惊人', color: '#f1c40f' },
        { id: 'zzq', name: '朱竹清', wuhun: '幽冥灵猫', desc: '敏攻刺杀型魂师，速度极快，擅长一击制敌', color: '#9b59b6' },
        { id: 'nrr', name: '宁荣荣', wuhun: '七宝琉璃塔', desc: '最强增幅辅助型魂师，七宝琉璃塔传人', color: '#e91e63' },
        { id: 'oscar', name: '奥斯卡', wuhun: '香肠', desc: '食物系辅助魂师，香肠武魂，后勤保障', color: '#2ecc71' },
        { id: 'mhj', name: '马红俊', wuhun: '邪火凤凰', desc: '邪火凤凰，强攻系魂师，火焰威力惊人', color: '#e74c3c' }
    ];

    // 排除已有的3个角色（唐三、小舞 + 之前选的史莱克伙伴）
    const existingIds = app.party.map(m => m.id);
    const availablePartners = allShrekSeven.filter(p => !existingIds.includes(p.id));

    function showPartnerSelection() {
        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                唐三，听说你又认识了新的伙伴！史莱克七怪人才济济，请再选择一位加入你的队伍：
            </div>
            <div style="font-size:16px; line-height:1.7; ${DIALOGUE_STYLES.infoBox}">
                <div style="margin-bottom:6px;">⚠️ 出战提醒：</div>
                <div style="font-size:15px; line-height:1.8;">
                    虽然你拥有多位伙伴，但每次战斗<strong style="color:#f39c12;">最多只能有3人出战</strong>。<br><br>
                    请点击右下角的「<strong style="color:#e67e22;">队伍</strong>」按钮，根据敌人的系别和角色的生命状态，<br>
                    合理选择<strong style="color:#2ecc71;">3位</strong>状态最佳的伙伴出战！
                </div>
            </div>
            ${availablePartners.map((p, idx) => `
                <button class="mhj-partner-choice-btn" data-index="${idx}" style="${DIALOGUE_STYLES.btnOption}"
                    style="border-color:${p.color};" onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style=" font-size:18px; color:${p.color};">${p.name}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        武魂：${p.wuhun} | ${p.desc}
                    </div>
                </button>
            `).join('')}
        `;

        document.querySelectorAll('.mhj-partner-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const chosen = availablePartners[index];
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
                <button class="mhj-partner-wuhun-btn" data-index="${index}" style="${DIALOGUE_STYLES.btnOption}"
                    onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style=" font-size:18px;">${opt.name}${recText}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        主系：${opt.mainAffinity} | 副系：${opt.subAffinity} | 武魂特色：${opt.feature} | 天赋属性：${opt.talentAttr}
                    </div>
                </button>
            `;
        });

        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px;">
                ${chosen.name}，请觉醒你的武魂：
            </div>
            ${optionsHtml}
        `;

        document.querySelectorAll('.mhj-partner-wuhun-btn').forEach(btn => {
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
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
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

        app.mhjNewPartnerChosen = true;

        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                很好！${chosen.name}的武魂是「${wuhunName}」。
            </div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                唐三，你现在已经拥有了四位伙伴。请点击右下角的「队伍」按钮，从所有伙伴中<strong style="color:#f39c12;">选择3位状态最佳的出战</strong>。<br><br>
                注意阵亡的角色无法出战，需要到商店购买九品紫芝复活。
            </div>
            <button id="mhj-partner-finish-btn" style="${DIALOGUE_STYLES.btnGreen}">继续冒险</button>
        `;
        document.getElementById('mhj-partner-finish-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            setMoveTip("💡 点击右下角「队伍」按钮调整阵型和站位");
        });
    }

    showPartnerSelection();
}

// ========== 七怪跑步伙伴选择 ==========

export function showQiGuaiPartnerChoice() {
    if (app.qiGuaiPartnerChosen) return;
    startStoryMusicTransition();
    app.dialogActive = true;

    const container = createDialogContainer('qigui-partner-container');

    // 史莱克七怪完整列表
    const allShrekSeven = [
        { id: 'dmb', name: '戴沐白', wuhun: '邪眸白虎', desc: '邪眸白虎，正面强攻型魂师，力量惊人', color: '#f1c40f' },
        { id: 'zzq', name: '朱竹清', wuhun: '幽冥灵猫', desc: '敏攻刺杀型魂师，速度极快，擅长一击制敌', color: '#9b59b6' },
        { id: 'nrr', name: '宁荣荣', wuhun: '七宝琉璃塔', desc: '最强增幅辅助型魂师，七宝琉璃塔传人', color: '#e91e63' },
        { id: 'oscar', name: '奥斯卡', wuhun: '香肠', desc: '食物系辅助魂师，香肠武魂，后勤保障', color: '#2ecc71' },
        { id: 'mhj', name: '马红俊', wuhun: '邪火凤凰', desc: '邪火凤凰，强攻系魂师，火焰威力惊人', color: '#e74c3c' }
    ];

    // 排除已有的角色
    const existingIds = app.party.map(m => m.id);
    const availablePartners = allShrekSeven.filter(p => !existingIds.includes(p.id));

    function showPartnerSelection() {
        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                一路前行需要更多的伙伴，请选择一名伙伴加入队伍。
            </div>
            ${availablePartners.map((p, idx) => `
                <button class="qigui-partner-choice-btn" data-index="${idx}" style="${DIALOGUE_STYLES.btnOption}"
                    style="border-color:${p.color};" onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style=" font-size:18px; color:${p.color};">${p.name}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        武魂：${p.wuhun} | ${p.desc}
                    </div>
                </button>
            `).join('')}
        `;

        document.querySelectorAll('.qigui-partner-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const chosen = availablePartners[index];
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
                <button class="qigui-partner-wuhun-btn" data-index="${index}" style="${DIALOGUE_STYLES.btnOption}"
                    onmouseover="this.style.background='#3a5a6f'" onmouseout="this.style.background='#2a3a4a'">
                    <div style=" font-size:18px;">${opt.name}${recText}</div>
                    <div style="font-size:13px; color:#aaa; margin-top:4px;">
                        主系：${opt.mainAffinity} | 副系：${opt.subAffinity} | 武魂特色：${opt.feature} | 天赋属性：${opt.talentAttr}
                    </div>
                </button>
            `;
        });

        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px;">
                ${chosen.name}，请觉醒你的武魂：
            </div>
            ${optionsHtml}
        `;

        document.querySelectorAll('.qigui-partner-wuhun-btn').forEach(btn => {
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
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
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

        app.qiGuaiPartnerChosen = true;

        container.innerHTML = `
            <div style="margin-bottom:10px; ${DIALOGUE_STYLES.speaker}">大师</div>
            <div style="font-size:20px; line-height:1.6; margin-bottom:20px;">
                很好！${chosen.name}的武魂是「${wuhunName}」。
            </div>
            <div style="font-size:18px; line-height:1.6; margin-bottom:20px; color:#aaa;">
                唐三，你现在已经拥有了更多的伙伴。请点击右下角的「队伍」按钮，从所有伙伴中<strong style="color:#f39c12;">选择3位状态最佳的出战</strong>。<br><br>
                注意阵亡的角色无法出战，需要到商店购买九品紫芝复活。
            </div>
            <button id="qigui-partner-finish-btn" style="${DIALOGUE_STYLES.btnGreen}">进入迷宫</button>
        `;
        document.getElementById('qigui-partner-finish-btn').addEventListener('click', () => {
            closeDialog(container);
            app.dialogActive = false;
            endStoryMusicTransition();
            // 伙伴选择完成后，进入七怪跑步迷宫
            setMoveTip("💡 进入七怪跑步迷宫，移动到三角形标记终点");
        });
    }

    showPartnerSelection();
}
 