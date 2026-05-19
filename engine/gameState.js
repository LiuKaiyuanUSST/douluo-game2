// engine/gameState.js
export let app = {
  canvas: null,
  ctx: null,
  state: 'MENU',
  cityMusic: null,           // 主城背景音乐 Audio 对象
  fightMusic: null,          // 战斗副本背景音乐 Audio 对象
  storyMusic: null,          // 剧情对话背景音乐 Audio 对象
  currentMusicType: null,    // 当前播放的音乐类型：'city' | 'fight' | 'story' | null



  config: {},
  currentLevel: 0,
  unlockedLevels: [0, 4],  // 预解锁"七怪跑步"关卡供测试查看

  maze: null,
  battle: null,
  player: null,               // 玩家快捷引用（主角唐三）
  inventory: { jiupin: 0, royalTrialToken: 0 },
  party: [],                  // 角色数组，每个角色对象结构见下
  activeTeam: [null, null, null],
  selectedFormation: 'front-front-front',
  currentTown: 'noting',
  townMaps: {
    noting: {
      map: [ [0,0,0,0,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [1,0,0,0,3] ],
      name: '诺丁学院',
      exits: { 3: { targetTown: 'suotuo', targetPos: {x:0,y:0} } }
    },
    suotuo: {
      map: [ [4,0,0,0,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [1,0,0,0,3] ],
      name: '索托玫瑰酒店',
      exits: { 3: { targetTown: 'shrek', targetPos: {x:0,y:0} }, 4: { targetTown: 'noting', targetPos: {x:4,y:4} } }
    },
    shrek: {
      map: [ [4,0,0,0,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [1,0,0,0,3] ],
      name: '史莱克大门',
      exits: { 3: { targetTown: 'shrek_academy', targetPos: {x:0,y:0} }, 4: { targetTown: 'suotuo', targetPos: {x:0,y:0} } }
    },
    shrek_academy: {
      map: [ [4,0,0,0,2], [0,0,0,0,0], [0,5,0,6,0], [0,0,0,0,0], [1,0,0,0,3] ],
      name: '史莱克学院',
      exits: { 3: { targetTown: 'shrek_village', targetPos: {x:0,y:0} }, 4: { targetTown: 'shrek', targetPos: {x:4,y:4} } }
    },
    shrek_village: {
      map: [ [4,0,0,0,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [1,0,0,0,0] ],
      name: '史莱克村',
      exits: { 4: { targetTown: 'shrek_academy', targetPos: {x:4,y:4} } }
    }


  },
  townPlayerPos: { x: 0, y: 0 },
  levelSelectDiv: null,
  battleButtons: [],
  shopButtons: [],
  shopBackBtn: null,
  currentBossPhase: 0,
  dialogActive: false,
  dialogueEngine: null,
  battleTargeting: false,
  battleEnemyTurnDone: false,
  backpackOpen: false,
  battlePlayerSlots: null,
  battleEnemySlots: null,
  battleSkipBtn: null,
  playerFormation: 0,
  firstTownReturnWithDead: false,
  showResurrectionHint: false,
  showAffinityHint: false,
  wuhunChosen: false,
  xwWuhunChosen: false,
  shrekPartnerChosen: false,
  shrekFirstMoveDone: false,
  fldRegistrationDone: false,
  firstLevelEntered: false,
  secondLevelEntered: false,
  pendingXiaoWuChoice: false,
  shrekAcademyFirstMove: false,
  firstForestReturnDialogShown: false,
  shrekBattleTowerCleared: false,   // 史莱克学院门口的战斗塔是否已通关
  mhjStoryCompleted: false,         // 邪火凤凰马红俊剧情是否已完成
  mhjNewPartnerChosen: false,       // 马红俊剧情后新伙伴是否已选择（从剩余史莱克七怪中选）
  qiGuaiFlenderSpeechDone: false,   // 七怪跑步弗兰德训话剧情是否已播放
  qiGuaiComplainDone: false,        // 七怪跑步抱怨剧情是否已播放
  qiGuaiHelpDone: false,            // 七怪跑步互相帮助剧情是否已播放
  qiGuaiPartnerChosen: false,       // 七怪跑步伙伴选择是否已完成
  qiGuaiFirstReturnHintShown: false,// 七怪跑步第一次非通关回城提示是否已显示
  qiGuaiMazeCompleted: false,       // 七怪跑步迷宫是否已通关完成
  masterArrivesDialogShown: false,  // 大师来访剧情是否已触发（史莱克村通关后第一次进入史莱克学院时触发）
  masterSecondSoulRingDialogShown: false,  // 大师第二魂环引导对话框是否已显示
  royalTrialTokenDialogShown: false,       // 皇家试炼令对话框是否已显示（防止重复触发）




  // 新的数据库
  wuhunDatabase: {},         // 武魂名 -> { name, mainAffinity, subAffinity, baseForce, baseSpeed, baseIntelligence, availableSkillIds, innateSkill?, talentName? }
  characterDatabase: {},     // 角色数据库 { players: {key: {...}}, enemies: {key: {...}} } - 角色有name, wuhun, level等

  battleSpeed: 'medium',
  battleSpeedBtns: [],
  battleSkillMode: false,
  selectedSkill: null,
  battleSkillCancelBtn: null,
  battleNormalCancelBtn: null,
  battleCandidateSlots: null,
  applyDelay: false,
  battleLogBtn: null,
  showBattleLog: false,
  battleLog: [],
  lastMoveWasAffinityHint: false,
};

export function initApp() {
  app.canvas = document.getElementById('gameCanvas');
  app.ctx = app.canvas.getContext('2d');
}
 