const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'android-app');

const dirs = [
  'app/src/main/java/com/iplgrowth/app',
  'app/src/main/res/layout',
  'app/src/main/res/values',
  'app/src/main/res/mipmap-xxxhdpi'
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(baseDir, d), { recursive: true });
});

const files = {
  'build.gradle': `
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:8.1.1"
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
  `,
  'settings.gradle': `
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "IPL Growth"
include ':app'
  `,
  'gradle.properties': `
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
  `,
  'app/build.gradle': `
plugins {
    id 'com.android.application'
}

android {
    namespace 'com.iplgrowth.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.iplgrowth.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
}
  `,
  'app/src/main/AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.iplgrowth.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.IPLGrowth"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".SplashActivity"
            android:exported="true"
            android:theme="@style/Theme.IPLGrowth.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <activity
            android:name=".MainActivity"
            android:exported="false"
            android:theme="@style/Theme.IPLGrowth.NoActionBar">
        </activity>
        
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
  `,
  'app/src/main/res/xml/file_paths.xml': `<?xml version="1.0" encoding="utf-8"?>
<paths>
    <external-path name="my_images" path="Android/data/com.iplgrowth.app/files/Pictures" />
    <external-path name="my_movies" path="Android/data/com.iplgrowth.app/files/Movies" />
</paths>
  `,
  'app/src/main/res/values/strings.xml': `
<resources>
    <string name="app_name">IPL Growth</string>
</resources>
  `,
  'app/src/main/res/values/colors.xml': `
<resources>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="primary">#d97706</color>
</resources>
  `,
  'app/src/main/res/values/themes.xml': `
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.IPLGrowth" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryVariant">@color/primary</item>
        <item name="colorOnPrimary">@color/white</item>
    </style>
    <style name="Theme.IPLGrowth.NoActionBar" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="android:statusBarColor">@color/white</item>
        <item name="android:windowLightStatusBar">true</item>
    </style>
</resources>
  `,
  'app/src/main/res/layout/activity_splash.xml': `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#FFFFFF">

    <ImageView
        android:id="@+id/logo"
        android:layout_width="150dp"
        android:layout_height="150dp"
        android:layout_centerInParent="true"
        android:src="@mipmap/ic_launcher"
        android:scaleType="fitCenter" />
        
    <ProgressBar
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_below="@id/logo"
        android:layout_centerHorizontal="true"
        android:layout_marginTop="30dp"
        android:indeterminateTint="@color/primary"/>
</RelativeLayout>
  `,
  'app/src/main/res/layout/activity_main.xml': `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#FFFFFF">

    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefresh"
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

    <LinearLayout
        android:id="@+id/noInternetLayout"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:gravity="center"
        android:visibility="gone"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="No Internet Connection"
            android:textSize="18sp"
            android:textColor="#333333"
            android:textStyle="bold"
            android:layout_marginBottom="16dp"/>

        <Button
            android:id="@+id/btnRetry"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Retry"
            android:backgroundTint="@color/primary"
            android:textColor="#FFFFFF"/>
    </LinearLayout>

</androidx.constraintlayout.widget.ConstraintLayout>
  `,
  'app/src/main/java/com/iplgrowth/app/SplashActivity.java': `package com.iplgrowth.app;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        new Handler().postDelayed(() -> {
            startActivity(new Intent(SplashActivity.this, MainActivity.class));
            finish();
        }, 2000);
    }
}
  `,
  'app/src/main/java/com/iplgrowth/app/MainActivity.java': `package com.iplgrowth.app;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout noInternetLayout;
    private Button btnRetry;
    private final String URL = "https://iplgrowth.online";
    
    private ValueCallback<Uri[]> mUploadMessage;
    private final static int FILECHOOSER_RESULTCODE = 1;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        noInternetLayout = findViewById(R.id.noInternetLayout);
        btnRetry = findViewById(R.id.btnRetry);

        setupWebView();

        btnRetry.setOnClickListener(v -> loadWebsite());

        swipeRefresh.setOnRefreshListener(() -> {
            if (isNetworkAvailable()) {
                webView.reload();
            } else {
                swipeRefresh.setRefreshing(false);
                showNoInternet();
            }
        });

        loadWebsite();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setDatabaseEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    if (url.contains("iplgrowth.online")) {
                        return false; 
                    } else {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    }
                } else if (url.startsWith("whatsapp://") || url.startsWith("tel:") || url.startsWith("mailto:")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                if (!swipeRefresh.isRefreshing()) {
                    swipeRefresh.setRefreshing(true);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefresh.setRefreshing(false);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mUploadMessage != null) {
                    mUploadMessage.onReceiveValue(null);
                    mUploadMessage = null;
                }
                mUploadMessage = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    mUploadMessage = null;
                    return false;
                }
                return true;
            }
        });
    }

    private void loadWebsite() {
        if (isNetworkAvailable()) {
            webView.setVisibility(WebView.VISIBLE);
            noInternetLayout.setVisibility(WebView.GONE);
            webView.loadUrl(URL);
        } else {
            showNoInternet();
        }
    }

    private void showNoInternet() {
        webView.setVisibility(WebView.GONE);
        noInternetLayout.setVisibility(WebView.VISIBLE);
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (mUploadMessage == null) return;
            Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, intent);
            mUploadMessage.onReceiveValue(result);
            mUploadMessage = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
  `
};

fs.mkdirSync(path.join(baseDir, 'app/src/main/res/xml'), { recursive: true });

Object.keys(files).forEach(file => {
  fs.writeFileSync(path.join(baseDir, file), files[file].trim());
});

// Copy logo to mipmap
const logoPath = path.join(__dirname, 'public', 'logo.jpg');
const mipmapPath = path.join(baseDir, 'app/src/main/res/mipmap-xxxhdpi', 'ic_launcher.jpg'); // Normally should be png, but for simplicity
try {
   fs.copyFileSync(logoPath, mipmapPath);
} catch (e) {
   console.log("Could not copy logo");
}

console.log("Android project generated successfully.");
