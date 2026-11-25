package com.surajray.srterminal;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 24/7 Foreground & Background Notification Service for SR Terminal.
 * Runs as an Android ForegroundService (dataSync) with bounded WakeLock acquisition
 * so Android OS never kills the background signal & AI agent monitor when minimized.
 */
public class SRBackgroundNotificationService extends Service {

    private static final String TAG = "SR_BG_Service";
    public static final String ALERT_CHANNEL_ID = "sr-trade-alerts-v2";
    private static final String FOREGROUND_CHANNEL_ID = "sr-foreground-monitor";
    private static final int FOREGROUND_SERVICE_ID = 9901;
    private static final String PREFS_NAME = "sr_bg_notifications";
    private static final String PROCESSED_EVENTS_KEY = "processed_events";
    private static final String BACKEND_API = "https://ais-dev-72tc6y7p7dv2upr3ewjnp6-257338808391.asia-east1.run.app/api/signals/recent";
    private static final AtomicInteger NOTIF_SEQ = new AtomicInteger(100);

    private ScheduledExecutorService scheduler;
    private PowerManager.WakeLock wakeLock;

    public static void startService(Context context) {
        try {
            Intent intent = new Intent(context, SRBackgroundNotificationService.class);
            if (Build.VERSION.SDK_INT >= 26) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to start foreground service: " + e.getMessage());
            try {
                context.startService(new Intent(context, SRBackgroundNotificationService.class));
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
        promoteToForeground();

        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SRTerminal::SignalMonitorWakeLock");
                wakeLock.setReferenceCounted(false);
            }
        } catch (Exception ignored) {}

        startBackgroundMonitor();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannels();
        promoteToForeground();
        startBackgroundMonitor();
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void promoteToForeground() {
        try {
            Notification fgNotification = buildForegroundNotification();
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(
                        FOREGROUND_SERVICE_ID,
                        fgNotification,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
                );
            } else {
                startForeground(FOREGROUND_SERVICE_ID, fgNotification);
            }
        } catch (Exception e) {
            Log.w(TAG, "promoteToForeground notice: " + e.getMessage());
        }
    }

