/* eslint-disable func-style */
/* eslint-disable no-implicit-globals */

const globals = {
  gameplay: {
    minEnemies: 2,
  },
  carDefaults: {
    width: 40,
    height: 60,
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

const enemies = [];

let score = 0;
let gameOver = false;

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

function moveEnemies ()
{
  enemies.forEach((enemy, index) =>
  {
    // Move the enemy down.
    enemy.y += 2;

    // Move the enemy sideways.
    enemy.x += enemy.speed;

    // Reverse direction when hitting the sidewalls.
    if (enemy.x < 0 || enemy.x + globals.carDefaults.width > canvas.width)
    {
      enemy.speed *= -1;
    }

    if (enemy.y > canvas.height)
    {
      enemies.splice(index, 1);
      score++;
    }
  });
}

function checkCollisions ()
{
  gameOver =
    // Game over if the player hits a sidewall.
    player.x < 0 || player.x + globals.carDefaults.width > canvas.width
    // Game over if the player hits an enemy.
    || enemies.some(enemy =>
      player.x < enemy.x + globals.carDefaults.width
      && player.x + globals.carDefaults.width > enemy.x
      && player.y < enemy.y + globals.carDefaults.height
      && player.y + globals.carDefaults.height > enemy.y);
}

function update ()
{
  if (!gameOver)
  {
    movePlayer();
    moveEnemies();
    checkCollisions();
  }
}

function draw ()
{
  // Clear the canvas.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the player.
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, globals.carDefaults.width, globals.carDefaults.height);

  // Draw the enemies.
  enemies.forEach(enemy =>
  {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, globals.carDefaults.width, globals.carDefaults.height);
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

function spawnEnemy ()
{
  if (enemies.length < globals.gameplay.minEnemies || Math.random() < .5)
  {
    // Random initial direction.
    const speedMultiplier = Math.random() < .5 ? 1 : -1;

    // Speed variation between 1 and 3.
    const speedVariation = Math.random() * 2 + 1;

    const enemy = {
      width: 40,
      height: 60,
      x: Math.random() * (canvas.width - 40),
      y: -60,
      color: 'red',
      speed: speedMultiplier * speedVariation,
    };

    // Check for vertical distance between the new enemy and existing enemies.
    const safeVerticalDistance = enemies.every(existingEnemy =>
      enemy.y + globals.carDefaults.height < existingEnemy.y);

    // If there's sufficient vertical distance, add the new enemy.
    if (safeVerticalDistance)
    {
      enemies.push(enemy);
    }
  }
}

// Adjust the interval to control the spawn frequency.
setInterval(spawnEnemy, 1600);

// Start the game loop.
window.requestAnimationFrame(gameLoop);