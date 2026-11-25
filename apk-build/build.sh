#!/usr/bin/env bash
#
# SR Terminal — no-Gradle APK builder
# -----------------------------------
# Builds a signed release APK from the web bundle committed in
# android/app/src/main/assets (as produced by `npm run build` / `cap sync`)
# without needing the Android SDK, Gradle, or Maven access.
#
# Toolchain layout expected in $TOOLS (override with TOOLS=...):
#   aapt2          — Android resource compiler/linker (linux x64)
#   android.jar    — compile SDK platform jar (API 33+)
#   ecj.jar        — Eclipse Compiler for Java (javac replacement)
#   d8.jar         — D8 dexer (.class -> classes.dex)
#   apksigner.jar  — APK signer (v1/v2/v3)
#
# The toolchain used for the original build was assembled from npm:
#   aapt2       from npm package "aaptjs3"          (bin/x64/linux/aapt2)
#   android.jar from npm package "@drxiaozhi/minapk" (tools/)
#   ecj.jar     from npm package "@drxiaozhi/minapk"
#   d8.jar      from npm package "@drxiaozhi/minapk"
#   apksigner   from npm package "@drxiaozhi/minapk"
# and a Java runtime from PyPI package "jdk4py" (keytool included).
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HERE="$ROOT/apk-build"

TOOLS="${TOOLS:-/tmp/tools/final}"
JAVA_HOME_DIR="${JAVA_HOME_DIR:-/tmp/tools/jdk4py/jdk4py/java-runtime}"

JAVA="$JAVA_HOME_DIR/bin/java"
KEYTOOL="$JAVA_HOME_DIR/bin/keytool"
AAPT2="$TOOLS/aapt2"
ANDROID_JAR="$TOOLS/android.jar"
ECJ="$TOOLS/ecj.jar"
D8="$TOOLS/d8.jar"
APKSIGNER="$TOOLS/apksigner.jar"

for f in "$JAVA" "$KEYTOOL" "$AAPT2" "$ANDROID_JAR" "$ECJ" "$D8" "$APKSIGNER"; do
    [ -e "$f" ] || { echo "missing tool: $f (set TOOLS=/JAVA_HOME_DIR=...)" >&2; exit 1; }
done

VERSION_NAME="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$ROOT/package.json")"
VERSION_CODE="$(grep -o 'versionCode [0-9]*' "$ROOT/android/app/build.gradle" | grep -o '[0-9]*')"
: "${VERSION_NAME:?version not found}"; : "${VERSION_CODE:?versionCode not found}"

STAGE="$HERE/stage"
DIST="$HERE/dist"
rm -rf "$STAGE"
mkdir -p "$STAGE/res" "$STAGE/assets" "$STAGE/gen" "$STAGE/classes" "$STAGE/dex" "$DIST"

APP_RES="$ROOT/android/app/src/main/res"

echo "==> [1/8] Staging web assets (android/app/src/main/assets)"
cp -r "$ROOT/android/app/src/main/assets/." "$STAGE/assets/"
rm -f "$STAGE/assets/public/"*.apk || true

echo "==> [2/8] Staging resources"
for d in "$APP_RES"/drawable "$APP_RES"/drawable-land-* "$APP_RES"/drawable-port-* \
         "$APP_RES"/mipmap-anydpi-v26 "$APP_RES"/mipmap-hdpi "$APP_RES"/mipmap-mdpi \
         "$APP_RES"/mipmap-xhdpi "$APP_RES"/mipmap-xxhdpi; do
    [ -d "$d" ] && cp -r "$d" "$STAGE/res/$(basename "$d")"
done
cp -r "$HERE/app/res/values" "$STAGE/res/values"

echo "==> [3/8] aapt2 compile + link (version $VERSION_NAME / code $VERSION_CODE)"
"$AAPT2" compile --dir "$STAGE/res" -o "$STAGE/res.zip"
"$AAPT2" link \
    -o "$STAGE/base.apk" \
    -I "$ANDROID_JAR" \
    --manifest "$HERE/app/AndroidManifest.xml" \
    -A "$STAGE/assets" \
    --java "$STAGE/gen" \
    --auto-add-overlay \
    "$STAGE/res.zip"

echo "==> [4/8] Compiling Java (ECJ, -source 1.8)"
"$JAVA" -jar "$ECJ" -source 1.8 -target 1.8 -encoding UTF-8 -nowarn \
    -bootclasspath "$ANDROID_JAR" \
    -classpath "$ANDROID_JAR" \
    -d "$STAGE/classes" \
    "$HERE/app/java/com/surajray/srterminal/"*.java \
    "$STAGE/gen/com/surajray/srterminal/R.java"

echo "==> [5/8] Dexing (D8, min-api 23)"
find "$STAGE/classes" -name "*.class" > "$STAGE/classes.list"
mapfile -t CLASSES < "$STAGE/classes.list"
"$JAVA" -cp "$D8" com.android.tools.r8.D8 \
    --release \
    --lib "$ANDROID_JAR" \
    --min-api 23 \
    --output "$STAGE/dex" \
    "${CLASSES[@]}"

echo "==> [6/8] Repacking + zipalign (python)"
python3 "$HERE/zipalign.py" "$STAGE/base.apk" "$STAGE/dex/classes.dex" "$STAGE/unsigned.apk"

KEYSTORE="$HERE/sr-terminal-release.keystore"
if [ ! -f "$KEYSTORE" ]; then
    echo "==> [7/8] Generating release keystore (keep it safe for future updates!)"
    "$KEYTOOL" -genkeypair \
        -keystore "$KEYSTORE" \
        -alias srterminal \
        -keyalg RSA -keysize 2048 -sigalg SHA256withRSA \
        -validity 10000 \
        -storetype PKCS12 \
        -storepass srterminal -keypass srterminal \
        -dname "CN=SR Terminal,O=Suraj Ray,L=Pune,ST=Maharashtra,C=IN"
else
    echo "==> [7/8] Using existing keystore"
fi

OUT="$DIST/SR-Terminal-v${VERSION_NAME}.apk"
echo "==> [8/8] Signing -> $OUT"
"$JAVA" -jar "$APKSIGNER" sign \
    --ks "$KEYSTORE" \
    --ks-key-alias srterminal \
    --ks-pass pass:srterminal \
    --key-pass pass:srterminal \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --v3-signing-enabled true \
    --out "$OUT" \
    "$STAGE/unsigned.apk"

"$JAVA" -jar "$APKSIGNER" verify --print-certs "$OUT"
echo
echo "APK READY: $OUT ($(wc -c < "$OUT") bytes)"
