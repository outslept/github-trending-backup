import { useEffect, useRef, useState } from 'react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar,
} from '../components/ui/sidebar';
import { useFluidHover } from '../hooks/use-fluid-hover';
import type { LanguageGroup } from '../lib/types';
import { languageIcons } from '../lib/language-icons';
import { slugify } from '../lib/utils';

interface TableOfContentsProps {
  groups: LanguageGroup[];
  activeId: string | null;
}

function getLanguageMonogram(language: string): string {
  const clean = language.trim();
  if (!clean || clean.toLowerCase() === 'unknown') return '??';
  if (clean.length <= 2) return clean;
  return clean.slice(0, 2);
}

function LanguageIconSlot({ language }: { language: string }) {
  const [imgError, setImgError] = useState(false);
  const iconSrc = languageIcons[language.toLowerCase()];

  if (iconSrc && !imgError) {
    return (
      <img
        src={iconSrc}
        alt=""
        width={16}
        height={16}
        onError={() => setImgError(true)}
        className="size-4 shrink-0 object-contain"
      />
    );
  }

  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-muted font-mono text-[9px] font-semibold uppercase leading-none text-muted-foreground ring-1 ring-inset ring-border/60">
      {getLanguageMonogram(language)}
    </span>
  );
}

export function TableOfContents({ groups, activeId }: TableOfContentsProps) {
  const { setOpenMobile } = useSidebar();
  const activeRef = useRef<HTMLLIElement>(null);

  const { indicatorRef, onItemPointerEnter, onContainerPointerLeave, hideIndicator } =
    useFluidHover<HTMLLIElement>();

  useEffect(() => {
    if (activeId && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeId]);

  useEffect(() => {
    hideIndicator();
  }, [groups, hideIndicator]);

  if (groups.length === 0) {
    return (
      <div className="px-2 py-6 text-center text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        No matching languages
      </div>
    );
  }

  return (
    <SidebarMenu onPointerLeave={onContainerPointerLeave} className="relative">
      <div
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden rounded-md opacity-0 will-change-[transform,height,opacity] bg-sidebar-accent/80 dark:bg-sidebar-accent/60 group-data-[collapsible=icon]:inset-x-0.5 [@media(hover:hover)_and_(pointer:fine)]:block"
      />

      {groups.map((group) => {
        const languageId = slugify(group.language);
        const isActive = activeId === languageId;

        return (
          <SidebarMenuItem
            key={languageId}
            ref={isActive ? activeRef : undefined}
            onPointerEnter={onItemPointerEnter}
            className="z-10"
          >
            <SidebarMenuButton
              render={<a href={`#${languageId}`} onClick={() => setOpenMobile(false)} />}
              tooltip={`${group.language} (${group.repos.length})`}
              isActive={isActive}
              className="text-muted-foreground hover:bg-transparent hover:text-foreground data-active:bg-sidebar-accent/90"
            >
              <LanguageIconSlot language={group.language} />
              <span>{group.language}</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>{group.repos.length}</SidebarMenuBadge>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
