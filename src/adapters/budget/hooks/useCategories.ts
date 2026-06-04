import { useCategoriesStore } from '../store/categoriesStore'

export function useCategories() {
  const categories = useCategoriesStore((s) => s.categories)
  const loading = useCategoriesStore((s) => s.loading)
  const error = useCategoriesStore((s) => s.error)
  const fetchAll = useCategoriesStore((s) => s.fetchAll)
  const addCategory = useCategoriesStore((s) => s.addCategory)
  const updateCategory = useCategoriesStore((s) => s.updateCategory)
  const removeCategory = useCategoriesStore((s) => s.removeCategory)

  return { categories, loading, error, fetchAll, addCategory, updateCategory, removeCategory }
}
