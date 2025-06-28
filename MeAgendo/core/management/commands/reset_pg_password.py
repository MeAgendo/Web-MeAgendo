# core/management/commands/reset_pg_password.py

from django.core.management.base import BaseCommand
import psycopg
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

class Command(BaseCommand):
    help = "Sincroniza el hash SCRAM-SHA-256 de tu rol según el DATABASE_URL"

    def handle(self, *args, **options):
        # 1) Cargo .env
        load_dotenv()

        # 2) Leo credenciales
        super_pw = os.getenv("PG_SUPERUSER_PASS")
        db_url   = os.getenv("DATABASE_URL")
        if not super_pw or not db_url:
            self.stderr.write("❌ Falta PG_SUPERUSER_PASS o DATABASE_URL en .env")
            return

        # 3) Extraigo usuario y password del DATABASE_URL
        parts = urlparse(db_url)
        db_user = parts.username
        db_pass = parts.password

        # 4) Conecto como superuser
        conn = psycopg.connect(
            dbname="postgres",
            user="postgres",
            password=super_pw,
            host="127.0.0.1",
        )
        conn.autocommit = True

        # 5) Ejectuto ALTER ROLE con el literal de la contraseña
        sql = f"ALTER ROLE {db_user} WITH PASSWORD '{db_pass}';"
        with conn.cursor() as cur:
            cur.execute(sql)

        conn.close()
        self.stdout.write(self.style.SUCCESS(
            f"✅ Rol `{db_user}` ahora está con SCRAM-SHA-256 y password sincronizada"
        ))
