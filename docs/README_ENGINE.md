# 引擎核心模块详解

## engine/gameState.js — 全局状态

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

## engine/utilsCore.js — 核心工具函数

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

## engine/gameLogic.js — 游戏逻辑枢纽

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

## engine/dialogue.js — 对话引擎

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

## engine/eventHandlers.js — 事件处理

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

## engine/maze.js — 迷宫系统

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

## 史莱克学院与圈养森林

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
- 7只百年魂兽随机分配到7个Boss位置，每次进入都不一样
- 迷宫墙壁生成方式与普通迷宫类似，但连通性检测不同：必须保证从起点到每个Boss格都能到达，路径不能经过其他Boss格
- 走到Boss相邻格子时，该Boss格自动显示（问号变为魂兽名称和三角标记）
- 走到Boss格触发战斗，随机选取主系（70%概率）或副系（30%概率）出战

**大师对话引导**：
- 进入史莱克学院后，第一次移动会触发大师对话
- 大师讲解魂环→魂技→提升实力的关系，并引导玩家前往圈养森林

**战斗塔魂技检查**：
- 在史莱克学院进入战斗塔时，系统会检查所有角色是否拥有魂技
- 如果没有任何角色拥有魂技，会提示并阻止玩家进入战斗塔

**文本统一**：
- 游戏中所有涉及"技能"的显示文本已统一改为"魂技"

## engine/gameBeastForest.js — 魂兽森林战斗、结算、魂环吸收入口

通用模块，可用于猎魂森林、落日森林、星斗大森林等场景。

**函数**：
| 函数 | 说明 |
|------|------|
| `startBeastForestBossFight(bossInfo)` | 进入魂兽森林Boss战斗，随机选取主系（70%概率）或副系（30%概率）出战 |
| `handleBeastForestBattleWin()` | 战斗胜利处理：筛选存活角色、显示结算对话框、触发魂环吸收流程 |

**战斗胜利结算流程**：
1. 判断玩家的角色等级和参与战斗的仍然存活角色
2. 筛选出已有技能数小于主角等级的角色（1级最多1个技能，2级最多2个技能，依此类推）
3. 显示大师结算语
4. 显示可选角色列表供玩家选择附加魂环
5. 如果没有可用角色，显示"您没有待升级角色"
6. 玩家选择角色后，调用 `startSoulRingMaze()` 进入魂环迷宫

## engine/gameSoulRing.js — 魂环吸收迷宫

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
 