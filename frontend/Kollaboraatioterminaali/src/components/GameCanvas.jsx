import React, { useEffect, useRef } from 'react';

const GameCanvas = ({ pelitila }) => {
  const canvasRef = useRef(null);
  const paddleHeight = 100;
  const paddleWidth = 10;
  const canvasWidth = 600;
  const canvasHeight = 400;

  // Poimitaan pelaajien positiot pelitilasta
  const positions = Object.entries(pelitila.state).map(([clientID, clientData]) => {
    return {
      clientID: clientID,
      position: clientData.position
    };
  });
  let pelaaja1 = 0;
  let pelaaja2 = 0;

   pelaaja1 = positions[0]["position"];
   pelaaja2 = positions[1]["position"];

  const drawPaddles = (ctx, leftPaddleY, rightPaddleY) => {
    // Tyhjennetään canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Piirretään vasen maila pelaaja1:n sijainnin mukaan
    ctx.fillStyle = 'blue';
    ctx.fillRect(10, leftPaddleY, paddleWidth, paddleHeight);

    // Piirretään oikea maila pelaaja2:n sijainnin mukaan
    ctx.fillStyle = 'red';
    ctx.fillRect(canvasWidth - paddleWidth - 10, rightPaddleY, paddleWidth, paddleHeight);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Muunnetaan position-arvot canvasin koordinaateiksi
    const leftPaddleY = (canvasHeight / 2) + pelaaja1 * (canvasHeight / 2 - paddleHeight / 2);
    const rightPaddleY = (canvasHeight / 2) + pelaaja2 * (canvasHeight / 2 - paddleHeight / 2);

    // Piirretään päivitetyt mailat
    drawPaddles(ctx, leftPaddleY, rightPaddleY);
  }, [pelaaja1, pelaaja2]); // Päivitetään aina kun pelaaja1 tai pelaaja2 muuttuu

  return (
    <canvas ref={canvasRef} width={600} height={400} style={{ border: '1px solid black' }}></canvas>
  );
};

export default GameCanvas;
