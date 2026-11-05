import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={cn(
        'fixed bottom-6 right-6 z-40 size-10 rounded-full shadow-lg bg-background/90 backdrop-blur-xs transition-[transform,opacity] duration-200 ease-[var(--ease-out)]',
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-2 scale-95 pointer-events-none',
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ChevronUp className="size-5" />
    </Button>
  );
}
