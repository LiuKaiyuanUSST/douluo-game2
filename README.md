# 《斗罗大陆·七魂觉醒》 — 项目总括

## 项目简介

这是一个基于 HTML5 Canvas 的《斗罗大陆》同人回合制策略游戏，使用纯 JavaScript (ES Module) 开发，无任何第三方框架依赖。游戏以 NW.js 为运行环境（也可直接在浏览器中运行）。

**核心玩法**：玩家控制唐三在城镇中移动，进入迷宫探索，遭遇随机敌人或 Boss，进行回合制战斗。游戏包含武魂系统、技能系统、天赋系统、阵型系统、对话系统等。

## 快速开始

- **NW.js 运行**：使用 NW.js 打开项目目录
- **浏览器运行**：直接在浏览器中打开 `index.html`（需支持 ES Module）

## 文件结构总览

```
DouluoGame/
├── index.html              # 入口HTML页面
├── main.js                 # 主入口JS（游戏初始化、主循环）
├── package.json            # NW.js 配置文件
├── README.md               # 总括文档（本文件）
│
├── config/                 # 配置文件（JSON数据）
│   ├── characters.json     # 角色定义（玩家/敌人）
│   ├── stages.json         # 关卡定义
│   └── wuhun.json          # 武魂数据库
│
├── music/                  # 背景音乐文件
│   ├── city1.mp3           # 主城背景音乐
│   ├── fight1.mp3          # 战斗副本背景音乐
│   └── story1.mp3          # 剧情对话背景音乐
│
├── dialogues/              # 对话文本文件
│   ├── intro.txt           # 开场旁白
│   ├── chapter1_ws_xw.txt  # 第一章（王圣+小舞）
│   ├── chapter2_dmb.txt    # 第二章（戴沐白）
│   ├── chapter3_fld.txt    # 第三章（弗兰德）
│   ├── help_battle.txt     # 战斗帮助
│   ├── help_wuhun.txt      # 武魂帮助
│   ├── help_skill.txt      # 技能帮助
│   └── help_level.txt      # 等级帮助
│
└── engine/                 # 引擎核心代码
    ├── gameState.js        # 全局状态对象 app
    ├── utilsCore.js        # 核心工具函数
    ├── utils.js            # 工具函数聚合模块
    ├── gameLogic.js        # 游戏逻辑枢纽（跨模块依赖注册）
    ├── gameMusic.js        # 音频系统（背景音乐控制）
    ├── gameBattle.js       # 战斗相关逻辑（战斗辅助、Boss战）
    ├── gameBeastForest.js  # 魂兽森林战斗、结算、魂环吸收入口
    ├── gameTown.js         # 城镇相关逻辑（移动、商店、关卡选择）
    ├── gameDialogs.js      # 对话框函数聚合模块（重新导出子模块）
    ├── gameDialogs_utils.js   # 对话框工具函数、通用样式
    ├── gameDialogs_wuhun.js   # 武魂觉醒对话框（大师、小舞）
    ├── gameDialogs_guide.js   # 引导说明对话框（系别克制、关卡提示等）
    ├── gameDialogs_partner.js # 伙伴选择对话框（史莱克伙伴等）
    ├── gameDialogs_events.js  # 事件对话框（报名费、黑屏等）
    ├── dialogue.js         # 对话引擎
    ├── eventHandlers.js    # 鼠标/键盘事件处理
    ├── maze.js             # 迷宫生成与管理
    ├── battle.js           # 战斗系统主类
    ├── battleInit.js       # 战斗初始化（单位创建/阵型/回合排序）
    ├── battleAttack.js     # 攻击判定（命中/伤害/克制）
    ├── battleMark.js       # 状态标记系统（中毒/燃烧/缠绕等）
    ├── battleSkill.js      # 技能执行逻辑
    ├── battleUtils.js      # 战斗工具函数（属性计算/克制关系）
    ├── skills.js           # 技能池定义
    ├── talents.js          # 天赋系统
    ├── uiRenderer.js       # UI渲染聚合模块
    ├── uiBattle.js         # 战斗界面渲染
    ├── uiTown.js           # 城镇界面渲染
    ├── uiShop.js           # 商店界面渲染
    ├── uiMaze.js           # 迷宫界面渲染
    ├── uiPanels.js         # 面板UI（存档/背包/帮助）
    └── uiCharacterTeam.js  # 角色/队伍面板
```

## 详细文档索引

| 文档 | 内容 |
|------|------|
| [docs/README_ENTRY.md](./docs/README_ENTRY.md) | 入口文件详解（index.html、main.js、package.json） |
| [docs/README_CONFIG.md](./docs/README_CONFIG.md) | 配置文件详解（wuhun.json、characters.json、stages.json） |
| [docs/README_ENGINE.md](./docs/README_ENGINE.md) | 引擎核心模块详解（gameState、utilsCore、gameLogic、dialogue、maze、eventHandlers） |
| [docs/README_BATTLE.md](./docs/README_BATTLE.md) | 战斗系统详解（battle、battleInit、battleAttack、battleMark、battleSkill、battleUtils、talents、skills） |
| [docs/README_UI.md](./docs/README_UI.md) | UI渲染模块详解（uiRenderer、uiBattle、uiTown、uiShop、uiMaze、uiPanels、uiCharacterTeam） |
| [docs/README_DIALOGUES.md](./docs/README_DIALOGUES.md) | 对话系统详解（格式、文件列表、触发流程） |
| [docs/README_AUDIO.md](./docs/README_AUDIO.md) | 音频系统详解（音乐文件、控制函数、切换逻辑） |
| [docs/README_GUIDE.md](./docs/README_GUIDE.md) | 常见修改指南（武魂、技能、天赋、战斗等15项修改指南） |

## 核心数据流

```
游戏启动 → 加载配置 → 初始化画布 → 播放开场对话 → 进入主循环
                                                      ↓
                                          ┌─ 城镇状态 → 绘制城镇界面
                                          ├─ 商店状态 → 绘制商店界面
                                          ├─ 迷宫状态 → 绘制迷宫界面
                                          └─ 战斗状态 → 绘制战斗界面 → 回合制战斗
```

## 系别系统

共7种系别（Affinity），存在循环克制关系：

```
烈焰 → 苍木 → 蛊毒 → 巨兽 → 雷霆 → 沧澜 → 烈焰（循环克制）
```

## 技术栈

- **语言**：JavaScript (ES Module)
- **渲染**：HTML5 Canvas
- **运行环境**：NW.js / 浏览器
- **存储**：localStorage（3个存档位）
- **依赖**：无第三方框架

---

> **最后更新**：2026年5月
 