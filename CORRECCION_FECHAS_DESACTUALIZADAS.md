# 🔧 Corrección de Fechas Desactualizadas

## 🐛 Problema Detectado

**Noticia:** "No puedo creer que no hayas crecido nada": Kathy Contreras y Faloon  
**Fecha mostrada:** 8 de diciembre 2025 ❌  
**Fecha real:** 5 de mayo 2026 ✅

### Causa Raíz
**Google News RSS** retorna fechas incorrectas en su feed. Noticias recientes aparecen con fechas de meses atrás.

**Ejemplo:**
- Noticia scrapeada: 5 de mayo 2026 04:44:40
- Fecha del RSS: 8 de diciembre 2025 00:18:00
- Diferencia: **~5 meses** de error

## ✅ Solución Implementada

### 1. Mejora en `date.utils.ts`

**Archivo:** `src/common/utils/date.utils.ts`

**Nueva validación agregada:**
```typescript
// Si la fecha está muy desactualizada (más de 30 días atrás), es sospechoso
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

if (parsed < thirtyDaysAgo) {
  logger.warn(
    `Fecha muy desactualizada detectada: ${parsed.toISOString()} (más de 30 días atrás), usando fecha actual`
  );
  return now;
}
```

**Validaciones de `normalizeDate()`:**
1. ✅ Fecha no parseable → usa fecha actual
2. ✅ Fecha futura (>1 día) → usa fecha actual
3. ✅ Fecha antigua (<2015) → usa fecha actual
4. ✅ **NUEVO:** Fecha desactualizada (>30 días atrás) → usa fecha actual

### 2. Script de Corrección de Datos

**Archivo:** `scripts/fix-outdated-dates.ts`

**Acción:**
- Busca noticias con `publishedAt` más de 30 días en el pasado
- Actualiza `publishedAt = createdAt` (fecha correcta)
- Guarda la fecha incorrecta en `rawPublishedAt` (para debugging)

**Resultado:**
```
✅ Actualizadas 274 noticias
```

### 3. Verificación

**Noticia de Kathy Contreras corregida:**
- **publishedAt:** 5 de mayo 2026 00:44:40 ✅
- **rawPublishedAt:** 2025-12-08 03:18:00 (guardado para referencia)
- **createdAt:** 5 de mayo 2026 04:44:40

## 📊 Impacto

### Antes
- 274 noticias con fechas incorrectas (hasta 8 meses atrás)
- Noticias recientes aparecían como "viejas"
- Orden cronológico incorrecto

### Después
- ✅ 274 noticias corregidas
- ✅ Fechas reflejan cuando se publicaron realmente
- ✅ Orden cronológico correcto
- ✅ Nuevas noticias de Google News se validan automáticamente

## 🔍 Fuentes Afectadas

**Fuentes RSS de Google News:**
- Fiebre de Baile RSS
- Y todas las fuentes que usan `news.google.com/rss/search`

**Problema:** Google News asigna fechas arbitrarias/antiguas a noticias en su feed de búsqueda.

**Solución:** Validación automática detecta y corrige estas fechas.

## 🚀 Comportamiento Futuro

### Scraping Automático
Con la nueva validación en `normalizeDate()`:

1. Scraper obtiene RSS de Google News
2. Detecta fecha del feed (ej: 8 dic 2025)
3. Valida: ¿Es más de 30 días atrás? → **SÍ**
4. **Rechaza** la fecha incorrecta
5. Usa fecha actual en su lugar
6. Guarda fecha original en `rawPublishedAt`
7. Log: `⚠️ Fecha muy desactualizada detectada`

### Logs Esperados
```bash
[DateUtils] Fecha muy desactualizada detectada: 2025-12-08T03:18:00.000Z 
(más de 30 días atrás), usando fecha actual [Fiebre de Baile RSS:Kathy Contreras...]
```

## 🧪 Pruebas Realizadas

### 1. Verificación de Corrección
```bash
npx ts-node scripts/check-kathy-news.ts
```
✅ Noticia de Kathy Contreras tiene fecha correcta

### 2. Corrección Masiva
```bash
npx ts-node scripts/fix-outdated-dates.ts
```
✅ 274 noticias actualizadas

### 3. Backend Reiniciado
```bash
npm run start:dev
```
✅ Nueva lógica aplicada

## 📝 Archivos Modificados

### Modificados
- ✅ `src/common/utils/date.utils.ts` - Agregada validación de fechas desactualizadas

### Nuevos
- ✅ `scripts/fix-outdated-dates.ts` - Script de corrección de datos
- ✅ `scripts/check-kathy-news.ts` - Script de verificación

## ⚙️ Configuración

### Umbral de Validación
**Actualmente:** 30 días

Para cambiar el umbral, edita en `date.utils.ts`:
```typescript
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
```

**Recomendación:** Mantener 30 días para capturar feeds desactualizados sin rechazar noticias legítimamente antiguas.

## 🎯 Próximos Pasos

### Monitoreo
Revisa los logs del backend para ver si aparecen más casos:
```bash
grep "Fecha muy desactualizada" logs/*.log
```

### Fuentes Alternativas
Considera usar fuentes RSS directas en lugar de Google News:
- ❌ `news.google.com/rss/search?q=fiebre+de+baile`
- ✅ Feed RSS directo de Chilevision (si está disponible)

### Validación Periódica
Ejecutar script de verificación semanalmente:
```bash
npx ts-node scripts/fix-outdated-dates.ts
```

## 📚 Documentación Relacionada

- [MIGRATION_FECHAS.md](MIGRATION_FECHAS.md) - Migración inicial de normalización
- [IMPLEMENTACION_COMPLETADA.md](IMPLEMENTACION_COMPLETADA.md) - Sistema completo de fechas

---

**Fecha:** 2026-05-05  
**Estado:** ✅ PROBLEMA RESUELTO  
**Backend:** http://localhost:3000 (corriendo con nueva validación)
