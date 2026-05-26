import { describe, expect, it } from 'vitest';
import { UpperFirstPipe } from './upper-first.pipe';

describe('UpperFirstPipe', () => {
  it('create an instance', () => {
    const pipe = new UpperFirstPipe();
    expect(pipe).toBeTruthy();
  });
});
