import { useCategoriesStore } from '../store/categoriesStore'

export function useCategories() {
  const categories = useCategoriesStore((s) => s.categories)
  const addCategory = useCategoriesStore((s) => s.addCategory)
  const updateCategory = useCategoriesStore((s) => s.updateCategory)
  const removeCategory = useCategoriesStore((s) => s.removeCategory)

  return { categories, addCategory, updateCategory, removeCategory }
}
