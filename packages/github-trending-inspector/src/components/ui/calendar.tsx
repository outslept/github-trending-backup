'use client';

import * as React from 'react';
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from 'react-day-picker';

import { cn } from '../../lib/utils';
import { Button, buttonVariants } from './button';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react';

function CalendarMonthGrid({
  className,
  children,
  ...props
}: React.ComponentProps<'table'>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const indicatorRef = React.useRef<HTMLDivElement>(null);
  const isInsideRef = React.useRef(false);
  const activeBtnRef = React.useRef<HTMLButtonElement | null>(null);

  const hideIndicator = React.useCallback(() => {
    isInsideRef.current = false;
    activeBtnRef.current = null;
    const indicator = indicatorRef.current;
    if (indicator) {
      indicator.style.transition = 'opacity 140ms var(--ease-out)';
      indicator.style.opacity = '0';
    }
  }, []);

  const handlePointerOver = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse') return;

      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
        'button[data-day]:not(:disabled)',
      );

      if (!btn) {
        if (isInsideRef.current) hideIndicator();
        return;
      }

      if (btn === activeBtnRef.current) return;
      activeBtnRef.current = btn;

      const container = containerRef.current;
      const indicator = indicatorRef.current;
      if (!container || !indicator) return;

      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();

      const x = btnRect.left - containerRect.left;
      const y = btnRect.top - containerRect.top;
      const w = btnRect.width;
      const h = btnRect.height;

      if (!isInsideRef.current) {
        indicator.style.transition = 'opacity 140ms var(--ease-out)';
        indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        indicator.style.width = `${w}px`;
        indicator.style.height = `${h}px`;
        void indicator.offsetHeight;
        indicator.style.opacity = '1';
        isInsideRef.current = true;
      } else {
        indicator.style.transition =
          'transform 160ms var(--ease-out), width 160ms var(--ease-out), height 160ms var(--ease-out), opacity 140ms var(--ease-out)';
        indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        indicator.style.width = `${w}px`;
        indicator.style.height = `${h}px`;
        indicator.style.opacity = '1';
      }
    },
    [hideIndicator],
  );

  const handlePointerLeave = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse') return;
      hideIndicator();
    },
    [hideIndicator],
  );

  return (
    <div
      ref={containerRef}
      onPointerOver={handlePointerOver}
      onPointerLeave={handlePointerLeave}
      className="relative w-full"
    >
      <div
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 hidden rounded-(--cell-radius) opacity-0 will-change-[transform,width,height,opacity] bg-muted/85 dark:bg-muted/60 [@media(hover:hover)_and_(pointer:fine)]:block"
      />
      <table className={cn('relative z-10', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar p-2 bg-background [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7.5)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex flex-col w-full gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex items-center justify-between gap-1 w-full',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'p-0 size-(--cell-size) select-none aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'p-0 size-(--cell-size) select-none aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex items-center justify-center px-(--cell-size) h-(--cell-size) w-full',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex items-center justify-center gap-1.5 h-(--cell-size) w-full text-sm font-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn('relative rounded-(--cell-radius)', defaultClassNames.dropdown_root),
        dropdown: cn('absolute inset-0 bg-popover opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'font-medium select-none',
          captionLayout === 'label'
            ? 'text-sm'
            : 'flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
          defaultClassNames.caption_label,
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 rounded-(--cell-radius) text-[0.75rem] font-medium text-muted-foreground/70 select-none',
          defaultClassNames.weekday,
        ),
        week: cn('mt-1.5 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-(--cell-size) select-none', defaultClassNames.week_number_header),
        week_number: cn(
          'text-[0.8rem] text-muted-foreground select-none',
          defaultClassNames.week_number,
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full p-0 rounded-(--cell-radius) text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)',
          props.showWeekNumber
            ? '[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)'
            : '[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)',
          defaultClassNames.day,
        ),
        range_start: cn(
          'relative isolate z-0 bg-muted rounded-l-(--cell-radius) after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted',
          defaultClassNames.range_start,
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn(
          'relative isolate z-0 bg-muted rounded-r-(--cell-radius) after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted',
          defaultClassNames.range_end,
        ),
        today: cn(
          'rounded-(--cell-radius) text-foreground ring-1 ring-inset ring-foreground/20 data-[selected=true]:ring-0',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-muted-foreground/50 aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),
        disabled: cn('text-muted-foreground/35 opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        MonthGrid: CalendarMonthGrid,
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />;
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />;
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />;
        },
        DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'relative isolate z-10 flex flex-col gap-1 aspect-square size-auto w-full min-w-(--cell-size) leading-none font-normal font-mono text-xs tabular-nums border-0 hover:bg-transparent dark:hover:bg-transparent group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:hover:bg-primary data-[selected-single=true]:hover:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
