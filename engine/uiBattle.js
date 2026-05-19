// engine/uiBattle.js
import { app } from './gameState.js';

const MARK_CN = {
  poison: '毒', burn: '燃', bind: '缠', lock: '锁',
  reborn: '生', beast_king: '王', shield: '盾',
  power_up: '力', speed_up: '速', smoke: '烟',
  delay: '迟', excite: '激'
};

// 绘制详细信息面板（原版）
function drawDetailPanel(ctx, leftPanelX, leftPanelY, rightPanelX, rightPanelY, panelW, panelH, battle) {
  // ---- 左侧面板 ----
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(leftPanelX, leftPanelY, panelW, panelH);
  ctx.strokeStyle = "#555";
  ctx.strokeRect(leftPanelX, leftPanelY, panelW, panelH);
  ctx.fillStyle = "#ffd966";
  ctx.font = "16px 'Segoe UI'";
  ctx.fillText("我方", leftPanelX + 10, leftPanelY + 25);
  
  for (let i = 0; i < battle.playerTeam.length; i++) {
    const u = battle.playerTeam[i];
    const yBase = leftPanelY + 48 + i * 130;
    if (u.alive) {
      ctx.fillStyle = "#ddd";
      ctx.font = "18px Arial";
      const displayName = u.wuhun ? `${u.name}·${u.wuhun}` : u.name;
      ctx.fillText(displayName, leftPanelX + 10, yBase);
      ctx.font = "11px Arial";
      ctx.fillText(`Lv.${u.level||1} ${u.affinityUsed||''} SP:${u.spirit}/${u.maxSpirit}  HP:${u.hp}/${u.maxHp}`, leftPanelX + 10, yBase + 16);
      const atkStr = `${u.damageMin}-${u.damageMax}`;
      const defStr = u.defenseType;
      const spd = u.speed + (u.speedBonus||0);
      const range = battle.getEffectiveRange(u);
      const agi = (u.speed + (u.speedBonus||0)) + (u.intel + (u.intelligenceBonus||0));
      ctx.fillText(`攻:${atkStr} 防:${defStr}档 速:${spd} 距:${range} 灵巧:${agi}`, leftPanelX + 10, yBase + 32);
      
      if (u.marks && u.marks.length > 0) {
        const positive = ['reborn', 'beast_king', 'shield', 'power_up', 'speed_up'];
        ctx.font = "11px Arial";
        let markX = leftPanelX + 10;
        ctx.fillStyle = "#ddd";
        ctx.fillText('状态: ', markX, yBase + 50);
        markX += ctx.measureText('状态: ').width;
        u.marks.forEach(m => {
          ctx.fillStyle = positive.includes(m.type) ? '#44ff44' : '#ff4444';
          const text = `[${MARK_CN[m.type] || m.type}] `;
          ctx.fillText(text, markX, yBase + 50);
          markX += ctx.measureText(text).width;
        });
      }
      ctx.fillStyle = "#555";
      ctx.fillRect(leftPanelX + 10, yBase + 60, panelW - 30, 6);
      const hpPercent = u.hp / u.maxHp;
      ctx.fillStyle = hpPercent > 0.5 ? "#4caf50" : (hpPercent > 0.2 ? "#ff9800" : "#e74c3c");
      ctx.fillRect(leftPanelX + 10, yBase + 60, (panelW - 30) * hpPercent, 6);
    } else {
      ctx.fillStyle = "#666";
      ctx.font = "18px Arial";
      const displayName = u.wuhun ? `${u.name}·${u.wuhun}` : u.name;
      ctx.fillText(displayName + " (阵亡)", leftPanelX + 10, yBase);
    }
  }

  // ---- 右侧面板 ----
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(rightPanelX, rightPanelY, panelW, panelH);
  ctx.strokeStyle = "#555";
  ctx.strokeRect(rightPanelX, rightPanelY, panelW, panelH);
  ctx.fillStyle = "#e74c3c";
  ctx.font = "16px 'Segoe UI'";
  ctx.fillText("敌方", rightPanelX + 10, rightPanelY + 25);
  
  for (let i = 0; i < battle.enemyTeam.length; i++) {
    const u = battle.enemyTeam[i];
    const yBase = rightPanelY + 48 + i * 130;
    if (u.alive) {
      ctx.fillStyle = "#ddd";
      ctx.font = "18px Arial";
      const displayName = u._hideWuhun ? u.name : (u.wuhun ? `${u.name}·${u.wuhun}` : u.name);
      ctx.fillText(displayName, rightPanelX + 10, yBase);
      ctx.font = "11px Arial";
      ctx.fillText(`Lv.${u.level||1} ${u.affinityUsed||''} SP:${u.spirit}/${u.maxSpirit}  HP:${u.hp}/${u.maxHp}`, rightPanelX + 10, yBase + 16);
      const atkStr = `${u.damageMin}-${u.damageMax}`;
      const defStr = u.defenseType;
      const spd = u.speed + (u.speedBonus||0);
      const range = battle.getEffectiveRange(u);
      const agi = (u.speed + (u.speedBonus||0)) + (u.intel + (u.intelligenceBonus||0));
      ctx.fillText(`攻:${atkStr} 防:${defStr}档 速:${spd} 距:${range} 灵巧:${agi}`, rightPanelX + 10, yBase + 32);
      
      if (u.marks && u.marks.length > 0) {
        const positive = ['reborn', 'beast_king', 'shield', 'power_up', 'speed_up'];
        ctx.font = "11px Arial";
        let markX = rightPanelX + 10;
        ctx.fillStyle = "#ddd";
        ctx.fillText('状态: ', markX, yBase + 50);
        markX += ctx.measureText('状态: ').width;
        u.marks.forEach(m => {
          ctx.fillStyle = positive.includes(m.type) ? '#44ff44' : '#ff4444';
          const text = `[${MARK_CN[m.type] || m.type}] `;
          ctx.fillText(text, markX, yBase + 50);
          markX += ctx.measureText(text).width;
        });
      }
      ctx.fillStyle = "#555";
      ctx.fillRect(rightPanelX + 10, yBase + 60, panelW - 30, 6);
      const hpPercent = u.hp / u.maxHp;
      ctx.fillStyle = hpPercent > 0.5 ? "#4caf50" : (hpPercent > 0.2 ? "#ff9800" : "#e74c3c");
      ctx.fillRect(rightPanelX + 10, yBase + 60, (panelW - 30) * hpPercent, 6);
    } else {
      ctx.fillStyle = "#666";
      ctx.font = "18px Arial";
      const displayName = u._hideWuhun ? u.name : (u.wuhun ? `${u.name}·${u.wuhun}` : u.name);
      ctx.fillText(displayName + " (阵亡)", rightPanelX + 10, yBase);
    }
  }
}

