package davidchiriac.github.io.bibleplanner;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    private static final String PREFS_NAME = "BiblePlannerWidget";

    @PluginMethod
    public void updateWidget(PluginCall call) {
        String progress = call.getString("progress", "0");
        String status = call.getString("status", "Progres citire");
        String step = call.getString("step", "");
        String stepType = call.getString("stepType", "ontrack");
        String todayReading = call.getString("todayReading", "Deschide aplica\u021bia");

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("progress", progress);
        editor.putString("status", status);
        editor.putString("step", step);
        editor.putString("stepType", stepType);
        editor.putString("todayReading", todayReading);
        editor.apply();

        // Trigger widget refresh
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName widget = new ComponentName(context, ReadingWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(widget);
        if (ids.length > 0) {
            new ReadingWidgetProvider().onUpdate(context, manager, ids);
        }

        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }
}
