'use client';

import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React from 'react';

const Breadcrumbs = () => {
  const pathname = usePathname();

  // Split path and filter out empty strings
  const paths = pathname.split('/').filter(Boolean);

  // Format the breadcrumb labels
  const breadcrumbs = [
    { label: 'App', href: '#' },
    ...paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      // Capitalize first letter
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return { label, href };
    }),
  ];

  // If we are on root (which redirects to swap), just show App > Swap for now
  // Or if paths is empty, it means we are at '/' which is effectively Swap
  if (paths.length === 0) {
    breadcrumbs.push({ label: 'Swap', href: '/swap' });
  }

  return (
    <div className='text-base text-(--neutral-text-textWeak) flex items-center gap-3'>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.label}>
          {index > 0 && <ChevronRight width={16} height={16} />}
          <span
            className={
              index === breadcrumbs.length - 1
                ? 'text-(--neutral-text-textStrong)'
                : ''
            }
          >
            {crumb.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
