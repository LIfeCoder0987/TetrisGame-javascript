/* ==== Variable Declaration ==== */
const _screen = document.querySelector('.screen');
_screen.width = 600;
_screen.height = 600;
const sContext = _screen.getContext('2d');

const sWidth = _screen.width;
const sHeight = _screen.height;
const OffsetX = sWidth/3;
const OffsetY = sHeight/4;

const SPACE = " "; // The space key - just a representation for " "
let Keys = {
	ArrowDown:false,
	ArrowRight:false,
	ArrowLeft:false,
	SKey:false // The Space Key - the bool value that will make changes
};

let RotateHold = false;

const GameSpeed = 1000/10;
let GameOver = false;

const SQ = 20;		// square size
const fWidth = 10;
const fHeight = 20;

const COLORS = [ // some colors that i picked up :)
	"blue","cadetblue","blueviolet","brown","chartreuse","crimson","darkslategrey"
];

let tetromino = [[],[],[],[],[],[],[]]  // list of lists that hold tetris piece aka tetromino
let Field = [];  // this list will store all element/pieces that been introduce to the game
let Lines = [];  // list of lines made to be processed later

let CurrentPiece = 0;		// all the piece
let CurrentRotation = 0;	// information
let CurrentX = fWidth/2;	// that we 
let CurrentY = 0;			// need

let Score = 0;
let PieceCounter = 0;

let Speed = 5;			// the speed that the game is running
let SpeedCounter = 0;	// count loops (how many times the mainloop is called)
let ForceDown = false;  // to determine if we want to force the piece down

/* ---- Main Functions and Logic ---- */
requestAnimationFrame(start);

function start()
{
	// Some Initialization
	AddEventsListeners();

	// tetris piece is a 4x4 squares
	tetromino[0].push("..X.");
	tetromino[0].push("..X.");
	tetromino[0].push("..X.");
	tetromino[0].push("..X.");
	tetromino[0] = tetromino[0].join('');

	tetromino[1].push("..X.");
	tetromino[1].push(".XX.");
	tetromino[1].push("..X.");
	tetromino[1].push("....");
	tetromino[1] = tetromino[1].join('');

	tetromino[2].push("....");
	tetromino[2].push(".XX.");
	tetromino[2].push(".XX.");
	tetromino[2].push("....");
	tetromino[2] = tetromino[2].join('');

	tetromino[3].push("..X.");
	tetromino[3].push(".XX.");
	tetromino[3].push(".X..");
	tetromino[3].push("....");
	tetromino[3] = tetromino[3].join('');

	tetromino[4].push(".X..");
	tetromino[4].push(".XX.");
	tetromino[4].push("..X.");
	tetromino[4].push("....");
	tetromino[4] = tetromino[4].join('');

	tetromino[5].push(".X..");
	tetromino[5].push(".X..");
	tetromino[5].push(".XX.");
	tetromino[5].push("....");
	tetromino[5] = tetromino[5].join('');

	tetromino[6].push("..X.");
	tetromino[6].push("..X.");
	tetromino[6].push(".XX.");
	tetromino[6].push("....");
	tetromino[6] = tetromino[6].join('');

	for (let x = 0; x < fWidth; x++)
		for (let y = 0; y < fHeight; y++)
			// we just making the left and right border "gray" color and every thing else to "white"
			Field[y * fWidth + x] = (x === 0 || x === fWidth - 1 || y === fHeight - 1) ? "gray" : "white";

	mainLoop();
}

function mainLoop()
{
	let Interval = setInterval(function()
	{
		ClearFunc();
		UpdateFunc();
		DrawFunc();
	},
	GameSpeed);
}

function ClearFunc()
{
	sContext.clearRect( 0,0, sWidth,sHeight );
}

