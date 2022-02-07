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

function isSlidingPiece(piece) {
    return piece in {3: "", 4: "", 5: "", 11: "", 12: "", 13: ""};
}

const Colour = {
    White: 0,
    Black: 8,
    Invalid: -1
};

const Direction = {
    North: 0,
    Northeast: 1, 
    East: 2,
    Southeast: 3, 
    South: 4, 
    Southwest: 5, 
    West: 6, 
    Northwest: 7, 

    0: "North", 
    1: "Northeast", 
    2: "East", 
    3: "Southeast", 
    4: "South", 
    5: "Southwest", 
    6: "West", 
    7: "Northwest"
};

const DirectionOffset = {
    North: -8,
    Northeast: -7, 
    East: +1,
    Southeast: +9, 
    South: +8, 
    Southwest: +7, 
    West: -1, 
    Northwest: -9 
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

function squaresToEdge(square, direction) {
    let file = square % 8;
    let rank = 8 - (square - square % 8) / 8;

    const numNorth = 7 - rank; 
    const numEast = 7 - file; 
    const numSouth = rank; 
    const numWest = file; 

    return (() => {
        switch (direction) {
            case Direction.North: return numNorth;
            case Direction.Northeast: return Math.min(numNorth, numEast);
            case Direction.East: return numEast;
            case Direction.Southeast: return Math.min(numSouth, numEast);
            case Direction.South: return numSouth; 
            case Direction.Southwest: return Math.min(numSouth, numWest);
            case Direction.West: return numWest;
            case Direction.Northwest: return Math.min(numNorth, numWest);
            default: break; 
        }
        return 0;
    })();
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

function colour(piece) {
    if (piece == Piece.None) return Colour.Invalid;
    return piece - (piece % 8);
}

function generateSlidingMoves(square, piece) {
    let allMoves = [];

    const increment = (piece % 8) == 5 ? 1 : 2;
    const start = (piece % 8) == 3 ? 1 : 0;

    for (let directionIndex = start; directionIndex < 8; directionIndex += increment) {
        for (var i = 0; i < squaresToEdge(square, directionIndex); i++) {
            let target = square + DirectionOffset[Direction[directionIndex]] * (n + 1);
            let targetPiece = board[target];

            if (colour(targetPiece) == colour(piece)) break; 

            allMoves.push({"from": square, "to": target});

            if (colour(targetPiece) != colour(piece) && colour(targetPiece) != Colour.Invalid) break; 
        }
    }
}

function moves(colour) { // TODO: Non-sliding moves (King, Pawn, Knight)
    let allMoves = []
    if (colour = Colour.White) {
        let pieces = [];
        for (var i = board.length - 1; i >= 0; i--) {
            if (colour(board[i]) == Colour.White) pieces.push(i);
        }

        for (var i = 0; i < pieces.length; i++) {
            if (isSlidingPiece(board[pieces[i]])) {
                allMoves = allmoves.concat(generateSlidingMoves(pieces[i], board[pieces[i]]));
            }
        }
    } else if (colour = Colour.Black) {

    }
    return allMoves;
} 

function readFEN(fen) {
    let [position, playing, castling, enPassantSquare, ...rest] = fen.split(" ");

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