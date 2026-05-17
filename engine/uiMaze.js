import { app } from './gameState.js';

export function drawMaze() {
  const { ctx, maze, player } = app;
  // 根据迷宫尺寸动态调整格子大小：9x9用55px，8x8用60px，5x5用80px
  const cellSize = maze.size >= 9 ? 55 : (maze.size >= 8 ? 60 : 80);
  // 9x9: 居中(800-495)/2≈152，接近底部600-495-50=55
  const offset = maze.size >= 9 ? 152 : (maze.size >= 8 ? 50 : 100);
  const offsetY = maze.size >= 9 ? 80 : offset;





  
  // 检测是否为魂环吸收迷宫
  if (maze._isSoulRingMaze) {
    drawSoulRingMaze(ctx, maze, cellSize, offset);
    return;
  }
  
  const stageName = maze.isHuntingForest ? "🌲 圈养森林" : 
    (maze._isCustomMaze ? maze._customMazeName : 
    (app.config.stages.levels[app.currentLevel]?.name || "未知关卡"));

  // 绘制背景
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);

  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {
      const cellKey = `${x},${y}`;
      ctx.strokeStyle = "#333";
      ctx.strokeRect(offset + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
      if (maze.blockedCells && maze.blockedCells.has(cellKey)) {
        // 挖空格子：浅灰色填充（空心区域）
        ctx.fillStyle = "#555";
        ctx.fillRect(offset + x * cellSize + 2, offsetY + y * cellSize + 2, cellSize - 4, cellSize - 4);
      } else if (maze.explored[y][x]) {
        ctx.fillStyle = "#222";
        ctx.fillRect(offset + x * cellSize + 2, offsetY + y * cellSize + 2, cellSize - 4, cellSize - 4);
      }
    }
  }



  // 绘制猎魂森林的boss标记
  if (maze.isHuntingForest) {

    for (const boss of maze.bossPositions) {
      const bx = offset + boss.x * cellSize + cellSize / 2;
      const by = offsetY + boss.y * cellSize + cellSize / 2;

      
      if (boss.defeated) {
        // 已击败的boss显示灰色勾
        ctx.fillStyle = "#555";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✓", bx, by - 5);
        ctx.fillStyle = "#888";
        ctx.font = "11px Arial";
        ctx.fillText("已击败", bx, by + 15);
      } else if (maze.explored[boss.y][boss.x]) {
        // 未击败且已探索的boss显示三角标记和大号名称
        ctx.fillStyle = boss.color || "#e74c3c";
        ctx.beginPath();
        ctx.moveTo(bx, by - 15);
        ctx.lineTo(bx - 12, by + 8);
        ctx.lineTo(bx + 12, by + 8);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(boss.name, bx, by + 24);
      } else {
        // 未探索的boss格显示问号
        ctx.fillStyle = "#8e44ad";
        ctx.beginPath();
        ctx.moveTo(bx, by - 15);
        ctx.lineTo(bx - 12, by + 8);
        ctx.lineTo(bx + 12, by + 8);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", bx, by + 5);
      }
    }
  } else {
    // 普通/自定义迷宫的boss标记
    let bossX, bossY;
    if (maze._isCustomMaze) {
      bossX = offset + maze.endX * cellSize + cellSize / 2;
      bossY = offsetY + maze.endY * cellSize + cellSize / 2;
    } else {
      bossX = offset + (maze.size-1)*cellSize + cellSize/2;
      bossY = offsetY + (maze.size-1)*cellSize + cellSize/2;
    }

    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.moveTo(bossX, bossY-15);
    ctx.lineTo(bossX-12, bossY+8);
    ctx.lineTo(bossX+12, bossY+8);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.fillText(maze._isCustomMaze ? "终点" : "BOSS", bossX-18, bossY+20);

  }


  // 绘制墙壁
  ctx.save();
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 6;
  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {
      const cellX = offset + x * cellSize;
      const cellY = offsetY + y * cellSize;

      if (x < maze.size-1 && maze.wallRight[y][x]) {
        const leftExplored = maze.explored[y][x];
        const rightExplored = maze.explored[y][x+1];
        if (leftExplored || rightExplored) {
          ctx.beginPath();
          ctx.moveTo(cellX + cellSize, cellY);
          ctx.lineTo(cellX + cellSize, cellY + cellSize);
          ctx.stroke();
        }
      }
      if (y < maze.size-1 && maze.wallDown[y][x]) {
        const topExplored = maze.explored[y][x];
        const bottomExplored = maze.explored[y+1][x];
        if (topExplored || bottomExplored) {
          ctx.beginPath();
          ctx.moveTo(cellX, cellY + cellSize);
          ctx.lineTo(cellX + cellSize, cellY + cellSize);
          ctx.stroke();
        }
      }
    }
  }
  ctx.restore();

  // 绘制玩家
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(offset + maze.px * cellSize + cellSize/2, offsetY + maze.py * cellSize + cellSize/2, 20, 0, 2*Math.PI);
  ctx.fill();


  // 绘制信息（向右偏移避免被覆盖）
  const hpText = app.party.map(m => `${m.name}: ${m.hp}/${m.maxHp}${m.alive === false ? '(阵亡)' : ''}`).join('  ');
  ctx.fillStyle = "white";
  ctx.font = "bold 14px 'Segoe UI'";
  ctx.fillText(`🗺️ ${stageName}`, 80, 40);
  ctx.font = "14px 'Segoe UI'";
  ctx.fillText(`生命: ${hpText}`, 140, 70);
  ctx.fillText(`金魂币: ${player.gold}`, 60, 95);

  // 猎魂森林额外信息
  if (maze.isHuntingForest) {
    const alive = maze.bossPositions.filter(b => !b.defeated).length;
    const total = maze.bossPositions.length;
    ctx.fillStyle = "#f39c12";
    ctx.font = "bold 14px 'Segoe UI'";
    ctx.textAlign = "right";
    ctx.fillText(`魂兽剩余: ${alive}/${total}`, app.canvas.width - 20, 40);
    ctx.textAlign = "start";
  }
}

