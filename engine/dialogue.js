// engine/dialogue.js
import { app } from './gameState.js';
import { setMoveTip } from './utils.js';
import { createCharacter } from './utilsCore.js';

export class DialogueEngine {
    constructor() {
        this.eventMap = {};
        this.lines = [];
        this.currentLineIdx = 0;
        this.currentEvent = null;
        this.onComplete = null;
        this.container = null;
        this.isActive = false;
    }

    async loadFile(fileName) {
        const response = await fetch(`./dialogues/${fileName}`);
        if (!response.ok) throw new Error(`Cannot load dialogue: ${fileName}`);
        const text = await response.text();
        this.parse(text);
    }

    parse(text) {
        const rawLines = text.split('\n');
        this.lines = [];
        this.eventMap = {};
        let currentEvent = null;
        let startIdx = 0;

        for (let line of rawLines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#') || trimmed === '') continue;

            this.lines.push(trimmed);
            const idx = this.lines.length - 1;

            const eventMatch = trimmed.match(/^\[event\s+name="(.+)"\]/);
            if (eventMatch) {
                if (currentEvent) {
                    this.eventMap[currentEvent] = { start: startIdx, end: idx - 1 };
                }
                currentEvent = eventMatch[1];
                startIdx = idx;
            }
        }
        if (currentEvent) {
            this.eventMap[currentEvent] = { start: startIdx, end: this.lines.length - 1 };
        }
    }

