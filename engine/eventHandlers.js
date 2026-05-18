// engine/eventHandlers.js
import { app } from './gameState.js';
import { tryMoveTown, tryMoveMaze, performAttack, handleShopPurchase, goToTown, skipPlayerTurn, onBattleWin, onBattleLoss } from './gameLogic.js';
import { setMoveTip, toggleBackpack } from './utils.js';
import { getActualProb, getSkillById } from './skills.js';
// 魂环吸收迷宫移动已集成到 gameTown.js 的 tryMoveMaze 中

function showBattleLogPanel() {
  if (app.showBattleLog) return;
  app.showBattleLog = true;
  const panel = document.createElement('div');
  panel.id = 'battle-log-panel';
  panel.style.cssText = `
    position: fixed;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    max-height: 70vh;
    background: rgba(0,0,0,0.92);
    color: #ddd;
    border: 2px solid #aaa;
    border-radius: 8px;
    padding: 10px;
    z-index: 5000;
    overflow-y: auto;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.6;
  `;
  const logLines = app.battleLog.map((msg, idx) => `<div style="border-bottom:1px solid #333; padding:2px 0;">${idx+1}. ${msg}</div>`).join('');
  panel.innerHTML = `<h3 style="margin-top:0; color:#ffcc88;">📋 战斗日志</h3>${logLines}<div style="text-align:center; margin-top:10px;"><button id="close-battle-log" style="background:#666; color:white; border:none; padding:5px 20px; cursor:pointer;">关闭</button></div>`;
  document.body.appendChild(panel);
  document.getElementById('close-battle-log').addEventListener('click', () => {
    panel.remove();
    app.showBattleLog = false;
  });
}

