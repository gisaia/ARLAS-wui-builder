import { describe, expect, it } from 'vitest';
import { StepGradientPipe } from './step-gradient.pipe';

describe('StepGradientPipe', () => {
  it('create an instance', () => {
    const pipe = new StepGradientPipe();
    expect(pipe).toBeTruthy();
  });
});
