Common = window.Common || {};

(function(exports) {
    function EventEmitter() {
        this.events = {};
    }

    var Proto = EventEmitter.prototype;

    Proto.eventExists = function(event) {
        return (typeof this.events[event] !== 'undefined');
    }

    Proto.emit = function(event) {
        var handler = this.events[event];
        if (!this.eventExists(event)) {
            return false;
        }

        for (var i = 0, l = handler.length; i < l; i++) {
            this.events[event][i].apply(
                this,
                Array.prototype.slice.call(arguments, 1));
        }
        return true;
    }

    Proto.on = function(event, listener) {
        this.emit('newListener', event, listener);
        if (!this.eventExists(event)) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }

    Proto.once = function(event, listener) {
        var self = this;
        var fn = function() {
            self.remove(event, listener);
            listener.apply(self, Array.prototype.slice.call(arguments, 1));
        }
        this.on(event, listener);
        return this;
    }

    Proto.remove = function(event, listener) {
        if (this.eventExists(event)) {
            this.events[event].splice(this.events[event].indexOf(listener), 1);
        }
        return this;
    }

    Proto.removeAll = function(event) {
        delete this.events[event];
        return this;
    }

    exports.EventEmitter = EventEmitter;
    exports.Events = new EventEmitter();
})(Common);
