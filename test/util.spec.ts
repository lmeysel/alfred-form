import { flatten, unflatten } from '../src/util';

describe('util: unflatten', () => {
  it('unflatten nested object', () => {
    const obj = { first: 1, second: 2, 'nest.first': 'n1' };
    expect(unflatten(obj)).toMatchObject({
      first: 1,
      second: 2,
      nest: {
        first: 'n1',
      },
    });
  });
  it('empty object path', () => {
    const obj = { '': 0 };
    expect(() => unflatten(obj)).toThrowError(/Invalid nullish or empty segment/);
  });
  it('nullish segment', () => {
    const obj = { 'foo..bar': 0 };
    expect(() => unflatten(obj)).toThrowError(/Invalid nullish or empty segment/);
  });
  it('conflicting object path', () => {
    const obj = { 'foo.bar': 0, foo: 1 };
    expect(() => unflatten(obj)).toThrowError(/object path already contains a non-object value/);
  });
});

describe('util: flatten', () => {
  it('flatten nested object', () => {
    const obj = { first: 1, second: 2, nest: { first: 'n1', second: { deep: 'd1' } } };
    expect(flatten(obj)).toMatchObject({
      first: 1,
      second: 2,
      'nest.first': 'n1',
      'nest.second.deep': 'd1',
    });
  });
});
