import { vi } from 'vitest';

export const mockArlasSettingsService = {
    settings: {},
    getLinksSettings: vi.fn(() => []),
    getAuthentSettings: vi.fn(() => {}),
    getSettings: vi.fn(() => ({
        terrain: {}
    }))
};
