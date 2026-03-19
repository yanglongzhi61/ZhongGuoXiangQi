// 棋盘尺寸
const BOARD_WIDTH = 9;
const BOARD_HEIGHT = 10;

// 游戏状态
let isRedTurn = true;
let selectedPiece = null;
let gameOver = false;
let playerColor = 'white'; // 玩家颜色
let aiColor = 'black'; // AI颜色

// 棋子数组
let chessboard = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));

// 悔棋栈
const moveHistory = [];
const MAX_UNDO_STEPS = 5;

// DOM元素
const chessBoard = document.getElementById('chess-board');
const turnIndicator = document.getElementById('turn');
const restartBtn = document.getElementById('restart-btn');
const undoBtn = document.getElementById('undo-btn');
const gameOverModal = document.getElementById('game-over');
const winnerText = document.getElementById('winner');
const playAgainBtn = document.getElementById('play-again-btn');
const colorSelectionModal = document.getElementById('color-selection');
const whiteBtn = document.getElementById('white-btn');
const blackBtn = document.getElementById('black-btn');
const checkIndicator = document.getElementById('check-indicator');
const checkMessage = document.getElementById('check-message');
const errorIndicator = document.getElementById('error-indicator');
const errorMessage = document.getElementById('error-message');

// 初始化游戏
function initGame() {
    // 清空棋盘
    chessboard = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
    
    // 白方棋子
    chessboard[0][0] = { type: '车', color: 'white' };
    chessboard[0][1] = { type: '马', color: 'white' };
    chessboard[0][2] = { type: '相', color: 'white' };
    chessboard[0][3] = { type: '士', color: 'white' };
    chessboard[0][4] = { type: '帅', color: 'white' };
    chessboard[0][5] = { type: '士', color: 'white' };
    chessboard[0][6] = { type: '相', color: 'white' };
    chessboard[0][7] = { type: '马', color: 'white' };
    chessboard[0][8] = { type: '车', color: 'white' };
    chessboard[2][1] = { type: '炮', color: 'white' };
    chessboard[2][7] = { type: '炮', color: 'white' };
    chessboard[3][0] = { type: '兵', color: 'white' };
    chessboard[3][2] = { type: '兵', color: 'white' };
    chessboard[3][4] = { type: '兵', color: 'white' };
    chessboard[3][6] = { type: '兵', color: 'white' };
    chessboard[3][8] = { type: '兵', color: 'white' };
    
    // 黑方棋子
    chessboard[9][0] = { type: '车', color: 'black' };
    chessboard[9][1] = { type: '马', color: 'black' };
    chessboard[9][2] = { type: '象', color: 'black' };
    chessboard[9][3] = { type: '士', color: 'black' };
    chessboard[9][4] = { type: '将', color: 'black' };
    chessboard[9][5] = { type: '士', color: 'black' };
    chessboard[9][6] = { type: '象', color: 'black' };
    chessboard[9][7] = { type: '马', color: 'black' };
    chessboard[9][8] = { type: '车', color: 'black' };
    chessboard[7][1] = { type: '炮', color: 'black' };
    chessboard[7][7] = { type: '炮', color: 'black' };
    chessboard[6][0] = { type: '卒', color: 'black' };
    chessboard[6][2] = { type: '卒', color: 'black' };
    chessboard[6][4] = { type: '卒', color: 'black' };
    chessboard[6][6] = { type: '卒', color: 'black' };
    chessboard[6][8] = { type: '卒', color: 'black' };
    
    // 重置游戏状态
    isRedTurn = true;
    selectedPiece = null;
    gameOver = false;
    moveHistory.length = 0;
    
    // 隐藏提示
    checkIndicator.classList.remove('show');
    errorIndicator.classList.remove('show');
    
    // 更新UI
    updateTurnIndicator();
    renderBoard();
    gameOverModal.classList.remove('show');
    
    // 如果AI是白方，AI先走
    if (aiColor === 'white') {
        setTimeout(aiMove, 1000);
    }
}

