import React, { useEffect, useRef } from 'react';

const GameCanvas = ({ pelitila }) => {
  const canvasRef = useRef(null);
  const paddleHeight = 100;
  const paddleWidth = 10;
  const canvasWidth = 600;
  const canvasHeight = 400;
  const ballRadius = 10;

  // game.state positiot ja otetaan ensimmäinen arvo ball pois 
  const positions = Object.entries(pelitila.state)
    .filter(([key]) => key !== "ball") 
    .map(([clientID, clientData]) => ({
      clientID: clientID,
      position: clientData.position
    }));

  //pelaaja positiot ja oletusarvot jos ei ole liikutetu
  const p1 = positions[0]?.position || 0;  
  const p2 = positions[1]?.position || 0;  

  // piirrää pelaajat
  const drawPaddles = (ctx, p1, p2) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Laske mailan y-koordinaatit - tässä vielä ongelmaa
    const leftPaddleY = Math.max(
      0,
      Math.min(
        (canvasHeight / 2) - (p1 * (canvasHeight / 20)) - (paddleHeight / 2),
        canvasHeight - paddleHeight
      )
    );

    // Laske mailan y-koordinaatit - tässä vielä ongelmaa
    const rightPaddleY = Math.max(
      0,
      Math.min(
        (canvasHeight / 2) - (p2 * (canvasHeight / 20)) - (paddleHeight / 2),
        canvasHeight - paddleHeight
      )
    );

    // Maila vasen
    ctx.fillStyle = 'blue';
    ctx.fillRect(10, leftPaddleY, paddleWidth, paddleHeight);

    // maila oikea
    ctx.fillStyle = 'red';
    ctx.fillRect(canvasWidth - paddleWidth - 10, rightPaddleY, paddleWidth, paddleHeight);
  };

  // Piirrä pallo - tämä piirtyy vielä molemmille samalla tavalla -> korjaa peilikuvana
  const drawBall = (ctx, ball) => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  };

  // Piirretään mailat ja pallo käyttäen päivitettyä pelitilaa
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

  
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Tyhjennetään canvas jokaisen piirron välillä
    drawPaddles(ctx, p1, p2);
    drawBall(ctx, pelitila.state.ball);

  }, [pelitila]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ border: '1px solid white', backgroundColor: 'black' }}
    />
  );
};

export default GameCanvas;
