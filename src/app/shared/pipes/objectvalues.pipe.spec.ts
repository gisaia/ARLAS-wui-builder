import { describe, expect, it } from "vitest";
import { ObjectvaluesPipe } from './objectvalues.pipe';

describe('ObjectvaluesPipe', () => {
    it('create an instance', () => {
        const pipe = new ObjectvaluesPipe();
        expect(pipe).toBeTruthy();
    });
});
