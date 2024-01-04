/* eslint-disable func-style */
/* eslint-disable no-implicit-globals */

const globals = {
  assets: {
    highwayDriveWidth: 670,
    highwayImgWidth: 1280,
    highwayImgHeight: 1760,
  },
  gameplay: {
    spawnMaxEntropy: 140,
    spawnMinEntropy: 100,
    spawnMargin: 40,
    spawnChance: .67,
    minEnemies: 2,
    drivingSteps: 5,
  },
  carDefaults: {
    width: 50,
    height: 90,
  },
};

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const player = {
  x: 0,
  y: canvas.height - globals.carDefaults.height * 3,
  movingLeft: false,
  movingRight: false,
};

const enemies = [];

let score = 0;
let gameStarted = false;
let gameOver = false;

let { highwayImgWidth, highwayDriveWidth } = globals.assets;
let { drivingSteps } = globals.gameplay;

let highwayOffset = 0;

let spawnEntropy = 0;
let spawnHeightRemaining = 0;

let leftBound = 0;
let rightBound = 0;

let gamepad;

function initGameplay ()
{
  // Use joystick input for horizontal movement.
  if (gamepad)
  {
    // eslint-disable-next-line prefer-destructuring
    const joystick = gamepad.axes[0];
    player.x = (canvas.width - globals.carDefaults.width) / 2 + joystick * highwayDriveWidth / 2;
  }
  else
  {
    player.x = canvas.width / 2 - globals.carDefaults.width / 2;
  }

  player.movingLeft = false;
  player.movingRight = false;

  enemies.length = 0;

  score = 0;
  gameStarted = false;
  gameOver = false;

  // eslint-disable-next-line prefer-destructuring
  highwayImgWidth = globals.assets.highwayImgWidth;
  // eslint-disable-next-line prefer-destructuring
  highwayDriveWidth = globals.assets.highwayDriveWidth;
  // eslint-disable-next-line prefer-destructuring
  drivingSteps = globals.gameplay.drivingSteps;

  highwayOffset = 0;

  spawnEntropy = globals.gameplay.spawnMaxEntropy;
  spawnHeightRemaining = -globals.gameplay.spawnMargin;

  leftBound = (canvas.width - highwayDriveWidth) / 2;
  rightBound = (canvas.width + highwayDriveWidth) / 2;

  // eslint-disable-next-line no-use-before-define
  window.requestAnimationFrame(gameLoop);
}

const highwayImg = document.getElementById('highway-img');
const carPlayer = document.getElementById('car-player-img');
const carEnemy = document.getElementById('car-enemy-img');

window.addEventListener('gamepadconnected', e =>
{
  // Use the first connected gamepad.
  // eslint-disable-next-line prefer-destructuring
  gamepad = e.gamepad;
});

document.addEventListener('keydown', e =>
{
  if (e.key === 'ArrowLeft')
  {
    player.movingLeft = true;
  }
  else if (e.key === 'ArrowRight')
  {
    player.movingRight = true;
  }
});

document.addEventListener('keyup', e =>
{
  if (e.key === 'ArrowLeft')
  {
    player.movingLeft = false;
  }
  else if (e.key === 'ArrowRight')
  {
    player.movingRight = false;
  }
});

function movePlayer ()
{
  // Use joystick input for horizontal movement.
  if (gamepad)
  {
    const oldX = player.x;

    // eslint-disable-next-line prefer-destructuring
    const joystick = gamepad.axes[0];
    player.x = (canvas.width - globals.carDefaults.width) / 2 + joystick * highwayDriveWidth / 2;

    gameStarted ||= Math.abs(player.x - oldX) >= 6;
  }

  // Use keyboard input for horizontal movement.
  else if (player.movingLeft)
  {
    gameStarted = true;
    player.x -= drivingSteps;
  }
  else if (player.movingRight)
  {
    gameStarted = true;
    player.x += drivingSteps;
  }
}

