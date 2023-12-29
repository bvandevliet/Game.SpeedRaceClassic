/* eslint-disable func-style */
/* eslint-disable no-implicit-globals */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 60,
  color: 'blue',
  speed: 5,
  movingLeft: false,
  movingRight: false,
};

const enemies = [];
let score = 0;
let gameOver = false;

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleKeyDown (event)
{
  if (event.key === 'ArrowLeft')
  {
    player.movingLeft = true;
  }
  else if (event.key === 'ArrowRight')
  {
    player.movingRight = true;
  }
}

function handleKeyUp (event)
{
  if (event.key === 'ArrowLeft')
  {
    player.movingLeft = false;
  }
  else if (event.key === 'ArrowRight')
  {
    player.movingRight = false;
  }
}

function drawPlayer ()
{
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawEnemy (enemy)
{
  ctx.fillStyle = 'red';
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

function movePlayer ()
{
  if (player.movingLeft && player.x > 0)
  {
    player.x -= player.speed;
  }
  else if (player.movingRight && player.x < canvas.width - player.width)
  {
    player.x += player.speed;
  }
}

function moveEnemies ()
{
  for (let i = 0; i < enemies.length; i++)
  {
    enemies[i].y += 2;

    // Move left and right at a static speed
    enemies[i].x += enemies[i].speed;

    // Reverse direction when hitting the sidewalls
    if (enemies[i].x < 0 || enemies[i].x + enemies[i].width > canvas.width)
    {
      enemies[i].speed *= -1;
    }
  }

  enemies.forEach((enemy, index) =>
  {
    if (enemy.y > canvas.height)
    {
      enemies.splice(index, 1);
      score++;
    }
  });
}

function checkCollisions ()
{
  enemies.forEach(enemy =>
  {
    if (
      player.x < enemy.x + enemy.width
            && player.x + player.width > enemy.x
            && player.y < enemy.y + enemy.height
            && player.y + player.height > enemy.y
    )
    {
      gameOver = true;
    }

    if (player.x < 0 || player.x + player.width > canvas.width)
    {
      gameOver = true;
    }
  });
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();

  enemies.forEach(drawEnemy);

  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);

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
    requestAnimationFrame(gameLoop);
  }
}

function generateEnemies ()
{
  const enemyWidth = 40;
  const enemyHeight = 60;

  // Adjust the spawn frequency by reducing the interval (currently set to 800 milliseconds)
  if (Math.random() < 0.5 && enemies.length < 5)
  {
    const speedMultiplier = Math.random() < 0.5 ? 1 : -1;
    const speedVariation = Math.random() * 2 + 1; // Speed variation between 1 and 3
    const verticalDistance = Math.random() * 200 + 50; // Vertical distance between 50 and 250
    const enemy = {
      x: Math.random() * (canvas.width - enemyWidth),
      y: -enemyHeight - verticalDistance,
      width: enemyWidth,
      height: enemyHeight,
      speed: speedMultiplier * speedVariation,
    };

    // Check for vertical distance between the new enemy and existing enemies
    const safeVerticalDistance = enemies.every(existingEnemy => (
      enemy.y + enemy.height < existingEnemy.y
          || existingEnemy.y + existingEnemy.height < enemy.y
    ));

    // If there's sufficient vertical distance, add the new enemy
    if (safeVerticalDistance)
    {
      enemies.push(enemy);
    }
  }
}

// Adjust the interval to control the spawn frequency (currently set to 800 milliseconds)
setInterval(generateEnemies, 1200);

gameLoop();