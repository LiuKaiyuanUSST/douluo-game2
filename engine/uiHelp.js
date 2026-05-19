import { HELP_DATA } from './uiHelpData.js';

// ---------- 帮助面板渲染 ----------

let helpState = {
  activeTab: null,
  activeSub: null,
  activeSubSub: null
};

function renderHelpPanel() {
  const panel = document.getElementById('help-panel');
  if (!panel) return;

  // 构建面包屑导航
  let breadcrumb = '<span style="color:#888;">❓ 帮助</span>';
  if (helpState.activeTab) {
    const tabData = HELP_DATA[helpState.activeTab];
    breadcrumb += ` <span style="color:#555;">›</span> <span style="color:#ffcc88;">${tabData.label}</span>`;
  }
  if (helpState.activeSub) {
    const tabData = HELP_DATA[helpState.activeTab];
    const subData = tabData.subs[helpState.activeSub];
    breadcrumb += ` <span style="color:#555;">›</span> <span style="color:#ddd;">${subData.label}</span>`;
  }
  if (helpState.activeSubSub) {
    const tabData = HELP_DATA[helpState.activeTab];
    const subData = tabData.subs[helpState.activeSub];
    const subSubData = subData.subs[helpState.activeSubSub];
    breadcrumb += ` <span style="color:#555;">›</span> <span style="color:#aaa;">${subSubData.label}</span>`;
  }

  const contentDiv = document.getElementById('help-content');
  if (!contentDiv) return;

  let html = '<div style="padding:20px; max-height:70vh; overflow-y:auto;">';

  // 面包屑导航
  html += `<div style="font-size:14px; margin-bottom:16px; padding:8px 12px; background:rgba(255,255,255,0.05); border-radius:8px;">${breadcrumb}</div>`;

  if (!helpState.activeTab) {
    // 显示一级标签
    html += '<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">';
    for (const [key, tab] of Object.entries(HELP_DATA)) {
      html += `<div class="help-tab-btn" data-tab="${key}" style="background:linear-gradient(135deg,#2c3e50,#1a252f); border:1px solid #555; border-radius:12px; padding:16px 28px; cursor:pointer; text-align:center; min-width:120px; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.3);"
        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 15px rgba(0,0,0,0.4)';"
        onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.3)';"
        onclick="helpNavigate('${key}')">
        <div style="font-size:32px; margin-bottom:6px;">${tab.label.split(' ')[0]}</div>
        <div style="font-size:16px;">${tab.label.split(' ').slice(1).join(' ')}</div>
      </div>`;
    }
    html += '</div>';
  } else if (!helpState.activeSub) {
    // 显示二级标签
    const tabData = HELP_DATA[helpState.activeTab];
    html += `<h3 style="text-align:center; color:#ffcc88; margin-bottom:16px;">${tabData.label}</h3>`;
    html += '<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">';
    for (const [key, sub] of Object.entries(tabData.subs)) {
      html += `<div class="help-sub-btn" style="background:linear-gradient(135deg,#2c3e50,#1a252f); border:1px solid #555; border-radius:10px; padding:14px 24px; cursor:pointer; text-align:center; min-width:100px; transition:all 0.2s;"
        onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='#ffcc88';"
        onmouseout="this.style.transform='';this.style.borderColor='#555';"
        onclick="helpNavigate('${helpState.activeTab}','${key}')">
        <div style="font-size:16px;">${sub.label}</div>
      </div>`;
    }
    html += '</div>';
    // 返回按钮
    html += `<div style="text-align:center; margin-top:20px;">
      <button onclick="helpNavigate()" style="background:#555; color:white; border:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:14px;">← 返回帮助菜单</button>
    </div>`;
  } else if (!helpState.activeSubSub) {
    // 显示三级标签
    const tabData = HELP_DATA[helpState.activeTab];
    const subData = tabData.subs[helpState.activeSub];
    // 如果 subData 有 subs，显示三级按钮列表
    if (subData.subs) {
      html += `<h3 style="text-align:center; color:#ddd; margin-bottom:16px;">${subData.label}</h3>`;
      html += '<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">';
      for (const [key, subSub] of Object.entries(subData.subs)) {
        html += `<div class="help-subsub-btn" style="background:linear-gradient(135deg,#2c3e50,#1a252f); border:1px solid #555; border-radius:10px; padding:12px 20px; cursor:pointer; text-align:center; min-width:80px; transition:all 0.2s;"
          onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='#ffcc88';"
          onmouseout="this.style.transform='';this.style.borderColor='#555';"
          onclick="helpNavigate('${helpState.activeTab}','${helpState.activeSub}','${key}')">
          <div style="font-size:14px;">${subSub.label}</div>
        </div>`;
      }
      html += '</div>';
      // 返回按钮
      html += `<div style="text-align:center; margin-top:20px;">
        <button onclick="helpNavigate('${helpState.activeTab}')" style="background:#555; color:white; border:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:14px;">← 返回</button>
      </div>`;
    } else {
      // 没有 subs，直接显示内容
      html += subData.content;
      // 返回按钮
      html += `<div style="text-align:center; margin-top:20px;">
        <button onclick="helpNavigate('${helpState.activeTab}')" style="background:#555; color:white; border:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:14px;">← 返回</button>
      </div>`;
    }
  } else {
    // 显示内容（四级内容）
    const tabData = HELP_DATA[helpState.activeTab];
    const subData = tabData.subs[helpState.activeSub];
    const subSubData = subData.subs[helpState.activeSubSub];
    html += subSubData.content;
    // 返回按钮
    html += `<div style="text-align:center; margin-top:20px;">
      <button onclick="helpNavigate('${helpState.activeTab}','${helpState.activeSub}')" style="background:#555; color:white; border:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:14px;">← 返回</button>
    </div>`;
  }

  html += '</div>';
  contentDiv.innerHTML = html;
}

