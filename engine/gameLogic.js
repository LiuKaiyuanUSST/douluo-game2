// engine/gameLogic.js - 主逻辑枢纽，从子模块导入并重新导出所有功能
// 将原本 1569 行的 gameLogic.js 拆分为 4 个独立模块：
//   gameMusic.js  - 音频系统
//   gameBattle.js - 战斗相关逻辑
//   gameTown.js   - 城镇相关逻辑
//   gameDialogs.js - 对话框函数

// ========== 从子模块导入（用于本地使用和重新导出） ==========

// 音频系统
import {
    playCityMusic as _playCityMusic,
    startStoryMusicTransition as _startStoryMusicTransition,
    endStoryMusicTransition as _endStoryMusicTransition,
    playFightMusic as _playFightMusic,
    stopCityMusic as _stopCityMusic,
    stopFightMusic as _stopFightMusic
} from './gameMusic.js';

// 战斗相关逻辑
import {
    initDialogue as _initDialogue,
    startStoryDialogue as _startStoryDialogue,
    startDialogue as _startDialogue,
    startBossFight as _startBossFight,
    performAttack as _performAttack,
    skipPlayerTurn as _skipPlayerTurn,
    onBattleWin as _onBattleWin,
    onBattleLoss as _onBattleLoss,
    handleShopPurchase as _handleShopPurchase,
    useBackpackItem as _useBackpackItem,
    buildEnemyFromMonster as _buildEnemyFromMonster,
    buildUnitsFromParty as _buildUnitsFromParty,
    registerGoToTown as _registerGoToTown,
    registerStartLevel as _registerStartLevel
} from './gameBattle.js';

// 城镇相关逻辑
import {
    initTownMap as _initTownMap,
    goToTown as _goToTown,
    tryMoveTown as _tryMoveTown,
    openShop as _openShop,
    openLevelSelect as _openLevelSelect,
    startLevel as _startLevel,
    tryMoveMaze as _tryMoveMaze,
    registerShowMasterWuhunChoice as _registerShowMasterWuhunChoice,
    registerShowXiaoWuWuhunChoice as _registerShowXiaoWuWuhunChoice,
    registerShowShrekPartnerChoice as _registerShowShrekPartnerChoice,
    registerShowZwjRegistrationDialog as _registerShowZwjRegistrationDialog,
    registerShowAffinityGuideDialog as _registerShowAffinityGuideDialog,
    registerShowSecondLevelHintDialog as _registerShowSecondLevelHintDialog,
    registerShowShrekAcademyMasterDialog as _registerShowShrekAcademyMasterDialog,
    registerBuildEnemyFromMonster as _registerBuildEnemyFromMonster,
    registerBuildUnitsFromParty as _registerBuildUnitsFromParty,
    registerStartBossFight as _registerStartBossFight
} from './gameTown.js';

// 对话框函数
import {
    showMasterWuhunChoice as _showMasterWuhunChoice,
    showXiaoWuWuhunChoice as _showXiaoWuWuhunChoice,
    showAffinityGuideDialog as _showAffinityGuideDialog,
    showSecondLevelHintDialog as _showSecondLevelHintDialog,
    showShrekPartnerChoice as _showShrekPartnerChoice,
    showZwjRegistrationDialog as _showZwjRegistrationDialog,
    showBlackScreen as _showBlackScreen,
    showShrekAcademyMasterDialog as _showShrekAcademyMasterDialog,
    registerStartDialogue as _registerStartDialogue,
    registerGoToTown as _registerGoToTownForDialogs
} from './gameDialogs.js';

// ========== 跨模块依赖注册 ==========
// 由于 gameBattle.js、gameTown.js 和 gameDialogs.js 之间存在循环依赖，
// 我们在这里进行注册，将函数注入到对方模块中

// 注册 gameBattle.js 需要的函数
_registerGoToTown(_goToTown);
_registerStartLevel(_startLevel);

