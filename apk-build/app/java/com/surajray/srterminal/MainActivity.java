package com.surajray.srterminal;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.util.Log;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Lightweight native shell for the SR Terminal web app (built with AI Studio).
 *
 * Serves the pre-built web bundle (assets/public) from the https://localhost
 * origin — exactly how a Capacitor build serves it — so localStorage,
 * service-worker-less fetches and CSP all behave the same as the original
 * Capacitor 8 packaging. The app's own Capacitor JS runtime detects that no
 * native bridge is present and falls back to web mode, which this app is
 * written to handle (see NativeAppShell.tsx / deviceControl.ts).
 */
public class MainActivity extends Activity {

    private static final String LOCAL_HOST = "localhost";
    private static final String START_URL = "https://localhost/";
    private static final int BG_COLOR = 0xFF050505;
    private static final String CHANNEL_ID = "sr-trade-alerts-v2";
    private static final String CHANNEL_NAME = "SR Terminal High Priority Alerts";

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTheme(R.style.AppTheme);

        initNotificationChannel();

        if (Build.VERSION.SDK_INT >= 33) {
            if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 1001);
            }
        }

        // Prompt user to disable Battery Optimization so Android OS never kills the background ICT scanner
        promptIgnoreBatteryOptimizations();

        Window window = getWindow();
        window.setStatusBarColor(BG_COLOR);
        window.setNavigationBarColor(BG_COLOR);

        webView = new WebView(this);
        webView.setBackgroundColor(BG_COLOR);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setSupportMultipleWindows(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebViewClient(new LocalWebViewClient());
        webView.setWebChromeClient(new AppChromeClient());
        webView.addJavascriptInterface(new AndroidNotificationBridge(), "AndroidBridge");

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(webView, true);

        setContentView(webView);

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(START_URL);
        }

        // Start 24/7 background notification service for real-time market trade signals
        try {
            SRBackgroundNotificationService.startService(this);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @SuppressLint("BatteryLife")
    private void promptIgnoreBatteryOptimizations() {
        if (Build.VERSION.SDK_INT >= 23) {
            try {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                String pkg = getPackageName();
                if (pm != null && !pm.isIgnoringBatteryOptimizations(pkg)) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + pkg));
                    startActivity(intent);
                }
            } catch (Exception ignored) {}
        }
    }

    public class AndroidNotificationBridge {
        @JavascriptInterface
        public boolean isNative() {
            return true;
        }

        @JavascriptInterface
        public boolean isIgnoringBatteryOptimizations() {
            if (Build.VERSION.SDK_INT >= 23) {
                try {
                    PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                    return pm != null && pm.isIgnoringBatteryOptimizations(getPackageName());
                } catch (Exception e) {
                    return true;
                }
            }
            return true;
        }

        @JavascriptInterface
        public void requestBatteryOptimizationExemption() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    promptIgnoreBatteryOptimizations();
                }
            });
        }

        @JavascriptInterface
        public boolean areNotificationsEnabled() {
            try {
                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm == null) return false;
                if (Build.VERSION.SDK_INT >= 33) {
                    boolean granted = checkSelfPermission("android.permission.POST_NOTIFICATIONS") == PackageManager.PERMISSION_GRANTED;
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
                    if (Build.VERSION.SDK_INT >= 33) {
                        if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                            requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 1001);
                        }
                    }
                    promptIgnoreBatteryOptimizations();
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

    private void initNotificationChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            try {
                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    NotificationChannel existing = nm.getNotificationChannel(CHANNEL_ID);
                    if (existing == null) {
                        NotificationChannel channel = new NotificationChannel(
                                CHANNEL_ID,
                                CHANNEL_NAME,
                                NotificationManager.IMPORTANCE_HIGH
                        );
                        channel.setDescription("SR Terminal Trade & Market Alerts");
                        channel.enableLights(true);
                        channel.enableVibration(true);
                        channel.setShowBadge(true);
                        nm.createNotificationChannel(channel);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
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

            Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= 26) {
                builder = new Notification.Builder(this, CHANNEL_ID);
            } else {
                builder = new Notification.Builder(this);
                builder.setPriority(Notification.PRIORITY_HIGH);
                builder.setDefaults(Notification.DEFAULT_ALL);
            }

            int icon = getApplicationInfo().icon;
            if (icon == 0) {
                icon = android.R.drawable.ic_dialog_info;
            }

            builder.setContentTitle(title != null && !title.isEmpty() ? title : "SR Terminal")
                    .setContentText(body != null ? body : "")
                    .setStyle(new Notification.BigTextStyle().bigText(body != null ? body : ""))
                    .setSmallIcon(icon)
                    .setContentIntent(pendingIntent)
                    .setVisibility(Notification.VISIBILITY_PUBLIC)
                    .setCategory(Notification.CATEGORY_MESSAGE)
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
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ---------------------------------------------------------------------
    // Back button: mirrors the app's own NativeAppShell back handling
    // (journal/terminal/matrix -> More -> Home -> exit). If the DOM is not
    // ready for any reason, fall back to WebView history, then exit.
    // ---------------------------------------------------------------------
    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript(
            "(function(){" +
                "try{" +
                "var r=localStorage.getItem('sr.apk.route')||'home';" +
                "var nav=document.querySelector('nav');" +
                "var b=nav?nav.querySelectorAll('button'):[];" +
                "if(b.length>=5){" +
                "if(r==='home'){return 'exit'}" +
                "b[r==='more'?0:4].click();" +
                "return 'nav'" +
                "}" +
                "}catch(e){}" +
                "return 'exit';" +
            "})()",
            new android.webkit.ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {
                    if (!"\"nav\"".equals(value)) {
                        finish();
                    }
                }
            });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Keep WebView JS timers active so background AI agent tool loops & SSE streams complete while minimized
        if (webView != null) {
            webView.resumeTimers();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    // ---------------------------------------------------------------------
    // Serves the local web bundle from https://localhost and keeps external
    // links (update banner, TradingView, news) out of the shell.
    // ---------------------------------------------------------------------
    private class LocalWebViewClient extends WebViewClient {

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            if (request == null || request.getUrl() == null) return false;
            return handleUrlOverride(request.getUrl());
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (url == null) return false;
            return handleUrlOverride(Uri.parse(url));
        }

        private boolean handleUrlOverride(Uri url) {
            String scheme = url.getScheme() == null ? "" : url.getScheme().toLowerCase(Locale.ROOT);
            if (("https".equals(scheme) || "http".equals(scheme)) && LOCAL_HOST.equalsIgnoreCase(url.getHost())) {
                return false; // internal app navigation
            }
            if ("http".equals(scheme) || "https".equals(scheme) || "mailto".equals(scheme)
                    || "tel".equals(scheme) || "intent".equals(scheme)) {
                openExternally(url);
                return true;
            }
            return false;
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
            // Localhost has self-handled assets — proceed through SSL checks
            handler.proceed();
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request != null && request.isForMainFrame()) {
                Log.e("SRTerminal", "Main frame load error: " + (Build.VERSION.SDK_INT >= 23 ? error.getDescription() : ""));
            }
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            if (request == null || request.getUrl() == null) {
                return null;
            }
            return handleIntercept(request.getUrl());
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            if (url == null) {
                return null;
            }
            return handleIntercept(Uri.parse(url));
        }

        private WebResourceResponse handleIntercept(Uri url) {
            String host = url.getHost();
            if (host == null || !LOCAL_HOST.equalsIgnoreCase(host)) {
                return null; // let network/API/websocket traffic pass
            }

            String path = url.getPath();
            if (path == null || path.isEmpty() || "/".equals(path)) {
                path = "/index.html";
            }
            if (path.startsWith("/api/") || path.startsWith("api/")) {
                return null; // Let API network requests pass through to backend
            }
            while (path.startsWith("/")) {
                path = path.substring(1);
            }
            if (path.contains("..")) {
                return notFound();
            }

            try {
                InputStream in = getAssets().open("public/" + path);
                return createOkResponse(path, in);
            } catch (IOException miss) {
                // SPA fallback: routes without file extension serve index.html
                String name = path.substring(path.lastIndexOf('/') + 1);
                if (!name.contains(".")) {
                    try {
                        InputStream in = getAssets().open("public/index.html");
                        return createOkResponse("index.html", in);
                    } catch (IOException ignored) {}
                }
                return notFound();
            }
        }
    }

    // target=_blank / window.open (e.g. "UPDATE AVAILABLE" banner) -> browser
    private class AppChromeClient extends WebChromeClient {
        @Override
        public boolean onConsoleMessage(ConsoleMessage cm) {
            Log.d("SRTerminalJS", "[" + cm.messageLevel() + "] " + cm.message() + " (" + cm.sourceId() + ":" + cm.lineNumber() + ")");
            return true;
        }

        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture,
                                      android.os.Message resultMsg) {
            final android.os.Message msg = resultMsg;
            WebView probe = new WebView(view.getContext());
            probe.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                    openExternally(request.getUrl());
                    return true;
                }
            });
            WebView.WebViewTransport transport = (WebView.WebViewTransport) msg.obj;
            transport.setWebView(probe);
            msg.sendToTarget();
            return true;
        }
    }

    private void openExternally(Uri url) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, url));
        } catch (Exception ignored) {
            // no handler for this scheme — ignore
        }
    }

    private static WebResourceResponse createOkResponse(String path, InputStream in) {
        String mime = mimeFor(path);
        String encoding = isTextMime(mime) ? "utf-8" : null;
        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
        headers.put("Access-Control-Allow-Headers", "*");
        headers.put("Cache-Control", "no-cache, no-store, must-revalidate");
        return new WebResourceResponse(mime, encoding, 200, "OK", headers, in);
    }

    private static boolean isTextMime(String mime) {
        return "text/html".equals(mime)
                || "text/javascript".equals(mime)
                || "text/css".equals(mime)
                || "application/json".equals(mime)
                || "image/svg+xml".equals(mime)
                || "text/plain".equals(mime);
    }

    private static WebResourceResponse notFound() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", headers,
                new ByteArrayInputStream(new byte[0]));
    }

    private static String mimeFor(String path) {
        String p = path.toLowerCase(Locale.ROOT);
        int dot = p.lastIndexOf('.');
        String ext = dot >= 0 ? p.substring(dot + 1) : "";
        switch (ext) {
            case "html":
            case "htm":
                return "text/html";
            case "js":
            case "mjs":
                return "text/javascript";
            case "css":
                return "text/css";
            case "json":
            case "map":
                return "application/json";
            case "png":
                return "image/png";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "gif":
                return "image/gif";
            case "svg":
                return "image/svg+xml";
            case "webp":
                return "image/webp";
            case "ico":
                return "image/x-icon";
            case "txt":
                return "text/plain";
            case "woff":
                return "font/woff";
            case "woff2":
                return "font/woff2";
            case "ttf":
                return "font/ttf";
            case "otf":
                return "font/otf";
            case "wasm":
                return "application/wasm";
            default:
                return "application/octet-stream";
        }
    }
}
