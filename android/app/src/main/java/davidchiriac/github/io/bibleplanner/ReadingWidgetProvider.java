package davidchiriac.github.io.bibleplanner;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;

public class ReadingWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "BiblePlannerWidget";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        String progress = prefs.getString("progress", "0");
        String status = prefs.getString("status", "Progres citire");
        String step = prefs.getString("step", "");
        String stepType = prefs.getString("stepType", "ontrack");
        String todayReading = prefs.getString("todayReading", "Deschide aplica\u021bia");

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_reading);

            views.setTextViewText(R.id.widget_progress, progress + "%");
            views.setTextViewText(R.id.widget_status, status);
            views.setTextViewText(R.id.widget_step, step);

            // Color the step based on type
            int stepColor;
            switch (stepType) {
                case "ahead":
                    stepColor = Color.parseColor("#88937B"); // muted sage
                    break;
                case "behind":
                    stepColor = Color.parseColor("#A46447"); // terracotta
                    break;
                default:
                    stepColor = Color.parseColor("#6B5A45"); // brown
                    break;
            }
            views.setInt(R.id.widget_step, "setTextColor", stepColor);

            views.setTextViewText(R.id.widget_today, todayReading);

            // Tap to open the app
            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
