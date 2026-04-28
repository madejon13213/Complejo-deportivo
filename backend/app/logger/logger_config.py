import logging
import os
import sys
from logging.handlers import RotatingFileHandler


def setup_app_logging():
    # 1. Crear la carpeta de logs si no existe
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # 2. Configurar el nombre del logger
    logger = logging.getLogger("pmo_logger")
    logger.setLevel(logging.INFO)

    # 3. Definir el formato de los mensajes
    # Incluye: Fecha | Nivel | Nombre del archivo | Mensaje
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | [%(filename)s:%(lineno)d] | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # 4. Configurar el RotatingFileHandler
    # - "logs/app.log": Nombre del archivo
    # - maxBytes: 5MB (5 * 1024 * 1024) por archivo
    # - backupCount: Guardará hasta 5 archivos antiguos (app.log.1, app.log.2, etc.)
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, "pmo.log"),
        maxBytes=5 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)

    # 5. Handler para ver los logs en la consola mientras programas
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # 6. Evitar duplicados si se importa en varios sitios
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger


# Exportamos la instancia única
logger = setup_app_logging()