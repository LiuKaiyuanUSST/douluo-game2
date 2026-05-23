/**
 * 城镇图标的绘制函数（木牌、森林石碑、建筑）
 * 森林图标分为两部分：远景树林（靠右/远）和近景石墩（靠左），分开绘制，各自独立定位
 * 
 * 所有建筑/标志物均使用 3D 等轴测透视绘制，贴合平行四边形网格的透视方向
 * 透视方向：SLANT=40px右移/每行，CELL_H=70px上移/每行
 * 3D深度方向：向右上延伸 (dx=+35, dy≈-61)
 */
import { lightenColor, darkenColor } from './uiTownColors.js';

/** 绘制竖着的木牌（带木纹和立体感） */
export function drawWoodenSign(ctx, cx, cy, text, color, width = 72, height = 60) {
  ctx.save();

  // 整体放大20%（包括木杆、牌面、文字）
  ctx.translate(cx, cy);
  ctx.scale(1.2, 1.2);
  ctx.translate(-cx, -cy);

  // --- 木杆（柱子）---


  ctx.fillStyle = '#6d4c2d';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillRect(cx - 4, cy + 8, 8, 22);

  // 木杆阴影面
  ctx.fillStyle = '#5a3d1f';
  ctx.fillRect(cx + 2, cy + 8, 4, 22);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // --- 牌面主体（带3D厚度的木板）---
  const w = width;
  const h = height;
  const rx = cx - w / 2;
  const ry = cy - h;

  // 牌面正面
  const grad = ctx.createLinearGradient(rx, ry, rx + w, ry);
  grad.addColorStop(0, '#c49a6c');
  grad.addColorStop(0.3, '#d4b08a');
  grad.addColorStop(0.7, '#be905e');
  grad.addColorStop(1, '#a87d4c');
  ctx.fillStyle = grad;

  // 带圆角的矩形牌面
  const r = 6;
  ctx.beginPath();
  ctx.moveTo(rx + r, ry);
  ctx.lineTo(rx + w - r, ry);
  ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + r);
  ctx.lineTo(rx + w, ry + h - r);
  ctx.quadraticCurveTo(rx + w, ry + h, rx + w - r, ry + h);
  ctx.lineTo(rx + r, ry + h);
  ctx.quadraticCurveTo(rx, ry + h, rx, ry + h - r);
  ctx.lineTo(rx, ry + r);
  ctx.quadraticCurveTo(rx, ry, rx + r, ry);
  ctx.closePath();
  ctx.fill();

  // 牌面边框（浮雕感）
  ctx.strokeStyle = '#8b6b44';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 木纹横线
  ctx.strokeStyle = 'rgba(120,80,50,0.2)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const ly = ry + (h / 5) * i;
    ctx.beginPath();
    ctx.moveTo(rx + 4, ly);
    ctx.lineTo(rx + w - 4, ly);
    ctx.stroke();
  }

  // 牌面右侧厚度（3D效果）
  ctx.fillStyle = '#8b6b44';
  ctx.beginPath();
  ctx.moveTo(rx + w, ry + r);
  ctx.lineTo(rx + w + 5, ry + r + 3);
  ctx.lineTo(rx + w + 5, ry + h - r + 3);
  ctx.lineTo(rx + w, ry + h - r);
  ctx.closePath();
  ctx.fill();

  // 牌面底部厚度
  ctx.fillStyle = '#7a5c38';
  ctx.beginPath();
  ctx.moveTo(rx + r, ry + h);
  ctx.lineTo(rx + r + 3, ry + h + 4);
  ctx.lineTo(rx + w - r + 3, ry + h + 4);
  ctx.lineTo(rx + w - r, ry + h);
  ctx.closePath();
  ctx.fill();

  // --- 牌面文字 ---
  ctx.fillStyle = '#3a2818';
  ctx.font = 'bold 23px "楷体", "KaiTi", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 1;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // 文字换行（最多两行）
  const mid = Math.ceil(text.length / 2);
  const line1 = text.substring(0, mid);
  const line2 = text.substring(mid);
  if (line2) {
    ctx.fillText(line1, cx, ry + h / 2 - 8);
    ctx.fillText(line2, cx, ry + h / 2 + 10);
  } else {
    ctx.fillText(line1, cx, ry + h / 2);
  }

  ctx.restore();
}

