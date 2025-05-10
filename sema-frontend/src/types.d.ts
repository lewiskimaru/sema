// Type declarations for modules without type definitions

declare module 'react-toastify' {
  export const ToastContainer: any;
  export const toast: any;
}

declare module 'react-world-map' {
  const WorldMap: any;
  export default WorldMap;
}

declare module '*.css';

// Import types for Language
declare module './services/translation' {
  export interface Language {
    code: string;
    name: string;
    native_name?: string;
    region?: string;
    country?: string;
  }
} 