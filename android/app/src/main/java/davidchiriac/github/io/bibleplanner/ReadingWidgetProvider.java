package davidchiriac.github.io.bibleplanner;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class ReadingWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "BiblePlannerWidget";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // Render immediately from cached SharedPreferences
        renderWidget(context, appWidgetManager, appWidgetIds);

        // Try to fetch fresh data from Firebase (for cross-device sync)
        FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
        if (user == null) return;

        PendingResult pendingResult = goAsync();

        FirebaseDatabase.getInstance()
                .getReference("users/" + user.getUid() + "/widgetData")
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(@NonNull DataSnapshot snapshot) {
                        try {
                            if (snapshot.exists()) {
                                SharedPreferences.Editor editor =
                                        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();

                                String progress = snapshot.child("progress").getValue(String.class);
                                String status = snapshot.child("status").getValue(String.class);
                                String step = snapshot.child("step").getValue(String.class);
                                String stepType = snapshot.child("stepType").getValue(String.class);
                                String todayReading = snapshot.child("todayReading").getValue(String.class);

                                if (progress != null) editor.putString("progress", progress);
                                if (status != null) editor.putString("status", status);
                                if (step != null) editor.putString("step", step);
                                if (stepType != null) editor.putString("stepType", stepType);
                                if (todayReading != null) editor.putString("todayReading", todayReading);
                                editor.apply();

                                renderWidget(context, appWidgetManager, appWidgetIds);
                            }
                        } finally {
                            pendingResult.finish();
                        }
                    }

                    @Override
                    public void onCancelled(@NonNull DatabaseError error) {
                        pendingResult.finish();
                    }
                });
    }

    static void renderWidget(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
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

            int stepColor;
            switch (stepType) {
                case "ahead":
                    stepColor = Color.parseColor("#88937B");
                    break;
                case "behind":
                    stepColor = Color.parseColor("#A46447");
                    break;
                default:
                    stepColor = Color.parseColor("#6B5A45");
                    break;
            }
            views.setInt(R.id.widget_step, "setTextColor", stepColor);

            views.setTextViewText(R.id.widget_today, todayReading);

            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
