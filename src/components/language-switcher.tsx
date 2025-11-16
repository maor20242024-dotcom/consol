'use client';

import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;

  const switchLanguage = (newLocale: string) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={locale === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => switchLanguage('en')}
        className={locale === 'en' ? 'bg-primary-500 text-secondary-900' : 'border-secondary-600 text-foreground'}
      >
        EN
      </Button>
      <Button
        variant={locale === 'ar' ? 'default' : 'outline'}
        size="sm"
        onClick={() => switchLanguage('ar')}
        className={locale === 'ar' ? 'bg-primary-500 text-secondary-900' : 'border-secondary-600 text-foreground'}
      >
        AR
      </Button>
    </div>
  );
}