// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
//    id("org.jlleitschuh.gradle.ktlint") version "12.1.2"
    id("org.jetbrains.dokka") version "2.0.0"
    id("app.cash.sqldelight") version "2.0.2" apply false
    alias(libs.plugins.compose.compiler) apply false


}
