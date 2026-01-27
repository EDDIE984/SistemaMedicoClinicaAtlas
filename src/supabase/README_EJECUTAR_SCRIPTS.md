# 🔧 Guía para Ejecutar Scripts SQL en Supabase

## 📋 Contexto del Problema

Tu aplicación médica tiene un **trigger automático** en la tabla `cita` llamado `trigger_historial_estado_cita` que intenta insertar registros en `historial_estado_cita` con `id_usuario_cambio = NULL`, lo cual viola la restricción NOT NULL.

### ❌ Error Original
```
null value in column "id_usuario_cambio" violates not-null constraint
```

### ✅ Solución
Deshabilitar el trigger y manejar el historial desde el código TypeScript en `/lib/citasService.ts`

---

## 🚀 Pasos para Ejecutar (EN ORDEN)

### **PASO 1: Diagnóstico Rápido** (Opcional pero recomendado)

**Archivo:** `DIAGNOSTICO_RAPIDO.sql`

**Qué hace:** 
- Muestra el estado actual del trigger
- Verifica la estructura de la tabla
- Muestra estadísticas de los registros

**Cómo ejecutar:**
1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega todo el contenido de `DIAGNOSTICO_RAPIDO.sql`
3. Click en "Run"
4. Revisa los resultados para entender el estado actual

**Resultado esperado:**
- Si ves "❌ HABILITADO" → Continúa al PASO 2
- Si ves "✅ DESHABILITADO" → El fix ya está aplicado ✅

---

### **PASO 2: Ejecutar Fix Completo** (⚠️ IMPORTANTE)

**Archivo:** `EJECUTAR_PASO_A_PASO.sql`

**Qué hace:**
1. Muestra el estado actual del trigger
2. **DESHABILITA el trigger problemático**
3. Verifica que el cambio fue exitoso
4. Muestra el historial reciente
5. Confirma que todo está funcionando

**Cómo ejecutar:**
1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega todo el contenido de `EJECUTAR_PASO_A_PASO.sql`
3. Click en "Run"
4. ⚠️ **IMPORTANTE:** Si ves algún error, detente y revisa el mensaje

**Resultado esperado:**
```
✅✅✅ DESHABILITADO CORRECTAMENTE ✅✅✅
```

---

### **PASO 3: Verificación Final** (Recomendado)

**Archivo:** `VERIFICAR_FIX.sql`

**Qué hace:**
- Verifica que el trigger está deshabilitado
- Muestra los últimos registros del historial
- Confirma que la estructura de la tabla es correcta

**Cómo ejecutar:**
1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega todo el contenido de `VERIFICAR_FIX.sql`
3. Click en "Run"
4. Verifica que todos los resultados son ✅

**Resultado esperado:**
- Trigger: `✅ DESHABILITADO (Correcto)`
- Nuevos registros tienen usuario asignado (no NULL)

---

## 📝 Alternativa: Script Individual

Si prefieres ejecutar solo la línea esencial:

**Archivo:** `DESHABILITAR_TRIGGER_AHORA.sql`

Contiene solo el comando necesario:
```sql
ALTER TABLE cita DISABLE TRIGGER trigger_historial_estado_cita;
```

---

## ✅ Checklist de Verificación

Después de ejecutar los scripts, verifica:

- [ ] El trigger `trigger_historial_estado_cita` está **DESHABILITADO**
- [ ] Puedes marcar citas como completadas sin errores
- [ ] Los nuevos registros en `historial_estado_cita` tienen `id_usuario_cambio` NO NULL
- [ ] La columna se llama `observaciones` (NO `motivo_cambio`)

---

## 🔧 Qué Cambia en Tu Aplicación

### Antes del Fix ❌
- Trigger automático insertaba registros con `id_usuario_cambio = NULL`
- Al marcar citas como completadas → Error

### Después del Fix ✅
- Trigger deshabilitado
- El código TypeScript en `/lib/citasService.ts` maneja el historial manualmente
- Cada registro tiene correctamente el `id_usuario_cambio`

---

## 📂 Archivos SQL Disponibles

| Archivo | Propósito | Orden de Ejecución |
|---------|-----------|-------------------|
| `DIAGNOSTICO_RAPIDO.sql` | Ver estado actual del sistema | 1️⃣ (Opcional) |
| `EJECUTAR_PASO_A_PASO.sql` | **Fix completo con verificaciones** | 2️⃣ ⚠️ PRINCIPAL |
| `VERIFICAR_FIX.sql` | Verificar que todo funciona | 3️⃣ (Recomendado) |
| `DESHABILITAR_TRIGGER_AHORA.sql` | Solo deshabilitar trigger | Alternativa rápida |

---

## ⚠️ Notas Importantes

### El Trigger NO se Elimina
- El trigger se **deshabilita** (no se borra)
- Puedes re-habilitarlo después si es necesario:
  ```sql
  ALTER TABLE cita ENABLE TRIGGER trigger_historial_estado_cita;
  ```

### Para Eliminar Permanentemente (Opcional)
Si decides eliminar el trigger completamente:
```sql
DROP TRIGGER IF EXISTS trigger_historial_estado_cita ON cita;
DROP FUNCTION IF EXISTS registrar_cambio_estado_cita();
```

### Registros Antiguos con NULL
Los registros anteriores pueden tener `id_usuario_cambio = NULL`. Puedes:
- Dejarlos (no afectan el funcionamiento)
- Limpiarlos (ver PASO 6 en `EJECUTAR_PASO_A_PASO.sql`)

---

## 🎯 Próximos Pasos

Después de ejecutar estos scripts:

1. ✅ Prueba marcar una cita como completada en tu aplicación
2. ✅ Verifica que no aparezcan errores en la consola
3. ✅ Revisa que el historial se guarde correctamente
4. ✅ Confirma que el `id_usuario_cambio` se registra

---

## 🆘 Si Algo Sale Mal

### Error: "trigger does not exist"
- El trigger ya fue eliminado antes
- No es un problema, significa que el fix ya estaba aplicado

### Error: "permission denied"
- Necesitas permisos de administrador en Supabase
- Contacta al owner del proyecto

### Sigue habiendo errores al marcar citas
1. Ejecuta `DIAGNOSTICO_RAPIDO.sql` para ver el estado
2. Verifica el código en `/lib/citasService.ts`
3. Revisa la consola del navegador para ver el error exacto

---

## 📞 Resumen Ejecutivo

**Para fix rápido (5 minutos):**
1. Ejecuta `DIAGNOSTICO_RAPIDO.sql` → Ve el problema
2. Ejecuta `EJECUTAR_PASO_A_PASO.sql` → Aplica el fix
3. Ejecuta `VERIFICAR_FIX.sql` → Confirma que funciona
4. ✅ Listo!

**Línea esencial (30 segundos):**
```sql
ALTER TABLE cita DISABLE TRIGGER trigger_historial_estado_cita;
```

---

## 📊 Estado de los Archivos de Código

### Archivos TypeScript Actualizados ✅
- `/lib/citasService.ts` → Usa `observaciones` (correcto)
- Inserta registros con `id_usuario_cambio` correcto
- Maneja el historial de estados manualmente

### Base de Datos ⚠️
- **Pendiente:** Ejecutar scripts SQL en Supabase
- Una vez ejecutados → Sistema 100% funcional

---

**Última actualización:** Script corregido con nombres de columnas correctos de PostgreSQL
