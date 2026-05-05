# Control de visitas - GitHub Pages y Vercel

Proyecto web estático usando Leaflet + OpenStreetMap. No necesita API key.

## Archivos principales

- `index.html`
- `app.js`
- `styles.css`
- `data.json`

## Cómo usar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube estos 4 archivos a la raíz del repositorio.
3. En GitHub entra a **Settings > Pages**.
4. En **Build and deployment**, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guarda y abre la URL que GitHub te dará.

## Cómo usar en Vercel

1. Sube estos archivos a un repositorio de GitHub.
2. Entra a Vercel.
3. Importa el repositorio.
4. Framework Preset: `Other`
5. Build Command: vacío
6. Output Directory: vacío o `.`
7. Deploy.

## Importante para ubicación actual

La detección de ubicación requiere HTTPS. Funciona bien en:

- GitHub Pages
- Vercel

No funciona bien si abres `index.html` directamente como archivo local `file://`.

## Cómo editar puntos

Edita `data.json`.

Ejemplo:

```json
{
  "id": 1,
  "nombre": "AGROSOLTEC S.R.LTDA",
  "cc": "RUC:20369117433",
  "departamento": "Cajamarca",
  "direccion": "JR. LOS GLADIOLOS NRO. 150 - CAJAMARCA",
  "estado": "sin_visitar",
  "lat": -7.1518405,
  "lng": -78.5153059,
  "texto": "Pendiente de visita"
}
```

Si no tienes coordenadas, deja:

```json
"lat": null,
"lng": null
```

Ese punto aparecerá en la lista, pero no en el mapa hasta que agregues coordenadas.

## Estado

Usa:

- `sin_visitar`
- `visitada`

## Validación

`data.json` fue validado correctamente.

- Registros: 464
- Con coordenadas: 385
- Sin coordenadas: 79