function UpdateFunc()
{
	if (!GameOver)   // we will do any logic if the game is over
	{
		// Game Timing ==========
		SpeedCounter++;
		ForceDown = (Speed === SpeedCounter);

		// Game Input / Moving the piece ===========
		CurrentX += (Keys.ArrowRight && DoesPieceFit(CurrentPiece, CurrentRotation, CurrentX + 1, CurrentY)) ? 1 : 0;
		CurrentX -= (Keys.ArrowLeft && DoesPieceFit(CurrentPiece, CurrentRotation, CurrentX - 1, CurrentY)) ? 1 : 0;
		CurrentY += (Keys.ArrowDown && DoesPieceFit(CurrentPiece, CurrentRotation, CurrentX, CurrentY + 1)) ? 1 : 0;

		// ======== Rotate the piece
		if (Keys.SKey)
		{
			CurrentRotation += (!RotateHold && DoesPieceFit(CurrentPiece, CurrentRotation + 1, CurrentX, CurrentY)) ? 1 : 0;
			RotateHold = true;
		}
		else
			RotateHold = false;

		if (ForceDown)
		{
			// we can move the piece down only if it will fit in the next position
			if (DoesPieceFit(CurrentPiece, CurrentRotation, CurrentX, CurrentY + 1))
				CurrentY++;
			else
			{
				// the piece can't move any further so we need to lock it
				for (let px = 0; px < 4; px++)
					for (let py = 0; py < 4; py++)
						if (tetromino[CurrentPiece][Rotate(px,py, CurrentRotation)] === 'X')
							// we add the piece to the field so it will be part of the back ground
							// and it will be drawn later with the board
							Field[(CurrentY + py) * fWidth + (CurrentX + px)] = COLORS[CurrentPiece];

				PieceCounter++;
				if (PieceCounter % 10 === 0) // make the game faster every 10 pieces
					if (Speed >= 2) Speed--;

				// We check for lines before we generate new piece
				for (let py = 0; py < 4; py++)
					if (CurrentY + py < fHeight - 1)
					{
						let line = true; // we assume we got a line
						for (let px = 1; px < fWidth; px++)
							// we check for none white place
							// then we do an "and" opperation "true & true = true"
							// "true & false = false"
							line &= (Field[(CurrentY + py) * fWidth + px]) !== "white";

						if (line)
							Lines.push(CurrentY + py);
					}

				Score += 25;  // we add score for every piece
				if (Lines.length !== 0) Score += (1 << Lines.length) * 100; // reword the player for lines
												// Lines.length x 2 x 100

				// Chosse next piece
				CurrentX = fWidth/2; // set to
				CurrentY = 0;		 // Inital
				CurrentRotation = 0; // State
				CurrentPiece = Math.floor(Math.random() * 7);  // next random piece

				// if we can't fit the new generated piece at the first location - the game is over
				GameOver = !DoesPieceFit(CurrentPiece, CurrentRotation, CurrentX, CurrentY);
			}

			SpeedCounter = 0;
		}

		// We remove Lines
		if (Lines.length !== 0)
		{
			for (let l of Lines)
				for (let px = 1; px < fWidth - 1; px++) // we exclude the borders
				{
					for (let py = l; py > 0; py--)
						// We make the line Field equal to what ever above it
						Field[py * fWidth + px] = Field[(py - 1) * fWidth + px];
					// and we make it back the white
					Field[px] = "white";
				}

			// reset lines list
			Lines = [];
		}
	}
}

function DrawFunc()
{
	// Draw Border - background
	for (let x = 0; x < fWidth; x++)
		for (let y = 0; y < fHeight; y++)
			DrawSquare(x,y, Field[y * fWidth + x]);

	// Draw Piece - a tetromino is 4x4 
	for (let px = 0; px < 4; px++)
		for (let py = 0; py < 4; py++)
			if (tetromino[CurrentPiece][Rotate(px,py, CurrentRotation)] === 'X')
				// the "CurrentX" is like the 4x4 tetromino position
				// and in the other hand "px" is like the index in that piece
				DrawSquare(CurrentX + px, CurrentY + py, COLORS[CurrentPiece]);

	// Draw Score ==========
	if (!GameOver)
		DrawString(10,40, "SCORE: "+Score, "white", "40px Arial");
	else
		DrawString(10,40, "Game Over, Your Score is: "+Score, "white", "40px Arial");
}

/* **** Helper Functions **** */
function Rotate(px,py, r)
{
	switch (r % 4)
	{
		case 0: return py * 4 + px;			// 0 degrees
		case 1: return 12 + py - (px * 4);	// 90 degrees
		case 2: return 15 - (py * 4) - px;  // 180 degrees
		case 3: return 3 - py + (px * 4);   // 270 degrees
	}
}

function DoesPieceFit(Tetromino, Rotation, PosX, PosY)  // will check if the piece will fit in the next position
{
	for (let px = 0; px < 4; px++)
		for (let py = 0; py < 4; py++)
		{
			// Get Piece index -aka- Rotation
			let pi = Rotate(px,py, Rotation);

			// Get field index 
			let fi = (PosY + py) * fWidth + (PosX + px);

			// The test for collision must be in bounds
			if (PosX + px >= 0 && PosX + px < fWidth)
				if (PosY + py >= 0 && PosY + py < fHeight)
					// so we do check for collision
					if (tetromino[Tetromino][pi] !== '.' && Field[fi] !== "white")
						return false;
		}

	// if all that didn't return that we must return true
	return true;
}

function DrawSquare( x,y, color )
{
	sContext.fillStyle = color;
	sContext.fillRect( x * SQ + OffsetX, y * SQ + OffsetY, SQ, SQ );
}

function DrawString( x,y, string,color,font )
{
	sContext.font = font;
	sContext.fillStyle = color;
	sContext.textAlign = "left";
	let text = string;
	sContext.fillText( text, x,y );
}

function AddEventsListeners()
{
	document.addEventListener("keydown",function(e)
	{
		Keys[e.key] = true;
		if (e.key === SPACE)
			Keys.SKey = true;
	});
	document.addEventListener("keyup",function(e)
	{
		Keys[e.key] = false;
		if (e.key === SPACE)
			Keys.SKey = false;
	});
}