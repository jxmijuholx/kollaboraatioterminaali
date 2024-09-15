package pong.kollaboraatioterminaali;

import org.jline.terminal.Terminal;
import org.jline.terminal.TerminalBuilder;
import org.jline.utils.NonBlockingReader;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class Pong {

    private static final String RESET = "\033[0m";
    private static final String PADDLE_COLOR = "\033[44m"; // blue
    private static final String BALL_COLOR = "\033[41m";   // red
    private static final int HEIGHT = 20; // game area height
    private static final int WIDTH = 40;  // game are width
    private static final int DELAY_MS = 50; // how often game is updated

    // paddle start positions
    private int leftPaddlePosition = HEIGHT / 2;  // left paddle starts in middle
    private int rightPaddlePosition = HEIGHT / 2; // right paddle starts in middle

    // ball start poistion and movement
    private int ballX = WIDTH / 2;  // ball starts in middle
    private int ballY = HEIGHT / 2;
    private int ballVelocityX = 1;  // ball moves 1 step to right initially
    private int ballVelocityY = 1;  // ball moves 1 step down initially

    public void start() throws InterruptedException, IOException {
        Terminal terminal = TerminalBuilder.terminal();
        NonBlockingReader reader = terminal.reader();

        long lastUpdateTime = System.currentTimeMillis();

        while (true) {
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastUpdateTime >= DELAY_MS) {
                lastUpdateTime = currentTime;

                // clear console
                System.out.print("\033[H\033[2J");
                System.out.flush();

                // render the game
                for (int i = 0; i < HEIGHT; i++) {
                    for (int j = 0; j < WIDTH; j++) {
                        if (j == 0) { 
                            // left paddle
                            if (i == leftPaddlePosition) {
                                System.out.print(PADDLE_COLOR + "|" + RESET); // left paddle position
                            } else {
                                System.out.print("|"); // left wall
                            }
                        } else if (j == WIDTH - 1) { 
                            // right paddle
                            if (i == rightPaddlePosition) {
                                System.out.print(PADDLE_COLOR + "|" + RESET); // right paddle position
                            } else {
                                System.out.print("|"); // right wall
                            }
                        } else if (i == ballY && j == ballX) {
                            // pall position
                            System.out.print(BALL_COLOR + "O" + RESET); // rendered ball
                        } else {
                            System.out.print(" "); // empty space
                        }
                    }
                    System.out.println();
                }

                // move the ball
                ballX += ballVelocityX;
                ballY += ballVelocityY;

                // ball collision with top and bottom walls
                if (ballY <= 0 || ballY >= HEIGHT - 1) {
                    ballVelocityY = -ballVelocityY; // reverse vertical direction
                }

                // ball collision with paddles
                if (ballX == 1 && ballY == leftPaddlePosition) {
                    ballVelocityX = -ballVelocityX; // ball hits left paddle
                } else if (ballX == WIDTH - 2 && ballY == rightPaddlePosition) {
                    ballVelocityX = -ballVelocityX; // ball hits right paddle
                }

                // ball goes off the screen (scoring)
                if (ballX <= 0 || ballX >= WIDTH - 1) {
                    // reset ball to the center
                    ballX = WIDTH / 2;
                    ballY = HEIGHT / 2;

                    // reset velocity
                    ballVelocityX = ballX <= 0 ? 1 : -1; // send ball towards the player who scored
                }

                // check for input
                if (reader.available() > 0) {
                    int key = reader.read(); 

                    // left paddle movement
                    if (key == 'w' || key == 'W') { // move up
                        if (leftPaddlePosition > 0) {
                            leftPaddlePosition--;
                        }
                    } else if (key == 's' || key == 'S') { // move down
                        if (leftPaddlePosition < HEIGHT - 1) {
                            leftPaddlePosition++;
                        }
                    }

                    // right paddle movement
                    if (key == 65) { // arrow up
                        if (rightPaddlePosition > 0) {
                            rightPaddlePosition--;
                        }
                    } else if (key == 66) { // arrow down
                        if (rightPaddlePosition < HEIGHT - 1) {
                            rightPaddlePosition++;
                        }
                    }
                }

                // debug for printing ball position and velocity
                // System.out.println("Ball Position: (" + ballX + ", " + ballY + ")");
                // System.out.println("Ball Velocity: (" + ballVelocityX + ", " + ballVelocityY + ")");
            }

            // small sleep to reduce CPU usage
            Thread.sleep(10);
        }
    }
}
