# Guía Completa de Distribución y Ejecución en Teléfonos Android: "Ruta de Recuperación"

Esta guía explica detalladamente cómo ejecutar y compartir la aplicación **"Ruta de Recuperación"** con familiares, pacientes y evaluadores en cualquier teléfono Android.

---

## 🚀 Opción 1: Probar Inmediatamente en tu Teléfono (Misma Red Wi-Fi)

Si tu computadora y tu teléfono Android están conectados a la misma red Wi-Fi:

1. El servidor ya está activo en tu computadora en el puerto `8080`.
2. Tu dirección IP local en la red Wi-Fi es: `192.168.0.138`.
3. Abre **Google Chrome** en tu teléfono Android y escribe en la barra de direcciones:
   ```
   http://192.168.0.138:8080/index.html
   ```
4. En Chrome para Android, presiona el menú de los 3 puntos (`⋮`) en la esquina superior derecha y selecciona:
   👉 **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.
5. ¡Listo! Se creará el icono de la aplicación en el menú de tu teléfono y funcionará a pantalla completa como una app nativa.

---

## 🌐 Opción 2: Compartir con Otras Personas por Internet mediante 1 Enlace (PWA Oficial - Recomendado)

Esta es la forma más rápida, segura y profesional de compartir la app con personas que están en cualquier parte del mundo **sin obligarlas a instalar archivos extraños**.

### ¿Cómo funciona?
La aplicación ya cuenta con `manifest.json`, `sw.js` (Service Worker para funcionar sin internet), iconos adaptativos de 192px y 512px y diseño táctil móvil. Al alojarla en un servidor con HTTPS gratuito (obligatorio por Google para PWAs y OAuth):

1. **Alojamiento Gratuito con 1 Comando en Vercel o Netlify:**
   * Abre una terminal en la carpeta del proyecto y ejecuta:
     ```powershell
     npx -y vercel
     ```
   * O con Netlify:
     ```powershell
     npx -y netlify-cli deploy --prod --dir=.
     ```
   * O subiéndola a un repositorio en **GitHub Pages** o **Firebase Hosting**.

2. **Cómo lo prueba la otra persona:**
   * Le envías el enlace generado (ej. `https://ruta-de-recuperacion.vercel.app`) por **WhatsApp**, Telegram o Correo.
   * La persona toca el enlace desde su Android en Chrome.
   * En la parte inferior de la pantalla aparecerá un banner automático: **"Añadir Ruta de Recuperación a la pantalla principal"** (o en el menú `⋮` &rarr; *"Instalar aplicación"*).
   * Al pulsar **Instalar**:
     - Se instala en la memoria de su teléfono.
     - Aparece el icono en el menú de aplicaciones de Android.
     - Se abre sin barra de navegador (experiencia nativa a pantalla completa).
     - Funciona 100% Offline (sin conexión a internet).

---

## 📦 Opción 3: Generar y Enviar un Archivo APK (.apk)

Si deseas entregarles directamente un archivo instalador `.apk` para que lo instalen mediante WhatsApp, Google Drive o cable USB:

### Requisitos en tu PC:
- Node.js instalado (ya lo tienes).
- [Android Studio](https://developer.android.com/studio) instalado (con Android SDK y Command Line Tools).

### Pasos para compilar el APK con Capacitor:
1. Instalar las dependencias de Capacitor en la carpeta del proyecto:
   ```powershell
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
2. Inicializar y crear la carpeta nativa de Android:
   ```powershell
   npx cap add android
   npx cap sync android
   ```
3. Abrir el proyecto en Android Studio:
   ```powershell
   npx cap open android
   ```
4. En Android Studio:
   * Ve al menú superior: **Build** &rarr; **Build Bundle(s) / APK(s)** &rarr; **Build APK(s)**.
   * Al terminar, Android Studio te mostrará un aviso: *"APK(s) generated successfully"* con un botón **locate**.
   * El archivo generado se llamará `app-debug.apk` (ubicado en `android/app/build/outputs/apk/debug/app-debug.apk`).

### Cómo lo instala la otra persona:
1. Le envías el archivo `app-debug.apk` por WhatsApp o Google Drive.
2. La persona toca el archivo `.apk` en su teléfono Android.
3. Si su teléfono lo solicita, activa *"Permitir instalar aplicaciones de fuentes desconocidas / desde WhatsApp o Chrome"*.
4. Presiona **Instalar** y la app quedará registrada en su sistema Android.

---

## 📋 Resumen Comparativo de Opciones

| Característica | Opción 1: Wi-Fi Local | Opción 2: PWA en la Nube (Recomendada) | Opción 3: Archivo APK (.apk) |
| :--- | :--- | :--- | :--- |
| **Tiempo de configuración** | Inmediato (Ya activo) | 2 minutos | 10-15 minutos (Requiere Android Studio) |
| **Forma de compartir** | Mismo Wi-Fi local | Enlace por WhatsApp/Correo | Enviar archivo .apk por WhatsApp/Drive |
| **Requiere tiendas o permisos de riesgo** | No | No (Instalación segura con 1 clic) | Sí (Requiere permitir 'fuentes desconocidas') |
| **Actualizaciones automáticas** | En tiempo real | Instantáneas (Al recargar la web) | Hay que enviar un nuevo .apk cada vez |
| **Funcionamiento sin internet** | Sí | Sí (Service Worker Offline-First) | Sí (Código nativo) |
| **Icono en la pantalla de inicio** | Sí | Sí | Sí |
