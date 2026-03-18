package davidchiriac.github.io.bibleplanner;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static boolean pluginsRegistered = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        if (!pluginsRegistered) {
            registerPlugin(WidgetBridgePlugin.class);
            pluginsRegistered = true;
        }
        super.onCreate(savedInstanceState);
    }
}