// 显示颜色选择界面
function showColorSelection() {
    colorSelectionModal.classList.remove('hide');
}

// 选择颜色
function selectColor(color) {
    playerColor = color;
    aiColor = color === 'white' ? 'black' : 'white';
    colorSelectionModal.classList.add('hide');
    initGame();
}

// 渲染棋盘
function renderBoard() {
    // 清空棋盘
    chessBoard.innerHTML = '';
    
    // 添加楚河汉界
    const river = document.createElement('div');
    river.className = 'river';
    chessBoard.appendChild(river);
    
    // 创建棋盘网格
    const boardGrid = document.createElement('div');
    boardGrid.className = 'board-grid';
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // 处理点击事件
            cell.addEventListener('click', () => handleCellClick(x, y));
            
            // 添加棋子
            const piece = chessboard[y][x];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `chess-piece ${piece.color}`;
                pieceElement.textContent = piece.type;
                pieceElement.dataset.x = x;
                pieceElement.dataset.y = y;
                
                // 标记选中状态
                if (selectedPiece && selectedPiece.x === x && selectedPiece.y === y) {
                    pieceElement.classList.add('selected');
                }
                
                cell.appendChild(pieceElement);
            }
            
            boardGrid.appendChild(cell);
        }
    }
    
    chessBoard.appendChild(boardGrid);
}

// 处理单元格点击
function handleCellClick(x, y) {
    if (gameOver) return;
    
    // 如果是AI回合，不允许玩家操作
    if ((isRedTurn && aiColor === 'white') || (!isRedTurn && aiColor === 'black')) {
        return;
    }
    
    const piece = chessboard[y][x];
    
    // 隐藏错误提示
    errorIndicator.classList.remove('show');
    
    if (selectedPiece) {
        // 已经选中了棋子，尝试移动
        if (isValidMove(selectedPiece.x, selectedPiece.y, x, y)) {
            // 记录移动
            const move = {
                fromX: selectedPiece.x,
                fromY: selectedPiece.y,
                toX: x,
                toY: y,
                movedPiece: chessboard[selectedPiece.y][selectedPiece.x],
                capturedPiece: chessboard[y][x]
            };
            moveHistory.push(move);
            if (moveHistory.length > MAX_UNDO_STEPS) {
                moveHistory.shift();
            }
            
            // 执行移动
            chessboard[y][x] = chessboard[selectedPiece.y][selectedPiece.x];
            chessboard[selectedPiece.y][selectedPiece.x] = null;
            
            // 检查游戏是否结束
            if (isGameOver()) {
                gameOver = true;
                const winner = isRedTurn ? '红方' : '黑方';
                showGameOver(winner);
            } else {
                // 检查是否将军
                checkForCheck();
                
                // 切换回合
                isRedTurn = !isRedTurn;
                updateTurnIndicator();
                
                // 如果是AI回合，AI移动
                if ((isRedTurn && aiColor === 'white') || (!isRedTurn && aiColor === 'black')) {
                    setTimeout(aiMove, 1000);
                }
            }
        } else {
            // 显示无效走法提示
            showError('不能这样走！');
        }
        
        // 取消选中
        selectedPiece = null;
        renderBoard();
    } else if (piece) {
        // 没有选中的棋子，检查点击的是否是当前回合的棋子
        const isRedPiece = piece.color === 'red';
        if (isRedPiece === isRedTurn) {
            selectedPiece = { x, y };
            renderBoard();
        } else {
            // 显示错误提示
            showError('现在不是该颜色的回合！');
        }
    }
}

// 显示错误提示
function showError(message) {
    errorMessage.textContent = message;
    errorIndicator.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        errorIndicator.classList.remove('show');
    }, 3000);
}

