export default {
    label: '🌀 武魂',
    subs: {
      categories: {
        label: '系别分类',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">🌀</div>
            <h3 style="color:#ffcc88; margin:0;">武魂系别分类</h3>
          </div>
          <p>武魂分为七大系别：</p>
          <div style="display:flex; flex-wrap:wrap; gap:10px; margin:16px 0; justify-content:center;">
            <div style="background:linear-gradient(135deg,#e74c3c,#c0392b); border-radius:10px; padding:12px 20px; text-align:center; min-width:100px; box-shadow:0 3px 10px rgba(231,76,60,0.3);">
              <div style="font-size:28px;">🔥</div>
              <div style="font-weight:bold;">烈焰</div>
              <div style="font-size:12px; opacity:0.8;">火系</div>
            </div>
            <div style="background:linear-gradient(135deg,#27ae60,#1e8449); border-radius:10px; padding:12px 20px; text-align:center; min-width:100px; box-shadow:0 3px 10px rgba(39,174,96,0.3);">
              <div style="font-size:28px;">🌿</div>
              <div style="font-weight:bold;">苍木</div>
              <div style="font-size:12px; opacity:0.8;">木系</div>
            </div>
            <div style="background:linear-gradient(135deg,#8e44ad,#6c3483); border-radius:10px; padding:12px 20px; text-align:center; min-width:100px; box-shadow:0 3px 10px rgba(142,68,173,0.3);">
              <div style="font-size:28px;">☠️</div>
              <div style="font-weight:bold;">蛊毒</div>
              <div style="font-size:12px; opacity:0.8;">毒系</div>
            </div>
            <div style="background:linear-gradient(135deg,#d35400,#a04000); border-radius:10px; padding:12px 20px; text-align:center; min-width:100px; box-shadow:0 3px 10px rgba(211,84,0,0.3);">
              <div style="font-size:28px;">🦁</div>
              <div style="font-weight:bold;">巨兽</div>
              <div style="font-size:12px; opacity:0.8;">兽系</div>
            </div>
            <div style="background:linear-gradient(135deg,#f1c40f,#d4ac0d); border-radius:10px; padding:12px 20px; text-align:center; min-width:100px; box-shadow:0 3px 10px rgba(241,196,15,0.3);">
              <div style="font-size:28px;">⚡</div>
              <div style="font-weight:bold;">雷霆</div>
              <div style="font-size:12px; opacity:0.8;">雷系</div>
            </div>
            <div style="background:linear-gradient(135deg,#3498db,#2980b9); border-radius:10px; padding:12px 20px; text-align:center; min-width:100px; box-shadow:0 3px 10px rgba(52,152,219,0.3);">
              <div style="font-size:28px;">🌊</div>
              <div style="font-weight:bold;">沧澜</div>
              <div style="font-size:12px; opacity:0.8;">水系</div>
            </div>
            <div style="background:linear-gradient(135deg,#95a5a6,#7f8c8d); border-radius:10px; padding:12px 20px; text-align:center; min-width:100px; box-shadow:0 3px 10px rgba(149,165,166,0.3);">
              <div style="font-size:28px;">⚙️</div>
              <div style="font-weight:bold;">天工</div>
              <div style="font-size:12px; opacity:0.8;">独立体系</div>
            </div>
          </div>
        `
      },
      chain: {
        label: '循环克制',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">🔄</div>
            <h3 style="color:#ffcc88; margin:0;">循环克制链</h3>
          </div>
          <div style="background:linear-gradient(135deg,#1a1a2e,#16213e); border-radius:16px; padding:24px; margin:16px 0; border:2px solid #ffcc8844; text-align:center;">
            <div style="font-size:18px; font-weight:bold; color:#ffcc88; letter-spacing:2px;">
              🔥 烈焰 → 🌿 苍木 → ☠️ 蛊毒 → 🦁 巨兽 → ⚡ 雷霆 → 🌊 沧澜 → 🔥 烈焰
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; justify-content:center;">
            <div style="background:rgba(231,76,60,0.15); border:1px solid #e74c3c44; border-radius:8px; padding:8px 14px; font-size:13px;">🔥 烈焰克制苍木</div>
            <div style="background:rgba(39,174,96,0.15); border:1px solid #27ae6044; border-radius:8px; padding:8px 14px; font-size:13px;">🌿 苍木克制蛊毒</div>
            <div style="background:rgba(142,68,173,0.15); border:1px solid #8e44ad44; border-radius:8px; padding:8px 14px; font-size:13px;">☠️ 蛊毒克制巨兽</div>
            <div style="background:rgba(211,84,0,0.15); border:1px solid #d3540044; border-radius:8px; padding:8px 14px; font-size:13px;">🦁 巨兽克制雷霆</div>
            <div style="background:rgba(241,196,15,0.15); border:1px solid #f1c40f44; border-radius:8px; padding:8px 14px; font-size:13px;">⚡ 雷霆克制沧澜</div>
            <div style="background:rgba(52,152,219,0.15); border:1px solid #3498db44; border-radius:8px; padding:8px 14px; font-size:13px;">🌊 沧澜克制烈焰</div>
          </div>
          <div style="background:rgba(149,165,166,0.1); border-left:4px solid #95a5a6; padding:12px 16px; border-radius:0 8px 8px 0; margin-top:12px;">
            ⚙️ 天工系不参与此循环克制链。
          </div>
        `
      },
      effect: {
        label: '克制效果',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">💥</div>
            <h3 style="color:#e74c3c; margin:0;">克制效果</h3>
          </div>
          <div style="background:linear-gradient(135deg,#2d1b1b,#1a0f0f); border-radius:12px; padding:20px; margin:16px 0; border:1px solid #e74c3c44;">
            <p style="font-size:18px; text-align:center;">当攻击方系别克制防御方系别时，每回合攻击有 <strong style="color:#ff6b6b;">50%</strong> 概率额外增加 <strong style="color:#ff6b6b;">1</strong> 点伤害。</p>
          </div>
          <ul style="color:#ccc; line-height:2;">
            <li>该判定独立于攻击掷骰和防御减伤。</li>
            <li>若触发，在计算完所有攻防数值后，最终伤害 +1。</li>
            <li>此额外伤害不受减伤影响。</li>
          </ul>
        `
      },
      tiangong: {
        label: '天工特性',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">⚙️</div>
            <h3 style="color:#95a5a6; margin:0;">天工系特性</h3>
          </div>
          <div style="display:flex; gap:16px; margin:16px 0; flex-wrap:wrap; justify-content:center;">
            <div style="background:linear-gradient(135deg,#2c3e50,#1a252f); border-radius:12px; padding:20px; text-align:center; flex:1; min-width:200px; border:1px solid #95a5a644;">
              <div style="font-size:36px;">🚫</div>
              <div style="font-weight:bold; margin:8px 0;">不克制任何系</div>
              <div style="font-size:13px; color:#aaa;">也不被任何系克制</div>
            </div>
            <div style="background:linear-gradient(135deg,#2c3e50,#1a252f); border-radius:12px; padding:20px; text-align:center; flex:1; min-width:200px; border:1px solid #95a5a644;">
              <div style="font-size:36px;">🍀</div>
              <div style="font-weight:bold; margin:8px 0;">5% 概率免伤</div>
              <div style="font-size:13px; color:#aaa;">受到的所有系别伤害</div>
            </div>
          </div>
        `
      },
     出战规则: {
        label: '出战规则',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">⚔️</div>
            <h3 style="color:#ffcc88; margin:0;">主副系与出战规则</h3>
          </div>
          <p>每名角色有固定的主系和副系。战斗前必须选择其一出战：</p>
          <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
            <tr style="background:linear-gradient(90deg,#8e44ad,#6c3483); color:white;">
              <th style="padding:10px 12px; border-radius:8px 0 0 0;">出战选择</th>
              <th style="padding:10px 12px;">主系魂技</th>
              <th style="padding:10px 12px;">副系魂技</th>
              <th style="padding:10px 12px; border-radius:0 8px 0 0;">其他五系</th>
            </tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center; font-weight:bold; color:#2ecc71;">主系出战</td><td style="padding:8px 12px; text-align:center;">100%</td><td style="padding:8px 12px; text-align:center;">80%</td><td style="padding:8px 12px; text-align:center;">50%</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center; border-radius:0 0 0 8px; font-weight:bold; color:#3498db;">副系出战</td><td style="padding:8px 12px; text-align:center;">80%</td><td style="padding:8px 12px; text-align:center;">80%</td><td style="padding:8px 12px; text-align:center; border-radius:0 0 8px 0;">50%</td></tr>
          </table>
        `
      }
    }
  } 