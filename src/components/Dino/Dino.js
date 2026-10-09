import React, { useEffect, useRef, useState } from "react";
import "./Dino.css";

function Dino() {
  const dinoRef = useRef();
  const cactusRef = useRef();
  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    const savedHighScore = localStorage.getItem("dinoHighScore");
    return Number(savedHighScore) || 0;
  });

  const [gameOver, setGameOver] = useState(false);
  const [runId, setRunId] = useState(0);

  const shieldRef = useRef(null);
  const cactusHitRef = useRef(false);

  const [hasShield, setHasShield] = useState(false);
  const [shieldVisible, setShieldVisible] = useState(false);

  const doubleRef = useRef(null);
  const [doubleVisible, setDoubleVisible] = useState(false);

  const [selectedSkin, setSelectedSkin] = useState(() => {
    return localStorage.getItem("dinoSelectedSkin") || "classic";
  });

  const skins = [
    { id: "classic", name: "Classic Dino", unlock: 0 },
    { id: "green", name: "Green Dino", unlock: 10000 },
    { id: "ice", name: "Ice Dino", unlock: 50000 },
    { id: "lava", name: "Lava Dino", unlock: 100000 },
    { id: "golden", name: "Golden Dino", unlock: 500000 },
  ];

  const activeSkin = skins.some(
    (skin) => skin.id === selectedSkin && highScore >= skin.unlock
  )
  ? selectedSkin
  : "classic";

  const backgroundColors = [
    "#FFFFFF", // White
    "#6e99f5", // Light Blue
    "#f5425d", // Light Red
    "#42f58d", // Light Green
    "#9364fa", // Light Purple
    "#fac364", // Light Orange
  ];

  const colorIndex = Math.floor(score / 500) % backgroundColors.length

  const retryGame = () => {
    setScore(0);
    setGameOver(false);

    // Reset power ups
    setHasShield(false);
    setShieldVisible(false);
    setDoubleVisible(false);

    // Reset collision tracking
    cactusHitRef.current = false;

    // Restart game's animations
    setRunId((previous) => previous + 1);
  };

  const jump = () => {
    if (!!dinoRef.current && dinoRef.current.classList != "jump") {
      dinoRef.current.classList.add("jump");
      setTimeout(function () {
        dinoRef.current.classList.remove("jump");
      }, 300);
    }
  };

  //Save's a new personal best whenever the score goes up
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("dinoHighScore", String(score));
    }
  }, [score, highScore]);

  useEffect(() => {
    // Don't run the game loop after death
    if (gameOver) return;

    const isAlive = setInterval(function () {
      let doubleCollected = false;

      // get current dino Y position
      const dinoTop = parseInt(
        getComputedStyle(dinoRef.current).getPropertyValue("top")
      );

      // get current cactus X position
      let cactusLeft = parseInt(
        getComputedStyle(cactusRef.current).getPropertyValue("left")
      );

    // Check if dinosaur collects shield
    if (shieldRef.current && dinoRef.current && !hasShield) {
      const dinoRect = dinoRef.current.getBoundingClientRect();
      const shieldRect = shieldRef.current.getBoundingClientRect();

      const touching =
        dinoRect.left < shieldRect.right &&
        dinoRect.right > shieldRect.left &&
        dinoRect.top < shieldRect.bottom &&
        dinoRect.bottom > shieldRect.top;

      if (touching) {
        setHasShield(true);
        setShieldVisible(false);
      }
    }

    // Check if dinosaur collects the 2x power up
    if (doubleRef.current && dinoRef.current) {
      const dinoRect = dinoRef.current.getBoundingClientRect();
      const doubleRect = doubleRef.current.getBoundingClientRect();

      const touching =
        dinoRect.left < doubleRect.right &&
        dinoRect.right > doubleRect.left &&
        dinoRect.top < doubleRect.bottom &&
        dinoRect.bottom > doubleRect.top;

      if (touching) {
        doubleCollected = true;
        setDoubleVisible(false);
      }
    }

    // Allow the next cactus to cause a new collision
    if (cactusLeft >= 40 || cactusLeft <= 0) {
      cactusHitRef.current = false;
    }

    // Detect collision
    if (
      cactusLeft < 40 &&
      cactusLeft > 0 &&
      dinoTop >= 140 &&
      !cactusHitRef.current
    ) {
      cactusHitRef.current = true;

      if (hasShield) {

        // Shield absorbs the cactus hit
        setHasShield(false);
      } else {
        
        // No shield, Game Over
        setGameOver(true);
              }

    } else {
        setScore((previousScore) => {
          if (doubleCollected) {
            return previousScore * 2;
          }

          return previousScore + 1;
        });
      }
    }, 10);

    return () => clearInterval(isAlive);
  }, [gameOver, score, hasShield, runId]);

  useEffect(() => {
    if (gameOver || shieldVisible) return;

    // Random delay between 10 and 15 seconds
    const delay = Math.random() * 5000 + 10000;

    const timer = setTimeout(() => {
      if (!hasShield) {
        setShieldVisible(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [shieldVisible, hasShield, gameOver, runId]);

    useEffect(() => {
      if (gameOver || doubleVisible) return;

      // Spawn every 12–20 seconds
      const delay = Math.random() * 8000 + 12000;

      const timer = setTimeout(() => {
        setDoubleVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }, [doubleVisible, gameOver, runId]);

  useEffect(() => {
    if (gameOver) return;

    document.addEventListener("keydown", jump);

    return () => document.removeEventListener("keydown", jump);
  }, [gameOver]);

  return (
    <>

    <div
      key={runId}
      className={`game ${gameOver ? "gameOver" : ""}`}
      style={{ backgroundColor: backgroundColors[colorIndex] }}
    >
      <div className="scoreDisplay">
        Score: {score} | Best: {highScore}
      </div>

      <div
        id="dino"
        ref={dinoRef}
        className={`skin-${activeSkin}`}
      ></div>
      
      <div id="cactus" ref={cactusRef}></div>

      {shieldVisible && (
        <div
          id="shield"
          ref={shieldRef}
          onAnimationEnd={() => setShieldVisible(false)}
        >
          🛡️
        </div>
      )}

      {doubleVisible && (
        <div
          id="doublePowerUp"
          ref={doubleRef}
          onAnimationEnd={() => setDoubleVisible(false)}
        >
          2×
        </div>
      )}

      <span className="shieldStatus">
        Shield: {hasShield ? "ACTIVE 🛡️" : "NONE"}
      </span>

      {gameOver && (
        <div className="deathScreen">
          <h1>You Died!</h1>

          <p>Final Score: {score}</p>
          <p>Personal Best: {highScore}</p>

          <button onClick={retryGame}>
            Retry
          </button>
        </div>
      )}

    </div>

    <div className="skinSelector">
      <label htmlFor="skinChoice">Choose Your Dino: </label>

      <select
        id="skinChoice"
        value={activeSkin}
        onChange={(event) => {
          const newSkin = event.target.value;

          setSelectedSkin(newSkin);
          localStorage.setItem("dinoSelectedSkin", newSkin);
        }}
      >

        {skins.map((skin) => (
          <option
            key={skin.id}
            value={skin.id}
            disabled={highScore < skin.unlock}
          >
            {skin.name}
            {highScore < skin.unlock
              ? ` - Locked (${skin.unlock.toLocaleString()})`
              : " - Unlocked"}
          </option>
        ))}
      </select>
    </div>
  </>
  );
}

export default Dino;



// To enter dino game cd "HW 3\dino-game"
// npm.cmd start