'use strict';

describe('Pro.Utils', function () {
  describe('#remove', function () {
    it ('removes element from array', function () {
      var arr = [1], obj = {a: 2}, a = [5];

      arr.push(obj, a, 3);

      Pro.Utils.remove(arr, obj);
      expect(arr).toEqual([1, a, 3]);

      Pro.Utils.remove(arr, a);
      expect(arr).toEqual([1, 3]);
    });
  });

  describe('#diff' , function () {
    it ('creates a diff between sub-array and array', function () {
      var a1 = [1, 2, 3],
          a2 = [1, 2],
          diff;

      diff = Pro.Utils.diff(a1, a2);
      expect(diff).toBeDefined();
      expect(diff[2]).toBeDefined();
      expect(diff[2].o).toEqual([3]);
      expect(diff[2].n).toEqual([]);

      a2.push(3, 4);
      diff = Pro.Utils.diff(a1, a2);
      expect(diff).toBeDefined();
      expect(diff[3]).toBeDefined();
      expect(diff[3].o).toEqual([]);
      expect(diff[3].n).toEqual([4]);
    });

    it ('creates a diff between similar arrays with the same length', function () {
      var a1 = [1, 2, 3],
          a2 = [1, 4, 3],
          diff;

      diff = Pro.Utils.diff(a1, a2);
      expect(diff).toBeDefined();
      expect(diff[1]).toBeDefined();
      expect(diff[1].o).toEqual([2]);
      expect(diff[1].n).toEqual([4]);

      a2[2] = 5;
      diff = Pro.Utils.diff(a1, a2);
      expect(diff).toBeDefined();
      expect(diff[1]).toBeDefined();
      expect(diff[1].o).toEqual([2, 3]);
      expect(diff[1].n).toEqual([4, 5]);

      a1.push(5, 4, 3, 2, 1);
      a2.push(5, 4, 2, 2, 3);
      diff = Pro.Utils.diff(a1, a2);
      expect(diff).toBeDefined();
      expect(diff[0]).toBeUndefined();
      expect(diff[1]).toBeDefined();
      expect(diff[1].o).toEqual([2, 3]);
      expect(diff[1].n).toEqual([4, 5]);
      expect(diff[2]).toBeUndefined();
      expect(diff[3]).toBeUndefined();
      expect(diff[4]).toBeUndefined();
      expect(diff[5]).toBeDefined();
      expect(diff[5].o).toEqual([3]);
      expect(diff[5].n).toEqual([2]);
      expect(diff[6]).toBeUndefined();
      expect(diff[7]).toBeDefined();
      expect(diff[7].o).toEqual([1]);
      expect(diff[7].n).toEqual([3]);
    });

    it ('makes diffs between very different arrays', function () {
      var a1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          a2 = [2, 4, 6, 4, 2, 6, 4, 2, 0, 10, 11],
          diff;

      diff = Pro.Utils.diff(a1, a2);
      expect(diff).toBeDefined();
      expect(diff[0]).toBeDefined();
      expect(diff[0].o).toEqual([1, 2, 3]);
      expect(diff[0].n).toEqual([2, 4, 6]);
      expect(diff[1]).toBeUndefined();
      expect(diff[2]).toBeUndefined();
      expect(diff[3]).toBeUndefined();
      expect(diff[4]).toBeDefined();
      expect(diff[4].o).toEqual([5]);
      expect(diff[4].n).toEqual([2]);
      expect(diff[5]).toBeUndefined();
      expect(diff[6]).toBeDefined();
      expect(diff[6].o).toEqual([7, 8, 9]);
      expect(diff[6].n).toEqual([4, 2, 0]);
      expect(diff[7]).toBeUndefined();
      expect(diff[8]).toBeUndefined();
      expect(diff[9]).toBeUndefined();
      expect(diff[10]).toBeDefined();
      expect(diff[10].o).toEqual([]);
      expect(diff[10].n).toEqual([11]);
    });
  });
});