// 检查是否将军
function checkForCheck() {
    // 找到对方的将/帅
    let kingPosition = null;
    const targetColor = isRedTurn ? 'black' : 'white';
    const kingType = targetColor === 'white' ? '帅' : '将';
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const piece = chessboard[y][x];
            if (piece && piece.color === targetColor && piece.type === kingType) {
                kingPosition = { x, y };
                break;
            }
        }
        if (kingPosition) break;
    }
    
    if (!kingPosition) return;
    
    // 检查是否有棋子可以攻击到将/帅
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const piece = chessboard[y][x];
            if (piece && piece.color !== targetColor) {
                if (isValidMove(x, y, kingPosition.x, kingPosition.y)) {
                    // 将军
                    const kingColor = targetColor === 'white' ? '白方' : '黑方';
                    checkMessage.textContent = `将军！${kingColor}需要应将`;
                    checkIndicator.classList.add('show');
                    return;
                }
            }
        }
    }
    
    // 没有将军
    checkIndicator.classList.remove('show');
}

// 检查移动是否有效
function isValidMove(fromX, fromY, toX, toY) {
    const piece = chessboard[fromY][fromX];
    const targetPiece = chessboard[toY][toX];
    
    // 检查目标位置是否是己方棋子
    if (targetPiece && targetPiece.color === piece.color) {
        return false;
    }
    
    // 根据棋子类型检查移动规则
    switch (piece.type) {
        case '帅':
        case '将':
            return isValidKingMove(fromX, fromY, toX, toY, piece.color);
        case '士':
            return isValidAdvisorMove(fromX, fromY, toX, toY, piece.color);
        case '相':
        case '象':
            return isValidElephantMove(fromX, fromY, toX, toY, piece.color);
        case '马':
            return isValidKnightMove(fromX, fromY, toX, toY);
        case '车':
            return isValidRookMove(fromX, fromY, toX, toY);
        case '炮':
            return isValidCannonMove(fromX, fromY, toX, toY);
        case '兵':
        case '卒':
            return isValidPawnMove(fromX, fromY, toX, toY, piece.color);
        default:
            return false;
    }
}

// 检查帅/将的移动是否有效
function isValidKingMove(fromX, fromY, toX, toY, color) {
    // 帅/将只能在九宫内移动
    const minY = color === 'white' ? 0 : 7;
    const maxY = color === 'white' ? 2 : 9;
    
    if (toY < minY || toY > maxY || toX < 3 || toX > 5) {
        return false;
    }
    
    // 帅/将只能移动一步，且只能上下左右移动
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

// 检查士/仕的移动是否有效
function isValidAdvisorMove(fromX, fromY, toX, toY, color) {
    // 士/仕只能在九宫内移动
    const minY = color === 'white' ? 0 : 7;
    const maxY = color === 'white' ? 2 : 9;
    
    if (toY < minY || toY > maxY || toX < 3 || toX > 5) {
        return false;
    }
    
    // 士/仕只能斜着移动一步
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return dx === 1 && dy === 1;
}

// 检查相/象的移动是否有效
function isValidElephantMove(fromX, fromY, toX, toY, color) {
    // 相/象不能过河
    if (color === 'white' && toY > 4) return false;
    if (color === 'black' && toY < 5) return false;
    
    // 相/象走田字
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    if (dx !== 2 || dy !== 2) return false;
    
    // 检查象眼是否被塞住
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    return !chessboard[midY][midX];
}

// 检查马的移动是否有效
function isValidKnightMove(fromX, fromY, toX, toY) {
    // 马走日字
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) {
        return false;
    }
    
    // 检查马腿是否被蹩住
    if (dx === 2) {
        // 横向移动，检查纵向马腿
        const midY = fromY;
        const midX = (fromX + toX) / 2;
        if (chessboard[midY][midX]) {
            return false;
        }
    } else {
        // 纵向移动，检查横向马腿
        const midX = fromX;
        const midY = (fromY + toY) / 2;
        if (chessboard[midY][midX]) {
            return false;
        }
    }
    
    return true;
}

