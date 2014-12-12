'use strict';

describe('ProAct.SubscribableStream', function () {
  it ('it is a ProAct.Stream', function () {
    var stream = new ProAct.SubscribableStream();

    expect(stream instanceof ProAct.Stream).toBe(true);
  });

  it ('is in ProAct.States.ready state after creation', function () {
    var stream = new ProAct.SubscribableStream();

    expect(stream.state).toBe(ProAct.States.ready);
  });

  it ('subscribes using the subscribe function passed only when there is a listener added to it', function () {
    var subscribed = false,
        stream = new ProAct.SubscribableStream(function () {
          subscribed = true;
        });
    expect(subscribed).toBe(false);

    stream.on(function () {});
    expect(subscribed).toBe(true);
  });

  it ('unsubscribes using the result returned from the subscribe function only when there is no listener to it', function () {
    var subscribed = false,
        stream = new ProAct.SubscribableStream(function () {
          subscribed = true;

          return function () {
            subscribed = false;
          };
        }),
        l1 = function () {},
        l2 = function () {};
    expect(subscribed).toBe(false);

    stream.on(l1);
    expect(subscribed).toBe(true);

    stream.on(l2);
    expect(subscribed).toBe(true);

    stream.off(l2);
    expect(subscribed).toBe(true);

    stream.off(l1);
    expect(subscribed).toBe(false);
  });
});

