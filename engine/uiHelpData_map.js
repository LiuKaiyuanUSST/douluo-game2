export default {
    label: '🗺️ 地图关卡',
    subs: {
      stages: {
        label: '关卡列表',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">🗺️</div>
            <h3 style="color:#2ecc71; margin:0;">关卡列表</h3>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; margin:16px 0;">
            <div style="background:linear-gradient(135deg,#1b3d2d,#0f2a1a); border-radius:10px; padding:12px 16px; border:1px solid #2ecc7144;">
              <div style="font-weight:bold; color:#2ecc71;">第1关 · 星斗森林外围</div>
              <div style="font-size:13px; color:#aaa;">初始关卡，熟悉战斗系统</div>
            </div>
            <div style="background:linear-gradient(135deg,#1b3d2d,#0f2a1a); border-radius:10px; padding:12px 16px; border:1px solid #2ecc7144;">
              <div style="font-weight:bold; color:#2ecc71;">第2关 · 星斗森林深处</div>
              <div style="font-size:13px; color:#aaa;">遭遇更强魂兽</div>
            </div>
            <div style="background:linear-gradient(135deg,#1b3d2d,#0f2a1a); border-radius:10px; padding:12px 16px; border:1px solid #2ecc7144;">
              <div style="font-weight:bold; color:#2ecc71;">第3关 · 落日森林</div>
              <div style="font-size:13px; color:#aaa;">多波次战斗</div>
            </div>
            <div style="background:linear-gradient(135deg,#1b3d2d,#0f2a1a); border-radius:10px; padding:12px 16px; border:1px solid #2ecc7144;">
              <div style="font-weight:bold; color:#2ecc71;">第4关 · 武魂殿外围</div>
              <div style="font-size:13px; color:#aaa;">遭遇人形敌人</div>
            </div>
            <div style="background:linear-gradient(135deg,#1b3d2d,#0f2a1a); border-radius:10px; padding:12px 16px; border:1px solid #2ecc7144;">
              <div style="font-weight:bold; color:#2ecc71;">第5关 · 武魂殿</div>
              <div style="font-size:13px; color:#aaa;">最终关卡，Boss战</div>
            </div>
          </div>
        `
      },
      maze: {
        label: '迷宫机制',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">🌀</div>
            <h3 style="color:#f1c40f; margin:0;">迷宫机制</h3>
          </div>
          <p>关卡为迷宫形式，包含以下元素：</p>
          <div style="display:flex; gap:10px; margin:16px 0; flex-wrap:wrap; justify-content:center;">
            <div style="background:rgba(231,76,60,0.15); border:1px solid #e74c3c44; border-radius:8px; padding:10px 16px; text-align:center;">
              <div style="font-size:24px;">👾</div>
              <div style="font-size:13px;">敌人</div>
            </div>
            <div style="background:rgba(46,204,113,0.15); border:1px solid #2ecc7144; border-radius:8px; padding:10px 16px; text-align:center;">
              <div style="font-size:24px;">🎁</div>
              <div style="font-size:13px;">宝箱</div>
            </div>
            <div style="background:rgba(52,152,219,0.15); border:1px solid #3498db44; border-radius:8px; padding:10px 16px; text-align:center;">
              <div style="font-size:24px;">🚪</div>
              <div style="font-size:13px;">出口</div>
            </div>
            <div style="background:rgba(155,89,182,0.15); border:1px solid #9b59b644; border-radius:8px; padding:10px 16px; text-align:center;">
              <div style="font-size:24px;">💬</div>
              <div style="font-size:13px;">事件</div>
            </div>
          </div>
        `
      }
    }
  }