function moveGameplay ()
{
  spawnHeightRemaining -= drivingSteps;

  highwayOffset %= globals.assets.highwayImgHeight;
  highwayOffset += drivingSteps * 3;

  enemies.forEach((enemy, index) =>
  {
    // Set score and increase difficulty.
    if (!enemy.dodged && enemy.y > player.y + globals.carDefaults.height)
    {
      enemy.dodged = true;
      score++;

      spawnEntropy -= (spawnEntropy - globals.gameplay.spawnMinEntropy) * .02;
      drivingSteps += globals.gameplay.drivingSteps * .005;

      highwayImgWidth -= (highwayImgWidth - canvas.width) * .03;
      highwayDriveWidth = globals.assets.highwayDriveWidth * highwayImgWidth / globals.assets.highwayImgWidth;

      leftBound = (canvas.width - highwayDriveWidth) / 2;
      rightBound = (canvas.width + highwayDriveWidth) / 2;
    }

    // Move the enemy down.
    enemy.y += drivingSteps;

    // Remove the enemy when it goes offscreen.
    if (enemy.y > canvas.height)
    {
      enemy.dodged || score++;

      enemies.splice(index, 1);

      return;
    }

    // Move the enemy sideways.
    enemy.x += enemy.speed;

    // Reverse direction when hitting the sidewalls.
    if (enemy.x < leftBound)
    {
      enemy.speed = Math.abs(enemy.speed);
    }
    else if (enemy.x + globals.carDefaults.width > rightBound)
    {
      enemy.speed = -Math.abs(enemy.speed);
    }
  });
}

const isGameOver = () =>
  // Game over if the player hits a sidewall.
  player.x < leftBound - 20 || player.x + globals.carDefaults.width > rightBound + 20
  // Game over if the player hits an enemy.
  || enemies.some(enemy =>
    player.x < enemy.x + globals.carDefaults.width - 5
    && player.x + globals.carDefaults.width > enemy.x + 5
    && player.y < enemy.y + globals.carDefaults.height - 2
    && player.y + globals.carDefaults.height > enemy.y + 2);

function spawnEnemy ()
{
  if (spawnHeightRemaining <= -globals.gameplay.spawnMargin)
  {
    spawnHeightRemaining = globals.carDefaults.height;

    if (enemies.length <= globals.gameplay.minEnemies || Math.random() <= globals.gameplay.spawnChance)
    {
      // Equals the possible spawn area (see enemy.y)
      spawnHeightRemaining = globals.carDefaults.height + spawnEntropy;

      // Speed variation.
      const speedVariation = drivingSteps * 1 / 3 + Math.random() * drivingSteps * 1 / 2;

      const enemy = {
        x: leftBound + Math.random() * (highwayDriveWidth - globals.carDefaults.width),
        y: -(globals.carDefaults.height + spawnEntropy * Math.random()),
        speed: speedVariation * (Math.random() < .5 ? 1 : -1),
      };

      enemies.push(enemy);
    }
  }
}

function update ()
{
  movePlayer();
  moveGameplay();

  gameOver ||= gameStarted && isGameOver();
  gameOver || !gameStarted || spawnEnemy();

  // Draw the score.
  ctx.fillStyle = 'black';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width / 2 - 40, 30);
}

function draw ()
{
  // Clear the canvas.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the highway.
  ctx.drawImage(highwayImg, (canvas.width - highwayImgWidth) / 2, highwayOffset - globals.assets.highwayImgHeight + 1, highwayImgWidth, globals.assets.highwayImgHeight);
  ctx.drawImage(highwayImg, (canvas.width - highwayImgWidth) / 2, highwayOffset, highwayImgWidth, globals.assets.highwayImgHeight);

  // Draw the player.
  ctx.drawImage(carPlayer, player.x, player.y, globals.carDefaults.width, globals.carDefaults.height);

  // Draw the enemies.
  enemies.forEach(enemy =>
  {
    ctx.drawImage(carEnemy, enemy.x, enemy.y, globals.carDefaults.width, globals.carDefaults.height);
  });

  // Draw the score.
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width / 2 - 40, 30);

  // Draw the game over message.
  if (gameOver)
  {
    ctx.fillStyle = 'darkred';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2);
  }
}

function gameLoop ()
{
  update();
  draw();

  if (!gameOver)
  {
    window.requestAnimationFrame(gameLoop);
  }
  else
  {
    setTimeout(initGameplay, 3000);
  }
}

// Start the game loop.
initGameplay();