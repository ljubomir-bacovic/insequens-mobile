import { useRouter } from 'expo-router';
import { logout } from '@/api';

const useLogout = (): (() => Promise<void>) => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.replace('/(auth)/login');
    }
  };

  return handleLogout;
};

export default useLogout;
