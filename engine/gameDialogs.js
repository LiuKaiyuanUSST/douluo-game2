// engine/gameDialogs.js - 对话框函数聚合模块（重新导出所有子模块）
// 原文件已拆分为以下子模块以方便维护：
//   gameDialogs_utils.js   - 工具函数、通用样式、对话框创建/关闭
//   gameDialogs_wuhun.js   - 武魂觉醒对话框（大师、小舞）
//   gameDialogs_guide.js   - 引导说明对话框（系别克制、关卡提示、魂环引导等）
//   gameDialogs_partner.js - 伙伴选择对话框（史莱克伙伴、马红俊后新伙伴、七怪跑步伙伴）
//   gameDialogs_events.js  - 事件对话框（赵无极报名费、黑屏显示）

export {
    registerStartDialogue,
    registerGoToTown,
    startDialogue,
    goToTown,
    getWuhunFeature,
    getRandomWuhunOptions,
    DIALOGUE_STYLES,
    createDialogContainer,
    closeDialog
} from './gameDialogs_utils.js';

export {
    showMasterWuhunChoice,
    showXiaoWuWuhunChoice
} from './gameDialogs_wuhun.js';

export {
    showAffinityGuideDialog,
    showSecondLevelHintDialog,
    showShrekAcademyMasterDialog,
    showFirstForestReturnDialog,
    showQiGuaiFirstReturnHint,
    showMasterSecondSoulRingDialog,
    showRoyalTrialTokenDialog
} from './gameDialogs_guide.js';


export {
    showShrekPartnerChoice,
    showMhjNewPartnerChoice,
    showQiGuaiPartnerChoice
} from './gameDialogs_partner.js';

export {
    showZwjRegistrationDialog,
    showBlackScreen
} from './gameDialogs_events.js';
