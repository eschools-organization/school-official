// Client-side Polyfills for Older WebKit (iOS 11-16, Safari 11-16, iPhone 8)

export const EARLY_POLYFILL_SCRIPT = `
(function() {
  try {
    if (typeof globalThis === "undefined") {
      window.globalThis = window;
    }

    // 1. Object.hasOwn (iOS < 15.4) - Critical: used by Next.js 16 client runtime before hydration
    if (typeof Object.hasOwn !== "function") {
      Object.hasOwn = function(obj, prop) {
        if (obj == null) throw new TypeError("Cannot convert undefined or null to object");
        return Object.prototype.hasOwnProperty.call(Object(obj), prop);
      };
    }

    // 2. Object.fromEntries (iOS < 12.2)
    if (typeof Object.fromEntries !== "function") {
      Object.fromEntries = function(iter) {
        var obj = {};
        if (!iter) return obj;
        var arr = Array.from ? Array.from(iter) : [];
        for (var i = 0; i < arr.length; i++) {
          var pair = arr[i];
          if (pair && pair.length >= 2) obj[pair[0]] = pair[1];
        }
        return obj;
      };
    }

    // 3. Array.prototype.at & String.prototype.at (iOS < 15.4) - Critical: used by Next.js 16 router
    if (!Array.prototype.at) {
      Object.defineProperty(Array.prototype, "at", {
        value: function(n) {
          n = Math.trunc(n) || 0;
          if (n < 0) n += this.length;
          if (n < 0 || n >= this.length) return undefined;
          return this[n];
        },
        writable: true,
        configurable: true
      });
    }
    if (!String.prototype.at) {
      Object.defineProperty(String.prototype, "at", {
        value: function(n) {
          n = Math.trunc(n) || 0;
          if (n < 0) n += this.length;
          if (n < 0 || n >= this.length) return undefined;
          return this.charAt(n);
        },
        writable: true,
        configurable: true
      });
    }

    // 4. Array.prototype.flat & flatMap (iOS < 12)
    if (!Array.prototype.flat) {
      Object.defineProperty(Array.prototype, "flat", {
        value: function(depth) {
          var d = depth === undefined ? 1 : Number(depth);
          var result = [];
          var flatten = function(arr, curDepth) {
            for (var i = 0; i < arr.length; i++) {
              if (Array.isArray(arr[i]) && curDepth > 0) {
                flatten(arr[i], curDepth - 1);
              } else {
                result.push(arr[i]);
              }
            }
          };
          flatten(this, d);
          return result;
        },
        writable: true,
        configurable: true
      });
    }
    if (!Array.prototype.flatMap) {
      Object.defineProperty(Array.prototype, "flatMap", {
        value: function(callback, thisArg) {
          return this.map(callback, thisArg).flat(1);
        },
        writable: true,
        configurable: true
      });
    }

    // 5. Array.prototype.findLast & findLastIndex (iOS < 15.4)
    if (!Array.prototype.findLast) {
      Object.defineProperty(Array.prototype, "findLast", {
        value: function(predicate, thisArg) {
          for (var i = this.length - 1; i >= 0; i--) {
            if (predicate.call(thisArg, this[i], i, this)) return this[i];
          }
          return undefined;
        },
        writable: true,
        configurable: true
      });
    }
    if (!Array.prototype.findLastIndex) {
      Object.defineProperty(Array.prototype, "findLastIndex", {
        value: function(predicate, thisArg) {
          for (var i = this.length - 1; i >= 0; i--) {
            if (predicate.call(thisArg, this[i], i, this)) return i;
          }
          return -1;
        },
        writable: true,
        configurable: true
      });
    }

    // 6. Array.prototype.toSorted, toReversed, toSpliced, with (iOS < 16.0)
    if (!Array.prototype.toSorted) {
      Object.defineProperty(Array.prototype, "toSorted", {
        value: function(compareFn) {
          return Array.prototype.slice.call(this).sort(compareFn);
        },
        writable: true,
        configurable: true
      });
    }
    if (!Array.prototype.toReversed) {
      Object.defineProperty(Array.prototype, "toReversed", {
        value: function() {
          return Array.prototype.slice.call(this).reverse();
        },
        writable: true,
        configurable: true
      });
    }
    if (!Array.prototype.toSpliced) {
      Object.defineProperty(Array.prototype, "toSpliced", {
        value: function() {
          var copy = Array.prototype.slice.call(this);
          Array.prototype.splice.apply(copy, arguments);
          return copy;
        },
        writable: true,
        configurable: true
      });
    }

    // 7. String.prototype.replaceAll (iOS < 13.4)
    if (!String.prototype.replaceAll) {
      Object.defineProperty(String.prototype, "replaceAll", {
        value: function(search, replacement) {
          if (search instanceof RegExp) {
            if (!search.global) throw new TypeError("replaceAll must be called with a global RegExp");
            return this.replace(search, replacement);
          }
          return this.split(String(search)).join(String(replacement));
        },
        writable: true,
        configurable: true
      });
    }

    // 8. Promise.allSettled & Promise.withResolvers (iOS < 13 / iOS < 17.4)
    if (typeof Promise !== "undefined") {
      if (!Promise.allSettled) {
        Promise.allSettled = function(promises) {
          return Promise.all(Array.from(promises).map(function(p) {
            return Promise.resolve(p).then(
              function(value) { return { status: "fulfilled", value: value }; },
              function(reason) { return { status: "rejected", reason: reason }; }
            );
          }));
        };
      }
      if (!Promise.withResolvers) {
        Promise.withResolvers = function() {
          var resolve, reject;
          var promise = new Promise(function(res, rej) {
            resolve = res;
            reject = rej;
          });
          return { promise: promise, resolve: resolve, reject: reject };
        };
      }
    }

    // 9. requestIdleCallback & cancelIdleCallback (Safari / iOS < 16.4)
    if (!window.requestIdleCallback) {
      window.requestIdleCallback = function(cb, options) {
        var start = Date.now();
        var timeout = (options && options.timeout) || 50;
        return window.setTimeout(function() {
          cb({
            didTimeout: false,
            timeRemaining: function() {
              return Math.max(0, timeout - (Date.now() - start));
            }
          });
        }, 1);
      };
    }
    if (!window.cancelIdleCallback) {
      window.cancelIdleCallback = function(id) {
        clearTimeout(id);
      };
    }

    // 10. structuredClone (iOS < 15.4)
    if (typeof window.structuredClone !== "function") {
      window.structuredClone = function(val) {
        if (val === undefined) return undefined;
        try {
          return JSON.parse(JSON.stringify(val));
        } catch (e) {
          return val;
        }
      };
    }

    // 11. crypto.randomUUID (iOS < 15.4 or non-HTTPS http:// connections)
    if (typeof window.crypto === "undefined") {
      window.crypto = {};
    }
    if (typeof window.crypto.randomUUID !== "function") {
      window.crypto.randomUUID = function() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, function(c) {
          var r = (window.crypto && window.crypto.getRandomValues)
            ? window.crypto.getRandomValues(new Uint8Array(1))[0]
            : Math.floor(Math.random() * 256);
          return (c ^ (r & (15 >> (c / 4)))).toString(16);
        });
      };
    }

    // 12. Resilient localStorage / sessionStorage wrapper for iPhone Safari Private Mode & QuotaExceededError
    var memLocal = {};
    var memSession = {};
    var origLocalSet = Storage.prototype.setItem;
    var origLocalGet = Storage.prototype.getItem;
    var origLocalRemove = Storage.prototype.removeItem;
    var origLocalClear = Storage.prototype.clear;

    Storage.prototype.setItem = function(key, value) {
      try {
        origLocalSet.call(this, key, value);
      } catch (e) {
        try {
          // If quota exceeded, purge heavy cache keys and retry once
          for (var i = this.length - 1; i >= 0; i--) {
            var k = this.key(i);
            if (k && (k.indexOf("history_cache_") === 0 || k.indexOf("draft_grades_") === 0)) {
              origLocalRemove.call(this, k);
            }
          }
          origLocalSet.call(this, key, value);
        } catch (e2) {
          if (this === window.sessionStorage) memSession[key] = String(value);
          else memLocal[key] = String(value);
        }
      }
    };

    Storage.prototype.getItem = function(key) {
      try {
        var val = origLocalGet.call(this, key);
        if (val !== null && val !== undefined) return val;
      } catch (e) {}
      var store = (this === window.sessionStorage) ? memSession : memLocal;
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    };

    Storage.prototype.removeItem = function(key) {
      try {
        origLocalRemove.call(this, key);
      } catch (e) {}
      var store = (this === window.sessionStorage) ? memSession : memLocal;
      delete store[key];
    };

    Storage.prototype.clear = function() {
      try {
        origLocalClear.call(this);
      } catch (e) {}
      if (this === window.sessionStorage) memSession = {};
      else memLocal = {};
    };
  } catch (err) {
    console.warn("Polyfill init warning:", err);
  }
})();
`;

if (typeof window !== "undefined") {
  try {
    // Execute polyfills immediately on client import as well
    const fn = new Function(EARLY_POLYFILL_SCRIPT);
    fn();
  } catch {
    // Fallback direct assignments if CSP blocks new Function
    if (typeof Object.hasOwn !== "function") {
      Object.hasOwn = function (obj: object, prop: PropertyKey): boolean {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      };
    }
    if (!Array.prototype.at) {
      Array.prototype.at = function (n: number) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        if (n < 0 || n >= this.length) return undefined;
        return this[n];
      };
    }
  }
}

export {};
