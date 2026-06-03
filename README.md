# Presupuesto Mensual

> Personal monthly budget manager — track your salary, expenses, and where every peso goes.

🔗 **[Abrir la app →](https://presupuesto-mensual-zeta.vercel.app/)** *(disponible tras el primer deploy)*

---

## ¿Qué hace esta app?

Te permite gestionar tu presupuesto mes a mes de forma visual y simple:

1. **Ingresás tu sueldo neto** del mes
2. **Cargás tus gastos** clasificados por categoría (Comida, Préstamos, Moto, y las que agregues)
3. **Ves en un vistazo** cuánto gastaste, cuánto te queda, y a dónde fue cada peso — con gráficos

---

## Cómo usarla

### 1. Configurar el mes
Al entrar, seleccionás el mes y año y cargás tu **sueldo neto mensual**. Esto define el punto de partida del presupuesto.

### 2. Gestionar categorías
Vienen 4 categorías por defecto:
- 🛒 **Comida** — supermercado, delivery, kiosco
- 💳 **Préstamos** — cuotas, deudas, tarjeta
- 🏍️ **Moto** — nafta, seguro, service, repuestos
- 📦 **Otros** — todo lo que no entra en las anteriores

Podés crear nuevas, editarlas o eliminarlas (siempre que no tengan gastos asociados).

### 3. Cargar gastos
En la pantalla de gastos cargás cada egreso con:
- Descripción (ej: "Super Día", "Cuota moto")
- Monto
- Categoría

### 4. Ver el resumen
El dashboard te muestra:
- **Total gastado** vs **sueldo neto**
- **Dinero restante** del mes
- **Desglose por categoría** con montos y porcentajes
- **Gráfico de torta** — distribución del gasto
- **Gráfico de barras** — comparativa entre meses (a partir del segundo mes cargado)

### 5. Navegar entre meses
Podés moverte entre meses anteriores para revisar el historial y comparar cómo evolucionó tu gasto.

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
pnpm test       # unit + integration
pnpm test:e2e   # end-to-end (Playwright)
pnpm build      # build de producción
```

---

## Datos

Todo se guarda en **localStorage del navegador** — no hay backend, no hay cuentas, no salen de tu dispositivo.
