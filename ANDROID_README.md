# 📱 Guide de Génération de l'APK Android (OZI Webtoons)

Votre projet est désormais entièrement configuré avec **Capacitor Android** natif.

## 📦 Informations du Package Android
- **Nom de l'application** : `OZI Webtoons`
- **ID de l'application (Package Name)** : `com.ozi.webtoon`
- **Plateforme cible** : Android 14+ (Compatible Android 7.0+)
- **Dossier Natif** : `/android` (Projet Android Studio officiel avec Gradle)

---

## 🚀 Comment générer l'APK / publier sur le Play Store :

### Option A : Avec Android Studio (Recommandé)
1. Téléchargez ou clonez le projet sur votre machine.
2. Exécutez :
   ```bash
   npm install
   npm run build:android
   ```
3. Ouvrez le dossier `/android` dans **Android Studio**.
4. Dans le menu Android Studio :
   - Cliquez sur **Build > Build Bundle(s) / APK(s) > Build APK(s)** pour obtenir le fichier `.apk` installable directement sur n'importe quel téléphone.
   - Ou cliquez sur **Generate Signed Bundle / APK** pour créer le fichier `.aab` de publication sur le **Google Play Store**.

---

### Option B : En ligne de commande avec Gradle
Depuis la racine du projet :
```bash
# Compiler l'APK de Debug directement :
cd android && ./gradlew assembleDebug
```
L'APK généré sera disponible dans :
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## ⚡ Fonctionnalités Natives Incluses :
- **Bouton Retour Physique Android** : gère intelligemment la fermeture des chapitres et le retour à l'accueil sans quitter l'app brutalement.
- **Status Bar Sombre & Immersive** : couleur assortie au thème sombre `#07080C`.
- **Splash Screen de démarrage OZI**.
- **Support des paiements Wave / Mobile Money / Cartes**.
