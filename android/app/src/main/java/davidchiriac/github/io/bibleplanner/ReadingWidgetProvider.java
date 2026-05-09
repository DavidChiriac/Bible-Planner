package davidchiriac.github.io.bibleplanner;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.View;
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

    private static final String KEY_PROGRESS     = "progress";
    private static final String KEY_STATUS       = "status";
    private static final String KEY_STEP         = "step";
    private static final String KEY_STEP_TYPE    = "stepType";
    private static final String KEY_TODAY        = "todayReading";

    private static final String COLOR_AHEAD   = "#88937B";
    private static final String COLOR_BEHIND  = "#A46447";
    private static final String COLOR_DEFAULT = "#6B5A45";

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
                                saveSnapshotToPrefs(context, snapshot);
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

    private static void saveSnapshotToPrefs(Context context, DataSnapshot snapshot) {
        SharedPreferences.Editor editor =
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();

        String progress    = snapshot.child(KEY_PROGRESS).getValue(String.class);
        String status       = snapshot.child(KEY_STATUS).getValue(String.class);
        String step         = snapshot.child(KEY_STEP).getValue(String.class);
        String stepType     = snapshot.child(KEY_STEP_TYPE).getValue(String.class);
        String todayReading = snapshot.child(KEY_TODAY).getValue(String.class);

        if (progress != null)     editor.putString(KEY_PROGRESS, progress);
        if (status != null)       editor.putString(KEY_STATUS, status);
        if (step != null)         editor.putString(KEY_STEP, step);
        if (stepType != null)     editor.putString(KEY_STEP_TYPE, stepType);
        if (todayReading != null) editor.putString(KEY_TODAY, todayReading);
        editor.apply();
    }

    static void renderWidget(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        String progress     = prefs.getString(KEY_PROGRESS, "0");
        String status       = prefs.getString(KEY_STATUS, "Progres citire");
        String step         = prefs.getString(KEY_STEP, "");
        String stepType     = prefs.getString(KEY_STEP_TYPE, "ontrack");
        String todayReading = prefs.getString(KEY_TODAY, "Deschide aplica\u021bia");

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_reading);

            // Hide progress when no plan is configured (status is empty)
            if (status.isEmpty()) {
                views.setTextViewText(R.id.widget_progress, "");
                views.setViewVisibility(R.id.widget_progress, View.GONE);
                views.setViewVisibility(R.id.widget_status, View.GONE);
                views.setViewVisibility(R.id.widget_step, View.GONE);
            } else {
                views.setTextViewText(R.id.widget_progress, progress + "%");
                views.setViewVisibility(R.id.widget_progress, View.VISIBLE);
                views.setTextViewText(R.id.widget_status, status);
                views.setViewVisibility(R.id.widget_status, View.VISIBLE);
                views.setTextViewText(R.id.widget_step, step);
                views.setViewVisibility(R.id.widget_step, step.isEmpty() ? View.GONE : View.VISIBLE);
            }

            int stepColor;
            switch (stepType) {
                case "ahead":
                    stepColor = Color.parseColor(COLOR_AHEAD);
                    break;
                case "behind":
                    stepColor = Color.parseColor(COLOR_BEHIND);
                    break;
                default:
                    stepColor = Color.parseColor(COLOR_DEFAULT);
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
