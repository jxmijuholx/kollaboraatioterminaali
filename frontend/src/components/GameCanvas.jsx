import React, { useState ,useEffect, useRef } from 'react';

const GameCanvas = ({ pelitila }) => {
  const canvasRef = useRef(null);

  // Käytetään pelitilan tietoja kanvaskokoihin ja mailoihin
  const { width: canvasWidth, height: canvasHeight } = pelitila.state.canvas;
  const ballRadius = pelitila.state.ball.radius; // Pallon säde

  // Piirrä mailat käyttäen pelitilan tietoja
  const drawPaddles = (ctx) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Tyhjennetään canvas ennen piirtoa

    const leftPaddle = pelitila.state.paddles.left;
    const rightPaddle = pelitila.state.paddles.right;

    // Vasemman mailan piirtäminen
    ctx.fillStyle = 'blue';
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.thickness, leftPaddle.height);

    // Oikean mailan piirtäminen
    ctx.fillStyle = 'red';
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.thickness, rightPaddle.height);
  };

  // Piirrä pallo
  const drawBall = (ctx) => {
    ctx.beginPath();
    ctx.arc(pelitila.state.ball.x, pelitila.state.ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  };

  // Piirrä pelitilanne kanvakselle
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Piirrä mailat ja pallo
    drawPaddles(ctx);
    drawBall(ctx);
  }, [pelitila]);



  return (
    <>
    
    <div style={{marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Pelaajien pisteet</h3>

            <div style={{ fontSize: '30px', fontWeight: 'bold' }}>
                <span style={{ color: 'blue', marginRight: '20px' }}>
                    {pelitila.state.score.left}
                </span>
                <span style={{ color: 'red' }}>
                    {pelitila.state.score.right}
                </span>
            </div>
        </div>

    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ border: '1px solid white', backgroundColor: 'black' }}
    />

    </>

  );
};

export default GameCanvas;
