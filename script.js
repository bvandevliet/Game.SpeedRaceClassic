/* eslint-disable func-style */
/* eslint-disable no-implicit-globals */

// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player car
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 60,
  color: 'blue',
  speed: 5,
};

// Enemy cars
const enemies = [];

// Game variables
let score = 0;
let gameOver = false;

// Function to handle arrow key press
function handleKeyPress (event)
{
  if (event.key === 'ArrowLeft' && player.x > 0)
  {
    player.x -= player.speed;
  }
  else if (event.key === 'ArrowRight' && player.x < canvas.width - player.width)
  {
    player.x += player.speed;
  }
}

// Event listener for arrow key input
document.addEventListener('keydown', handleKeyPress);

// Function to draw the player car
function drawPlayer ()
{
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Function to draw an enemy car
function drawEnemy (enemy)
{
  ctx.fillStyle = 'red';
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

// Function to move the enemy cars
function moveEnemies ()
{
  for (let i = 0; i < enemies.length; i++)
  {
    enemies[i].y += 2;
    // Add left-right movement to make it challenging
    enemies[i].x += Math.sin(enemies[i].y / 50) * 5;
  }

  // Remove enemies that have moved off the screen
  enemies.forEach((enemy, index) =>
  {
    if (enemy.y > canvas.height)
    {
      enemies.splice(index, 1);
      score++;
    }
  });
}

// Function to check for collisions
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

    // Check for collision with roadside barrier
    if (player.x < 0 || player.x + player.width > canvas.width)
    {
      gameOver = true;
    }
  });
}

// Function to update the game state
function update ()
{
  if (!gameOver)
  {
    moveEnemies();
    checkCollisions();
  }
}

// Function to draw the game
function draw ()
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();

  enemies.forEach(drawEnemy);

  // Display score
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);

  // Display game over message
  if (gameOver)
  {
    ctx.fillText('Game Over', canvas.width / 2 - 60, canvas.height / 2);
  }
}

// Function to run the game loop
function gameLoop ()
{
  update();
  draw();

  if (!gameOver)
  {
    requestAnimationFrame(gameLoop);
  }
}

// Function to generate random enemy cars
function generateEnemies ()
{
  const enemyWidth = 40;
  const enemyHeight = 60;

  const enemy = {
    x: Math.random() * (canvas.width - enemyWidth),
    y: -enemyHeight,
    width: enemyWidth,
    height: enemyHeight,
  };

  enemies.push(enemy);
}

// Generate an enemy every 1.5 seconds
setInterval(generateEnemies, 1500);

// Start the game loop
gameLoop();