// 绘制简洁信息面板（新版）
function drawSimplePanel(ctx, leftPanelX, leftPanelY, rightPanelX, rightPanelY, panelW, panelH, battle) {
  // ---- 左侧面板 ----
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(leftPanelX, leftPanelY, panelW, panelH);
  ctx.strokeStyle = "#555";
  ctx.strokeRect(leftPanelX, leftPanelY, panelW, panelH);
  ctx.fillStyle = "#ffd966";
  ctx.font = "20px 'Segoe UI'";
  ctx.fillText("我方", leftPanelX + 10, leftPanelY + 25);
  
  for (let i = 0; i < battle.playerTeam.length; i++) {
    const u = battle.playerTeam[i];
    const yBase = leftPanelY + 55 + i * 135;
    if (u.alive) {
      // 第一行：姓名（白色）
      ctx.fillStyle = "#ddd";
      ctx.font = "24px Arial";
      ctx.fillText(u.name, leftPanelX + 10, yBase);
      // 第二行：武魂（灰色）
      ctx.fillStyle = "#aaa";
      ctx.font = "24px Arial";
      ctx.fillText(u.wuhun || "无武魂", leftPanelX + 10, yBase + 27);
      // 第三行：血条（绿色/橙色/红色）
      ctx.fillStyle = "#555";
      ctx.fillRect(leftPanelX + 10, yBase + 44, panelW - 30, 10);
      const hpPercent = u.hp / u.maxHp;
      ctx.fillStyle = hpPercent > 0.5 ? "#4caf50" : (hpPercent > 0.2 ? "#ff9800" : "#e74c3c");
      ctx.fillRect(leftPanelX + 10, yBase + 44, (panelW - 30) * hpPercent, 10);
      // 第四行：魂力条（蓝色，与血条间隔6px）
      ctx.fillStyle = "#444";
      ctx.fillRect(leftPanelX + 10, yBase + 59, panelW - 30, 8);
      const spPercent = u.spirit / u.maxSpirit;
      ctx.fillStyle = "#3498db";
      ctx.fillRect(leftPanelX + 10, yBase + 59, (panelW - 30) * spPercent, 8);
      // 第五行：状态标记
      if (u.marks && u.marks.length > 0) {
        const positive = ['reborn', 'beast_king', 'shield', 'power_up', 'speed_up'];
        ctx.font = "16px Arial";
        let markX = leftPanelX + 10;
        ctx.fillStyle = "#ddd";
        ctx.fillText('状态: ', markX, yBase + 90);
        markX += ctx.measureText('状态: ').width;
        u.marks.forEach(m => {
          ctx.fillStyle = positive.includes(m.type) ? '#44ff44' : '#ff4444';
          const text = `[${MARK_CN[m.type] || m.type}] `;
          ctx.fillText(text, markX, yBase + 90);
          markX += ctx.measureText(text).width;
        });
      }
    } else {
      ctx.fillStyle = "#666";
      ctx.font = "24px Arial";
      ctx.fillText(u.name + " (阵亡)", leftPanelX + 10, yBase);
    }
  }

  // ---- 右侧面板 ----
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(rightPanelX, rightPanelY, panelW, panelH);
  ctx.strokeStyle = "#555";
  ctx.strokeRect(rightPanelX, rightPanelY, panelW, panelH);
  ctx.fillStyle = "#e74c3c";
  ctx.font = "20px 'Segoe UI'";
  ctx.fillText("敌方", rightPanelX + 10, rightPanelY + 25);
  
  for (let i = 0; i < battle.enemyTeam.length; i++) {
    const u = battle.enemyTeam[i];
    const yBase = rightPanelY + 55 + i * 135;
    if (u.alive) {
      // 第一行：姓名（白色）
      ctx.fillStyle = "#ddd";
      ctx.font = "24px Arial";
      ctx.fillText(u.name, rightPanelX + 10, yBase);
      // 第二行：武魂（灰色）
      ctx.fillStyle = "#aaa";
      ctx.font = "24px Arial";
      ctx.fillText(u.wuhun || "无武魂", rightPanelX + 10, yBase + 27);
      // 第三行：血条（绿色/橙色/红色）
      ctx.fillStyle = "#555";
      ctx.fillRect(rightPanelX + 10, yBase + 44, panelW - 30, 10);
      const hpPercent = u.hp / u.maxHp;
      ctx.fillStyle = hpPercent > 0.5 ? "#4caf50" : (hpPercent > 0.2 ? "#ff9800" : "#e74c3c");
      ctx.fillRect(rightPanelX + 10, yBase + 44, (panelW - 30) * hpPercent, 10);
      // 第四行：魂力条（蓝色，与血条间隔6px）
      ctx.fillStyle = "#444";
      ctx.fillRect(rightPanelX + 10, yBase + 59, panelW - 30, 8);
      const spPercent = u.spirit / u.maxSpirit;
      ctx.fillStyle = "#3498db";
      ctx.fillRect(rightPanelX + 10, yBase + 59, (panelW - 30) * spPercent, 8);
      // 第五行：状态标记
      if (u.marks && u.marks.length > 0) {
        const positive = ['reborn', 'beast_king', 'shield', 'power_up', 'speed_up'];
        ctx.font = "16px Arial";
        let markX = rightPanelX + 10;
        ctx.fillStyle = "#ddd";
        ctx.fillText('状态: ', markX, yBase + 90);
        markX += ctx.measureText('状态: ').width;
        u.marks.forEach(m => {
          ctx.fillStyle = positive.includes(m.type) ? '#44ff44' : '#ff4444';
          const text = `[${MARK_CN[m.type] || m.type}] `;
          ctx.fillText(text, markX, yBase + 90);
          markX += ctx.measureText(text).width;
        });
      }
    } else {
      ctx.fillStyle = "#666";
      ctx.font = "24px Arial";
      ctx.fillText(u.name + " (阵亡)", rightPanelX + 10, yBase);
    }
  }
}

