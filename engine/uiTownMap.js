/**
 * 平行四边形城镇地图绘制常量与几何函数
 */

export const CELL_W = 100;
export const CELL_H = 70;       // 纵向压缩，营造一点透视感
export const SLANT = 40;        // 每行向右偏移量（平行四边形效果）
export const BASE_X = 50;      // 网格最左下角格子的左下角X
export const BASE_Y = 520;      // 网格最左下角格子的底部Y（y=0行底部）

/**
 * 获取格子 (gx, gy) 的平行四边形四个角
 * gy=0 为最下行（屏幕底部），gy=4 为最上行（屏幕顶部）
 */
export function getCellCorners(gx, gy) {
  const yOff = gy; // 行号（0=底部）
  const blx = BASE_X + gx * CELL_W + yOff * SLANT;
  const bly = BASE_Y - yOff * CELL_H;
  const brx = blx + CELL_W;
  const bry = bly;
  const trx = brx + SLANT;
  const tryy = bly - CELL_H;
  const tlx = blx + SLANT;
  const tly = tryy;
  return { bl: {x:blx,y:bly}, br: {x:brx,y:bry}, tr: {x:trx,y:tryy}, tl: {x:tlx,y:tly} };
}

/** 获取格子中心 */
export function getCellCenter(gx, gy) {
  const yOff = gy;
  return {
    x: BASE_X + gx * CELL_W + CELL_W / 2 + yOff * SLANT + SLANT / 2,
    y: BASE_Y - yOff * CELL_H - CELL_H / 2
  };
}

/**
 * 获取平行四边形透视中心线上指定y处的x坐标
 * 透视中心线 = 下边中点 → 上边中点
 */
export function getPerspectiveCenterX(gx, gy, y) {
  const bly = BASE_Y - gy * CELL_H;
  const bottomMidX = BASE_X + gx * CELL_W + gy * SLANT + CELL_W / 2;
  // t = 0 在底边, t = 1 在顶边
  const t = (bly - y) / CELL_H;
  return bottomMidX + t * SLANT;
}

/**
 * 获取格子底边附近的位置（透视居中）
 * @param {number} offset 距离底边的像素偏移（正数=向上偏移）
 */
export function getCellBottomCenter(gx, gy, offset = 2) {
  const bly = BASE_Y - gy * CELL_H;
  return {
    x: getPerspectiveCenterX(gx, gy, bly - offset),
    y: bly - offset
  };
}

/**
 * 获取格子顶边附近的位置（透视居中）  
 * @param {number} offset 距离顶边的像素偏移（正数=向下偏移）
 */
export function getCellTopCenter(gx, gy, offset = 4) {
  const tly = BASE_Y - gy * CELL_H - CELL_H;
  return {
    x: getPerspectiveCenterX(gx, gy, tly + offset),
    y: tly + offset
  };
}

/** 判断鼠标点是否在平行四边形内 */
export function pointInParallelogram(mx, my, corners) {
  // 使用叉积分法检查点是否在凸四边形内
  function cross(ax, ay, bx, by) { return ax * by - ay * bx; }
  const edges = [
    { sx: corners.bl.x, sy: corners.bl.y, ex: corners.br.x, ey: corners.br.y },
    { sx: corners.br.x, sy: corners.br.y, ex: corners.tr.x, ey: corners.tr.y },
    { sx: corners.tr.x, sy: corners.tr.y, ex: corners.tl.x, ey: corners.tl.y },
    { sx: corners.tl.x, sy: corners.tl.y, ex: corners.bl.x, ey: corners.bl.y }
  ];
  for (const e of edges) {
    const ex = e.ex - e.sx, ey = e.ey - e.sy;
    const dx = mx - e.sx, dy = my - e.sy;
    if (cross(ex, ey, dx, dy) < 0) return false;
  }
  return true;
}
