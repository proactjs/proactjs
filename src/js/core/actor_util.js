/**
 * @module proact-core
 */


/**
 * ActorUtil provides methods that can be used to make the Actor to 'act'.
 * The Actor is ProAct.js version of the base `Observable` object. Various types
 * of listeners can be attached to it and used to observe its `actions`.
 *
 * On the other hand the `Actor` should do something or `act`, because something
 * has to be observed after all.
 *
 * The `ActorUtil` contains a set of methods that help implementing these `acts`.
 *
 * For example the we can trigger events/values in the `Streams`. This is thier `act`.
 * This triggering can be implemented with ease using the methods defined in `ActorUtil`.
 *
 * Another example is `Properties` - they can be set or updated by the reactive flow -> they should react.
 *
 * So `ActorUtil` provides the `Actors` with helpful methods for `acting` and `reacting`.
 *
 * All these methods use the {{#crossLink "ProAct.Flow"}}{{/crossLink}} to defer the changes the right way.
 * And the using the `flow` these methods handle the dependencies between the `Actors`.
 *
 * Use the methods in the `ActorUtil` to implement your `Actor's` `actions` and `reactions`.
 *
 * @namespace ProAct
 * @private
 * @class ActorUtil
 * @extensionfor ProAct.Actor
 * @static
 */
ActorUtil = {

  /**
   * Updating/notifying method that can be applied to an {{#crossLink "ProAct.Actor"}}{{/crossLink}}
   *
   * This method defers the update and the notifications into {{#crossLink "ProAct.flow"}}{{/crossLink}}.
   *
   * If the state of the caller is {{#crossLink "ProAct.States.destroyed)"}}{{/crossLink}}, an exception will be thrown.
   * If the state of the caller is {{#crossLink "ProAct.States.closed)"}}{{/crossLink}}, nothing will happen.
   *
   * Examples:
   *
   * You can implement a stream and in it's `trigger` method use this:
   * ```
   *   ActorUtil.update.call(this, event);
   * ```
   * This way the event will be triggered into the stream and all the listeners to the stream will be notified.
   * For this to work you'll have to override the `makeEvent` method of the stream to return the unmodified source - no state/no event generation,
   * the event will just go through.
   *
   *
   * If you want to implement a statefull `Actor` like a `property`, you can set a state in it and just notify all the
   * observing `Actors` with this method.
   *
   *
   * @method update
   * @protected
   * @param {Object} [source] The event/value, causing the update -> can be null : no source.
   * @param {Object} [actions] For which actions should notify -> can be null : default actions.
   * @param {Object} [eventData] Data for creating the updating event -> can be null : no data.
   * @return {Object} The calling object.
   */
  update: function (source, actions, eventData) {
    if (this.state === ProAct.States.destroyed) {
      throw new Error('You can not trigger actions on destroyed actors!');
    }

    if (this.state === ProAct.States.closed) {
      return;
    }

    var actor = this;
    if (!P.flow.isRunning()) {
      P.flow.run(function () {
        ActorUtil.doUpdate.call(actor, source, actions, eventData);
      });
    } else {
      ActorUtil.doUpdate.call(actor, source, actions, eventData);
    }
    return this;
  },

  /**
   * Contains the real notify/update logic defered by {{#crossLink "ProAct.ActorUtil/update:method"}}{{/crossLink}} into the flow.
   * It is private method, should not be used - use `update`.
   *
   * @method doUpdate
   * @private
   * @param {Object} [source] The event/value, causing the update -> can be null : no source.
   * @param {Object} [actions] For which actions should notify -> can be null : default actions.
   * @param {Object} [eventData] Data for creating the updating event -> can be null : no data.
   * @return {Object} The calling object.
   */
  doUpdate: function (source, actions, eventData) {
    if (!actions) {
      actions = this.defaultActions();
    }

    var ln, i, j,
        listener,
        listeners,
        length,
        event;

    if (P.U.isString(actions)) {
      listeners = this.listeners[actions];
    } else {
      while (actions.indexOf('close') !== -1) {
        P.U.remove(actions, 'close');
      }

      listeners = [];
      ln = actions.length;

      if (this.parent === null && actions.length === 0) {
        return this;
      }

      for (i = 0; i < ln; i++) {
        listenersForAction = this.listeners[actions[i]];

        if (listenersForAction) {
          for (j = 0; j < listenersForAction.length; j++) {
            if (listenersForAction[j].destroyed || listenersForAction[j].closed) {
              this.off(actions[i], listenersForAction[j]);
              continue;
            }
          }
          listeners = listeners.concat(listenersForAction);
        }
      }
    }

    if (listeners.length === 0 && this.parent === null && actions !== 'close') {
      return this;
    }

    if (actions === 'close' && !this.canClose()) {
      return this;
    }

    length = listeners.length;
    event = this.makeEvent(source, eventData);

    for (i = 0; i < length; i++) {
      listener = listeners[i];
      if (!listener) {
        throw new Error('Invalid null listener for actions : ' + actions);
      }

      if (P.U.isString(actions) && listener.destroyed) {
        this.off(actions, listener);
        continue;
      }

      this.defer(event, listener);

      if (listener.property) {
        ActorUtil.doUpdate.call(listener.property, event);
      }
    }

    if (this.parent && this.parent.call) {
      this.defer(event, this.parent);
    }

    if (actions === 'close') {
      P.flow.pushClose(this, this.doClose);
    }

    return this;
  }
};
P.U.defValProp(ProAct, 'ActorUtil', false, false, false, ActorUtil);
