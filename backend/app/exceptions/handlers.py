import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm.exc import StaleDataError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)

async def stale_data_error_handler(request: Request, exc: StaleDataError):
    logger.warning(f"Concurrency conflict (StaleDataError) for {request.url}: {str(exc)}")
    return JSONResponse(
        status_code=409,
        content={
            "detail": "La información ha sido modificada por otro usuario o proceso. Por favor, actualiza y vuelve a intentarlo.",
            "error_code": "CONCURRENCY_CONFLICT"
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # Retrieve 'error_code' if we appended it to a custom HTTPException, else default
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": getattr(exc, "error_code", "HTTP_ERROR")
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error.get("loc", []))
        msg = error.get("msg", "")
        errors.append(f"{field}: {msg}")
    
    detail = "Datos de entrada inválidos. " + " | ".join(errors)
    return JSONResponse(
        status_code=422,
        content={"detail": detail, "error_code": "VALIDATION_ERROR"}
    )

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Ha ocurrido un error inesperado en el servidor.",
            "error_code": "INTERNAL_ERROR"
        }
    )

def setup_exception_handlers(app):
    app.add_exception_handler(StaleDataError, stale_data_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)
