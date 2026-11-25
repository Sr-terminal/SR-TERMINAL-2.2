# SR Terminal — APK Build System (no Gradle)

Ye folder **SR Terminal ka signed APK banaane ka poora system** hai — bina Android Studio,
Gradle ya Maven ke. Aapka web build (`android/app/src/main/assets/public/`) ek native
Android shell (WebView) ke andar chalta hai, bilkul Capacitor jaisa — `https://localhost`
origin se serve hota hai, isliye localStorage, CSP, Binance WebSocket sab waise hi kaam
karte hain jaise original Capacitor build mein.

## APK kaise banayein

```bash
bash apk-build/build.sh
```

Output: `apk-build/dist/SR-Terminal-v<version>.apk`

## Toolchain (ek baar setup karna hai)

`build.sh` ko ye 5 files chahiye (default: `/tmp/tools/final/`, `TOOLS=` se override karein):

| File | Kahan se milega |
|---|---|
| `aapt2` | npm: `aaptjs3` → `bin/x64/linux/aapt2` |
| `android.jar` | npm: `@drxiaozhi/minapk` → `tools/android.jar` |
| `ecj.jar` | npm: `@drxiaozhi/minapk` → `tools/ecj-3.45.0.jar` |
| `d8.jar` | npm: `@drxiaozhi/minapk` → `tools/d8.jar` |
| `apksigner.jar` | npm: `@drxiaozhi/minapk` → `tools/apksigner.jar` |

Java runtime (JRE + keytool): PyPI: `pip install jdk4py==21.0.8.2`
(default: `/tmp/tools/jdk4py/jdk4py/java-runtime/`, `JAVA_HOME_DIR=` se override)

Ek command mein toolchain:

```bash
mkdir -p /tmp/tools/final /tmp/dl
cd /tmp/dl
curl -O https://registry.npmjs.org/aaptjs3/-/aaptjs3-2.0.2.tgz
curl -O https://registry.npmjs.org/@drxiaozhi/minapk/-/minapk-0.3.0.tgz
pip download jdk4py==21.0.8.2 --no-deps -d .
tar xzf aaptjs3-2.0.2.tgz; tar xzf minapk-0.3.0.tgz
unzip -o jdk4py-*.whl -d jdk4py
cp package/bin/x64/linux/aapt2 /tmp/tools/final/ && chmod +x /tmp/tools/final/aapt2
cp package/tools/{android.jar,d8.jar,apksigner.jar,ecj-3.45.0.jar} /tmp/tools/final/
mv /tmp/tools/final/ecj-3.45.0.jar /tmp/tools/final/ecj.jar
# java: /tmp/dl/jdk4py/jdk4py/java-runtime
```

## Build steps (kya hota hai)

1. Web assets stage hote hain (`android/app/src/main/assets` → APK `assets/`)
2. Resources: splash PNGs, launcher icons (adaptive + PNG), strings/colors/styles
3. `aapt2 compile` + `aapt2 link` — manifest, `resources.arsc`, R.java
4. `MainActivity.java` ECJ se compile hota hai (`-source 1.8`, `android.jar` ke against)
5. D8 dex banata hai (`classes.dex`, min-api 23)
6. Python zipalign (`zipalign.py`) — `resources.arsc` uncompressed + 4-byte aligned
7. Release keystore (pehli baar auto-generate hota hai)
8. `apksigner` — v1 + v2 + v3 signing

## Signing / Keystore — ZAROORI BAAT

- Keystore: `apk-build/sr-terminal-release.keystore`
- **Password: `srterminal`**, **alias: `srterminal`** (PKCS12, RSA-2048, SHA256withRSA, 10000 din valid)
- Ye keystore **git mein commit NAHI hota** (.gitignore mein hai) — ise **sambhal ke rakhein**
  (backup lein). Aage kabhi naya version banayein to **isi keystore se sign karna**,
  warna purana app update nahi hoga (uninstall karke reinstall karna padega).
- Naya keystore chahiye ho: `apk-build/sr-terminal-release.keystore` delete karke
  `build.sh` dobara chalayein.

## Phone mein install kaise karein

1. `SR-Terminal-v2.8.9.13.apk` phone mein copy/bhejein
2. File manager se tap karein → "Install from unknown sources" allow karein
3. Install → open → **SR Terminal** ready (min Android 6.0 / API 23)

## App version badalne par

- `package.json` → `"version"` (versionName)
- `android/app/build.gradle` → `versionCode`
- Web code badla to pehle `npm run build` + `npx cap sync android` karke
  `android/app/src/main/assets/public/` update karein, phir `build.sh` chalayein.