// 检查车的移动是否有效
function isValidRookMove(fromX, fromY, toX, toY) {
    // 车只能直线移动
    if (fromX !== toX && fromY !== toY) {
        return false;
    }
    
    // 检查路径上是否有其他棋子
    if (fromX === toX) {
        // 纵向移动
        const startY = Math.min(fromY, toY) + 1;
        const endY = Math.max(fromY, toY);
        for (let y = startY; y < endY; y++) {
            if (chessboard[y][fromX]) {
                return false;
            }
        }
    } else {
        // 横向移动
        const startX = Math.min(fromX, toX) + 1;
        const endX = Math.max(fromX, toX);
        for (let x = startX; x < endX; x++) {
            if (chessboard[fromY][x]) {
                return false;
            }
        }
    }
    
    return true;
}

// 检查炮的移动是否有效
function isValidCannonMove(fromX, fromY, toX, toY) {
    // 炮只能直线移动
    if (fromX !== toX && fromY !== toY) {
        return false;
    }
    
    // 计算路径上的棋子数量
    let pieceCount = 0;
    if (fromX === toX) {
        // 纵向移动
        const startY = Math.min(fromY, toY) + 1;
        const endY = Math.max(fromY, toY);
        for (let y = startY; y < endY; y++) {
            if (chessboard[y][fromX]) {
                pieceCount++;
            }
        }
    } else {
        // 横向移动
        const startX = Math.min(fromX, toX) + 1;
        const endX = Math.max(fromX, toX);
        for (let x = startX; x < endX; x++) {
            if (chessboard[fromY][x]) {
                pieceCount++;
            }
        }
    }
    
    // 炮移动时，无子吃子需要一个炮架，有子吃子需要一个炮架
    const targetPiece = chessboard[toY][toX];
    return targetPiece ? pieceCount === 1 : pieceCount === 0;
}

// 检查兵/卒的移动是否有效
function isValidPawnMove(fromX, fromY, toX, toY, color) {
    const dx = Math.abs(toX - fromX);
    const dy = toY - fromY;
    
    // 兵/卒只能移动一步
    if (dx + Math.abs(dy) !== 1) {
        return false;
    }
    
    // 白兵未过河只能向上移动，黑卒未过河只能向下移动
    if (color === 'white') {
        if (fromY >= 5) {
            // 已过河，可以左右移动
            return true;
        } else {
            // 未过河，只能向上移动
            return dy === 1 && dx === 0;
        }
    } else {
        if (fromY <= 4) {
            // 已过河，可以左右移动
            return true;
        } else {
            // 未过河，只能向下移动
            return dy === -1 && dx === 0;
        }
    }
}

// 检查游戏是否结束
function isGameOver() {
    // 检查是否有一方的将/帅被吃掉
    let whiteKingExists = false;
    let blackKingExists = false;
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const piece = chessboard[y][x];
            if (piece && piece.type === '帅' && piece.color === 'white') {
                whiteKingExists = true;
            } else if (piece && piece.type === '将' && piece.color === 'black') {
                blackKingExists = true;
            }
        }
    }
    
    return !whiteKingExists || !blackKingExists;
}

// 更新当前走棋方指示器
function updateTurnIndicator() {
    turnIndicator.textContent = isRedTurn ? '白方' : '黑方';
    turnIndicator.style.color = isRedTurn ? '#000000' : '#ffffff';
}

// 显示游戏结束
function showGameOver(winner) {
    winnerText.textContent = `游戏结束，${winner}获胜！`;
    gameOverModal.classList.add('show');
}

// 重新开始游戏
function restartGame() {
    initGame();
}

// 悔棋
function undoMove() {
    if (moveHistory.length > 0) {
        const move = moveHistory.pop();
        chessboard[move.fromY][move.fromX] = move.movedPiece;
        chessboard[move.toY][move.toX] = move.capturedPiece;
        isRedTurn = !isRedTurn;
        updateTurnIndicator();
        renderBoard();
    }
}

