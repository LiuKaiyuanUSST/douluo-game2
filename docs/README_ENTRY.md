# 入口文件详解

## index.html

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

## main.js

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

## package.json

NW.js 配置文件，设置窗口标题、尺寸，以及 `--allow-file-access-from-files` 参数以允许本地文件访问。
 