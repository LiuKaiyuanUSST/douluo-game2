# 《斗罗大陆·七魂觉醒》 — 游戏代码详细说明

## 目录

1. [项目概述](#1-项目概述)
2. [文件结构总览](#2-文件结构总览)
3. [入口文件详解](#3-入口文件详解)
4. [配置文件详解](#4-配置文件详解)
5. [引擎核心模块详解](#5-引擎核心模块详解)
6. [UI渲染模块详解](#6-ui渲染模块详解)
7. [对话系统详解](#7-对话系统详解)
8. [音频系统详解](#8-音频系统详解)
9. [数据流与调用关系](#9-数据流与调用关系)
10. [常见修改指南](#10-常见修改指南)


---

## 1. 项目概述

这是一个基于 HTML5 Canvas 的《斗罗大陆》同人回合制策略游戏，使用纯 JavaScript (ES Module) 开发，无任何第三方框架依赖。游戏以 NW.js 为运行环境（也可直接在浏览器中运行）。

**核心玩法**：玩家控制唐三在城镇中移动，进入迷宫探索，遭遇随机敌人或 Boss，进行回合制战斗。游戏包含武魂系统、技能系统、天赋系统、阵型系统、对话系统等。

---

## 2. 文件结构总览

```
DouluoGame/
├── index.html              # 入口HTML页面
├── main.js                 # 主入口JS（游戏初始化、主循环）
├── package.json            # NW.js 配置文件
├── README.md               # 本文件
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
    ├── gameDialogs.js      # 对话框函数（武魂觉醒、伙伴选择等）
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

---

## 3. 入口文件详解

### 3.1 `index.html`

游戏的主页面。包含：
- 标题"斗罗大陆：七魂觉醒"
- 开始游戏按钮、战斗测试按钮
- 新游戏/读取进度菜单
- Canvas 画布 (800×600)
- 信息面板
- 通过 `<script type="module" src="main.js">` 加载主程序
- 存档检测：检查3个存档位（`douluo_save_slot_1` ~ `douluo_save_slot_3`）中任意一个有存档即可启用"读取进度"按钮

**关键元素**：
- `#gameCanvas` — 游戏主画布
- `#game-message-bar` — 底部消息栏（由 JS 动态创建）

### 3.2 `main.js`

游戏的主入口脚本，负责：

**函数**：
- `createInitialParty()` — 创建初始队伍（唐三·蓝银草）
- `window.initGame()` — 初始化新游戏
- `window.startFromSave(slot)` — 从指定存档位恢复游戏（slot=1~3）
- `gameLoop()` — 主游戏循环（requestAnimationFrame）

**存档选择**：
- 主界面"读取进度"按钮点击后弹出存档选择对话框，显示3个存档位的信息（角色名+等级+位置）
- 玩家选择存档位后调用 `startFromSave(slot)` 加载对应存档

**调用关系**：
```
main.js
├── gameState.js → initApp() 初始化画布
├── utils.js → createMessageBar(), createButtonRow(), readConfigs()
├── gameLogic.js → initTownMap(), startDialogue(), onBattleWin(), onBattleLoss()
├── uiRenderer.js → drawTown(), drawShop(), drawMaze(), drawBattle()
├── eventHandlers.js → attachMouseHandler(), attachKeyboardHandler()
├── battle.js → BattleSystem
├── battleUtils.js → calcDerivedStats()
└── skills.js → randomSkillFromAffinity(), SKILL_POOL, getSkillById()
```

**主循环 gameLoop()**：
1. 清空画布
2. 如果对话激活，显示黑屏并跳过渲染
3. 如果处于战斗状态且当前行动者是敌人，自动执行 enemyAI()
4. 根据 `app.state` 调用对应的绘制函数
5. 使用 requestAnimationFrame 循环

### 3.3 `package.json`

NW.js 配置文件，设置窗口标题、尺寸，以及 `--allow-file-access-from-files` 参数以允许本地文件访问。

---

## 4. 配置文件详解

### 4.1 `config/wuhun.json` — 武魂数据库

这是游戏最核心的配置文件，定义了所有武魂的属性。

**每个武魂的字段**：
| 字段 | 说明 | 示例 |
|------|------|------|
| `name` | 显示名称 | "蓝银草" |
| `category` | 武魂分类：`"hero"`=主角可选，`"npc"`=NPC专用 | "hero" |
| `mainAffinity` | 主系别 | "苍木" |
| `subAffinity` | 副系别 | "蛊毒" |
| `baseForce` | 基础力量 (0-7) | 2 |
| `baseSpeed` | 基础速度 (0-7) | 2 |
| `baseIntelligence` | 基础智力 (0-8) | 5 |
| `talentName` | 天赋名称（可选） | "蓝银草" |
| `availableSkillIds` | 可用技能ID列表 | ["缠绕","复生","蔓延"] |
| `feature` | 武魂特色描述 | "坚韧控制者" |
| `talentAttr` | 天赋属性 | "控制" |

**系别（Affinity）**：共7种——烈焰、苍木、蛊毒、巨兽、雷霆、沧澜、天工

**克制关系**（定义在 `battleUtils.js`）：
```
烈焰 → 苍木 → 蛊毒 → 巨兽 → 雷霆 → 沧澜 → 烈焰（循环克制）
```

**关于 category 字段**：
- `"hero"`：主角可选武魂，玩家在觉醒时只能从这些武魂中随机选择
- `"npc"`：NPC专用武魂（如豹子、大角羊、破草锄），仅用于敌人/NPC，不会出现在玩家的武魂选择列表中

**修改武魂**：直接编辑此 JSON 文件，添加/修改武魂对象即可。新增武魂时请务必设置正确的 `category` 字段。

### 4.2 `config/characters.json` — 角色数据库

定义游戏中出现的角色（玩家和敌人）。

**玩家角色**：
- `ts` — 唐三（蓝银草）
- `xw` — 小舞（柔骨兔）
- `dmb` — 戴沐白（白虎）

**敌人角色**：
- `student` — 诺丁学院学员
- `beast` — 索托城外魂兽
- `boss_ws` — 王圣（Boss）
- `xw_boss` — 小舞（Boss）
- `boss_dmb_weak` — 戴沐白（弱）
- `boss_dmb` — 戴沐白（认真）

**每个角色字段**：`id`, `name`, `wuhun`（武魂名）, `level`, `color`

### 4.3 `config/stages.json` — 关卡配置

定义游戏关卡。

**字段**：
| 字段 | 说明 |
|------|------|
| `id` | 关卡编号 |
| `name` | 关卡名称 |
| `size` | 迷宫大小 (N×N) |
| `bg` | 背景色 |
| `bosses[]` | Boss列表 |
| `bosses[].enemyId` | Boss角色ID |
| `bosses[].dialogAfter` | 胜利后触发的对话事件名 |
| `bosses[].lose` | 是否允许失败（true=剧情杀） |
| `bosses[].finalReward` | 最终奖励（"chapter_end"） |
| `bosses[].oneTurnTrigger` | 是否一回合后自动结束 |

---

## 5. 引擎核心模块详解

### 5.1 `engine/gameState.js` — 全局状态

定义并导出全局对象 `app`，包含游戏运行时的所有状态。

**关键属性**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `canvas` | HTMLCanvasElement | 画布元素 |
| `ctx` | CanvasRenderingContext2D | 画布上下文 |
| `state` | string | 当前状态：MENU/TOWN/SHOP/MAZE/BATTLE |
| `party` | Array | 所有角色数组 |
| `activeTeam` | [string,string,string] | 出战队伍（角色ID数组，最多3人） |
| `player` | Object | 主角快捷引用 |
| `inventory` | Object | 背包物品 |
| `currentTown` | string | 当前城镇名 |
| `townMaps` | Object | 城镇地图数据 |
| `maze` | MazeManager | 当前迷宫实例 |
| `battle` | BattleSystem | 当前战斗实例 |
| `wuhunDatabase` | Object | 武魂数据库（从JSON加载） |
| `characterDatabase` | Object | 角色数据库（从JSON加载） |
| `dialogActive` | boolean | 是否正在对话 |
| `battleTargeting` | boolean | 是否正在选择攻击目标 |
| `battleSkillMode` | boolean | 是否正在选择技能目标 |
| `selectedSkill` | string | 当前选中的技能ID |
| `wuhunChosen` | boolean | 唐三是否已选择武魂 |
| `xwWuhunChosen` | boolean | 小舞是否已选择武魂 |
| `shrekPartnerChosen` | boolean | 史莱克伙伴是否已选择 |
| `shrekFirstMoveDone` | boolean | 史莱克学院第一次移动是否已完成 |
| `fldRegistrationDone` | boolean | 弗兰德报名费是否已缴纳 |
| `firstLevelEntered` | boolean | 是否第一次进入关卡 |
| `secondLevelEntered` | boolean | 是否第一次进入第二关 |
| `pendingXiaoWuChoice` | boolean | 小舞武魂选择是否待触发 |
| `showAffinityHint` | boolean | 是否显示系别克制提示 |
| `lastMoveWasAffinityHint` | boolean | 上次移动是否触发了系别提示 |
| `firstTownReturnWithDead` | boolean | 是否第一次带着阵亡角色回城 |
| `showResurrectionHint` | boolean | 是否显示复活提示 |
| `battleSpeed` | string | 战斗速度：fast/medium/slow |
| `showBattleLog` | boolean | 是否显示战斗日志 |
| `battleLog` | Array | 战斗日志历史 |
| `currentBossPhase` | number | 当前Boss阶段 |
| `playerFormation` | number | 玩家阵型索引 |

**函数**：
- `initApp()` — 初始化画布引用

### 5.2 `engine/utilsCore.js` — 核心工具函数

**函数**：
| 函数 | 说明 | 被谁调用 |
|------|------|----------|
| `createMessageBar()` | 创建底部消息栏DOM | main.js, utils.js |
| `setMoveTip(text)` | 设置消息栏文本（金魂币<30时自动显示金币不足提示，优先级最高） | 几乎所有模块 |
| `findCharacterDef(charId)` | 从数据库查找角色定义 | gameLogic.js |
| `readConfigs()` | 加载所有JSON配置文件 | main.js |
| `createCharacter(wuhunName, charName, level)` | 根据武魂创建角色对象 | main.js, gameLogic.js, dialogue.js |
| `saveGame(slot)` | 保存游戏到 localStorage（slot=1~3） | uiPanels.js |
| `loadGame(slot)` | 从 localStorage 读取指定存档位（slot=1~3） | main.js, uiPanels.js |
| `getSaveSlotInfo(slot)` | 获取存档位信息（是否存在、角色名+等级+位置） | uiPanels.js, main.js |

**createCharacter 创建的角色对象结构**：
```javascript
{
  id: string,          // 唯一标识
  name: string,        // 角色名
  wuhun: string,       // 武魂名
  level: number,       // 等级
  skills: string[],    // 技能ID数组
  exp: {               // 各系别经验
    '烈焰': number, '苍木': number, '蛊毒': number,
    '巨兽': number, '雷霆': number, '沧澜': number, '天工': number
  },
  color: string,       // 颜色
  hp: number,          // 当前生命
  maxHp: number,       // 最大生命
  alive: boolean,      // 是否存活
  gold: number         // 金魂币
}
```

### 5.3 史莱克学院与圈养森林

**地图结构**：
- 史莱克学院（`shrek_academy`）是一个5×5的城镇地图，位于通关赵无极后的下一关入口
- 地图布局：左上（4）上一关、右上（2）战斗塔、左下（1）商店、右下（3）下一关、第3行第2列（5）圈养森林
- 走到圈养森林方块（type 5）即可进入圈养森林迷宫

**圈养森林迷宫**：
- 5×5的迷宫，固定布局为：
  ```
  20101
  00000
  10001
  00000
  10101
  ```
  - `2` = 起点（玩家出生位置）
  - `1` = 魂兽Boss位置（共7个）
  - `0` = 普通格子
- 7只百年魂兽随机分配到7个Boss位置，每次进入都不一样：
  - 百年苍木·鬼藤（寄生藤蔓，绞杀无声）
  - 百年雷霆·幽冥狼（群猎幽影，疾风迅雷）
  - 百年沧澜·海蝰蛇（浅海小蛇，游速极快）
  - 百年烈焰·火蜥蜴（百年火蜥，吐焰灼身）
  - 百年蛊毒·曼陀罗蛇（剧毒蛇牙，一击麻痹）
  - 百年巨兽·蛮牛（百年蛮牛，冲撞裂石）
  - 百年天工·板斧（阔刃板斧，劈木开山）
- 迷宫墙壁生成方式与普通迷宫类似（一堵墙一堵墙地加），但连通性检测不同：
  - 必须保证从起点到每个Boss格都能到达
  - 路径不能经过其他Boss格（即每个Boss区域独立）
  - 加墙失败3次即停止
- 走到Boss相邻格子时，该Boss格自动显示（问号变为魂兽名称和三角标记）
- 走到Boss格触发战斗，随机选取主系（70%概率）或副系（30%概率）出战

**大师对话引导**：
- 进入史莱克学院后，第一次移动会触发大师对话
- 大师讲解魂环→魂技→提升实力的关系，并引导玩家前往圈养森林
- 对话使用剧情音乐过渡（`startStoryMusicTransition` / `endStoryMusicTransition`）

**战斗塔魂技检查**：
- 在史莱克学院进入战斗塔时，系统会检查所有角色是否拥有魂技（skills）
- 如果没有任何角色拥有魂技，会提示"你的角色还没有任何魂技！请前往圈养森林猎取魂环获取魂技！"
- 阻止玩家进入战斗塔，强制引导前往圈养森林

**文本统一**：
- 游戏中所有涉及"技能"的显示文本已统一改为"魂技"
- 包括：战斗日志（"使用未知魂技"）、帮助文件（魂技帮助、战斗帮助、等级帮助、武魂帮助）、对话文本等

### 5.4 `engine/gameBeastForest.js` — 魂兽森林战斗、结算、魂环吸收入口

通用模块，可用于猎魂森林、落日森林、星斗大森林等场景。

**函数**：
| 函数 | 说明 |
|------|------|
| `startBeastForestBossFight(bossInfo)` | 进入魂兽森林Boss战斗，随机选取主系（70%概率）或副系（30%概率）出战 |
| `handleBeastForestBattleWin()` | 战斗胜利处理：筛选存活角色、显示结算对话框、触发魂环吸收流程 |

**战斗胜利结算流程**：
1. 判断玩家的角色等级和参与战斗的仍然存活角色
2. 筛选出已有技能数小于主角等级的角色（1级最多1个技能，2级最多2个技能，依此类推）
3. 显示大师结算语："大师：您战胜了XX魂兽。您的等级为x级，您的角色最多可以拥有x个魂技。"
4. 显示可选角色列表供玩家选择附加魂环
5. 如果没有可用角色，显示"您没有待升级角色"，仅显示确认按钮
6. 玩家选择角色后，调用 `startSoulRingMaze()` 进入魂环迷宫

### 5.5 `engine/gameSoulRing.js` — 魂环吸收迷宫

**函数**：
| 函数 | 说明 |
|------|------|
| `startSoulRingMaze(character, bossInfo, chosenAffinity)` | 开始魂环吸收迷宫 |
| `tryMoveSoulRingMaze(dx, dy)` | 魂环迷宫内移动 |

**魂环吸收流程**：
1. 生成5×5迷宫，要求从迷宫任何一个位置都可以达到正中心（标注为"魂核"）
2. 迷宫生成算法：每次随机加一堵墙，检查是否所有地方可以到达正中心，三次添加失败则停止
3. 进入迷宫后立即弹出大师提示语
4. 在迷宫中心外随机位置生成一个随机颜色的实心圆球
5. 玩家需要引导圆球到中心魂核
6. 每收集一个圆球，进度增加（如1/3、2/3）
7. 全部收集完成后，从6个技能中随机选择一个作为魂技
8. 在角色界面添加魂环信息行
9. 返回圈养森林地图，删除已击败的魂兽

### 5.6 `engine/gameLogic.js` — 游戏逻辑枢纽

`gameLogic.js` 是游戏逻辑的枢纽模块，负责从各子模块导入函数并重新导出，同时处理跨模块的依赖注册（避免循环依赖）。

**原始 gameLogic.js 已被拆分为以下子模块**：
- `gameMusic.js` — 音频系统（背景音乐控制）
- `gameBattle.js` — 战斗相关逻辑（战斗辅助、Boss战、战斗流程）
- `gameBeastForest.js` — 魂兽森林战斗、结算、魂环吸收入口
- `gameTown.js` — 城镇相关逻辑（移动、商店、关卡选择）
- `gameDialogs.js` — 对话框函数（武魂觉醒、系别说明、伙伴选择、报名费等）

**gameLogic.js 导出的函数**：

| 函数 | 实际定义位置 | 说明 |
|------|-------------|------|
| `initDialogue()` | gameBattle.js | 初始化对话引擎 |
| `startDialogue(eventName, fileName, onComplete)` | gameBattle.js | 启动对话 |
| `initTownMap()` | gameTown.js | 初始化城镇地图 |
| `goToTown(resetPos)` | gameTown.js | 返回城镇 |
| `tryMoveTown(dx, dy)` | gameTown.js | 城镇内移动 |
| `openShop()` | gameTown.js | 打开商店 |
| `openLevelSelect()` | gameTown.js | 打开关卡选择 |
| `startLevel(levelIdx)` | gameTown.js | 进入迷宫关卡 |
| `tryMoveMaze(dx, dy)` | gameTown.js | 迷宫内移动 |
| `startHuntingForest()` | gameTown.js | 进入圈养森林 |
| `startBossFight(bossDef)` | gameBattle.js | 开始Boss战 |
| `performAttack(targetIndex)` | gameBattle.js | 执行玩家攻击 |
| `skipPlayerTurn()` | gameBattle.js | 跳过玩家回合 |
| `onBattleWin(isBoss)` | gameBattle.js | 战斗胜利处理 |
| `onBattleLoss()` | gameBattle.js | 战斗失败处理 |
| `handleShopPurchase(item)` | gameBattle.js | 处理商店购买 |
| `useBackpackItem(itemType)` | gameBattle.js | 使用背包物品 |
| `playCityMusic()` | gameMusic.js | 播放主城背景音乐 |
| `buildEnemyFromMonster()` | gameBattle.js | 从角色数据库构建敌人 |
| `buildUnitsFromParty()` | gameBattle.js | 从所有存活队友构建战斗单位 |

**依赖注册机制**：
由于 `gameDialogs.js` 中的对话框函数（如 `showMasterWuhunChoice()`）需要调用 `startDialogue()` 和 `goToTown()`，但直接导入会导致循环依赖，因此使用注册模式：

```
gameLogic.js → registerStartDialogue(startDialogue) → gameDialogs.js 通过注册的函数调用
gameLogic.js → registerGoToTown(goToTown) → gameDialogs.js 通过注册的函数调用
gameLogic.js → registerShowMasterWuhunChoice(fn) → gameTown.js 通过注册的函数调用
...
```

### 5.7 `engine/dialogue.js` — 对话引擎

**类**：`DialogueEngine`

对话文件格式（以 `dialogues/chapter1_ws_xw.txt` 为例）：
```
[event name="after_boss_ws"]        ← 事件定义
[speaker name="ws"]文本内容          ← 说话
[options num="2"]                   ← 选项
[a]选项文本
[b]选项文本
[after a]                           ← 选项分支
[goto next]                         ← 跳转到下一行
[give name="xw" type="companion"]   ← 给予奖励
```

**支持的指令**：
| 指令 | 说明 |
|------|------|
| `[event name="xxx"]` | 定义事件入口 |
| `[speaker name="xxx"]文本` | 说话 |
| `[options num="N"]` | 选项列表 |
| `[a/b/c]文本` | 选项内容 |
| `[after a/b/c]` | 选项分支 |
| `[goto next]` | 跳转下一行 |
| `[give name="x" type="companion"]` | 给予同伴 |
| `[give name="gold" amount="N"]` | 给予金魂币 |
| `[give name="exp_str" amount="N"]` | 给予力量经验 |
| `[give name="exp_spd" amount="N"]` | 给予速度经验 |

**方法**：
| 方法 | 说明 |
|------|------|
| `loadFile(fileName)` | 加载对话文件 |
| `parse(text)` | 解析对话文本 |
| `startEvent(eventName, fileName, onComplete)` | 启动事件 |
| `renderCurrentLine()` | 渲染当前行 |
| `handleOption(key)` | 处理选项 |
| `processGive(line)` | 处理奖励指令 |
| `advance()` | 推进到下一行 |
| `endEvent()` | 结束事件 |

### 5.8 `engine/eventHandlers.js` — 事件处理

**函数**：
| 函数 | 说明 |
|------|------|
| `attachMouseHandler()` | 绑定鼠标点击事件 |
| `attachKeyboardHandler()` | 绑定键盘事件 |

**鼠标事件处理**：
- 商店状态：点击商品购买，点击返回按钮回城
- 战斗状态：点击速度按钮、日志按钮、技能说明按钮、攻击/技能按钮、目标选择、跳过按钮
- 城镇状态：点击相邻格子移动
- 迷宫状态：点击相邻格子移动

**键盘事件处理**：
- `Q` — 打开/关闭背包
- `空格` — 对话推进
- `方向键/WASD` — 城镇/迷宫移动
- `F` — 战斗快速攻击随机目标

### 5.9 `engine/maze.js` — 迷宫系统

**类**：`MazeManager`

**属性**：
- `size` — 迷宫大小
- `px`, `py` — 玩家当前位置
- `explored[][]` — 已探索标记
- `wallRight[][]` — 右侧墙壁
- `wallDown[][]` — 下方墙壁
- `isHuntingForest` — 是否为魂兽森林模式（猎魂森林/圈养森林等）
- `bossPositions[]` — 魂兽森林的Boss位置数组
- `bossDefeated[]` — 每个Boss是否已被击败
- `startPosition` — 魂兽森林起点位置
- `bossCells` — 所有Boss格坐标的Set集合

**方法**：
| 方法 | 说明 |
|------|------|
| `constructor(size)` | 创建迷宫并生成墙壁 |
| `setupHuntingForest()` | 设置魂兽森林模式（固定布局、随机分配魂兽、重新生成墙壁） |
| `generateWalls()` | 随机生成墙壁（保证连通性；魂兽森林模式使用专用检测） |
| `canReachAll()` | 普通连通性检测（Q算法） |
| `canReachAllBosses()` | 魂兽森林连通性检测（从起点到每个Boss，不经过其他Boss格） |
| `canReachBossWithoutOtherBosses(tx, ty)` | BFS检测从起点到目标Boss是否可达且不经过其他Boss |
| `getPassableNeighbors(x, y)` | 获取四个方向中可通过的邻居 |
| `canMove(dx, dy)` | 检查是否能移动 |
| `move(dx, dy)` | 执行移动（魂兽森林模式下自动调用revealAdjacentBosses） |
| `revealAdjacentBosses()` | 走到Boss相邻格时自动显示该Boss（问号变名称） |
| `isBossCell()` | 检查是否在Boss格（普通迷宫为右下角，魂兽森林为任意Boss格） |
| `getCurrentBossInfo()` | 获取当前格子的Boss信息 |
| `markBossDefeated(x, y)` | 标记Boss已被击败 |
| `areAllBossesDefeated()` | 检查是否所有Boss都被击败 |

**迷宫生成算法**：随机尝试在格子间添加墙壁，每次添加后检查连通性，如果不连通则撤销。连续失败3次则停止。魂兽森林模式下使用 `canReachAllBosses()` 检测，确保从起点到每个Boss格都能到达且路径不经过其他Boss格。

### 5.10 `engine/battle.js` — 战斗系统主类

**类**：`BattleSystem`

**构造函数**：`new BattleSystem(playerUnits, enemyUnits, options)`
- `options.playerFormation` — 玩家阵型
- `options.enemyFormation` — 敌方阵型
- `options.oneTurnTrigger` — 一回合触发（剧情战斗）

**核心方法**：
| 方法 | 说明 |
|------|------|
| `getCurrentActor()` | 获取当前行动者 |
| `advanceTurn()` | 推进到下一回合 |
| `playerAttack(attackerIndex, targetIndex)` | 玩家攻击 |
| `enemyAI()` | 敌方AI行动 |
| `executeSkill(actor, skillId, target)` | 执行技能 |
| `skipPlayerTurn()` | 跳过玩家回合 |
| `getValidTargets(attacker)` | 获取有效攻击目标 |
| `getTargetsForSkill(actor, skillId)` | 获取技能目标 |
| `getAvailableSkills(actor)` | 获取可用技能列表 |
| `addMark(unit, type, duration, extra)` | 添加状态标记 |
| `removeMark(unit, markType)` | 移除状态标记 |
| `hasMark(unit, markType)` | 检查是否有标记 |

**敌方AI逻辑**（`enemyAI()`）：
1. 被缠绕则跳过
2. 检查 `_useShieldFirst` 标记（戴沐白第一回合放肉盾）
3. 力系（力量≥智力）：70%攻击，30%其他
4. 智系（智力>力量）：30%攻击，70%其他
5. 攻击时选择SP消耗最高的技能，目标选择血量最低的
6. 如果无法行动则跳过

### 5.11 `engine/battleInit.js` — 战斗初始化

**函数**：
| 函数 | 说明 |
|------|------|
| `initUnit(character, side, maxLevel)` | 创建战斗单位 |
| `assignFormation(team, formation)` | 分配阵型位置 |
| `buildTurnOrder(playerTeam, enemyTeam)` | 构建行动顺序（按速度排序） |
| `getEffectiveRange(unit, turnCount)` | 获取有效攻击距离 |
| `checkAndAdvanceLines(battle)` | 检查并推进阵线 |

**阵型**：`front-back-front`, `back-front-back`, `front-front-front`
- `front` = 前排（gridCol=1）
- `back` = 后排（gridCol=0）
- 前排单位攻击距离更近

**战斗单位属性**（由 `initUnit` 创建）：
```javascript
{
  name, wuhun, level, force, speed, intel,
  hp, maxHp, alive, spirit, maxSpirit,
  side, gridRow, gridCol,
  affinityUsed, mainAffinity, subAffinity,
  color, skillIds, attackRange,
  damageMin, damageMax, defenseType,
  spiritRecovery, powerBonus, speedBonus, intelligenceBonus,
  immuneControl, talent, talentData, marks, permanentBuffs,
  permanentRangeBonus
}
```

### 5.12 `engine/battleAttack.js` — 攻击判定

**函数**：
| 函数 | 说明 |
|------|------|
| `getPos(unit)` | 获取单位位置（0-3） |
| `inRange(battle, attacker, defender)` | 判断是否在攻击范围内 |
| `resolveAttack(attacker, defender, battle)` | 执行攻击判定 |

**攻击流程**：
1. 闪避判定：基于灵巧值（速度+智力）差值
2. 基础伤害：damageMin ~ damageMax 随机
3. 防御减伤：根据防御档位减免
4. 克制增伤：如果攻击系别克制防御系别，50%概率+1伤害
5. 天工减免：天工系5%概率完全免伤
6. 天赋效果：攻击方 onAttack / 防御方 onAttacked
7. 昊天锤连击：25%概率额外攻击一次

### 5.13 `engine/battleMark.js` — 状态标记系统

**函数**：
| 函数 | 说明 |
|------|------|
| `addMark(unit, type, duration, extra, battle)` | 添加标记 |
| `removeMark(unit, markType)` | 移除标记 |
| `hasMark(unit, markType)` | 检查标记 |
| `applyStartTurnEffects(unit, battle)` | 回合开始效果 |
| `applyEndTurnEffects(unit, battle)` | 回合结束效果 |

**标记类型**：
| 标记 | 效果 | 持续时间 |
|------|------|----------|
| `bind` | 缠绕（无法行动） | 1回合 |
| `lock` | 柔骨锁（无法使用魂技） | 2回合 |
| `poison` | 中毒（50%掉1HP） | 2次触发后移除 |
| `burn` | 燃烧（50%掉1HP） | 2次触发后移除 |
| `reborn` | 复生（回合结束50%回复1HP） | 本场 |
| `beast_king` | 兽王（免疫控制） | 本场 |
| `shield` | 肉盾（防御+1档） | 本场 |
| `power_up` | 巨力（力量+2） | 本场 |
| `speed_up` | 极速（速度+2） | 本场 |
| `smoke` | 烟雾（智力-2） | 本场 |

### 5.14 `engine/battleSkill.js` — 技能执行

**函数**：
- `executeSkill(actor, skillId, target, battle)` — 执行技能

**技能类型**（定义在 `skills.js` 的 `SKILL_POOL` 中）：

| 系别 | 技能 | 消耗 | 类型 | 效果 |
|------|------|------|------|------|
| 苍木 | 缠绕 | 2 | bind | 普攻+100%缠绕 |
| 苍木 | 复生 | 3 | reborn | 50%回复1HP+附加复生标记 |
| 苍木 | 蔓延 | 3 | spread | 概率永久+2攻击距离 |
| 雷霆 | 雷神变 | 2 | thunder_emp | 普攻+50%额外命中1目标 |
| 雷霆 | 雷霆万钧 | 3 | thunder_mass | 普攻+50%溅射2目标 |
| 雷霆 | 柔骨锁 | 2 | lock | 普攻+100%锁链 |
| 巨兽 | 兽王 | 2 | beast_king | 免疫控制 |
| 巨兽 | 肉盾 | 1 | shield | 防御+1档 |
| 巨兽 | 蛮力 | 1 | brute | 普攻+1伤害 |
| 蛊毒 | 中毒 | 2 | poison | 普攻+100%中毒 |
| 蛊毒 | 扩散 | 3 | spread_poison | 普攻+随机3名中毒 |
| 蛊毒 | 驱毒 | 2 | cure_poison | 驱散中毒 |
| 天工 | 治疗 | 2 | heal | 回复1HP |
| 天工 | 一曰力 | 3 | power_up | 50%力量+2 |
| 天工 | 二曰速 | 3 | speed_up | 50%速度+2 |
| 沧澜 | 痊愈 | 3 | heal_all | 50%全体回复1HP |
| 沧澜 | 怒涛 | 2 | speed_up_self | 普攻+自身速度+2 |
| 沧澜 | 净化 | 3 | cleanse | 清除所有负面状态 |
| 烈焰 | 爆裂 | 2 | burn_mass | 普攻+50%概率全体燃烧 |
| 烈焰 | 灼烧 | 1 | burn | 普攻+100%燃烧 |
| 烈焰 | 浓烟弥漫 | 2 | smoke | 普攻+100%概率烟雾2名敌人 |

**被动技能**（`PASSIVE_SKILLS`）：
- 增力：战斗开始时力量+1
- 增速：战斗开始时速度+1
- 增智：战斗开始时智力+1

**概率计算**（`getActualProb`）：
- 出战系 = 主系：主系技能100%，副系50%，其他系50%
- 出战系 = 副系：主系技能50%，副系80%，其他系50%

### 5.15 `engine/battleUtils.js` — 战斗工具函数

**函数**：
| 函数 | 说明 |
|------|------|
| `calcDerivedStats(baseForce, baseSpeed, baseIntel, levelDiff)` | 计算衍生属性 |
| `recalcDerivedStats(unit)` | 重新计算单位衍生属性 |

**属性计算规则**：
- `maxHp = force + 3`
- `attackStat = force * 1.5 + speed * 0.5`
- `defenseStat = intel * 1.5 + force * 0.5`
- `attackRange`：速度≥7→3，速度≥4→2，否则1
- `spiritRecovery`：智力≥7→3，智力≥4→2，否则1
- `damageMin/Max`：根据攻击力分段
- `defenseType`：根据防御力分段（0-3档）

### 5.16 `engine/talents.js` — 天赋系统

**天赋映射**（`TALENT_MAP`）：武魂名 → 天赋对象

| 武魂 | 天赋 | 效果 |
|------|------|------|
| 蓝电霸王龙 | 雷电掌控 | 雷霆系魂技消耗-1 |
| 柔骨兔 | 柔骨迅击 | 首回合攻击距离+2 |
| 幽冥灵猫 | 幽冥疾步 | 攻击距离+1 |
| 海神 | 海神亲和 | 沧澜系魂技消耗-1 |
| 邪火凤凰 | 邪火余烬 | 攻击附加燃烧 |

| 蓝银草 | 蓝银领域 | 首回合缠绕/复生额外目标 |

| 奇茸通天菊 | 奇茸巨力 | 战斗开始力量+2 |
| 九心海棠 | 九心芬芳 | 前三回合治疗额外目标 |
| 治愈权杖 | 治愈祈愿 | 前三回合治疗50%额外+1HP |
| 碧磷蛇皇 | 碧磷毒尊 | 蛊毒系魂技消耗-1 |
| 鬼王 | 鬼影潜行 | 攻击距离+1 |
| 邪眸白虎 | 霸体 | 免疫控制 |
| 骨龙 | 骨毒反噬 | 受攻击时反击中毒 |
| 七杀剑 | 七杀锋芒 | 攻击50%额外+1伤害 |
| 昊天锤 | 乱披风 | 攻击25%连击 |
| 七宝琉璃塔 | 七宝增幅 | 天工系技能成功率翻倍 |
| 香肠 | 香肠滋补 | 前三回合治疗额外目标+回SP |

**函数**：
- `applyTalent(unit)` — 应用天赋到战斗单位

---

## 6. UI渲染模块详解

### 6.1 `engine/uiRenderer.js` — 渲染聚合

简单的导出聚合模块，导出四个绘制函数。

### 6.2 `engine/uiBattle.js` — 战斗界面

**函数**：`drawBattle()`

绘制内容：
1. 左侧面板：我方队伍信息（名称、等级、系别、SP、HP、属性、状态标记、血条）
2. 右侧面板：敌方队伍信息（同上）
3. 中间圆环区域：战斗单位位置（根据阵型排列）
4. 波浪线：分隔敌我
5. 当前行动者高亮（黄色圆圈）
6. 底部操作栏：普攻按钮、技能按钮、技能说明按钮、跳过按钮
7. 目标选择模式：绿色圆圈标记可选目标
8. 速度控制面板：快/中/慢
9. 日志按钮

### 6.3 `engine/uiTown.js` — 城镇界面

**函数**：`drawTown()`

绘制5×5网格地图，不同颜色表示不同功能格：
- 绿色（1）：商店
- 橙色（2）：战斗塔
- 紫色（3/4）：出口（下一关/上一关）
- 绿色（5）：圈养森林（史莱克学院地图特有）
- 蓝色圆点：玩家位置

### 6.4 `engine/uiShop.js` — 商店界面

**函数**：`drawShop()`

绘制商店界面，包含商品列表（九品紫芝、力量之石、速度之石、智力之石）和返回按钮。

### 6.5 `engine/uiMaze.js` — 迷宫界面

**函数**：`drawMaze()`

绘制迷宫网格，显示墙壁、已探索区域、Boss标记（红色三角形）、玩家位置。

**魂兽森林模式特殊渲染**：
- 左上角显示"🌲 圈养森林"标题（根据具体森林名称动态显示）、角色生命值、金魂币
- 右上角显示剩余魂兽数量（如"魂兽剩余: 5/7"）
- 每个Boss格根据状态显示不同内容：
  - 未探索：紫色三角标记 + 问号
  - 已探索但未击败：对应系别颜色的三角标记 + 大号魂兽名称
  - 已击败：灰色勾号 + "已击败"文字
- 走到Boss相邻格时，该Boss格自动变为已探索状态（问号变为名称）

### 6.6 `engine/uiPanels.js` — 面板UI

**函数**：
| 函数 | 说明 |
|------|------|
| `createButtonRow()` | 创建底部按钮行 |
| `createSaveButton(buttonRow)` | 创建存档按钮 |
| `createReturnToTownButton(buttonRow)` | 创建回城按钮 |
| `createBackpackButton(buttonRow)` | 创建背包按钮 |
| `createCharacterButton(buttonRow)` | 创建角色按钮 |
| `createTeamButton(buttonRow)` | 创建队伍按钮 |
| `createHelpButton(buttonRow)` | 创建帮助按钮 |
| `toggleBackpack(show)` | 切换背包面板 |
| `toggleHelpPanel(show)` | 切换帮助面板 |

### 6.7 `engine/uiCharacterTeam.js` — 角色/队伍面板

**函数**：
| 函数 | 说明 |
|------|------|
| `toggleCharacterPanel(show)` | 切换角色面板 |
| `toggleTeamPanel(show)` | 切换队伍面板 |
| `toggleCharacterAffinity(memberId)` | 切换角色出战系别 |

**角色面板**：显示所有角色的属性、技能、出战系别，可切换主/副系别。

**队伍面板**：可调整阵型（前-后-前/后-前-前/前-前-前），编排出战角色。

---

## 7. 对话系统详解

### 7.1 对话文件格式

对话文件存放在 `dialogues/` 目录下，使用自定义标记语言。

**完整语法**：
```
# 注释行（以#开头）
[event name="事件名"]          ← 定义事件入口
[speaker name="角色ID"]文本    ← 角色说话
[options num="N"]             ← 选项列表开始
[a]选项A文本                   ← 选项A
[b]选项B文本                   ← 选项B
[after a]                     ← 选择A后的分支
[goto next]                   ← 跳转到下一行
[give name="x" type="y" amount="z"]  ← 给予奖励
```

### 7.2 对话文件列表

| 文件 | 内容 |
|------|------|
| `intro.txt` | 开场旁白（唐三穿越） |
| `chapter1_ws_xw.txt` | 第一章：七舍争雄（王圣+小舞） |
| `chapter2_dmb.txt` | 第二章：初识邪眸（戴沐白） |
| `chapter3_fld.txt` | 第三章：弗兰德报名费 |
| `help_battle.txt` | 战斗帮助 |
| `help_wuhun.txt` | 武魂帮助 |
| `help_skill.txt` | 技能帮助 |
| `help_level.txt` | 等级帮助 |

### 7.3 对话触发流程

```
main.js → startDialogue('intro', 'intro.txt', callback)
  → DialogueEngine.startEvent()
    → loadFile() → parse() → renderCurrentLine()
      → 用户点击 → advance() → renderCurrentLine()
        → 遇到 [give] → processGive()
        → 遇到 [options] → 显示选项按钮
        → 用户选择 → handleOption() → 跳转到对应分支
        → 事件结束 → endEvent() → 执行回调
```

---

## 8. 音频系统详解

### 8.1 背景音乐文件

游戏使用 MP3 格式的音频文件，存放在 `music/` 目录下：

| 文件 | 用途 | 播放时机 |
|------|------|----------|
| `city1.mp3` | 主城背景音乐 | 进入主城时播放（新游戏开场对话结束后、读档、返回主城、切换主城） |
| `fight1.mp3` | 战斗副本背景音乐 | 进入迷宫关卡或 Boss 战时播放 |
| `story1.mp3` | 剧情对话背景音乐 | 播放剧情对话时播放（开场故事、打完 Boss 后的对话、章节结束对话等） |

### 8.2 音频控制函数

所有音频控制函数定义在 `engine/gameMusic.js` 中：

| 函数 | 说明 |
|------|------|
| `playCityMusic()` | 播放主城背景音乐（循环播放，音量 0.25） |
| `stopCityMusic()` | 停止主城背景音乐 |
| `playFightMusic()` | 播放战斗副本背景音乐（循环播放，音量 0.25） |
| `stopFightMusic()` | 停止战斗副本背景音乐 |
| `playStoryMusic()` | 播放剧情对话背景音乐（循环播放，音量 0.5） |
| `stopStoryMusic()` | 停止剧情对话背景音乐 |
| `stopAllMusic()` | 停止所有背景音乐（city/fight/story），重置 `currentMusicType` 为 null |
| `startStoryMusicTransition()` | 开始剧情对话前的音乐处理：保存当前音乐类型，停止当前音乐，播放剧情音乐 |
| `endStoryMusicTransition(onComplete)` | 结束剧情对话后的音乐处理：停止剧情音乐，恢复之前的背景音乐 |

### 8.3 音频状态标记

定义在 `engine/gameState.js` 的 `app` 对象中：

| 属性 | 类型 | 说明 |
|------|------|------|
| `cityMusic` | Audio | 主城背景音乐 Audio 对象 |
| `fightMusic` | Audio | 战斗副本背景音乐 Audio 对象 |
| `storyMusic` | Audio | 剧情对话背景音乐 Audio 对象 |
| `currentMusicType` | string | 当前播放的音乐类型：`'city'` \| `'fight'` \| `'story'` \| `null` |

`currentMusicType` 是音乐切换的核心标记。每次播放音乐前先检查该标记：
- 如果已经是同类型 → 跳过，不重复播放
- 如果是不同类型 → 先停止其他类型的音乐，再播放自己的

### 8.4 音频切换逻辑

```
进入主城 → playCityMusic() → currentMusicType = 'city'
进入迷宫/Boss战 → stopCityMusic() + playFightMusic() → currentMusicType = 'fight'
返回主城 → stopFightMusic() + playCityMusic() → currentMusicType = 'city'
播放剧情对话 → startStoryMusicTransition()
  ├── 保存当前音乐类型到 _bgBeforeStory（'city' 或 'fight'）
  ├── 停止当前音乐
  ├── playStoryMusic() → currentMusicType = 'story'
  └── 如果已经是 'story'，直接返回（不重复切换）
剧情对话结束 → endStoryMusicTransition()
  ├── stopStoryMusic() → currentMusicType = null
  ├── 根据 _bgBeforeStory 恢复之前的音乐（city 或 fight）
  └── 执行回调（如有）
```

**关键实现**：
- `startStoryDialogue()` / `startDialogue()` — 剧情对话入口，自动处理音乐过渡，对话结束后恢复背景音乐
- `startStoryMusicTransition()` — 记录剧情开始前正在播放的音乐类型，停止该音乐，播放剧情音乐
- `endStoryMusicTransition()` — 停止剧情音乐，根据之前保存的状态恢复主城或战斗音乐
- 如果已经在播放剧情音乐（`currentMusicType === 'story'`），`startStoryMusicTransition()` 直接返回，避免重复切换

### 8.5 大师对话按剧情处理

所有大师对话（包括武魂觉醒选择、系别克制说明、伙伴选择、赵无极报名费、黑屏过渡等）现在均按剧情对话处理，使用 `startStoryMusicTransition()` 和 `endStoryMusicTransition()` 进行音乐切换：

| 对话框函数 | 音乐处理 |
|------------|----------|
| `showMasterWuhunChoice()` | 打开时 `startStoryMusicTransition()`，关闭时 `endStoryMusicTransition()` |
| `showXiaoWuWuhunChoice()` | 打开时 `startStoryMusicTransition()`，关闭时 `endStoryMusicTransition()` |
| `showAffinityGuideDialog()` | 打开时 `startStoryMusicTransition()`，关闭时 `endStoryMusicTransition()` |
| `showSecondLevelHintDialog()` | 打开时 `startStoryMusicTransition()`，关闭时 `endStoryMusicTransition()` |
| `showShrekPartnerChoice()` | 打开时 `startStoryMusicTransition()`，关闭时 `endStoryMusicTransition()` |
| `showZwjRegistrationDialog()` | 打开时 `startStoryMusicTransition()`，关闭时 `endStoryMusicTransition()` |
| `showBlackScreen()` | 打开时 `startStoryMusicTransition()`，关闭时 `endStoryMusicTransition()` |

### 8.6 同一时间只播放一种音乐

所有播放函数在播放前都会检查 `currentMusicType`：
- `playCityMusic()`：如果 `currentMusicType === 'city'` 则跳过；否则停止 fight/story 音乐
- `playFightMusic()`：如果 `currentMusicType === 'fight'` 则跳过；否则停止 city/story 音乐
- `playStoryMusic()`：如果 `currentMusicType === 'story'` 则跳过；否则停止 city/fight 音乐

确保同一时间只有一种背景音乐在播放。

### 8.7 音乐断点续播

停止音乐时保留当前播放位置（`currentTime`），下次播放同种音乐时从该位置继续，而不是从头开始。

**实现方式**：
- `stopCityMusic()` / `stopFightMusic()` / `stopStoryMusic()` — 只调用 `pause()`，不重置 `currentTime`
- `playCityMusic()` / `playFightMusic()` / `playStoryMusic()` — 播放时直接从上次停止的位置继续
- 首次创建 Audio 对象时，`currentTime` 默认为 0，所以第一次播放仍然从头开始

### 8.8 渐强效果

每次新播放音乐时，头 2 秒有一个渐强效果，从目标音量的 30% 线性过渡到目标音量。

**实现方式**（`applyFadeIn(audio, targetVolume)`）：
- 初始音量设为 `targetVolume * 0.3`
- 使用 `requestAnimationFrame` 在 2 秒内线性过渡到 `targetVolume`
- 例如目标音量为 0.25，则从 0.075 开始，2 秒后达到 0.25

---

## 9. 数据流与调用关系

### 9.1 游戏启动流程


```
index.html → main.js
  → initApp() [gameState.js] — 初始化画布
  → createMessageBar() [utilsCore.js] — 创建消息栏
  → createButtonRow() [uiPanels.js] — 创建按钮行
  → readConfigs() [utilsCore.js] — 加载JSON配置
    → fetch('config/wuhun.json')
    → fetch('config/characters.json')
    → fetch('config/stages.json')
  → createInitialParty() — 创建初始队伍
  → initDialogue() [gameLogic.js] — 初始化对话引擎
  → initTownMap() [gameLogic.js] — 初始化城镇地图
  → startDialogue('intro', 'intro.txt', callback) — 播放开场对话
  → gameLoop() — 启动主循环
```

### 9.2 战斗流程


```
玩家在迷宫遇敌 → gameLogic.js: tryMoveMaze()
  → buildEnemyFromMonster() — 构建敌人
  → new BattleSystem(playerUnits, enemyUnits) — 创建战斗实例
  → app.state = 'BATTLE'
  → gameLoop() → drawBattle() [uiBattle.js] — 渲染战斗界面
  → 玩家点击"普攻"或技能按钮
    → eventHandlers.js → performAttack() / executeSkill()
    → battle.playerAttack() / battle.executeSkill()
    → resolveAttack() [battleAttack.js] — 伤害计算
    → advanceTurn() — 推进回合
    → 轮到敌人 → enemyAI() [battle.js]
      → 选择技能 → executeSkill() [battleSkill.js]
      → 或普攻 → resolveAttack() [battleAttack.js]
      → advanceTurn()
    → 循环直到一方全灭
    → _checkVictory() → onBattleWin() / onBattleLoss() [gameLogic.js]
```

### 9.3 对话触发流程


```
main.js → startDialogue('intro', 'intro.txt', callback)
  → DialogueEngine.startEvent()
    → loadFile() → parse() → renderCurrentLine()
      → 用户点击 → advance() → renderCurrentLine()
        → 遇到 [give] → processGive()
        → 遇到 [options] → 显示选项按钮
        → 用户选择 → handleOption() → 跳转到对应分支
        → 事件结束 → endEvent() → 执行回调
```

### 9.4 模块依赖关系图


```
main.js
├── gameState.js (app 全局状态)
├── utils.js → utilsCore.js (工具函数)
├── gameLogic.js
│   ├── dialogue.js (对话引擎)
│   ├── maze.js (迷宫)
│   ├── battle.js (战斗系统)
│   │   ├── battleInit.js (战斗初始化)
│   │   │   ├── battleUtils.js (属性计算)
│   │   │   ├── talents.js (天赋)
│   │   │   └── skills.js (技能池)
│   │   ├── battleAttack.js (攻击判定)
│   │   │   └── battleUtils.js
│   │   ├── battleMark.js (状态标记)
│   │   │   └── battleUtils.js
│   │   └── battleSkill.js (技能执行)
│   │       ├── skills.js
│   │       ├── battleAttack.js
│   │       └── battleUtils.js
│   └── utilsCore.js
├── uiRenderer.js
│   ├── uiTown.js
│   ├── uiShop.js
│   ├── uiMaze.js
│   └── uiBattle.js
├── uiPanels.js
│   ├── gameLogic.js
│   ├── utilsCore.js
│   └── uiCharacterTeam.js
│       ├── gameState.js
│       ├── battleUtils.js
│       └── utilsCore.js
└── eventHandlers.js
    ├── gameState.js
    ├── gameLogic.js
    └── dialogue.js
```

---

## 10. 常见修改指南

### 10.1 修改武魂属性（平衡性调整）


**文件**：`config/wuhun.json`

修改某个武魂的基础属性（力量/速度/智力）、主副系别、可用技能等。

**示例**：将蓝银草的力量从2改为3
```json
{
  "name": "蓝银草",
  "baseForce": 3,  // ← 改为3
  ...
}
```

### 10.2 修改技能效果


**文件**：`engine/skills.js`（技能定义）
**文件**：`engine/battleSkill.js`（技能执行逻辑）

**示例**：将"缠绕"的消耗从2改为1
```javascript
// skills.js
{ id: '缠绕', name: '缠绕', cost: 1, ... }  // ← 改为1
```

**示例**：修改"蛮力"的额外伤害从1改为2
```javascript
// battleSkill.js case 'brute':
dmgResult.damage += 2;  // ← 改为2
```

> ⚠️ **重要提示**：修改技能效果时，请务必同步更新以下3处：
> 1. **`engine/skills.js`** — 修改 `desc` 字段（技能描述，游戏中技能说明按钮显示）
> 2. **`engine/battleSkill.js`** — 修改对应的 `case` 分支（技能实际执行逻辑）
> 3. **`dialogues/help_skill.txt`** — 修改帮助面板中的技能描述
>
> 这三处必须保持一致，否则会出现"技能描述与实际效果不符"的问题。

### 10.3 修改天赋效果


**文件**：`engine/talents.js`

> ⚠️ **重要提示**：修改天赋功能时，请务必同步修改 `desc` 字段（天赋描述），否则会出现"天赋描述与实际效果不符"的问题。

**示例**：将昊天锤的连击概率从25%改为40%
```javascript
'昊天锤': {
  name: '乱披风',
  desc: '攻击命中时以40%概率立即额外执行1次普通攻击。',  // ← 改描述
  onAttack(attacker, defender, dmgInfo) {
    if (Math.random() < 0.4) dmgInfo.extraAttack = true;  // ← 改概率
  }
},
```

### 10.4 修改属性计算公式


**文件**：`engine/battleUtils.js`

**示例**：将 maxHp 公式从 `force + 3` 改为 `force * 2 + 3`
```javascript
const maxHp = force * 2 + 3;  // ← 修改这里
```

### 10.5 修改攻击伤害计算


**文件**：`engine/battleAttack.js`

**示例**：修改闪避判定阈值
```javascript
// 将 diff >= 6 改为 diff >= 5
if (diff >= 5) dodgeChance = 0.5;
```

### 10.6 修改敌方AI行为


**文件**：`engine/battle.js` 中的 `enemyAI()` 方法

**示例**：让力系敌人100%攻击
```javascript
if (isPowerType) {
  chooseAttack = true;  // ← 改为 true
} else {
  chooseAttack = Math.random() < 0.3;
}
```

### 10.7 修改迷宫生成参数


**文件**：`engine/maze.js`

**示例**：修改迷宫大小（在 `config/stages.json` 中修改 `size` 字段）

### 10.8 修改对话内容


**文件**：`dialogues/` 目录下的 `.txt` 文件

直接编辑文本内容即可。注意保持标记语法正确。

### 10.9 添加新角色


**步骤**：
1. 在 `config/wuhun.json` 中添加新武魂
2. 在 `config/characters.json` 中添加角色定义
3. 在 `engine/skills.js` 的 `SKILL_POOL` 中添加对应系别的技能
4. 在 `engine/talents.js` 的 `TALENT_MAP` 中添加天赋（可选）
5. 在 `engine/gameBattle.js` 的 `buildEnemyFromMonster()` 中处理新敌人（可选）

### 10.10 添加新关卡


**步骤**：
1. 在 `config/stages.json` 中添加关卡配置
2. 在 `dialogues/` 中创建对话文件
3. 在 `config/characters.json` 中添加Boss角色
4. 在 `engine/gameTown.js` 的 `openLevelSelect()` 中确保关卡被正确加载

### 10.11 修改UI布局


**文件**：`engine/uiBattle.js`、`engine/uiTown.js`、`engine/uiMaze.js`、`engine/uiShop.js`

修改 Canvas 绘制坐标和尺寸即可。

### 10.12 修改存档/读档


**文件**：`engine/utilsCore.js` 中的 `saveGame(slot)`、`loadGame(slot)` 和 `getSaveSlotInfo(slot)`

游戏支持3个存档位（`douluo_save_slot_1` ~ `douluo_save_slot_3`），存储在 `localStorage` 中。

**函数说明**：
- `saveGame(slot)` — 保存游戏到指定存档位（slot=1~3）
- `loadGame(slot)` — 从指定存档位读取存档（slot=1~3）
- `getSaveSlotInfo(slot)` — 获取存档位信息，返回 `{ exists: boolean, displayName: string }`，其中 `displayName` 包含前3个角色的名字+等级+当前位置（如"唐三 Lv.5 | 小舞 Lv.3（史莱克学院门口）"）

**存档面板**：`engine/uiPanels.js` 中的 `updateSaveSlots()` 函数负责渲染存档面板，显示3个存档位的信息和保存/读取按钮。

**主界面读档**：`main.js` 中的 `load-game-btn` 点击事件会弹出存档选择对话框，显示3个存档位的信息供玩家选择。

**存档数据包含**：当前关卡、已解锁关卡、玩家信息、队伍信息、背包物品、当前城镇、队伍阵型、游戏进度标记等。

### 10.13 添加新物品


**步骤**：
1. 在 `engine/gameBattle.js` 的 `useBackpackItem()` 中添加使用逻辑
2. 在 `engine/uiShop.js` 的 `items` 数组中添加商品
3. 在 `engine/uiPanels.js` 的 `updateBackpackList()` 中添加显示逻辑
4. 在 `engine/gameState.js` 的 `app.inventory` 中添加物品计数

### 10.14 修改战斗速度


**文件**：`engine/eventHandlers.js`

搜索 `battleSpeed` 相关代码，修改 `fast`/`medium`/`slow` 对应的延迟时间。

### 10.15 添加新状态标记


**步骤**：
1. 在 `engine/battleMark.js` 的 `addMark()` 中添加新标记类型
2. 在 `engine/battleMark.js` 的 `applyStartTurnEffects()` / `applyEndTurnEffects()` 中添加效果
3. 在 `engine/uiBattle.js` 的 `MARK_CN` 中添加中文显示名
4. 在 `engine/battleSkill.js` 中添加使用该标记的技能

---

> **最后更新**：2026年5月
> **运行方式**：使用 NW.js 打开项目目录，或直接在浏览器中打开 `index.html`（需支持 ES Module）
