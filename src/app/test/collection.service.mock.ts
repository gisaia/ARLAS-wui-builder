import { of } from 'rxjs';
import { vi } from 'vitest';

export const mockCollectionService = {
    getCollectionsWithCentroid: vi.fn(() => []),
    getCollectionFields: vi.fn(() => of([])),
    getGroupCollectionItems: vi.fn(() => ({
        collections: [],
        owner: [],
        shared: [],
        public: []
    })),
    getCollections: vi.fn(() => []),
    getDescribe: vi.fn(() => of({ params: {} })),
    getGroupCollectionItemsWithCentroid: vi.fn(() => ({
        collections: [],
        owner: [],
        shared: [],
        public: []
    }))
};
