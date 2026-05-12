// engine/maze.js
export class MazeManager {
    constructor(size) {
        this.size = size;
        this.px = 0;
        this.py = 0;
        this.explored = Array(size).fill().map(() => Array(size).fill(false));
        this.explored[0][0] = true;

        // 墙壁数据：wallRight[y][x] 表示 (x,y) 右侧有墙（x < size-1）
        // wallDown[y][x] 表示 (x,y) 下方有墙（y < size-1）
        this.wallRight = Array(size).fill().map(() => Array(size).fill(false));
        this.wallDown = Array(size).fill().map(() => Array(size).fill(false));

        // 生成迷宫墙壁
        this.generateWalls();
    }

    // ---------- 连通性检测 Q 函数 ----------
    canReachAll() {
        const size = this.size;
        // 标记数组：0未访问，1已访问但非活跃，2活跃扩展中
        const mark = Array(size).fill().map(() => Array(size).fill(0));
        mark[this.py][this.px] = 2;   // 起点(0,0)实际是(0,0)，这里用当前玩家位置？算法描述中说起点是0,0
        // 按用户描述，起点应为(0,0)，但我们生成时玩家在(0,0)
        const startX = 0, startY = 0;
        mark[startY][startX] = 2;

        let nonZeroCount = 1; // 当前非0格子数
        let prevCount = 0;

        while (nonZeroCount > prevCount) {
            prevCount = nonZeroCount;

            // 1. 将标记为 2 的格子相邻且无墙的格子标记为 1
            const toOne = [];
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (mark[y][x] === 2) {
                        const neighbors = this.getPassableNeighbors(x, y, mark, false);
                        for (const [nx, ny] of neighbors) {
                            if (mark[ny][nx] === 0) {
                                toOne.push([nx, ny]);
                            }
                        }
                    }
                }
            }
            for (const [nx, ny] of toOne) {
                mark[ny][nx] = 1;
                nonZeroCount++;
            }

            // 2. 将所有非0标记统一变为 1
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (mark[y][x] !== 0) mark[y][x] = 1;
                }
            }

            // 3. 找到所有标记为 1 的格子且其邻居存在 0 的，标记为 2
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (mark[y][x] === 1) {
                        const neighbors = this.getPassableNeighbors(x, y, mark, true);
                        for (const [nx, ny] of neighbors) {
                            if (mark[ny][nx] === 0) {
                                mark[y][x] = 2;
                                break;
                            }
                        }
                    }
                }
            }

            // 重新统计非0数量
            nonZeroCount = 0;
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (mark[y][x] !== 0) nonZeroCount++;
                }
            }
        }

        // 检查是否所有格子都可达
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (mark[y][x] === 0) return false;
            }
        }
        return true;
    }

    // 获取四个方向中可通过的邻居（考虑内部墙和边界）
    getPassableNeighbors(x, y, mark, includeBlocked = false) {
        const result = [];
        const size = this.size;
        // 上
        if (y > 0 && !this.wallDown[y-1][x]) {
            result.push([x, y-1]);
        }
        // 下
        if (y < size-1 && !this.wallDown[y][x]) {
            result.push([x, y+1]);
        }
        // 左
        if (x > 0 && !this.wallRight[y][x-1]) {
            result.push([x-1, y]);
        }
        // 右
        if (x < size-1 && !this.wallRight[y][x]) {
            result.push([x+1, y]);
        }
        return result;
    }

    // ---------- 墙壁生成算法 ----------
    generateWalls() {
        const size = this.size;
        // W 矩阵：0表示可尝试拆墙，1表示不再尝试
        const W = Array(size).fill().map(() => Array(size).fill(0));
        let failedCount = 0;  // 连续把 W==0 变成 W==1 的次数

        while (true) {
            // 找所有 W 为 0 的坐标
            const zeros = [];
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (W[y][x] === 0) zeros.push([x, y]);
                }
            }
            if (zeros.length === 0) break;
            if (failedCount >= 3) break;

            // 随机选一个
            const idx = Math.floor(Math.random() * zeros.length);
            const [cx, cy] = zeros[idx];
            let succeed = false;

            // 尝试顺序：右、下、左、上（随机打乱）
            const dirs = [[1,0], [0,1], [-1,0], [0,-1]]; // dx,dy
            // 随机打乱方向顺序
            for (let i = dirs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
            }

            for (const [dx, dy] of dirs) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;

                // 判断方向对应哪堵墙
                let wallModified = false;
                if (dx === 1 && cx < size-1 && !this.wallRight[cy][cx]) {
                    this.wallRight[cy][cx] = true;
                    wallModified = true;
                } else if (dx === -1 && cx > 0 && !this.wallRight[cy][cx-1]) {
                    this.wallRight[cy][cx-1] = true;
                    wallModified = true;
                } else if (dy === 1 && cy < size-1 && !this.wallDown[cy][cx]) {
                    this.wallDown[cy][cx] = true;
                    wallModified = true;
                } else if (dy === -1 && cy > 0 && !this.wallDown[cy-1][cx]) {
                    this.wallDown[cy-1][cx] = true;
                    wallModified = true;
                }

                if (wallModified) {
                    if (this.canReachAll()) {
                        succeed = true;
                        break;
                    } else {
                        // 撤销
                        if (dx === 1 && cx < size-1) this.wallRight[cy][cx] = false;
                        else if (dx === -1 && cx > 0) this.wallRight[cy][cx-1] = false;
                        else if (dy === 1 && cy < size-1) this.wallDown[cy][cx] = false;
                        else if (dy === -1 && cy > 0) this.wallDown[cy-1][cx] = false;
                    }
                }
            }

            if (!succeed) {
                W[cy][cx] = 1;
                failedCount++;
            } else {
                failedCount = 0;
            }
        }
    }

    // ---------- 玩家移动 ----------
    canMove(dx, dy) {
        const nx = this.px + dx;
        const ny = this.py + dy;
        if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) return false;
        // 检查是否有墙
        if (dx === -1 && this.wallRight[this.py][this.px-1]) return false;
        if (dx === 1 && this.wallRight[this.py][this.px]) return false;
        if (dy === -1 && this.wallDown[this.py-1][this.px]) return false;
        if (dy === 1 && this.wallDown[this.py][this.px]) return false;
        return true;
    }

    move(dx, dy) {
        if (!this.canMove(dx, dy)) return false;
        this.px += dx;
        this.py += dy;
        this.explored[this.py][this.px] = true;
        return true;
    }

    isBossCell() {
        return this.px === this.size - 1 && this.py === this.size - 1;
    }
}