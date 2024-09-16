package pong.kollaboraatioterminaali.demoasci;

public class Ball  extends Thread{

    //Pallon suunnat
    boolean up = true;
    boolean down = false;
    boolean right = true;
    boolean left = false;

    //Pallon sijainti
    //Nykyinen
    int px = 2; 
    int py = 2;
    //Edellinen
    int prevPx = px;
    int prevPy = py;

    //Pallon merkki
    String pallo = "*";


    //Pallon threadi, liikkuu itsenäisesti
    //Ei huomioi pelaajan kanssa 
    @Override
    public void run() {

        while (true) {

        //Pyyhi pois edellinen pallo

        //Vie kursorin pallon edelliseen sijaintiin
        System.out.print(String.format("\033[%d;%dH", prevPy, prevPx));
        //Tulostaa tyjhän edellisen pallon sijaintiin
        System.out.print(" ");
        
        //Päivitä edellinen sijainti uudella sijainnilla 
        prevPx = px;
        prevPy = py;

        // Tulostaa uuden pallon
        // Vie kursori pallon uuteen paikkaan
        System.out.print(String.format("\033[%d;%dH", py, px));
        //Tulosta pallo
        System.out.print(pallo);

        //Pallon liikkumissuunnat
        if (up && right) {
            py--; // Ylös
            px++; // Oikealle
        } else if (down && right) {
            py++; // Alas
            px++; // Oikealle
        } else if (down && left) {
            py++; // Alas
            px--; // Vasemmalle
        } else if (up && left) {
            py--; // Ylös
            px--; // Vasemmalle
        }

        // Rajojen tarkistus ja suunnan muutos. Köykäinen, ei käytä pelitaulun tietoja vaan kovakoodattu
        if (py <= 1) { // Ylärivi
            up = false;
            down = true;
        } else if (py >= 10) { // Alarivi
            down = false;
            up = true;
        }

        if (px <= 1) { // Vasensarake
            left = false;
            right = true;
        } else if (px >= 40) { // Oikeasarakke
            right = false;
            left = true;
        }

        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            
        }
    }

    }

}