    private Notification buildForegroundNotification() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 1, intent, flags);

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= 26) {
            builder = new Notification.Builder(this, FOREGROUND_CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
            builder.setPriority(Notification.PRIORITY_LOW);
        }

        int icon = getApplicationInfo().icon;
        if (icon == 0) {
            icon = android.R.drawable.ic_dialog_info;
        }

        return builder
                .setContentTitle("SR Terminal — Institutional Engine Active")
                .setContentText("Monitoring live ICT liquidity setups & AI agent tasks in background")
                .setSmallIcon(icon)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            // 1. High-Importance Channel for Heads-Up Trade & AI Agent Alerts
            NotificationChannel alertChannel = new NotificationChannel(
                    ALERT_CHANNEL_ID,
                    "SR Terminal High Priority Alerts",
                    NotificationManager.IMPORTANCE_HIGH
            );
            alertChannel.setDescription("Real-time ICT trade entries, target hits, and AI agent completion alerts");
            alertChannel.enableLights(true);
            alertChannel.enableVibration(true);
            alertChannel.setVibrationPattern(new long[]{0, 220, 100, 320});
            alertChannel.setShowBadge(true);

            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
            alertChannel.setSound(soundUri, audioAttributes);
            alertChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(alertChannel);

            // 2. Low-Importance Channel for persistent Foreground Service status
            NotificationChannel fgChannel = new NotificationChannel(
                    FOREGROUND_CHANNEL_ID,
                    "SR Terminal Background Engine",
                    NotificationManager.IMPORTANCE_LOW
            );
            fgChannel.setDescription("Keeps SR Terminal connected to live institutional market feeds when minimized");
            fgChannel.setShowBadge(false);
            nm.createNotificationChannel(fgChannel);
        }
    }

    private void startBackgroundMonitor() {
        if (scheduler != null && !scheduler.isShutdown()) return;

        scheduler = Executors.newScheduledThreadPool(2);
        // 1. Poll every 15 seconds for new ICT APEX-PULSE background signals and AI agent completions
        scheduler.scheduleWithFixedDelay(new Runnable() {
            @Override
            public void run() {
                try {
                    if (wakeLock != null && !wakeLock.isHeld()) {
                        wakeLock.acquire(15000L);
                    }
                    pollMarketSignals();
                } catch (Throwable t) {
                    Log.d(TAG, "Poll error: " + t.getMessage());
                } finally {
                    try {
                        if (wakeLock != null && wakeLock.isHeld()) {
                            wakeLock.release();
                        }
                    } catch (Exception ignored) {}
                }
            }
        }, 3, 15, TimeUnit.SECONDS);

        // 2. MODULE 5: 30-Second Keep-Alive Heartbeat so Android OS never suspends the socket/scanner
        scheduler.scheduleWithFixedDelay(new Runnable() {
            @Override
            public void run() {
                try {
                    promoteToForeground();
                    pollMarketSignals();
                } catch (Throwable ignored) {}
            }
        }, 30, 30, TimeUnit.SECONDS);
    }

    private void pollMarketSignals() {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(BACKEND_API + "?_t=" + System.currentTimeMillis());
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setUseCaches(false);
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Cache-Control", "no-cache, no-store, must-revalidate");

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                reader.close();

                JSONObject json = new JSONObject(sb.toString());
                if (json.optBoolean("success", false)) {
                    JSONArray events = json.optJSONArray("events");
                    if (events != null && events.length() > 0) {
                        processEvents(events);
                    }
                }
            }
        } catch (Exception e) {
            // Quiet network fallback
        } finally {
            if (conn != null) {
                try { conn.disconnect(); } catch (Exception ignored) {}
            }
        }
    }

    private void processEvents(JSONArray events) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        Set<String> processed = prefs.getStringSet(PROCESSED_EVENTS_KEY, new HashSet<String>());
        Set<String> updated = new HashSet<>(processed);

        for (int i = 0; i < events.length(); i++) {
            try {
                JSONObject evt = events.getJSONObject(i);
                String eventId = evt.optString("eventId");
                if (eventId == null || eventId.isEmpty() || processed.contains(eventId)) {
                    continue; // Skip already notified events (Deduplication)
                }

                String title = evt.optString("title", "⚡ [ICT APEX-PULSE] TRADE ALERT");
                String body = evt.optString("body", "Trade Alert");

                showNotification(title, body);
                updated.add(eventId);

                // Keep processed set bounded
                if (updated.size() > 500) {
                    updated.clear();
                    updated.add(eventId);
                }
            } catch (Exception ignored) {}
        }

        prefs.edit().putStringSet(PROCESSED_EVENTS_KEY, updated).apply();
    }

    public static int nextUniqueNotificationId() {
        int seq = NOTIF_SEQ.incrementAndGet() % 1000;
        int timePart = (int) ((System.currentTimeMillis() / 1000L) & 0x001FFFFF);
        return (timePart * 1000) + seq;
    }

    @SuppressWarnings("deprecation")
    private void wakeUpLockScreen() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && !pm.isInteractive()) {
                PowerManager.WakeLock screenLock = pm.newWakeLock(
                        PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                        "SRTerminal::ApexPulseScreenWakeLock"
                );
                screenLock.acquire(5000L);
            }
        } catch (Exception ignored) {}
    }

    private void showNotification(String title, String body) {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            createNotificationChannels();
            wakeUpLockScreen();

            int notifId = nextUniqueNotificationId();

            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= 23) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    this,
                    notifId,
                    intent,
                    flags
            );

            Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= 26) {
                builder = new Notification.Builder(this, ALERT_CHANNEL_ID);
            } else {
                builder = new Notification.Builder(this);
                builder.setPriority(Notification.PRIORITY_HIGH);
                builder.setDefaults(Notification.DEFAULT_ALL);
            }

            int icon = getApplicationInfo().icon;
            if (icon == 0) {
                icon = android.R.drawable.ic_dialog_info;
            }

            builder.setContentTitle(title)
                    .setContentText(body)
                    .setStyle(new Notification.BigTextStyle().bigText(body))
                    .setSmallIcon(icon)
                    .setContentIntent(pendingIntent)
                    .setFullScreenIntent(pendingIntent, true)
                    .setVisibility(Notification.VISIBILITY_PUBLIC)
                    .setCategory(Notification.CATEGORY_MESSAGE)
                    .setAutoCancel(true);

            nm.notify(notifId, builder.build());

            // Haptic feedback
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= 26) {
                        v.vibrate(VibrationEffect.createOneShot(250, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(250);
                    }
                }
            } catch (Exception ignored) {}

        } catch (Exception e) {
            Log.e(TAG, "Error showing background notification: " + e.getMessage());
        }
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        // Restart service if user swipes task away so 24/7 alerts stay alive
        startService(getApplicationContext());
    }

    @Override
    public void onDestroy() {
        if (scheduler != null) {
            scheduler.shutdownNow();
            scheduler = null;
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            try { wakeLock.release(); } catch (Exception ignored) {}
        }
        super.onDestroy();
    }
}
