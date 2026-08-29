import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-6 right-6 z-40 size-10 rounded-full shadow-lg"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ChevronUp className="size-5" />
    </Button>
  );
}
