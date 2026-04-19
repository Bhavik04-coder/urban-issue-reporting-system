Set-Location "$PSScriptRoot\civic_eye_app"
flutter run -d chrome --web-browser-flag --disable-web-security --web-header Cross-Origin-Opener-Policy=same-origin --web-header Cross-Origin-Embedder-Policy=require-corp
