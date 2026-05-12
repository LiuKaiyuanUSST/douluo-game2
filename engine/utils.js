// engine/utils.js
// 聚合模块，保持原有所有导出，并补充 createCharacter 导出
export { createMessageBar, setMoveTip, readConfigs, saveGame, loadGame, createCharacter, findCharacterDef } from './utilsCore.js';
export { createButtonRow, createSaveButton, createReturnToTownButton, createBackpackButton, createCharacterButton, createTeamButton, createHelpButton, toggleBackpack, toggleHelpPanel } from './uiPanels.js';
