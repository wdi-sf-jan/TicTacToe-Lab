// Constants. Sometimes when "variables" don't
// change over the lifetime of a program we name
// them in all caps to help indicate this.
var PLAYER_X = "X";
var PLAYER_O = "O";
var EMPTY = "";

// All the different rows, columns, and diagonals
// that a player can occupy to win. These correspond
// to the IDs in the HTML.
var WIN_COMBOS = [
  [0,1,2], [3,4,5], [6,7,8], // rows
  [0,3,6], [1,4,7], [2,5,8], // columns
  [0,4,8], [2,4,6]           // diagonals
];

// Start with a blank board.
var gameBoard = [EMPTY, EMPTY, EMPTY,
                 EMPTY, EMPTY, EMPTY,
                 EMPTY, EMPTY, EMPTY];

// Chose X to be the first player.
var currentPlayer = PLAYER_X;

// Get all of the DOM elements for the squares.
var getBoxes = function () {
  return document.getElementsByClassName("box");
};
// Get a specific square's DOM element.
var getBox = function (num) {
  return document.getElementById(num);
};

// Take the game board, and a player's move, and returns
// a new game board that reflects the new state.
var move = function (board, player, position) {
  var newBoard = board.concat();
  newBoard[position] = player;
  return newBoard;
};

// If the player was X make it O, and if it was O make it X.
var togglePlayer = function (player) {
  if (player == PLAYER_X) {
    return PLAYER_O;
  } else {
    return PLAYER_X;
  }
};

// Function for determining a win.
var isWin = function (board) {
  for (var i = 0; i < WIN_COMBOS.length; i++) {
    var combo = WIN_COMBOS[i];
    var one = board[combo[0]];
    if (one != EMPTY && one == board[combo[1]] && one == board[combo[2]]) {
      return true;
    }
  }
  return false;
};

// Function for determining a tie.
var isTie = function (board) {
  for (var i = 0; i < board.length; i++) {
    if (board[i] == EMPTY) {
      return false;
    }
  }
  return true;
};

// Retreive the available squares on the board.
var openSpots = function (board) {
  var open = [];
  for (var i = 0; i < board.length; i++) {
    if (board[i] == EMPTY) {
      open.push(i);
    }
  }
  return open;
};

// Determine minimax score of a board.
var minimax = function (board, computer, player) {
  var wasComputer = computer !== player;
  var isComputer = !wasComputer;
  if (isWin(board)) {
    return wasComputer ? 10 : -10;
  } else if (isTie(board)) {
    return 0;
  } else {
    var best = Infinity;
    var possibleMoves = openSpots(board);
    var nextPlayer = togglePlayer(player);
    if (isComputer) {
      best = -Infinity;
      possibleMoves.forEach(function (spot) {
        var val = minimax(move(board, player, spot), computer, nextPlayer);
        best = Math.max(best, val);
      });
    } else {
      possibleMoves.forEach(function (spot) {
        var val = minimax(move(board, player, spot), computer, nextPlayer);
        best = Math.min(best, val);
      });
    }
    return best;
  }
}

// Determine the computer's next move.
var computerMove = function (board, computerPlayer) {
  var possibleMoves = openSpots(board);
  var humanPlayer = togglePlayer(computerPlayer);
  var nodes = [];
  for (var i = 0; i < possibleMoves.length; i++) {
    var node = {
      move: possibleMoves[i],
      board: move(board, computerPlayer, possibleMoves[i])
    }
    node.score = minimax(node.board, computerPlayer, humanPlayer);
    nodes.push(node);
  }

  var bestNode = nodes.reduce(function (best, node) {
    return node.score > best.score ? node : best;
  });

  return bestNode.move;
};

// Create a new game by refreshing the page.
var newGame = function () {
  window.location.reload();
};

// Logic for when a square is clicked.
var boxClickHandler = function (event) {

  // Grab the box that was clicked.
  var box = event.target;
  var id = parseInt(event.target.getAttribute("id"));

  // Only allow clicks on open boxes.
  if (gameBoard[id] == EMPTY) {

    // Set the contents of the box to X or O.
    box.innerHTML = currentPlayer;
    gameBoard = move(gameBoard, currentPlayer, id);

    // Add the correct class to the box.
    box.classList.add(currentPlayer);

    // Check for a win.
    if(isWin(gameBoard)){
      alert(currentPlayer + " wins!");
      newGame();
    } else if (isTie(gameBoard)){
      // Or a tie.
      alert("It's a tie!");
      newGame();
    } else {
      // Switch players.
      currentPlayer = togglePlayer(currentPlayer);

      // Let the computer be PLAYER_O.
      if (currentPlayer == PLAYER_O) {
        var bestComputerMove = computerMove(gameBoard, currentPlayer);
        setTimeout(function () {
          getBox(bestComputerMove).click();
        }, 250);
      }
    }
  }
};

// Wait for the window to be loaded then add all
// of the click handlers.
window.addEventListener("load", function () {
  var boxes = getBoxes();
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].onclick = boxClickHandler;
  }
});
