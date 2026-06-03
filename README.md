# Presupuesto Mensual

> Gestor de presupuesto mensual personal — controla tu sueldo, tus gastos y a dónde va cada euro.

🔗 **[Abrir la app →](https://presupuesto-mensual-zeta.vercel.app/)**

---

## ¿Qué hace esta app?

Te permite gestionar tu presupuesto mes a mes de forma visual y sencilla:

1. **Introduces tu sueldo neto** del mes
2. **Registras tus gastos** clasificados por categoría (Comida, Préstamos, Moto, y las que añadas)
3. **Ves de un vistazo** cuánto has gastado, cuánto te queda y a dónde ha ido cada euro — con gráficos

---

## Cómo usarla

### 1. Configurar el mes
Al entrar, seleccionas el mes y año e introduces tu **sueldo neto mensual**. Esto define el punto de partida del presupuesto.

### 2. Gestionar categorías
Vienen 4 categorías por defecto:
- 🛒 **Comida** — supermercado, delivery, quiosco
- 💳 **Préstamos** — cuotas, deudas, tarjeta
- 🏍️ **Moto** — gasolina, seguro, revisión, recambios
- 📦 **Otros** — todo lo que no entra en las anteriores

Puedes crear nuevas, editarlas o eliminarlas (siempre que no tengan gastos asociados).

### 3. Registrar gastos
En la pantalla de gastos introduces cada gasto con:
- Descripción (ej: "Mercadona", "Cuota moto")
- Importe
- Categoría

### 4. Ver el resumen
El panel principal te muestra:
- **Total gastado** frente al **sueldo neto**
- **Dinero restante** del mes
- **Desglose por categoría** con importes y porcentajes
- **Gráfico de tarta** — distribución del gasto
- **Gráfico de barras** — comparativa entre meses (a partir del segundo mes registrado)

### 5. Navegar entre meses
Puedes moverte entre meses anteriores para revisar el historial y comparar cómo ha evolucionado tu gasto.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| UI | React 19 + TypeScript |
| Estilos | Tailwind CSS v4 |
| Estado | Zustand v5 (persiste en localStorage) |
| Gráficos | Recharts |
| Routing | React Router v7 |
| Build | Vite 6 |
| Tests | Vitest + Testing Library + Playwright |
| Deploy | Vercel |

---

## Desarrollo local

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # unit + integración
pnpm test:e2e   # end-to-end (Playwright)
pnpm build      # build de producción
```

---

## Datos y privacidad

Todo se guarda en el **localStorage del navegador** — no hay backend, no hay cuentas, los datos no salen de tu dispositivo.

Los datos persisten entre sesiones (mientras no limpies la caché del navegador), pero son locales: no se sincronizan entre distintos dispositivos ni navegadores.

---

## Roadmap

- [x] Gestión de categorías
- [x] Configuración del período mensual
- [ ] Registro de gastos
- [ ] Panel de resumen mensual
- [ ] Gráficos (tarta + barras)
- [ ] Navegación entre meses / historial
- [ ] Pulido visual y responsive
- [ ] **Autenticación de usuarios con cifrado** — sincronización entre dispositivos *(planificado para el futuro)*
