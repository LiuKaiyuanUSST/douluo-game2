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

## engine/uiTown.js — 城镇界面

**函数**：`drawTown()`

绘制5×5网格地图，不同颜色表示不同功能格：
- 绿色（1）：商店
- 橙色（2）：战斗塔
- 紫色（3/4）：出口（下一关/上一关）
- 绿色（5）：圈养森林（史莱克学院地图特有）
- 蓝色圆点：玩家位置

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