// ---------- 全局导航函数 ----------
window.helpNavigate = function(tab, sub, subSub) {
  helpState.activeTab = tab || null;
  helpState.activeSub = sub || null;
  helpState.activeSubSub = subSub || null;
  renderHelpPanel();
};

// ---------- 创建帮助面板 ----------
function createHelpPanel() {
  if (document.getElementById('help-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'help-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    max-width: 90vw;
    background: rgba(20,20,30,0.97);
    color: white;
    border: 2px solid #ffcc8844;
    border-radius: 16px;
    padding: 0;
    z-index: 3000;
    display: none;
    font-family: 'Segoe UI';
    box-shadow: 0 0 40px rgba(0,0,0,0.6);
    overflow: hidden;
  `;
  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.1);">
      <div style="font-size:20px; color:#ffcc88;">📖 游戏帮助</div>
      <div style="display:flex; gap:8px;">
        <button id="help-back-btn" style="background:#555; color:white; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:13px; display:none;">← 返回</button>
        <button id="help-close-btn" style="background:#e74c3c; color:white; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:13px;">✕ 关闭</button>
      </div>
    </div>
    <div id="help-content"></div>
  `;
  document.body.appendChild(panel);

  document.getElementById('help-close-btn').addEventListener('click', () => toggleHelpPanel(false));
  document.getElementById('help-back-btn').addEventListener('click', () => {
    if (helpState.activeSubSub) {
      helpNavigate(helpState.activeTab, helpState.activeSub);
    } else if (helpState.activeSub) {
      helpNavigate(helpState.activeTab);
    } else if (helpState.activeTab) {
      helpNavigate();
    }
  });
}

// ---------- 切换帮助面板 ----------
export function toggleHelpPanel(show = null) {
  window.toggleHelpPanel = toggleHelpPanel;
  createHelpPanel();
  const panel = document.getElementById('help-panel');
  if (!panel) return;
  if (show === false || (panel.style.display === 'block' && show !== true)) {
    panel.style.display = 'none';
    helpState = { activeTab: null, activeSub: null, activeSubSub: null };
  } else {
    helpState = { activeTab: null, activeSub: null, activeSubSub: null };
    renderHelpPanel();
    panel.style.display = 'block';
  }
}
 