// engine/maze.js
export class MazeManager {
    constructor(size, options = {}) {
        this.size = size;
        this.px = options.startX || 0;
        this.py = options.startY || 0;
        this.explored = Array(size).fill().map(() => Array(size).fill(false));
        this.explored[this.py][this.px] = true;

        // 墙壁数据：wallRight[y][x] 表示 (x,y) 右侧有墙（x < size-1）
        // wallDown[y][x] 表示 (x,y) 下方有墙（y < size-1）
        this.wallRight = Array(size).fill().map(() => Array(size).fill(false));
        this.wallDown = Array(size).fill().map(() => Array(size).fill(false));

        // 猎魂森林相关属性
        this.isHuntingForest = false;      // 是否为猎魂森林模式
        this.bossPositions = [];           // 7个boss的位置 [{x, y}]
        this.bossDefeated = [];            // 每个boss是否已被击败
        this.startPosition = { x: options.startX || 0, y: options.startY || 0 }; // 起点位置
        this.bossCells = new Set();        // 所有boss格坐标的字符串集合 "x,y"

        // 新增：特殊迷宫属性
        if (options.blockedCells) {
            this.blockedCells = new Set(options.blockedCells.map(([x, y]) => `${x},${y}`));
        } else {
            this.blockedCells = new Set();
        }
        this.endX = options.endX !== undefined ? options.endX : size - 1;
        this.endY = options.endY !== undefined ? options.endY : size - 1;
        this._isCustomMaze = options.isCustomMaze || false;
        this._customMazeName = options.customMazeName || '';

        // 预先设置指定墙壁（在随机生成之前）
        if (options.preSetWalls) {
            for (const wall of options.preSetWalls) {
                const { x, y, dir } = wall;
                if (dir === 'right' && x < size - 1) this.wallRight[y][x] = true;
                else if (dir === 'left' && x > 0) this.wallRight[y][x-1] = true;
                else if (dir === 'down' && y < size - 1) this.wallDown[y][x] = true;
                else if (dir === 'up' && y > 0) this.wallDown[y-1][x] = true;
            }
        }

        // 生成迷宫墙壁
        this.generateWalls();

    }