    async startEvent(eventName, fileName, onComplete) {
        if (!this.eventMap[eventName]) {
            try {
                await this.loadFile(fileName);
            } catch (e) {
                console.error('Failed to load dialogue file:', e);
                if (onComplete) onComplete();
                return;
            }
        }
        if (!this.eventMap[eventName]) {
            console.error(`Event ${eventName} not found after loading`);
            if (onComplete) onComplete();
            return;
        }
        this.currentEvent = eventName;
        this.onComplete = onComplete;
        this.currentLineIdx = this.eventMap[eventName].start;
        this.isActive = true;
        app.dialogActive = true;

        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'dialogue-container';
            this.container.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                max-height: 70vh;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                font-family: 'Segoe UI', sans-serif;
                padding: 30px 40px;
                box-sizing: border-box;
                z-index: 2000;
                border-radius: 12px;
                border: 2px solid #555;
                overflow-y: auto;
            `;
            document.body.appendChild(this.container);
            this.container.addEventListener('click', () => {
                if (this.isActive) this.advance();
            });
        }
        this.container.style.display = 'block';
        this.renderCurrentLine();
    }

    renderCurrentLine() {
        if (!this.container || !this.isActive) return;
        const line = this.lines[this.currentLineIdx];
        if (!line || line === '') {
            this.endEvent();
            return;
        }

        // 检查是否超出当前事件范围（防止内容泄漏到下一个事件）
        const eventIndices = this.eventMap[this.currentEvent];
        if (this.currentLineIdx > eventIndices.end) {
            this.endEvent();
            return;
        }

        if (line.startsWith('[speaker')) {
            const match = line.match(/\[speaker\s+name="(\w+)"\](.*)/);
            if (match) {
                const speakerName = match[1];
                const text = match[2];
                const displayName = this.getDisplayName(speakerName);
                this.container.innerHTML = `
                    <div style="margin-bottom:10px; color:#aaa; font-style:italic;">${displayName}</div>
                    <div style="font-size:20px; line-height:1.5;">${text}</div>
                    <div style="text-align:right; margin-top:10px; color:#888; font-size:14px;">点击继续…</div>
                `;
            }
        } else if (line.startsWith('[options')) {
            const options = [];
            for (let i = this.currentLineIdx + 1; i < this.lines.length; i++) {
                const ln = this.lines[i];
                if (ln.startsWith('[after')) break;
                const optMatch = ln.match(/^\[([a-z])\](.*)/);
                if (optMatch) {
                    options.push({ key: optMatch[1], text: optMatch[2].trim() });
                }
            }
            let buttonsHtml = options.map(opt =>
                `<button class="dialogue-option" data-key="${opt.key}" style="display:block; margin:10px 0; padding:10px; width:100%; background:#4a6a7f; color:white; border:none; cursor:pointer; font-size:18px;">${opt.text}</button>`
            ).join('');
            this.container.innerHTML = `
                <div style="margin-bottom:15px; color:#ffcc88; font-size:20px;">请选择：</div>
                ${buttonsHtml}
            `;
            document.querySelectorAll('.dialogue-option').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const key = e.target.dataset.key;
                    this.handleOption(key);
                });
            });
        } else if (line.startsWith('[goto next]')) {
            this.currentLineIdx++;
            this.renderCurrentLine();
        } else if (line.startsWith('[give')) {
            this.processGive(line);
            this.currentLineIdx++;
            this.renderCurrentLine();
        } else if (line.startsWith('[after')) {
            this.currentLineIdx++;
            this.renderCurrentLine();
        } else {
            this.currentLineIdx++;
            this.renderCurrentLine();
        }
    }

    handleOption(key) {
        for (let i = this.currentLineIdx + 1; i < this.lines.length; i++) {
            const ln = this.lines[i];
            if (ln.startsWith(`[after ${key}]`)) {
                this.currentLineIdx = i + 1;
                this.renderCurrentLine();
                return;
            }
        }
        this.endEvent();
    }

    processGive(line) {
        const giveMatch = line.match(/\[give\s+name="(\w+)"\s+type="(\w+)"(?:\s+amount="(\d+)")?\]/);
        if (!giveMatch) return;
        const nameParam = giveMatch[1];
        const type = giveMatch[2];
        const amount = giveMatch[3] ? parseInt(giveMatch[3]) : null;

        switch (type) {
            case 'companion': {
                let wuhunName = null;
                let charName = null;
                if (nameParam === 'xw') {
                    wuhunName = '柔骨兔';
                    charName = '小舞';
                } else if (nameParam === 'dmb') {
                    wuhunName = '邪眸白虎';
                    charName = '戴沐白';
                } else {
                    wuhunName = nameParam;
                    charName = nameParam;
                }

                // 小舞特殊处理：先不直接加入，等武魂选择后再加入
                if (nameParam === 'xw') {
                    app.pendingXiaoWuChoice = true;
                    setMoveTip(`小舞加入了队伍！`);
                } else {
                    const existing = app.party.find(m => m.name === charName);
                    if (existing) {
                        setMoveTip(`${charName} 已经在队伍中`);
                    } else {
                        const newChar = createCharacter(wuhunName, charName, 1);
                        if (newChar) {
                            newChar.skills = [];
                            app.party.push(newChar);
                            for (let i = 0; i < app.activeTeam.length; i++) {
                                if (!app.activeTeam[i]) {
                                    app.activeTeam[i] = newChar.id;
                                    break;
                                }
                            }
                            setMoveTip(`${charName}·${wuhunName} 加入了队伍！`);
                        }
                    }
                }
                break;
            }
            case 'gold':
                app.player.gold = (app.player.gold || 0) + amount;
                setMoveTip(`获得了 ${amount} 金魂币`);
                break;
            case 'exp_str':
                if (app.player && app.player.exp) {
                    app.player.exp['巨兽'] = (app.player.exp['巨兽'] || 0) + amount;
                }
                setMoveTip(`力量经验 +${amount}`);
                break;
            case 'exp_spd':
                if (app.player && app.player.exp) {
                    app.player.exp['雷霆'] = (app.player.exp['雷霆'] || 0) + amount;
                }
                setMoveTip(`速度经验 +${amount}`);
                break;
        }
    }

    getDisplayName(roleId) {
        const map = {
            narrator: '【旁白】',
            ts: '唐三',
            ws: '王圣',
            xw: '小舞',
            dmb: '戴沐白',
            fld: '弗兰德',
            zwj: '赵无极',
            nrr: '宁荣荣',
            zzq: '朱竹清',
            mhj: '马红俊',
            ask: '奥斯卡',
            girl: '女孩',
            master: '大师',
            guard: '门卫'
        };
        return map[roleId] || roleId;
    }


    advance() {
        if (!this.isActive) return;
        const line = this.lines[this.currentLineIdx];
        if (line && !line.startsWith('[options') && !line.startsWith('[speaker')) {
            this.currentLineIdx++;
        } else if (line && line.startsWith('[speaker')) {
            this.currentLineIdx++;
        }
        const eventIndices = this.eventMap[this.currentEvent];
        if (this.currentLineIdx > eventIndices.end) {
            this.endEvent();
            return;
        }
        this.renderCurrentLine();
    }

    endEvent() {
        this.isActive = false;
        app.dialogActive = false;
        if (this.container) this.container.style.display = 'none';
        if (this.onComplete) {
            const cb = this.onComplete;
            this.onComplete = null;
            cb();
        }
    }
}
