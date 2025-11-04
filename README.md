# Guía de Despliegue CI/CD Automatizado a AWS S3

Este documento detalla el proceso completo de **Integración Continua y Despliegue Continuo (CI/CD)** para una aplicación web estática, utilizando **GitHub Actions** para automatizar la prueba, documentación y despliegue a **AWS S3** (simulando un entorno de AWS Academy Lab).

---

## I. Visión General del Proceso y Entorno

El *pipeline* automatiza el flujo de trabajo:  
**Código (Rama `dev`) → Pruebas (CI) → Despliegue (CD) → Producción (S3)**

### 1. Estructura de Directorios

.
├── .github/
│ └── workflows/
│ └── deploy.yml <-- Flujo CI/CD (Automatización)
├── out/ <-- Documentación JSDoc (Generada)
├── index.html <-- Interfaz de Usuario
├── script.js <-- Lógica Core y Frontend
├── script.test.js <-- Pruebas Unitarias (Jest)
└── package.json <-- Configuración de Scripts y Dependencias



### 2. Configuración Inicial

El proyecto requiere las siguientes dependencias de desarrollo y scripts:

```json
"scripts": {
  "test": "npx jest",
  "docs": "jsdoc script.js -d out -r"
}

```
### 3. Configuración Crítica de Seguridad y AWS
#### 3.1. GitHub Secrets (AWS Academy)
La autenticación requiere cinco Secrets en el repositorio de GitHub.
Es vital mantener el AWS_SESSION_TOKEN actualizado debido a la caducidad de las credenciales temporales del Lab.

Secret	Propósito
AWS_ACCESS_KEY_ID	Clave de acceso temporal.
AWS_SECRET_ACCESS_KEY	Clave secreta temporal.
AWS_SESSION_TOKEN	Token de sesión (CRÍTICO para entornos Lab).
AWS_REGION	Región del Bucket.
S3_BUCKET_NAME	Nombre del Bucket.

#### 3.2. Configuración Requerida de Bucket S3
El bucket debe estar configurado para funcionar como un servidor web estático:

Alojamiento Web Estático: Habilitado.

Documento de Índice: Configurado exactamente como index.html (solución al error NoSuchKey).

Permisos: Política de Bucket debe permitir lectura pública (s3:GetObject).

### 4. Código del Workflow (.github/workflows/deploy.yml)
Este workflow incluye las correcciones necesarias para solventar fallos comunes de CI/CD en entornos Linux/AWS modernos (Permisos y ACLs).

```yaml
Copiar código
name: CI/CD Despliegue Estático S3

on:
  push:
    branches:
      - main
      - dev
      - 'feature/**'

jobs:
   #1. CI (Integración Continua): Pruebas y Documentación
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del código
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Instalar dependencias (Jest, JSDoc)
        run: npm install

      - name: Dar permisos de ejecución a los binarios
       
        run: |
          chmod +x ./node_modules/.bin/jest
          chmod +x ./node_modules/.bin/jsdoc

      - name: Ejecutar Pruebas Unitarias
        run: ./node_modules/.bin/jest

      - name: Generar Documentación
        run: ./node_modules/.bin/jsdoc script.js -d out -r

      - name: Subir Documentación como Artefacto
        uses: actions/upload-artifact@v4
        with:
          name: documentacion-jsdoc
          path: out/

  # 2. CD (Despliegue Continuo): Despliegue a S3
  deploy:
    needs: ci
    if: github.ref == 'refs/heads/dev' || github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del código
        uses: actions/checkout@v4

      - name: Configurar Credenciales de AWS (Con Token de Sesión)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-session-token: ${{ secrets.AWS_SESSION_TOKEN }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Desplegar a S3 (Sincronización)
        run: |
          echo "Iniciando despliegue a s3://${{ secrets.S3_BUCKET_NAME }}"
          # Se elimina --acl public-read (Solución al error AccessControlListNotSupported)
          aws s3 sync . s3://${{ secrets.S3_BUCKET_NAME }} \
            --delete \
            --exclude ".git/*" \
            --exclude ".github/*" \
            --exclude "node_modules/*" \
            --exclude "out/*" \
            --exclude "*.test.js" \
            --exclude "package.json" \
            --exclude "package-lock.json"
          echo "Despliegue finalizado."

```
### 5. Activación y Enlace Final
El pipeline se activa con el push a la rama de desarrollo:


git add .
git commit -m "chore(final): Despliegue CI/CD completado"
git push origin dev

#### URL bucket S3 con el sitio web desplegado
http://misitio-daw2-despliegue.s3-website-us-east-1.amazonaws.com/