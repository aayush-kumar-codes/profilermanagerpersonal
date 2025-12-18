'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAccessToken, getUser, isAuthenticated } from '@/lib/auth';
import Navbar from '../components/Navbar';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; profilePicture?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchUserProfile();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        const userData = getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const userData = getUser();
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const activePage = pathname?.includes('/profile') 
    ? 'profile' 
    : pathname?.includes('/projects')
    ? 'projects'
    : 'dashboard';

  return (
    <div className="dashboard">
      <Navbar 
        userName={user.name} 
        userAvatar={user.profilePicture} 
        activePage={activePage as 'dashboard' | 'profile' | 'projects'}
      />
      {children}
    </div>
  );
}

