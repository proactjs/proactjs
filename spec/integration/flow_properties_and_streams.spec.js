'use strict';

describe('Pro.Flow, Pro.Property and Pro.Stream', function () {
  it ('all errors from the flow go to the Pro.flow#errStream', function () {
    var res = [];
    Pro.flow.errStream().onErr(function (e) {
      res.push(e)
    });

    Pro.flow.run(function () {
      throw new Error('1');
    });

    expect(res.length).toBe(1);
    expect(res[0].message).toBe('1');
  });

  it ('all errors from pushed actions in the Pro.flow go to the Pro.flow#errStream', function () {
    var res = [];
    Pro.flow.errStream().onErr(function (e) {
      res.push(e)
    });

    Pro.flow.run(function () {
      Pro.flow.push(function () {
        throw new Error('2');
      });
      throw new Error('1');
    });

    expect(res.length).toBe(2);
    expect(res[0].message).toEqual('1');
    expect(res[1].message).toEqual('2');
  });

  it ('Errors from property objects go to the Pro.flow#errStream', function () {
    var obj = Pro.prob({
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
    Pro.flow.errStream().onErr(function (e) {
      errs.push(e);
    });

    expect(obj.d).toEqual(0);

    obj.b = 0;
    expect(obj.d).toEqual(0);

    expect(errs.length).toBe(1);
    expect(errs[0].message).toEqual('You can not divide on zero!');
  });

  it ('cycles...', function () {
    var obj = Pro.prob({
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
    Pro.flow.errStream().onErr(function (e) {
      errs.push(e);
    });

    obj.d;
    expect(errs.length).toBe(1);
  });

  it ('Pro.AutoProperty can use Pro.flow#pause and Pro.flow#resume to set the properties it depends on.', function () {
    var computeCounter = 0,
        obj = Pro.prob({
          a: 0,
          b: 0,
          c: function (val) {
            computeCounter++;
            if (Pro.U.isArray(val) && val.length === 2) {
              Pro.flow.pause();
              this.a = val[0];
              this.b = val[1];
              Pro.flow.resume();
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
});