export function drawBattle() {
  const { ctx, canvas, battle, player, battleTargeting, battleSkillMode } = app;
  if (!battle) return;
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const leftPanelX = 10, leftPanelY = 80;
  const rightPanelX = 610, rightPanelY = 80;
  const panelW = 180, panelH = canvas.height - 100;
  const centerX = 400;
  const slotRadius = 32;

  // 根据模式选择面板样式
  const useSimplePanel = app.battlePanelMode === 'simple';
  if (useSimplePanel) {
    drawSimplePanel(ctx, leftPanelX, leftPanelY, rightPanelX, rightPanelY, panelW, panelH, battle);
  } else {
    drawDetailPanel(ctx, leftPanelX, leftPanelY, rightPanelX, rightPanelY, panelW, panelH, battle);
  }

  // ---- 战斗圆环区域（只显示武魂） ----
  const baseY = [160, 290, 420];
  app.battlePlayerSlots = [];
  app.battleEnemySlots = [];

  for (let i = 0; i < battle.playerTeam.length; i++) {
    const u = battle.playerTeam[i];
    const row = u.gridRow;
    const col = u.gridCol;
    const x = col === 1 ? centerX - 90 : centerX - 170;
    const y = baseY[row];
    app.battlePlayerSlots[i] = { x, y, unit: u, index: i, side: 'player' };
    ctx.fillStyle = u.alive ? (u.color || "#4a90e2") : "#333";
    ctx.beginPath();
    ctx.arc(x, y, slotRadius, 0, 2*Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#aaa";
    ctx.stroke();
    if (u.alive) {
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(u.wuhun || u.name, x, y + slotRadius + 22);
    }
  }

  for (let i = 0; i < battle.enemyTeam.length; i++) {
    const u = battle.enemyTeam[i];
    const row = u.gridRow;
    const col = u.gridCol;
    const x = col === 1 ? centerX + 90 : centerX + 170;
    const y = baseY[row];
    app.battleEnemySlots[i] = { x, y, unit: u, index: i, side: 'enemy' };
    ctx.fillStyle = u.alive ? (u.color || "#e74c3c") : "#333";
    ctx.beginPath();
    ctx.arc(x, y, slotRadius, 0, 2*Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#aaa";
    ctx.stroke();
    if (u.alive) {
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(u.wuhun || u.name, x, y + slotRadius + 22);
    }
  }

  // 波浪线
  ctx.save();
  ctx.strokeStyle = "rgba(173,216,230,0.5)";
  ctx.lineWidth = 2.5;
  const waveStartY = 120;
  const waveEndY = canvas.height - 140;
  ctx.beginPath();
  for (let y = waveStartY; y < waveEndY; y += 8) {
    const x = centerX - 25 + Math.sin(y * 0.08) * 4;
    if (y === waveStartY) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let y = waveStartY; y < waveEndY; y += 8) {
    const x = centerX + 25 + Math.sin(y * 0.08 + 1) * 4;
    if (y === waveStartY) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // 高亮当前行动者
  const currentActor = battle.getCurrentActor();
  if (currentActor && currentActor.alive) {
    let cx, cy;
    if (currentActor.side === 'player') {
      const idx = battle.playerTeam.indexOf(currentActor);
      if (idx >= 0) { const s = app.battlePlayerSlots[idx]; cx = s.x; cy = s.y; }
    } else {
      const idx = battle.enemyTeam.indexOf(currentActor);
      if (idx >= 0) { const s = app.battleEnemySlots[idx]; cx = s.x; cy = s.y; }
    }
    if (cx !== undefined) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, slotRadius + 6, 0, 2*Math.PI);
      ctx.stroke();
    }
  }

  // 速度面板 + 日志按钮 + 面板切换按钮
  const speedPanelX = canvas.width - 210;
  const speedPanelY = 10;
  const speedPanelW = 190;
  const speedPanelH = 55;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(speedPanelX, speedPanelY, speedPanelW, speedPanelH);
  ctx.strokeStyle = "#aaa";
  ctx.strokeRect(speedPanelX, speedPanelY, speedPanelW, speedPanelH);
  ctx.fillStyle = "#ffcc88";
  ctx.font = "16px 'Segoe UI'";
  ctx.textAlign = "left";
  ctx.fillText("战斗速度", speedPanelX + 8, speedPanelY + 18);
  const speeds = ['fast', 'medium', 'slow'];
  const labels = ['快', '中', '慢'];
  const btnW = 42, btnH = 22;
  app.battleSpeedBtns = [];
  for (let i = 0; i < 3; i++) {
    const bx = speedPanelX + 8 + i * (btnW + 8);
    const by = speedPanelY + 26;
    const active = app.battleSpeed === speeds[i];
    ctx.fillStyle = active ? "#3498db" : "#555";
    ctx.fillRect(bx, by, btnW, btnH);
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], bx + btnW/2, by + 15);
    app.battleSpeedBtns.push({ x: bx, y: by, w: btnW, h: btnH, speed: speeds[i] });
  }

  // 日志按钮
  const logBtnX = speedPanelX - 60;
  const logBtnY = speedPanelY;
  const logBtnW = 50;
  const logBtnH = speedPanelH;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(logBtnX, logBtnY, logBtnW, logBtnH);
  ctx.strokeStyle = "#aaa";
  ctx.strokeRect(logBtnX, logBtnY, logBtnW, logBtnH);
  ctx.fillStyle = "#2ecc71";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("📋", logBtnX + logBtnW/2, logBtnY + 20);
  ctx.fillStyle = "white";
  ctx.font = "10px Arial";
  ctx.fillText("日志", logBtnX + logBtnW/2, logBtnY + 38);
  app.battleLogBtn = { x: logBtnX, y: logBtnY, w: logBtnW, h: logBtnH };

  // 面板切换按钮（在日志按钮左边）
  const toggleBtnX = logBtnX - 60;
  const toggleBtnY = speedPanelY;
  const toggleBtnW = 50;
  const toggleBtnH = speedPanelH;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(toggleBtnX, toggleBtnY, toggleBtnW, toggleBtnH);
  ctx.strokeStyle = "#aaa";
  ctx.strokeRect(toggleBtnX, toggleBtnY, toggleBtnW, toggleBtnH);
  ctx.fillStyle = useSimplePanel ? "#f39c12" : "#3498db";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(useSimplePanel ? "📄" : "📊", toggleBtnX + toggleBtnW/2, toggleBtnY + 20);
  ctx.fillStyle = "white";
  ctx.font = "10px Arial";
  ctx.fillText(useSimplePanel ? "详细" : "简洁", toggleBtnX + toggleBtnW/2, toggleBtnY + 38);
  app.battlePanelToggleBtn = { x: toggleBtnX, y: toggleBtnY, w: toggleBtnW, h: toggleBtnH };

  // ---- 底部操作栏 ----
  if (currentActor && currentActor.side === 'player' && !battle.finished) {
    const btnY = canvas.height - 45;
    if (battleTargeting || battleSkillMode) {
      let candidateSlots = [];
      if (battleSkillMode && app.selectedSkill) {
        const targets = battle.getTargetsForSkill(currentActor, app.selectedSkill);
        candidateSlots = targets.map(t => {
          const slotArr = t.side === 'player' ? app.battlePlayerSlots : app.battleEnemySlots;
          return slotArr[t.index];
        }).filter(s => s);
      } else if (battleTargeting) {
        const validIndices = battle.getValidTargets(currentActor);
        candidateSlots = validIndices.map(i => app.battleEnemySlots[i]).filter(s => s);
      }
      app.battleCandidateSlots = candidateSlots;

      candidateSlots.forEach(slot => {
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, slotRadius + 6, 0, 2 * Math.PI);
        ctx.stroke();
      });

      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
      ctx.fillStyle = "#ffcc88";
      ctx.font = "22px Arial";
      ctx.textAlign = "center";
      if (battleSkillMode) {
        ctx.fillText("🎯 选择魂技目标", centerX, btnY + 27);
      } else {
        ctx.fillText("⚔️ 选择攻击目标", centerX, btnY + 27);
      }
      ctx.fillStyle = "#e74c3c";
      const cancelX = 10, cancelY = canvas.height - 75;
      ctx.fillRect(cancelX, cancelY, 60, 30);
      ctx.fillStyle = "white";
      ctx.fillText("取消", cancelX + 30, cancelY + 20);
      app.battleNormalCancelBtn = { x: cancelX, y: cancelY, w: 60, h: 30 };
      app.battleSkillCancelBtn = app.battleNormalCancelBtn;
      ctx.fillStyle = "#888";
      ctx.fillRect(720, btnY, 60, 40);
      ctx.fillStyle = "white";
      ctx.fillText("跳过", 750, btnY + 27);
      app.battleSkipBtn = { x: 720, y: btnY, w: 60, h: 40 };
      app.battleButtons = [];
      app.battleSkillInfoBtn = null;
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
      
      // 自动按钮（F键功能）
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(10, btnY, 80, 40);
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "18px Arial";
      ctx.fillText("自动(F)", 50, btnY + 28);

      ctx.fillStyle = "#3498db";
      ctx.fillRect(100, btnY, 90, 40);
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "18px Arial";
      ctx.fillText("普攻", 145, btnY + 28);
      
      const skills = battle.getAvailableSkills(currentActor).filter(s => s.id !== 'normal');
      let skillBtnX = 200;
      const skillBtns = [];
      for (let skill of skills) {
        ctx.fillStyle = skill.disabled ? "#555" : "#e67e22";
        ctx.fillRect(skillBtnX, btnY, 90, 40);
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText(`${skill.name}(${skill.actualCost})`, skillBtnX + 45, btnY + 28);
        skillBtns.push({
          x: skillBtnX, y: btnY, w: 90, h: 40,
          action: 'skill', skillId: skill.id, disabled: skill.disabled, skill: skill
        });
        skillBtnX += 100;
      }
      app.battleButtons = [
        { x: 10, y: btnY, w: 80, h: 40, action: 'auto' },
        { x: 100, y: btnY, w: 90, h: 40, action: 'normal' },
        ...skillBtns
      ];


      const skillInfoX = 630, skillInfoY = btnY, skillInfoW = 80, skillInfoH = 40;
      ctx.fillStyle = "#8e44ad";
      ctx.fillRect(skillInfoX, skillInfoY, skillInfoW, skillInfoH);
      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText("魂技说明", skillInfoX + skillInfoW/2, skillInfoY + 28);
      app.battleSkillInfoBtn = { x: skillInfoX, y: skillInfoY, w: skillInfoW, h: skillInfoH };

      const skipX = 720, skipY = btnY, skipW = 60, skipH = 40;
      ctx.fillStyle = "#888";
      ctx.fillRect(skipX, skipY, skipW, skipH);
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "18px Arial";
      ctx.fillText("跳过", skipX + skipW/2, skipY + 28);
      app.battleSkipBtn = { x: skipX, y: skipY, w: skipW, h: skipH };
    }
  } else {
    app.battleButtons = [];
    app.battleSkipBtn = null;
    app.battleSkillCancelBtn = null;
    app.battleNormalCancelBtn = null;
    app.battleCandidateSlots = null;
    app.battleSkillInfoBtn = null;
  }

  // 日志（在底部按钮上方，敌人行动蓝色，我方行动黄色）
  ctx.font = "22px Arial";
  ctx.textAlign = "center";
  if (currentActor) {
    ctx.fillStyle = currentActor.side === 'enemy' ? "#5dade2" : "#f1c40f";
  } else {
    ctx.fillStyle = "#ddd";
  }
  ctx.fillText(battle.log, centerX, canvas.height - 55);

  ctx.textAlign = "start";
}
