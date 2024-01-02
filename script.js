/* eslint-disable func-style */
/* eslint-disable no-implicit-globals */

const globals = {
  assets: {
    highwayDriveWidth: 750,
    highwayImgWidth: 1400,
    highwayImgHeight: 1800,
  },
  gameplay: {
    spawnHeight: 240,
    spawnEntropy: 80,
    spawnMargin: 50,
    spawnChance: .5,
    minEnemies: 2,
    drivingSteps: 6,
  },
  carDefaults: {
    width: 50,
    height: 90,
  },
};

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
  x: canvas.width / 2 - globals.carDefaults.width / 2,
  y: canvas.height - globals.carDefaults.height * 3,
  color: 'blue',
  speed: 5,
  movingLeft: false,
  movingRight: false,
};

let { highwayImgWidth, highwayDriveWidth } = globals.assets;
let highwayOffset = 0;
let spawnHeightRemaining = -globals.gameplay.spawnMargin;

let score = 0;
let gameOver = false;

let leftBound = (canvas.width - highwayDriveWidth) / 2;
let rightBound = (canvas.width + highwayDriveWidth) / 2;

const highwayImg = document.getElementById('highway-img');
const carPlayer = document.getElementById('car-player-img');
const carEnemy = document.getElementById('car-enemy-img');

const enemies = [];

let gamepad;
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
  if (player.movingLeft)
  {
    player.x -= player.speed;
  }
  else if (player.movingRight)
  {
    player.x += player.speed;
  }

  // Use joystick input for horizontal movement.
  if (gamepad)
  {
    // eslint-disable-next-line prefer-destructuring
    const joystick = gamepad.axes[0];
    player.x = (canvas.width - globals.carDefaults.width) / 2 + joystick * highwayDriveWidth / 2;
  }
}

function moveGameplay ()
{
  spawnHeightRemaining -= globals.gameplay.drivingSteps;

  highwayOffset %= globals.assets.highwayImgHeight;
  highwayOffset += globals.gameplay.drivingSteps * 3;

  enemies.forEach((enemy, index) =>
  {
    // Set score and increase difficulty.
    if (!enemy.dodged && enemy.y > player.y + globals.carDefaults.height)
    {
      enemy.dodged = true;
      score++;

      globals.gameplay.spawnHeight = Math.max(.992 * globals.gameplay.spawnHeight, globals.carDefaults.height + globals.gameplay.spawnEntropy);
      globals.gameplay.drivingSteps *= 1.005;

      highwayImgWidth = Math.max(.99 * highwayImgWidth, canvas.width);
      highwayDriveWidth = globals.assets.highwayDriveWidth * highwayImgWidth / globals.assets.highwayImgWidth;

      leftBound = (canvas.width - highwayDriveWidth) / 2;
      rightBound = (canvas.width + highwayDriveWidth) / 2;
    }

    // Move the enemy down.
    enemy.y += globals.gameplay.drivingSteps;

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

function checkCollisions ()
{
  gameOver =
    // Game over if the player hits a sidewall.
    player.x < leftBound - 20 || player.x + globals.carDefaults.width > rightBound + 20
    // Game over if the player hits an enemy.
    || enemies.some(enemy =>
      player.x < enemy.x + globals.carDefaults.width - 5
      && player.x + globals.carDefaults.width > enemy.x + 5
      && player.y < enemy.y + globals.carDefaults.height - 2
      && player.y + globals.carDefaults.height > enemy.y + 2);
}

function spawnEnemy ()
{
  if (spawnHeightRemaining <= -globals.gameplay.spawnMargin)
  {
    spawnHeightRemaining = globals.gameplay.spawnHeight;

    if (enemies.length <= globals.gameplay.minEnemies || Math.random() <= globals.gameplay.spawnChance)
    {
      // Speed variation.
      const speedVariation = globals.gameplay.drivingSteps * 1 / 3 + Math.random() * globals.gameplay.drivingSteps * 1 / 2;

      const enemy = {
        x: leftBound + Math.random() * (highwayDriveWidth - globals.carDefaults.width),
        y: -Math.random() * (globals.gameplay.spawnHeight - globals.carDefaults.height) - globals.carDefaults.height,
        color: 'red',
        speed: speedVariation * (Math.random() < .5 ? 1 : -1),
      };

      enemies.push(enemy);
    }
  }
}

function update ()
{
  if (!gameOver)
  {
    movePlayer();
    moveGameplay();
    checkCollisions();
    spawnEnemy();

    console.debug(
      `drivingSteps: ${globals.gameplay.drivingSteps}\n`
      + `drivingWidth: ${highwayDriveWidth}\n`
      + `spawnHeight:  ${globals.gameplay.spawnHeight}`,
    );
  }
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
  ctx.fillText(`Score: ${score}`, 10, 30);

  // Draw the game over message.
  if (gameOver)
  {
    ctx.fillText('Game Over', canvas.width / 2 - 60, canvas.height / 2);
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
}

// Start the game loop.
window.requestAnimationFrame(gameLoop);