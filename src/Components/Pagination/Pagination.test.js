import { pageWindow } from './Pagination';

describe('pageWindow', () => {
  test('small totals list every page', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(2, 4)).toEqual([1, 2, 3, 4]);
  });

  test('always keeps first, last and neighbours with ellipses for gaps', () => {
    expect(pageWindow(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20]);
    expect(pageWindow(1, 20)).toEqual([1, 2, '…', 20]);
    expect(pageWindow(20, 20)).toEqual([1, '…', 19, 20]);
  });

  test('a single-page gap is shown as the page, not an ellipsis', () => {
    expect(pageWindow(4, 8)).toEqual([1, 2, 3, 4, 5, '…', 8]);
  });
});
