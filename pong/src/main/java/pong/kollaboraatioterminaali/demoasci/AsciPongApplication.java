package pong.kollaboraatioterminaali.demoasci;


import java.io.IOException;
public class AsciPongApplication {

    
    public static void main(String[] args) throws InterruptedException, IOException {

        GameTable gameTable = new GameTable();
        Player player = new Player();
        Ball ball = new Ball();


        //Tyhjennä konsoli ennen pelin piirtämistä
        System.out.print("\033[H\033[2J"); 

        //Piirtää pelitaulun kerran -> pallon ja pelaajan liikkuessa osa taulusta poistuu...
        gameTable.drawTable();

        //Aloittaan pallon threadin
        ball.start();
        //Aloittaa pelaaja threadin
        player.start();

        
        
        

    }

}
