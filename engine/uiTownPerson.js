/**
 * 3D风格跑步小人动画绘制（唐三·斗罗大陆风格）
 * 使用Canvas 2D绘制具有3D立体感的动漫风格角色
 * 包含三帧动画：站立、迈右腿、迈左腿
 * 
 * 设计理念：
 * - 采用等轴测（isometric）透视视角，贴合游戏地图的平行四边形网格
 * - 使用多层渐变、阴影和高光模拟3D光照效果
 * - 还原唐三标志性的蓝色劲装与长发造型
 * - 优化比例（Q版二头身，但保留足够的细节辨识度）
 */

/**
 * 绘制3D风格跑步角色
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - 中心X坐标
 * @param {number} cy - 中心Y坐标
 * @param {number} frame - 帧号 (0=站立, 1=迈右腿, 2=迈左腿)
 * @param {number} dx - X方向移动
 * @param {number} dy - Y方向移动
 * @param {number} progress - 移动进度 (0~1)
 */
export function drawRunningPerson(ctx, cx, cy, frame, dx, dy, progress) {
  const facingRight = dx > 0 || (dx === 0 && dy !== 0);
  const isVertical = dy !== 0;

  ctx.save();
  ctx.translate(cx, cy);

  if (!facingRight && dx !== 0) {
    ctx.scale(-1, 1);
  }

  const f = frame % 3;

  // ---- 地面阴影（椭圆形，根据动画略有变化） ----
  ctx.save();
  const shadowScaleX = f === 0 ? 1.0 : 0.85;
  const shadowScaleY = f === 0 ? 1.0 : 0.9;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 28, 18 * shadowScaleX, 6 * shadowScaleY, 0, 0, Math.PI * 2);
  ctx.fill();
  // 阴影外围柔光
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, 28, 24 * shadowScaleX, 9 * shadowScaleY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ---- 身体起伏（跑步时的弹跳感） ----
  let bob = 0;
  if (f === 1) bob = -3;
  else if (f === 2) bob = -1.5;
  if (!isVertical) bob = (f === 1) ? -3.5 : (f === 2 ? -1.5 : 0);

  // ============================================================
  //  1. 披风（在身体最下层绘制）
  // ============================================================
  drawCape(ctx, f, bob);

  // ============================================================
  //  2. 腿部（裤子+鞋子，有3D立体感）
  // ============================================================
  drawLegs(ctx, f, bob);

  // ============================================================
  //  3. 身体（躯干+腰带+衣服细节）
  // ============================================================
  drawBody(ctx, f, bob);

  // ============================================================
  //  4. 手臂
  // ============================================================
  drawArms(ctx, f, bob);

  // ============================================================
  //  5. 头部
  // ============================================================
  drawHead(ctx, f, bob);

  // ---- 残影/速度线（跑步时） ----
  if (f > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(100,180,255,0.15)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const sx = -18 - i * 8 + (f === 2 ? -3 : 0);
      const sy = -2 + bob + i * 6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - 12, sy - 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

// 手动圆角矩形（兼容不支持 roundRect 的浏览器）
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================================================
//  脸部绘制
// ============================================================
function drawFace(ctx, bob) {
  // 脸部皮肤 - 使用径向渐变制造立体感
  const faceGrad = ctx.createRadialGradient(-2, -18 + bob, 2, 0, -18 + bob, 11);
  faceGrad.addColorStop(0, '#fff5e6');
  faceGrad.addColorStop(0.4, '#fce4d6');
  faceGrad.addColorStop(0.7, '#f0c8a0');
  faceGrad.addColorStop(1, '#d4a87a');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(0, -18 + bob, 9.5, 10.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 脸颊红晕
  ctx.save();
  ctx.fillStyle = 'rgba(255,150,150,0.2)';
  ctx.beginPath();
  ctx.ellipse(-6, -14 + bob, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, -14 + bob, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============================================================
//  眼睛绘制 - 动漫风格大眼睛
// ============================================================
function drawEyes(ctx, bob) {
  // 左眼白
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-4, -17 + bob, 2.8, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // 右眼白
  ctx.beginPath();
  ctx.ellipse(4, -17 + bob, 2.8, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 左瞳孔（带双高光）
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(-4, -16.8 + bob, 1.6, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-3.2, -17.5 + bob, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-4.6, -16.2 + bob, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // 右瞳孔
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(4, -16.8 + bob, 1.6, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(4.8, -17.5 + bob, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3.4, -16.2 + bob, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // 上眼睫毛
  ctx.strokeStyle = '#2c1810';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-4, -17.2 + bob, 2.8, 2.2, 0, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(4, -17.2 + bob, 2.8, 2.2, 0, Math.PI, 0);
  ctx.stroke();

  // 眉毛
  ctx.strokeStyle = '#2c1810';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-6.5, -20 + bob);
  ctx.lineTo(-2, -20.5 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6.5, -20 + bob);
  ctx.lineTo(2, -20.5 + bob);
  ctx.stroke();
}

// ============================================================
//  嘴巴绘制
// ============================================================
function drawMouth(ctx, bob) {
  // 微笑
  ctx.strokeStyle = '#c0736a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -14 + bob, 2.8, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // 嘴唇下方阴影
  ctx.fillStyle = 'rgba(180,100,90,0.1)';
  ctx.beginPath();
  ctx.ellipse(0, -13 + bob, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================
//  头部综合
// ============================================================
function drawHead(ctx, f, bob) {
  drawHairBack(ctx, bob);
  drawFace(ctx, bob);
  drawEyes(ctx, bob);
  drawMouth(ctx, bob);
  drawHairFront(ctx, bob);
  drawNeck(ctx, bob);
}

// 后侧头发
function drawHairBack(ctx, bob) {
  const hairGrad = ctx.createLinearGradient(-12, -28 + bob, 12, -10 + bob);
  hairGrad.addColorStop(0, '#1a1a4e');
  hairGrad.addColorStop(0.3, '#2a2a6e');
  hairGrad.addColorStop(0.6, '#3a3a8e');
  hairGrad.addColorStop(1, '#1a1a4e');

  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.ellipse(0, -24 + bob, 13, 11, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.fill();

  // 后侧头发高光
  ctx.save();
  ctx.fillStyle = 'rgba(100,140,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(-3, -27 + bob, 4, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 长发飘带（左右各一束）
  ctx.save();
  ctx.fillStyle = '#1a1a5e';
  ctx.beginPath();
  ctx.moveTo(-11, -22 + bob);
  ctx.quadraticCurveTo(-16, -15 + bob, -14, -5 + bob);
  ctx.quadraticCurveTo(-12, -12 + bob, -9, -20 + bob);
  ctx.fill();
  ctx.fillStyle = 'rgba(80,120,255,0.15)';
  ctx.beginPath();
  ctx.moveTo(-12, -20 + bob);
  ctx.quadraticCurveTo(-15, -14 + bob, -13, -7 + bob);
  ctx.quadraticCurveTo(-11, -14 + bob, -10, -18 + bob);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#1a1a5e';
  ctx.beginPath();
  ctx.moveTo(11, -22 + bob);
  ctx.quadraticCurveTo(16, -15 + bob, 14, -5 + bob);
  ctx.quadraticCurveTo(12, -12 + bob, 9, -20 + bob);
  ctx.fill();
  ctx.fillStyle = 'rgba(80,120,255,0.15)';
  ctx.beginPath();
  ctx.moveTo(12, -20 + bob);
  ctx.quadraticCurveTo(15, -14 + bob, 13, -7 + bob);
  ctx.quadraticCurveTo(11, -14 + bob, 10, -18 + bob);
  ctx.fill();
  ctx.restore();
}

// 前侧头发（刘海）
function drawHairFront(ctx, bob) {
  ctx.save();
  ctx.fillStyle = '#2a2a7e';
  // 中间尖刘海
  ctx.beginPath();
  ctx.moveTo(-2, -28 + bob);
  ctx.quadraticCurveTo(-1, -21 + bob, 0, -17 + bob);
  ctx.quadraticCurveTo(1, -21 + bob, 2, -28 + bob);
  ctx.fill();

  // 左刘海
  ctx.beginPath();
  ctx.moveTo(-8, -27 + bob);
  ctx.quadraticCurveTo(-7, -20 + bob, -5, -16 + bob);
  ctx.quadraticCurveTo(-4, -20 + bob, -5, -28 + bob);
  ctx.fill();

  // 右刘海
  ctx.beginPath();
  ctx.moveTo(8, -27 + bob);
  ctx.quadraticCurveTo(7, -20 + bob, 5, -16 + bob);
  ctx.quadraticCurveTo(4, -20 + bob, 5, -28 + bob);
  ctx.fill();

  // 刘海高光
  ctx.fillStyle = 'rgba(120,160,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(-3, -25 + bob, 3, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4, -24 + bob, 2.5, 3.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 颈部
function drawNeck(ctx, bob) {
  ctx.save();
  const neckGrad = ctx.createLinearGradient(-3, -8 + bob, 3, -4 + bob);
  neckGrad.addColorStop(0, '#f0c8a0');
  neckGrad.addColorStop(0.5, '#e8b890');
  neckGrad.addColorStop(1, '#d4a87a');
  ctx.fillStyle = neckGrad;
  roundRect(ctx, -3.5, -8 + bob, 7, 5, 2);
  ctx.fill();
  ctx.restore();
}

// ============================================================
//  身体（躯干）绘制 - 唐三蓝色劲装
// ============================================================
function drawBody(ctx, f, bob) {
  // 身体主体
  const bodyGrad = ctx.createLinearGradient(-11, -5 + bob, 11, 5 + bob);
  bodyGrad.addColorStop(0, '#3a7bd5');
  bodyGrad.addColorStop(0.2, '#4a8de5');
  bodyGrad.addColorStop(0.5, '#5a9df0');
  bodyGrad.addColorStop(0.8, '#4a8de5');
  bodyGrad.addColorStop(1, '#2a6aaa');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0 + bob, 10.5, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 身体轮廓线
  ctx.strokeStyle = '#1a5a9a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0 + bob, 10.5, 6.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 衣领 - V领
  ctx.save();
  ctx.fillStyle = '#1a5a9a';
  ctx.beginPath();
  ctx.moveTo(-4, -7 + bob);
  ctx.lineTo(0, -2 + bob);
  ctx.lineTo(4, -7 + bob);
  ctx.lineTo(-4, -7 + bob);
  ctx.fill();
  ctx.restore();

  // 衣领白色内衬
  ctx.save();
  ctx.fillStyle = '#e8e8f0';
  ctx.beginPath();
  ctx.moveTo(-3, -7 + bob);
  ctx.lineTo(0, -3 + bob);
  ctx.lineTo(3, -7 + bob);
  ctx.fill();
  ctx.restore();

  // 衣服两侧装饰线条
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-6, -3 + bob);
  ctx.lineTo(-6, 3 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -3 + bob);
  ctx.lineTo(6, 3 + bob);
  ctx.stroke();
  ctx.restore();

  // 腰部/腰带
  drawBelt(ctx, bob);

  // 衣服下摆
  ctx.save();
  ctx.fillStyle = '#2a6aaa';
  ctx.beginPath();
  ctx.moveTo(-9, 5 + bob);
  ctx.quadraticCurveTo(-8, 9 + bob, -6, 8 + bob);
  ctx.lineTo(6, 8 + bob);
  ctx.quadraticCurveTo(8, 9 + bob, 9, 5 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 腰带
function drawBelt(ctx, bob) {
  const beltGrad = ctx.createLinearGradient(-10, 5 + bob, 10, 9 + bob);
  beltGrad.addColorStop(0, '#8b4513');
  beltGrad.addColorStop(0.3, '#a0522d');
  beltGrad.addColorStop(0.7, '#cd853f');
  beltGrad.addColorStop(1, '#8b4513');
  ctx.fillStyle = beltGrad;
  ctx.fillRect(-9.5, 4 + bob, 19, 4);

  // 金色腰带扣（发光效果）
  ctx.save();
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = 'rgba(255,215,0,0.4)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.ellipse(0, 6 + bob, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#daa520';
  ctx.beginPath();
  ctx.ellipse(0, 6 + bob, 1.5, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============================================================
//  腿部绘制（裤子+鞋子）
// ============================================================
function drawLegs(ctx, f, bob) {
  const pantsGrad = ctx.createLinearGradient(-9, 8 + bob, 9, 26 + bob);
  pantsGrad.addColorStop(0, '#2c3e50');
  pantsGrad.addColorStop(0.3, '#34495e');
  pantsGrad.addColorStop(0.6, '#2c3e50');
  pantsGrad.addColorStop(1, '#1a252f');

  if (f === 0) {
    // 站立帧 - 双脚并拢
    ctx.fillStyle = pantsGrad;
    roundRect(ctx, -8, 7 + bob, 7, 16, 3);
    ctx.fill();
    roundRect(ctx, 1, 7 + bob, 7, 16, 3);
    ctx.fill();

    drawShoes(ctx, -4.5, 22 + bob, 7, 4);
    drawShoes(ctx, 4.5, 22 + bob, 7, 4);
  } else if (f === 1) {
    // 迈右腿 - 右前左后
    // 右腿（前）
    ctx.save();
    ctx.fillStyle = '#2c3e50';
    ctx.translate(5, 7 + bob);
    ctx.rotate(0.15);
    roundRect(ctx, -3, 0, 7, 18, 3);
    ctx.fill();
    ctx.restore();
    drawShoesRotated(ctx, 8, 24 + bob, 7, 4, 0.15);

    // 左腿（后）
    ctx.save();
    ctx.fillStyle = '#1a252f';
    ctx.translate(-5, 7 + bob);
    ctx.rotate(-0.2);
    roundRect(ctx, -3, 0, 7, 18, 3);
    ctx.fill();
    ctx.restore();
    drawShoesRotated(ctx, -8, 24 + bob, 7, 4, -0.2);
  } else {
    // 迈左腿 - 左前右后
    // 左腿（前）
    ctx.save();
    ctx.fillStyle = '#2c3e50';
    ctx.translate(-5, 7 + bob);
    ctx.rotate(-0.15);
    roundRect(ctx, -3, 0, 7, 18, 3);
    ctx.fill();
    ctx.restore();
    drawShoesRotated(ctx, -8, 24 + bob, 7, 4, -0.15);

    // 右腿（后）
    ctx.save();
    ctx.fillStyle = '#1a252f';
    ctx.translate(5, 7 + bob);
    ctx.rotate(0.2);
    roundRect(ctx, -3, 0, 7, 18, 3);
    ctx.fill();
    ctx.restore();
    drawShoesRotated(ctx, 8, 24 + bob, 7, 4, 0.2);
  }
}

// 鞋子绘制
function drawShoes(ctx, x, y, w, h) {
  ctx.save();
  const shoeGrad = ctx.createLinearGradient(x - w / 2, y - h, x + w / 2, y);
  shoeGrad.addColorStop(0, '#5d4037');
  shoeGrad.addColorStop(0.5, '#6d4c41');
  shoeGrad.addColorStop(1, '#4e342e');
  ctx.fillStyle = shoeGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // 鞋底
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(x - w / 2 + 1, y - 1, w - 2, 2);
  ctx.restore();
}

function drawShoesRotated(ctx, x, y, w, h, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const shoeGrad = ctx.createLinearGradient(-w / 2, -h, w / 2, 0);
  shoeGrad.addColorStop(0, '#5d4037');
  shoeGrad.addColorStop(0.5, '#6d4c41');
  shoeGrad.addColorStop(1, '#4e342e');
  ctx.fillStyle = shoeGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(-w / 2 + 1, -1, w - 2, 2);
  ctx.restore();
}

// ============================================================
//  手臂绘制
// ============================================================
function drawArms(ctx, f, bob) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const sleeveGrad = ctx.createLinearGradient(-12, -4 + bob, -8, 8 + bob);
  sleeveGrad.addColorStop(0, '#4a8de5');
  sleeveGrad.addColorStop(0.5, '#3a7bd5');
  sleeveGrad.addColorStop(1, '#2a6aaa');

  if (f === 0) {
    // 站立 - 双臂自然下垂
    ctx.save();
    ctx.strokeStyle = sleeveGrad;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-9, -2 + bob);
    ctx.quadraticCurveTo(-13, 2 + bob, -11, 11 + bob);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#e8b890';
    ctx.beginPath();
    ctx.arc(-11, 11 + bob, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.strokeStyle = sleeveGrad;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(9, -2 + bob);
    ctx.quadraticCurveTo(13, 2 + bob, 11, 11 + bob);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#e8b890';
    ctx.beginPath();
    ctx.arc(11, 11 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (f === 1) {
    // 迈右腿 - 右臂前摆，左臂后摆
    ctx.save();
    ctx.strokeStyle = sleeveGrad;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-9, -3 + bob);
    ctx.quadraticCurveTo(-12, 1 + bob, -14, 8 + bob);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#e8b890';
    ctx.beginPath();
    ctx.arc(-14, 8 + bob, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.strokeStyle = sleeveGrad;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(9, -3 + bob);
    ctx.quadraticCurveTo(12, 2 + bob, 15, 12 + bob);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#e8b890';
    ctx.beginPath();
    ctx.arc(15, 12 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 迈左腿 - 左臂前摆，右臂后摆
    ctx.save();
    ctx.strokeStyle = sleeveGrad;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-9, -3 + bob);
    ctx.quadraticCurveTo(-12, 2 + bob, -15, 12 + bob);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#e8b890';
    ctx.beginPath();
    ctx.arc(-15, 12 + bob, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.strokeStyle = sleeveGrad;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(9, -3 + bob);
    ctx.quadraticCurveTo(12, 1 + bob, 14, 8 + bob);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#e8b890';
    ctx.beginPath();
    ctx.arc(14, 8 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================
//  披风绘制
// ============================================================
function drawCape(ctx, f, bob) {
  ctx.save();

  const capeGrad = ctx.createLinearGradient(-15, -5 + bob, 0, 15 + bob);
  capeGrad.addColorStop(0, '#1a3a5c');
  capeGrad.addColorStop(0.4, '#1e4a6e');
  capeGrad.addColorStop(0.7, '#1a3a5c');
  capeGrad.addColorStop(1, '#0f2a3e');

  ctx.fillStyle = capeGrad;

  // 根据动画帧调整披风飘动
  const capeSwing = f === 1 ? 3 : (f === 2 ? -3 : 0);

  ctx.beginPath();
  ctx.moveTo(-12, -5 + bob);
  ctx.quadraticCurveTo(-14 + capeSwing, 2 + bob, -16 + capeSwing * 1.2, 10 + bob);
  ctx.quadraticCurveTo(-12 + capeSwing * 0.8, 15 + bob, -2, 15 + bob);
  ctx.quadraticCurveTo(4, 14 + bob, 8, 12 + bob);
  ctx.quadraticCurveTo(6 + capeSwing * 0.5, 8 + bob, 4, -5 + bob);
  ctx.closePath();
  ctx.fill();

  // 披风边缘 - 金色镶边
  ctx.strokeStyle = '#8b7d3c';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-12, -5 + bob);
  ctx.quadraticCurveTo(-14 + capeSwing, 2 + bob, -16 + capeSwing * 1.2, 10 + bob);
  ctx.stroke();

  // 披风高光
  ctx.fillStyle = 'rgba(60,120,200,0.15)';
  ctx.beginPath();
  ctx.moveTo(-10, -3 + bob);
  ctx.quadraticCurveTo(-8 + capeSwing * 0.5, 5 + bob, -10 + capeSwing, 12 + bob);
  ctx.quadraticCurveTo(-6 + capeSwing * 0.3, 8 + bob, -4, -3 + bob);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
