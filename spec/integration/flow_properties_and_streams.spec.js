'use strict';

describe('ProAct.Flow, ProAct.Property and ProAct.Stream', function () {
  it ('all errors from the flow go to the ProAct.flow#errStream', function () {
    var res = [];
    ProAct.flow.errStream().onErr(function (e) {
      res.push(e)
    });

    ProAct.flow.run(function () {
      throw new Error('1');
    });

    expect(res.length).toBe(1);
    expect(res[0].message).toBe('1');
  });

  it ('all errors from pushed actions in the ProAct.flow go to the ProAct.flow#errStream', function () {
    var res = [];
    ProAct.flow.errStream().onErr(function (e) {
      res.push(e)
    });

    ProAct.flow.run(function () {
      ProAct.flow.push(function () {
        throw new Error('2');
      });
      throw new Error('1');
    });

    expect(res.length).toBe(2);
    expect(res[0].message).toEqual('1');
    expect(res[1].message).toEqual('2');
  });

  it ('Errors from property objects go to the ProAct.flow#errStream', function () {
    var obj = ProAct.prob({
          a: 0,
          b: 1,
          d: function () {
            if (this.b === 0) {
              throw new Error('You can not divide on zero!');
            }

            return this.a / this.b;
          }
        }),
        errs = [];
    ProAct.flow.errStream().onErr(function (e) {
      errs.push(e);
    });

    expect(obj.d).toEqual(0);

    obj.b = 0;
    expect(obj.d).toEqual(0);

    expect(errs.length).toBe(1);
    expect(errs[0].message).toEqual('You can not divide on zero!');
  });

  it ('cycles...', function () {
    var obj = ProAct.prob({
          b: 1,
          c: function () {
            this.b;
            return this.d;
          },
          d: function () {
            return this.c;
          }
        }),
        errs = [];
    ProAct.flow.errStream().onErr(function (e) {
      errs.push(e);
    });

    obj.d;
    expect(errs.length).toBe(1);
  });

  it ('ProAct.AutoProperty can use ProAct.flow#pause and ProAct.flow#resume to set the properties it depends on.', function () {
    var computeCounter = 0,
        obj = ProAct.prob({
          a: 0,
          b: 0,
          c: function (val) {
            computeCounter++;
            if (ProAct.U.isArray(val) && val.length === 2) {
              ProAct.flow.pause();
              this.a = val[0];
              this.b = val[1];
              ProAct.flow.resume();
            }
            return this.a + this.b;
          }
        });

    expect(obj.c).toEqual(0);
    obj.c = [2, 3];

    expect(obj.a).toEqual(2);
    expect(obj.b).toEqual(3);
    expect(obj.c).toEqual(5);

    expect(computeCounter).toEqual(2); // Initial compute and update compute.
  });

  describe ('Multy queue', function () {
    var plain, model, view;
    beforeEach(function () {
      ProAct.flow.addQueue('model');
      ProAct.flow.addQueue('view');

      view = ProAct.prob(
        {
          a: 0,
          b: function () {
            return model.d + this.a;
          },
          c: function () {
            return this.b + plain.b;
          },
          name: 'view'
        },
        {
          p: {
            queueName: 'view'
          }
        }
      );

      plain = ProAct.prob(
        {
          a: 7,
          b: function () {
            return this.a + 1 + view.a;
          },
          name: 'plain'
        }
      );

      model = ProAct.prob(
        {
          c: function () {
            return this.d +  view.a;
          },
          d: function () {
            return plain.a * plain.a;
          },
          name: 'model'
        },
        {
          p: {
            queueName: 'model'
          }
        }
      );
    });

    it ('setup is right', function () {
      expect(plain.a).toEqual(7);
      expect(plain.b).toEqual(8);

      expect(model.c).toEqual(49);
      expect(model.d).toEqual(49);

      expect(view.a).toEqual(0);
      expect(view.b).toEqual(49);
      expect(view.c).toEqual(57);
    });

    it ('updates are in the right queue order', function () {
      var res = [],
          l1 = function (e) {
            res.push(e.args[0].name + '.' + e.target);
          },
          l2 = function (e) {
            res.push(e.args[0].name + '.' + e.target);
          };

      plain.b;
      plain.p('b').on(l2);
      model.c;
      model.p('c').on(l1);
      model.d;
      model.p('d').on(l2);
      view.b;
      view.p('b').on(l1);
      view.c;
      view.p('c').on(l2);

      view.a = 15;

      expect(plain.a).toEqual(7);
      expect(plain.b).toEqual(23);

      expect(model.c).toEqual(64);
      expect(model.d).toEqual(49);

      expect(view.b).toEqual(64);
      expect(view.c).toEqual(87);

      expect(res).toEqual(['plain.b', 'model.c', 'view.b', 'view.c']);
    });
  });
});
