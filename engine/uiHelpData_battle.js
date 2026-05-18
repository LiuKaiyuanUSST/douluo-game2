export default {
    label: '🗡️ 战斗',
    subs: {
      baseStats: {
        label: '基础属性',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">📊</div>
            <h3 style="color:#ffcc88; margin:0;">基础属性</h3>
          </div>
          <p>每名角色拥有三项基础属性：<strong style="color:#e74c3c;">力量</strong>、<strong style="color:#3498db;">速度</strong>、<strong style="color:#2ecc71;">智力</strong>。</p>
          <p>每项属性取值范围为 <strong>0～7</strong>，三项总和固定为 <strong>9</strong>。</p>
          <div style="display:flex; gap:16px; margin:20px 0; flex-wrap:wrap; justify-content:center;">
            <div style="background:linear-gradient(135deg,#e74c3c,#c0392b); border-radius:12px; padding:16px 24px; text-align:center; min-width:120px; box-shadow:0 4px 15px rgba(231,76,60,0.3);">
              <div style="font-size:32px;">💪</div>
              <div style="font-size:20px; font-weight:bold; margin:4px 0;">力量</div>
              <div style="font-size:13px; opacity:0.8;">决定生命与攻击</div>
            </div>
            <div style="background:linear-gradient(135deg,#3498db,#2980b9); border-radius:12px; padding:16px 24px; text-align:center; min-width:120px; box-shadow:0 4px 15px rgba(52,152,219,0.3);">
              <div style="font-size:32px;">💨</div>
              <div style="font-size:20px; font-weight:bold; margin:4px 0;">速度</div>
              <div style="font-size:13px; opacity:0.8;">决定距离与顺序</div>
            </div>
            <div style="background:linear-gradient(135deg,#2ecc71,#27ae60); border-radius:12px; padding:16px 24px; text-align:center; min-width:120px; box-shadow:0 4px 15px rgba(46,204,113,0.3);">
              <div style="font-size:32px;">🧠</div>
              <div style="font-size:20px; font-weight:bold; margin:4px 0;">智力</div>
              <div style="font-size:13px; opacity:0.8;">决定防御与魂力</div>
            </div>
          </div>
        `
      },
      derivedStats: {
        label: '衍生属性',
        subs: {
          hp: {
            label: '❤️ 生命值',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">❤️</div>
                <h3 style="color:#ff6b6b; margin:0;">生命值</h3>
              </div>
              <div style="background:linear-gradient(135deg,#2d1b1b,#1a0f0f); border-radius:12px; padding:20px; margin:16px 0; border:1px solid #e74c3c44;">
                <div style="font-size:28px; text-align:center; color:#ff6b6b; font-weight:bold;">生命 = 力量 + 3</div>
                <p style="text-align:center; color:#aaa; margin-top:8px;">完全由力量单属性决定</p>
              </div>
              <div style="background:rgba(231,76,60,0.1); border-left:4px solid #e74c3c; padding:12px 16px; border-radius:0 8px 8px 0; margin-top:12px;">
                💡 <strong>示例：</strong>力量为 5 时，最大生命 = 5 + 3 = <strong style="color:#ff6b6b;">8</strong>
              </div>
            `
          },
          attack: {
            label: '⚔️ 攻击力',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">⚔️</div>
                <h3 style="color:#e74c3c; margin:0;">攻击力</h3>
              </div>
              <div style="background:linear-gradient(135deg,#2d1b1b,#1a0f0f); border-radius:12px; padding:20px; margin:16px 0; border:1px solid #e74c3c44;">
                <div style="font-size:20px; text-align:center; color:#ff8a80; font-weight:bold;">攻击能力值 = 力量 × 1.5 + 速度 × 0.5</div>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#e74c3c,#c0392b); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">攻击能力值</th>
                  <th style="padding:10px 12px;">档位</th>
                  <th style="padding:10px 12px;">伤害范围</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">期望伤害</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;">0</td><td style="padding:8px 12px; text-align:center;">0档</td><td style="padding:8px 12px; text-align:center;">1</td><td style="padding:8px 12px; text-align:center;">1.0</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center;">1～2</td><td style="padding:8px 12px; text-align:center;">1档</td><td style="padding:8px 12px; text-align:center;">1～2</td><td style="padding:8px 12px; text-align:center;">1.5</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;">3～4</td><td style="padding:8px 12px; text-align:center;">2档</td><td style="padding:8px 12px; text-align:center;">1～3</td><td style="padding:8px 12px; text-align:center;">2.0</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center;">5～6</td><td style="padding:8px 12px; text-align:center;">3档</td><td style="padding:8px 12px; text-align:center;">2～3</td><td style="padding:8px 12px; text-align:center;">2.5</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;">7～8</td><td style="padding:8px 12px; text-align:center;">4档</td><td style="padding:8px 12px; text-align:center;">2～4</td><td style="padding:8px 12px; text-align:center;">3.0</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center;">9～10</td><td style="padding:8px 12px; text-align:center;">5档</td><td style="padding:8px 12px; text-align:center;">3～4</td><td style="padding:8px 12px; text-align:center;">3.5</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center; border-radius:0 0 0 8px;">≥ 11</td><td style="padding:8px 12px; text-align:center;">6档</td><td style="padding:8px 12px; text-align:center;">3～5</td><td style="padding:8px 12px; text-align:center; border-radius:0 0 8px 0;">4.0</td></tr>
              </table>
              <p style="color:#aaa; font-size:13px;">伤害掷骰规则：伤害范围如「1～3」，表示从 {1, 2, 3} 中等概率随机取一个整数。</p>
            `
          },
          defense: {
            label: '🛡️ 防御力',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">🛡️</div>
                <h3 style="color:#3498db; margin:0;">防御力</h3>
              </div>
              <div style="background:linear-gradient(135deg,#1b2d3d,#0f1a2a); border-radius:12px; padding:20px; margin:16px 0; border:1px solid #3498db44;">
                <div style="font-size:20px; text-align:center; color:#64b5f6; font-weight:bold;">防御能力值 = 智力 × 1.5 + 力量 × 0.5</div>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#3498db,#2980b9); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">防御能力值</th>
                  <th style="padding:10px 12px;">档位</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">减伤效果</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;">0～3</td><td style="padding:8px 12px; text-align:center;">0档</td><td style="padding:8px 12px; text-align:center;">0（无减伤）</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center;">4～6</td><td style="padding:8px 12px; text-align:center;">1档</td><td style="padding:8px 12px; text-align:center;">0.5（50%概率减1）</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;">7～9</td><td style="padding:8px 12px; text-align:center;">2档</td><td style="padding:8px 12px; text-align:center;">1.0（固定减1）</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center; border-radius:0 0 0 8px;">≥ 10</td><td style="padding:8px 12px; text-align:center;">3档</td><td style="padding:8px 12px; text-align:center; border-radius:0 0 8px 0;">1.5（固定减1 + 50%概率额外减1）</td></tr>
              </table>
              <div style="background:rgba(52,152,219,0.1); border-left:4px solid #3498db; padding:12px 16px; border-radius:0 8px 8px 0; margin-top:12px;">
                💡 固定部分必定减免对应数值，概率部分独立判定，与伤害掷骰同时进行。
              </div>
            `
          },
          dodge: {
            label: '💨 闪避',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">💨</div>
                <h3 style="color:#9b59b6; margin:0;">闪避</h3>
              </div>
              <div style="background:linear-gradient(135deg,#2d1b3d,#1a0f2a); border-radius:12px; padding:20px; margin:16px 0; border:1px solid #9b59b644;">
                <div style="font-size:20px; text-align:center; color:#ce93d8; font-weight:bold;">灵巧 = 智力 + 速度</div>
                <div style="font-size:16px; text-align:center; color:#aaa; margin-top:8px;">灵巧差值 = 防守方灵巧 - 攻击方灵巧</div>
              </div>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#9b59b6,#8e44ad); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">灵巧差值</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">闪避概率</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;">≤ 2</td><td style="padding:8px 12px; text-align:center;">0%</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center;">3～5</td><td style="padding:8px 12px; text-align:center;">25%</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center; border-radius:0 0 0 8px;">≥ 6</td><td style="padding:8px 12px; text-align:center; border-radius:0 0 8px 0;">50%</td></tr>
              </table>
              <div style="background:rgba(155,89,182,0.1); border-left:4px solid #9b59b6; padding:12px 16px; border-radius:0 8px 8px 0; margin-top:12px;">
                ⚠️ 只有当防守方灵巧 <strong>高于</strong> 攻击方时，才可能触发闪避。<br>
                闪避成功 = 本次伤害为 0。先判定闪避，命中后再判定防御减伤。
              </div>
            `
          },
          range: {
            label: '🎯 攻击距离',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">🎯</div>
                <h3 style="color:#e67e22; margin:0;">攻击距离</h3>
              </div>
              <p>由速度单属性决定：</p>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#e67e22,#d35400); color:white;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">速度</th>
                  <th style="padding:10px 12px;">攻击距离</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">可攻击范围</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;">0～3</td><td style="padding:8px 12px; text-align:center;">1</td><td style="padding:8px 12px; text-align:center;">仅前1排</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center;">4～6</td><td style="padding:8px 12px; text-align:center;">2</td><td style="padding:8px 12px; text-align:center;">前2排</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center; border-radius:0 0 0 8px;">7～9</td><td style="padding:8px 12px; text-align:center;">3</td><td style="padding:8px 12px; text-align:center; border-radius:0 0 8px 0;">前3排</td></tr>
              </table>
              <div style="background:rgba(230,126,34,0.1); border-left:4px solid #e67e22; padding:12px 16px; border-radius:0 8px 8px 0; margin-top:12px;">
                💡 攻击距离差异可能导致<strong>远程白嫖</strong>——一方能攻击到另一方，而另一方无法反击。
              </div>
            `
          },
          spirit: {
            label: '✨ 魂力恢复',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">✨</div>
                <h3 style="color:#f1c40f; margin:0;">魂力恢复</h3>
              </div>
              <p>战斗开始时所有角色魂力为 <strong>0</strong>。</p>
              <p>魂力恢复由智力单属性决定：</p>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr style="background:linear-gradient(90deg,#f1c40f,#f39c12); color:#222;">
                  <th style="padding:10px 12px; border-radius:8px 0 0 0;">智力</th>
                  <th style="padding:10px 12px; border-radius:0 8px 0 0;">每回合开始恢复 SP</th>
                </tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center;">0～3</td><td style="padding:8px 12px; text-align:center;">1</td></tr>
                <tr style="background:rgba(255,255,255,0.06);"><td style="padding:8px 12px; text-align:center;">4～6</td><td style="padding:8px 12px; text-align:center;">2</td></tr>
                <tr style="background:rgba(255,255,255,0.03);"><td style="padding:8px 12px; text-align:center; border-radius:0 0 0 8px;">≥ 7</td><td style="padding:8px 12px; text-align:center; border-radius:0 0 8px 0;">3</td></tr>
              </table>
              <p style="color:#aaa; font-size:13px;">主动魂技消耗预计 1～3 SP，上限 3 SP。</p>
            `
          },
          turnOrder: {
            label: '🔄 攻击顺序',
            content: `
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:48px; margin-bottom:8px;">🔄</div>
                <h3 style="color:#1abc9c; margin:0;">攻击顺序</h3>
              </div>
              <div style="background:linear-gradient(135deg,#1b3d2d,#0f2a1a); border-radius:12px; padding:20px; margin:16px 0; border:1px solid #1abc9c44;">
                <p style="font-size:18px; text-align:center;">每回合按照<strong style="color:#1abc9c;">速度</strong>从高到低轮流行动。</p>
                <p style="font-size:16px; text-align:center; color:#aaa;">同速度者，行动顺序随机。</p>
              </div>
              <div style="display:flex; justify-content:center; gap:12px; margin:16px 0; flex-wrap:wrap;">
                <div style="background:rgba(26,188,156,0.15); border:1px solid #1abc9c44; border-radius:10px; padding:12px 20px; text-align:center;">
                  <div style="font-size:24px;">🥇</div>
                  <div style="font-size:14px; color:#1abc9c;">速度最高</div>
                  <div style="font-size:13px; color:#aaa;">先手行动</div>
                </div>
                <div style="background:rgba(26,188,156,0.15); border:1px solid #1abc9c44; border-radius:10px; padding:12px 20px; text-align:center;">
                  <div style="font-size:24px;">🥈</div>
                  <div style="font-size:14px; color:#1abc9c;">速度中等</div>
                  <div style="font-size:13px; color:#aaa;">中间行动</div>
                </div>
                <div style="background:rgba(26,188,156,0.15); border:1px solid #1abc9c44; border-radius:10px; padding:12px 20px; text-align:center;">
                  <div style="font-size:24px;">🥉</div>
                  <div style="font-size:14px; color:#1abc9c;">速度最低</div>
                  <div style="font-size:13px; color:#aaa;">后手行动</div>
                </div>
              </div>
            `
          }
        }
      },
      battleFlow: {
        label: '战斗结算',
        content: `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:48px; margin-bottom:8px;">⚡</div>
            <h3 style="color:#e74c3c; margin:0;">战斗结算顺序</h3>
          </div>
          <p style="text-align:center; color:#aaa; margin-bottom:16px;">每回合单次攻击的完整结算流程：</p>
          <div style="display:flex; flex-direction:column; gap:8px; max-width:500px; margin:0 auto;">
            <div style="background:linear-gradient(90deg,#e74c3c33,#e74c3c11); border-left:4px solid #e74c3c; padding:10px 16px; border-radius:0 8px 8px 0;">
              <strong>1.</strong> 判定闪避 → 闪避成功则伤害为 0，结算结束
            </div>
            <div style="background:linear-gradient(90deg,#e67e2233,#e67e2211); border-left:4px solid #e67e22; padding:10px 16px; border-radius:0 8px 8px 0;">
              <strong>2.</strong> 掷攻击伤害骰（等概率取伤害范围内的整数）
            </div>
            <div style="background:linear-gradient(90deg,#f1c40f33,#f1c40f11); border-left:4px solid #f1c40f; padding:10px 16px; border-radius:0 8px 8px 0;">
              <strong>3.</strong> 判定防御减伤（固定部分 + 概率部分）
            </div>
            <div style="background:linear-gradient(90deg,#2ecc7133,#2ecc7111); border-left:4px solid #2ecc71; padding:10px 16px; border-radius:0 8px 8px 0;">
              <strong>4.</strong> 计算净伤 = max(伤害 - 减伤, 0)
            </div>
            <div style="background:linear-gradient(90deg,#3498db33,#3498db11); border-left:4px solid #3498db; padding:10px 16px; border-radius:0 8px 8px 0;">
              <strong>5.</strong> 判定克制额外增伤（50% 概率 +1，不受减免）
            </div>
            <div style="background:linear-gradient(90deg,#9b59b633,#9b59b611); border-left:4px solid #9b59b6; padding:10px 16px; border-radius:0 8px 8px 0;">
              <strong>6.</strong> 天工幸运减免（若目标为天工系，5% 概率免伤）
            </div>
            <div style="background:linear-gradient(90deg,#e74c3c33,#e74c3c11); border-left:4px solid #e74c3c; padding:10px 16px; border-radius:0 8px 8px 0;">
              <strong>7.</strong> 扣除生命
            </div>
          </div>
        `
      }
    }
  } 