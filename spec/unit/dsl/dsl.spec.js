'use strict';

describe('ProAct.DSL', function () {
  describe('ops', function () {
    describe('#on', function () {
      describe('#math', function () {
        it ('matches @action(callback)', function () {
          expect(ProAct.DSL.ops.on.match('@change(f:fire)')).toBe(true);
        });
        it ('matches @(callback)', function () {
          expect(ProAct.DSL.ops.on.match('@($1)')).toBe(true);
        });
      });
      describe('#toOptions', function () {
        it ('@change(f:go) -> {on: ["change", "f:go"]}', function () {
          var actionObject = {};

          ProAct.DSL.ops.on.toOptions(actionObject, '@change(f:go)');

          expect(actionObject.on).not.toBe(undefined);
          expect(ProAct.U.isArray(actionObject.on)).toBe(true);
          expect(actionObject.on.length).toBe(2);
          expect(actionObject.on[0]).toEqual('change');
          expect(actionObject.on[1]).toEqual('f:go');
        });

        it ('@(f:go) -> {on: ["f:go"]}', function () {
          var actionObject = {};

          ProAct.DSL.ops.on.toOptions(actionObject, '@(f:go)');

          expect(actionObject.on).not.toBe(undefined);
          expect(ProAct.U.isArray(actionObject.on)).toBe(true);
          expect(actionObject.on.length).toBe(1);
          expect(actionObject.on[0]).toEqual('f:go');
        });

        it ('@($1) -> {on: [real_arg_1]}', function () {
          var actionObject = {}, arg1 = function () {};

          ProAct.DSL.ops.on.toOptions(actionObject, '@($1)', arg1);

          expect(actionObject.on).not.toBe(undefined);
          expect(ProAct.U.isArray(actionObject.on)).toBe(true);
          expect(actionObject.on.length).toBe(1);
          expect(actionObject.on[0]).toBe(arg1);
        });

        it ('@change($1, $2) -> {on: ["change", real_arg_1, real_arg_2]}', function () {
          var actionObject = {}, arg1 = function () {}, arg2 = [];

          ProAct.DSL.ops.on.toOptions(actionObject, '@change($1, $2)', arg1, arg2);

          expect(actionObject.on).not.toBe(undefined);
          expect(ProAct.U.isArray(actionObject.on)).toBe(true);
          expect(actionObject.on.length).toBe(3);
          expect(actionObject.on[0]).toEqual('change');
          expect(actionObject.on[1]).toBe(arg1);
          expect(actionObject.on[2]).toBe(arg2);
        });
      });
      describe('#action', function () {
        it ('calls on method on actor with ["change", <callback>]', function () {
          var actor = new ProAct.Actor(), listener = function () {};

          spyOn(actor, 'on');
          ProAct.DSL.ops.on.action(actor, {on: ['change', listener]});
          expect(actor.on).toHaveBeenCalledWith('change', listener);
        });
      });
    });
  });
});
