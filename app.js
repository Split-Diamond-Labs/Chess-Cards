(() => {
    let isLight = true;
    for (let square = 0; square < 64; square++) {
        if (square % 8 != 0) isLight = !isLight;
        document.querySelector(".board").innerHTML += "<div class=\"square " + (isLight ? "light" : "dark") + "\" id=\"" + square + "\"></div>";
    }
})();

const Piece = {
    None: 0,

    whitePawn: 1,
    whiteKnight: 2,
    whiteBishop: 3,
    whiteRook: 4,
    whiteQueen: 5,
    whiteKing: 6,

    blackPawn: 9,
    blackKnight: 10,
    blackBishop: 11,
    blackRook: 12,
    blackQueen: 13,
    blackKing: 14,
};

let castlingRights = {
    white: {
        kingside: true,
        queenside: true
    },
    black: {
        kingside: true,
        queenside: true
    }
}

let enPassant = 0;

let toPlay = 0;

function SquareRC(file, rank) { // Square(File(a), Rank(1))
    return (8 - rank) * 8 + file - 1;
}

function Square(position) { // Square("a1")
    let [file, rank] = position.split("");
    return SquareRC({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 5,
        f: 6,
        g: 7,
        h: 8
    }[file], parseInt(rank))
}

let board = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

function updateBoard() {
    for (var i = 0; i < board.length; i++) {
        document.getElementById(i).innerHTML = (() => {
            let text = "";
            switch (board[i]) {
                case Piece.None:
                    break;

                case Piece.whitePawn:
                    text = "<img src=\"./pieces/whitePawn.png\">";
                    break;
                case Piece.whiteKnight:
                    text = "<img src=\"./pieces/whiteKnight.png\">";
                    break;
                case Piece.whiteBishop:
                    text = "<img src=\"./pieces/whiteBishop.png\">";
                    break;
                case Piece.whiteRook:
                    text = "<img src=\"./pieces/whiteRook.png\">";
                    break;
                case Piece.whiteQueen:
                    text = "<img src=\"./pieces/whiteQueen.png\">";
                    break;
                case Piece.whiteKing:
                    text = "<img src=\"./pieces/whiteKing.png\">";
                    break;

                case Piece.blackPawn:
                    text = "<img src=\"./pieces/blackPawn.png\">";
                    break;
                case Piece.blackKnight:
                    text = "<img src=\"./pieces/blackKnight.png\">";
                    break;
                case Piece.blackBishop:
                    text = "<img src=\"./pieces/blackBishop.png\">";
                    break;
                case Piece.blackRook:
                    text = "<img src=\"./pieces/blackRook.png\">";
                    break;
                case Piece.blackQueen:
                    text = "<img src=\"./pieces/blackQueen.png\">";
                    break;
                case Piece.blackKing:
                    text = "<img src=\"./pieces/blackKing.png\">";
                    break;
            }
            return text;
        })();
    }
}

function move(from, to) {
    let movedPiece = board[Square(from)];
    let capturedPiece = board[Square(to)];
    board[Square(to)] = movedPiece;
    board[Square(from)] = Piece.None;
    updateBoard();
    return capturedPiece;
}

function readFEN(fen) {
    let [position, playing, castling, enPassantSquare, halfMoves, fullMoves] = fen.split(" ");

    // Position 
    let positionSplit = position.split("/");

    let currentPosition = 0;

    for (var i = 0; i < positionSplit.length; i++) {
        let rankSplit = positionSplit[i].split("");
        for (var j = 0; j < rankSplit.length; j++) {
            if (!isNaN(parseInt(rankSplit[j]))) {
                for (var k = 0; k < parseInt(rankSplit[j]); k++) {
                    board[currentPosition] = 0;
                    currentPosition++;
                }
            } else {
                switch (rankSplit[j]) {
                    case "K":
                        board[currentPosition] = Piece.whiteKing;
                        currentPosition++;
                        break;
                    case "Q":
                        board[currentPosition] = Piece.whiteQueen;
                        currentPosition++;
                        break;
                    case "R":
                        board[currentPosition] = Piece.whiteRook;
                        currentPosition++;
                        break;
                    case "B":
                        board[currentPosition] = Piece.whiteBishop;
                        currentPosition++;
                        break;
                    case "N":
                        board[currentPosition] = Piece.whiteKnight;
                        currentPosition++;
                        break;
                    case "P":
                        board[currentPosition] = Piece.whitePawn;
                        currentPosition++;
                        break;

                    case "k":
                        board[currentPosition] = Piece.blackKing;
                        currentPosition++;
                        break;
                    case "q":
                        board[currentPosition] = Piece.blackQueen;
                        currentPosition++;
                        break;
                    case "r":
                        board[currentPosition] = Piece.blackRook;
                        currentPosition++;
                        break;
                    case "b":
                        board[currentPosition] = Piece.blackBishop;
                        currentPosition++;
                        break;
                    case "n":
                        board[currentPosition] = Piece.blackKnight;
                        currentPosition++;
                        break;
                    case "p":
                        board[currentPosition] = Piece.blackPawn;
                        currentPosition++;
                        break;

                    default:
                        console.error("FEN reading failure");
                }
            }
        }
    }

    updateBoard();

    // Current turn 
    if (playing == "w") {
        toPlay = 0;
    } else if (playing == "b") {
        toPlay = 8;
    }

    castlingSplit = castling.split();
    for (let i = 0; i < castlingSplit.length; i++) {
        castlingRights.white.kingside = false;
        castlingRights.white.queenside = false;
        castlingRights.black.kingside = false;
        castlingRights.black.queenside = false;
        switch (castlingSplit[i]) {
            case "-":
                break;
            case "K":
                castlingRights.white.kingside = true;
                break;
            case "Q":
                castlingRights.white.queenside = true;
                break;
            case "k":
                castlingRights.black.kingside = true;
                break;
            case "q":
                castlingRights.black.queenside = true;
                break;
            default:
                break;
        }
    }

    enPassant = Square(enPassantSquare);
}

readFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");