    // ---------- 设置猎魂森林模式 ----------
    setupHuntingForest() {
        this.isHuntingForest = true;

        // 固定地图布局：2是起点，1是boss位置
        // 20101
        // 00000
        // 10001
        // 00000
        // 10101
        const layout = [
            [2, 0, 1, 0, 1],
            [0, 0, 0, 0, 0],
            [1, 0, 0, 0, 1],
            [0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1]
        ];

        // 收集所有boss位置
        const bossPositions = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (layout[y][x] === 1) {
                    bossPositions.push({ x, y });
                    this.bossCells.add(`${x},${y}`);
                } else if (layout[y][x] === 2) {
                    this.startPosition = { x, y };
                }
            }
        }

        // 7个魂兽
        const soulBeasts = [
            { name: '鬼藤', affinity: '苍木', desc: '寄生藤蔓，绞杀无声', color: '#27ae60' },
            { name: '幽冥狼', affinity: '雷霆', desc: '群猎幽影，疾风迅雷', color: '#3498db' },
            { name: '海蝰蛇', affinity: '沧澜', desc: '浅海小蛇，游速极快', color: '#1abc9c' },
            { name: '火蜥蜴', affinity: '烈焰', desc: '百年火蜥，吐焰灼身', color: '#e74c3c' },
            { name: '曼陀罗蛇', affinity: '蛊毒', desc: '剧毒蛇牙，一击麻痹', color: '#8e44ad' },
            { name: '蛮牛', affinity: '巨兽', desc: '百年蛮牛，冲撞裂石', color: '#f39c12' },
            { name: '板斧', affinity: '天工', desc: '阔刃板斧，劈木开山', color: '#e67e22' }
        ];

        // 随机打乱魂兽顺序，分配到7个位置
        const shuffled = [...soulBeasts].sort(() => Math.random() - 0.5);
        this.bossPositions = bossPositions.map((pos, i) => ({
            ...pos,
            ...shuffled[i],
            defeated: false
        }));
        this.bossDefeated = bossPositions.map(() => false);

        // 设置玩家起点
        this.px = this.startPosition.x;
        this.py = this.startPosition.y;
        this.explored = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.explored[this.py][this.px] = true;

        // 重置墙壁并重新生成（使用猎魂森林专用连通性检测）
        this.wallRight = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.wallDown = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.generateWalls();
    }

    // ---------- 连通性检测 Q 函数（支持自定义起点和堵墙） ----------
    canReachAll() {
        const size = this.size;
        const mark = Array(size).fill().map(() => Array(size).fill(0));
        
        // 预标记堵墙格子为已访问（忽略它们）
        for (const key of this.blockedCells) {
            const [bx, by] = key.split(',').map(Number);
            if (bx >= 0 && bx < size && by >= 0 && by < size) {
                mark[by][bx] = 1;
            }
        }
        
        const startX = this.startPosition?.x ?? 0;
        const startY = this.startPosition?.y ?? 0;
        mark[startY][startX] = 2;

        let nonZeroCount = 1 + this.blockedCells.size;
        let prevCount = 0;

        while (nonZeroCount > prevCount) {
            prevCount = nonZeroCount;

            const toOne = [];
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (mark[y][x] === 2) {
                        const neighbors = this.getPassableNeighbors(x, y);
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

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (mark[y][x] !== 0) mark[y][x] = 1;
                }
            }

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (mark[y][x] === 1) {
                        const neighbors = this.getPassableNeighbors(x, y);
                        for (const [nx, ny] of neighbors) {
                            if (mark[ny][nx] === 0) {
                                mark[y][x] = 2;
                                break;
                            }
                        }
                    }
                }
            }

            nonZeroCount = 0;
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (mark[y][x] !== 0) nonZeroCount++;
                }
            }
        }

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (mark[y][x] === 0) return false;
            }
        }
        return true;
    }


    // ---------- 猎魂森林专用连通性检测 ----------
    // 检查从起点到每个boss是否都能到达，且不经过其他boss格
    canReachAllBosses() {
        if (!this.isHuntingForest) return this.canReachAll();

        const size = this.size;

        // 对每个boss，检查从起点是否能到达它，且路径不经过其他boss格
        for (const boss of this.bossPositions) {
            if (!this.canReachBossWithoutOtherBosses(boss.x, boss.y)) {
                return false;
            }
        }
        return true;
    }

    // BFS检查从起点到目标点是否可达，且不经过其他boss格（目标boss格本身除外）
    canReachBossWithoutOtherBosses(targetX, targetY) {
        const size = this.size;
        const visited = Array(size).fill().map(() => Array(size).fill(false));
        const queue = [{ x: this.startPosition.x, y: this.startPosition.y }];
        visited[this.startPosition.y][this.startPosition.x] = true;

        while (queue.length > 0) {
            const { x, y } = queue.shift();

            if (x === targetX && y === targetY) return true;

            const neighbors = this.getPassableNeighbors(x, y);
            for (const [nx, ny] of neighbors) {
                if (visited[ny][nx]) continue;
                // 如果是其他boss格，不能经过
                if (this.bossCells.has(`${nx},${ny}`) && !(nx === targetX && ny === targetY)) continue;
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny });
            }
        }
        return false;
    }

    // 获取四个方向中可通过的邻居（考虑堵墙）
    getPassableNeighbors(x, y) {
        const result = [];
        const size = this.size;
        if (y > 0 && !this.wallDown[y-1][x]) {
            result.push([x, y-1]);
        }
        if (y < size-1 && !this.wallDown[y][x]) {
            result.push([x, y+1]);
        }
        if (x > 0 && !this.wallRight[y][x-1]) {
            result.push([x-1, y]);
        }
        if (x < size-1 && !this.wallRight[y][x]) {
            result.push([x+1, y]);
        }
        // 过滤掉被阻挡的格子
        return result.filter(([nx, ny]) => !this.blockedCells.has(`${nx},${ny}`));
    }

    // 检查某个格子是否可通行（未被阻挡）
    isPassable(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;
        return !this.blockedCells.has(`${x},${y}`);
    }


    // ---------- 墙壁生成算法（支持堵墙） ----------
    generateWalls() {
        const size = this.size;
        const W = Array(size).fill().map(() => Array(size).fill(0));
        
        // 预先标记堵墙格子为已处理（跳过它们）
        for (const key of this.blockedCells) {
            const [bx, by] = key.split(',').map(Number);
            if (bx >= 0 && bx < size && by >= 0 && by < size) {
                W[by][bx] = 1;
            }
        }
        
        let failedCount = 0;

        while (true) {
            const zeros = [];
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (W[y][x] === 0) zeros.push([x, y]);
                }
            }
            if (zeros.length === 0) break;
            if (failedCount >= 3) break;

            const idx = Math.floor(Math.random() * zeros.length);
            const [cx, cy] = zeros[idx];
            let succeed = false;

            const dirs = [[1,0], [0,1], [-1,0], [0,-1]];
            for (let i = dirs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
            }

            for (const [dx, dy] of dirs) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;

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
                    // 使用猎魂森林专用检测或普通检测
                    const valid = this.isHuntingForest ? this.canReachAllBosses() : this.canReachAll();
                    if (valid) {
                        succeed = true;
                        break;
                    } else {
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


    // ---------- 玩家移动（支持堵墙） ----------
    canMove(dx, dy) {
        const nx = this.px + dx;
        const ny = this.py + dy;
        if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) return false;
        // 检查目标格子是否被阻挡
        if (this.blockedCells.has(`${nx},${ny}`)) return false;
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
        
        // 猎魂森林模式：走到boss相邻格时，自动显示该boss（不再显示问号）
        if (this.isHuntingForest) {
            this.revealAdjacentBosses();
        }
        
        return true;
    }

    // 猎魂森林：走到boss旁边时，自动显示该boss的信息（不再显示问号）
    revealAdjacentBosses() {
        const dirs = [[1,0], [-1,0], [0,1], [0,-1]];
        for (const [dx, dy] of dirs) {
            const nx = this.px + dx;
            const ny = this.py + dy;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                if (this.bossCells.has(`${nx},${ny}`)) {
                    this.explored[ny][nx] = true;
                }
            }
        }
    }

    isBossCell() {
        if (this._isCustomMaze) {
            // 自定义迷宫，终点由 endX/endY 指定
            return this.px === this.endX && this.py === this.endY;
        }
        if (this.isHuntingForest) {
            return this.bossCells.has(`${this.px},${this.py}`);
        }
        return this.px === this.size - 1 && this.py === this.size - 1;
    }


    // 获取当前格子的boss信息
    getCurrentBossInfo() {
        if (!this.isHuntingForest) return null;
        const boss = this.bossPositions.find(b => b.x === this.px && b.y === this.py);
        return boss || null;
    }

    // 标记boss已被击败
    markBossDefeated(x, y) {
        const boss = this.bossPositions.find(b => b.x === x && b.y === y);
        if (boss) {
            boss.defeated = true;
        }
    }

    // 检查是否所有boss都被击败
    areAllBossesDefeated() {
        return this.bossPositions.every(b => b.defeated);
    }
}
