# 音频系统详解

## 背景音乐文件

游戏使用 MP3 格式的音频文件，存放在 `music/` 目录下：

| 文件 | 用途 | 播放时机 |
|------|------|----------|
| `city1.mp3` | 主城背景音乐 | 进入主城时播放（新游戏开场对话结束后、读档、返回主城、切换主城） |
| `fight1.mp3` | 战斗副本背景音乐 | 进入迷宫关卡或 Boss 战时播放 |
| `story1.mp3` | 剧情对话背景音乐 | 播放剧情对话时播放（开场故事、打完 Boss 后的对话、章节结束对话等） |

## 音频控制函数

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

## 音频状态标记

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

## 音频切换逻辑

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

## 大师对话按剧情处理

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

## 同一时间只播放一种音乐

所有播放函数在播放前都会检查 `currentMusicType`：
- `playCityMusic()`：如果 `currentMusicType === 'city'` 则跳过；否则停止 fight/story 音乐
- `playFightMusic()`：如果 `currentMusicType === 'fight'` 则跳过；否则停止 city/story 音乐
- `playStoryMusic()`：如果 `currentMusicType === 'story'` 则跳过；否则停止 city/fight 音乐

确保同一时间只有一种背景音乐在播放。

## 音乐断点续播

停止音乐时保留当前播放位置（`currentTime`），下次播放同种音乐时从该位置继续，而不是从头开始。

**实现方式**：
- `stopCityMusic()` / `stopFightMusic()` / `stopStoryMusic()` — 只调用 `pause()`，不重置 `currentTime`
- `playCityMusic()` / `playFightMusic()` / `playStoryMusic()` — 播放时直接从上次停止的位置继续
- 首次创建 Audio 对象时，`currentTime` 默认为 0，所以第一次播放仍然从头开始

## 渐强效果

每次新播放音乐时，头 2 秒有一个渐强效果，从目标音量的 30% 线性过渡到目标音量。

**实现方式**（`applyFadeIn(audio, targetVolume)`）：
- 初始音量设为 `targetVolume * 0.3`
- 使用 `requestAnimationFrame` 在 2 秒内线性过渡到 `targetVolume`
- 例如目标音量为 0.25，则从 0.075 开始，2 秒后达到 0.25
