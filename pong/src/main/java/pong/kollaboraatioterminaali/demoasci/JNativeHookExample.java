package pong.kollaboraatioterminaali.demoasci;


//Tämä koodi on github reposta https://github.com/kwhat/jnativehook
//https://github.com/kwhat/jnativehook/blob/2.2/COPYING.md



import com.github.kwhat.jnativehook.keyboard.NativeKeyEvent;
import com.github.kwhat.jnativehook.keyboard.NativeKeyListener;

public class JNativeHookExample implements NativeKeyListener {


    private PlayerInputListener playerInputListener;

    public JNativeHookExample(PlayerInputListener playerInputListener) {
        this.playerInputListener = playerInputListener;
    }

    
    @Override
    public void nativeKeyPressed(NativeKeyEvent e) {
        playerInputListener.onKeyPressed(e.getKeyCode());
    }

    @Override
    public void nativeKeyReleased(NativeKeyEvent e) {
        playerInputListener.onKeyReleased(e.getKeyCode());
    }

    @Override
    public void nativeKeyTyped(NativeKeyEvent e) {
        playerInputListener.onKeyTyped(e.getKeyCode());
    }

    public interface PlayerInputListener {
        void onKeyPressed(int keyCode);
        void onKeyReleased(int keyCode);
        void onKeyTyped(int keyCode);
    }

}