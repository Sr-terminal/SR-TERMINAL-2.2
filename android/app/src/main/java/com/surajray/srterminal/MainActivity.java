package com.surajray.srterminal;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String CHANNEL_ID = "sr-trade-alerts-v2";
    private static final String CHANNEL_NAME = "SR Terminal High Priority Alerts";
    private static final int REQ_POST_NOTIFICATIONS = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        initNotificationChannel();
        requestPostNotificationsIfNeeded();

        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.addJavascriptInterface(new AndroidNotificationBridge(), "AndroidBridge");
        }

        // Start 24/7 ForegroundService for background trade signals & AI agent completion alerts
        SRBackgroundNotificationService.startService(this);
    }

    @Override
    public void onPause() {
        super.onPause();
        // Keep WebView JS timers active so multi-step AI agent tool loops & SSE streams complete in background
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().resumeTimers();
        }
    }

    private void requestPostNotificationsIfNeeded() {
        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        REQ_POST_NOTIFICATIONS
                );
            }
        }
    }

    private void initNotificationChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Real-time ICT trade entries, target hits, and AI agent completion alerts");
                channel.enableLights(true);
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 220, 100, 320});
                channel.setShowBadge(true);

                Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .build();
                channel.setSound(soundUri, audioAttributes);
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(channel);
            }
        }
    }

    private void showNativeNotification(String title, String body) {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            initNotificationChannel();

            int notifId = SRBackgroundNotificationService.nextUniqueNotificationId();

            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= 23) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(this, notifId, intent, flags);

            int icon = getApplicationInfo().icon;
            if (icon == 0) {
                icon = android.R.drawable.ic_dialog_info;
            }

            NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setSmallIcon(icon)
                    .setContentTitle(title != null && !title.isEmpty() ? title : "SR Terminal")
                    .setContentText(body != null ? body : "")
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(body != null ? body : ""))
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setDefaults(NotificationCompat.DEFAULT_ALL)
                    .setContentIntent(pendingIntent)
                    .setAutoCancel(true);

            nm.notify(notifId, builder.build());

            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= 26) {
                        v.vibrate(VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(200);
                    }
                }
            } catch (Exception ignored) {}
        } catch (Exception ignored) {}
    }

    public class AndroidNotificationBridge {
        @JavascriptInterface
        public boolean isNative() {
            return true;
        }

        @JavascriptInterface
        public boolean areNotificationsEnabled() {
            try {
                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm == null) return false;
                if (Build.VERSION.SDK_INT >= 33) {
                    boolean granted = ContextCompat.checkSelfPermission(
                            MainActivity.this,
                            Manifest.permission.POST_NOTIFICATIONS
                    ) == PackageManager.PERMISSION_GRANTED;
                    return granted && nm.areNotificationsEnabled();
                } else if (Build.VERSION.SDK_INT >= 24) {
                    return nm.areNotificationsEnabled();
                }
                return true;
            } catch (Exception e) {
                return true;
            }
        }

        @JavascriptInterface
        public void requestPermission() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    requestPostNotificationsIfNeeded();
                }
            });
        }

        @JavascriptInterface
        public void postNotification(final String title, final String body) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    showNativeNotification(title, body);
                }
            });
        }
    }
}
