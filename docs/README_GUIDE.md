# 常见修改指南

## 10.1 修改武魂属性（平衡性调整）

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

## 10.2 修改技能效果

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

## 10.3 修改天赋效果

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

## 10.4 修改属性计算公式

**文件**：`engine/battleUtils.js`

**示例**：将 maxHp 公式从 `force + 3` 改为 `force * 2 + 3`
```javascript
const maxHp = force * 2 + 3;  // ← 修改这里
```

## 10.5 修改攻击伤害计算

**文件**：`engine/battleAttack.js`

**示例**：修改闪避判定阈值
```javascript
// 将 diff >= 6 改为 diff >= 5
if (diff >= 5) dodgeChance = 0.5;
```

## 10.6 修改敌方AI行为

**文件**：`engine/battle.js` 中的 `enemyAI()` 方法

**示例**：让力系敌人100%攻击
```javascript
if (isPowerType) {
  chooseAttack = true;  // ← 改为 true
} else {
  chooseAttack = Math.random() < 0.3;
}
```

## 10.7 修改迷宫生成参数

**文件**：`engine/maze.js`

**示例**：修改迷宫大小（在 `config/stages.json` 中修改 `size` 字段）

## 10.8 修改对话内容

**文件**：`dialogues/` 目录下的 `.txt` 文件

直接编辑文本内容即可。注意保持标记语法正确。

## 10.9 添加新角色

**步骤**：
1. 在 `config/wuhun.json` 中添加新武魂
2. 在 `config/characters.json` 中添加角色定义
3. 在 `engine/skills.js` 的 `SKILL_POOL` 中添加对应系别的技能
4. 在 `engine/talents.js` 的 `TALENT_MAP` 中添加天赋（可选）
5. 在 `engine/gameBattle.js` 的 `buildEnemyFromMonster()` 中处理新敌人（可选）

## 10.10 添加新关卡

**步骤**：
1. 在 `config/stages.json` 中添加关卡配置
2. 在 `dialogues/` 中创建对话文件
3. 在 `config/characters.json` 中添加Boss角色
4. 在 `engine/gameTown.js` 的 `openLevelSelect()` 中确保关卡被正确加载

## 10.11 修改UI布局

**文件**：`engine/uiBattle.js`、`engine/uiTown.js`、`engine/uiMaze.js`、`engine/uiShop.js`

修改 Canvas 绘制坐标和尺寸即可。

## 10.12 修改存档/读档

**文件**：`engine/utilsCore.js` 中的 `saveGame(slot)`、`loadGame(slot)` 和 `getSaveSlotInfo(slot)`

游戏支持3个存档位（`douluo_save_slot_1` ~ `douluo_save_slot_3`），存储在 `localStorage` 中。

**函数说明**：
- `saveGame(slot)` — 保存游戏到指定存档位（slot=1~3）
- `loadGame(slot)` — 从指定存档位读取存档（slot=1~3）
- `getSaveSlotInfo(slot)` — 获取存档位信息，返回 `{ exists: boolean, displayName: string }`，其中 `displayName` 包含前3个角色的名字+等级+当前位置（如"唐三 Lv.5 | 小舞 Lv.3（史莱克学院门口）"）

**存档面板**：`engine/uiPanels.js` 中的 `updateSaveSlots()` 函数负责渲染存档面板，显示3个存档位的信息和保存/读取按钮。

**主界面读档**：`main.js` 中的 `load-game-btn` 点击事件会弹出存档选择对话框，显示3个存档位的信息供玩家选择。

**存档数据包含**：当前关卡、已解锁关卡、玩家信息、队伍信息、背包物品、当前城镇、队伍阵型、游戏进度标记等。

## 10.13 添加新物品

**步骤**：
1. 在 `engine/gameBattle.js` 的 `useBackpackItem()` 中添加使用逻辑
2. 在 `engine/uiShop.js` 的 `items` 数组中添加商品
3. 在 `engine/uiPanels.js` 的 `updateBackpackList()` 中添加显示逻辑
4. 在 `engine/gameState.js` 的 `app.inventory` 中添加物品计数

## 10.14 修改战斗速度

**文件**：`engine/eventHandlers.js`

搜索 `battleSpeed` 相关代码，修改 `fast`/`medium`/`slow` 对应的延迟时间。

## 10.15 添加新状态标记

**步骤**：
1. 在 `engine/battleMark.js` 的 `addMark()` 中添加新标记类型
2. 在 `engine/battleMark.js` 的 `applyStartTurnEffects()` / `applyEndTurnEffects()` 中添加效果
3. 在 `engine/uiBattle.js` 的 `MARK_CN` 中添加中文显示名
4. 在 `engine/battleSkill.js` 中添加使用该标记的技能

## 10.16 修改城镇地图名称与出口标签

### 修改城镇显示名称

**文件**：`engine/gameState.js` 中的 `townMaps` 对象

修改某个城镇的 `name` 字段即可。

**示例**：将"史莱克学院门口"改为"学院大门"
```javascript
shrek: {
  map: [ ... ],
  name: '学院大门',  // ← 改为新名称
  exits: { ... }
},
```

**存档显示名称**：`engine/utilsCore.js` 中的 `TOWN_NAMES` 常量也需同步修改。

### 修改出口标签（"下一关" / "上一关"）

**文件**：`engine/uiTown.js`

出口标签会自动查找目标城镇的 `name` 进行动态显示，无需手动配置。长名称（6字符以上）会自动折行为两行显示（第一行前1/3，第二行后2/3）。

**示例效果**：
- 诺丁学院的出口显示"索托玫瑰酒店"（折行：索托 / 玫瑰酒店）
- 索托玫瑰酒店的出口显示"学院大门"、"诺丁学院"
- 史莱克村的出口显示"史莱克学院"

### 修改通关提示文字

**文件**：`engine/gameTown.js`

在 `tryMoveTown()` 函数末尾的条件分支中修改。

**示例**：史莱克村通关后显示"请返回史莱克学院"而非"请前往下一关地图"
```javascript
if (app.currentTown === 'shrek_village') {
  setMoveTip("请返回史莱克学院");
} else {
  setMoveTip("请前往下一关地图");
}
```
