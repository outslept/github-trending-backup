import { useEffect, useRef } from 'react'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar
} from '../components/ui/sidebar'
import type { LanguageGroup } from '../lib/types'
import { languageIcons } from '../lib/language-icons'
import { slugify } from '../lib/slug'

interface TableOfContentsProps {
  groups: LanguageGroup[]
  activeId: string | null
}

export function TableOfContents({ groups, activeId }: TableOfContentsProps) {
  const { setOpenMobile } = useSidebar()
  const activeRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (activeId && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeId])

  if (groups.length === 0) {
    return (
      <div className="px-2 py-1 text-xs text-muted-foreground">
        No languages found
      </div>
    )
  }

  return (
    <SidebarMenu>
      {groups.map((group) => {
        const languageId = slugify(group.language)
        const iconSrc = languageIcons[group.language.toLowerCase()]
        const isActive = activeId === languageId

        return (
          <SidebarMenuItem key={languageId} ref={isActive ? activeRef : undefined}>
            <SidebarMenuButton
              render={<a href={`#${languageId}`} onClick={() => setOpenMobile(false)} />}
              tooltip={group.language}
              isActive={isActive}
              className="text-muted-foreground hover:text-foreground"
            >
              {iconSrc && (
                <img src={iconSrc} alt="" width={16} height={16} className="size-4" />
              )}
              <span>{group.language}</span>
            </SidebarMenuButton>
            <SidebarMenuBadge className="text-muted-foreground">
              {group.repos.length}
            </SidebarMenuBadge>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