// AI移动函数
function aiMove() {
    if (gameOver) return;
    
    // 生成所有可能的移动
    const possibleMoves = generatePossibleMoves(aiColor);
    
    if (possibleMoves.length === 0) {
        // 没有可用移动，游戏结束
        gameOver = true;
        const winner = isRedTurn ? '黑方' : '红方';
        showGameOver(winner);
        return;
    }
    
    // 使用极小极大算法和alpha-beta剪枝选择最佳移动
    let bestMove = null;
    let bestScore = -Infinity;
    const depth = 3; // 搜索深度
    
    possibleMoves.forEach(move => {
        // 模拟移动
        const capturedPiece = chessboard[move.toY][move.toX];
        chessboard[move.toY][move.toX] = chessboard[move.fromY][move.fromX];
        chessboard[move.fromY][move.fromX] = null;
        
        // 使用极小极大算法评估移动
        const score = minimax(depth - 1, -Infinity, Infinity, false, aiColor);
        
        // 恢复棋盘
        chessboard[move.fromY][move.fromX] = chessboard[move.toY][move.toX];
        chessboard[move.toY][move.toX] = capturedPiece;
        
        // 更新最佳移动
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    
    // 执行最佳移动
    if (bestMove) {
        // 记录移动
        const move = {
            fromX: bestMove.fromX,
            fromY: bestMove.fromY,
            toX: bestMove.toX,
            toY: bestMove.toY,
            movedPiece: chessboard[bestMove.fromY][bestMove.fromX],
            capturedPiece: chessboard[bestMove.toY][bestMove.toX]
        };
        moveHistory.push(move);
        if (moveHistory.length > MAX_UNDO_STEPS) {
            moveHistory.shift();
        }
        
        // 执行移动
        chessboard[bestMove.toY][bestMove.toX] = chessboard[bestMove.fromY][bestMove.fromX];
        chessboard[bestMove.fromY][bestMove.fromX] = null;
        
        // 检查游戏是否结束
        if (isGameOver()) {
            gameOver = true;
            const winner = isRedTurn ? '红方' : '黑方';
            showGameOver(winner);
        } else {
            // 检查是否将军
            checkForCheck();
            
            // 切换回合
            isRedTurn = !isRedTurn;
            updateTurnIndicator();
        }
        
        renderBoard();
    }
}

// 极小极大算法 with alpha-beta剪枝
function minimax(depth, alpha, beta, isMaximizing, color) {
    if (depth === 0 || isGameOver()) {
        return evaluatePosition(color);
    }
    
    const currentColor = isMaximizing ? color : (color === 'white' ? 'black' : 'white');
    const possibleMoves = generatePossibleMoves(currentColor);
    
    if (possibleMoves.length === 0) {
        return evaluatePosition(color);
    }
    
    if (isMaximizing) {
        let maxScore = -Infinity;
        possibleMoves.forEach(move => {
            // 模拟移动
            const capturedPiece = chessboard[move.toY][move.toX];
            chessboard[move.toY][move.toX] = chessboard[move.fromY][move.fromX];
            chessboard[move.fromY][move.fromX] = null;
            
            // 递归评估
            const score = minimax(depth - 1, alpha, beta, false, color);
            
            // 恢复棋盘
            chessboard[move.fromY][move.fromX] = chessboard[move.toY][move.toX];
            chessboard[move.toY][move.toX] = capturedPiece;
            
            // 更新最大值
            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            
            // Alpha-beta剪枝
            if (beta <= alpha) {
                return;
            }
        });
        return maxScore;
    } else {
        let minScore = Infinity;
        possibleMoves.forEach(move => {
            // 模拟移动
            const capturedPiece = chessboard[move.toY][move.toX];
            chessboard[move.toY][move.toX] = chessboard[move.fromY][move.fromX];
            chessboard[move.fromY][move.fromX] = null;
            
            // 递归评估
            const score = minimax(depth - 1, alpha, beta, true, color);
            
            // 恢复棋盘
            chessboard[move.fromY][move.fromX] = chessboard[move.toY][move.toX];
            chessboard[move.toY][move.toX] = capturedPiece;
            
            // 更新最小值
            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            
            // Alpha-beta剪枝
            if (beta <= alpha) {
                return;
            }
        });
        return minScore;
    }
}

// 生成所有可能的移动
function generatePossibleMoves(color) {
    const moves = [];
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const piece = chessboard[y][x];
            if (piece && piece.color === color) {
                // 尝试所有可能的目标位置
                for (let toY = 0; toY < BOARD_HEIGHT; toY++) {
                    for (let toX = 0; toX < BOARD_WIDTH; toX++) {
                        if (isValidMove(x, y, toX, toY)) {
                            moves.push({ fromX: x, fromY: y, toX: toX, toY: toY });
                        }
                    }
                }
            }
        }
    }
    
    return moves;
}

