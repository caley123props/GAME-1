function startLevel(levelNum) {
  currentLevel = levelNum;
  // ... show screen
  initGame();
  gameState = 'game';
  document.getElementById('game-canvas').focus();
}
