# 战斗系统详解

## engine/battle.js — 战斗系统主类

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

## engine/battleInit.js — 战斗初始化

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

## engine/battleAttack.js — 攻击判定

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

## engine/battleMark.js — 状态标记系统

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
| `power_up` | 巨力（力量+3） | 本场 |
| `speed_up` | 极速（速度+3） | 本场 |
| `smoke` | 烟雾（智力-2） | 本场 |

## engine/battleSkill.js — 技能执行

**函数**：
- `executeSkill(actor, skillId, target, battle)` — 执行技能

## engine/skills.js — 技能池定义

**技能类型**（定义在 `SKILL_POOL` 中）：

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
| 天工 | 一曰力 | 3 | power_up | 50%力量+3 |
| 天工 | 二曰速 | 3 | speed_up | 50%速度+3 |
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

## engine/battleUtils.js — 战斗工具函数

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

## engine/talents.js — 天赋系统

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
 