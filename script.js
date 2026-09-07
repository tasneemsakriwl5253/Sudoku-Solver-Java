const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const solveBtn = document.getElementById("solveBtn");
const clearBtn = document.getElementById("clearBtn");
const exampleBtn = document.getElementById("exampleBtn");

const example = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];

function createBoard(values = Array.from({length: 9}, () => Array(9).fill(0))) {
  boardEl.innerHTML = "";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const input = document.createElement("input");
      input.className = "cell";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.setAttribute("aria-label", `Row ${r + 1}, Column ${c + 1}`);
      input.value = values[r][c] || "";
      if (values[r][c]) input.classList.add("given");

      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^1-9]/g, "").slice(0, 1);
        input.classList.remove("solved");
        input.classList.add("given");
        status("Ready to solve.");
      });

      boardEl.appendChild(input);
    }
  }
}

function getGrid() {
  return [...document.querySelectorAll(".cell")].map(x => Number(x.value) || 0)
    .reduce((rows, value, i) => {
      const r = Math.floor(i / 9);
      if (!rows[r]) rows[r] = [];
      rows[r].push(value);
      return rows;
    }, []);
}

function valid(grid, row, col, num) {
  for (let c = 0; c < 9; c++) if (grid[row][c] === num) return false;
  for (let r = 0; r < 9; r++) if (grid[r][col] === num) return false;

  const sr = Math.floor(row / 3) * 3;
  const sc = Math.floor(col / 3) * 3;
  for (let r = sr; r < sr + 3; r++)
    for (let c = sc; c < sc + 3; c++)
      if (grid[r][c] === num) return false;

  return true;
}

function solve(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        for (let n = 1; n <= 9; n++) {
          if (valid(grid, r, c, n)) {
            grid[r][c] = n;
            if (solve(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function status(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = "status" + (type ? " " + type : "");
}

function solveSudoku() {
  const grid = getGrid();
  const cells = [...document.querySelectorAll(".cell")];

  // Reject duplicate numbers already present.
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const value = grid[r][c];
      if (!value) continue;
      grid[r][c] = 0;
      const ok = valid(grid, r, c, value);
      grid[r][c] = value;
      if (!ok) {
        status("Invalid Sudoku: a number is repeated in a row, column, or 3×3 box.", "error");
        return;
      }
    }
  }

  const original = grid.map(row => [...row]);
  if (!solve(grid)) {
    status("No solution found for this puzzle.", "error");
    return;
  }

  cells.forEach((cell, i) => {
    const r = Math.floor(i / 9);
    const c = i % 9;
    if (original[r][c] === 0) {
      cell.value = grid[r][c];
      cell.classList.remove("given");
      cell.classList.add("solved");
    }
  });

  status("✓ Sudoku solved successfully using backtracking.", "success");
}

function clearBoard() {
  createBoard();
  status("Board cleared. Enter your Sudoku puzzle.");
}

function loadExample() {
  createBoard(example);
  status("Example puzzle loaded. Tap Solve Sudoku.");
}

solveBtn.addEventListener("click", solveSudoku);
clearBtn.addEventListener("click", clearBoard);
exampleBtn.addEventListener("click", loadExample);

createBoard();
