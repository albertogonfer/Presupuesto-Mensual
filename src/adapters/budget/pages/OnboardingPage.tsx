import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePeriodsStore } from '../store/periodsStore'
import { useCategoriesStore } from '../store/categoriesStore'
import { useProfileStore } from '../store/profileStore'
import { PeriodForm } from '../components/PeriodForm'
import { Button } from '../../shared/components/Button'
import { CATEGORY_ICON_OPTIONS } from '../components/categoryIcons'
import { CategoryIcon } from '../components/CategoryIcon'
import { Input } from '../../shared/components/Input'

import { PRESET_COLORS } from '../components/CategoryForm'

const STEP_COUNT = 3

export default function OnboardingPage() {
  const navigate = useNavigate()
  const createPeriod = usePeriodsStore((s) => s.createPeriod)
  const categories = useCategoriesStore((s) => s.categories)
  const addCategory = useCategoriesStore((s) => s.addCategory)
  const removeCategory = useCategoriesStore((s) => s.removeCategory)
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding)

  const [step, setStep] = useState(1)

  // Step 3 inline form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('package')
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0])

  async function handleSkip() {
    await completeOnboarding()
    navigate('/')
  }

  function handlePeriodSubmit(values: {
    month: number
    year: number
    netSalary: number
    savingsGoal?: number
  }) {
    createPeriod(values)
    setStep(3)
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    addCategory({ name: newCatName.trim(), icon: newCatIcon, color: newCatColor })
    setNewCatName('')
    setNewCatIcon('package')
    setNewCatColor(PRESET_COLORS[0])
    setShowAddForm(false)
  }

  async function handleFinish() {
    await completeOnboarding()
    navigate('/')
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-card bg-bg-card p-8 shadow-card">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Paso {step} de {STEP_COUNT}
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: STEP_COUNT }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    i + 1 <= step ? 'bg-accent' : 'bg-bg-input'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step 1 — Bienvenida */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">
                Bienvenido a Presupuesto Mensual
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Vamos a configurar tu primer mes en 3 pasos.
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                'Configura tu sueldo neto',
                'Revisa tus categorías',
                'Listo para empezar',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="text-accent">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col items-start gap-3">
              <Button onClick={() => setStep(2)}>Empezar</Button>
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-text-secondary underline underline-offset-2 hover:text-text-primary"
              >
                Saltar configuración
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Período */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">
                ¿Cuánto cobras al mes?
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Introduce tu sueldo neto para calcular tu presupuesto mensual.
              </p>
            </div>
            <PeriodForm
              onSubmit={handlePeriodSubmit}
              onCancel={() => setStep(1)}
            />
          </div>
        )}

        {/* Step 3 — Categorías */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">
                Estas son tus categorías por defecto
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Puedes añadir o eliminar categorías ahora, o hacerlo más adelante.
              </p>
            </div>

            <ul className="flex flex-col gap-2">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between rounded-md bg-bg-input px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: cat.color }}><CategoryIcon icon={cat.icon} className="h-4 w-4" /></span>
                    <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden="true"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat.id, [])}
                    className="text-xs text-danger hover:underline"
                    aria-label={`Eliminar ${cat.name}`}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>

            {showAddForm ? (
              <form onSubmit={handleAddCategory} className="flex flex-col gap-3 rounded-md bg-bg-input p-4">
                <Input
                  id="onboarding-cat-name"
                  label="Nombre"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej: Transporte"
                  required
                />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-text-secondary">Ícono</span>
                  <div role="radiogroup" aria-label="Ícono" className="grid grid-cols-8 gap-1.5">
                    {CATEGORY_ICON_OPTIONS.map(({ name: iconName, label, Icon }) => (
                      <button
                        key={iconName}
                        type="button"
                        role="radio"
                        aria-checked={newCatIcon === iconName}
                        aria-label={label}
                        title={label}
                        onClick={() => setNewCatIcon(iconName)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                          newCatIcon === iconName
                            ? 'border-accent bg-accent/15 text-accent-hover shadow-[0_0_12px_rgba(99,102,241,0.45)]'
                            : 'border-border bg-bg-card text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Icon aria-hidden className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-text-secondary">Color</span>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Color ${c}`}
                        onClick={() => setNewCatColor(c)}
                        className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          outline: c === newCatColor ? '2px solid white' : 'none',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Añadir</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="self-start text-sm font-medium text-accent hover:underline"
              >
                + Añadir categoría
              </button>
            )}

            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button onClick={handleFinish}>
                ¡Todo listo, ir al dashboard →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
