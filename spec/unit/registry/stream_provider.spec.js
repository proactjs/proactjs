'use strict';

describe('ProAct.Registry.StreamProvider', function () {
  var reg, res, listener;
  beforeEach(function () {
    var fProvider = new ProAct.Registry.FunctionProvider();

    res = [];

    reg = new ProAct.Registry()
            .register('s', new ProAct.Registry.StreamProvider())
            .register('l', fProvider)
            .register('f', fProvider);
    listener = function (el) {
      res.push(el);
    };
  });

  describe('#make', function () {
    describe('stream types', function () {
      it ('creates a stream with specific flow queue using s:test:basic({queueName})', function () {
        var stream = reg.make('s:test:basic(test)');

        expect(stream instanceof ProAct.Stream).toBe(true);
        expect(reg.get('s:test')).toBe(stream);
        expect(reg.get('s:test').queueName).toEqual('test');
      });

      it ('creates a delayed buffered sream if using name as s:test:delayed({delay})', function () {
        var stream = reg.make('s:test:delayed(300)');

        expect(stream instanceof ProAct.Stream).toBe(true);
        expect(stream instanceof ProAct.DelayedStream).toBe(true);
        expect(reg.get('s:test')).toBe(stream);
        expect(reg.get('s:test').delay).toEqual(300);
      });

      it ('creates a delayed buffered sream with specific flow queue, if using name as s:test:delayed({queueName},{delay})', function () {
        var stream = reg.make('s:test:delayed(test,300)');

        expect(stream instanceof ProAct.Stream).toBe(true);
        expect(stream instanceof ProAct.DelayedStream).toBe(true);
        expect(reg.get('s:test')).toBe(stream);
        expect(reg.get('s:test').delay).toEqual(300);
        expect(reg.get('s:test').queueName).toEqual('test');
      });

      it ('creates a size buffered sream if using name as s:test:size({size})', function () {
        var stream = reg.make('s:test:size(5)');

        expect(stream instanceof ProAct.Stream).toBe(true);
        expect(stream instanceof ProAct.SizeBufferedStream).toBe(true);
        expect(reg.get('s:test')).toBe(stream);
      });

      it ('creates a debouncing buffered sream if using name as s:test:debouncing({delay})', function () {
        var stream = reg.make('s:test:debouncing(300)');

        expect(stream instanceof ProAct.Stream).toBe(true);
        expect(stream instanceof ProAct.DebouncingStream).toBe(true);
        expect(reg.get('s:test')).toBe(stream);
      });

      it ('creates a throttling buffered sream if using name as s:test:throttling({delay})', function () {
        var stream = reg.make('s:test:throttling(300)');

        expect(stream instanceof ProAct.Stream).toBe(true);
        expect(stream instanceof ProAct.ThrottlingStream).toBe(true);
        expect(reg.get('s:test')).toBe(stream);
      });

    });
    describe('source', function () {
      it ('creates a simple stream that can be retrieved after that and used.', function () {
        var stream = reg.make('s:test');

        expect(stream instanceof ProAct.Stream).toBe(true);
        expect(reg.get('s:test')).toBe(stream);
      });

      it ('creates a simple stream with source - another.', function () {
        var source = new ProAct.Stream();

        reg.make('s:test', source);
        expect(source.listeners.change[0]).toBe(reg.get('s:test').makeListener());
      });

      it ('creates a simple stream with source - another registered stream using object options.', function () {
        reg.make('s:source');
        reg.make('s:test', {into: 's:source'});

        expect(reg.get('s:source').listeners.change[0]).toBe(reg.get('s:test').makeListener());
      });

      it ('creates a simple stream with source - another stream using object options.', function () {
        reg.make('s:source');
        reg.make('s:test', {into: reg.s('source')});

        expect(reg.stream('source').listeners.change[0]).toBe(reg.get('s:test').makeListener());
      });

      it ('creates a simple stream with source source stream defined with the proRegQl', function () {
        reg.make('s:source');
        reg.make('s:test', '<<(s:source)');

        expect(reg.stream('source').listeners.change[0]).toBe(reg.get('s:test').makeListener());
      });
    });

    describe('on', function () {
      it ('creates a stream with callback on trigger if passed "on" of type @($1)', function () {
        reg.make('s:test', '@($1)', function (e) {
          res.push(e);
        });

        reg.get('s:test').trigger('hey');
        expect(res.length).toBe(1);
        expect(res).toEqual(['hey']);
      });

      it ('creates a stream with callback on trigger if passed "on" of type @(f:fun)', function () {
        reg.store('f:fun', function (e) {
          res.push(e);
        });
        reg.make('s:test', '@(f:fun)');

        reg.get('s:test').trigger('hey');
        expect(res.length).toBe(1);
        expect(res).toEqual(['hey']);
      });

      it ('creates a stream with a source with callback on trigger if passed "on" of type @(f:fun)', function () {
        reg.store('f:fun', function (e) {
          res.push(e);
        });
        reg.make('s:source');
        reg.make('s:dest', '@(f:fun)');
        reg.make('s:test', '<<(s:source)|@(f:fun)|>>(s:dest)');

        reg.get('s:source').trigger('hey');
        expect(res.length).toBe(2);
        expect(res).toEqual(['hey', 'hey']);
      });
    });

    describe('map', function () {
      it ('creates a stream with mapping, transforming its value, passed with map($1)', function () {
        reg.make('s:test', '@($2)|map($1)', function (val) {
          return val + ' meddle!';
        }, function (el) {
          res.push(el);
        });

        reg.get('s:test').trigger('hey');
        expect(res.length).toBe(1);
        expect(res).toEqual(['hey meddle!']);
      });

      it ('creates a stream with mapping, transforming its value, passed with map(f:mapper)', function () {
        reg.store('f:mapper', function (val) {
          return val + ' ' + val;
        });
        reg.make('s:test', '@($1)|map(f:mapper)', listener);

        reg.get('s:test').trigger('hey');
        expect(res.length).toBe(1);
        expect(res).toEqual(['hey hey']);
      });

      it ('can use predefined mapping functions', function () {
        reg.make('s:test', '@($1)|map(-)', listener).trigger(4).trigger(-5);

        expect(res).toEqual([-4, 5]);
      });

      it ('can use complex predefined mapping expressions', function () {
        reg.make('s:test', '@($1)|map(&.&bau)', listener).trigger({bau: function () {return 5}});

        expect(res).toEqual([5]);
      });
    });

    describe('filter', function () {
      it ('creates a stream with filtering, filtering its value, using function passed with filter($1)', function () {
        reg.make('s:test', '@($1)|filter($2)', function (el) {
          res.push(el);
        }, function (val) {
          return val % 3 === 0;
        });

        reg.get('s:test').trigger(2).trigger(5).trigger(6).trigger(8);
        expect(res.length).toBe(1);
        expect(res).toEqual([6]);
      });

      it ('creates a stream with filtering, filtering its values, using filter(f:filter)', function () {
        reg.store('f:filter', function (val) {
          return val.indexOf('s') !== -1;
        });
        reg.make('s:test', '@($1)|filter(f:filter)', function (el) {
          res.push(el);
        });

        reg.get('s:test').trigger('hey').trigger('so').trigger('tanya').trigger('smerch');
        expect(res.length).toBe(2);
        expect(res).toEqual(['so', 'smerch']);
      });
    });

    describe('acc', function () {
      it ('creates a stream with accumulation, using function passed through acc($1, $2)', function () {
        reg.make('s:test', '@($1)|acc($2, $3)', function (el) {
          res.push(el);
        }, 0, function (x, y) {
          return x + y;
        });

        reg.get('s:test').trigger(1).trigger(1).trigger(1).trigger(81);
        expect(res.length).toBe(4);
        expect(res).toEqual([1, 2, 3, 84]);
      });

      it ('creates a accumulationg stream using acc($1, f:acc)', function () {
        reg.store('f:acc', function (x, y) {
          return x * y;
        });
        reg.make('s:test', '@($1)|acc($2, f:acc)', function (el) {
          res.push(el);
        }, 1);

        reg.get('s:test').trigger(1).trigger(2).trigger(3).trigger(4);
        expect(res.length).toBe(4);
        expect(res).toEqual([1, 2, 6, 24]);
      });

      it ('can use complex predefined accumulation expressions', function () {
        reg.make('s:test', '@($1)|acc(+)', listener).trigger(1).trigger(1).trigger(1);

        expect(res.length).toBe(3);
        expect(res).toEqual([1, 2, 3]);
      });
    });

    describe('order of operations', function () {
      it ('is retrieved by the "order" property in the meta object', function () {
        reg.make('s:test', {
          mapping: function (el) {
            return -el;
          },
          filtering: function (el) {
            return el >= 0;
          },
          accumulation: ['', function (i, x) {
            if (i === '') {
              return x + '';
            }
            return i + ":" + x;
          }],
          order: ['filtering', 'mapping', 'accumulation'],
          on: function (el) {
            res.push(el);
          }
        });

        reg.get('s:test').trigger(1).trigger(-1).trigger(2).trigger(-1);
        expect(['-1', '-1:-2']).toEqual(res);

        res = [];
        reg.make('s:test2', {
          mapping: function (el) {
            return -el;
          },
          filtering: function (el) {
            return el >= 0;
          },
          accumulation: ['', function (i, x) {
            if (i === '') {
              return x + '';
            }
            return i + ":" + x;
          }],
          order: ['mapping', 'filtering', 'accumulation'],
          on: function (el) {
            res.push(el);
          }
        });

        reg.get('s:test2').trigger(1).trigger(-1).trigger(2).trigger(-1);
        expect(['1', '1:1']).toEqual(res);
      });

      it ('is retrieved by the "order" in wich functions are ordered', function () {
        reg.make('s:test', 'map($1)|filter($2)|acc($3, $4)|@($5)',
          function (el) {
            return -el;
          },
          function (el) {
            return el >= 0;
          },
          '',
          function (i, x) {
            if (i === '') {
              return x + '';
            }
            return i + ":" + x;
          },
          function (el) {
            res.push(el);
          }
        );

        reg.get('s:test').trigger(1).trigger(-1).trigger(2).trigger(-1);
        expect(['1', '1:1']).toEqual(res);

        res = [];
        reg.make('s:test2', 'filter($2)|map($1)|acc($3, $4)|@($5)',
          function (el) {
            return -el;
          },
          function (el) {
            return el >= 0;
          },
          '',
          function (i, x) {
            if (i === '') {
              return x + '';
            }
            return i + ":" + x;
          },
          function (el) {
            res.push(el);
          }
        );

        reg.get('s:test2').trigger(1).trigger(-1).trigger(2).trigger(-1);
        expect(['-1', '-1:-2']).toEqual(res);
      });
    });
  });
});
