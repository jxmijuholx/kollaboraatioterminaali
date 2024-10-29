import React, { useEffect, useRef } from 'react';

const GameCanvas = ({ pelitila }) => {
  const canvasRef = useRef(null);
  const paddleHeight = 50; // sama kuin servulla
  const paddleWidth = 20; 
  const canvasWidth = 600;
  const canvasHeight = 400;
  const ballRadius = 10;

  // Pelitilan positiot, otetaan ensimmäinen arvo 'ball' pois
  const positions = Object.entries(pelitila.state)
    .filter(([key]) => key !== 'ball')
    .map(([clientID, clientData]) => ({
      clientID: clientID,
      position: clientData.position,
    }));

  // Pelaajien positiot, oletus asetettu pohjalle ja kun ekan kerran painaa niin pomppaa keskelle
  const p1 = positions[0]?.position || 0;
  const p2 = positions[1]?.position || 0;

  // Piirrää pelaajat
  const drawPaddles = (ctx, p1, p2) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    
    // Vasemman mailan x-sijainti, hieman irti vasemmasta 0 reunasta + 10
    const LPX_pos = 10;
    // Oikean mailan x-sijainti ja pemustetta -10
    const RPX_pos = canvasWidth - paddleWidth - 10;

    // Skaalataan p1 ja p2 kanvasin korkeudelle
    const positionScale = (canvasHeight - paddleHeight) / 8;
    //Ehtolauseet 0 arvoille, muuten pomppaa keskelle kun position arvo on 0
    const leftPaddleY = p1 === 0 ? canvasHeight - paddleHeight : canvasHeight - (p1 * positionScale) - paddleHeight;
    const rightPaddleY = p2 === 0 ? canvasHeight - paddleHeight : canvasHeight - (p2 * positionScale) - paddleHeight;


    // Piirretään vasen maila
    ctx.fillStyle = 'blue';
    //eka arvo on vasemman reunan x akseli ja toinen arvo on vasemman reunan y akseli
    ctx.fillRect(LPX_pos, leftPaddleY, paddleWidth, paddleHeight);

    // Piirretään oikea maila
    ctx.fillStyle = 'red';
    //eka arvo on vasemman reunan x akseli ja toinen arvo on vasemman reunan y akseli
    ctx.fillRect(RPX_pos, rightPaddleY, paddleWidth, paddleHeight);
  };

  // Piirrä pallo
  const drawBall = (ctx, ball) => {
    ctx.beginPath();
    const adjustedY = canvasHeight - ball.y; // pyöräyttää ympäri että piirto vastaa saatuja koordinaatteja
    ctx.arc(ball.x, adjustedY, ballRadius, 0, Math.PI * 2);
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
    drawBall(ctx, pelitila.state.ball); // Piirretään pallo koordinaattien mukaan

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
