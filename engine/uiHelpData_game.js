export default {
    label: '🎮 游戏机制',
    subs: {
      formation: {
        label: '阵型系统',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">📐</div>
            <h3 style="color:#1abc9c; margin:0;">阵型系统</h3>
          </div>
          <p>战斗前可选择阵型，影响角色站位：</p>
          <div style="display:flex; gap:12px; margin:16px 0; flex-wrap:wrap; justify-content:center;">
            <div style="background:linear-gradient(135deg,#1b3d2d,#0f2a1a); border-radius:10px; padding:14px 20px; text-align:center; min-width:160px; border:1px solid #1abc9c44;">
              <div style="font-size:24px;">⬆️⬆️⬆️</div>
              <div style=" margin:4px 0;">前-前-前</div>
              <div style="font-size:12px; color:#aaa;">全前排</div>
            </div>
            <div style="background:linear-gradient(135deg,#1b3d2d,#0f2a1a); border-radius:10px; padding:14px 20px; text-align:center; min-width:160px; border:1px solid #1abc9c44;">
              <div style="font-size:24px;">⬆️⬆️⬇️</div>
              <div style=" margin:4px 0;">前-前-后</div>
              <div style="font-size:12px; color:#aaa;">两前一后</div>
            </div>
            <div style="background:linear-gradient(135deg,#1b3d2d,#0f2a1a); border-radius:10px; padding:14px 20px; text-align:center; min-width:160px; border:1px solid #1abc9c44;">
              <div style="font-size:24px;">⬆️⬇️⬆️</div>
              <div style=" margin:4px 0;">前-后-前</div>
              <div style="font-size:12px; color:#aaa;">前后前</div>
            </div>
          </div>
          <p style="color:#aaa; font-size:13px;">后排角色受到攻击时，有概率由前排角色代为承受。</p>
        `
      },
      items: {
        label: '道具系统',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">🎒</div>
            <h3 style="color:#e67e22; margin:0;">道具系统</h3>
          </div>
          <div style="display:flex; gap:16px; margin:16px 0; flex-wrap:wrap; justify-content:center;">
            <div style="background:linear-gradient(135deg,#6c3483,#4a235a); border-radius:12px; padding:16px 24px; text-align:center; min-width:160px; box-shadow:0 4px 15px rgba(108,52,131,0.3);">
              <div style="font-size:36px;">🌿</div>
              <div style="font-size:18px;  margin:4px 0;">九品紫芝</div>
              <div style="font-size:13px; opacity:0.8;">使用后全属性 +1</div>
            </div>
            <div style="background:linear-gradient(135deg,#2c3e50,#1a252f); border-radius:12px; padding:16px 24px; text-align:center; min-width:160px; box-shadow:0 4px 15px rgba(44,62,80,0.3);">
              <div style="font-size:36px;">💀</div>
              <div style="font-size:18px;  margin:4px 0;">忘魂草</div>
              <div style="font-size:13px; opacity:0.8;">使用后重置属性点</div>
            </div>
          </div>
        `
      },
      affinity: {
        label: '好感度系统',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">💕</div>
            <h3 style="color:#e91e63; margin:0;">好感度系统</h3>
          </div>
          <p>通过与伙伴对话、完成事件可提升好感度。</p>
          <p>好感度达到一定值后，可解锁特殊剧情和奖励。</p>
          <div style="background:linear-gradient(135deg,#2d1b2d,#1a0f1a); border-radius:12px; padding:20px; margin:16px 0; border:1px solid #e91e6344;">
            <p style="text-align:center; font-size:16px;">💡 好感度影响伙伴是否愿意加入队伍</p>
          </div>
        `
      },
      level: {
        label: '等级系统',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">⬆️</div>
            <h3 style="color:#f1c40f; margin:0;">等级系统</h3>
          </div>
          <h4 style="color:#ffcc88; margin:16px 0 8px;">一、等级提升方式</h4>
          <ul style="color:#ccc; line-height:2;">
            <li><strong>主角等级：</strong>推进剧情即可提升主角等级。</li>
            <li><strong>其他角色等级：</strong>获得魂环可以提升其他角色的等级。</li>
            <li>每提升一级，角色可获得相应数量的武魂魂技。</li>
          </ul>
          <h4 style="color:#ffcc88; margin:16px 0 8px;">二、等级修正规则</h4>
          <p>以全场等级最高者为基准，计算等级差带来的属性修正：</p>
          <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
            <tr style="background:linear-gradient(90deg,#f1c40f,#f39c12); color:#222;">
              <th style="padding:10px 12px; border-radius:8px 0 0 0;">等级差</th>
              <th style="padding:10px 12px; border-radius:0 8px 0 0;">属性修正</th>
            </tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;">低 1 级</td><td style="padding:8px 12px;">力量 -1，速度 -1</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center;">低 2 级</td><td style="padding:8px 12px;">力量 -2，速度 -2，智力 -1</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center; border-radius:0 0 0 8px;">低 n 级 (n ≥ 3)</td><td style="padding:8px 12px; border-radius:0 0 8px 0;">力、速、智各减 n（最小为 0）</td></tr>
          </table>
        `
      },
      resurrection: {
        label: '复活机制',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">💀</div>
            <h3 style="color:#9b59b6; margin:0;">复活机制</h3>
          </div>
          <p>战斗中阵亡的角色，在战斗结束后自动复活。</p>
          <p>复活后生命值恢复至满。</p>
          <div style="background:linear-gradient(135deg,#2d1b3d,#1a0f2a); border-radius:12px; padding:20px; margin:16px 0; border:1px solid #9b59b644;">
            <p style="text-align:center; font-size:16px;">⚠️ 战斗中阵亡的角色无法在本场战斗中继续行动</p>
          </div>
        `
      }
    }
  } 