// 注册 gameTown.js 需要的函数
_registerShowMasterWuhunChoice(_showMasterWuhunChoice);
_registerShowXiaoWuWuhunChoice(_showXiaoWuWuhunChoice);
_registerShowShrekPartnerChoice(_showShrekPartnerChoice);
_registerShowZwjRegistrationDialog(_showZwjRegistrationDialog);
_registerShowAffinityGuideDialog(_showAffinityGuideDialog);
_registerShowSecondLevelHintDialog(_showSecondLevelHintDialog);
_registerShowShrekAcademyMasterDialog(_showShrekAcademyMasterDialog);
_registerBuildEnemyFromMonster(_buildEnemyFromMonster);
_registerBuildUnitsFromParty(_buildUnitsFromParty);
_registerStartBossFight(_startBossFight);

// 注册 gameDialogs.js 需要的函数
_registerStartDialogue(_startDialogue);
_registerGoToTownForDialogs(_goToTown);

// ========== 重新导出所有功能 ==========

// 音频系统
export const playCityMusic = _playCityMusic;
export const startStoryMusicTransition = _startStoryMusicTransition;
export const endStoryMusicTransition = _endStoryMusicTransition;
export const playFightMusic = _playFightMusic;
export const stopCityMusic = _stopCityMusic;
export const stopFightMusic = _stopFightMusic;

// 战斗相关逻辑
export const initDialogue = _initDialogue;
export const startStoryDialogue = _startStoryDialogue;
export const startDialogue = _startDialogue;
export const startBossFight = _startBossFight;
export const performAttack = _performAttack;
export const skipPlayerTurn = _skipPlayerTurn;
export const onBattleWin = _onBattleWin;
export const onBattleLoss = _onBattleLoss;
export const handleShopPurchase = _handleShopPurchase;
export const useBackpackItem = _useBackpackItem;
export const buildEnemyFromMonster = _buildEnemyFromMonster;
export const buildUnitsFromParty = _buildUnitsFromParty;
export const registerGoToTown = _registerGoToTown;
export const registerStartLevel = _registerStartLevel;

// 城镇相关逻辑
export const initTownMap = _initTownMap;
export const goToTown = _goToTown;
export const tryMoveTown = _tryMoveTown;
export const openShop = _openShop;
export const openLevelSelect = _openLevelSelect;
export const startLevel = _startLevel;
export const tryMoveMaze = _tryMoveMaze;
export const registerShowMasterWuhunChoice = _registerShowMasterWuhunChoice;
export const registerShowXiaoWuWuhunChoice = _registerShowXiaoWuWuhunChoice;
export const registerShowShrekPartnerChoice = _registerShowShrekPartnerChoice;
export const registerShowZwjRegistrationDialog = _registerShowZwjRegistrationDialog;
export const registerShowAffinityGuideDialog = _registerShowAffinityGuideDialog;
export const registerShowSecondLevelHintDialog = _registerShowSecondLevelHintDialog;
export const registerBuildEnemyFromMonster = _registerBuildEnemyFromMonster;
export const registerBuildUnitsFromParty = _registerBuildUnitsFromParty;
export const registerStartBossFight = _registerStartBossFight;

// 对话框函数
export const showMasterWuhunChoice = _showMasterWuhunChoice;
export const showXiaoWuWuhunChoice = _showXiaoWuWuhunChoice;
export const showAffinityGuideDialog = _showAffinityGuideDialog;
export const showSecondLevelHintDialog = _showSecondLevelHintDialog;
export const showShrekPartnerChoice = _showShrekPartnerChoice;
export const showZwjRegistrationDialog = _showZwjRegistrationDialog;
export const showBlackScreen = _showBlackScreen;
export const showShrekAcademyMasterDialog = _showShrekAcademyMasterDialog;
export const registerStartDialogue = _registerStartDialogue;
export const registerGoToTownForDialogs = _registerGoToTownForDialogs;
