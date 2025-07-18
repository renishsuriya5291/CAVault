// src/components/ToasterProvider.jsx
import { Toaster } from 'sonner';

const ToasterProvider = () => {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors={false} // Use custom colors instead
      closeButton={true}
      toastOptions={{
        style: {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          color: '#1e293b',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
        },
        className: 'ca-shadow',
        duration: 4000,
      }}
      theme="light"
      visibleToasts={5}
      offset="24px"
    />
  );
};

export default ToasterProvider;