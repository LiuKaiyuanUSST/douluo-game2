# UI渲染模块详解

## engine/uiRenderer.js — 渲染聚合

简单的导出聚合模块，导出四个绘制函数。

## engine/uiBattle.js — 战斗界面

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

## engine/uiTown.js 及子模块 — 城镇界面

`uiTown.js` 原先较长（~894行），现已拆分为以下子模块：

| 文件 | 职责 |
|------|------|
| `engine/uiTownMap.js` | 平行四边形网格几何常量与函数（`CELL_W`、`CELL_H`、`SLANT`、`BASE_X`、`BASE_Y`、`getCellCorners`、`getCellCenter`、`pointInParallelogram`等） |
| `engine/uiTownColors.js` | 颜色工具函数（`lightenColor`、`darkenColor`） |
| `engine/uiTownIcons.js` | 图标绘制函数（`drawWoodenSign`、`drawForestIcon`、`drawBuildingFront`） |
| `engine/uiTownPerson.js` | 跑步小人动画绘制（`drawRunningPerson`） |
| `engine/uiTown.js` | 主模块 — 导入子模块，导出 `drawTown()` 和 `screenToGrid()` |

**函数**：`drawTown()`

绘制5×5等轴网格地图（平行四边形效果），不同颜色表示不同功能格：
- 绿色（1）：商店
- 橙色（2）：战斗塔
- 紫色（3/4）：出口（下一关/上一关）
- 绿色（5）：圈养森林（史莱克学院地图特有）
- 深紫色（6）：高级圈养森林（通关七怪跑步后开放）
- 跑步小人：玩家位置（带3帧跑步动画）

**关键常量**（位于 `engine/uiTownMap.js`）：
| 常量 | 默认值 | 说明 |
|------|--------|------|
| `CELL_W` | 100 | 网格单元格宽度 |
| `CELL_H` | 70 | 网格单元格高度（纵向压缩产生透视感） |
| `SLANT` | 40 | 每行向右偏移量（平行四边形效果） |
| `BASE_X` | 50 | 网格左下角X坐标（调整可左右移动地图） |
| `BASE_Y` | 520 | 网格左下角Y坐标 |

**木牌绘制**：`drawWoodenSign(ctx, cx, cy, text, color, width, height)`（位于 `engine/uiTownIcons.js`）
- 绘制带3D厚度的竖立木牌，含木杆（柱子）、木纹、浮雕边框
- 默认尺寸：72×60（已扩大20%）
- 字体：19px 楷体（已扩大20%）
- 注意：木牌上的4颗装饰钉子已被移除

**建筑绘制**：`drawBuildingFront(ctx, cx, cy, text, color, width, height)`（位于 `engine/uiTownIcons.js`）
- 绘制带3D效果的建筑正面，含屋顶装饰线、门、窗户
- 默认尺寸：96×66（已扩大20%）
- 字体：22px 楷体（已扩大20%）

**点击检测**：`screenToGrid(mx, my)`（位于 `engine/uiTown.js`）— 将鼠标坐标转换为网格坐标，使用叉积法检测平行四边形内的点。
<｜end▁of▁thinking｜>

<｜｜DSML｜｜parameter name="task_progress" string="true">- [x] Read README for game context
- [x] Analyze uiTown.js to find wooden signs and buildings
- [x] Remove 4 nails from all wooden signs (drawWoodenSign)
- [x] Increase wooden sign default size by 20% (60→72, 50→60)
- [x] Increase wooden sign font size by ~20% (16px→19px)
- [x] Increase building default size by 20% (80→96, 55→66)
- [x] Increase building font size by ~20% (18px→22px)
- [x] Increase all caller dimensions by 20%
- [x] Verify all changes
- [x] Update docs/README_UI.md to reflect changes
- [x] Update docs/README_GUIDE.md with new modification guide entries

## engine/uiShop.js — 商店界面

**函数**：`drawShop()`

绘制商店界面，包含商品列表（九品紫芝、力量之石、速度之石、智力之石）和返回按钮。

## engine/uiMaze.js — 迷宫界面

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

## engine/uiPanels.js — 面板UI

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

## engine/uiCharacterTeam.js — 角色/队伍面板

**函数**：
| 函数 | 说明 |
|------|------|
| `toggleCharacterPanel(show)` | 切换角色面板 |
| `toggleTeamPanel(show)` | 切换队伍面板 |
| `toggleCharacterAffinity(memberId)` | 切换角色出战系别 |

**角色面板**：显示所有角色的属性、技能、出战系别，可切换主/副系别。

**队伍面板**：可调整阵型（前-后-前/后-前-前/前-前-前），编排出战角色。
 