// 评估位置价值
function evaluatePosition(color) {
    let score = 0;
    
    // 棋子价值
    const pieceValues = {
        '帅': 10000,
        '将': 10000,
        '车': 900,
        '马': 400,
        '炮': 400,
        '相': 200,
        '象': 200,
        '士': 200,
        '兵': 100,
        '卒': 100
    };
    
    // 位置价值表（更详细的位置评估）
    const positionValues = {
        '车': [
            [-50, -40, -30, -20, -20, -20, -30, -40, -50],
            [-50, -40, -30, -20, -20, -20, -30, -40, -50],
            [-50, -40, -30, -20, -20, -20, -30, -40, -50],
            [-50, -40, -30, -20, -20, -20, -30, -40, -50],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [50, 50, 50, 50, 50, 50, 50, 50, 50],
            [100, 100, 100, 100, 100, 100, 100, 100, 100],
            [150, 150, 150, 150, 150, 150, 150, 150, 150],
            [200, 200, 200, 200, 200, 200, 200, 200, 200]
        ],
        '马': [
            [-100, -90, -80, -70, -70, -70, -80, -90, -100],
            [-90, -80, -70, -60, -60, -60, -70, -80, -90],
            [-80, -70, -60, -50, -50, -50, -60, -70, -80],
            [-70, -60, -50, 0, 0, 0, -50, -60, -70],
            [-70, -60, 0, 100, 100, 100, 0, -60, -70],
            [-70, -60, 0, 100, 150, 100, 0, -60, -70],
            [-80, -70, -50, 100, 100, 100, -50, -70, -80],
            [-90, -80, -60, -50, -50, -50, -60, -80, -90],
            [-100, -90, -80, -70, -70, -70, -80, -90, -100],
            [-110, -100, -90, -80, -80, -80, -90, -100, -110]
        ],
        '炮': [
            [-70, -60, -50, -40, -40, -40, -50, -60, -70],
            [-60, -50, -40, -30, -30, -30, -40, -50, -60],
            [-50, -40, -30, -20, -20, -20, -30, -40, -50],
            [-40, -30, -20, 0, 0, 0, -20, -30, -40],
            [-30, -20, -10, 0, 50, 0, -10, -20, -30],
            [-30, -20, -10, 0, 50, 0, -10, -20, -30],
            [-40, -30, -20, 0, 0, 0, -20, -30, -40],
            [-50, -40, -30, -20, -20, -20, -30, -40, -50],
            [-60, -50, -40, -30, -30, -30, -40, -50, -60],
            [-70, -60, -50, -40, -40, -40, -50, -60, -70]
        ],
        '相': [
            [-50, -40, -30, -20, -20, -20, -30, -40, -50],
            [-40, -30, -20, -10, -10, -10, -20, -30, -40],
            [-30, -20, -10, 0, 0, 0, -10, -20, -30],
            [-20, -10, 0, 10, 10, 10, 0, -10, -20],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [-20, -10, 0, 10, 10, 10, 0, -10, -20],
            [-30, -20, -10, 0, 0, 0, -10, -20, -30],
            [-40, -30, -20, -10, -10, -10, -20, -30, -40],
            [-50, -40, -30, -20, -20, -20, -30, -40, -50]
        ],
        '士': [
            [-20, -10, 0, 0, 0, 0, 0, -10, -20],
            [-10, 0, 10, 10, 10, 10, 10, 0, -10],
            [0, 10, 20, 20, 20, 20, 20, 10, 0],
            [0, 10, 20, 30, 30, 30, 20, 10, 0],
            [0, 10, 20, 30, 40, 30, 20, 10, 0],
            [0, 10, 20, 30, 40, 30, 20, 10, 0],
            [0, 10, 20, 30, 30, 30, 20, 10, 0],
            [0, 10, 20, 20, 20, 20, 20, 10, 0],
            [-10, 0, 10, 10, 10, 10, 10, 0, -10],
            [-20, -10, 0, 0, 0, 0, 0, -10, -20]
        ],
        '帅': [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]
        ],
        '兵': [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [50, 50, 50, 50, 50, 50, 50, 50, 50],
            [100, 100, 100, 100, 100, 100, 100, 100, 100],
            [150, 150, 150, 150, 150, 150, 150, 150, 150],
            [200, 200, 200, 200, 200, 200, 200, 200, 200],
            [300, 300, 300, 300, 300, 300, 300, 300, 300],
            [500, 500, 500, 500, 500, 500, 500, 500, 500]
        ]
    };
    
    // 评估每个棋子
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const piece = chessboard[y][x];
            if (piece) {
                const value = pieceValues[piece.type] || 0;
                const posValue = positionValues[piece.type]?.[y]?.[x] || 0;
                
                if (piece.color === color) {
                    score += value + posValue;
                } else {
                    score -= value + posValue;
                }
            }
        }
    }
    
    // 检查是否将军
    let isInCheck = false;
    const kingType = color === 'white' ? '帅' : '将';
    let kingPosition = null;
    
    // 找到自己的将/帅
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const piece = chessboard[y][x];
            if (piece && piece.color === color && piece.type === kingType) {
                kingPosition = { x, y };
                break;
            }
        }
        if (kingPosition) break;
    }
    
    // 检查是否被将军
    if (kingPosition) {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const piece = chessboard[y][x];
                if (piece && piece.color !== color) {
                    if (isValidMove(x, y, kingPosition.x, kingPosition.y)) {
                        isInCheck = true;
                        break;
                    }
                }
            }
            if (isInCheck) break;
        }
    }
    
    // 如果被将军，扣分
    if (isInCheck) {
        score -= 1000;
    }
    
    // 评估棋子活跃度（可移动的位置数量）
    const myMoves = generatePossibleMoves(color).length;
    const opponentMoves = generatePossibleMoves(color === 'white' ? 'black' : 'white').length;
    score += (myMoves - opponentMoves) * 10;
    
    // 评估棋子之间的协调性
    score += evaluateCoordination(color);
    
    return score;
}

// 评估棋子协调性
function evaluateCoordination(color) {
    let score = 0;
    
    // 检查车的位置是否有利
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const piece = chessboard[y][x];
            if (piece && piece.color === color && piece.type === '车') {
                // 车在底线或次底线更有价值
                if (y === 0 || y === 9 || y === 1 || y === 8) {
                    score += 50;
                }
                
                // 车在中路更有价值
                if (x === 4) {
                    score += 30;
                }
            }
        }
    }
    
    // 检查马的位置是否有利
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const piece = chessboard[y][x];
            if (piece && piece.color === color && piece.type === '马') {
                // 马在河口更有价值
                if ((color === 'white' && y === 3) || (color === 'black' && y === 6)) {
                    score += 40;
                }
            }
        }
    }
    
    return score;
}

// 事件监听
restartBtn.addEventListener('click', () => {
    showColorSelection();
});
undoBtn.addEventListener('click', undoMove);
playAgainBtn.addEventListener('click', () => {
    showColorSelection();
});
whiteBtn.addEventListener('click', () => selectColor('white'));
blackBtn.addEventListener('click', () => selectColor('black'));

// 初始化游戏
showColorSelection();