# Puesta en marcha para nuevos clones

1. Asegúrate de tener tu copia local sincronizada con el remoto:  
   git pull origin main

2. Activa tu entorno virtual:  
   # Windows  
   env\Scripts\activate  
   # macOS/Linux  
   source env/bin/activate

3. Instala las dependencias:  
   pip install -r requirements.txt

4. Configura tus variables de entorno:  
   - Duplica el archivo y renómbralo a `.env`:  
     ```bash
     cp .env.example .env
     ```  
   - Abre `.env` y reemplaza cada placeholder por tus datos locales:  
     - `PG_SUPERUSER_PASS` → contraseña del usuario `postgres`  
     - `DATABASE_URL` → formato `postgres://TU_USUARIO:TUPASSWORD@HOST:PUERTO/TU_BASE`  
     - `SECRET_KEY` → tu propia clave secreta de Django  
     - `DEBUG=True` (o `False` si prefieres)

5. Sincroniza la contraseña de tu usuario en Postgres**:  
   Ejecuta:
   ```bash
   python manage.py reset_pg_password

6. Aplica las migraciones y levanta el servidor:
   python manage.py migrate
   python manage.py runserver

7. Abre tu navegador en:
   http://127.0.0.1:8000/