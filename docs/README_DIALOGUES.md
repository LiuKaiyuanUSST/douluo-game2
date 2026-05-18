# 对话系统详解

## 对话文件格式

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

## 对话文件列表

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

## 对话触发流程

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
 