import { useEffect, useState } from 'react'

export function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    // Проверка на наличие window для SSR совместимости (хоть тут и CSR)
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      // Создаем "зону триггера" в верхней четверти экрана
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el) observer.unobserve(el)
      })
    }
  }, [ids.join(',')]) // Перезапускаем наблюдатель, если список языков изменился (например, при поиске)

  return activeId
}
