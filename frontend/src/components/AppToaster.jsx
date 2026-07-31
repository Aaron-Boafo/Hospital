import { Toaster } from 'sonner';
import { useTheme } from '../context/ThemeContext';

export default function AppToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster theme={resolvedTheme} richColors position="top-right" closeButton />;
}