/**
 * 绘制森林的远景树林（位于格子正中心，先于石墩绘制）
 * 面积约放大2~3倍，更加醒目
 */
export function drawForestTrees(ctx, cx, cy, color) {
  ctx.save();

  const farColor = darkenColor(color, 60);
  const midColor = darkenColor(color, 40);

  // 三棵大松树（再放大20%）
  ctx.fillStyle = farColor;
  ctx.beginPath();
  ctx.moveTo(cx - 31, cy - 12);
  ctx.lineTo(cx - 16, cy - 74);
  ctx.lineTo(cx, cy - 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = farColor;
  ctx.beginPath();
  ctx.moveTo(cx + 6, cy - 10);
  ctx.lineTo(cx + 22, cy - 82);
  ctx.lineTo(cx + 37, cy - 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = midColor;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy - 11);
  ctx.lineTo(cx + 6, cy - 94);
  ctx.lineTo(cx + 25, cy - 11);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/** 绘制森林的石碑/石墩（近景、偏左），在 pass 2 绘制 */
export function drawForestIcon(ctx, cx, cy, text, color, width = 82, height = 80) {
  ctx.save();

  // 整体放大20%（包括石碑、铜钉、文字）
  ctx.translate(cx, cy);
  ctx.scale(1.2, 1.2);
  ctx.translate(-cx, -cy);

  // 石墩靠左偏移（透视近景偏左）

  const stoneCenterX = cx - 16;
  const stoneBottom = cy + 34;
  const stoneW = 70;
  const stoneH = 52;
  const stoneRx = stoneCenterX - stoneW / 2;
  const stoneRy = stoneBottom - stoneH;

  // 石碑阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(stoneCenterX + 3, stoneBottom + 3, stoneW / 2 + 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 石碑主体
  const stoneGrad = ctx.createLinearGradient(stoneRx, stoneRy, stoneRx + stoneW, stoneBottom);
  stoneGrad.addColorStop(0, '#a09080');
  stoneGrad.addColorStop(0.3, '#c8b8a8');
  stoneGrad.addColorStop(0.6, '#b0a090');
  stoneGrad.addColorStop(1, '#887868');
  ctx.fillStyle = stoneGrad;

  ctx.beginPath();
  ctx.moveTo(stoneRx + 4, stoneRy);
  ctx.lineTo(stoneRx + stoneW - 4, stoneRy);
  ctx.quadraticCurveTo(stoneRx + stoneW + 2, stoneRy + 2, stoneRx + stoneW, stoneRy + 4);
  ctx.lineTo(stoneRx + stoneW, stoneBottom - 4);
  ctx.quadraticCurveTo(stoneRx + stoneW + 2, stoneBottom - 2, stoneRx + stoneW - 4, stoneBottom);
  ctx.lineTo(stoneRx + 4, stoneBottom);
  ctx.quadraticCurveTo(stoneRx - 2, stoneBottom - 2, stoneRx, stoneBottom - 4);
  ctx.lineTo(stoneRx, stoneRy + 4);
  ctx.quadraticCurveTo(stoneRx - 2, stoneRy + 2, stoneRx + 4, stoneRy);
  ctx.closePath();
  ctx.fill();

  // 石碑右侧厚度（3D效果）
  ctx.fillStyle = '#7a6a5a';
  ctx.beginPath();
  ctx.moveTo(stoneRx + stoneW, stoneRy + 4);
  ctx.lineTo(stoneRx + stoneW + 5, stoneRy + 8);
  ctx.lineTo(stoneRx + stoneW + 5, stoneBottom - 2);
  ctx.lineTo(stoneRx + stoneW, stoneBottom - 4);
  ctx.closePath();
  ctx.fill();

  // 石碑底部厚度
  ctx.fillStyle = '#6a5a4a';
  ctx.beginPath();
  ctx.moveTo(stoneRx + 4, stoneBottom);
  ctx.lineTo(stoneRx + 6, stoneBottom + 4);
  ctx.lineTo(stoneRx + stoneW - 2, stoneBottom + 4);
  ctx.lineTo(stoneRx + stoneW - 4, stoneBottom);
  ctx.closePath();
  ctx.fill();

  // 石碑边框（浅浮雕）
  ctx.strokeStyle = '#9a8a7a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(stoneRx + 6, stoneRy + 6);
  ctx.lineTo(stoneRx + stoneW - 6, stoneRy + 6);
  ctx.lineTo(stoneRx + stoneW - 6, stoneBottom - 6);
  ctx.lineTo(stoneRx + 6, stoneBottom - 6);
  ctx.closePath();
  ctx.stroke();

  // 石碑四角铜钉
  ctx.fillStyle = '#b8a080';
  const dots = [
    [stoneRx + 7, stoneRy + 7],
    [stoneRx + stoneW - 7, stoneRy + 7],
    [stoneRx + 7, stoneBottom - 7],
    [stoneRx + stoneW - 7, stoneBottom - 7]
  ];
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 石碑上的大字标题（随石墩）
  ctx.fillStyle = '#3a2818';
  ctx.font = 'bold 24px "楷体", "KaiTi", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  const textMid = Math.ceil(text.length / 2);
  const l1 = text.substring(0, textMid);
  const l2 = text.substring(textMid);
  if (l2) {
    ctx.fillText(l1, stoneCenterX, stoneRy + stoneH / 2 - 8);
    ctx.fillText(l2, stoneCenterX, stoneRy + stoneH / 2 + 10);
  } else {
    ctx.fillText(l1, stoneCenterX, stoneRy + stoneH / 2);
  }

  ctx.restore();
}

/** 绘制3D建筑物正面（等轴测透视，带立体屋顶、侧墙） */
export function drawBuildingFront(ctx, cx, cy, text, color, width = 96, height = 66) {
  ctx.save();

  const w = width;
  const h = height;
  const rx = cx - w / 2; // 左边缘x
  const ry = cy - h;     // 顶边缘y

  // 3D深度参数（沿SLANT透视方向延伸）
  // SLANT=40, CELL_H=70 → 方向向量 (40, -70)
  const depth = 35;
  const slantX = depth;                       // 水平延伸
  const slantY = -depth * 70 / 40;            // 垂直延伸（向上为负）

  // ===== 1. 右侧墙（3D纵深方向） =====
  ctx.fillStyle = darkenColor(color, 50);
  ctx.beginPath();
  ctx.moveTo(rx + w, cy);                      // 前右下
  ctx.lineTo(rx + w + slantX, cy + slantY);    // 后右下
  ctx.lineTo(rx + w + slantX, ry + slantY);    // 后右上
  ctx.lineTo(rx + w, ry);                      // 前右上
  ctx.closePath();
  ctx.fill();

  // 右侧墙边线
  ctx.strokeStyle = darkenColor(color, 65);
  ctx.lineWidth = 1;
  ctx.stroke();

  // ===== 2. 建筑物正面 =====
  const grad = ctx.createLinearGradient(rx, ry, rx + w, ry + h);
  grad.addColorStop(0, color);
  grad.addColorStop(0.4, lightenColor(color, 30));
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, darkenColor(color, 40));
  ctx.fillStyle = grad;

  // 圆角矩形正面
  const r = 4;
  ctx.beginPath();
  ctx.moveTo(rx + r, ry);
  ctx.lineTo(rx + w - r, ry);
  ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + r);
  ctx.lineTo(rx + w, cy - r);
  ctx.quadraticCurveTo(rx + w, cy, rx + w - r, cy);
  ctx.lineTo(rx + r, cy);
  ctx.quadraticCurveTo(rx, cy, rx, cy - r);
  ctx.lineTo(rx, ry + r);
  ctx.quadraticCurveTo(rx, ry, rx + r, ry);
  ctx.closePath();
  ctx.fill();

  // 正面边框
  ctx.strokeStyle = darkenColor(color, 55);
  ctx.lineWidth = 2;
  ctx.stroke();

  // ===== 3. 屋顶（人字形，3D透视） =====
  const roofH = 14;      // 屋顶脊高
  const overhang = 6;    // 屋檐挑出

  // 3a) 正面三角形山墙（左半边）
  ctx.fillStyle = darkenColor(color, 25);
  ctx.beginPath();
  ctx.moveTo(rx - overhang, ry);
  ctx.lineTo(cx, ry - roofH);
  ctx.lineTo(cx, ry);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darkenColor(color, 50);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3b) 正面三角形山墙（右半边）
  ctx.fillStyle = darkenColor(color, 20);
  ctx.beginPath();
  ctx.moveTo(cx, ry);
  ctx.lineTo(cx, ry - roofH);
  ctx.lineTo(rx + w + overhang, ry);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3c) 右侧屋顶斜面（3D纵深）
  ctx.fillStyle = darkenColor(color, 38);
  ctx.beginPath();
  ctx.moveTo(cx, ry - roofH);                                // 屋脊前端
  ctx.lineTo(cx + slantX, ry + slantY - roofH);              // 屋脊后端
  ctx.lineTo(rx + w + overhang + slantX, ry + slantY);       // 后右屋檐
  ctx.lineTo(rx + w + overhang, ry);                         // 前右屋檐
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darkenColor(color, 55);
  ctx.lineWidth = 1;
  ctx.stroke();

  // 3d) 左侧屋顶斜面（3D纵深）
  ctx.fillStyle = darkenColor(color, 32);
  ctx.beginPath();
  ctx.moveTo(cx, ry - roofH);                                // 屋脊前端
  ctx.lineTo(cx + slantX, ry + slantY - roofH);              // 屋脊后端
  ctx.lineTo(rx - overhang + slantX, ry + slantY);           // 后左屋檐
  ctx.lineTo(rx - overhang, ry);                             // 前左屋檐
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 屋脊线（脊梁）
  ctx.strokeStyle = darkenColor(color, 50);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, ry - roofH);
  ctx.lineTo(cx + slantX, ry + slantY - roofH);
  ctx.stroke();

  // ===== 4. 门 =====
  ctx.fillStyle = darkenColor(color, 50);
  const doorW = 20, doorH = 28;
  const doorX = cx - doorW / 2;
  const doorY = cy - doorH;
  ctx.beginPath();
  ctx.rect(doorX, doorY, doorW, doorH);
  ctx.fill();
  // 门拱
  ctx.beginPath();
  ctx.arc(cx, doorY, doorW / 2, Math.PI, 0);
  ctx.fill();
  // 门边框
  ctx.strokeStyle = darkenColor(color, 65);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(doorX, doorY, doorW, doorH);
  ctx.stroke();

  // ===== 5. 窗户装饰条纹 =====
  const winSize = 8;
  ctx.fillStyle = lightenColor(color, 45);
  ctx.strokeStyle = darkenColor(color, 50);
  ctx.lineWidth = 1;
  for (let i = 0; i < 2; i++) {
    const wx = cx - 18 + i * 24;
    ctx.fillRect(wx, ry + 12, winSize, winSize);
    ctx.strokeRect(wx, ry + 12, winSize, winSize);
    // 窗内十字格
    ctx.beginPath();
    ctx.moveTo(wx + winSize / 2, ry + 12);
    ctx.lineTo(wx + winSize / 2, ry + 12 + winSize);
    ctx.moveTo(wx, ry + 12 + winSize / 2);
    ctx.lineTo(wx + winSize, ry + 12 + winSize / 2);
    ctx.stroke();
  }

  // ===== 6. 建筑底部阴影 =====
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.moveTo(rx, cy);
  ctx.lineTo(rx + w, cy);
  ctx.lineTo(rx + w + slantX, cy + slantY);
  ctx.lineTo(rx + slantX, cy + slantY);
  ctx.closePath();
  ctx.fill();

  // ===== 7. 招牌文字（正面，放大20%） =====
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 31px "楷体", "KaiTi", serif';

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  const mid = Math.ceil(text.length / 2);
  const line1 = text.substring(0, mid);
  const line2 = text.substring(mid);
  if (line2) {
    ctx.fillText(line1, cx, ry + h / 2 - 10);
    ctx.fillText(line2, cx, ry + h / 2 + 10);
  } else {
    ctx.fillText(line1, cx, ry + h / 2);
  }

  ctx.restore();
}