// 魂环吸收迷宫渲染
function drawSoulRingMaze(ctx, maze, cellSize, offset) {
  const center = Math.floor(maze.size / 2);
  
  // 绘制背景
  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);
  
  // 绘制网格
  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {
      // 中心格（魂核）特殊渲染
      if (x === center && y === center) {
        ctx.fillStyle = "#1a1a0a";
        ctx.fillRect(offset + x * cellSize + 2, offset + y * cellSize + 2, cellSize - 4, cellSize - 4);
        // 魂核光晕
        const gradient = ctx.createRadialGradient(
          offset + x * cellSize + cellSize/2, offset + y * cellSize + cellSize/2, 5,
          offset + x * cellSize + cellSize/2, offset + y * cellSize + cellSize/2, cellSize/2
        );
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(offset + x * cellSize, offset + y * cellSize, cellSize, cellSize);
      } else if (maze.explored[y][x]) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(offset + x * cellSize + 2, offset + y * cellSize + 2, cellSize - 4, cellSize - 4);
      }
      ctx.strokeStyle = "#333";
      ctx.strokeRect(offset + x * cellSize, offset + y * cellSize, cellSize, cellSize);
    }
  }
  
  // 先绘制迷雾覆盖（未探索的格子），墙壁绘制在迷雾之上
  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {
      if (!maze.explored[y][x]) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(offset + x * cellSize, offset + y * cellSize, cellSize, cellSize);
      }
    }
  }
  
  // 绘制墙壁（只绘制已探索格子的墙壁，以及能量球位置四周的墙壁）
  ctx.save();
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 6;
  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {
      const cellX = offset + x * cellSize;
      const cellY = offset + y * cellSize;
      // 检查当前格子或相邻格子是否为能量球位置
      const isOrbCell = (x === maze._orbX && y === maze._orbY);
      const isOrbRight = (x + 1 === maze._orbX && y === maze._orbY);
      const isOrbDown = (x === maze._orbX && y + 1 === maze._orbY);
      
      if (x < maze.size-1 && maze.wallRight[y][x]) {
        const leftExplored = maze.explored[y][x];
        const rightExplored = maze.explored[y][x+1];
        // 如果任意一侧已探索，或者墙壁属于能量球位置四周，则显示
        if (leftExplored || rightExplored || isOrbCell || isOrbRight) {
          ctx.beginPath();
          ctx.moveTo(cellX + cellSize, cellY);
          ctx.lineTo(cellX + cellSize, cellY + cellSize);
          ctx.stroke();
        }
      }
      if (y < maze.size-1 && maze.wallDown[y][x]) {
        const topExplored = maze.explored[y][x];
        const bottomExplored = maze.explored[y+1][x];
        // 如果任意一侧已探索，或者墙壁属于能量球位置四周，则显示
        if (topExplored || bottomExplored || isOrbCell || isOrbDown) {
          ctx.beginPath();
          ctx.moveTo(cellX, cellY + cellSize);
          ctx.lineTo(cellX + cellSize, cellY + cellSize);
          ctx.stroke();
        }
      }
    }
  }
  ctx.restore();
  
  // 绘制中心魂核文字
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 16px 'Segoe UI'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("魂核", offset + center * cellSize + cellSize/2, offset + center * cellSize + cellSize/2);
  
  // 绘制能量球（玩家）
  const orbColor = maze._currentOrbColor || '#4a90e2';
  ctx.shadowColor = orbColor;
  ctx.shadowBlur = 15;
  ctx.fillStyle = orbColor;
  ctx.beginPath();
  ctx.arc(offset + maze.px * cellSize + cellSize/2, offset + maze.py * cellSize + cellSize/2, 16, 0, 2*Math.PI);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // 绘制能量球白色边框
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(offset + maze.px * cellSize + cellSize/2, offset + maze.py * cellSize + cellSize/2, 16, 0, 2*Math.PI);
  ctx.stroke();
  
  // 绘制顶部信息
  const charName = maze._soulRingCharName || '角色';
  const collected = maze._soulRingCollected || 0;
  const total = maze._soulRingTotal || 3;
  
  ctx.fillStyle = "white";
  ctx.font = "bold 16px 'Segoe UI'";
  ctx.textAlign = "start";
  ctx.textBaseline = "top";
  ctx.fillText(`${charName}的身体 ${collected}/${total}`, 20, 20);
  
  // 绘制提示语
  let tipText = "请引导魂环能量进入中心魂核。";
  if (collected > 0 && collected < total) {
    tipText = `您已经完成${collected}/${total}的魂环能量收集！`;
  } else if (collected >= total) {
    tipText = "您已经完成所有魂环能量收集！";
  }
  ctx.fillStyle = "#f39c12";
  ctx.font = "15px 'Segoe UI'";
  ctx.textAlign = "center";
  ctx.fillText(tipText, app.canvas.width / 2, app.canvas.height - 30);
}
