# 配置文件详解

## config/wuhun.json — 武魂数据库

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

## config/characters.json — 角色数据库

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

## config/stages.json — 关卡配置

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
