export default {
    label: '⚡ 魂技',
    subs: {
      概率规则: {
        label: '概率规则',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">🎲</div>
            <h3 style="color:#f1c40f; margin:0;">魂技概率规则</h3>
          </div>
          <p>魂技实际触发概率受出战系别影响：</p>
          <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
            <tr style="background:linear-gradient(90deg,#f1c40f,#f39c12); color:#222;">
              <th style="padding:10px 12px; border-radius:8px 0 0 0;">出战选择</th>
              <th style="padding:10px 12px;">主系魂技</th>
              <th style="padding:10px 12px;">副系魂技</th>
              <th style="padding:10px 12px; border-radius:0 8px 0 0;">其他</th>
            </tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;  color:#2ecc71;">主系出战</td><td style="padding:8px 12px; text-align:center;">100%</td><td style="padding:8px 12px; text-align:center;">80%</td><td style="padding:8px 12px; text-align:center;">50%</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center; border-radius:0 0 0 8px;  color:#3498db;">副系出战</td><td style="padding:8px 12px; text-align:center;">80%</td><td style="padding:8px 12px; text-align:center;">80%</td><td style="padding:8px 12px; text-align:center; border-radius:0 0 8px 0;">50%</td></tr>
          </table>
          <div style="background:rgba(241,196,15,0.1); border-left:4px solid #f1c40f; padding:12px 16px; border-radius:0 8px 8px 0;">
            💡 通用被动魂技不受此规则影响，必定触发。
          </div>
        `
      },
      被动魂技: {
        label: '被动魂技',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">🛌</div>
            <h3 style="color:#9b59b6; margin:0;">通用被动魂技</h3>
          </div>
          <p>以下魂技为被动魂技，战斗开始时自动触发，不消耗魂力，不占用主动魂技位，可叠加。</p>
          <div style="display:flex; gap:12px; margin:16px 0; flex-wrap:wrap; justify-content:center;">
            <div style="background:linear-gradient(135deg,#e74c3c,#c0392b); border-radius:12px; padding:16px 24px; text-align:center; min-width:140px; box-shadow:0 4px 15px rgba(231,76,60,0.3);">
              <div style="font-size:32px;">💪</div>
              <div style="font-size:18px;  margin:4px 0;">增力</div>
              <div style="font-size:12px; opacity:0.8;">战斗开始时力量 +1</div>
            </div>
            <div style="background:linear-gradient(135deg,#3498db,#2980b9); border-radius:12px; padding:16px 24px; text-align:center; min-width:140px; box-shadow:0 4px 15px rgba(52,152,219,0.3);">
              <div style="font-size:32px;">💨</div>
              <div style="font-size:18px;  margin:4px 0;">增速</div>
              <div style="font-size:12px; opacity:0.8;">战斗开始时速度 +1</div>
            </div>
            <div style="background:linear-gradient(135deg,#2ecc71,#27ae60); border-radius:12px; padding:16px 24px; text-align:center; min-width:140px; box-shadow:0 4px 15px rgba(46,204,113,0.3);">
              <div style="font-size:32px;">🧠</div>
              <div style="font-size:18px;  margin:4px 0;">增智</div>
              <div style="font-size:12px; opacity:0.8;">战斗开始时智力 +1</div>
            </div>
          </div>
        `
      },
      各系魂技: {
        label: '各系魂技',
        subs: {
          烈焰: {
            label: '🔥 烈焰',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">🔥</div>
                <h3 style="color:#e74c3c; margin:0;">烈焰系魂技</h3>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#e74c3c,#c0392b); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">魂技</th>
                  <th style="padding:10px 12px;">消耗</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">效果</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; ">灼烧</td><td style="padding:10px 12px; text-align:center;">1SP</td><td style="padding:10px 12px;">普攻并100%为目标附加燃烧（每回合50%掉1HP，累计2次后移除）</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:10px 12px; ">爆裂</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px;">普攻攻击1名敌人，然后100%为随机2名其他敌人附加燃烧标记</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; border-radius:0 0 0 8px; ">浓烟弥漫</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px; border-radius:0 0 8px 0;">普攻并以100%概率为攻击范围内随机2名敌人附加烟雾（智力-2）</td></tr>
              </table>
            `
          },
          苍木: {
            label: '🌿 苍木',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">🌿</div>
                <h3 style="color:#27ae60; margin:0;">苍木系魂技</h3>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#27ae60,#1e8449); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">魂技</th>
                  <th style="padding:10px 12px;">消耗</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">效果</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; ">缠绕</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px;">普攻并100%附加缠绕（被缠绕者普攻无法造成伤害，持续1回合）</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:10px 12px; ">复生</td><td style="padding:10px 12px; text-align:center;">3SP</td><td style="padding:10px 12px;">50%为目标回复1点生命，然后100%附加复生标记（每回合结束50%回复1HP）</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; border-radius:0 0 0 8px; ">蔓延</td><td style="padding:10px 12px; text-align:center;">3SP</td><td style="padding:10px 12px; border-radius:0 0 8px 0;">100%本场攻击距离永久+2</td></tr>
              </table>
            `
          },
          蛊毒: {
            label: '☠️ 蛊毒',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">☠️</div>
                <h3 style="color:#8e44ad; margin:0;">蛊毒系魂技</h3>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#8e44ad,#6c3483); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">魂技</th>
                  <th style="padding:10px 12px;">消耗</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">效果</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; ">中毒</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px;">普攻并100%为目标附加中毒（每回合50%掉1HP，累计2次后移除）</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:10px 12px; ">扩散</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px;">普攻+对全场所有角色100%概率附加中毒标记，对己方所有中毒角色100%附加激发标记（智力+3，本场战斗）</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; border-radius:0 0 0 8px; ">驱毒</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px; border-radius:0 0 8px 0;">100%驱散我方所有角色中毒标记（每个角色独立结算概率）</td></tr>
              </table>
            `
          },
          巨兽: {
            label: '🦁 巨兽',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">🦁</div>
                <h3 style="color:#d35400; margin:0;">巨兽系魂技</h3>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#d35400,#a04000); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">魂技</th>
                  <th style="padding:10px 12px;">消耗</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">效果</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; ">蛮力</td><td style="padding:10px 12px; text-align:center;">1SP</td><td style="padding:10px 12px;">普攻并100%额外+1伤害</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:10px 12px; ">肉盾</td><td style="padding:10px 12px; text-align:center;">1SP</td><td style="padding:10px 12px;">100%为自身添加肉盾标记，每回合抵挡1点伤害（本场，不可叠加）</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; border-radius:0 0 0 8px; ">兽王</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px; border-radius:0 0 8px 0;">100%自身免疫控制（本场）</td></tr>
              </table>
            `
          },
          雷霆: {
            label: '⚡ 雷霆',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">⚡</div>
                <h3 style="color:#f1c40f; margin:0;">雷霆系魂技</h3>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#f1c40f,#d4ac0d); color:#222;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">魂技</th>
                  <th style="padding:10px 12px;">消耗</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">效果</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; ">雷神变</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px;">普攻，若命中则50%概率额外攻击1个目标</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:10px 12px; ">雷霆万钧</td><td style="padding:10px 12px; text-align:center;">3SP</td><td style="padding:10px 12px;">普攻，50%概率额外溅射2个目标（无距离限制）</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; border-radius:0 0 0 8px; ">柔骨锁</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px; border-radius:0 0 8px 0;">普攻并100%附加锁链（目标无法使用魂技2回合）</td></tr>
              </table>
            `
          },
          沧澜: {
            label: '🌊 沧澜',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">🌊</div>
                <h3 style="color:#3498db; margin:0;">沧澜系魂技</h3>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#3498db,#2980b9); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">魂技</th>
                  <th style="padding:10px 12px;">消耗</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">效果</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; ">海渊迟滞</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px;">普攻并以100%概率为攻击范围内2名敌人添加迟滞标记（速度-2）</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:10px 12px; ">痊愈</td><td style="padding:10px 12px; text-align:center;">3SP</td><td style="padding:10px 12px;">50%概率为每个存活队友回复1HP</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; border-radius:0 0 0 8px; ">净化</td><td style="padding:10px 12px; text-align:center;">3SP</td><td style="padding:10px 12px; border-radius:0 0 8px 0;">100%驱除本方所有负面状态（缠绕/锁链/中毒/燃烧/烟雾/迟滞）</td></tr>
              </table>
            `
          },
          天工: {
            label: '⚙️ 天工',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">⚙️</div>
                <h3 style="color:#95a5a6; margin:0;">天工系魂技</h3>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#95a5a6,#7f8c8d); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">魂技</th>
                  <th style="padding:10px 12px;">消耗</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">效果</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; ">治疗</td><td style="padding:10px 12px; text-align:center;">2SP</td><td style="padding:10px 12px;">50%回复2点HP</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:10px 12px; ">一曰力</td><td style="padding:10px 12px; text-align:center;">3SP</td><td style="padding:10px 12px;">50%附加巨力（本场力量+3），七宝琉璃塔天赋可使概率翻倍</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:10px 12px; border-radius:0 0 0 8px; ">二曰速</td><td style="padding:10px 12px; text-align:center;">3SP</td><td style="padding:10px 12px; border-radius:0 0 8px 0;">50%附加极速（本场速度+3），七宝琉璃塔天赋可使概率翻倍</td></tr>
              </table>
            `
          }
        }
      },
      天赋效果: {
        label: '天赋效果',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">🌟</div>
            <h3 style="color:#ffcc88; margin:0;">天赋效果（武魂专属）</h3>
          </div>
          <p>以下天赋在战斗中自动生效：</p>
          <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
            <tr style="background:linear-gradient(90deg,#ffcc88,#e6a84c); color:#222;">
              <th style="padding:8px 10px; border-radius:8px 0 0 0;">武魂</th>
              <th style="padding:8px 10px;">天赋</th>
              <th style="padding:8px 10px; border-radius:0 8px 0 0;">效果</th>
            </tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px;">蓝电霸王龙</td><td style="padding:6px 10px; ">雷电掌控</td><td style="padding:6px 10px;">雷霆系魂技魂力消耗-1</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px;">柔骨兔</td><td style="padding:6px 10px; ">柔骨迅击</td><td style="padding:6px 10px;">前两回合攻击距离+2</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px;">幽冥灵猫</td><td style="padding:6px 10px; ">幽冥疾步</td><td style="padding:6px 10px;">攻击距离永久+1</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px;">海神</td><td style="padding:6px 10px; ">海神亲和</td><td style="padding:6px 10px;">沧澜系魂技魂力消耗-1</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px;">邪火凤凰</td><td style="padding:6px 10px; ">邪火余烬</td><td style="padding:6px 10px;">攻击时为目标附加燃烧标记</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px;">蓝银草</td><td style="padding:6px 10px; ">蓝银领域</td><td style="padding:6px 10px;">使用缠绕时无距离限制，首回合使用缠绕可额外缠绕1名目标（只缠绕不普攻）</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px;">奇茸通天菊</td><td style="padding:6px 10px; ">奇茸巨力</td><td style="padding:6px 10px;">战斗开始自身力量+2</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px;">九心海棠</td><td style="padding:6px 10px; ">九心芬芳</td><td style="padding:6px 10px;">前三回合治疗类魂技额外指定1名目标</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px;">治愈权杖</td><td style="padding:6px 10px; ">治愈祈愿</td><td style="padding:6px 10px;">前三回合治疗类魂技对每个目标50%概率额外回复2HP</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px;">碧磷蛇皇</td><td style="padding:6px 10px; ">碧磷毒尊</td><td style="padding:6px 10px;">蛊毒系魂技魂力消耗-1</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px;">鬼王</td><td style="padding:6px 10px; ">鬼影潜行</td><td style="padding:6px 10px;">攻击距离永久+1</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px;">邪眸白虎</td><td style="padding:6px 10px; ">霸体</td><td style="padding:6px 10px;">免疫控制</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px;">骨龙</td><td style="padding:6px 10px; ">骨毒反噬</td><td style="padding:6px 10px;">受到攻击时反击中毒标记</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px;">七杀剑</td><td style="padding:6px 10px; ">七杀锋芒</td><td style="padding:6px 10px;">攻击命中时50%概率额外+2伤害</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px;">昊天锤</td><td style="padding:6px 10px; ">乱披风</td><td style="padding:6px 10px;">攻击命中时25%概率立即额外执行1次普通攻击</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px;">七宝琉璃塔</td><td style="padding:6px 10px; ">七宝增幅</td><td style="padding:6px 10px;">天工系魂技成功率翻倍</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px; border-radius:0 0 0 8px;">香肠</td><td style="padding:6px 10px; border-radius:0 0 0 8px; ">香肠滋补</td><td style="padding:6px 10px; border-radius:0 0 8px 0;">前三回合治疗类魂技额外指定1名目标，并对每个目标额外回复1点魂力</td></tr>
          </table>
        `
      },
      状态标记: {
        label: '状态标记',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">🏷️</div>
            <h3 style="color:#1abc9c; margin:0;">状态标记说明</h3>
          </div>
          <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
            <tr style="background:linear-gradient(90deg,#1abc9c,#16a085); color:white;">
              <th style="padding:8px 10px; border-radius:8px 0 0 0;">标记</th>
              <th style="padding:8px 10px; border-radius:0 8px 0 0;">效果</th>
            </tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px; ">缠绕</td><td style="padding:6px 10px;">无法行动，普攻无法造成伤害（持续1回合）</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px; ">柔骨锁</td><td style="padding:6px 10px;">无法使用魂技（持续2回合）</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px; ">中毒</td><td style="padding:6px 10px;">每回合开始50%掉1HP，累计2次移除</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px; ">燃烧</td><td style="padding:6px 10px;">每回合开始50%掉1HP，累计2次移除</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px; ">烟雾</td><td style="padding:6px 10px;">智力-2（本场）</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px; ">复生</td><td style="padding:6px 10px;">每回合结束50%回复1HP（本场）</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px; ">兽王</td><td style="padding:6px 10px;">免疫控制（本场）</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px; ">肉盾</td><td style="padding:6px 10px;">每回合抵挡1点伤害（本场，不可叠加）</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px; ">巨力</td><td style="padding:6px 10px;">力量+3（本场）</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px; ">极速</td><td style="padding:6px 10px;">速度+3（本场）</td></tr>
            <tr style="background:rgba(255,255,255,0.03);"><td style="padding:6px 10px; ">迟滞</td><td style="padding:6px 10px;">速度-2（本场）</td></tr>
            <tr style="background:rgba(255,255,255,0.06);"><td style="padding:6px 10px; border-radius:0 0 0 8px; ">激发</td><td style="padding:6px 10px; border-radius:0 0 8px 0;">智力+3（本场），简称"激"</td></tr>
          </table>
        `
      }
    }
  }
 