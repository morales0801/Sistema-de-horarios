# ShiftFlow | Sistema de Gestión de Horarios y Control de Asistencia Remoto

Un sistema web y de escritorio integral para la planificación de turnos y control de asistencia en tiempo real, tanto para colaboradores en oficina como para **trabajadores remotos (Home Office / Teletrabajo)**.

---

## 🌍 Cómo Conectar con Colaboradores Remotos (Fuera de la Oficina)

Si tus colaboradores están en sus casas o en otras ciudades/países, tienes dos opciones:

### Opción A: Enlace Seguro por Internet con 1 Clic (Gratis, Sin Registro)
1. En tu computadora, haz doble clic en:
   📁 **`CONECTAR-INTERNET-REMOTOS.bat`**
2. Se generará un enlace público seguro `https://...` a través de la red global de Cloudflare.
3. Copia el enlace que dice **"ENLACE PARA TU COLABORADOR REMOTO"** y envíaselo por WhatsApp, Slack o Correo:
   ```text
   https://[tunombre].trycloudflare.com/?mode=kiosk
   ```
4. El colaborador remoto abre ese enlace en su computadora desde su casa, selecciona su nombre y presiona **"MARCAR ENTRADA"**.
5. La marcación se guarda inmediatamente en tu computadora principal y la verás en vivo en tu panel de administración.

*(También se guarda automáticamente en el archivo `ENLACE-PARA-COLABORADORES.txt` para copiar y pegar fácilmente).*

---

### Opción B: Montar el Sistema 24/7 en la Nube
Si prefieres que el sistema funcione las 24 horas del día aunque apagues tu computadora:
- El proyecto está 100% listo para desplegarse en plataformas en la nube como **Render.com**, **Railway.app** o un servidor VPS.
- Solo requiere subir el código y ejecutar `npm start`.

---

## 🖥️ Archivos Ejecutables Disponibles

En la carpeta principal `C:\Users\User\Downloads\Prueba`:

- **`INICIAR-SISTEMA.bat`**: Inicia el servidor y abre el panel administrativo local.
- **`Iniciar-App-Colaborador.bat`**: Abre la pantalla de marcación como una aplicación de escritorio limpia en la computadora actual.
- **`CONECTAR-INTERNET-REMOTOS.bat`**: Conecta tu sistema a Internet para que empleados remotos puedan marcar desde cualquier lugar.
