import { cn } from '../lib/utils'

export function Container({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('container px-4 mx-auto', className)} {...props} />
}
