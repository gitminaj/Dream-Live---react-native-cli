# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native Vector Icons
-keep class com.facebook.react.views.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.horcrux.svg.** { *; }


-keep class com.oblador.vectoricons.** { *; }
-keep interface com.oblador.vectoricons.** { *; }
-keep public class * extends com.facebook.react.uimanager.ViewManager
-keep public class * extends com.facebook.react.bridge.NativeModule