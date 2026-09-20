'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-gray-500 py-3 font-sans">
      <Link href="/" className="hover:text-amber-600 transition flex items-center gap-1">
        <Home className="w-3.5 h-3.5 text-gray-400" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-gray-400 mx-1.5 shrink-0" />
            {isLast || !item.href ? (
              <span className="text-gray-900 font-semibold truncate" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-amber-600 transition truncate">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
