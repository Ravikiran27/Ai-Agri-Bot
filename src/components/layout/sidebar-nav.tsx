'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Leaf, MessageSquare, Microscope } from 'lucide-react';
import Link from 'next/link';

const links = [
  {
    href: '/chat',
    label: 'Agri-Chat',
    icon: MessageSquare,
    tooltip: 'Agricultural Chatbot',
  },
  {
    href: '/crop-recommendation',
    label: 'Crop Advisor',
    icon: Leaf,
    tooltip: 'Crop Recommendation',
  },
  {
    href: '/disease-prediction',
    label: 'Disease Diagnosis',
    icon: Microscope,
    tooltip: 'Disease Prediction',
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={{
              children: link.tooltip,
              side: 'right',
            }}
          >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
