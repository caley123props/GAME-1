function initGame() {
  const k = kaboom({
    width: 800,
    height: 600,
    background: [0, 0, 0],
    canvas: document.getElementById('game-canvas'),
    global: true,
    crisp: true,
    pixelDensity: 1,
  });

  // Kenney assets
  loadSprite("bg", "a/kenney_platformer-kit/kenney_new-platformer-pack-1.0/Sprites/Backgrounds/Default/background_color_trees.png");
  loadSprite("tile_block", "a/kenney_platformer-kit/kenney_new-platformer-pack-1.0/Sprites/Tiles/Default/terrain_stone_block.png");
  loadSprite("player_idle", "a/kenney_platformer-kit/kenney_new-platformer-pack-1.0/Sprites/Characters/Default/character_green_idle.png");
  loadSprite("goal_trophy", "a/kenney_platformer-kit/kenney_new-platformer-pack-1.0/Sprites/Tiles/Default/block_coin_active.png");
  loadSprite("enemy_bee", "a/kenney_platformer-kit/kenney_new-platformer-pack-1.0/Sprites/Enemies/Default/bee_a.png");

  // FIX: define once, outside the scene
  const levelDef = levels[currentLevel - 1];

  scene("game", () => {
    const TILE = 32, BASE = 16, TILE_SCALE = TILE / BASE;

    // Background
    add([sprite("bg"), pos(0, 0), z(-10)]);

    // Player
    const player = add([
      sprite("player_idle"),
      pos(100, 300),
      area(),
      body({ jumpForce: 360 }),   // use body’s jumpForce
      { speed: 200 }              // keep your speed; remove canJump/jumpForce fields
    ]);

    // Platforms
    levelDef.platforms.forEach(p => {
      for (let x = 0; x < p.width; x += TILE) {
        add([
          sprite("tile_block"),
          pos(p.x + x, p.y),
          scale(TILE_SCALE),
          area(),
          body({ isStatic: true }),
          "platform",
        ]);
      }
    });

    // Obstacles
    levelDef.obstacles.forEach(o => {
      add([
        sprite("enemy_bee"),
        pos(o.x, o.y),
        area(),
        body(),
        { speedX: o.speedX ?? 2, direction: o.direction ?? 1 },
        "obstacle",
      ]);
    });

    // Goal
    add([sprite("goal_trophy"), pos(levelDef.goal.x, levelDef.goal.y), area(), "goal"]);

    // Controls
    onKeyDown(["a", "left"], () => player.move(-player.speed, 0));
    onKeyDown(["d", "right"], () => player.move(player.speed, 0));
    onKeyPress(["w","up","space"], () => {
      if (player.isGrounded()) player.jump();  // no custom jumpForce needed
    });
    player.onCollide("platform", () => { });

    // Camera
    player.onUpdate(() => camPos(player.pos));

    // UI
    add([text(`LEVEL ${currentLevel}: ${levelDef.name}`, { size: 16 }), pos(10, 10), { z: 100 }]);
    add([text(() => `POS: ${Math.floor(player.pos.x)}, ${Math.floor(player.pos.y)}`, { size: 12 }), pos(10, 40), { z: 100 }]);

    // Obstacles update
    onUpdate("obstacle", (ob) => {
      ob.move(ob.speedX, 0);
      if (ob.pos.x <= 0 || ob.pos.x >= 768) ob.speedX *= -1;
    });

    // Win
    player.onCollide("goal", () => {
      if (currentLevel === unlockedLevels) unlockedLevels = Math.min(unlockedLevels + 1, levels.length);
      alert(`LEVEL ${currentLevel} COMPLETED!`);
      go("menu");
    });
  });

  go("game");
  document.getElementById('status').textContent =
    `LEVEL ${currentLevel}: ${levelDef.name} - REACH THE GOLDEN TROPHY!`;
}
