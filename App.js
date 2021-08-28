window.onload = function() {
	var scoreElement = document.getElementsByClassName("score")[0];
	var messageElement = document.getElementsByClassName("message")[0];
	var newgameButtonElement = document.getElementsByClassName("newgame-button")[0];
	var board;
	var score;
	var isEnd = false;
	var isMoved = false;
	var cellId = [["00", "01", "02", "03"],
				  ["10", "11", "12", "13"],
				  ["20", "21", "22", "23"],
				  ["30", "31", "32", "33"]];
	var winningBorder = 2048;

	init();

	function init() {
		// 초기화
		board = [[0, 0, 0, 0],
				 [0, 0, 0, 0],
				 [0, 0, 0, 0],
				 [0, 0, 0, 0]];
		score = 0;
		messageElement.innerHTML = "";
		
		document.addEventListener("keydown", onKeydown, false);
		newgameButtonElement.addEventListener("click", init, false);
		generateCell();
		generateCell();
		updateDisplay();
	}

	function generateCell() {
		// 숫자 칸 생성
		let xPossibles = [];
		let yPossibles = [];

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (board[i][j] == 0) {
					xPossibles.push(i);
					yPossibles.push(j);
				}
			}
		}

		if (xPossibles.length == 0) return;

		let index = parseInt(Math.random() * xPossibles.length);

		board[xPossibles[index]][yPossibles[index]] = Math.random() < 0.1 ? 4 : 2;
	}

	function onKeydown(e) {
		// 키보드 입력
		if (isEnd) return;

		if (e["code"] == "ArrowLeft") {
			// 게임판 시계방향으로 90도 기울이기 -> 숫자 칸들 아래로 이동 -> 기울인 거 원위치 = 왼쪽으로 이동
			rotateBoard(1);
			dropCells();
			rotateBoard(3);
		} else if (e["code"] == "ArrowUp") {
			// 게임판 180도 기울이기 -> 숫자 칸들 아래로 이동 -> 기울인 거 원위치 = 위쪽으로 이동
			rotateBoard(2);
			dropCells();
			rotateBoard(2);			
		} else if (e["code"] == "ArrowRight") {
			// 게임판 반시계방향으로 90도 기울이기 -> 숫자 칸들 아래로 이동 -> 기울인 거 원위치 = 오른쪽으로 이동
			rotateBoard(3);
			dropCells();
			rotateBoard(1);			
		} else if (e["code"] == "ArrowDown") dropCells();
		else return;

		if (isMoved) {
			generateCell();
			updateDisplay();
		}
	}

	function dropCells() {
		// 숫자 칸들을 아래쪽 칸부터 더 이상 이동할 수 없을 때까지 아래로 이동
		// 한 번 합쳐진 칸이 다시 합쳐지지 않도록 isCellMerged로 체크
		let isCellMerged = [[false, false, false, false],
							[false, false, false, false],
							[false, false, false, false],
							[false, false, false, false]];

		isMoved = false;

		for (let x = 0; x < 4; x++) {
			for (let y = 2; y >= 0; y--) {
				if (board[y][x] == 0) continue;  // 빈 칸일 경우 건너뛰기

				let ty = y + 1;  // 떨어질 위치

				while (ty < 3 && board[ty][x] == 0) ty++;  // 떨어질 위치 결정

				if (board[y][x] == board[ty][x] && !isCellMerged[ty][x]) {
					// 움직이려는 칸의 수와 떨어트릴 칸의 수가 같고 떨어트릴 칸이 병합된 적 없음 = 숫자 칸 병합, 점수 획득
					board[ty][x] += board[y][x];
					score += board[ty][x];
					board[y][x] = 0;
					isMoved = true;
					isCellMerged[ty][x] = true;
				} else if (board[ty][x] == 0) {
					// 떨어트릴 칸이 비어 있음 = 그냥 이동만
					board[ty][x] += board[y][x];
					board[y][x] = 0;
					isMoved = true;
				} else if (ty != y + 1) {
					// 움직이려는 칸의 수와 떨어트릴 칸의 수가 다름 = 떨어트릴 칸 바로 위로 이동
					board[ty - 1][x] += board[y][x];
					board[y][x] = 0;
					isMoved = true;
				}
			}
		}
	}

	function rotateBoard(n) {
		// 게임판을 시계방향으로 n번 90도 회전
		let boardTemp = [[0, 0, 0, 0],
						 [0, 0, 0, 0],
						 [0, 0, 0, 0],
						 [0, 0, 0, 0]];

		while (n--) {
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					boardTemp[3 - j][i] = board[i][j];
				}
			}

			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					board[i][j] = boardTemp[i][j];
				}
			}
		}
	}

	function updateDisplay() {
		// 게임 화면 업데이트
		scoreElement.innerHTML = score;

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				let cellElement = document.getElementById(cellId[i][j]);

				cellElement.innerHTML = board[i][j] == 0 ? "" : board[i][j];
			}
		}

		styleCells();

		if (isGameover()) {
			messageElement.innerHTML = "Game over!";
			isEnd = true;
		} else if (isWon()) messageElement.innerHTML = "You Win!";
	}

	function styleCells() {
		// 칸 스타일링
		let fontSizes = [44, 40, 36, 32, 28, 24];

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				let cellElement = document.getElementById(cellId[i][j]);
				
				switch (board[i][j]) {
					case 0: {
						// 빈 칸
						cellElement.style.backgroundColor = "rgb(224, 224, 224)";

						break;
					}					
					case 2: {
						// 2 ^ 1
						cellElement.style.backgroundColor = "rgb(242, 113, 113)";

						break;
					}
					case 4: {
						// 2 ^ 2
						cellElement.style.backgroundColor = "rgb(242, 171, 113)";

						break;
					}
					case 8: {
						// 2 ^ 3
						cellElement.style.backgroundColor = "rgb(242, 230, 113)";

						break;
					}
					case 16: {
						// 2 ^ 4
						cellElement.style.backgroundColor = "rgb(197, 242, 113)";

						break;
					}
					case 32: {
						// 2 ^ 5
						cellElement.style.backgroundColor = "rgb(138, 242, 113)";

						break;
					}
					case 64: {
						// 2 ^ 6
						cellElement.style.backgroundColor = "rgb(113, 242, 146)";

						break;
					}
					case 128: {
						// 2 ^ 7
						cellElement.style.backgroundColor = "rgb(113, 242, 203)";

						break;
					}
					case 256: {
						// 2 ^ 8
						cellElement.style.backgroundColor = "rgb(113, 223, 242)";

						break;
					}
					case 512: {
						// 2 ^ 9
						cellElement.style.backgroundColor = "rgb(113, 193, 242)";

						break;
					}
					case 1024: {
						// 2 ^ 10
						cellElement.style.backgroundColor = "rgb(119, 113, 242)";

						break;
					}
					case 2048: {
						// 2 ^ 11
						cellElement.style.backgroundColor = "rgb(177, 113, 242)";

						break;
					}
					case 4096: {
						// 2 ^ 12
						cellElement.style.backgroundColor = "rgb(207, 96, 240)";

						break;
					}
					case 8192: {
						// 2 ^ 13
						cellElement.style.backgroundColor = "rgb(239, 80, 242)";

						break;
					}
					case 16384: {
						// 2 ^ 14
						cellElement.style.backgroundColor = "rgb(238, 64, 182)";

						break;
					}
					case 32768: {
						// 2 ^ 15
						cellElement.style.backgroundColor = "rgb(236, 47, 122)";

						break;
					}
					case 65536: {
						// 2 ^ 16
						cellElement.style.backgroundColor = "rgb(235, 31, 56)";

						break;
					}
					default: {
						// 2 ^ 17 (65536부터 4까지 늘어선 상태에서 4가 나오면 가능)
						cellElement.style.backgroundColor = "rgb(0, 0, 0)";

						break;
					}
				}

				// 칸의 숫자의 자리수에 따라 폰트 크기를 다르게
				if (board[i][j] != 0) cellElement.style.fontSize = fontSizes[parseInt(Math.log10(board[i][j]))] + "px";
			}
		}
	}

	function isGameover() {
		// 게임오버 조건 체크
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (board[i][j] == 0) return false;
			}
		}

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 4; j++) {
				if (board[i][j] == board[i + 1][j]) return false;
			}
		}

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 3; j++) {
				if (board[i][j] == board[i][j + 1]) return false;
			}
		}

		return true;
	}

	function isWon() {
		// 승리 조건 체크
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (board[i][j] >= winningBorder) return true;
			}
		}

		return false;
	}
}