function showSkillInfoPanel() {
  const battle = app.battle;
  if (!battle || battle.finished) return;
  const actor = battle.getCurrentActor();
  if (!actor || actor.side !== 'player') return;
  const skills = battle.getAvailableSkills(actor);

  const existing = document.getElementById('skill-info-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'skill-info-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 420px;
    max-height: 70vh;
    overflow-y: auto;
    background: rgba(0,0,0,0.92);
    color: white;
    border: 2px solid #8e44ad;
    border-radius: 10px;
    padding: 15px;
    z-index: 5001;
    font-family: 'Segoe UI', sans-serif;
  `;

  let html = `<h3 style="margin-top:0; color:#ffcc88;">⚡ ${actor.name} 的魂技</h3>`;

  if (actor.talent && actor.talent.name) {
    html += `<div style="background:#2a2a4a; padding:10px; border-radius:6px; margin-bottom:12px;">
      <div style="color:#ffcc88; font-weight:bold; font-size:15px;">天赋：${actor.talent.name}</div>`;
    if (actor.talent.desc) {
      html += `<div style="color:#ccc; font-size:13px; margin-top:4px;">${actor.talent.desc}</div>`;
    }
    html += `</div>`;
  }

  if (skills.length === 0) {
    html += '<p>无可用魂技</p>';
  } else {
    html += '<table style="width:100%; border-collapse: collapse;">';
    html += '<tr style="border-bottom:1px solid #444;"><th style="text-align:left;">魂技</th><th style="text-align:center;">系别</th><th style="text-align:right;">消耗</th><th style="text-align:left;">描述</th></tr>';
    skills.forEach(s => {
      const isNormal = s.id === 'normal';
      const name = isNormal ? '普通攻击' : s.name;
      const cost = isNormal ? '0' : (s.actualCost !== undefined ? s.actualCost : s.cost);
      // 系别
      let affinityName = '无';
      let probStr = '';
      if (!isNormal) {
        const skillDef = getSkillById(s.id);
        if (skillDef) {
          affinityName = skillDef.affinity;
          const actualProb = getActualProb(skillDef.affinity, actor.affinityUsed, actor.mainAffinity, actor.subAffinity, s.baseProb);
          probStr = ` [实际${Math.round(actualProb * 100)}%]`;
        }
      }
      const desc = isNormal ? '基本攻击（按F键快速攻击随机目标）' : (s.desc || '');
      html += `<tr style="border-bottom:1px solid #333;">
        <td style="color:${s.disabled ? '#888' : '#fff'}; padding-right:10px;">${name}</td>
        <td style="text-align:center; padding-right:10px; color:#ffcc88;">${affinityName}</td>
        <td style="text-align:right; padding-right:10px;">${cost} SP</td>
        <td style="font-size:13px; color:#aaa;">${desc}${probStr}</td>
      </tr>`;
    });
    html += '</table>';
  }
  html += '<div style="text-align:center; margin-top:15px;"><button id="close-skill-info" style="background:#666; color:white; border:none; padding:5px 20px; cursor:pointer;">关闭</button></div>';
  panel.innerHTML = html;
  document.body.appendChild(panel);
  document.getElementById('close-skill-info').addEventListener('click', () => panel.remove());
}

export function attachMouseHandler() {
  app.canvas.addEventListener('click', (e) => {
    if (app.dialogActive) return;
    const rect = app.canvas.getBoundingClientRect();
    const scaleX = app.canvas.width / rect.width;
    const scaleY = app.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    if (app.state === 'SHOP') {
      for (let btn of app.shopButtons) {
        if (mx >= btn.x && mx <= btn.x+btn.w && my >= btn.y && my <= btn.y+btn.h) {
          handleShopPurchase(btn.item);
          return;
        }
      }
      if (app.shopBackBtn && mx >= app.shopBackBtn.x && mx <= app.shopBackBtn.x+app.shopBackBtn.w &&
          my >= app.shopBackBtn.y && my <= app.shopBackBtn.y+app.shopBackBtn.h) {
        goToTown(false);
      }
      return;
    }

    if (app.state === 'BATTLE') {
      if (app.battleLogBtn && mx >= app.battleLogBtn.x && mx <= app.battleLogBtn.x+app.battleLogBtn.w &&
          my >= app.battleLogBtn.y && my <= app.battleLogBtn.y+app.battleLogBtn.h) {
        showBattleLogPanel();
        return;
      }

      if (app.battleSkillInfoBtn && mx >= app.battleSkillInfoBtn.x && mx <= app.battleSkillInfoBtn.x+app.battleSkillInfoBtn.w &&
          my >= app.battleSkillInfoBtn.y && my <= app.battleSkillInfoBtn.y+app.battleSkillInfoBtn.h) {
        showSkillInfoPanel();
        return;
      }

      if (app.battleSpeedBtns) {
        for (let btn of app.battleSpeedBtns) {
          if (mx >= btn.x && mx <= btn.x+btn.w && my >= btn.y && my <= btn.y+btn.h) {
            app.battleSpeed = btn.speed;
            setMoveTip(`战斗速度：${btn.speed === 'fast' ? '快' : btn.speed === 'medium' ? '中' : '慢'}`);
            return;
          }
        }
      }

      const battle = app.battle;
      if (!battle || battle.finished) return;
      const actor = battle.getCurrentActor();
      if (!actor || actor.side !== 'player') return;

      if (app.battleSkipBtn && mx >= app.battleSkipBtn.x && mx <= app.battleSkipBtn.x+app.battleSkipBtn.w &&
          my >= app.battleSkipBtn.y && my <= app.battleSkipBtn.y+app.battleSkipBtn.h) {
        skipPlayerTurn();
        app.applyDelay = true;
        return;
      }

      const cancelBtn = app.battleSkillCancelBtn || app.battleNormalCancelBtn;
      if ((app.battleTargeting || app.battleSkillMode) && cancelBtn) {
        if (mx >= cancelBtn.x && mx <= cancelBtn.x + cancelBtn.w &&
            my >= cancelBtn.y && my <= cancelBtn.y + cancelBtn.h) {
          app.battleTargeting = false;
          app.battleSkillMode = false;
          app.selectedSkill = null;
          app.battleCandidateSlots = null;
          setMoveTip("取消选择");
          return;
        }
      }

      if (app.battleTargeting || app.battleSkillMode) {
        if (!app.battleCandidateSlots) return;
        for (let slot of app.battleCandidateSlots) {
          const dx = mx - slot.x, dy = my - slot.y;
          if (dx*dx + dy*dy <= 35*35) {
            if (app.battleSkillMode && app.selectedSkill) {
              const target = { side: slot.side, index: slot.index };
              const result = battle.executeSkill(actor, app.selectedSkill, target);
              if (result) setMoveTip(result.message || '魂技释放完毕');
              if (app.battle.finished) {
                setTimeout(() => {
                  if (app.battle.winner === 'player') {
                    onBattleWin(app.maze && app.maze.isBossCell());
                  } else {
                    onBattleLoss();
                  }
                }, 1000);
              }
            } else {
              performAttack(slot.index);
            }
            app.battleTargeting = false;
            app.battleSkillMode = false;
            app.selectedSkill = null;
            app.battleCandidateSlots = null;
            app.applyDelay = true;
            return;
          }
        }
        setMoveTip("请点击有效目标");
        return;
      }

      for (let btn of app.battleButtons) {
        if (mx >= btn.x && mx <= btn.x+btn.w && my >= btn.y && my <= btn.y+btn.h) {
          if (btn.action === 'normal') {
            if (battle.getValidTargets(actor).length === 0) {
              setMoveTip("攻击距离不足，请跳过");
              return;
            }
            app.battleTargeting = true;
            app.battleSkillMode = false;
            app.selectedSkill = null;
            setMoveTip("⚔️ 选择攻击目标");
            return;
          } else if (btn.action === 'skill') {
            if (btn.disabled) return;
            const skill = btn.skill;
            if (skill.target === 'self' || skill.target === 'all_ally') {
              const result = battle.executeSkill(actor, skill.id, null);
              if (result) setMoveTip(result.message || '魂技释放');
              app.applyDelay = true;
              return;
            }
            if (battle.getTargetsForSkill(actor, skill.id).length === 0) {
              setMoveTip("攻击距离不足，请跳过");
              return;
            }
            app.battleSkillMode = true;
            app.battleTargeting = false;
            app.selectedSkill = skill.id;
            setMoveTip("选择魂技目标");
            return;
          }
        }
      }
      return;
    }

    // 城镇 / 迷宫移动
    if (app.state === 'TOWN' && !app.levelSelectDiv) {
      const cellW = 100, cellH = 100, offsetX = 100, offsetY = 100;
      const gx = Math.floor((mx - offsetX) / cellW);
      const gy = Math.floor((my - offsetY) / cellH);
      if (gx >= 0 && gx < 5 && gy >= 0 && gy < 5) {
        const dx = gx - app.townPlayerPos.x;
        const dy = gy - app.townPlayerPos.y;
        if (Math.abs(dx) + Math.abs(dy) === 1) tryMoveTown(dx, dy);
        else setMoveTip("只能移动到相邻格子");
      }
    }

    if (app.state === 'MAZE' && app.maze) {
      const cellSize = app.maze.size >= 9 ? 55 : (app.maze.size >= 8 ? 60 : 80);
      const offset = app.maze.size >= 9 ? 152 : (app.maze.size >= 8 ? 50 : 100);
      const offsetY = app.maze.size >= 9 ? 80 : offset;



      const gx = Math.floor((mx - offset) / cellSize);
      const gy = Math.floor((my - offsetY) / cellSize);


      if (gx >= 0 && gx < app.maze.size && gy >= 0 && gy < app.maze.size) {
        const dx = gx - app.maze.px;
        const dy = gy - app.maze.py;
        if (Math.abs(dx) + Math.abs(dy) === 1) tryMoveMaze(dx, dy);
        else setMoveTip("只能移动到相邻格子");
      }
    }
  });
}

export function attachKeyboardHandler() {
  window.addEventListener('keydown', (e) => {
    if (!app.dialogActive && e.key === 'q') {
      e.preventDefault();
      toggleBackpack();
      return;
    }
    if (app.dialogActive) {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (app.dialogueEngine) app.dialogueEngine.advance();
      }
      return;
    }
    if (app.state === 'TOWN' && !app.levelSelectDiv) {
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;
      if (dx || dy) tryMoveTown(dx, dy);
    } else if (app.state === 'MAZE') {
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;
      if (dx || dy) tryMoveMaze(dx, dy);
    } else if (app.state === 'BATTLE') {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const battle = app.battle;
        if (!battle || battle.finished) return;
        const actor = battle.getCurrentActor();
        if (actor && actor.side === 'player') {
          const valid = battle.getValidTargets(actor);
          if (valid.length > 0) {
            const idx = valid[Math.floor(Math.random() * valid.length)];
            performAttack(idx);
            app.applyDelay = true;
          } else {
            setMoveTip("攻击距离不足，已跳过");
            skipPlayerTurn();
            app.applyDelay = true;
          }
        }
      }
    }
  });
}
 