'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Leaf, MessageSquare, Microscope, LogOut } from 'lucide-react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

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
  {
    href: '/history',
    label: 'History',
    icon: MessageSquare,
    tooltip: 'Feature & Chat History',
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  }, [router]);

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
      {/* Logout Button */}
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleLogout}
          tooltip={{
            children: 'Logout',
            side: 'right',
          }}
        >
          <LogOut />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
