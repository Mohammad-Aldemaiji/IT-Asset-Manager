import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Unmount rendered components after every test so tests don't affect each other
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
