# Guía de Ejecución de Pruebas

## Requisitos Previos

### Backend
```bash
# Python 3.12+
python --version

# Instalar dependencias de prueba
pip install pytest httpx

# Verificar instalación
pytest --version
```

### Frontend
```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# Instalar dependencias (ya incluye Jest)
npm install
```

## Estructura del Proyecto

```
Complejo-deportivo/
├── backend/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_courts.py
│   │   ├── test_all_endpoints.py
│   │   ├── test_reservations_penalties.py
│   │   └── test_integration.py
│   ├── app/
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── __tests__/
│   │   ├── CourtCard.test.tsx
│   │   └── courtsServices.test.ts
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── package.json
│   └── app/
└── docs/
    ├── TEST_REPORT.md
    └── TESTING_DOCUMENTATION.md
```

## Ejecución de Pruebas Backend

### 1. Ir al directorio backend
```bash
cd backend
```

### 2. Ejecutar todas las pruebas
```bash
pytest tests/ -v
```

**Output esperado:**
```
============================= test session starts ==============================
platform win32 -- Python 3.14.4, pytest-9.0.3, pluggy-1.6.0
rootdir: C:\Users\jrmad\Desktop\Complejo-deportivo\backend
collected 45+ items

tests/test_courts.py::test_get_courts PASSED                          [ 2%]
tests/test_courts.py::test_create_court_admin PASSED                  [ 4%]
...
============================= 45+ passed in X.XXs =============================
```

### 3. Ejecutar pruebas específicas

#### Solo pruebas de pistas
```bash
pytest tests/test_courts.py -v
```

#### Solo pruebas de endpoints generales
```bash
pytest tests/test_all_endpoints.py -v
```

#### Solo pruebas de reservas y penalizaciones
```bash
pytest tests/test_reservations_penalties.py -v
```

#### Solo pruebas de integración
```bash
pytest tests/test_integration.py -v
```

### 4. Ejecutar una prueba específica
```bash
pytest tests/test_courts.py::test_get_courts -v
```

### 5. Ver coverage (cobertura de código)
```bash
pytest tests/ --cov=app --cov-report=html
```

Abre `htmlcov/index.html` para ver reporte visual.

### 6. Ejecutar con salida detallada
```bash
pytest tests/ -vv --tb=short
```

### 7. Ejecutar en modo watch (re-ejecuta al cambiar archivos)
```bash
pytest tests/ --watch
```
(Requiere: `pip install pytest-watch`)

## Ejecución de Pruebas Frontend

### 1. Ir al directorio frontend
```bash
cd frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar todas las pruebas
```bash
npm test
```

**Output esperado:**
```
PASS  __tests__/CourtCard.test.tsx
  CourtCard
    ✓ renders court information correctly (XX ms)
    ✓ renders admin buttons when isAdmin is true (XX ms)
    ✓ does not render admin buttons when isAdmin is false (XX ms)
    ✓ calls onEdit when edit button is clicked (XX ms)
    ✓ calls onDelete when delete button is clicked (XX ms)
    ✓ has correct links for view details and reserve (XX ms)

PASS  __tests__/courtsServices.test.ts
  Courts Services
    getCourts
      ✓ fetches courts with correct parameters (XX ms)
    ...

Test Suites: 2 passed, 2 total
Tests:       10 passed, 10 total
```

### 4. Ejecutar pruebas en modo watch
```bash
npm test -- --watch
```

### 5. Ejecutar una prueba específica
```bash
npm test -- CourtCard
```

### 6. Ver coverage
```bash
npm test -- --coverage
```

## Flujo Completo de Pruebas

### Escenario: Prueba end-to-end completa

1. **Inicia Backend**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. **En otra terminal, inicia Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **En otra terminal, ejecuta pruebas de Backend**
   ```bash
   cd backend
   pytest tests/test_integration.py -v
   ```

4. **En otra terminal, ejecuta pruebas de Frontend**
   ```bash
   cd frontend
   npm test
   ```

## Interpretación de Resultados

### Backend

#### Prueba PASSED ✓
```
test_get_courts PASSED [2%]
```
- La prueba ejecutó exitosamente
- Todas las aserciones pasaron

#### Prueba FAILED ✗
```
test_create_court FAILED [4%]
FAILED tests/test_courts.py::test_create_court - AssertionError
```
- Hay un error a investigar
- Ver detalles en el reporte

#### Estadísticas
```
============================= 45 passed in 2.34s =============================
```
- 45 pruebas pasaron
- Tiempo total: 2.34 segundos

### Frontend

#### Tests PASS
```
PASS  __tests__/CourtCard.test.tsx (XXX ms)
```
- Archivo de prueba pasó

#### Tests FAIL
```
FAIL  __tests__/CourtCard.test.tsx
● Test suite failed to compile
```
- Error de compilación o test fallido

## Solución de Problemas

### Backend

**Error: ModuleNotFoundError**
```
pip install -r requirements.txt
```

**Error: Database error**
```
# Las pruebas usan SQLite en memoria, reinicia pytest
pytest tests/ --tb=short
```

**Error: pytest not found**
```
pip install pytest httpx
```

### Frontend

**Error: Cannot find module**
```
npm install
```

**Error: Jest config issue**
```
# Verifica jest.config.js existe
# Ejecuta en modo clean
npm test -- --clearCache
npm test
```

**Error: Module mapping issue**
```
# Actualiza moduleNameMapper en jest.config.js
npm test -- --detectOpenHandles
```

## Configuración de CI/CD (Opcional)

### GitHub Actions - Backend
```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.12'
      - run: pip install -r backend/requirements.txt
      - run: cd backend && pytest tests/ -v
```

### GitHub Actions - Frontend
```yaml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

## Métricas de Cobertura

### Objetivo de cobertura
- **Backend**: >80% de cobertura
- **Frontend**: >75% de cobertura

### Ver cobertura actual
```bash
# Backend
cd backend
pytest tests/ --cov=app --cov-report=term-missing

# Frontend
cd frontend
npm test -- --coverage --watchAll=false
```

## Contacto y Soporte

Si encuentras problemas con las pruebas:
1. Revisa el reporte de errores
2. Verifica que las dependencias estén instaladas
3. Consulta la documentación específica del test