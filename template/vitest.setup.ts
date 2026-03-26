import '@testing-library/jest-dom/vitest';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

// @ts-expect-error - assign to global
global.ResizeObserver = ResizeObserverMock;
// @ts-expect-error - assign to global
global.IntersectionObserver = IntersectionObserverMock;
