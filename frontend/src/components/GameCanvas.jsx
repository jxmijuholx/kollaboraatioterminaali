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

  const currentClientId = localStorage.getItem('clientId');
  const pelaaja1 = positions.find(p => p.clientID === localStorage.getItem('clientId')) || { position: 0 };
  const pelaaja2 = positions.find(p => p.clientID !== localStorage.getItem('clientId')) || { position: 0 };

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
    const leftPaddleY = Math.max(
      0,
      Math.min(
        (canvasHeight / 2) - (pelaaja1.position * (canvasHeight / 20)) - (paddleHeight / 2),
        canvasHeight - paddleHeight
      )
    );

    const rightPaddleY = Math.max(
      0,
      Math.min(
        (canvasHeight / 2) - (pelaaja2.position * (canvasHeight / 20)) - (paddleHeight / 2),
        canvasHeight - paddleHeight
      )
    );


    // Piirretään päivitetyt mailat
    drawPaddles(ctx, leftPaddleY, rightPaddleY);
  }, [pelaaja1, pelaaja2, pelitila]); // Päivitetään aina kun pelaaja1 tai pelaaja2 muuttuu

  return (
    <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ border: '1px solid white', backgroundColor: 'black' }}></canvas>
  );
};

export default GameCanvas;
