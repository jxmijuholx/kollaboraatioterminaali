package pong.kollaboraatioterminaali.demoasci;


//https://github.com/kwhat/jnativehook
//https://github.com/kwhat/jnativehook/blob/2.2/COPYING.md

import com.github.kwhat.jnativehook.GlobalScreen;
import com.github.kwhat.jnativehook.NativeHookException;

public class Player  extends Thread implements JNativeHookExample.PlayerInputListener {
    
    private JNativeHookExample jNativeHookExample;

    public static final String ANSI_RESET = "\u001B[0m";
    public static final String ANSI_RED = "\u001B[31m";
    public static final String ANSI_CLEAR = "\u001B[2J";
    public static final String ANSI_HOME = "\u001B[H";

      
    public int movement =0;
    // public int liiku = 0;
    public String test;
    private int previousMovement = -1;  // Tallennetaan edellinen liike


    //Koodin ajaessa luetaan käyttäjän näppäimistöä.
    //
    @Override
    public void onKeyPressed(int keyCode) {
        // keyCode = w
        if( keyCode == 17){
            if(movement> 0){
                movement--;
            }
            // keyCode = s
        }else if( keyCode == 31){
            if(movement< 10){
                movement++;
            }      
        }
    }

    //Ei käytössä
    @Override
    public void onKeyReleased(int keyCode) {
        // System.out.println("Key pressed: " + keyCode);
    }
    //Ei käytössä
    @Override
    public void onKeyTyped(int keyCode) {
        // System.out.println("Key pressed: " + keyCode);
    }


    public Player() {
        jNativeHookExample = new JNativeHookExample(this);
        try {
            GlobalScreen.registerNativeHook();
            GlobalScreen.addNativeKeyListener(jNativeHookExample);
        } catch (NativeHookException e) {
            e.printStackTrace();
        }
    }

  

    //Threadi pelaajan piirtämiseen
    @Override
    public void run() {
        while (true) {
            drawPlayer();
            
            try {
                Thread.sleep(100);  // Adjust the delay as needed
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }



    //Pelaajan piirtäminen
    public void drawPlayer() {

        //poista edellinen pelaajan merkki
        if (previousMovement >= 0) {
            System.out.print("\u001B[" + (previousMovement ) + ";1H" + " " );
        }

        //Piirrä uusi pelaaja
        System.out.print("\u001B[" + (movement ) + ";" + "H" + ANSI_RED + "0" + ANSI_RESET);    
        // Päivitetään edellinen liike
        previousMovement = movement;
        
        
    }
}


