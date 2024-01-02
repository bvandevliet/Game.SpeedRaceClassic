/* eslint-disable func-style */
/* eslint-disable no-implicit-globals */

const globals = {
  assets: {
    highwayDriveWidth: 640,
    highwayImgHeight: 1600,
  },
  gameplay: {
    spawnHeight: 240,
    spawnEntropy: 60,
    spawnMargin: 100,
    spawnChance: .75,
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

const leftBound = (canvas.width - globals.assets.highwayDriveWidth) / 2;
const rightBound = (canvas.width + globals.assets.highwayDriveWidth) / 2;

let highwayOffset = 0;
let spawnHeightRemaining = -globals.gameplay.spawnMargin;

let score = 0;
let gameOver = false;

const highwayImg = document.getElementById('highway-img');
const carPlayer = document.getElementById('car-player-img');
const carEnemy = document.getElementById('car-enemy-img');

const enemies = [];

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
}

function moveGameplay ()
{
  spawnHeightRemaining -= globals.gameplay.drivingSteps;

  highwayOffset %= globals.assets.highwayImgHeight;
  highwayOffset += globals.gameplay.drivingSteps * 3;

  enemies.forEach((enemy, index) =>
  {
    // Move the enemy down.
    enemy.y += globals.gameplay.drivingSteps;

    // Move the enemy sideways.
    enemy.x += enemy.speed;

    // Reverse direction when hitting the sidewalls.
    if (enemy.x < leftBound || enemy.x + globals.carDefaults.width > rightBound)
    {
      enemy.speed *= -1;
    }

    if (enemy.y > canvas.height)
    {
      enemies.splice(index, 1);
    }

    if (!enemy.dodged && enemy.y > player.y + globals.carDefaults.height)
    {
      enemy.dodged = true;
      score++;

      // Increase difficulty.
      globals.gameplay.spawnHeight = Math.max(.99 * globals.gameplay.spawnHeight, globals.carDefaults.height + globals.gameplay.spawnEntropy);
      globals.gameplay.drivingSteps *= 1.01;
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
      const speedVariation = globals.gameplay.drivingSteps * 2 / 3 + Math.random() * globals.gameplay.drivingSteps * 2 / 3;

      const enemy = {
        x: leftBound + Math.random() * (globals.assets.highwayDriveWidth - globals.carDefaults.width),
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

    // console.log(globals.gameplay);
  }
}

function draw ()
{
  // Clear the canvas.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the highway.
  ctx.drawImage(highwayImg, 0, highwayOffset - globals.assets.highwayImgHeight + 1);
  ctx.drawImage(highwayImg, 0, highwayOffset);

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