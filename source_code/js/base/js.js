/**
 * @Copyright (c) 2007,上海晨路信息科技有限公司
 * @All rights reserved.
 *
 * JS开发框架, 所有应用类基于Prototype.
 *
 * @author      黄新泽
 * @E-mail      superhuang AT gmail DOT com
 * @date        2007-10-03 09:36:09
 */



var Prototype = {
  Version: '1.6.0.2',

  Browser: {
    IE:     !!(window.attachEvent && !window.opera),
	IE7:    !!(document.all && window.XMLHttpRequest), 
    Opera:  !!window.opera,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions:
      document.createElement('div').__proto__ &&
      document.createElement('div').__proto__ !==
        document.createElement('form').__proto__
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


/* Based on Alex Arnell's inheritance implementation. */
var Class = {
  create: function() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;

    return klass;
  }
};

Class.Methods = {
  addMethods: function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length)
      properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value, value = Object.extend((function(m) {
          return function() { return ancestor[m].apply(this, arguments) };
        })(property).wrap(method), {
          valueOf:  function() { return method },
          toString: function() { return method.toString() }
        });
      }
      this.prototype[property] = value;
    }

    return this;
  }
};

var Abstract = { };

Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Object, {
  inspect: function(object) {
    try {
      if (Object.isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },

  toJSON: function(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (Object.isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = Object.toJSON(object[property]);
      if (!Object.isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  },

  toQueryString: function(object) {
    return $H(object).toQueryString();
  },

  toHTML: function(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  },

  keys: function(object) {
    var keys = [];
    for (var property in object)
      keys.push(property);
    return keys;
  },

  values: function(object) {
    var values = [];
    for (var property in object)
      values.push(object[property]);
    return values;
  },

  clone: function(object) {
    return Object.extend({ }, object);
  },

  isElement: function(object) {
    return object && object.nodeType == 1;
  },

  isArray: function(object) {
    return object != null && typeof object == "object" &&
      'splice' in object && 'join' in object;
  },

  isHash: function(object) {
    return object instanceof Hash;
  },

  isFunction: function(object) {
    return typeof object == "function";
  },

  isString: function(object) {
    return typeof object == "string";
  },

  isNumber: function(object) {
    return typeof object == "number";
  },

  isUndefined: function(object) {
    return typeof object == "undefined";
  }
});

Object.extend(Function.prototype, {
  argumentNames: function() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",").invoke("strip");
    return names.length == 1 && !names[0] ? [] : names;
  },

  bind: function() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
      return __method.apply(object, args.concat($A(arguments)));
    }
  },

  bindAsEventListener: function() {
    var __method = this, args = $A(arguments), object = args.shift();
    return function(event) {
      return __method.apply(object, [event || window.event].concat(args));
    }
  },

  curry: function() {
    if (!arguments.length) return this;
    var __method = this, args = $A(arguments);
    return function() {
      return __method.apply(this, args.concat($A(arguments)));
    }
  },

  delay: function() {
    var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  },

  wrap: function(wrapper) {
    var __method = this;
    return function() {
      return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
    }
  },

  methodize: function() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      return __method.apply(null, [this].concat($A(arguments)));
    };
  }
});

Function.prototype.defer = Function.prototype.delay.curry(0.01);

Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, {
  gsub: function(pattern, replacement) {
    var result = '', source = this, match;
    replacement = arguments.callee.prepareReplacement(replacement);

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  },

  sub: function(pattern, replacement, count) {
    replacement = this.gsub.prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  },

  scan: function(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  },

  truncate: function(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  },

  strip: function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  },

  stripTags: function() {
    return this.replace(/<\/?[^>]+>/gi, '');
  },

  stripScripts: function() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  },

  extractScripts: function() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  },

  evalScripts: function() {
    return this.extractScripts().map(function(script) { return eval(script) });
  },

  escapeHTML: function() {
    var self = arguments.callee;
    self.text.data = this;
    return self.div.innerHTML;
  },

  unescapeHTML: function() {
    var div = new Element('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ?
      $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
      div.childNodes[0].nodeValue) : '';
  },

  toQueryParams: function(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  },

  toArray: function() {
    return this.split('');
  },

  succ: function() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  },

  times: function(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  },

  camelize: function() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  },

  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  underscore: function() {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
  },

  dasherize: function() {
    return this.gsub(/_/,'-');
  },

  inspect: function(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  },

  toJSON: function() {
    return this.inspect(true);
  },

  unfilterJSON: function(filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
  },

  isJSON: function() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  },

  evalJSON: function(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  },

  include: function(pattern) {
    return this.indexOf(pattern) > -1;
  },

  startsWith: function(pattern) {
    return this.indexOf(pattern) === 0;
  },

  endsWith: function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  },

  empty: function() {
    return this == '';
  },

  blank: function() {
    return /^\s*$/.test(this);
  },

  interpolate: function(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }
});

if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {
  escapeHTML: function() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  unescapeHTML: function() {
    return this.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
  if (Object.isFunction(replacement)) return replacement;
  var template = new Template(replacement);
  return function(match) { return template.evaluate(match) };
};

String.prototype.parseQuery = String.prototype.toQueryParams;

Object.extend(String.prototype.escapeHTML, {
  div:  document.createElement('div'),
  text: document.createTextNode('')
});

with (String.prototype.escapeHTML) div.appendChild(text);

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return '';

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = {
  each: function(iterator, context) {
    var index = 0;
    iterator = iterator.bind(context);
    try {
      this._each(function(value) {
        iterator(value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  },

  eachSlice: function(number, iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var index = -number, slices = [], array = this.toArray();
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  },

  all: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator(value, index);
      if (!result) throw $break;
    });
    return result;
  },

  any: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator(value, index))
        throw $break;
    });
    return result;
  },

  collect: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator(value, index));
    });
    return results;
  },

  detect: function(iterator, context) {
    iterator = iterator.bind(context);
    var result;
    this.each(function(value, index) {
      if (iterator(value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  },

  findAll: function(iterator, context) {
    iterator = iterator.bind(context);
    var results = [];
    this.each(function(value, index) {
      if (iterator(value, index))
        results.push(value);
    });
    return results;
  },

  grep: function(filter, iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(filter);

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator(value, index));
    });
    return results;
  },

  include: function(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  },

  inGroupsOf: function(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  },

  inject: function(memo, iterator, context) {
    iterator = iterator.bind(context);
    this.each(function(value, index) {
      memo = iterator(memo, value, index);
    });
    return memo;
  },

  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  },

  max: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator(value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  },

  min: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator(value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  },

  partition: function(iterator, context) {
    iterator = iterator ? iterator.bind(context) : Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator(value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  },

  pluck: function(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  },

  reject: function(iterator, context) {
    iterator = iterator.bind(context);
    var results = [];
    this.each(function(value, index) {
      if (!iterator(value, index))
        results.push(value);
    });
    return results;
  },

  sortBy: function(iterator, context) {
    iterator = iterator.bind(context);
    return this.map(function(value, index) {
      return {value: value, criteria: iterator(value, index)};
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

  toArray: function() {
    return this.map();
  },

  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  },

  size: function() {
    return this.toArray().length;
  },

  inspect: function() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
};

Object.extend(Enumerable, {
  map:     Enumerable.collect,
  find:    Enumerable.detect,
  select:  Enumerable.findAll,
  filter:  Enumerable.findAll,
  member:  Enumerable.include,
  entries: Enumerable.toArray,
  every:   Enumerable.all,
  some:    Enumerable.any
});
function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

if (Prototype.Browser.WebKit) {
  $A = function(iterable) {
    if (!iterable) return [];
    if (!(Object.isFunction(iterable) && iterable == '[object NodeList]') &&
        iterable.toArray) return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  };
}

Array.from = $A;

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse) Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  },

  clear: function() {
    this.length = 0;
    return this;
  },

  first: function() {
    return this[0];
  },

  last: function() {
    return this[this.length - 1];
  },

  compact: function() {
    return this.select(function(value) {
      return value != null;
    });
  },

  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(Object.isArray(value) ?
        value.flatten() : [value]);
    });
  },

  without: function() {
    var values = $A(arguments);
    return this.select(function(value) {
      return !values.include(value);
    });
  },

  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

  reduce: function() {
    return this.length > 1 ? this : this[0];
  },

  uniq: function(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  },

  intersect: function(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  },

  clone: function() {
    return [].concat(this);
  },

  size: function() {
    return this.length;
  },

  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  },

  toJSON: function() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }
});

// use native browser JS 1.6 implementation if available
if (Object.isFunction(Array.prototype.forEach))
  Array.prototype._each = Array.prototype.forEach;

if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item, i) {
  i || (i = 0);
  var length = this.length;
  if (i < 0) i = length + i;
  for (; i < length; i++)
    if (this[i] === item) return i;
  return -1;
};

if (!Array.prototype.lastIndexOf) Array.prototype.lastIndexOf = function(item, i) {
  i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
  var n = this.slice(0, i).reverse().indexOf(item);
  return (n < 0) ? n : i - n - 1;
};

Array.prototype.toArray = Array.prototype.clone;

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

if (Prototype.Browser.Opera){
  Array.prototype.concat = function() {
    var array = [];
    for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);
    for (var i = 0, length = arguments.length; i < length; i++) {
      if (Object.isArray(arguments[i])) {
        for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
          array.push(arguments[i][j]);
      } else {
        array.push(arguments[i]);
      }
    }
    return array;
  };
}
Object.extend(Number.prototype, {
  toColorPart: function() {
    return this.toPaddedString(2, 16);
  },

  succ: function() {
    return this + 1;
  },

  times: function(iterator) {
    $R(0, this, true).each(iterator);
    return this;
  },

  toPaddedString: function(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  },

  toJSON: function() {
    return isFinite(this) ? this.toString() : 'null';
  }
});

$w('abs round ceil floor').each(function(method){
  Number.prototype[method] = Math[method].methodize();
});
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  return {
    initialize: function(object) {
      this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
    },

    _each: function(iterator) {
      for (var key in this._object) {
        var value = this._object[key], pair = [key, value];
        pair.key = key;
        pair.value = value;
        iterator(pair);
      }
    },

    set: function(key, value) {
      return this._object[key] = value;
    },

    get: function(key) {
      return this._object[key];
    },

    unset: function(key) {
      var value = this._object[key];
      delete this._object[key];
      return value;
    },

    toObject: function() {
      return Object.clone(this._object);
    },

    keys: function() {
      return this.pluck('key');
    },

    values: function() {
      return this.pluck('value');
    },

    index: function(value) {
      var match = this.detect(function(pair) {
        return pair.value === value;
      });
      return match && match.key;
    },

    merge: function(object) {
      return this.clone().update(object);
    },

    update: function(object) {
      return new Hash(object).inject(this, function(result, pair) {
        result.set(pair.key, pair.value);
        return result;
      });
    },

    toQueryString: function() {
      return this.map(function(pair) {
        var key = encodeURIComponent(pair.key), values = pair.value;

        if (values && typeof values == 'object') {
          if (Object.isArray(values))
            return values.map(toQueryPair.curry(key)).join('&');
        }
        return toQueryPair(key, values);
      }).join('&');
    },

    inspect: function() {
      return '#<Hash:{' + this.map(function(pair) {
        return pair.map(Object.inspect).join(': ');
      }).join(', ') + '}>';
    },

    toJSON: function() {
      return Object.toJSON(this.toObject());
    },

    clone: function() {
      return new Hash(this);
    }
  }
})());

Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
Hash.from = $H;
var ObjectRange = Class.create(Enumerable, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  },

  include: function(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
});

var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
};

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});

Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});

Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      // simulate other verbs over post
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      // when GET, append parameters to URL
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    // user-defined headers
    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      // avoid memory leak in MSIE: clean up
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,
  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  // DOM level 2 ECMAScript Language Binding
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}

(function() {
  var element = this.Element;
  this.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (Prototype.Browser.IE && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(this.Element, element || { });
}).call(window);

Element.cache = { };

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    $(element).style.display = 'none';
    return element;
  },

  show: function(element) {
    $(element).style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);
    content = Object.toHTML(content);
    element.innerHTML = content.stripScripts();
    content.evalScripts.bind(content).defer();
    return element;
  },

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },

  descendants: function(element) {
    return $(element).select("*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },

  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    return Object.isNumber(expression) ? element.descendants()[expression] :
      element.select(expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },

  select: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },

  adjacent: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = element.readAttribute('id'), self = arguments.callee;
    if (id) return id;
    do { id = 'anonymous_element_' + self.counter++ } while ($(id));
    element.writeAttribute('id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return $(element).getDimensions().height;
  },

  getWidth: function(element) {
    return $(element).getDimensions().width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!element.hasClassName(className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return element[element.hasClassName(className) ?
      'removeClassName' : 'addClassName'](className);
  },

  // removes whitespace-only text node children
  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);
    var originalAncestor = ancestor;

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (element.sourceIndex && !Prototype.Browser.Opera) {
      var e = element.sourceIndex, a = ancestor.sourceIndex,
       nextAncestor = ancestor.nextSibling;
      if (!nextAncestor) {
        do { ancestor = ancestor.parentNode; }
        while (!(nextAncestor = ancestor.nextSibling) && ancestor.parentNode);
      }
      if (nextAncestor && nextAncestor.sourceIndex)
       return (e > a && e < nextAncestor.sourceIndex);
    }

    while (element = element.parentNode)
      if (element == originalAncestor) return true;
    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value) {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = $(element).getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      // Opera returns the offset relative to the positioning context, when an
      // element is position relative but top and left have not been defined
      if (window.opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'absolute') return;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    var offsets = element.positionedOffset();
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'relative') return;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      // Safari fix
      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || element.tagName == 'BODY') {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    // find page position of source
    source = $(source);
    var p = source.viewportOffset();

    // find coordinate system to use
    element = $(element);
    var delta = [0, 0];
    var parent = null;
    // delta [0,0] will do fine with position: fixed elements,
    // position:absolute needs offsetParent deltas
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = element.getOffsetParent();
      delta = parent.viewportOffset();
    }

    // correct by body offsets (fixes Safari)
    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    // set position
    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Element.Methods.identify.counter = 1;

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,
  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          // returns '0px' for hidden elements; we want it to return null
          if (!Element.visible(element)) return null;

          // returns the border-box dimensions rather than the content-box
          // dimensions, so we subtract padding and borders from the value
          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  // IE doesn't report offsets correctly for static elements, so we change them
  // to "relative" to get the values, then change them back.
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        // Trigger hasLayout on the offset parent so that IE6 reports
        // accurate offsetTop and offsetLeft values for position: fixed.
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = {
    read: {
      names: {
        'class': 'className',
        'for':   'htmlFor'
      },
      values: {
        _getAttr: function(element, attribute) {
          return element.getAttribute(attribute, 2);
        },
        _getAttrNode: function(element, attribute) {
          var node = element.getAttributeNode(attribute);
          return node ? node.value : "";
        },
        _getEv: function(element, attribute) {
          attribute = element.getAttribute(attribute);
          return attribute ? attribute.toString().slice(23, -2) : null;
        },
        _flag: function(element, attribute) {
          return $(element).hasAttribute(attribute) ? attribute : null;
        },
        style: function(element) {
          return element.style.cssText.toLowerCase();
        },
        title: function(element) {
          return element.title;
        }
      }
    }
  };

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr,
      src:         v._getAttr,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };

  // Safari returns margins on body which is incorrect if the child is absolutely
  // positioned.  For performance reasons, redefine Element#cumulativeOffset for
  // KHTML/WebKit only.
  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {
  // IE and Opera are missing .innerHTML support for TABLE-related and SELECT elements
  Element.Methods.update = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);

    content = Object.toHTML(content);
    var tagName = element.tagName.toUpperCase();

    if (tagName in Element._insertionTranslations.tags) {
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      Element._getContentFromAnonymousElement(tagName, content.stripScripts())
        .each(function(node) { element.appendChild(node) });
    }
    else element.innerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

if ('outerHTML' in document.createElement('div')) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  Object.extend(this.tags, {
    THEAD: this.tags.TBODY,
    TFOOT: this.tags.TBODY,
    TH:    this.tags.TD
  });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return node && node.specified;
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

if (!Prototype.BrowserFeatures.ElementExtensions &&
    document.createElement('div').__proto__) {
  window.HTMLElement = { };
  window.HTMLElement.prototype = document.createElement('div').__proto__;
  Prototype.BrowserFeatures.ElementExtensions = true;
}

Element.extend = (function() {
  if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
      tagName = element.tagName, property, value;

    // extend methods for specific tags
    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    for (property in methods) {
      value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      // extend methods for all tags (Safari doesn't need this)
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    window[klass] = { };
    window[klass].prototype = document.createElement(tagName).__proto__;
    return window[klass];
  }

  if (F.ElementExtensions) {
    copy(Element.Methods, HTMLElement.prototype);
    copy(Element.Methods.Simulated, HTMLElement.prototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};

document.viewport = {
  getDimensions: function() {
    var dimensions = { };
    var B = Prototype.Browser;
    $w('width height').each(function(d) {
      var D = d.capitalize();
      dimensions[d] = (B.WebKit && !document.evaluate) ? self['inner' + D] :
        (B.Opera) ? document.body['client' + D] : document.documentElement['client' + D];
    });
    return dimensions;
  },

  getWidth: function() {
    return this.getDimensions().width;
  },

  getHeight: function() {
    return this.getDimensions().height;
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
  }
};
/* Portions of the Selector class are derived from Jack Slocum’s DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();
    this.compileMatcher();
  },

  shouldUseXPath: function() {
    if (!Prototype.BrowserFeatures.XPath) return false;

    var e = this.expression;

    // Safari 3 chokes on :*-of-type and :empty
    if (Prototype.Browser.WebKit &&
     (e.include("-of-type") || e.include(":empty")))
      return false;

    // XPath can't do namespaced attributes, nor can it read
    // the "checked" property from DOM nodes
    if ((/(\[[\w-]*?:|:checked)/).test(this.expression))
      return false;

    return true;
  },

  compileMatcher: function() {
    if (this.shouldUseXPath())
      return this.compileXPathMatcher();

    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[i]) ? c[i](m) :
    	      new Template(c[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        if (m = e.match(ps[i])) {
          this.matcher.push(Object.isFunction(x[i]) ? x[i](m) :
            new Template(x[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    if (this.xpath) return document._getElementsByXPath(this.xpath, root);
    return this.matcher(root);
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          // use the Selector.assertions methods unless the selector
          // is too complex.
          if (as[i]) {
            this.tokens.push([i, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {
            // reluctantly do a document-wide search
            // and look for a match in the array
            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0 or translate(text(), ' \t\r\n', '') = '')]",
      'checked':     "[@checked]",
      'disabled':    "[@disabled]",
      'enabled':     "[not(@disabled)]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i in p) {
            if (m = e.match(p[i])) {
              v = Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: {
    // combinators must be listed first
    // (and descendant needs to be last combinator)
    laterSibling: /^\s*~\s*/,
    child:        /^\s*>\s*/,
    adjacent:     /^\s*\+\s*/,
    descendant:   /^\s/,

    // selectors follow
    tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,
    id:           /^#([\w\-\*]+)(\b|$)/,
    className:    /^\.([\w\-\*]+)(\b|$)/,
    pseudo:
/^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/,
    attrPresence: /^\[([\w]+)\]/,
    attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
  },

  // for Selector.match and Element#match
  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {
    // UTILITY FUNCTIONS
    // joins two collections
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    // marks an array of nodes for counting
    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = undefined;
      return nodes;
    },

    // mark each child node with its position (for nth calls)
    // "ofType" flag indicates whether we're indexing for nth-of-type
    // rather than nth-child
    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },

    // filters out duplicates and extends all nodes
    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (!(n = nodes[i])._countedByPrototype) {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    // COMBINATOR FUNCTIONS
    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
	      if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    // TOKEN FUNCTIONS
    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          // fastlane for ordinary descendant combinators
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;
      if (!targetNode) return [];
      if (!nodes && root == document) return [targetNode];
      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    // handles the an+b logic
    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    // handles nth(-last)-child, nth(-last)-of-type, and (first|last)-of-type
    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        // IE treats comments as element nodes
        if (node.tagName == '!' || (node.firstChild && !node.innerHTML.match(/^\s*$/))) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled) results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv.startsWith(v); },
    '$=': function(nv, v) { return nv.endsWith(v); },
    '*=': function(nv, v) { return nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + nv.toUpperCase() + '-').include('-' + v.toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    // IE returns comment nodes on getElementsByTagName("*").
    // Filter them out.
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    },

    // IE improperly serializes _countedByPrototype in (inner|outer)HTML.
    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node.removeAttribute('_countedByPrototype');
      return nodes;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}
var Form = {
  reset: function(form) {
    $(form).reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {
            // a key is already present; construct an array of values
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    return $A($(form).getElementsByTagName('*')).inject([],
      function(elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
          elements.push(Element.extend(child));
        return elements;
      }
    );
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/

Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {
  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !['button', 'reset', 'submit'].include(element.type)))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.blur();
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, index) {
    if (Object.isUndefined(index))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, value, single = !Object.isArray(index);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        value = this.optionValue(opt);
        if (single) {
          if (value == index) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = index.include(value);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    // extend element because hasAttribute may not be native
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
if (!window.Event) var Event = { };

Object.extend(Event, {
  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,

  cache: { },

  relatedTarget: function(event) {
    var element;
    switch(event.type) {
      case 'mouseover': element = event.fromElement; break;
      case 'mouseout':  element = event.toElement;   break;
      default: return null;
    }
    return Element.extend(element);
  }
});

Event.Methods = (function() {
  var isButton;

  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    isButton = function(event, code) {
      return event.button == buttonMap[code];
    };

  } else if (Prototype.Browser.WebKit) {
    isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };

  } else {
    isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  return {
    isLeftClick:   function(event) { return isButton(event, 0) },
    isMiddleClick: function(event) { return isButton(event, 1) },
    isRightClick:  function(event) { return isButton(event, 2) },

    element: function(event) {
      var node = Event.extend(event).target;
      return Element.extend(node.nodeType == Node.TEXT_NODE ? node.parentNode : node);
    },

    findElement: function(event, expression) {
      var element = Event.element(event);
      if (!expression) return element;
      var elements = [element].concat(element.ancestors());
      return Selector.findElement(elements, expression, 0);
    },

    pointer: function(event) {
      return {
        x: event.pageX || (event.clientX +
          (document.documentElement.scrollLeft || document.body.scrollLeft)),
        y: event.pageY || (event.clientY +
          (document.documentElement.scrollTop || document.body.scrollTop))
      };
    },

    pointerX: function(event) { return Event.pointer(event).x },
    pointerY: function(event) { return Event.pointer(event).y },

    stop: function(event) {
      Event.extend(event);
      event.preventDefault();
      event.stopPropagation();
      event.stopped = true;
    }
  };
})();

Event.extend = (function() {
  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE) {
    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return "[object Event]" }
    });

    return function(event) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);
      Object.extend(event, {
        target: event.srcElement,
        relatedTarget: Event.relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });
      return Object.extend(event, methods);
    };

  } else {
    Event.prototype = Event.prototype || document.createEvent("HTMLEvents").__proto__;
    Object.extend(Event.prototype, methods);
    return Prototype.K;
  }
})();

Object.extend(Event, (function() {
  var cache = Event.cache;

  function getEventID(element) {
    if (element._prototypeEventID) return element._prototypeEventID[0];
    arguments.callee.id = arguments.callee.id || 1;
    return element._prototypeEventID = [++arguments.callee.id];
  }

  function getDOMEventName(eventName) {
    if (eventName && eventName.include(':')) return "dataavailable";
    return eventName;
  }

  function getCacheForID(id) {
    return cache[id] = cache[id] || { };
  }

  function getWrappersForEventName(id, eventName) {
    var c = getCacheForID(id);
    return c[eventName] = c[eventName] || [];
  }

  function createWrapper(element, eventName, handler) {
    var id = getEventID(element);
    var c = getWrappersForEventName(id, eventName);
    if (c.pluck("handler").include(handler)) return false;

    var wrapper = function(event) {
      if (!Event || !Event.extend ||
        (event.eventName && event.eventName != eventName))
          return false;

      Event.extend(event);
      handler.call(element, event);
    };

    wrapper.handler = handler;
    c.push(wrapper);
    return wrapper;
  }

  function findWrapper(id, eventName, handler) {
    var c = getWrappersForEventName(id, eventName);
    return c.find(function(wrapper) { return wrapper.handler == handler });
  }

  function destroyWrapper(id, eventName, handler) {
    var c = getCacheForID(id);
    if (!c[eventName]) return false;
    c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
  }

  function destroyCache() {
    for (var id in cache)
      for (var eventName in cache[id])
        cache[id][eventName] = null;
  }

  if (window.attachEvent) {
    window.attachEvent("onunload", destroyCache);
  }

  return {
    observe: function(element, eventName, handler) {
      element = $(element);
      var name = getDOMEventName(eventName);

      var wrapper = createWrapper(element, eventName, handler);
      if (!wrapper) return element;

      if (element.addEventListener) {
        element.addEventListener(name, wrapper, false);
      } else {
        element.attachEvent("on" + name, wrapper);
      }

      return element;
    },

    stopObserving: function(element, eventName, handler) {
      element = $(element);
      var id = getEventID(element), name = getDOMEventName(eventName);

      if (!handler && eventName) {
        getWrappersForEventName(id, eventName).each(function(wrapper) {
          element.stopObserving(eventName, wrapper.handler);
        });
        return element;

      } else if (!eventName) {
        Object.keys(getCacheForID(id)).each(function(eventName) {
          element.stopObserving(eventName);
        });
        return element;
      }

      var wrapper = findWrapper(id, eventName, handler);
      if (!wrapper) return element;

      if (element.removeEventListener) {
        element.removeEventListener(name, wrapper, false);
      } else {
        element.detachEvent("on" + name, wrapper);
      }

      destroyWrapper(id, eventName, handler);

      return element;
    },

    fire: function(element, eventName, memo) {
      element = $(element);
      if (element == document && document.createEvent && !element.dispatchEvent)
        element = document.documentElement;

      var event;
      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent("dataavailable", true, true);
      } else {
        event = document.createEventObject();
        event.eventType = "ondataavailable";
      }

      event.eventName = eventName;
      event.memo = memo || { };

      if (document.createEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent(event.eventType, event);
      }

      return Event.extend(event);
    }
  };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
  fire:          Event.fire,
  observe:       Event.observe,
  stopObserving: Event.stopObserving
});

Object.extend(document, {
  fire:          Element.Methods.fire.methodize(),
  observe:       Element.Methods.observe.methodize(),
  stopObserving: Element.Methods.stopObserving.methodize(),
  loaded:        false
});

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards and John Resig. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearInterval(timer);
    document.fire("dom:loaded");
    document.loaded = true;
  }

  if (document.addEventListener) {
    if (Prototype.Browser.WebKit) {
      timer = window.setInterval(function() {
        if (/loaded|complete/.test(document.readyState))
          fireContentLoadedEvent();
      }, 0);

      Event.observe(window, "load", fireContentLoadedEvent);

    } else {
      document.addEventListener("DOMContentLoaded",
        fireContentLoadedEvent, false);
    }

  } else {
    document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
    $("__onDOMContentLoaded").onreadystatechange = function() {
      if (this.readyState == "complete") {
        this.onreadystatechange = null;
        fireContentLoadedEvent();
      }
    };
  }
})();
/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

// This should be moved to script.aculo.us; notice the deprecated methods
// further below, that map to the newer Element methods.
var Position = {
  // set to true if needed, warning: firefox performance problems
  // NOT neeeded for page scrolling, only if draggable contained in
  // scrollable elements
  includeScrollOffsets: false,

  // must be called before calling withinIncludingScrolloffset, every time the
  // page is scrolled
  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  // caches x/y coordinate pair to use with overlap
  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  // within must be called directly before
  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },

  // Deprecation layer -- use newer Element methods now (1.5.2).

  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

Element.addMethods();

Element.addMethods({
	lazyload: function(element, options)
	{
		function $restore()
		{
			// this function restores the original image source; called when above the fold
			if ( true === $(element).hasAttribute('_src') )
			{
				$(element).writeAttribute({ src: $(element).readAttribute('_src') });
			}
		}
		function $scroll()
		{
			// this function returns the amount the page is scrolled vertically
			var scroll_y = self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
			return parseInt(scroll_y);
		}
		function $height()
		{
			// this function returns the height of the viewport
			var window_height = window.innerHeight || document.documentElement.clientHeight;
			return parseInt(window_height);
		}
		var element     = $(element);
		var options     = Object.extend({
			threshold   : 0,
			placeholder : '/images/js/loading3.gif',
			event       : 'scroll',
			frequency   : 0.1
		}, options || {});

		var offset      = $(element).cumulativeOffset()[1];
		var activate_on = (offset - options.threshold) - $height();

		var old_source  = $(element).readAttribute('src');
		var new_source  = options.placeholder;

		$(element)
			.writeAttribute({ src :  new_source })
			.writeAttribute({ '_src' :  old_source });
		
		if ( 'scroll' === options.event )
		{
			new PeriodicalExecuter(function($executor)
			{
				if ( activate_on <= $scroll() )
				{
					$restore(); $executor.stop();
				}
			}, options.frequency);
		}
		else
		{
			$(element).observe(options.event, function(event)
			{
				$restore(); $(element).stopObserving();
			});
		}

		return $(element);
	}
});


var IMA_PATH = 'http://static.sg.9wee.com/';function isTrue(v)
{
		return (v==true 
			|| ("number"==typeof(v) && 0!=v) 
			|| ("string"==typeof(v) && ""!=v  && "0"!=v && "off"!=v && "no"!=v) 
			|| ("object"==typeof(v) && null!=v && {}!=v && []!=v) 
			);
}

function intVal(v)
{
	v = parseInt(v);

	if (isNaN(v))
	{
		v = 0;
	}

	return v;
}

function isSet(o)
{
	return 'undefined' != typeof(o) ? true : false;
}


function pause(numberMillis)
{
	var now = new Date();
	var exitTime = now.getTime() + numberMillis;
	while (true)
	{
		now = new Date();
		if (now.getTime() > exitTime)
		{
			return;
		}
	}
}


function  request(name)
{
	var  reg = new RegExp( "(^|&)"+ name +"=([^&]*)(&|$)" );
	var r = window .location.search. substr(1).match (reg);
	if (r!= null) return decodeURIComponent(r [2]); return null;
}


function getPageSize()
{
	
	var xScroll, yScroll;
	
	if (window.innerHeight && window.scrollMaxY)
	{	
		xScroll = document.body.scrollWidth;
		yScroll = window.innerHeight + window.scrollMaxY;
	}
	else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	}
	else
	{ // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}
	
	var windowWidth, windowHeight;
	if (self.innerHeight)
	{	// all except Explorer
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} 
	else if(document.documentElement && document.documentElement.clientHeight)
	{ // Explorer 6 Strict Mode
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	}
	else if (document.body)
	{ // other Explorers
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}	
	
	// for small pages with total height less then height of the viewport
	if(yScroll < windowHeight)
	{
		pageHeight = windowHeight;
	} 
	else
	{ 
		pageHeight = yScroll;
	}

	// for small pages with total width less then width of the viewport
	if(xScroll < windowWidth)
	{	
		pageWidth = windowWidth;
	} 
	else
	{
		pageWidth = xScroll;
	}


	arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight) 
	return arrayPageSize;
}




/**
 *	清除一下个拉框中的选项
 */
function clearOption(obj)
{
	obj.options.length =0;
	return true;

	var	l =	obj.options.length;

	for	(i=0;	i<l; i++)
	{
		obj.options.remove(0); 
	}
}

/**
 * 填充一下下拉框中的选项,data的格式为
 * 		var	data={
 * 			0:{v:'101', t:'天富', s:true},
 * 			1:{v:'102', t:'富民'}
 * 			}
 */
function addOptions(obj, data, v, type)
{
	var	rows = data;
	var len = rows.length;

	for	(i=0; i<len; i++)
	{
		var l = obj.options.length;
		obj.options[l]	= new Option(rows[i]['t'], rows[i]['v']);
	}

	if (isSet(v))
	{
		obj.value = v;
	}
	return true;
}

/**
 *添加一个option
 */
function addOption(obj, t, v)
{
	obj.options[obj.options.length]	= new Option(t, v);
}

/**
 * 下拉框中的数据更改时，把下拉框中的文本赋给另一控件
 */
function doSelectChange(objSel, objSetName)
{
	if(arguments.length > 2)
	{
		return arguments[2](objSel, objSetName);
	}

	if (isTrue(objSel.value))
	{
		var	t	=objSel.options[objSel.selectedIndex].text ;
	}
	else
	{
		t = '';
	}

	$(objSetName).value	= t ;
	
}



function resizeBodyText (size, id)
{
	var  nW  = $(size).offsetWidth;
	mod  = nW;

	// 40 seems to work well, but adjust this value for yourself.
	mod = Math . round(mod /50);

	var obj =  $(id);

	//limit how small the typeface can get
	if ( mod < 9 ) mod  = 9;

	obj. style.fontSize  = mod +"px";
	obj. style.lineHeight  = (mod *1.3)+"px" ;

}

function resizeColumn (nH, nW, id)
{
	// bug in IE 6 with the window height, only using width for now
	var mod  = (nW <  nH) ?  nW : nH ;
	mod  = nW;

	// this controls the level of the scale
	var multi  = 50;

	// sloppy math in here, i'm tired
	mod =  Math.round(mod/ multi );
	mod =  mod* multi;

	var col = $(id);
	//	col.style.width = (mod /2.3 ) + "px";
	//	col.style.left  =  i*(mod/2.3 ) + "px";
	//	resizeBodyText (size, id)
	col.style.fontSize = ( mod/multi) + "px" ;
	col.style.lineHeight = ((mod/multi) * 1.3) + "px" ;

	imgs = col.getElementsByTagName("img")
	for (var  x = 0; x  < imgs.length;  x++)
	{
		imgs[x].style.width =(mod/2.3)+ "px" ;
		//imgs[x].style.width =(mod/2.6)+ "px" ;
		//imgs[x].style.margin =(( mod/2.3)-( mod/ 2.6))/2.3 +"px" ;
	}   
}

function  resize(size, id)
{
	//resizeBodyText(size, id);
	var nH  =  $(size).offsetHeight - 80;

	// get window width
	var nW  = $(size).offsetWidth ;

	resizeColumn(nH, nW, id);
}


function keyDigits(ev)
{
	var elt = Event.element(ev);
		elt.value = formatDigits(elt.value);
}

function formatDigits(v)
{
		return v.replace(/[^\d]/g, '');
}


//读取cookie：
function readCookie(name) 
{ 
    var cookieValue = ""; 
    var search = name + "="; 
    if(document.cookie.length > 0) 
    { 
        offset = document.cookie.indexOf(search); 
        if (offset != -1) 
        { 
            offset += search.length; 
            end = document.cookie.indexOf(";", offset);

            if (end == -1)
            {
                end = document.cookie.length;
            }

            cookieValue = decodeURIComponent(document.cookie.substring(offset, end)) 
        } 
    } 
    return cookieValue; 
}


//写入cookie：
function writeCookie(name, value, hours) 
{ 
    var expire = ""; 
    if(hours != null) 
    { 
        expire = new Date((new Date()).getTime() + hours * 3600000); 
        expire = "; expires=" + expire.toGMTString(); 
    } 
    document.cookie = name + "=" + encodeURIComponent(value) + expire; 
} 


String.prototype.trim = function()
{
	return this.replace(/(^\s*)|(\s*$)/g, "");
}


function setCookie(name, value, hours, path, domain) 
{ 
	var expire = ""; 
	if(hours != null) 
	{ 
		expire = new Date((new Date()).getTime() + hours * 3600000); 
		expire = "; expires=" + expire.toGMTString(); 
	} 

	document.cookie = name + "=" + encodeURIComponent(value) + expire + ((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : ""); 
} 


Date.prototype.toStr = function() {
  return '' + this.getFullYear() + '-' +
    (this.getMonth() + 1).toPaddedString(2) + '-' +
    this.getDate().toPaddedString(2) + ' ' +
    this.getHours().toPaddedString(2) + ':' +
    this.getMinutes().toPaddedString(2) + ':' +
    this.getSeconds().toPaddedString(2) + '';
};

var JsLoad=function(){var pending=null;var queue=[];return{load:function(urls,callback,obj,scope){var request={urls:urls,callback:callback,obj:obj,scope:scope};if(pending){queue.push(request);return;}
pending=request;urls=urls.constructor===Array?urls:[urls];var script;for(var i=0;i<urls.length;i+=1){script=document.createElement('script');script.src=urls[i];document.body.appendChild(script);}
if(!script){return;}
if((/msie/i).test(navigator.userAgent)&&!(/AppleWebKit\/([^ ]*)/).test(navigator.userAgent)&&!(/opera/i).test(navigator.userAgent)){script.onreadystatechange=function(){if(this.readyState==='loaded'){JsLoad.requestComplete();}};}else{script=document.createElement('script');script.appendChild(document.createTextNode('JsLoad.requestComplete();'));document.body.appendChild(script);}},loadOnce:function(urls,callback,obj,scope,force){var newUrls=[],scripts=document.getElementsByTagName('script');urls=urls.constructor===Array?urls:[urls];for(var i=0;i<urls.length;i+=1){var loaded=false,url=urls[i];for(var j=0;j<scripts.length;j+=1){if(url===scripts[j].src){loaded=true;break;}}
if(!loaded){newUrls.push(url);}}
if(newUrls.length>0){this.load(newUrls,callback,obj,scope);}else if(force){if(obj){if(scope){callback.call(obj);}else{callback.call(window,obj);}}else{callback.call();}}},requestComplete:function(){if(pending.callback){if(pending.obj){if(pending.scope){pending.callback.call(pending.obj);}else{pending.callback.call(window,pending.obj);}}else{pending.callback.call();}}
pending=null;if(queue.length>0){var request=queue.shift();this.load(request.urls,request.callback,request.obj,request.scope);}}};}();
var Builder = {
  NODEMAP: {
    AREA: 'map',
    CAPTION: 'table',
    COL: 'table',
    COLGROUP: 'table',
    LEGEND: 'fieldset',
    OPTGROUP: 'select',
    OPTION: 'select',
    PARAM: 'object',
    TBODY: 'table',
    TD: 'table',
    TFOOT: 'table',
    TH: 'table',
    THEAD: 'table',
    TR: 'table'
  },
  // note: For Firefox < 1.5, OPTION and OPTGROUP tags are currently broken,
  //       due to a Firefox bug
  node: function(elementName) {
    elementName = elementName.toUpperCase();
    
    // try innerHTML approach
    var parentTag = this.NODEMAP[elementName] || 'div';
    var parentElement = document.createElement(parentTag);
    try { // prevent IE "feature": http://dev.rubyonrails.org/ticket/2707
      parentElement.innerHTML = "<" + elementName + "></" + elementName + ">";
    } catch(e) {}
    var element = parentElement.firstChild || null;
      
    // see if browser added wrapping tags
    if(element && (element.tagName.toUpperCase() != elementName))
      element = element.getElementsByTagName(elementName)[0];
    
    // fallback to createElement approach
    if(!element) element = document.createElement(elementName);
    
    // abort if nothing could be created
    if(!element) return;

    // attributes (or text)
    if(arguments[1])
      if(this._isStringOrNumber(arguments[1]) ||
        (arguments[1] instanceof Array) ||
        arguments[1].tagName) {
          this._children(element, arguments[1]);
        } else {
          var attrs = this._attributes(arguments[1]);
          if(attrs.length) {
            try { // prevent IE "feature": http://dev.rubyonrails.org/ticket/2707
              parentElement.innerHTML = "<" +elementName + " " +
                attrs + "></" + elementName + ">";
            } catch(e) {}
            element = parentElement.firstChild || null;
            // workaround firefox 1.0.X bug
            if(!element) {
              element = document.createElement(elementName);
              for(attr in arguments[1]) 
                element[attr == 'class' ? 'className' : attr] = arguments[1][attr];
            }
            if(element.tagName.toUpperCase() != elementName)
              element = parentElement.getElementsByTagName(elementName)[0];
          }
        } 

    // text, or array of children
    if(arguments[2])
      this._children(element, arguments[2]);

     return element;
  },
  _text: function(text) {
     return document.createTextNode(text);
  },

  ATTR_MAP: {
    'className': 'class',
    'htmlFor': 'for'
  },

  _attributes: function(attributes) {
    var attrs = [];
    for(attribute in attributes)
      attrs.push((attribute in this.ATTR_MAP ? this.ATTR_MAP[attribute] : attribute) +
          '="' + attributes[attribute].toString().escapeHTML().gsub(/"/,'&quot;') + '"');
    return attrs.join(" ");
  },
  _children: function(element, children) {
    if(children.tagName) {
      element.appendChild(children);
      return;
    }
    if(typeof children=='object') { // array can hold nodes and text
      children.flatten().each( function(e) {
        if(typeof e=='object')
          element.appendChild(e);
        else
          if(Builder._isStringOrNumber(e))
            element.appendChild(Builder._text(e));
      });
    } else
      if(Builder._isStringOrNumber(children))
        element.appendChild(Builder._text(children));
  },
  _isStringOrNumber: function(param) {
    return(typeof param=='string' || typeof param=='number');
  },
  build: function(html) {
    var element = this.node('div');
    $(element).update(html.strip());
    return element.down();
  },
  dump: function(scope) { 
    if(typeof scope != 'object' && typeof scope != 'function') scope = window; //global scope 
  
    var tags = ("A ABBR ACRONYM ADDRESS APPLET AREA B BASE BASEFONT BDO BIG BLOCKQUOTE BODY " +
      "BR BUTTON CAPTION CENTER CITE CODE COL COLGROUP DD DEL DFN DIR DIV DL DT EM FIELDSET " +
      "FONT FORM FRAME FRAMESET H1 H2 H3 H4 H5 H6 HEAD HR HTML I IFRAME IMG INPUT INS ISINDEX "+
      "KBD LABEL LEGEND LI LINK MAP MENU META NOFRAMES NOSCRIPT OBJECT OL OPTGROUP OPTION P "+
      "PARAM PRE Q S SAMP SCRIPT SELECT SMALL SPAN STRIKE STRONG STYLE SUB SUP TABLE TBODY TD "+
      "TEXTAREA TFOOT TH THEAD TITLE TR TT U UL VAR").split(/\s+/);
  
    tags.each( function(tag){ 
      scope[tag] = function() { 
        return Builder.node.apply(Builder, [tag].concat($A(arguments)));  
      };
    });
  }
};
 
String.prototype.parseColor = function() {  
  var color = '#';
  if (this.slice(0,4) == 'rgb(') {  
    var cols = this.slice(4,this.length-1).split(',');  
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);  
  } else {  
    if (this.slice(0,1) == '#') {  
      if (this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();  
      if (this.length==7) color = this.toLowerCase();  
    }  
  }  
  return (color.length==7 ? color : (arguments[0] || this));  
};

/*--------------------------------------------------------------------------*/

Element.collectTextNodes = function(element) {  
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue : 
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};

Element.collectTextNodesIgnoreClass = function(element, className) {  
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue : 
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ? 
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};

Element.setContentZoom = function(element, percent) {
  element = $(element);  
  element.setStyle({fontSize: (percent/100) + 'em'});   
  if (Prototype.Browser.WebKit) window.scrollBy(0,0);
  return element;
};

Element.getInlineOpacity = function(element){
  return $(element).style.opacity || '';
};

Element.forceRerendering = function(element) {
  try {
    element = $(element);
    var n = document.createTextNode(' ');
    element.appendChild(n);
    element.removeChild(n);
  } catch(e) { }
};

/*--------------------------------------------------------------------------*/

var Effect = {
  _elementDoesNotExistError: {
    name: 'ElementDoesNotExistError',
    message: 'The specified DOM element does not exist, but is required for this effect to operate'
  },
  Transitions: {
    linear: Prototype.K,
    sinoidal: function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
      return 1-pos;
    },
    flicker: function(pos) {
      var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
      return pos > 1 ? 1 : pos;
    },
    wobble: function(pos) {
      return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
    },
    pulse: function(pos, pulses) { 
      return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
    },
    spring: function(pos) { 
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },
    none: function(pos) {
      return 0;
    },
    full: function(pos) {
      return 1;
    }
  },
  DefaultOptions: {
    duration:   1.0,   // seconds
    fps:        100,   // 100= assume 66fps max.
    sync:       false, // true for combining
    from:       0.0,
    to:         1.0,
    delay:      0.0,
    queue:      'parallel'
  },
  tagifyText: function(element) {
    var tagifyStyle = 'position:relative';
    if (Prototype.Browser.IE) tagifyStyle += ';zoom:1';
    
    element = $(element);
    $A(element.childNodes).each( function(child) {
      if (child.nodeType==3) {
        child.nodeValue.toArray().each( function(character) {
          element.insertBefore(
            new Element('span', {style: tagifyStyle}).update(
              character == ' ' ? String.fromCharCode(160) : character), 
              child);
        });
        Element.remove(child);
      }
    });
  },
  multiple: function(element, effect) {
    var elements;
    if (((typeof element == 'object') || 
        Object.isFunction(element)) && 
       (element.length))
      elements = element;
    else
      elements = $(element).childNodes;
      
    var options = Object.extend({
      speed: 0.1,
      delay: 0.0
    }, arguments[2] || { });
    var masterDelay = options.delay;

    $A(elements).each( function(element, index) {
      new effect(element, Object.extend(options, { delay: index * options.speed + masterDelay }));
    });
  },
  PAIRS: {
    'slide':  ['SlideDown','SlideUp'],
    'blind':  ['BlindDown','BlindUp'],
    'appear': ['Appear','Fade']
  },
  toggle: function(element, effect) {
    element = $(element);
    effect = (effect || 'appear').toLowerCase();
    var options = Object.extend({
      queue: { position:'end', scope:(element.id || 'global'), limit: 1 }
    }, arguments[2] || { });
    Effect[element.visible() ? 
      Effect.PAIRS[effect][1] : Effect.PAIRS[effect][0]](element, options);
  }
};

Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;

/* ------------- core effects ------------- */

Effect.ScopedQueue = Class.create(Enumerable, {
  initialize: function() {
    this.effects  = [];
    this.interval = null;    
  },
  _each: function(iterator) {
    this.effects._each(iterator);
  },
  add: function(effect) {
    var timestamp = new Date().getTime();
    
    var position = Object.isString(effect.options.queue) ? 
      effect.options.queue : effect.options.queue.position;
    
    switch(position) {
      case 'front':
        // move unstarted effects after this effect  
        this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
            e.startOn  += effect.finishOn;
            e.finishOn += effect.finishOn;
          });
        break;
      case 'with-last':
        timestamp = this.effects.pluck('startOn').max() || timestamp;
        break;
      case 'end':
        // start effect after last queued effect has finished
        timestamp = this.effects.pluck('finishOn').max() || timestamp;
        break;
    }
    
    effect.startOn  += timestamp;
    effect.finishOn += timestamp;

    if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
      this.effects.push(effect);
    
    if (!this.interval)
      this.interval = setInterval(this.loop.bind(this), 15);
  },
  remove: function(effect) {
    this.effects = this.effects.reject(function(e) { return e==effect });
    if (this.effects.length == 0) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  loop: function() {
    var timePos = new Date().getTime();
    for(var i=0, len=this.effects.length;i<len;i++) 
      this.effects[i] && this.effects[i].loop(timePos);
  }
});

Effect.Queues = {
  instances: $H(),
  get: function(queueName) {
    if (!Object.isString(queueName)) return queueName;
    
    return this.instances.get(queueName) ||
      this.instances.set(queueName, new Effect.ScopedQueue());
  }
};
Effect.Queue = Effect.Queues.get('global');

Effect.Base = Class.create({
  position: null,
  start: function(options) {
    function codeForEvent(options,eventName){
      return (
        (options[eventName+'Internal'] ? 'this.options.'+eventName+'Internal(this);' : '') +
        (options[eventName] ? 'this.options.'+eventName+'(this);' : '')
      );
    }
    if (options && options.transition === false) options.transition = Effect.Transitions.linear;
    this.options      = Object.extend(Object.extend({ },Effect.DefaultOptions), options || { });
    this.currentFrame = 0;
    this.state        = 'idle';
    this.startOn      = this.options.delay*1000;
    this.finishOn     = this.startOn+(this.options.duration*1000);
    this.fromToDelta  = this.options.to-this.options.from;
    this.totalTime    = this.finishOn-this.startOn;
    this.totalFrames  = this.options.fps*this.options.duration;
    
    eval('this.render = function(pos){ '+
      'if (this.state=="idle"){this.state="running";'+
      codeForEvent(this.options,'beforeSetup')+
      (this.setup ? 'this.setup();':'')+ 
      codeForEvent(this.options,'afterSetup')+
      '};if (this.state=="running"){'+
      'pos=this.options.transition(pos)*'+this.fromToDelta+'+'+this.options.from+';'+
      'this.position=pos;'+
      codeForEvent(this.options,'beforeUpdate')+
      (this.update ? 'this.update(pos);':'')+
      codeForEvent(this.options,'afterUpdate')+
      '}}');
    
    this.event('beforeStart');
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ? 
        'global' : this.options.queue.scope).add(this);
  },
  loop: function(timePos) {
    if (timePos >= this.startOn) {
      if (timePos >= this.finishOn) {
        this.render(1.0);
        this.cancel();
        this.event('beforeFinish');
        if (this.finish) this.finish(); 
        this.event('afterFinish');
        return;  
      }
      var pos   = (timePos - this.startOn) / this.totalTime,
          frame = (pos * this.totalFrames).round();
      if (frame > this.currentFrame) {
        this.render(pos);
        this.currentFrame = frame;
      }
    }
  },
  cancel: function() {
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ? 
        'global' : this.options.queue.scope).remove(this);
    this.state = 'finished';
  },
  event: function(eventName) {
    if (this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);
    if (this.options[eventName]) this.options[eventName](this);
  },
  inspect: function() {
    var data = $H();
    for(property in this)
      if (!Object.isFunction(this[property])) data.set(property, this[property]);
    return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
  }
});

Effect.Parallel = Class.create(Effect.Base, {
  initialize: function(effects) {
    this.effects = effects || [];
    this.start(arguments[1]);
  },
  update: function(position) {
    this.effects.invoke('render', position);
  },
  finish: function(position) {
    this.effects.each( function(effect) {
      effect.render(1.0);
      effect.cancel();
      effect.event('beforeFinish');
      if (effect.finish) effect.finish(position);
      effect.event('afterFinish');
    });
  }
});

Effect.Tween = Class.create(Effect.Base, {
  initialize: function(object, from, to) {
    object = Object.isString(object) ? $(object) : object;
    var args = $A(arguments), method = args.last(), 
      options = args.length == 5 ? args[3] : null;
    this.method = Object.isFunction(method) ? method.bind(object) :
      Object.isFunction(object[method]) ? object[method].bind(object) : 
      function(value) { object[method] = value };
    this.start(Object.extend({ from: from, to: to }, options || { }));
  },
  update: function(position) {
    this.method(position);
  }
});

Effect.Event = Class.create(Effect.Base, {
  initialize: function() {
    this.start(Object.extend({ duration: 0 }, arguments[0] || { }));
  },
  update: Prototype.emptyFunction
});

Effect.Opacity = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    // make this work on IE on elements without 'layout'
    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
      this.element.setStyle({zoom: 1});
    var options = Object.extend({
      from: this.element.getOpacity() || 0.0,
      to:   1.0
    }, arguments[1] || { });
    this.start(options);
  },
  update: function(position) {
    this.element.setOpacity(position);
  }
});

Effect.Move = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'relative'
    }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    this.element.makePositioned();
    this.originalLeft = parseFloat(this.element.getStyle('left') || '0');
    this.originalTop  = parseFloat(this.element.getStyle('top')  || '0');
    if (this.options.mode == 'absolute') {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop;
    }
  },
  update: function(position) {
    this.element.setStyle({
      left: (this.options.x  * position + this.originalLeft).round() + 'px',
      top:  (this.options.y  * position + this.originalTop).round()  + 'px'
    });
  }
});

// for backwards compatibility
Effect.MoveBy = function(element, toTop, toLeft) {
  return new Effect.Move(element, 
    Object.extend({ x: toLeft, y: toTop }, arguments[3] || { }));
};

Effect.Scale = Class.create(Effect.Base, {
  initialize: function(element, percent) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      scaleX: true,
      scaleY: true,
      scaleContent: true,
      scaleFromCenter: false,
      scaleMode: 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom: 100.0,
      scaleTo:   percent
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle('position');
    
    this.originalStyle = { };
    ['top','left','width','height','fontSize'].each( function(k) {
      this.originalStyle[k] = this.element.style[k];
    }.bind(this));
      
    this.originalTop  = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;
    
    var fontSize = this.element.getStyle('font-size') || '100%';
    ['em','px','%','pt'].each( function(fontSizeType) {
      if (fontSize.indexOf(fontSizeType)>0) {
        this.fontSize     = parseFloat(fontSize);
        this.fontSizeType = fontSizeType;
      }
    }.bind(this));
    
    this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;
    
    this.dims = null;
    if (this.options.scaleMode=='box')
      this.dims = [this.element.offsetHeight, this.element.offsetWidth];
    if (/^content/.test(this.options.scaleMode))
      this.dims = [this.element.scrollHeight, this.element.scrollWidth];
    if (!this.dims)
      this.dims = [this.options.scaleMode.originalHeight,
                   this.options.scaleMode.originalWidth];
  },
  update: function(position) {
    var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);
    if (this.options.scaleContent && this.fontSize)
      this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType });
    this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
  },
  finish: function(position) {
    if (this.restoreAfterFinish) this.element.setStyle(this.originalStyle);
  },
  setDimensions: function(height, width) {
    var d = { };
    if (this.options.scaleX) d.width = width.round() + 'px';
    if (this.options.scaleY) d.height = height.round() + 'px';
    if (this.options.scaleFromCenter) {
      var topd  = (height - this.dims[0])/2;
      var leftd = (width  - this.dims[1])/2;
      if (this.elementPositioning == 'absolute') {
        if (this.options.scaleY) d.top = this.originalTop-topd + 'px';
        if (this.options.scaleX) d.left = this.originalLeft-leftd + 'px';
      } else {
        if (this.options.scaleY) d.top = -topd + 'px';
        if (this.options.scaleX) d.left = -leftd + 'px';
      }
    }
    this.element.setStyle(d);
  }
});

Effect.Highlight = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    // Prevent executing on elements not in the layout flow
    if (this.element.getStyle('display')=='none') { this.cancel(); return; }
    // Disable background image during the effect
    this.oldStyle = { };
    if (!this.options.keepBackgroundImage) {
      this.oldStyle.backgroundImage = this.element.getStyle('background-image');
      this.element.setStyle({backgroundImage: 'none'});
    }
    if (!this.options.endcolor)
      this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');
    if (!this.options.restorecolor)
      this.options.restorecolor = this.element.getStyle('background-color');
    // init color calculations
    this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));
    this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));
  },
  update: function(position) {
    this.element.setStyle({backgroundColor: $R(0,2).inject('#',function(m,v,i){
      return m+((this._base[i]+(this._delta[i]*position)).round().toColorPart()); }.bind(this)) });
  },
  finish: function() {
    this.element.setStyle(Object.extend(this.oldStyle, {
      backgroundColor: this.options.restorecolor
    }));
  }
});

Effect.ScrollTo = function(element) {
  var options = arguments[1] || { },
  scrollOffsets = document.viewport.getScrollOffsets(),
  elementOffsets = $(element).cumulativeOffset();

  if (options.offset) elementOffsets[1] += options.offset;

  return new Effect.Tween(null,
    scrollOffsets.top,
    elementOffsets[1],
    options,
    function(p){ scrollTo(scrollOffsets.left, p.round()) }
  );
};

/* ------------- combination effects ------------- */

Effect.Fade = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  var options = Object.extend({
    from: element.getOpacity() || 1.0,
    to:   0.0,
    afterFinishInternal: function(effect) { 
      if (effect.options.to!=0) return;
      effect.element.hide().setStyle({opacity: oldOpacity}); 
    }
  }, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Appear = function(element) {
  element = $(element);
  var options = Object.extend({
  from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0),
  to:   1.0,
  // force Safari to render floated elements properly
  afterFinishInternal: function(effect) {
    effect.element.forceRerendering();
  },
  beforeSetup: function(effect) {
    effect.element.setOpacity(effect.options.from).show(); 
  }}, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Puff = function(element) {
  element = $(element);
  var oldStyle = { 
    opacity: element.getInlineOpacity(), 
    position: element.getStyle('position'),
    top:  element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height
  };
  return new Effect.Parallel(
   [ new Effect.Scale(element, 200, 
      { sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true }), 
     new Effect.Opacity(element, { sync: true, to: 0.0 } ) ], 
     Object.extend({ duration: 1.0, 
      beforeSetupInternal: function(effect) {
        Position.absolutize(effect.effects[0].element)
      },
      afterFinishInternal: function(effect) {
         effect.effects[0].element.hide().setStyle(oldStyle); }
     }, arguments[1] || { })
   );
};

Effect.BlindUp = function(element) {
  element = $(element);
  element.makeClipping();
  return new Effect.Scale(element, 0,
    Object.extend({ scaleContent: false, 
      scaleX: false, 
      restoreAfterFinish: true,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping();
      } 
    }, arguments[1] || { })
  );
};

Effect.BlindDown = function(element) {
  element = $(element);
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({ 
    scaleContent: false, 
    scaleX: false,
    scaleFrom: 0,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makeClipping().setStyle({height: '0px'}).show(); 
    },  
    afterFinishInternal: function(effect) {
      effect.element.undoClipping();
    }
  }, arguments[1] || { }));
};

Effect.SwitchOff = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  return new Effect.Appear(element, Object.extend({
    duration: 0.4,
    from: 0,
    transition: Effect.Transitions.flicker,
    afterFinishInternal: function(effect) {
      new Effect.Scale(effect.element, 1, { 
        duration: 0.3, scaleFromCenter: true,
        scaleX: false, scaleContent: false, restoreAfterFinish: true,
        beforeSetup: function(effect) { 
          effect.element.makePositioned().makeClipping();
        },
        afterFinishInternal: function(effect) {
          effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
        }
      })
    }
  }, arguments[1] || { }));
};

Effect.DropOut = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left'),
    opacity: element.getInlineOpacity() };
  return new Effect.Parallel(
    [ new Effect.Move(element, {x: 0, y: 100, sync: true }), 
      new Effect.Opacity(element, { sync: true, to: 0.0 }) ],
    Object.extend(
      { duration: 0.5,
        beforeSetup: function(effect) {
          effect.effects[0].element.makePositioned(); 
        },
        afterFinishInternal: function(effect) {
          effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);
        } 
      }, arguments[1] || { }));
};

Effect.Shake = function(element) {
  element = $(element);
  var options = Object.extend({
    distance: 20,
    duration: 0.5
  }, arguments[1] || {});
  var distance = parseFloat(options.distance);
  var split = parseFloat(options.duration) / 10.0;
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left') };
    return new Effect.Move(element,
      { x:  distance, y: 0, duration: split, afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance, y: 0, duration: split, afterFinishInternal: function(effect) {
        effect.element.undoPositioned().setStyle(oldStyle);
  }}) }}) }}) }}) }}) }});
};

Effect.SlideDown = function(element) {
  element = $(element).cleanWhitespace();
  // SlideDown need to have the content of the element wrapped in a container element with fixed height!
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({ 
    scaleContent: false, 
    scaleX: false, 
    scaleFrom: window.opera ? 0 : 1,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().setStyle({height: '0px'}).show(); 
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' }); 
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); }
    }, arguments[1] || { })
  );
};

Effect.SlideUp = function(element) {
  element = $(element).cleanWhitespace();
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, window.opera ? 0 : 1,
   Object.extend({ scaleContent: false, 
    scaleX: false, 
    scaleMode: 'box',
    scaleFrom: 100,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().show();
    },  
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }
   }, arguments[1] || { })
  );
};

// Bug in opera makes the TD containing this element expand for a instance after finish 
Effect.Squish = function(element) {
  return new Effect.Scale(element, window.opera ? 1 : 0, { 
    restoreAfterFinish: true,
    beforeSetup: function(effect) {
      effect.element.makeClipping(); 
    },  
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping(); 
    }
  });
};

Effect.Grow = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.full
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();    
  var initialMoveX, initialMoveY;
  var moveX, moveY;
  
  switch (options.direction) {
    case 'top-left':
      initialMoveX = initialMoveY = moveX = moveY = 0; 
      break;
    case 'top-right':
      initialMoveX = dims.width;
      initialMoveY = moveY = 0;
      moveX = -dims.width;
      break;
    case 'bottom-left':
      initialMoveX = moveX = 0;
      initialMoveY = dims.height;
      moveY = -dims.height;
      break;
    case 'bottom-right':
      initialMoveX = dims.width;
      initialMoveY = dims.height;
      moveX = -dims.width;
      moveY = -dims.height;
      break;
    case 'center':
      initialMoveX = dims.width / 2;
      initialMoveY = dims.height / 2;
      moveX = -dims.width / 2;
      moveY = -dims.height / 2;
      break;
  }
  
  return new Effect.Move(element, {
    x: initialMoveX,
    y: initialMoveY,
    duration: 0.01, 
    beforeSetup: function(effect) {
      effect.element.hide().makeClipping().makePositioned();
    },
    afterFinishInternal: function(effect) {
      new Effect.Parallel(
        [ new Effect.Opacity(effect.element, { sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition }),
          new Effect.Move(effect.element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition }),
          new Effect.Scale(effect.element, 100, {
            scaleMode: { originalHeight: dims.height, originalWidth: dims.width }, 
            sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})
        ], Object.extend({
             beforeSetup: function(effect) {
               effect.effects[0].element.setStyle({height: '0px'}).show(); 
             },
             afterFinishInternal: function(effect) {
               effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle); 
             }
           }, options)
      )
    }
  });
};

Effect.Shrink = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.none
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var moveX, moveY;
  
  switch (options.direction) {
    case 'top-left':
      moveX = moveY = 0;
      break;
    case 'top-right':
      moveX = dims.width;
      moveY = 0;
      break;
    case 'bottom-left':
      moveX = 0;
      moveY = dims.height;
      break;
    case 'bottom-right':
      moveX = dims.width;
      moveY = dims.height;
      break;
    case 'center':  
      moveX = dims.width / 2;
      moveY = dims.height / 2;
      break;
  }
  
  return new Effect.Parallel(
    [ new Effect.Opacity(element, { sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition }),
      new Effect.Scale(element, window.opera ? 1 : 0, { sync: true, transition: options.scaleTransition, restoreAfterFinish: true}),
      new Effect.Move(element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition })
    ], Object.extend({            
         beforeStartInternal: function(effect) {
           effect.effects[0].element.makePositioned().makeClipping(); 
         },
         afterFinishInternal: function(effect) {
           effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle); }
       }, options)
  );
};

Effect.Pulsate = function(element) {
  element = $(element);
  var options    = arguments[1] || { },
    oldOpacity = element.getInlineOpacity(),
    transition = options.transition || Effect.Transitions.linear,
    reverser   = function(pos){ 
      return 1 - transition((-Math.cos((pos*(options.pulses||5)*2)*Math.PI)/2) + .5);
    };
    
  return new Effect.Opacity(element, 
    Object.extend(Object.extend({  duration: 2.0, from: 0,
      afterFinishInternal: function(effect) { effect.element.setStyle({opacity: oldOpacity}); }
    }, options), {transition: reverser}));
};

Effect.Fold = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height };
  element.makeClipping();
  return new Effect.Scale(element, 5, Object.extend({   
    scaleContent: false,
    scaleX: false,
    afterFinishInternal: function(effect) {
    new Effect.Scale(element, 1, { 
      scaleContent: false, 
      scaleY: false,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping().setStyle(oldStyle);
      } });
  }}, arguments[1] || { }));
};

Effect.Morph = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      style: { }
    }, arguments[1] || { });
    
    if (!Object.isString(options.style)) this.style = $H(options.style);
    else {
      if (options.style.include(':'))
        this.style = options.style.parseStyle();
      else {
        this.element.addClassName(options.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(options.style);
        var css = this.element.getStyles();
        this.style = this.style.reject(function(style) {
          return style.value == css[style.key];
        });
        options.afterFinishInternal = function(effect) {
          effect.element.addClassName(effect.options.style);
          effect.transforms.each(function(transform) {
            effect.element.style[transform.style] = '';
          });
        };
      }
    }
    this.start(options);
  },
  
  setup: function(){
    function parseColor(color){
      if (!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';
      color = color.parseColor();
      return $R(0,2).map(function(i){
        return parseInt( color.slice(i*2+1,i*2+3), 16 ) 
      });
    }
    this.transforms = this.style.map(function(pair){
      var property = pair[0], value = pair[1], unit = null;

      if (value.parseColor('#zzzzzz') != '#zzzzzz') {
        value = value.parseColor();
        unit  = 'color';
      } else if (property == 'opacity') {
        value = parseFloat(value);
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
          this.element.setStyle({zoom: 1});
      } else if (Element.CSS_LENGTH.test(value)) {
          var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
          value = parseFloat(components[1]);
          unit = (components.length == 3) ? components[2] : null;
      }

      var originalValue = this.element.getStyle(property);
      return { 
        style: property.camelize(), 
        originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0), 
        targetValue: unit=='color' ? parseColor(value) : value,
        unit: unit
      };
    }.bind(this)).reject(function(transform){
      return (
        (transform.originalValue == transform.targetValue) ||
        (
          transform.unit != 'color' &&
          (isNaN(transform.originalValue) || isNaN(transform.targetValue))
        )
      )
    });
  },
  update: function(position) {
    var style = { }, transform, i = this.transforms.length;
    while(i--)
      style[(transform = this.transforms[i]).style] = 
        transform.unit=='color' ? '#'+
          (Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
          (Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
          (Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
        (transform.originalValue +
          (transform.targetValue - transform.originalValue) * position).toFixed(3) + 
            (transform.unit === null ? '' : transform.unit);
    this.element.setStyle(style, true);
  }
});

Effect.Transform = Class.create({
  initialize: function(tracks){
    this.tracks  = [];
    this.options = arguments[1] || { };
    this.addTracks(tracks);
  },
  addTracks: function(tracks){
    tracks.each(function(track){
      track = $H(track);
      var data = track.values().first();
      this.tracks.push($H({
        ids:     track.keys().first(),
        effect:  Effect.Morph,
        options: { style: data }
      }));
    }.bind(this));
    return this;
  },
  play: function(){
    return new Effect.Parallel(
      this.tracks.map(function(track){
        var ids = track.get('ids'), effect = track.get('effect'), options = track.get('options');
        var elements = [$(ids) || $$(ids)].flatten();
        return elements.map(function(e){ return new effect(e, Object.extend({ sync:true }, options)) });
      }).flatten(),
      this.options
    );
  }
});

Element.CSS_PROPERTIES = $w(
  'backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' + 
  'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' +
  'borderRightColor borderRightStyle borderRightWidth borderSpacing ' +
  'borderTopColor borderTopStyle borderTopWidth bottom clip color ' +
  'fontSize fontWeight height left letterSpacing lineHeight ' +
  'marginBottom marginLeft marginRight marginTop markerOffset maxHeight '+
  'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' +
  'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' +
  'right textIndent top width wordSpacing zIndex');
  
Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;

String.__parseStyleElement = document.createElement('div');
String.prototype.parseStyle = function(){
  var style, styleRules = $H();
  if (Prototype.Browser.WebKit)
    style = new Element('div',{style:this}).style;
  else {
    String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
    style = String.__parseStyleElement.childNodes[0].style;
  }
  
  Element.CSS_PROPERTIES.each(function(property){
    if (style[property]) styleRules.set(property, style[property]); 
  });
  
  if (Prototype.Browser.IE && this.include('opacity'))
    styleRules.set('opacity', this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]);

  return styleRules;
};

if (document.defaultView && document.defaultView.getComputedStyle) {
  Element.getStyles = function(element) {
    var css = document.defaultView.getComputedStyle($(element), null);
    return Element.CSS_PROPERTIES.inject({ }, function(styles, property) {
      styles[property] = css[property];
      return styles;
    });
  };
} else {
  Element.getStyles = function(element) {
    element = $(element);
    var css = element.currentStyle, styles;
    styles = Element.CSS_PROPERTIES.inject({ }, function(results, property) {
      results[property] = css[property];
      return results;
    });
    if (!styles.opacity) styles.opacity = element.getOpacity();
    return styles;
  };
}

Effect.Methods = {
  morph: function(element, style) {
    element = $(element);
    new Effect.Morph(element, Object.extend({ style: style }, arguments[2] || { }));
    return element;
  },
  visualEffect: function(element, effect, options) {
    element = $(element);
    var s = effect.dasherize().camelize(), klass = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[klass](element, options);
    return element;
  },
  highlight: function(element, options) {
    element = $(element);
    new Effect.Highlight(element, options);
    return element;
  }
};

$w('fade appear grow shrink fold blindUp blindDown slideUp slideDown '+
  'pulsate shake puff squish switchOff dropOut').each(
  function(effect) { 
    Effect.Methods[effect] = function(element, options){
      element = $(element);
      Effect[effect.charAt(0).toUpperCase() + effect.substring(1)](element, options);
      return element;
    }
  }
);

$w('getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles').each( 
  function(f) { Effect.Methods[f] = Element[f]; }
);

Element.addMethods(Effect.Methods);

if(Object.isUndefined(Effect))
  throw("dragdrop.js requires including script.aculo.us' effects.js library");

var Droppables = {
  drops: [],

  remove: function(element) {
    this.drops = this.drops.reject(function(d) { return d.element==$(element) });
  },

  add: function(element) {
    element = $(element);
    var options = Object.extend({
      greedy:     true,
      hoverclass: null,
      tree:       false
    }, arguments[1] || { });

    // cache containers
    if(options.containment) {
      options._containers = [];
      var containment = options.containment;
      if(Object.isArray(containment)) {
        containment.each( function(c) { options._containers.push($(c)) });
      } else {
        options._containers.push($(containment));
      }
    }
    
    if(options.accept) options.accept = [options.accept].flatten();

    Element.makePositioned(element); // fix IE
    options.element = element;

    this.drops.push(options);
  },
  
  findDeepestChild: function(drops) {
    deepest = drops[0];
      
    for (i = 1; i < drops.length; ++i)
      if (Element.isParent(drops[i].element, deepest.element))
        deepest = drops[i];
    
    return deepest;
  },

  isContained: function(element, drop) {
    var containmentNode;
    if(drop.tree) {
      containmentNode = element.treeNode; 
    } else {
      containmentNode = element.parentNode;
    }
    return drop._containers.detect(function(c) { return containmentNode == c });
  },
  
  isAffected: function(point, element, drop) {
    return (
      (drop.element!=element) &&
      ((!drop._containers) ||
        this.isContained(element, drop)) &&
      ((!drop.accept) ||
        (Element.classNames(element).detect( 
          function(v) { return drop.accept.include(v) } ) )) &&
      Position.within(drop.element, point[0], point[1]) );
  },

  deactivate: function(drop) {
    if(drop.hoverclass)
      Element.removeClassName(drop.element, drop.hoverclass);
    this.last_active = null;
  },

  activate: function(drop) {
    if(drop.hoverclass)
      Element.addClassName(drop.element, drop.hoverclass);
    this.last_active = drop;
  },

  show: function(point, element) {
    if(!this.drops.length) return;
    var drop, affected = [];
    
    this.drops.each( function(drop) {
      if(Droppables.isAffected(point, element, drop))
        affected.push(drop);
    });
        
    if(affected.length>0)
      drop = Droppables.findDeepestChild(affected);

    if(this.last_active && this.last_active != drop) this.deactivate(this.last_active);
    if (drop) {
      Position.within(drop.element, point[0], point[1]);
      if(drop.onHover)
        drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));
      
      if (drop != this.last_active) Droppables.activate(drop);
    }
  },

  fire: function(event, element) {
    if(!this.last_active) return;
    Position.prepare();

    if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active))
      if (this.last_active.onDrop) {
        this.last_active.onDrop(element, this.last_active.element, event); 
        return true; 
      }
  },

  reset: function() {
    if(this.last_active)
      this.deactivate(this.last_active);
  }
};

var Draggables = {
  drags: [],
  observers: [],
  
  register: function(draggable) {
    if(this.drags.length == 0) {
      this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
      this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
      this.eventKeypress  = this.keyPress.bindAsEventListener(this);
      
      Event.observe(document, "mouseup", this.eventMouseUp);
      Event.observe(document, "mousemove", this.eventMouseMove);
      Event.observe(document, "keypress", this.eventKeypress);
    }
    this.drags.push(draggable);
  },
  
  unregister: function(draggable) {
    this.drags = this.drags.reject(function(d) { return d==draggable });
    if(this.drags.length == 0) {
      Event.stopObserving(document, "mouseup", this.eventMouseUp);
      Event.stopObserving(document, "mousemove", this.eventMouseMove);
      Event.stopObserving(document, "keypress", this.eventKeypress);
    }
  },
  
  activate: function(draggable) {
    if(draggable.options.delay) { 
      this._timeout = setTimeout(function() { 
        Draggables._timeout = null; 
        window.focus(); 
        Draggables.activeDraggable = draggable; 
      }.bind(this), draggable.options.delay); 
    } else {
      window.focus(); // allows keypress events if window isn't currently focused, fails for Safari
      this.activeDraggable = draggable;
    }
  },
  
  deactivate: function() {
    this.activeDraggable = null;
  },
  
  updateDrag: function(event) {
    if(!this.activeDraggable) return;
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    // Mozilla-based browsers fire successive mousemove events with
    // the same coordinates, prevent needless redrawing (moz bug?)
    if(this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) return;
    this._lastPointer = pointer;
    
    this.activeDraggable.updateDrag(event, pointer);
  },
  
  endDrag: function(event) {
    if(this._timeout) { 
      clearTimeout(this._timeout); 
      this._timeout = null; 
    }
    if(!this.activeDraggable) return;
    this._lastPointer = null;
    this.activeDraggable.endDrag(event);
    this.activeDraggable = null;
  },
  
  keyPress: function(event) {
    if(this.activeDraggable)
      this.activeDraggable.keyPress(event);
  },
  
  addObserver: function(observer) {
    this.observers.push(observer);
    this._cacheObserverCallbacks();
  },
  
  removeObserver: function(element) {  // element instead of observer fixes mem leaks
    this.observers = this.observers.reject( function(o) { return o.element==element });
    this._cacheObserverCallbacks();
  },
  
  notify: function(eventName, draggable, event) {  // 'onStart', 'onEnd', 'onDrag'
    if(this[eventName+'Count'] > 0)
      this.observers.each( function(o) {
        if(o[eventName]) o[eventName](eventName, draggable, event);
      });
    if(draggable.options[eventName]) draggable.options[eventName](draggable, event);
  },
  
  _cacheObserverCallbacks: function() {
    ['onStart','onEnd','onDrag'].each( function(eventName) {
      Draggables[eventName+'Count'] = Draggables.observers.select(
        function(o) { return o[eventName]; }
      ).length;
    });
  }
};

/*--------------------------------------------------------------------------*/

var Draggable = Class.create({
  initialize: function(element) {
    var defaults = {
      handle: false,
      reverteffect: function(element, top_offset, left_offset) {
        var dur = Math.sqrt(Math.abs(top_offset^2)+Math.abs(left_offset^2))*0.02;
        new Effect.Move(element, { x: -left_offset, y: -top_offset, duration: dur,
          queue: {scope:'_draggable', position:'end'}
        });
      },
      endeffect: function(element) {
        var toOpacity = Object.isNumber(element._opacity) ? element._opacity : 1.0;
        new Effect.Opacity(element, {duration:0.2, from:0.7, to:toOpacity, 
          queue: {scope:'_draggable', position:'end'},
          afterFinish: function(){ 
            Draggable._dragging[element] = false 
          }
        }); 
      },
      zindex: 1000,
      revert: false,
      quiet: false,
      scroll: false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      snap: false,  // false, or xy or [x,y] or function(x,y){ return [x,y] }
      delay: 0
    };
    
    if(!arguments[1] || Object.isUndefined(arguments[1].endeffect))
      Object.extend(defaults, {
        starteffect: function(element) {
          element._opacity = Element.getOpacity(element);
          Draggable._dragging[element] = true;
          new Effect.Opacity(element, {duration:0.2, from:element._opacity, to:0.7}); 
        }
      });
    
    var options = Object.extend(defaults, arguments[1] || { });

    this.element = $(element);
    
    if(options.handle && Object.isString(options.handle))
      this.handle = this.element.down('.'+options.handle, 0);
    
    if(!this.handle) this.handle = $(options.handle);
    if(!this.handle) this.handle = this.element;
    
    if(options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {
      options.scroll = $(options.scroll);
      this._isScrollChild = Element.childOf(this.element, options.scroll);
    }

    Element.makePositioned(this.element); // fix IE    

    this.options  = options;
    this.dragging = false;   

    this.eventMouseDown = this.initDrag.bindAsEventListener(this);
    Event.observe(this.handle, "mousedown", this.eventMouseDown);
    
    Draggables.register(this);
  },
  
  destroy: function() {
    Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);
    Draggables.unregister(this);
  },
  
  currentDelta: function() {
    return([
      parseInt(Element.getStyle(this.element,'left') || '0'),
      parseInt(Element.getStyle(this.element,'top') || '0')]);
  },
  
  initDrag: function(event) {
    if(!Object.isUndefined(Draggable._dragging[this.element]) &&
      Draggable._dragging[this.element]) return;
    if(Event.isLeftClick(event)) {    
      // abort on form elements, fixes a Firefox issue
      var src = Event.element(event);
      if((tag_name = src.tagName.toUpperCase()) && (
        tag_name=='INPUT' ||
        tag_name=='SELECT' ||
        tag_name=='OPTION' ||
        tag_name=='BUTTON' ||
        tag_name=='TEXTAREA')) return;
        
      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      var pos     = Position.cumulativeOffset(this.element);
      this.offset = [0,1].map( function(i) { return (pointer[i] - pos[i]) });
      
      Draggables.activate(this);
      Event.stop(event);
    }
  },
  
  startDrag: function(event) {
    this.dragging = true;
    if(!this.delta)
      this.delta = this.currentDelta();
    
    if(this.options.zindex) {
      this.originalZ = parseInt(Element.getStyle(this.element,'z-index') || 0);
      this.element.style.zIndex = this.options.zindex;
    }
    
    if(this.options.ghosting) {
      this._clone = this.element.cloneNode(true);
      this._originallyAbsolute = (this.element.getStyle('position') == 'absolute');
      if (!this._originallyAbsolute)
        Position.absolutize(this.element);
      this.element.parentNode.insertBefore(this._clone, this.element);
    }
    
    if(this.options.scroll) {
      if (this.options.scroll == window) {
        var where = this._getWindowScroll(this.options.scroll);
        this.originalScrollLeft = where.left;
        this.originalScrollTop = where.top;
      } else {
        this.originalScrollLeft = this.options.scroll.scrollLeft;
        this.originalScrollTop = this.options.scroll.scrollTop;
      }
    }
    
    Draggables.notify('onStart', this, event);
        
    if(this.options.starteffect) this.options.starteffect(this.element);
  },
  
  updateDrag: function(event, pointer) {
    if(!this.dragging) this.startDrag(event);
    
    if(!this.options.quiet){
      Position.prepare();
      Droppables.show(pointer, this.element);
    }
    
    Draggables.notify('onDrag', this, event);
    
    this.draw(pointer);
    if(this.options.change) this.options.change(this);
    
    if(this.options.scroll) {
      this.stopScrolling();
      
      var p;
      if (this.options.scroll == window) {
        with(this._getWindowScroll(this.options.scroll)) { p = [ left, top, left+width, top+height ]; }
      } else {
        p = Position.page(this.options.scroll);
        p[0] += this.options.scroll.scrollLeft + Position.deltaX;
        p[1] += this.options.scroll.scrollTop + Position.deltaY;
        p.push(p[0]+this.options.scroll.offsetWidth);
        p.push(p[1]+this.options.scroll.offsetHeight);
      }
      var speed = [0,0];
      if(pointer[0] < (p[0]+this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[0]+this.options.scrollSensitivity);
      if(pointer[1] < (p[1]+this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[1]+this.options.scrollSensitivity);
      if(pointer[0] > (p[2]-this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[2]-this.options.scrollSensitivity);
      if(pointer[1] > (p[3]-this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[3]-this.options.scrollSensitivity);
      this.startScrolling(speed);
    }
    
    // fix AppleWebKit rendering
    if(Prototype.Browser.WebKit) window.scrollBy(0,0);
    
    Event.stop(event);
  },
  
  finishDrag: function(event, success) {
    this.dragging = false;
    
    if(this.options.quiet){
      Position.prepare();
      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      Droppables.show(pointer, this.element);
    }

    if(this.options.ghosting) {
      if (!this._originallyAbsolute)
        Position.relativize(this.element);
      delete this._originallyAbsolute;
      Element.remove(this._clone);
      this._clone = null;
    }

    var dropped = false; 
    if(success) { 
      dropped = Droppables.fire(event, this.element); 
      if (!dropped) dropped = false; 
    }
    if(dropped && this.options.onDropped) this.options.onDropped(this.element);
    Draggables.notify('onEnd', this, event);

    var revert = this.options.revert;
    if(revert && Object.isFunction(revert)) revert = revert(this.element);
    
    var d = this.currentDelta();
    if(revert && this.options.reverteffect) {
      if (dropped == 0 || revert != 'failure')
        this.options.reverteffect(this.element,
          d[1]-this.delta[1], d[0]-this.delta[0]);
    } else {
      this.delta = d;
    }

    if(this.options.zindex)
      this.element.style.zIndex = this.originalZ;

    if(this.options.endeffect) 
      this.options.endeffect(this.element);
      
    Draggables.deactivate(this);
    Droppables.reset();
  },
  
  keyPress: function(event) {
    if(event.keyCode!=Event.KEY_ESC) return;
    this.finishDrag(event, false);
    Event.stop(event);
  },
  
  endDrag: function(event) {
    if(!this.dragging) return;
    this.stopScrolling();
    this.finishDrag(event, true);
    Event.stop(event);
  },
  
  draw: function(point) {
    var pos = Position.cumulativeOffset(this.element);
    if(this.options.ghosting) {
      var r   = Position.realOffset(this.element);
      pos[0] += r[0] - Position.deltaX; pos[1] += r[1] - Position.deltaY;
    }
    
    var d = this.currentDelta();
    pos[0] -= d[0]; pos[1] -= d[1];
    
    if(this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
      pos[0] -= this.options.scroll.scrollLeft-this.originalScrollLeft;
      pos[1] -= this.options.scroll.scrollTop-this.originalScrollTop;
    }
    
    var p = [0,1].map(function(i){ 
      return (point[i]-pos[i]-this.offset[i]) 
    }.bind(this));
    
    if(this.options.snap) {
      if(Object.isFunction(this.options.snap)) {
        p = this.options.snap(p[0],p[1],this);
      } else {
      if(Object.isArray(this.options.snap)) {
        p = p.map( function(v, i) {
          return (v/this.options.snap[i]).round()*this.options.snap[i] }.bind(this));
      } else {
        p = p.map( function(v) {
          return (v/this.options.snap).round()*this.options.snap }.bind(this));
      }
    }}
    
    var style = this.element.style;
    if((!this.options.constraint) || (this.options.constraint=='horizontal'))
      style.left = p[0] + "px";
    if((!this.options.constraint) || (this.options.constraint=='vertical'))
      style.top  = p[1] + "px";
    
    if(style.visibility=="hidden") style.visibility = ""; // fix gecko rendering
  },
  
  stopScrolling: function() {
    if(this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
      Draggables._lastScrollPointer = null;
    }
  },
  
  startScrolling: function(speed) {
    if(!(speed[0] || speed[1])) return;
    this.scrollSpeed = [speed[0]*this.options.scrollSpeed,speed[1]*this.options.scrollSpeed];
    this.lastScrolled = new Date();
    this.scrollInterval = setInterval(this.scroll.bind(this), 10);
  },
  
  scroll: function() {
    var current = new Date();
    var delta = current - this.lastScrolled;
    this.lastScrolled = current;
    if(this.options.scroll == window) {
      with (this._getWindowScroll(this.options.scroll)) {
        if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
          var d = delta / 1000;
          this.options.scroll.scrollTo( left + d*this.scrollSpeed[0], top + d*this.scrollSpeed[1] );
        }
      }
    } else {
      this.options.scroll.scrollLeft += this.scrollSpeed[0] * delta / 1000;
      this.options.scroll.scrollTop  += this.scrollSpeed[1] * delta / 1000;
    }
    
    Position.prepare();
    Droppables.show(Draggables._lastPointer, this.element);
    Draggables.notify('onDrag', this);
    if (this._isScrollChild) {
      Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
      Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta / 1000;
      Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta / 1000;
      if (Draggables._lastScrollPointer[0] < 0)
        Draggables._lastScrollPointer[0] = 0;
      if (Draggables._lastScrollPointer[1] < 0)
        Draggables._lastScrollPointer[1] = 0;
      this.draw(Draggables._lastScrollPointer);
    }
    
    if(this.options.change) this.options.change(this);
  },
  
  _getWindowScroll: function(w) {
    var T, L, W, H;
    with (w.document) {
      if (w.document.documentElement && documentElement.scrollTop) {
        T = documentElement.scrollTop;
        L = documentElement.scrollLeft;
      } else if (w.document.body) {
        T = body.scrollTop;
        L = body.scrollLeft;
      }
      if (w.innerWidth) {
        W = w.innerWidth;
        H = w.innerHeight;
      } else if (w.document.documentElement && documentElement.clientWidth) {
        W = documentElement.clientWidth;
        H = documentElement.clientHeight;
      } else {
        W = body.offsetWidth;
        H = body.offsetHeight;
      }
    }
    return { top: T, left: L, width: W, height: H };
  }
});

Draggable._dragging = { };

/*--------------------------------------------------------------------------*/

var SortableObserver = Class.create({
  initialize: function(element, observer) {
    this.element   = $(element);
    this.observer  = observer;
    this.lastValue = Sortable.serialize(this.element);
  },
  
  onStart: function() {
    this.lastValue = Sortable.serialize(this.element);
  },
  
  onEnd: function() {
    Sortable.unmark();
    if(this.lastValue != Sortable.serialize(this.element))
      this.observer(this.element)
  }
});

var Sortable = {
  SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/,
  
  sortables: { },
  
  _findRootElement: function(element) {
    while (element.tagName.toUpperCase() != "BODY") {  
      if(element.id && Sortable.sortables[element.id]) return element;
      element = element.parentNode;
    }
  },

  options: function(element) {
    element = Sortable._findRootElement($(element));
    if(!element) return;
    return Sortable.sortables[element.id];
  },
  
  destroy: function(element){
    var s = Sortable.options(element);
    
    if(s) {
      Draggables.removeObserver(s.element);
      s.droppables.each(function(d){ Droppables.remove(d) });
      s.draggables.invoke('destroy');
      
      delete Sortable.sortables[s.element.id];
    }
  },

  create: function(element) {
    element = $(element);
    var options = Object.extend({ 
      element:     element,
      tag:         'li',       // assumes li children, override with tag: 'tagname'
      dropOnEmpty: false,
      tree:        false,
      treeTag:     'ul',
      overlap:     'vertical', // one of 'vertical', 'horizontal'
      constraint:  'vertical', // one of 'vertical', 'horizontal', false
      containment: element,    // also takes array of elements (or id's); or false
      handle:      false,      // or a CSS class
      only:        false,
      delay:       0,
      hoverclass:  null,
      ghosting:    false,
      quiet:       false, 
      scroll:      false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      format:      this.SERIALIZE_RULE,
      
      // these take arrays of elements or ids and can be 
      // used for better initialization performance
      elements:    false,
      handles:     false,
      
      onChange:    Prototype.emptyFunction,
      onUpdate:    Prototype.emptyFunction
    }, arguments[1] || { });

    // clear any old sortable with same element
    this.destroy(element);

    // build options for the draggables
    var options_for_draggable = {
      revert:      true,
      quiet:       options.quiet,
      scroll:      options.scroll,
      scrollSpeed: options.scrollSpeed,
      scrollSensitivity: options.scrollSensitivity,
      delay:       options.delay,
      ghosting:    options.ghosting,
      constraint:  options.constraint,
      handle:      options.handle };

    if(options.starteffect)
      options_for_draggable.starteffect = options.starteffect;

    if(options.reverteffect)
      options_for_draggable.reverteffect = options.reverteffect;
    else
      if(options.ghosting) options_for_draggable.reverteffect = function(element) {
        element.style.top  = 0;
        element.style.left = 0;
      };

    if(options.endeffect)
      options_for_draggable.endeffect = options.endeffect;

    if(options.zindex)
      options_for_draggable.zindex = options.zindex;

    // build options for the droppables  
    var options_for_droppable = {
      overlap:     options.overlap,
      containment: options.containment,
      tree:        options.tree,
      hoverclass:  options.hoverclass,
      onHover:     Sortable.onHover
    };
    
    var options_for_tree = {
      onHover:      Sortable.onEmptyHover,
      overlap:      options.overlap,
      containment:  options.containment,
      hoverclass:   options.hoverclass
    };

    // fix for gecko engine
    Element.cleanWhitespace(element); 

    options.draggables = [];
    options.droppables = [];

    // drop on empty handling
    if(options.dropOnEmpty || options.tree) {
      Droppables.add(element, options_for_tree);
      options.droppables.push(element);
    }

    (options.elements || this.findElements(element, options) || []).each( function(e,i) {
      var handle = options.handles ? $(options.handles[i]) :
        (options.handle ? $(e).select('.' + options.handle)[0] : e); 
      options.draggables.push(
        new Draggable(e, Object.extend(options_for_draggable, { handle: handle })));
      Droppables.add(e, options_for_droppable);
      if(options.tree) e.treeNode = element;
      options.droppables.push(e);      
    });
    
    if(options.tree) {
      (Sortable.findTreeElements(element, options) || []).each( function(e) {
        Droppables.add(e, options_for_tree);
        e.treeNode = element;
        options.droppables.push(e);
      });
    }

    // keep reference
    this.sortables[element.id] = options;

    // for onupdate
    Draggables.addObserver(new SortableObserver(element, options.onUpdate));

  },

  // return all suitable-for-sortable elements in a guaranteed order
  findElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.tag);
  },
  
  findTreeElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.treeTag);
  },

  onHover: function(element, dropon, overlap) {
    if(Element.isParent(dropon, element)) return;

    if(overlap > .33 && overlap < .66 && Sortable.options(dropon).tree) {
      return;
    } else if(overlap>0.5) {
      Sortable.mark(dropon, 'before');
      if(dropon.previousSibling != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, dropon);
        if(dropon.parentNode!=oldParentNode) 
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    } else {
      Sortable.mark(dropon, 'after');
      var nextElement = dropon.nextSibling || null;
      if(nextElement != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, nextElement);
        if(dropon.parentNode!=oldParentNode) 
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    }
  },
  
  onEmptyHover: function(element, dropon, overlap) {
    var oldParentNode = element.parentNode;
    var droponOptions = Sortable.options(dropon);
        
    if(!Element.isParent(dropon, element)) {
      var index;
      
      var children = Sortable.findElements(dropon, {tag: droponOptions.tag, only: droponOptions.only});
      var child = null;
            
      if(children) {
        var offset = Element.offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);
        
        for (index = 0; index < children.length; index += 1) {
          if (offset - Element.offsetSize (children[index], droponOptions.overlap) >= 0) {
            offset -= Element.offsetSize (children[index], droponOptions.overlap);
          } else if (offset - (Element.offsetSize (children[index], droponOptions.overlap) / 2) >= 0) {
            child = index + 1 < children.length ? children[index + 1] : null;
            break;
          } else {
            child = children[index];
            break;
          }
        }
      }
      
      dropon.insertBefore(element, child);
      
      Sortable.options(oldParentNode).onChange(element);
      droponOptions.onChange(element);
    }
  },

  unmark: function() {
    if(Sortable._marker) Sortable._marker.hide();
  },

  mark: function(dropon, position) {
    // mark on ghosting only
    var sortable = Sortable.options(dropon.parentNode);
    if(sortable && !sortable.ghosting) return; 

    if(!Sortable._marker) {
      Sortable._marker = 
        ($('dropmarker') || Element.extend(document.createElement('DIV'))).
          hide().addClassName('dropmarker').setStyle({position:'absolute'});
      document.getElementsByTagName("body").item(0).appendChild(Sortable._marker);
    }    
    var offsets = Position.cumulativeOffset(dropon);
    Sortable._marker.setStyle({left: offsets[0]+'px', top: offsets[1] + 'px'});
    
    if(position=='after')
      if(sortable.overlap == 'horizontal') 
        Sortable._marker.setStyle({left: (offsets[0]+dropon.clientWidth) + 'px'});
      else
        Sortable._marker.setStyle({top: (offsets[1]+dropon.clientHeight) + 'px'});
    
    Sortable._marker.show();
  },
  
  _tree: function(element, options, parent) {
    var children = Sortable.findElements(element, options) || [];
  
    for (var i = 0; i < children.length; ++i) {
      var match = children[i].id.match(options.format);

      if (!match) continue;
      
      var child = {
        id: encodeURIComponent(match ? match[1] : null),
        element: element,
        parent: parent,
        children: [],
        position: parent.children.length,
        container: $(children[i]).down(options.treeTag)
      };
      
      /* Get the element containing the children and recurse over it */
      if (child.container)
        this._tree(child.container, options, child);
      
      parent.children.push (child);
    }

    return parent; 
  },

  tree: function(element) {
    element = $(element);
    var sortableOptions = this.options(element);
    var options = Object.extend({
      tag: sortableOptions.tag,
      treeTag: sortableOptions.treeTag,
      only: sortableOptions.only,
      name: element.id,
      format: sortableOptions.format
    }, arguments[1] || { });
    
    var root = {
      id: null,
      parent: null,
      children: [],
      container: element,
      position: 0
    };
    
    return Sortable._tree(element, options, root);
  },

  /* Construct a [i] index for a particular node */
  _constructIndex: function(node) {
    var index = '';
    do {
      if (node.id) index = '[' + node.position + ']' + index;
    } while ((node = node.parent) != null);
    return index;
  },

  sequence: function(element) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[1] || { });
    
    return $(this.findElements(element, options) || []).map( function(item) {
      return item.id.match(options.format) ? item.id.match(options.format)[1] : '';
    });
  },

  setSequence: function(element, new_sequence) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[2] || { });
    
    var nodeMap = { };
    this.findElements(element, options).each( function(n) {
        if (n.id.match(options.format))
            nodeMap[n.id.match(options.format)[1]] = [n, n.parentNode];
        n.parentNode.removeChild(n);
    });
   
    new_sequence.each(function(ident) {
      var n = nodeMap[ident];
      if (n) {
        n[1].appendChild(n[0]);
        delete nodeMap[ident];
      }
    });
  },
  
  serialize: function(element) {
    element = $(element);
    var options = Object.extend(Sortable.options(element), arguments[1] || { });
    var name = encodeURIComponent(
      (arguments[1] && arguments[1].name) ? arguments[1].name : element.id);
    
    if (options.tree) {
      return Sortable.tree(element, arguments[1]).children.map( function (item) {
        return [name + Sortable._constructIndex(item) + "[id]=" + 
                encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));
      }).flatten().join('&');
    } else {
      return Sortable.sequence(element, arguments[1]).map( function(item) {
        return name + "[]=" + encodeURIComponent(item);
      }).join('&');
    }
  }
};

// Returns true if child is contained within element
Element.isParent = function(child, element) {
  if (!child.parentNode || child == element) return false;
  if (child.parentNode == element) return true;
  return Element.isParent(child.parentNode, element);
};

Element.findChildren = function(element, only, recursive, tagName) {   
  if(!element.hasChildNodes()) return null;
  tagName = tagName.toUpperCase();
  if(only) only = [only].flatten();
  var elements = [];
  $A(element.childNodes).each( function(e) {
    if(e.tagName && e.tagName.toUpperCase()==tagName &&
      (!only || (Element.classNames(e).detect(function(v) { return only.include(v) }))))
        elements.push(e);
    if(recursive) {
      var grandchildren = Element.findChildren(e, only, recursive, tagName);
      if(grandchildren) elements.push(grandchildren);
    }
  });

  return (elements.length>0 ? elements.flatten() : []);
};

Element.offsetSize = function (element, type) {
  return element['offset' + ((type=='vertical' || type=='height') ? 'Height' : 'Width')];
};

if(typeof Effect == 'undefined')
  throw("controls.js requires including script.aculo.us' effects.js library");

var Autocompleter = { };
Autocompleter.Base = Class.create({
  baseInitialize: function(element, update, options) {
    element          = $(element);
    this.element     = element; 
    this.update      = $(update);  
    this.hasFocus    = false; 
    this.changed     = false; 
    this.active      = false; 
    this.index       = 0;     
    this.entryCount  = 0;
    this.oldElementValue = this.element.value;

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || { };

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.tokens       = this.options.tokens || [];
    this.options.frequency    = this.options.frequency || 0.4;
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow || 
      function(element, update){ 
        if(!update.style.position || update.style.position=='absolute') {
          update.style.position = 'absolute';
          Position.clone(element, update, {
            setHeight: false, 
            offsetTop: element.offsetHeight
          });
        }
        Effect.Appear(update,{duration:0.15});
      };
    this.options.onHide = this.options.onHide || 
      function(element, update){ new Effect.Fade(update,{duration:0.15}) };

    if(typeof(this.options.tokens) == 'string') 
      this.options.tokens = new Array(this.options.tokens);
    // Force carriage returns as token delimiters anyway
    if (!this.options.tokens.include('\n'))
      this.options.tokens.push('\n');

    this.observer = null;
    
    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
    Event.observe(this.element, 'keydown', this.onKeyPress.bindAsEventListener(this));
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
    if(!this.iefix && 
      (Prototype.Browser.IE) &&
      (Element.getStyle(this.update, 'position')=='absolute')) {
      new Insertion.After(this.update, 
       '<iframe id="' + this.update.id + '_iefix" '+
       'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
       'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
      this.iefix = $(this.update.id+'_iefix');
    }
    if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
  },
  
  fixIEOverlapping: function() {
    Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});
    this.iefix.style.zIndex = 1;
    this.update.style.zIndex = 2;
    Element.show(this.iefix);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
    if(this.iefix) Element.hide(this.iefix);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  onKeyPress: function(event) {
    if(this.active)
      switch(event.keyCode) {
       case Event.KEY_TAB:
       case Event.KEY_RETURN:
         this.selectEntry();
         Event.stop(event);
       case Event.KEY_ESC:
         this.hide();
         this.active = false;
         Event.stop(event);
         return;
       case Event.KEY_LEFT:
       case Event.KEY_RIGHT:
         return;
       case Event.KEY_UP:
         this.markPrevious();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_DOWN:
         this.markNext();
         this.render();
         Event.stop(event);
         return;
      }
     else 
       if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN || 
         (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) return;

    this.changed = true;
    this.hasFocus = true;

    if(this.observer) clearTimeout(this.observer);
      this.observer = 
        setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex) 
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },
  
  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },
  
  onBlur: function(event) {
    // needed to make click events working
    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;     
  }, 
  
  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ? 
          Element.addClassName(this.getEntry(i),"selected") : 
          Element.removeClassName(this.getEntry(i),"selected");
      if(this.hasFocus) { 
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },
  
  markPrevious: function() {
    if(this.index > 0) this.index--;
      else this.index = this.entryCount-1;
    this.getEntry(this.index).scrollIntoView(true);
  },
  
  markNext: function() {
    if(this.index < this.entryCount-1) this.index++;
      else this.index = 0;
    this.getEntry(this.index).scrollIntoView(false);
  },
  
  getEntry: function(index) {
    return this.update.firstChild.childNodes[index];
  },
  
  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },
  
  selectEntry: function() {
    this.active = false;
    this.updateElement(this.getCurrentEntry());
  },

  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
    var value = '';
    if (this.options.select) {
      var nodes = $(selectedElement).select('.' + this.options.select) || [];
      if(nodes.length>0) value = Element.collectTextNodes(nodes[0], this.options.select);
    } else
      value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');
    
    var bounds = this.getTokenBounds();
    if (bounds[0] != -1) {
      var newValue = this.element.value.substr(0, bounds[0]);
      var whitespace = this.element.value.substr(bounds[0]).match(/^\s+/);
      if (whitespace)
        newValue += whitespace[0];
      this.element.value = newValue + value + this.element.value.substr(bounds[1]);
    } else {
      this.element.value = value;
    }
    this.oldElementValue = this.element.value;
    this.element.focus();
    
    if (this.options.afterUpdateElement)
      this.options.afterUpdateElement(this.element, selectedElement);
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount = 
          this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else { 
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = 0;
      
      if(this.entryCount==1 && this.options.autoSelect) {
        this.selectEntry();
        this.hide();
      } else {
        this.render();
      }
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },

  onObserverEvent: function() {
    this.changed = false;   
    this.tokenBounds = null;
    if(this.getToken().length>=this.options.minChars) {
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
    this.oldElementValue = this.element.value;
  },

  getToken: function() {
    var bounds = this.getTokenBounds();
    return this.element.value.substring(bounds[0], bounds[1]).strip();
  },

  getTokenBounds: function() {
    if (null != this.tokenBounds) return this.tokenBounds;
    var value = this.element.value;
    if (value.strip().empty()) return [-1, 0];
    var diff = arguments.callee.getFirstDifferencePos(value, this.oldElementValue);
    var offset = (diff == this.oldElementValue.length ? 1 : 0);
    var prevTokenPos = -1, nextTokenPos = value.length;
    var tp;
    for (var index = 0, l = this.options.tokens.length; index < l; ++index) {
      tp = value.lastIndexOf(this.options.tokens[index], diff + offset - 1);
      if (tp > prevTokenPos) prevTokenPos = tp;
      tp = value.indexOf(this.options.tokens[index], diff + offset);
      if (-1 != tp && tp < nextTokenPos) nextTokenPos = tp;
    }
    return (this.tokenBounds = [prevTokenPos + 1, nextTokenPos]);
  }
});

Autocompleter.Base.prototype.getTokenBounds.getFirstDifferencePos = function(newS, oldS) {
  var boundary = Math.min(newS.length, oldS.length);
  for (var index = 0; index < boundary; ++index)
    if (newS[index] != oldS[index])
      return index;
  return boundary;
};

Ajax.Autocompleter = Class.create(Autocompleter.Base, {
  initialize: function(element, update, url, options) {
    this.baseInitialize(element, update, options);
    this.options.asynchronous  = true;
    this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
  },

  getUpdatedChoices: function() {
    this.startIndicator();
    
    var entry = encodeURIComponent(this.options.paramName) + '=' + 
      encodeURIComponent(this.getToken());

    this.options.parameters = this.options.callback ?
      this.options.callback(this.element, entry) : entry;

    if(this.options.defaultParams) 
      this.options.parameters += '&' + this.options.defaultParams;
    
    new Ajax.Request(this.url, this.options);
  },

  onComplete: function(request) {
    this.updateChoices(request.responseText);
  }
});

// The local array autocompleter. Used when you'd prefer to
// inject an array of autocompletion options into the page, rather
// than sending out Ajax queries, which can be quite slow sometimes.
//
// The constructor takes four parameters. The first two are, as usual,
// the id of the monitored textbox, and id of the autocompletion menu.
// The third is the array you want to autocomplete from, and the fourth
// is the options block.
//
// Extra local autocompletion options:
// - choices - How many autocompletion choices to offer
//
// - partialSearch - If false, the autocompleter will match entered
//                    text only at the beginning of strings in the 
//                    autocomplete array. Defaults to true, which will
//                    match text at the beginning of any *word* in the
//                    strings in the autocomplete array. If you want to
//                    search anywhere in the string, additionally set
//                    the option fullSearch to true (default: off).
//
// - fullSsearch - Search anywhere in autocomplete array strings.
//
// - partialChars - How many characters to enter before triggering
//                   a partial match (unlike minChars, which defines
//                   how many characters are required to do any match
//                   at all). Defaults to 2.
//
// - ignoreCase - Whether to ignore case when autocompleting.
//                 Defaults to true.
//
// It's possible to pass in a custom function as the 'selector' 
// option, if you prefer to write your own autocompletion logic.
// In that case, the other options above will not apply unless
// you support them.

Autocompleter.Local = Class.create(Autocompleter.Base, {
  initialize: function(element, update, array, options) {
    this.baseInitialize(element, update, options);
    this.options.array = array;
  },

  getUpdatedChoices: function() {
    this.updateChoices(this.options.selector(this));
  },

  setOptions: function(options) {
    this.options = Object.extend({
      choices: 10,
      partialSearch: true,
      partialChars: 2,
      ignoreCase: true,
      fullSearch: false,
      selector: function(instance) {
        var ret       = []; // Beginning matches
        var partial   = []; // Inside matches
        var entry     = instance.getToken();
        var count     = 0;

        for (var i = 0; i < instance.options.array.length &&  
          ret.length < instance.options.choices ; i++) { 

          var elem = instance.options.array[i];
          var foundPos = instance.options.ignoreCase ? 
            elem.toLowerCase().indexOf(entry.toLowerCase()) : 
            elem.indexOf(entry);

          while (foundPos != -1) {
            if (foundPos == 0 && elem.length != entry.length) { 
              ret.push("<li><strong>" + elem.substr(0, entry.length) + "</strong>" + 
                elem.substr(entry.length) + "</li>");
              break;
            } else if (entry.length >= instance.options.partialChars && 
              instance.options.partialSearch && foundPos != -1) {
              if (instance.options.fullSearch || /\s/.test(elem.substr(foundPos-1,1))) {
                partial.push("<li>" + elem.substr(0, foundPos) + "<strong>" +
                  elem.substr(foundPos, entry.length) + "</strong>" + elem.substr(
                  foundPos + entry.length) + "</li>");
                break;
              }
            }

            foundPos = instance.options.ignoreCase ? 
              elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) : 
              elem.indexOf(entry, foundPos + 1);

          }
        }
        if (partial.length)
          ret = ret.concat(partial.slice(0, instance.options.choices - ret.length));
        return "<ul>" + ret.join('') + "</ul>";
      }
    }, options || { });
  }
});

// AJAX in-place editor and collection editor
// Full rewrite by Christophe Porteneuve <tdd@tddsworld.com> (April 2007).

// Use this if you notice weird scrolling problems on some browsers,
// the DOM might be a bit confused when this gets called so do this
// waits 1 ms (with setTimeout) until it does the activation
Field.scrollFreeActivate = function(field) {
  setTimeout(function() {
    Field.activate(field);
  }, 1);
};

Ajax.InPlaceEditor = Class.create({
  initialize: function(element, url, options) {
    this.url = url;
    this.element = element = $(element);
    this.prepareOptions();
    this._controls = { };
    arguments.callee.dealWithDeprecatedOptions(options); // DEPRECATION LAYER!!!
    Object.extend(this.options, options || { });
    if (!this.options.formId && this.element.id) {
      this.options.formId = this.element.id + '-inplaceeditor';
      if ($(this.options.formId))
        this.options.formId = '';
    }
    if (this.options.externalControl)
      this.options.externalControl = $(this.options.externalControl);
    if (!this.options.externalControl)
      this.options.externalControlOnly = false;
    this._originalBackground = this.element.getStyle('background-color') || 'transparent';
    this.element.title = this.options.clickToEditText;
    this._boundCancelHandler = this.handleFormCancellation.bind(this);
    this._boundComplete = (this.options.onComplete || Prototype.emptyFunction).bind(this);
    this._boundFailureHandler = this.handleAJAXFailure.bind(this);
    this._boundSubmitHandler = this.handleFormSubmission.bind(this);
    this._boundWrapperHandler = this.wrapUp.bind(this);
    this.registerListeners();
  },
  checkForEscapeOrReturn: function(e) {
    if (!this._editing || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (Event.KEY_ESC == e.keyCode)
      this.handleFormCancellation(e);
    else if (Event.KEY_RETURN == e.keyCode)
      this.handleFormSubmission(e);
  },
  createControl: function(mode, handler, extraClasses) {
    var control = this.options[mode + 'Control'];
    var text = this.options[mode + 'Text'];
    if ('button' == control) {
      var btn = document.createElement('input');
      btn.type = 'submit';
      btn.value = text;
      btn.className = 'editor_' + mode + '_button';
      if ('cancel' == mode)
        btn.onclick = this._boundCancelHandler;
      this._form.appendChild(btn);
      this._controls[mode] = btn;
    } else if ('link' == control) {
      var link = document.createElement('a');
      link.href = '#';
      link.appendChild(document.createTextNode(text));
      link.onclick = 'cancel' == mode ? this._boundCancelHandler : this._boundSubmitHandler;
      link.className = 'editor_' + mode + '_link';
      if (extraClasses)
        link.className += ' ' + extraClasses;
      this._form.appendChild(link);
      this._controls[mode] = link;
    }
  },
  createEditField: function() {
    var text = (this.options.loadTextURL ? this.options.loadingText : this.getText());
    var fld;
    if (1 >= this.options.rows && !/\r|\n/.test(this.getText())) {
      fld = document.createElement('input');
      fld.type = 'text';
      var size = this.options.size || this.options.cols || 0;
      if (0 < size) fld.size = size;
    } else {
      fld = document.createElement('textarea');
      fld.rows = (1 >= this.options.rows ? this.options.autoRows : this.options.rows);
      fld.cols = this.options.cols || 40;
    }
    fld.name = this.options.paramName;
    fld.value = text; // No HTML breaks conversion anymore
    fld.className = 'editor_field';
    if (this.options.submitOnBlur)
      fld.onblur = this._boundSubmitHandler;
    this._controls.editor = fld;
    if (this.options.loadTextURL)
      this.loadExternalText();
    this._form.appendChild(this._controls.editor);
  },
  createForm: function() {
    var ipe = this;
    function addText(mode, condition) {
      var text = ipe.options['text' + mode + 'Controls'];
      if (!text || condition === false) return;
      ipe._form.appendChild(document.createTextNode(text));
    };
    this._form = $(document.createElement('form'));
    this._form.id = this.options.formId;
    this._form.addClassName(this.options.formClassName);
    this._form.onsubmit = this._boundSubmitHandler;
    this.createEditField();
    if ('textarea' == this._controls.editor.tagName.toLowerCase())
      this._form.appendChild(document.createElement('br'));
    if (this.options.onFormCustomization)
      this.options.onFormCustomization(this, this._form);
    addText('Before', this.options.okControl || this.options.cancelControl);
    this.createControl('ok', this._boundSubmitHandler);
    addText('Between', this.options.okControl && this.options.cancelControl);
    this.createControl('cancel', this._boundCancelHandler, 'editor_cancel');
    addText('After', this.options.okControl || this.options.cancelControl);
  },
  destroy: function() {
    if (this._oldInnerHTML)
      this.element.innerHTML = this._oldInnerHTML;
    this.leaveEditMode();
    this.unregisterListeners();
  },
  enterEditMode: function(e) {
    if (this._saving || this._editing) return;
    this._editing = true;
    this.triggerCallback('onEnterEditMode');
    if (this.options.externalControl)
      this.options.externalControl.hide();
    this.element.hide();
    this.createForm();
    this.element.parentNode.insertBefore(this._form, this.element);
    if (!this.options.loadTextURL)
      this.postProcessEditField();
    if (e) Event.stop(e);
  },
  enterHover: function(e) {
    if (this.options.hoverClassName)
      this.element.addClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onEnterHover');
  },
  getText: function() {
    return this.element.innerHTML;
  },
  handleAJAXFailure: function(transport) {
    this.triggerCallback('onFailure', transport);
    if (this._oldInnerHTML) {
      this.element.innerHTML = this._oldInnerHTML;
      this._oldInnerHTML = null;
    }
  },
  handleFormCancellation: function(e) {
    this.wrapUp();
    if (e) Event.stop(e);
  },
  handleFormSubmission: function(e) {
    var form = this._form;
    var value = $F(this._controls.editor);
    this.prepareSubmission();
    var params = this.options.callback(form, value) || '';
    if (Object.isString(params))
      params = params.toQueryParams();
    params.editorId = this.element.id;
    if (this.options.htmlResponse) {
      var options = Object.extend({ evalScripts: true }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Updater({ success: this.element }, this.url, options);
    } else {
      var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Request(this.url, options);
    }
    if (e) Event.stop(e);
  },
  leaveEditMode: function() {
    this.element.removeClassName(this.options.savingClassName);
    this.removeForm();
    this.leaveHover();
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
    if (this.options.externalControl)
      this.options.externalControl.show();
    this._saving = false;
    this._editing = false;
    this._oldInnerHTML = null;
    this.triggerCallback('onLeaveEditMode');
  },
  leaveHover: function(e) {
    if (this.options.hoverClassName)
      this.element.removeClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onLeaveHover');
  },
  loadExternalText: function() {
    this._form.addClassName(this.options.loadingClassName);
    this._controls.editor.disabled = true;
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._form.removeClassName(this.options.loadingClassName);
        var text = transport.responseText;
        if (this.options.stripLoadedTextTags)
          text = text.stripTags();
        this._controls.editor.value = text;
        this._controls.editor.disabled = false;
        this.postProcessEditField();
      }.bind(this),
      onFailure: this._boundFailureHandler
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },
  postProcessEditField: function() {
    var fpc = this.options.fieldPostCreation;
    if (fpc)
      $(this._controls.editor)['focus' == fpc ? 'focus' : 'activate']();
  },
  prepareOptions: function() {
    this.options = Object.clone(Ajax.InPlaceEditor.DefaultOptions);
    Object.extend(this.options, Ajax.InPlaceEditor.DefaultCallbacks);
    [this._extraDefaultOptions].flatten().compact().each(function(defs) {
      Object.extend(this.options, defs);
    }.bind(this));
  },
  prepareSubmission: function() {
    this._saving = true;
    this.removeForm();
    this.leaveHover();
    this.showSaving();
  },
  registerListeners: function() {
    this._listeners = { };
    var listener;
    $H(Ajax.InPlaceEditor.Listeners).each(function(pair) {
      listener = this[pair.value].bind(this);
      this._listeners[pair.key] = listener;
      if (!this.options.externalControlOnly)
        this.element.observe(pair.key, listener);
      if (this.options.externalControl)
        this.options.externalControl.observe(pair.key, listener);
    }.bind(this));
  },
  removeForm: function() {
    if (!this._form) return;
    this._form.remove();
    this._form = null;
    this._controls = { };
  },
  showSaving: function() {
    this._oldInnerHTML = this.element.innerHTML;
    this.element.innerHTML = this.options.savingText;
    this.element.addClassName(this.options.savingClassName);
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
  },
  triggerCallback: function(cbName, arg) {
    if ('function' == typeof this.options[cbName]) {
      this.options[cbName](this, arg);
    }
  },
  unregisterListeners: function() {
    $H(this._listeners).each(function(pair) {
      if (!this.options.externalControlOnly)
        this.element.stopObserving(pair.key, pair.value);
      if (this.options.externalControl)
        this.options.externalControl.stopObserving(pair.key, pair.value);
    }.bind(this));
  },
  wrapUp: function(transport) {
    this.leaveEditMode();
    // Can't use triggerCallback due to backward compatibility: requires
    // binding + direct element
    this._boundComplete(transport, this.element);
  }
});

Object.extend(Ajax.InPlaceEditor.prototype, {
  dispose: Ajax.InPlaceEditor.prototype.destroy
});

Ajax.InPlaceCollectionEditor = Class.create(Ajax.InPlaceEditor, {
  initialize: function($super, element, url, options) {
    this._extraDefaultOptions = Ajax.InPlaceCollectionEditor.DefaultOptions;
    $super(element, url, options);
  },

  createEditField: function() {
    var list = document.createElement('select');
    list.name = this.options.paramName;
    list.size = 1;
    this._controls.editor = list;
    this._collection = this.options.collection || [];
    if (this.options.loadCollectionURL)
      this.loadCollection();
    else
      this.checkForExternalText();
    this._form.appendChild(this._controls.editor);
  },

  loadCollection: function() {
    this._form.addClassName(this.options.loadingClassName);
    this.showLoadingText(this.options.loadingCollectionText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        var js = transport.responseText.strip();
        if (!/^\[.*\]$/.test(js)) // TODO: improve sanity check
          throw('Server returned an invalid collection representation.');
        this._collection = eval(js);
        this.checkForExternalText();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadCollectionURL, options);
  },

  showLoadingText: function(text) {
    this._controls.editor.disabled = true;
    var tempOption = this._controls.editor.firstChild;
    if (!tempOption) {
      tempOption = document.createElement('option');
      tempOption.value = '';
      this._controls.editor.appendChild(tempOption);
      tempOption.selected = true;
    }
    tempOption.update((text || '').stripScripts().stripTags());
  },

  checkForExternalText: function() {
    this._text = this.getText();
    if (this.options.loadTextURL)
      this.loadExternalText();
    else
      this.buildOptionList();
  },

  loadExternalText: function() {
    this.showLoadingText(this.options.loadingText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._text = transport.responseText.strip();
        this.buildOptionList();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },

  buildOptionList: function() {
    this._form.removeClassName(this.options.loadingClassName);
    this._collection = this._collection.map(function(entry) {
      return 2 === entry.length ? entry : [entry, entry].flatten();
    });
    var marker = ('value' in this.options) ? this.options.value : this._text;
    var textFound = this._collection.any(function(entry) {
      return entry[0] == marker;
    }.bind(this));
    this._controls.editor.update('');
    var option;
    this._collection.each(function(entry, index) {
      option = document.createElement('option');
      option.value = entry[0];
      option.selected = textFound ? entry[0] == marker : 0 == index;
      option.appendChild(document.createTextNode(entry[1]));
      this._controls.editor.appendChild(option);
    }.bind(this));
    this._controls.editor.disabled = false;
    Field.scrollFreeActivate(this._controls.editor);
  }
});

//**** DEPRECATION LAYER FOR InPlace[Collection]Editor! ****
//**** This only  exists for a while,  in order to  let ****
//**** users adapt to  the new API.  Read up on the new ****
//**** API and convert your code to it ASAP!            ****

Ajax.InPlaceEditor.prototype.initialize.dealWithDeprecatedOptions = function(options) {
  if (!options) return;
  function fallback(name, expr) {
    if (name in options || expr === undefined) return;
    options[name] = expr;
  };
  fallback('cancelControl', (options.cancelLink ? 'link' : (options.cancelButton ? 'button' :
    options.cancelLink == options.cancelButton == false ? false : undefined)));
  fallback('okControl', (options.okLink ? 'link' : (options.okButton ? 'button' :
    options.okLink == options.okButton == false ? false : undefined)));
  fallback('highlightColor', options.highlightcolor);
  fallback('highlightEndColor', options.highlightendcolor);
};

Object.extend(Ajax.InPlaceEditor, {
  DefaultOptions: {
    ajaxOptions: { },
    autoRows: 3,                                // Use when multi-line w/ rows == 1
    cancelControl: 'link',                      // 'link'|'button'|false
    cancelText: 'cancel',
    clickToEditText: 'Click to edit',
    externalControl: null,                      // id|elt
    externalControlOnly: false,
    fieldPostCreation: 'activate',              // 'activate'|'focus'|false
    formClassName: 'inplaceeditor-form',
    formId: null,                               // id|elt
    highlightColor: '#ffff99',
    highlightEndColor: '#ffffff',
    hoverClassName: '',
    htmlResponse: true,
    loadingClassName: 'inplaceeditor-loading',
    loadingText: 'Loading...',
    okControl: 'button',                        // 'link'|'button'|false
    okText: 'ok',
    paramName: 'value',
    rows: 1,                                    // If 1 and multi-line, uses autoRows
    savingClassName: 'inplaceeditor-saving',
    savingText: 'Saving...',
    size: 0,
    stripLoadedTextTags: false,
    submitOnBlur: false,
    textAfterControls: '',
    textBeforeControls: '',
    textBetweenControls: ''
  },
  DefaultCallbacks: {
    callback: function(form) {
      return Form.serialize(form);
    },
    onComplete: function(transport, element) {
      // For backward compatibility, this one is bound to the IPE, and passes
      // the element directly.  It was too often customized, so we don't break it.
      new Effect.Highlight(element, {
        startcolor: this.options.highlightColor, keepBackgroundImage: true });
    },
    onEnterEditMode: null,
    onEnterHover: function(ipe) {
      ipe.element.style.backgroundColor = ipe.options.highlightColor;
      if (ipe._effect)
        ipe._effect.cancel();
    },
    onFailure: function(transport, ipe) {
      alert('Error communication with the server: ' + transport.responseText.stripTags());
    },
    onFormCustomization: null, // Takes the IPE and its generated form, after editor, before controls.
    onLeaveEditMode: null,
    onLeaveHover: function(ipe) {
      ipe._effect = new Effect.Highlight(ipe.element, {
        startcolor: ipe.options.highlightColor, endcolor: ipe.options.highlightEndColor,
        restorecolor: ipe._originalBackground, keepBackgroundImage: true
      });
    }
  },
  Listeners: {
    click: 'enterEditMode',
    keydown: 'checkForEscapeOrReturn',
    mouseover: 'enterHover',
    mouseout: 'leaveHover'
  }
});

Ajax.InPlaceCollectionEditor.DefaultOptions = {
  loadingCollectionText: 'Loading options...'
};

// Delayed observer, like Form.Element.Observer, 
// but waits for delay after last key input
// Ideal for live-search fields

Form.Element.DelayedObserver = Class.create({
  initialize: function(element, delay, callback) {
    this.delay     = delay || 0.5;
    this.element   = $(element);
    this.callback  = callback;
    this.timer     = null;
    this.lastValue = $F(this.element); 
    Event.observe(this.element,'keyup',this.delayedListener.bindAsEventListener(this));
  },
  delayedListener: function(event) {
    if(this.lastValue == $F(this.element)) return;
    if(this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);
    this.lastValue = $F(this.element);
  },
  onTimerEvent: function() {
    this.timer = null;
    this.callback(this.element, $F(this.element));
  }
});
/**
 * @Copyright (c) 2007,上海晨路信息科技有限公司
 * @All rights reserved.
 *
 *
 *
 * @file_name   Notifier.js
 * @version     1.0
 * @author      黄新泽
 * @date        2008-01-16 16:30:47
 */

/**
 * Class and Function List:
 * Function list:
 * - initialize: function(time)  
 * - initObservers: function()   
 * - onInterrupt: function()     
 * - setTimer: function()        
 * - function onIdle(e)          
 * - function onActive(e)        
 * Classes list:
 * - .Notifier
 */
var Notifier = Class.create({
	
	_events: [[window, 'scroll'], [window, 'resize'], [document, 'mousemove'], [document, 'keydown']],
	_timer: null,
	_idleTime: null,
	
	initialize: function(time)
	{
		
		this.time = time;
		
		this.initObservers();
		this.setTimer();
	},
	
	initObservers: function()
	{
		this._events.each(function(e)
		{
			Event.observe(e[0], e[1], this.onInterrupt.bind(this))
		}.bind(this))
	},
	
	onInterrupt: function()
	{
		document.fire('state:active', { idleTime: new Date() - this._idleTime });
		this.setTimer();
	},
	
	setTimer: function()
	{
		clearTimeout(this._timer);
		this._idleTime = new Date();
		this._timer = setTimeout(function() {
			document.fire('state:idle');
		}, this.time)
	}
});
//
//document.observe('dom:loaded', function(){
//	new Notifier(180000);
//	document.observe('state:idle', onIdle).observe('state:active', onActive);
//	
//	function onIdle(e)
//	{
//		if (!active)
//		{
//			active = false;
//		}
//		else
//		{
//			active = false;
//			$('body_c').setOpacity(0.2);
//		}
//
//	}
//
//	function onActive(e)
//	{
//		if (active)
//		{
//			active = true;
//		}
//		else
//		{
//			active = true;
//			$('body_c').setOpacity(1);
//			queueInit();
//			eval(currentTabId + '.sendRequest();');
//		}
//	}
//});


/**
 * @Copyright (c) 2006,东登信息网络有限公司
 * @All rights reserved.
 *
 * 用于Ajax读取数据显示 || 直接显示数据 || 显示图片
 * 如果使用ajax,需要加载DAjax类,只用户读取某个页面内容
 * 如果使用效果,需要加载Effect
 * 如果使用拖动,需要加载DragDrop
 *
 * @file_name   LightBox.js
 * @version     1.0
 * @author      黄新泽
 * @date        2007-10-08 16:09:40
 */

/**
 * Class and Function List:
 * Function list:
 * - initialize: function()
 * - addLightboxMarkup: function(s)
 * - activate: function()
 * - prepareIE: function(height, overflow)
 * - hideSelects: function(visibility)
 * - getScroll: function()
 * - setScroll: function(x, y)
 * - displayLightbox: function(display)
 * - loadInfo: function(url, arg)
 * - responseData : function(response, ajaxObj)
 * - processInfo: function(response, type)
 * - function resizeLightBox()
 * - actions: function()
 * - insert: function(e)
 * - deactivate: function()
 * - remove: function()
 * - tag: function(ctrl)
 * - doTag : function(event)
 * - function initialize()
 * Classes list:
 * - .LightBox
 */

document.write('<div   id="tooltip_singleton"  class="singleton" style="z-index:6000;display:none;"><div><table cellpadding="0" cellspacing="0" style="float:left;"><tr><td id="tooltip_singleton_cts"><div style="float:left; border:1px solid #0a0a08; background:#41413f; padding:1px;"><div style="float:left; border:1px solid #0a0a08; background:url(' + IMA_PATH + '/main/jz_a_2.gif) no-repeat bottom; padding:4px; color:#d4d691;" id="tooltip_singleton_cts_text"></div></div></td></tr></table></div></div>');

var LightBox = Class.create();

LightBox.prototype = {

	yPos : 0,
	xPos : 0,
	box : {id:0, zIndex:500, tId:0},
	ajaxObj : [],
	ajaxId : 0,
	imageId : 0,
	eb :{eid:0},
	cTOption :{click:[], dblClick:[]},

	cOption :{click:[], dblClick:[]},
	maxOption :{click:[], dblClick:[]},
	minOption :{click:[], dblClick:[]},
	titleOption :{click:[], dblClick:[]},

	restoreData : [{}],
	restoreTData : [{}],
	maxStyle : {top:"0px", left:"0px", width:"100%", height:"100%", borderLeftWidth:"0px", borderRightWidth:"0px", borderTopWidth:"0px", borderBottomWidth:"0px"},
	minStyle : {top:"0px", left:"10px", width:"150px", height:"auto"},

	tooltipSingleton : [],
	empty : function(){return false;},

	/**
	 * 构造函数
	 *
	 * @access	public
	 */
	initialize: function()
	{
		++ this.eb.eid;
//		var bod			= document.getElementsByTagName('body')[0];
//
//		//可以根据style调用lightbox 样式类来生成box
//		var tooltip		= document.createElement('div');
//		tooltip.id		= 'tooltip_singleton'
//		tooltip.className 	= 'singleton ';
//		tooltip.style.zIndex = 6000 ;
//		tooltip.style.display = 'none' ;
//		tooltip.innerHTML = '<table cellpadding="0" cellspacing="0" style="float:left;"><tr><td id="tooltip_singleton_cts"></td></tr></table>';
//		bod.appendChild(tooltip);
//
//		//'undefined' == typeof(Draggable) ? null : new Draggable('tooltip0');
//		Element.hide('tooltip_singleton');

	},

	/**
	 * 生成遮罩,此处没有定义高度,宽度.放在最后显示处定义.
	 *
	 *	<div id="overlay1" class="overlay" style="z-index: 501;"/>
	 *	<div id="lightbox1" class="lightbox loading" style="z-index: 502;">
	 *		<div class="title" id="title1"/>
	 *		<a href="javascript:;" title= "点击最小" id="min" class="lb_min" ><img src="' + IMA_PATH + '/js/min.gif" border="0"  alt="点击最小"></a>
	 *		<a href="javascript:;" title= "点击放大" id="max" class="lb_max" ><img src="' + IMA_PATH + '/js/max.gif" border="0"  alt="点击放大"></a>
	 *		<a href="javascript:;" title= "点击关闭" id="c" class="lb_close" ><img src="' + IMA_PATH + '/js/close.gif" border="0"  alt="点击关闭"></a>
	 *		<div style="z-index: 502;" class="lbContainer" id="lbContainer1">
	 *			<div class="contents" id="contents1"/>
	 *		</div>
	 *		<div class="lbLoadMessage" id="lbLoadMessage1" style="display: none;"><img src="' + IMA_PATH + '/js/loading2.gif"/></div>
	 *	</div>
	 * @param Int	s	overlay styoe
	 * @access	public
	 */
	addLightboxMarkup: function(s)
	{
		this.box.id ++ ;
		this.box.zIndex ++ ;
		var bod			= document.getElementsByTagName('body')[0];

		//生成遮罩
		var overlay		= document.createElement('div');
		overlay.id		= 'overlay' + this.box.id;
		overlay.className 	= 'overlay';
		overlay.style.zIndex = this.box.zIndex ;

		var pg = getPageSize();
		overlay.style.height = pg[1] + 'px'; ;

		//生成lightbox
		this.box.zIndex ++ ;
		var lb			= document.createElement('div');
		lb.id			= 'lightbox' + this.box.id;
		lb.className 	= 'lightbox loading';
		lb.style.zIndex = this.box.zIndex;

		// lightbox中放入表现形式,调用样式类生成
		var style_contents = '<div id="title' + this.box.id + '"  class="title" style="display:none;"><div><span id="tc' + this.box.id + '" class="title_text">&nbsp;</span>\
							<a href="javascript:;" title= "点击最小" id="min' + this.box.id + '" class="lb_min" ><img src="' + IMA_PATH + '/js/min.gif" border="0"  alt="点击最小"></a>\
							<a href="javascript:;" title= "点击放大" id="max' + this.box.id + '" class="lb_max" ><img src="' + IMA_PATH + '/js/max.gif" border="0"  alt="点击放大"></a>\
							<a href="javascript:;" title= "点击关闭" id="c' + this.box.id + '" class="lb_close" ><img src="' + IMA_PATH + '/js/close.gif" border="0"  alt="点击关闭"></a></div></div>\
							<div id="lbContainer' + this.box.id + '" class="lbContainer" style="z-index:' + this.box.zIndex + '">\
								<div  id="contents' + this.box.id + '" class="contents"><table  style="width:100%;height:100%;text-align: center;"  id="lbTbale' + this.box.id + '" ><tr><td><table  style="width:1%;height:1%;text-align: center;" align="center" ><tr><td id="contents_table' + this.box.id + '"></td></tr></table></td></tr></table></div>\
							</div>\
							<div id="lbLoadMessage' + this.box.id + '"  class="lbLoadMessage">' + '<img src="' + IMA_PATH + '/js/loading2.gif">' + '</div>\
							<div id="bottom' + this.box.id + '"  class="bottom"></div>';
		lb.innerHTML	= style_contents;
		bod.appendChild(overlay);
		bod.appendChild(lb);

//		this.cOption.click[this.box.id] = this.remove.bindAsEventListener(this);
//		this.maxOption.click[this.box.id] = this.max.bindAsEventListener(this);
//		this.minOption.click[this.box.id] = this.min.bindAsEventListener(this);
//		this.titleOption.dblClick[this.box.id] = this.max.bindAsEventListener(this);
//
//		Event.observe($('c' + this.box.id), 'click', this.cOption.click[this.box.id], false);
//		Event.observe($('max' + this.box.id), 'click', this.maxOption.click[this.box.id], false);
//		Event.observe($('min' + this.box.id), 'click', this.minOption.click[this.box.id], false);
//		Event.observe($('title' + this.box.id), 'dblclick', this.titleOption.dblClick[this.box.id], false);
//
//		$('c' + this.box.id).onclick = $('max' + this.box.id).onclick = $('min' + this.box.id).onclick = $('title' + this.box.id).onclick = this.empty;

		bod = null;
		pg = null;
		style_contents = null;
		overlay = null;
		lb = null;

		Element.hide('lbLoadMessage' + this.box.id ); //屏蔽默认显示加载框,什么都不显示,需要加载的,单独打开
	},



	addWindow: function(event, option)
	{
		this.box.tId ++ ;
		this.box.zIndex += 2  ;

		var bod			= document.getElementsByTagName('body')[0];

		//可以根据style调用lightbox 样式类来生成box
		var tooltip		= document.createElement('div');
		tooltip.id		= 'tooltip' + this.box.tId;
		tooltip.className 	= 'tooltip';
		tooltip.style.zIndex = this.box.zIndex ;
		tooltip.style.top = option.x + 'px';
		tooltip.style.left = option.y + 'px';

		// old
		var style_contents = '<a href="javascript:;" title= "点击关闭"  id="ct' + this.box.tId + '"  class="lb_close" >\
								<img src="' + IMA_PATH + '/js/close.gif" border="0"  alt="点击关闭">\
							</a>\
							<div id="tooltip_cts' + this.box.tId + '" class="tooltip_cts"/>';


		 style_contents = '<div id="titlet' + this.box.tId + '"  class="title">&nbsp;' + option.t + '</div>\
							<a href="javascript:;" title= "点击最小" id="mint' + this.box.tId + '" class="lb_min" ><img src="' + IMA_PATH + '/js/min.gif" border="0"  alt="点击最小"></a>\
							<a href="javascript:;" title= "点击放大" id="maxt' + this.box.tId + '" class="lb_max" ><img src="' + IMA_PATH + '/js/max.gif" border="0"  alt="点击放大"></a>\
							<a href="javascript:;" title= "点击关闭" id="ct' + this.box.tId + '" class="lb_close" ><img src="' + IMA_PATH + '/js/close.gif" border="0"  alt="点击关闭"></a>\
							<div id="tooltip_cts' + this.box.tId + '" class="tooltip_cts" style="z-index:' + this.box.zIndex + '">\
							</div>\
							<div id="bottom' + this.box.tId + '"  class="bottom"></div>';

		tooltip.innerHTML = style_contents;
		bod.appendChild(tooltip);
		Element.show(tooltip);

//		this.cOption.click[this.box.tId] = this.hideTagT.bindAsEventListener(this);
//		this.maxOption.click[this.box.tId] = this.maxT.bindAsEventListener(this);
//		this.minOption.click[this.box.tId] = this.minT.bindAsEventListener(this);
//		this.titleOption.dblClick[this.box.tId] = this.maxT.bindAsEventListener(this);
//
//		Event.observe('ct' + this.box.tId, 'click', this.cOption.click[this.box.tId], false);
//		Event.observe('maxt' + this.box.tId, 'click', this.maxOption.click[this.box.tId], false);
//		Event.observe('mint' + this.box.tId, 'click', this.minOption.click[this.box.tId], false);
//		Event.observe('titlet' + this.box.tId, 'dblclick', this.titleOption.dblClick[this.box.tId], false);
//
//		$('ct' + this.box.tId).onclick = this.empty;
//		$('maxt' + this.box.tId).onclick = this.empty;
//		$('mint' + this.box.tId).onclick = this.empty;
//		$('titlet' + this.box.tId).onclick = this.empty;
//		'undefined' == typeof(Draggable) ? null : new Draggable('tooltip' + this.box.tId, {handle:'titlet' + this.box.tId});
//		
		tooltip = null;
		this.prepareIE('100%', 'hidden');
	},


	addHelpWindow: function(s)
	{
		var bod			= document.getElementsByTagName('body')[0];

		//生成lightbox

		var lb			= document.createElement('div');
		lb.id			= 'lightbox_help';
		lb.className 	= 'lightbox loading no_scroll';
		lb.style.zIndex = 499;

		// lightbox中放入表现形式,调用样式类生成
		var style_contents = '<!--div id="title_help"  class="title"><div><span id="tc_help" class="title_text">&nbsp;</span>\
							<a href="javascript:;" title= "点击最小" id="min_help" class="lb_min" ><img src="' + IMA_PATH + '/js/min.gif" border="0"  alt="点击最小"></a>\
							<a href="javascript:;" title= "点击放大" id="max_help" class="lb_max" ><img src="' + IMA_PATH + '/js/max.gif" border="0"  alt="点击放大"></a>\
							</div></div-->\
							<a href="javascript:;" title= "点击关闭" id="c_help" class="lb_close"  onclick="Element.hide(\'lightbox_help\')"><img src="' + IMA_PATH + '/js/close.gif" border="0"  alt="点击关闭"></a>\
							<div id="lbContainer_help" class="lbContainer no_scroll" style="z-index:' + this.box.zIndex + '">\
								<div  id="contents_help" class="contents no_scroll"><iframe class="help_iframe" id="help_url"  width="100%" height="524" frameborder="0" scrolling="no" src="javascript:false;" style="background:transparent;" ></iframe></div>\
							</div>\
							<div id="lbLoadMessage_help"  class="lbLoadMessage">' + '<img src="' + IMA_PATH + '/js/loading2.gif">' + '</div>\
							<div id="bottom_help"  class="bottom"></div>';
		lb.innerHTML	= style_contents;

		bod.appendChild(lb);

//		this.cOption.click[this.box.id] = this.remove.bindAsEventListener(this);
//		this.maxOption.click[this.box.id] = this.max.bindAsEventListener(this);
//		this.minOption.click[this.box.id] = this.min.bindAsEventListener(this);
//		this.titleOption.dblClick[this.box.id] = this.max.bindAsEventListener(this);
//
//		Event.observe($('c' + this.box.id), 'click', this.cOption.click[this.box.id], false);
//		Event.observe($('max' + this.box.id), 'click', this.maxOption.click[this.box.id], false);
//		Event.observe($('min' + this.box.id), 'click', this.minOption.click[this.box.id], false);
//		Event.observe($('title' + this.box.id), 'dblclick', this.titleOption.dblClick[this.box.id], false);
//
//		$('c' + this.box.id).onclick = $('max' + this.box.id).onclick = $('min' + this.box.id).onclick = $('title' + this.box.id).onclick = this.empty;

		bod = null;
		style_contents = null;
		lb = null;

		Element.hide('lbLoadMessage_help'); //屏蔽默认显示加载框,什么都不显示,需要加载的,单独打开
		console.info('生成帮助窗口');

		'undefined' == typeof(Draggable) ? null : new Draggable('lightbox_help');
	},


	addMsgWindow: function(s)
	{
		this.box.zIndex ++ ;

		var bod			= document.getElementsByTagName('body')[0];

		//生成遮罩
		var overlay		= document.createElement('div');
		overlay.id		= 'overlay_msg';
		overlay.className 	= 'overlay';
		overlay.style.zIndex =  this.box.zIndex ;

		var pg = getPageSize();
		overlay.style.height = pg[1] + 'px'; ;

		//生成lightbox
		this.box.zIndex ++ ;
		var lb			= document.createElement('div');
		lb.id			= 'lightbox_msg';
		lb.className 	= 'lightbox loading';
		lb.style.zIndex =  this.box.zIndex;

		// lightbox中放入表现形式,调用样式类生成
		var style_contents = '<div id="lbContainer_msg" class="lbContainer" style="z-index:50001">\
								<div  id="contents_msg" class="contents"><table  style="width:100%;height:100%;text-align: center;"  id="lbTbale_msg" ><tr><td><table  style="width:1%;height:1%;text-align: center;" align="center" ><tr><td id="contents_table_msg"></td></tr></table></td></tr></table></div>\
							</div>\
							<div id="lbLoadMessage_msg"  class="lbLoadMessage"><img src="' + IMA_PATH + '/js/loading2.gif" /></div>\
							<div id="bottom_msg"  class="bottom"></div>';
		lb.innerHTML	= style_contents;
		bod.appendChild(overlay);
		bod.appendChild(lb);

		bod = null;
		pg = null;
		style_contents = null;
		overlay = null;
		lb = null;

		Element.show('lbLoadMessage_msg');

		var lb = $('lightbox_msg');
		var lct =$('lbContainer_msg');
		var ct = $('contents_msg');

		var w=100;
		var h=100;

		var arrayPageScroll = getPageSize();
		var lightboxTop = ((arrayPageSize[3] - 35 - h) / 2);
		var lightboxLeft = ((arrayPageSize[0] - 20 - w) / 2);

		if (Prototype.Browser.IE && !Prototype.Browser.IE7)
		{
			Position.prepare();
			lightboxTop += Position.deltaY;
		}

		lct.style.width = w + "px";
		lct.style.height = h + "px";

		lb.style.width = w + "px";
		lb.style.height = h + "px";
		lb.style.top = (lightboxTop < 0) ? "0px" : lightboxTop + "px";
		lb.style.left = (lightboxLeft < 0) ? "0px" : lightboxLeft + "px";
		lb.style.margin = '0px';

		this.prepareIE('100%', 'hidden');
	},


	/**
	 * 返回提示消息框
	 *
	 * @access	public
	 */
	getMsgBox: function(c, w)
	{
		var msgBox = '<div class="fl" style="width:430px;"><div class="new_help_tbg fl" style="width:430px;"><div class="fl new_help_a">系统提示</div><div class="fr new_help_b">&nbsp;</div></div><div class="new_help_c fl"><div class="new_help_d fl ffffff" style="width:402px; text-align:center; line-height:28px; min-height:60px;">#{msg}</div></div><div class="new_help_e fl"><div class="new_help_f fl"><div class="new_help_g fl" style="width:402px;height:28px">';
		if (c)
		{
					msgBox += '<img class="lbAction" rel="remove" src="http://static.sg.9wee.com/newsg/n_gb.gif"/>';
		}
		msgBox += '</div></div></div></div>';

		return msgBox;
	},

	/**
	 * 默认提示
	 *
	 * @access	public
	 */
	showMsgBox: function(msg_contents, c, t, w)
	{
		this.getMsgBox(c, w);
		var tpl = new Template(this.getMsgBox(c, w));
		var msg = {msg:msg_contents};

		var msg_box = tpl.evaluate(msg);

		if (!t)
		{
			t = 'n';
		}

		msg_contents = c = t = w = null;
		msg = null;
		tpl = null;

		return mask.processInfo(msg_box, t);
	},


	/**
	 * Turn everything on - 调整IE问题
	 *
	 * @access	public
	 */
	activate: function()
	{
		if (Prototype.Browser.IE)
		{
			//this.getScroll();
			this.prepareIE('100%', 'hidden');
			//this.setScroll(0, 0);
			this.hideSelects('hidden');
		}

		this.displayLightbox("block");
	},

	/**
	 * Ie requires height to 100% and overflow hidden or else you can scroll down past the lightbox
	 *
	 * @param Int		height		Body 高度
	 * @param String	overflow	Body overflow
	 *
	 * @access	public
	 */
	prepareIE: function(height, overflow)
	{
		var bod = document.getElementsByTagName('body')[0];
		bod.style.height = height;
		//bod.style.overflow = overflow;

		var htm = document.getElementsByTagName('html')[0];
		htm.style.height = height;
		//htm.style.overflow = overflow;

		bod = null;
		htm = null;
	},

	/**
	 * 解决Ie  select 控件z-index总是最高bug
	 *
	 * @param String	visibility	style.display
	 *
	 * @access	public
	 */
	hideSelects: function(visibility)
	{
		var selects = null;

		//显示隐藏问题
		if ('hidden' == visibility)
		{
			if (1 == this.box.id)
			{
				selects = document.getElementsByTagName('select');
			}
			else
			{
				var i = this.box.id - 1 ;
				selects = $('lightbox' + i).getElementsByTagName('select');
			}
		}
		else
		{
			if (1 == this.box.id)
			{
				selects = document.getElementsByTagName('select');
			}
			else
			{
				var i = this.box.id - 1 ;
				selects = $('lightbox' + i).getElementsByTagName('select');
			}
		}


		for(i = 0; i < selects.length; i++)
		{
			selects[i].style.visibility = visibility;
		}

		selects = null;
	},

	/**
	 * 处理滚动条
	 *
	 * @access	public
	 */
	getScroll: function()
	{
		Position.prepare();
		this.yPos = Position.deltaY;
	},

	/**
	 * 重新设置滚动位置
	 *
	 * @access	public
	 */
	setScroll: function(x, y)
	{
		window.scrollTo(x, y);
	},

	/**
	 * 显示还是隐藏控件
	 *
	 * @param String	display	style.display
	 *
	 * @access	public
	 */
	displayLightbox: function(display)
	{
		$('overlay' + this.box.id).style.display = display;
		$('lightbox' + this.box.id).style.display = display;
	},

	// Begin Ajax request based off of the href of the clicked linked
	// Display Ajax response or text
	/**
		arg = {
			text:'msg',
			type:'n' or 'o'
			method: 'post',
			parameters: ""
		}
	*/
	/**
	 * DAjax取得数据
	 *
	 * @param String	url		请求地址
	 * @param Object	arg		请求附带的参数
	 *
	 * @access	public
	 */
	loadInfo: function(url, arg)
	{
		if (!url)
		{
			return false;
		}

		var option = {option:{onSuccess:this.responseData.bind(this), lbType:'n' }, logic:{type:"e"}};
		Object.extend(option, arg);
		this.ajaxId ++ ;


		//DHistory.add('mask.loadInfo_' + url , arguments);


		option.option.onSuccess = this.responseData.bind(this);

		//可以判断类是否初始化,暂时没有判断, ( 消息机制错乱,问题严重,可能用法取消,或者重新编码解决) -> 已经解决
		this.ajaxObj[this.ajaxId] = new DAjax(url, option);
		this.ajaxObj[this.ajaxId].sendRequest();

		option = null;
		url = null;
	},

	/**
	 * 处理DAjax返回数据
	 *
	 * @param Object	response	response
	 * @param Object	ajaxObj		DAjax句柄
	 *
	 * @access	public
	 */
	responseData : function(response, ajaxObj)
	{
		this.processInfo(response.responseText, ajaxObj.lbType);
		this.ajaxObj[this.ajaxId] = null;
		this.ajaxId --;

		response = null;
		ajaxObj.msg.removeMessage();
		ajaxObj.collectCarbage();

		ajaxObj = null;
	},

	/**
	 * 显示数据
	 *
	 * @param Object	response	response
	 * @param String	type		显示类型
	 * @param String	title		显示标题
	 *
	 * type == t , tooltip                
	 * type == n , 生成新box内容信息  == new 
	 * type == o , 覆盖当前box内容信息 == old 
	 * type == i , image, type相当于 new    
	 * 
	 * @access	public
	 */
	processInfo: function(response, type, title)
	{
		if ('t' == type)
		{
			//未和id绑定,会导致错乱
			Element.show('tooltip' + this.box.tId);
			$('tooltip_cts' + this.box.tId).update(response);
			this.actions($('tooltip_cts' + this.box.tId));

			response = null;
			return false;
		}

		//窗口默认大小
		var w = 1000;
		var h = 620;
//console.info((new	Date()).getTime());
		//因为有覆盖问题,所以.. ..
		if ('o' == type)
		{
			if (!this.box.id)
			{
				type = 'n';
				this.addLightboxMarkup();
				this.activate();
			}
		}
		else
		{
			this.addLightboxMarkup();
			this.activate();
		}

		$('tc' + this.box.id).update(title);

//console.info((new	Date()).getTime());

		var lb = $('lightbox' + this.box.id);
		var lct =$('lbContainer' + this.box.id);
		var ct = $('contents' + this.box.id);
		var ctt = $('contents_table' + this.box.id);
		var ctable = $('lbTbale' + this.box.id);

		if ('o' == type)
		{
			ctt.update(response);
			//new Insertion.Top(ctt, '<div  class="sg_jz_b_bg_new"><img src="' + IMA_PATH + '/main/jz_b_6.gif" rel="remove" class="lbAction" style="float:right;"  /></div>');

			resizeLightBox();
		}
		else
		{
			//如果是图片
			if ('i' == type)
			{
				w = h = 100;

				resizeLightBox();
				//打开加载显示框
				Element.show('lbLoadMessage' + this.box.id );

				//prototype_1.6.0_rc0.js  降低到prototype_1.5.1.js bug 解决
				//var objImage = document.createElement("img");
				//objImage.setAttribute('id','lightboxImage' + this.box.id);
				var objImage = '<img id="lightboxImage' + this.box.id +'" border="0" />';

				lct.style.overflow = 'visible' ;
				ctt.update(objImage);

				objImage = $('lightboxImage' + this.box.id);

				//点击关闭
				Event.observe(objImage, 'click', this.remove.bind(this), false);

				// preload image
				imgPreload = new Image();

				imgPreload.onload=function()
				{
					objImage.src = response;
					// center lightbox and make sure that the top and left values are not negative
					// and the image placed outside the viewport
					w = imgPreload.width;
					h = imgPreload.height;

					ct.style.width = w + "px";
					ct.style.height = h + "px";

					// A small pause between the image loading and displaying is required with IE,
					// this prevents the previous image displaying for a short burst causing flicker.
					if (Prototype.Browser.IE)
					{
						//pause(250);
						//pause(25);
					}

					imgPreload.onload=function(){};	//	clear onLoad, as IE will flip out w/animated gifs

					resizeLightBox();
					lb.removeClassName("loading");
					response = null;
					return false;
				};

				imgPreload.src = response;
			}
			else
			{
				ctt.update(response);
				//new Insertion.Top(ctt, '<div  class="sg_jz_b_bg_new"><img src="' + IMA_PATH + '/main/jz_b_6.gif" rel="remove" class="lbAction" style="float:right;"  /></div>');


				resizeLightBox();
				lb.removeClassName("loading");
			}

			//Effect.Appear($('overlay' + this.box.id), {to: 0.5, from: 0.0});

			Element.show($('overlay' + this.box.id));
			lb.addClassName("done");
		}

		//效果
		//Effect.Grow('lbContainer' + this.box.id,{});
		//Effect.SlideDown(lct,{});
		if('undefined' != typeof(Effect))
		{
			//Effect.Grow(lct,{duration:2.0});
		}

		function resizeLightBox()
		{
			var arrayPageScroll = getPageSize();
			var lightboxTop = ((arrayPageSize[3] - 35 - h) / 2);
			var lightboxLeft = ((arrayPageSize[0] - 20 - w) / 2);

			if (Prototype.Browser.IE && !Prototype.Browser.IE7)
			{
				Position.prepare();
				lightboxTop += Position.deltaY;
			}

			
			ctable.style.width = w + "px";
			ctable.style.height = h + "px";



			ct.style.width = w + "px";
			ct.style.height = h + "px";

			lct.style.width = w + "px";
			lct.style.height = h + "px";

			lb.style.width = w + "px";
			lb.style.height = h + "px";
			lb.style.top = (lightboxTop < 0) ? "0px" : lightboxTop + "px";
			lb.style.left = (lightboxLeft < 0) ? "0px" : lightboxLeft + "px";
			lb.style.margin = '0px';
		}

		//resize('lbContainer' + this.box.id, 'contents' + this.box.id);
		//如果ajax取得数据,取回的数据是否要处理?
		this.actions(lb);
//console.info((new	Date()).getTime());
		if('undefined' != typeof(Effect))
		{
			//Effect.SlideDown('title' + this.box.id,{duration:1.0});
		}

		Element.hide('title' + this.box.id);
		//setTimeout("mask.drag()", 1000);

		response = null;
		lb = null;
		lct = null;
		ct = null;
		ctt = null;
		ctable = null;

		return this.box.id;
	},

	/**
	 * 
	 *
	 * @access	public
	 */
	drag: function()
	{
		try
		{
			//拖动
			if('undefined' != typeof(Draggable))
			{
				new Draggable($('lightbox' + this.box.id), {handle:'title' + this.box.id});
			}
		}
		catch(e)
		{}
	},

	/**
	 * 添加事件 Search through new links within the lightbox, and attach click event
	 * 
	 * @access	public
	 */
	actions: function(id)
	{
		var lbActions = $(id).getElementsByClassName('lbAction');

		for(i = 0; i < lbActions.length; i++)
		{
			//Event.observe(lbActions[i], 'click', this[lbActions[i].rel].bindAsEventListener(this), false);
			Event.observe(lbActions[i], 'click', this[lbActions[i].getAttribute('rel')].bind(this), false);
			lbActions[i].onclick = this.empty;
		}
		lbActions = null;

		var lbox = $(id).getElementsByClassName('O');

		for(i = 0; i < lbox.length; i++)
		{
			mask.tag(lbox[i]);
		}
		lbox = null;

		//处理tooltip
		lbox = $(id).getElementsByClassName('T');

		for(i = 0; i < lbox.length; i++)
		{
			mask.tagT(lbox[i]);
		}

		lbox = $(id).getElementsByClassName('TS');

		for(i = 0; i < lbox.length; i++)
		{
			mask.tagTS(lbox[i]);
		}

		lbox = null;

	},

	/**
	 * 用于解决内存泄漏问题,暂时不处理.
	 *
	 * @access	public
	 */
	deActions: function()
	{
		this.restoreData[this.box.id] = false;
	},

	/**
	 * 用于解决内存泄漏问题,暂时不处理.
	 *
	 * @access	public
	 */
	deEvent: function(id)
	{
		var lbActions = $(id).getElementsByClassName('lbAction');

		for(i = 0; i < lbActions.length; i++)
		{
			lbActions[i].stopObserving('click');
		}

		lbActions = null;

		var lbox = $(id).getElementsByClassName('O');

		for(i = 0; i < lbox.length; i++)
		{
			lbox[i].stopObserving('click');
		}
		lbox = null;

		//处理tooltip
		lbox = $(id).getElementsByClassName('T');

		for(i = 0; i < lbox.length; i++)
		{
			lbox[i].stopObserving('click');
		}

		lbox = $(id).getElementsByClassName('TS');

		for(i = 0; i < lbox.length; i++)
		{
			lbox[i].stopObserving('click');
			lbox[i].stopObserving('mouseover');
			lbox[i].stopObserving('mouseout');
			lbox[i].stopObserving('mousemove');
			lbox[i].stopObserving('blur');
		}

		lbox = null;
	},

	/**
	 * 处理自定义函数.
	 *
	 * @access	public
	 */
	insert: function(e)
	{
		var link = Event.element(e).parentNode;
		var type = 'n';

		if (isSet(link.type))
		{
			type = link.type;
		}

		this.loadInfo(link.href, {option:{lbType:type}});
	},

	/**
	 * 处理自定义函数.
	 *
	 * @access	public
	 */
	deactivate: function(e)
	{
		this.remove(e);
	},

	/**
	 * @access	public
	 */
	remove: function(e)
	{

		try 
		{
			if (intVal(this.box.id))
			{
				this.deEvent($('overlay' + this.box.id));
				this.deEvent($('lightbox' + this.box.id));

				this.deActions();
				Element.remove($('overlay' + this.box.id));
				Element.remove($('lightbox' + this.box.id));

				if (Prototype.Browser.IE)
				{
					if (1 == this.box.id)
					{
						this.prepareIE("auto", "auto");
					}

					this.hideSelects("visible");
					//this.setScroll(0, this.yPos);
				}

				this.box.id --;
				this.box.zIndex = this.box.zIndex -2  ;
				//this.displayLightbox("none");
			}
		}
		catch(e)
		{}

		return false;
	},

	/**
	 * @access	public
	 */
	removeMsg: function(e)
	{

		try 
		{
				Element.remove($('overlay_msg'));
				Element.remove($('lightbox_msg'));

				if (Prototype.Browser.IE)
				{
					if (1 == this.box.id)
					{
						this.prepareIE("auto", "auto");
					}

					this.hideSelects("visible");
					//this.setScroll(0, this.yPos);
				}

				this.box.zIndex = this.box.zIndex -2  ;
		}
		catch(e)
		{}

		return false;
	},

	/**
	 * @access	public
	 */
	removeById: function(id)
	{
		if (intVal(this.box.id) == id)
		{
			this.remove();
		}

		return false;
	},

	/**
	 * @access	public
	 */
	setRestoreData: function(lb)
	{
		var currentStyle = {};
		['top', 'left', 'width', 'height', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth', 'borderBottomWidth'].each(function(s) {currentStyle[s] = lb.getStyle(s)});

		if (!this.restoreData[this.box.id])
		{
			this.restoreData[this.box.id] = currentStyle;
		}

		return currentStyle;
	},

	/**
	 * @access	public
	 */
	max: function()
	{
		
		Element.show('lbContainer' + this.box.id);
		var lb = $('lightbox' + this.box.id);

		var currentStyle = this.setRestoreData(lb);;

		if (!this.restoreData[this.box.id])
		{
			this.restoreData[this.box.id] = currentStyle;
		}

		if (Object.toJSON(currentStyle)!=Object.toJSON(this.maxStyle))
		{
			lb.setStyle(this.maxStyle);
			this.getScroll();
			this.setScroll(0, 0);
			
		}
		else
		{
			lb.setStyle(this.restoreData[this.box.id]);
			this.setScroll(0, this.yPos);
		}

		//resize('lbContainer' + this.box.id, 'contents' + this.box.id);
		//resizeBodyText('lbContainer' + this.box.id, 'contents' + this.box.id);
		return false;
	},

	/**
	 * @access	public
	 */
	restore: function()
	{
	},

	/**
	 * @access	public
	 */
	min: function()
	{
		Element.hide('lbContainer' + this.box.id);
		var lb = $('lightbox' + this.box.id);
		this.setRestoreData(lb);

		lb.setStyle(this.minStyle);
		return false;
	},

	/**
	 * 处理LightBox.
	 *
	 * @access	public
	 */
	tag: function(ctrl)
	{
		this.content = ctrl.href;
		Event.observe(ctrl, 'click', this.doTag.bind(this), false);
		ctrl.onclick = this.empty;
	},

	doTag : function(event)
	{
		//触发事件bug问题
		var elt = Event.element(event);
		
		//var elt = Event.findElement(event, 'A');  如下可兼容非A标签
		if ('O' != elt.className)
		{
			elt = elt.up('.O');
		}

		var matchPic = new RegExp("^(http|https|ftp|mms|rtsp)://[A-Za-z0-9\./=\?%_~@#:;\+\-]*[\.]+(gif|jpg|png)+$", "ig");
		if(matchPic.test(elt.href))
		{
			this.processInfo(elt.href, 'i');
		}
		else
		{
			this.loadInfo(elt.href, {option:{lbType:'n'}});
		}
	},

	tooltip: function(response, type)
	{
	},
	
	/**
	 * 处理Tooltip.
	 *
	 * @access	public
	 */
	tagT: function(ctrl)
	{
		this.content = ctrl.href;
		Event.observe(ctrl, 'click', this.doTagT.bind(this), false);
		//Event.observe(ctrl, 'mouseout', this.hideTagT.bindAsEventListener(this), false);
		ctrl.onmouseover = this.empty;
		ctrl.onclick = this.empty;
	},

	hideTagT : function(event)
	{
		//触发事件bug问题
		var elt = Event.element(event);
		
		if ('lb_close' != elt.className)
		{
			elt = elt.up('.lb_close');
		}
		var id = elt.id.substr(2);

		this.box.zIndex -= 2  ;
		Element.hide('tooltip' + id);
	},

	/**
	 * @access	public
	 */
	setRestoreTData: function(t)
	{
		var currentStyle = {};
		['top', 'left', 'width', 'height', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth', 'borderBottomWidth'].each(function(s) {currentStyle[s] = t.getStyle(s)});

		if (!this.restoreTData[t.id])
		{
			this.restoreTData[t.id] = currentStyle;
		}

		return currentStyle;
	},

	/**
	 * @access	public
	 */
	maxT: function(e)
	{
		//触发事件bug问题
		var elt = Event.element(e);
		var id =  null;

		if ('title' == elt.className)
		{
			id = elt.id.substr(6);
		}
		else if ('lb_max' != elt.className)
		{
			elt = elt.up('.lb_max');
			id = elt.id.substr(4);
		}

		Element.show($('tooltip_cts' + id));
		var t = $('tooltip' + id);

		var currentStyle = this.setRestoreTData(t);

		if (!this.restoreTData[t.id])
		{
			this.restoreTData[t.id] = currentStyle;
		}

		if (Object.toJSON(currentStyle)!=Object.toJSON(this.maxStyle))
		{
			t.setStyle(this.maxStyle);
			this.getScroll();
			this.setScroll(0, 0);
		}
		else
		{
			t.setStyle(this.restoreTData[t.id]);
			
			this.setScroll(0, this.yPos);
		}

		return false;
	},


	/**
	 * @access	public
	 */
	minT: function(e)
	{
		//触发事件bug问题
		var elt = Event.element(e);
		
		if ('lb_min' != elt.className)
		{
			elt = elt.up('.lb_min');
		}

		var id = elt.id.substr(4);
		var t = $('tooltip' + id);

		this.setRestoreTData(t);
		Element.hide($('tooltip_cts' + id));

		this.setRestoreData(t);

		t.setStyle(this.minStyle);
		return false;

	},

	doTagT : function(event)
	{
		var defaults = {t:"", c:""};
		var options = {};
		var elt = Event.element(event);

		if (!arguments[1])
		{
			if ('T' != elt.className)
			{
				elt = elt.up('.T');
			}

			options.t = elt.innerHTML.escapeHTML();

			if (elt.getAttribute('msg'))
			{
				options.c = elt.getAttribute('msg');
			}
			else
			{
				options.c = elt.getAttribute('title');
			}
			
		}
		else
		{
			options = Object.extend(defaults, arguments[1] || {});

			if (!options.c)
			{
				alert('wrong');
				return ;
			}
		}


		options.x = Event.pointerY(event);
		options.y = Event.pointerX(event);

		this.addWindow(event, options);


		if (options.c)
		{
			this.processInfo(options.c, 't');
		}
		else
		{
			var matchUrl = new RegExp("^(http|https)://[A-Za-z0-9\./=\?%_~@#:;\+\-]*[\.]+(php|html|htm|jsp|py|pl)+$", "ig");
			if(matchUrl.test(elt.href))
			{
				this.processInfo('<div id="tooltip_loading"><img src="' + IMA_PATH + '/js/loading2.gif"/></div>', 't');
				this.loadInfo(elt.href, {option:{lbType:'t'}});
			}
			else
			{
				var msg = elt.getAttribute('msg');

				if (!msg)
				{
					msg = elt.getAttribute('title');
				}

				this.processInfo(msg, 't');		
			}

		}
	},

	/**
	 * 处理Tooltip 唯一.
	 *
	 * @access	public
	 */
	tagTS: function(ctrl)
	{
		var msg = ctrl.getAttribute('msg');

		if (!msg)
		{
			msg = ctrl.getAttribute('title');
			ctrl.setAttribute("msg", msg);
		}
		
		ctrl.title = '';
		
		Event.observe(ctrl, 'mouseover', this.doTagTS.bind(this), false);
		Event.observe(ctrl, 'mouseout', this.hideTagTS.bind(this), false);
		Event.observe(ctrl, 'mousemove', this.moveTagTS.bind(this), false);
		Event.observe(ctrl, 'blur', this.hideTagTS.bind(this), false);
		ctrl.onmouseover = this.empty;
		ctrl.onmouseout = this.empty;
		ctrl.onmousemove = this.empty;
		ctrl.onblur = this.empty;
		ctrl = null;
	},

	doTagTS : function(event)
	{
		if (this.ajaxId)
		{
			//return false;
		}

		var options = {};
		var elt = Event.element(event);

		if (!elt.hasClassName('TS'))
		{
			elt = elt.up('.TS');
		}

		try
		{
			var msg = elt.getAttribute('msg');
			if (!msg)
			{
				msg = elt.getAttribute('title');
			}
		}
		catch(e)
		{
			return false;
		}


		Position.prepare();
		$('tooltip_singleton_cts_text').update(msg);

		Element.show('tooltip_singleton');
//		if('undefined' != typeof(Effect))
//		{
//			if (this.tooltipSingleton[1])
//			{
//				this.tooltipSingleton[1].cancel(); 
//				this.tooltipSingleton[1] = null;
//			}
//
//			this.tooltipSingleton[0] = Effect.Appear($('tooltip_singleton'), {to: 0.95, from: 0.0});
//			//Effect.Appear('tooltip_singleton');
//		}
//		else
//		{
//			Element.show('tooltip_singleton');
//		}
		
		if (Prototype.Browser.IE)
		{
			//this.prepareIE('100%', 'hidden');
		}

		try
		{
			var func = elt.getAttribute('func');

			if (func)
			{
				eval(func + 'oe(elt);');
			}
		}
		catch(e)
		{
		}

		options = null;
		msg = null;
		elt = null;
	},

	moveTagTS : function(event)
	{
		var w = $('tooltip_singleton').getWidth();
		var h = $('tooltip_singleton').getHeight();

		//arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight) 
		var arrayPageScroll = getPageSize();


		var wh = Event.pointerY(event) - Position.deltaY;
		var ww = Event.pointerX(event) - Position.deltaX;

		var k = 0;
		var g = 0;
		if (ww + w + 10 > arrayPageSize[2])
		{
			k = -w - 10;
		}
		else
		{
			k = 10;
		}

		if (wh + h + 35 > arrayPageSize[3])
		{
			g = -h - 10;
		}
		else
		{
			g = 10;
		}


		$('tooltip_singleton').style.top = (Event.pointerY(event) + g) + 'px';
		$('tooltip_singleton').style.left = (Event.pointerX(event) + k) + 'px';

		w = null;
		h = null;
		wh = null;
		ww = null;
		k = null;
		j = null;
	},

	hideTagTS : function(event)
	{
		Element.hide('tooltip_singleton');
//		if('undefined' != typeof(Effect))
//		{
//			if (this.tooltipSingleton[0])
//			{
//				this.tooltipSingleton[0].cancel(); 
//				this.tooltipSingleton[0] = null;
//			}
//
//			Element.hide('tooltip_singleton');
//			//this.tooltipSingleton[1] = Effect.Fade('tooltip_singleton');
//		}
//		else
//		{
//			Element.hide('tooltip_singleton');
//		}
		

		if (Prototype.Browser.IE)
		{
			//this.prepareIE('auto', 'auto');
		}

		//
		var elt = Event.element(event);

		if (!elt.hasClassName('TS'))
		{
			elt = elt.up('.TS');
		}

		try
		{
			var func = elt.getAttribute('func');

			if (func)
			{
				eval(func + 'ot(elt);');
			}
		}
		catch(e)
		{
		}

		elt = null;
	}
};

var	mask = new LightBox();

/**
 * 初始化.
 *
 * @access	public
 */
function initialize()
{
	var lbox = document.getElementsByClassName('O');

	for(i = 0; i < lbox.length; i++)
	{
		mask.tag(lbox[i]);
	}
	
	//处理tooltip
	lbox = document.getElementsByClassName('T');

	for(i = 0; i < lbox.length; i++)
	{
		mask.tagT(lbox[i]);
	}

	lbox = document.getElementsByClassName('TS');

	for(i = 0; i < lbox.length; i++)
	{
		mask.tagTS(lbox[i]);
	}

	try 
	{
		init();
	}
	catch(e)
	{}

	lbox = null;
};


Event.observe(window, 'load', initialize, false);

/**
 * @Copyright (c) 2005, 上海鸿域信息科技有限公司 
 * @All rights reserved.
 *
 *
 *
 * @file_name   Message.js
 * @version     1.0
 * @author      黄新泽
 * @date        2007-10-08 16:09:40
 */

/**
 * Class and Function List:
 * Function list:
 * - function onscrollOpration(ev)         
 * - initialize : function(id, msg, state) 
 * - showMessage : function()              
 * - removeMessage : function()            
 * - failure : function()                  
 * - isSet : function(arg)                 
 * Classes list:
 * - .Message
 */


//圆角DIV
//var roundCorners = Rico.Corner.round.bind(Rico.Corner);

document.write('<div   id="message_contain"  class="m_container"></div>');

function onscrollOpration(ev)
{
	Position.prepare();
	scrollTopSize = Position.deltaY;

	$("message_contain").style.top = (scrollTopSize	+ 22) +	"px";

};

Event.observe(window, 'scroll', onscrollOpration, false);

var	Message = Class.create();
Message.prototype	= 
{

	initialize : function(id, msg, state) 
	{
		this.messageState			= state						;	//是否显示提示消息
		//this.messageState			= false						;	//是否显示提示消息
		this.messageId				= id						;	//提示消息ID
		this.loadMessage			= msg						;
		this.loadCount				= 0							;
	},


	showMessage : function()
	{
		if (!this.messageState)
		{
			return false;
		}

		if ('mask' == this.messageState)
		{
			mask.addMsgWindow();
		}
		else
		{
			this.loadCount++ ; 
			var html='<div id="'+this.messageId+'" class="m_message"> '+this.loadCount+":"+this.loadMessage+'</div>';


			var msg= this.loadCount+":"+this.loadMessage;

			if(1 == this.loadCount)
			{
				new Insertion.Top($('message_contain'), html);
			}
			else
			{
				try	
				{
					$(this.messageId).innerHTML	= msg;
				}
				catch (e)
				{
					this.loadCount -= 2;
				}
				
			}

			html = msg = null;

			setTimeout(this.removeMessage.bind(this), 16000);
		}
	},

	removeMessage : function()
	{
		if (!this.messageState)
		{
			return false;
		}

		if ('mask' == this.messageState)
		{
			mask.removeMsg();
		}
		else
		{
			if(this.loadCount < 1)
			{
				return ;
			}

			this.loadCount-- ;

			var msg = this.loadCount + ":" + this.loadMessage ;
			
			if(this.loadCount	< 1)
			{
				//alert(this.messageId);
				Element.remove(this.messageId);
			}
			else
			{
				//alert(this.messageId+":>1");
				try	
				{
					$(this.messageId).innerHTML	= msg;
				}
				catch (e)
				{
					this.loadCount--;
				}
			}
		}


	},

	failure : function()
	{
		var	eR = '';

		if (!$A(arguments))
		{
			eR = ' 失败!';

			if (this.isSet(this.errorMessage))
			{
				eR = '未成功 <br />原因：' + this.errorMessage; 
			}
		}
		else
		{
			eR = '';
		}
		
		if ($(this.messageId))
		{
			$(this.messageId).update(this.loadCount	+ " : " +	this.loadMessage + eR);	
			Effect.Shake($(this.messageId));

			//后面显示this.loadMessage,提示信息没有改变
			setTimeout(this.removeMessage.bind(this), 3000);
		}

	},

	m : function (msg) 
	{
		this.loadMessage= msg;
		this.showMessage();
		this.failure();

	},

	isSet : function(arg)
	{
		return 'undefined' != typeof(arg) ?	true : false;
	}
};

var M = new Message('MHXZ', '发生错误', true);/**
 * @Copyright (c) 2005,闲情网站
 * @All rights reserved.
 *
 * Ajax 应用类
 *
 * @file_name   DAjax.js
 * @version     2.0
 * @author      黄新泽
 * @create      2005-05-06
 * @update      2007-09-27 14:45:42
 */

/**
 * Class and Function List:
 * Function list:
 * - initialize(path, requestLogic, queryKey, setResponseKey)
 * - complete(transport)
 * - setResponseData(transport)
 * - setResponseCtl(ctlName, fldName)
 * - formSerialize()
 * - sendRequest(q)
 * - rand()
 * - isSet(arg)
 * - isTrue(v)
 * Classes list:
 * - DAjax
 */
/**
 *	var logic = {ajaxId:"user_data", act:"findUserRp",  type:"o", cla:"UserRp:username", operateType:"class"};
 *	var ctl = ['username', 'pass'];
 *
 *	var user = new DAjax({url:"../gateway/user_info.php", message:"读取用户信息...", onSuccess:onSuccess }, logic, {}, ctl);
 *
 */


var	DAjax =	Class.create();
DAjax.prototype	= 
{
	className : 'DAjax',
	lbType : 'n',
	debug	: true,
	request:{num:0},


	/**
	 * 构造函数
	 *
	 * @param Object	path				ajax request url/msg
	 * @param Object	option				option
	 * @param Object	requestLogic	contain 'ajaxId act type'
	 * @param Array		queryKey			query key
	 * @param Array or Object	setResponseKey	ctl set key
	 *
	 * TODO:更改后为option:{ option, requestLogic, queryKey, setResponseKey}
	 * @access	public 
	 */
	initialize : function(url, option) 
	{
		this.url				= null;
		this.eTarget			= null;
		this.option				= {formName: null, method:"post", messageState:true, message:"服务通信中,请稍候...", page:null,  lbType:"n"};
		this.requestLogic		= {ajaxId: '_' + this.rand(), act:"d", type:"o", cache:false};
		this.queryKey			= null;			//数组，传递给后台的要查询的字段，
		this.setResponseKey		= null;			//数组或者是关联数组，得到返回的数据后，要设置数据的客户端控件

		this.url	= url;
		Object.extend(this.option, option ? option.option : {});
		Object.extend(this.requestLogic, option ? option.logic : {});
		this.queryKey = option ? option.queryKey : {};
		this.setResponseKey = option ? option.setResponseKey : {};

		this.queryString = $H(this.requestLogic).toQueryString();
		this.eTarget	 = this.requestLogic.ajaxId;

		//关联数组，多记录，要传送的查询的数据,数据要在真正查询的时候才能被正确设置
		this.queryData				= {}						;	
		this.responseRows			= 0							;	//返回查询数据的行数
		this.error					= 0							;	//返回是否有误

		this.setResponseRowKey		= new Array()				;	//数组或者是关联数组，得到返回的数据后，要设置表格数据的客户端控件

		this.onBeforeSend			= function(){this.sendRequestMark = true	; return true;}	;	//发送前和的方法，比如把按钮隐藏起来
		this.onAfterGet				= function(){}				;	//得到数据后执行的方法,不管是否为正确数据!
		this.onComplete				= function(){}				;	//设置数据后执行的方法
		this.onNoneGet				= function(){}				;	//设置未取到值所要执行的方法
		this.collectCarbage			= function(){
			if (Prototype.Browser.IE)
			{
				CollectGarbage(); 
				setTimeout("CollectGarbage();", 1);
			}
		};	

		//初始化提示消息类
		this.messageId				= this.requestLogic.ajaxId + this.rand();	//提示消息ID
		this.msg					= new Message(this.messageId, this.option.message, this.option.messageState);
		

		if(this.isTrue(this.option.page))
		{
			this.page = new Page(this.option.page);
		}

		this.lbType = this.option.lbType;

		//Cache
		if('undefined'!=typeof(Cache) && this.requestLogic.cache)
		{
			this.cache = new Cache(this.requestLogic.ajaxId, this.requestLogic.cache);
		}
		else
		{
			this.cache = false;
		}

	},

	/**
	 * 完成状态方法
	 *
	 * @param Object	transport	ajax response object
	 *
	 * @access	public
	 */
	complete : function(transport)
	{
		if (transport.readyState ==	4) 
		{
			this.request.num--;

			var	status = 0;

			try
			{
				status = transport.status;
			}
			catch(e)
			{
			}

			if (200	!= status) 
			{
				if (this.debug)
				{
					if (status > 10000 || !status)
					{
						//mask.showMsgBox('与服务器通信超时, 请重试! ' + status + ' <br />\n', true);
					}
					else if (status == 499)
					{
						mask.showMsgBox('发生错误!<br />你的卡巴斯基杀毒软件可能运行于家长控制模式下.<br />请修改卡巴斯基:设置->保护->家长控制, 取消家长控制!<br />' , true);
					}
					else if (status < 400)
					{
						
					}
					else
					{
						mask.showMsgBox('与服务器通信超时, 请重试: ' + status + ' <br />\n' , true);
						//transport.responseText.stripTags()
					}
					
				}
				
				this.msg.failure();
			}
		}
	},
	

	/**
	 * 异常处理
	 *
	 * @param Object	transport	ajax response object
	 *
	 * @access	public
	 */
	exception : function(transport, e)
	{
//		var line = 0;
//
//		if (Prototype.Browser.IE)
//		{
//			line = ' 错误类型 : ' + (e.number & 0xFFFF); 
//		}
//		else
//		{
//			line = ' 错误行数 : ' + e.lineNumber;
//		}
//
//		mask.showMsgBox( '发生异常错误, 请将如下内容发送给我们, 谢谢! <br />' + transport.body + '<br />\n 错误位置 : ' + currentTabId + '<br />\n' + line + '<br />\n 错误消息 : ' + e.message , true);
//
//		this.msg.failure();
	},


	/**
	 * 接收数据句柄
	 *
	 * @param Object	transport	ajax response object
	 *
	 * @access	public
	 */
	receiveData : function(transport)
	{
		try
		{
			Element.hide('tooltip_singleton');
		}
		catch(e)
		{
		}

		var	status = 0;

		try
		{
			status = transport.status;
		}
		catch(e)
		{
		}

		if (200	== status) 
		{
			//增加扩展性...... demo  arg 可以通过一个变量来传递,parameters 后来合并,变可以完全兼容
			if (isSet(this.option.onSuccess))
			{
				this.option.onSuccess(transport, this);
			}
			else
			{
				this.setResponseData(transport, this);	
			}

			//Cache
			if(this.cache)
			{
				if (!this.cache.getCache(this.cache.key))
				{
					this.cache.updateCache(this.cache.key, transport);
					return false;
				}

			}
		}
	},

	/**
	 * 响应方法, 设置各种数据
	 *
	 * @param Object	transport	ajax response object
	 *
	 * @access	public
	 */
	setResponseData : function(transport, self) 
	{
		//这里要执行onAfterGet事件
		this.onAfterGet()	;
		var	responseText = transport.responseText;

		//直接返回HTML数据,这样屏蔽了下面的处理数据,返回格式简单
		if ("e" == this.requestLogic.type)
		{
			this.responseData = responseText;

			try
			{
				if ('undefined' != typeof(mask))
				{
					mask.deEvent(this.eTarget);
				}

				$(this.eTarget).update(responseText);

				if ('city_out'==this.eTarget || 'city_in'==this.eTarget)
				{
				}
				else
				{
					if('undefined'!=typeof(Element.lazyload)  && $(this.eTarget))
					{
						//$$('#' + this.eTarget + ' img').invoke('lazyload');
					}
				}

				if ('undefined' != typeof(mask))
				{
					mask.actions(this.eTarget);
				}
				
			}
			catch(e)
			{
			}
			

			if (true)
			{
				this.onComplete(responseText);
			}
			else
			{
				this.onNoneGet();
			}

			if (Prototype.Browser.IE && !Prototype.Browser.IE7) // && !Prototype.Browser.IE7
			{
			}

			responseText = null;
			this.msg.removeMessage();			
			return false;
		}

		var	data = null;

		try
		{
			data = responseText.evalJSON();
		}
		catch(e)
		{
			if (this.option.messageState)
			{
				if (responseText.blank())
				{
					responseText = '发生错误!';
				}
				mask.showMsgBox(responseText, true);
				this.msg.removeMessage();
			}
		}

		responseText = null;

		if (data)
		{
			this.responseMessageData	= data[0] || {num:0, error:1}	; 
			this.responseRows			= parseInt(this.responseMessageData.num);
			this.error					= parseInt(this.responseMessageData.error);
			this.responseData			= data[1] ? data[1] : {}; 

			this.rMsg					=	this.responseMessageData.message;

			//if ($('debug') && data[2])
			if ('undefined' != typeof(data[2]))
			{
				console.debug(data[2]);
				//new Insertion.Bottom($('debug'),  '<br />\n' + data[2]);
			}
			

			//被上面屏蔽掉,暂时不使用
			if ("e" == this.responseMessageData.type)
			{
				$(this.responseMessageData.id).innerHTML = this.responseData;

				if (this.responseRows)
				{
					this.onComplete();
				}
				else
				{
					this.onNoneGet();
				}

				this.msg.removeMessage();
				this.collectCarbage();
				return false;
			}

			if(this.isTrue(this.error))
			{
				this.errorMessage =	this.responseMessageData.message;
				//这里执行onNoneGet
				
				//this.msg.failure();
				this.msg.removeMessage();
				this.onNoneGet();
				data = null;
				this.responseData = null;
				this.collectCarbage();
				return;
			}
			else
			{
				//检测是否需要自动设置客户端控件, 暂时只处理一行的
				if(this.isTrue(this.setResponseKey))
				{
					var	i, ctlName, fldName;

					//如果是数组，而不是关联数组
					if (window.Array == this.setResponseKey.constructor)
					{
						var l = this.setResponseKey.length;
						for	(i=0; i<l; i++)
						{
							ctlName = this.setResponseKey[i] ;
							fldName = ctlName ;
							
							this.setResponseCtl(ctlName, fldName);
						}//end for
					}
					else if(window.Object == this.setResponseKey.constructor)
					{
						for	(i in this.setResponseKey )
						{
							ctlName = i ;
							fldName = this.setResponseKey[i]  ;
							
							this.setResponseCtl(ctlName, fldName);
						}//end for

					}
					else
					{
						alert('setResponseKey Wrong!');
					}
				}

				//执行onComplete
				this.onComplete(data);
			}
		}


		this.msg.removeMessage();	
		data = null;
		this.responseData = null;
		this.collectCarbage();
	},

	/**
	 * 设置控件数据
	 *
	 * @param String	ctlName	control name 
	 * @param String	fldName	control value: always is db field name 
	 *
	 * @access	public
	 */
	setResponseCtl : function(ctlName, fldName)
	{
		//存放某个控件对象
		var ctl = $(ctlName) ;

		var	keyData	=	this.responseData[0] ;
		if(!ctl)
		{
			//alert("无法找到控件 : " + ctlName);
			return	false;
		}

		try 
		{
			if(typeof(keyData[fldName]) === "undefined")
			{
				alert("无法取得该字段的数据:"+fldName);
				return	false;
			}
			else
			{
				ctl.value = keyData[fldName]; 
			}

		}
		catch(e)
		{
			alert(e.message);
		}
	},

	/**
	 * 序列化表单数据
	 *
	 * @return	String	Serialize data
	 *
	 * @access	public
	 */
	formSerialize : function()
	{
		return this.option.formName ? '&' + Form.serialize(this.option.formName) : '';
	},

	/**
	 * 发送Ajax请求
	 *
	 * @param	Object	q	query data
	 *
	 * @access	public
	 */
	sendRequest : function(ctl, q) 
	{
		//如果一段时间后用户没有操作页面,则停止发送ajax请求
		if ('undefined' != typeof(active))
		{
			if (!active)
			{
				return false;
			}
		}
		//cache不支持并发处理,解决办法,传回key值.用到较少,不做处理
		//为了cache考虑,禁止统一操作并发请求
		if (this.cache && this.msg.loadCount)
		{
			//alert(this.msg.loadMessage + "\n 请稍候再次读取!");
			return false;
		}


		if (this.request.num >= 9)
		{
			console.info('发送请求太多.');
			return ;
		}
		//执行onBeforeSend事件
		this.onBeforeSend();

		var	tQS	= this.queryString;
		tQS	+= this.formSerialize();

		if (this.isSet(ctl))
		{
			ctl.each(function(s) 
					{
						if(!$(s))
						{
							//alert("无法找到控件 : " + s);
						}
						else
						{
							tQS	+= "&" + Form.Element.serialize(s);
						}
					});
		}

		if (this.isSet(q))
		{
			tQS	+= '&' + $H(q).toQueryString();
		}
		
		var	qDS	= $H(this.queryData).toQueryString();
		tQS	+= qDS ? '&' + qDS : '';



		if(!this.sendRequestMark)
		{
			return false;
		}

		//Cache
		if(this.cache)
		{
			this.cache.key = tQS.replace(/[^a-zA-Z0-9]/gi,"");

			if (this.cache.getCache(this.cache.key))
			{
				this.receiveData(this.cache.getCache(this.cache.key));
				return false;
			}
		}

		//设置随机数
		var	s =	this.rand();
		tQS	+= '&r=' + s ;

		this.msg.showMessage();

		this.request.num++;

		if ('e'	== this.requestLogic.type)
		{

				//已经更新了
//				var	ajaxObj	= new Ajax.Updater(
//												this.requestLogic.ajaxId,
//												this.url,
//												{
//													method: this.option.method,
//													requestHeaders:["Cache-Control","no-cache"],
//													parameters:	tQS,
//
//													onSuccess: this.receiveData.bind(this),
//													onComplete:this.complete.bind(this)
//												}
//												);	
				var	ajaxObj	= new Ajax.Request(
												this.url,
												{
													method: this.option.method,
													requestHeaders:["Cache-Control","no-cache"],
													parameters:	tQS,

													onSuccess: this.receiveData.bind(this),
													onComplete		:this.complete.bind(this),
													onException		:this.exception.bind(this)

												}
												);	
		}
		else
		{
				var	ajaxObj	= new Ajax.Request(
												this.url,
												{
													method: this.option.method,
													requestHeaders:["Cache-Control","no-cache"],
													parameters:	tQS,

													onSuccess: this.receiveData.bind(this),
													onComplete		:this.complete.bind(this),
													onException		:this.exception.bind(this)

												}
												);	
		}
		
		ctl	= null;
		q	= null;
		qDS = null;
		s	= null;
		tQS = null;
		ajaxObj = null;
	},

	/**
	 * 随机数  public function  暂时放在这儿,跟随此类到处跑
	 *
	 * @return	Int	num rand number
	 *
	 * @access	public
	 */
	rand : function()
	{
		var	today =	new	Date();
		var	num		=	today.getTime();
		return num;	
	},

	/**
	 * isSet -> from PHP  function  public function  暂时放在这儿,跟随此类到处跑
	 *
	 * @return	Mixed	arg Arg need be checked
	 *
	 * @access	public
	 */
	isSet : function(arg)
	{
		return 'undefined' != typeof(arg) ?	true : false;
	},

	/**
	 * function  public function  暂时放在这儿,跟随此类到处跑
	 *
	 * @return	Mixed	arg Arg need be checked
	 *
	 * @access	public
	 */
	isTrue : function(v)
	{
		return (v==true 
			|| ("number"==typeof(v) && 0!=v) 
			|| ("string"==typeof(v) && ""!=v  && "0"!=v && "off"!=v && "no"!=v) 
			|| ("object"==typeof(v) && null!=v && {}!=v && []!=v) 
			);
	}
};
/**
 * @Copyright (c) 2007,  上海晨路信息科技有限公司
 * @All rights reserved.
 * 提取国外某人核心代码,解析部分没有改变,添加错误处理. 此使用方法不变,以后重写解析引擎!
 *
 *
 * @file_name   Tpl.js
 * @version     1.0
 * @author      黄新泽
 * @date        2007-10-09 11:08:01
 */

/**
 * Class and Function List:
 * Function list:
 * - prefixFunc (stmtParts, state, tmplName, etc)                    
 * - prefixFunc (stmtParts, state, tmplName, etc)                    
 * - initialize ()                                                   
 * - process (context, flags)//生成内容                               
 * - template (tmplName, tmplContent, funcSrc, func)                 
 * - parse (body, tmplName) //解析模板                                
 * - parseTemplate (tmplContent, optTmplName)                        
 * - evalEx (src)                                                    
 * - ParseError (name, line, message)                                
 * - toString ()                                                     
 * - initialize ()                                                   
 * - process (content, context, elementId, optFlags)                 
 * - processDOMTemplate (elementId, context, optDocument, optFlags)  
 * - parseDOMTemplate (elementId, optDocument)                       
 * - removeTpl ()                                                    
 * - 
 * Classes list:
 * - .TplParse
 * - .Tpl
 */
var	TplParse = Class.create();
TplParse.prototype	= 
{
	//控制逻辑定义
	statementTag : "forelse|for|if|elseif|else|var|macro",
	statementDef : { //	Lookup table for statement tags.
		"if"	 : { delta:	 1,	prefix:	"if	(",	suffix:	") {", paramMin: 1 },
		"else"	 : { delta:	 0,	prefix:	"} else	{" },
		"elseif" : { delta:	 0,	prefix:	"} else	if (", suffix: ") {", paramDefault:	"true" },
		"/if"	 : { delta:	-1,	prefix:	"}"	},
		"for"	 : { delta:	 1,	paramMin: 3, 
					 prefixFunc	: function(stmtParts, state, tmplName, etc)	{
						if (stmtParts[2] !=	"in")
							throw new etc.ParseError(tmplName, state.line, "bad	for	loop statement:	" +	stmtParts.join(' '));
						var	iterVar	= stmtParts[1];
						var	listVar	= "__LIST__" + iterVar;
						return [ "var ", listVar, "	= ", stmtParts[3], ";",
							 //	Fix	from Ross Shaull for hash looping, make	sure that we have an array of loop lengths to treat	like a stack.
							 "var __LENGTH_STACK__;",
							 "if (typeof(__LENGTH_STACK__) == 'undefined' || !__LENGTH_STACK__.length) __LENGTH_STACK__	= new Array();", 
							 "__LENGTH_STACK__[__LENGTH_STACK__.length]	= 0;", // Push a new for-loop onto the stack of	loop lengths.
							 "if ((", listVar, ") != null) { ",
							 "var ", iterVar, "_ct = 0;",		// iterVar_ct variable,	added by B.	Bittman		
							 "for (var ", iterVar, "_index in ", listVar, ") { ",
							 iterVar, "_ct++;",
							 "if (typeof(",	listVar, "[", iterVar, "_index]) ==	'function')	{continue;}", // IE	5.x	fix	from Igor Poteryaev.
							 "__LENGTH_STACK__[__LENGTH_STACK__.length - 1]++;",
							 "var ", iterVar, "	= ", listVar, "[", iterVar,	"_index];" ].join("");
					 } },
		"forelse" :	{ delta:  0, prefix: "}	} if (__LENGTH_STACK__[__LENGTH_STACK__.length - 1]	== 0) {	if (", suffix: ") {", paramDefault:	"true" },
		"/for"	  :	{ delta: -1, prefix: "}	}; delete __LENGTH_STACK__[__LENGTH_STACK__.length - 1];" }, //	Remove the just-finished for-loop from the stack of	loop lengths.
		"var"	  :	{ delta:  0, prefix: "var ", suffix: ";" },
		"macro"	  :	{ delta:  1, 
					  prefixFunc : function(stmtParts, state, tmplName,	etc) {
						  var macroName	= stmtParts[1].split('(')[0];
						  return [ "var	", macroName, "	= function", 
								   stmtParts.slice(1).join(' ').substring(macroName.length),
								   "{ var _OUT_arr = []; var _OUT =	{ write: function(m) { if (m) _OUT_arr.push(m);	} }; " ].join('');
					 } }, 
		"/macro"  :	{ delta: -1, prefix: " return _OUT_arr.join(''); };" }
	},

	//管道扩展定义
	modifierDef	: {
		"eat"		 : function(v)	  {	return ""; },
		"escape"	 : function(s)	  {	return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g,	"&gt;"); },
		"capitalize" : function(s)	  {	return String(s).toUpperCase();	},
		"default"	 : function(s, d) {	return s !=	null ? s : d; }
	},

	initialize : function()	
	{
	},

	
	process	: function(context,	flags)//生成内容
	{
		var	func = this.func;
			if (context	== null)
				context	= {};
			if (context._MODIFIERS == null)
				context._MODIFIERS = {};
			if (context.defined	== null)
				context.defined	= function(str)	{ return (context[str] != undefined); };
			for	(var k in this.modifierDef)	{
				if (context._MODIFIERS[k] == null)
					context._MODIFIERS[k] =	this.modifierDef[k];
			}
			if (flags == null)
				flags =	{};
			var	resultArr =	[];
			var	resultOut =	{ write: function(m) { resultArr.push(m); }}; 
			try	{
				func(resultOut,	context, flags);
			} catch	(e)	{
				if (flags.throwExceptions == true)
					throw e;
				var	result = new String(resultArr.join("") + "[ERROR: "	+ e.toString() + (e.message	? '; ' + e.message : '') + "]");
				result["exception"]	= e;
				return result;
			}
			return resultArr.join("");
	},

	template : function(tmplName, tmplContent, funcSrc,	func)
	{
		this.func		= func;
		this.name		= tmplName;
		this.source		= tmplContent; 
		this.sourceFunc	= funcSrc;
	},

	
	parse :	function(body, tmplName) //解析模板
	{
		body = cleanWhiteSpace(body);
		var	funcText = [ "var Tpl_Template_TEMP	= function(_OUT, _CONTEXT, _FLAGS) { with (_CONTEXT) {"	];
		var	state	 = { stack:	[],	line: 1	};						 
		var	endStmtPrev	= -1;
		while (endStmtPrev + 1 < body.length) 
		{
			var	begStmt	= endStmtPrev;
			// 
			begStmt	= body.indexOf("{",	begStmt	+ 1);
			while (begStmt >= 0)
			{
				var	endStmt	= body.indexOf('}',	begStmt	+ 1);
				var	stmt = body.substring(begStmt, endStmt);
				var	blockrx	= stmt.match(/^\{(cdata|minify|eval)/);	
				if (blockrx)
				{
					var	blockType =	blockrx[1];	
					var	blockMarkerBeg = begStmt + blockType.length	+ 1;
					var	blockMarkerEnd = body.indexOf('}', blockMarkerBeg);
					if (blockMarkerEnd >= 0)
					{
						var	blockMarker;
						if(	blockMarkerEnd - blockMarkerBeg	<= 0 )
						{
							blockMarker	= "{/" + blockType + "}";
						}
						else
						{
							blockMarker	= body.substring(blockMarkerBeg	+ 1, blockMarkerEnd);
						}						 
						
						var	blockEnd = body.indexOf(blockMarker, blockMarkerEnd	+ 1);
						if (blockEnd >=	0)
						{							 
							emitSectionText(body.substring(endStmtPrev + 1,	begStmt), funcText);
							
							var	blockText =	body.substring(blockMarkerEnd +	1, blockEnd);
							if (blockType == 'cdata')
							{
								emitText(blockText,	funcText);
							}
							else if	(blockType == 'minify')
							{
								emitText(scrubWhiteSpace(blockText), funcText);
							}
							else if	(blockType == 'eval')
							{
								if (blockText != null && blockText.length >	0) 
									funcText.push('_OUT.write( (function() { ' + blockText + ' })()	);');
							}

							begStmt	= endStmtPrev =	blockEnd + blockMarker.length -	1;
						}
					}						 
				} 
				else if	(body.charAt(begStmt - 1) != '$' &&				  // Not an	expression or backslashed,
						   body.charAt(begStmt - 1)	!= '\\')
				{			   // so check if it is	a statement	tag.
					var	offset = (body.charAt(begStmt +	1) == '/' ?	2 :	1);	// Close tags offset of	2 skips	'/'.
																			// 10 is larger	than maximum statement tag length.
					if (body.substring(begStmt + offset, begStmt + 10 +	offset).search(this.statementTag) == 0)	
						break;												// Found a match.
				}

				begStmt	= body.indexOf("{",	begStmt	+ 1);
			}

			if (begStmt	< 0)							  // In	"a{for}c", begStmt will	be 1.
				break;
			var	endStmt	= body.indexOf("}",	begStmt	+ 1); // In	"a{for}c", endStmt will	be 5.
			if (endStmt	< 0)
				break;


				emitSectionText(body.substring(endStmtPrev + 1,	begStmt), funcText);
				emitStatement(body.substring(begStmt, endStmt +	1),	state, funcText, tmplName, this);

			
			endStmtPrev	= endStmt;
		}
		emitSectionText(body.substring(endStmtPrev + 1), funcText);
		if (state.stack.length != 0)
			throw this.ParseError(tmplName, state.line, "unclosed, unmatched	statement(s): "	+ state.stack.join(","));
		funcText.push("}}; Tpl_Template_TEMP");
		return funcText.join("");
	},

	parseTemplate :	function(tmplContent, optTmplName)
	{
		var	funcSrc	= this.parse(tmplContent, optTmplName);
		var	func = this.evalEx(funcSrc,	optTmplName, 1);

		if (func !=	null)
		{
			this.template(optTmplName, tmplContent,	funcSrc, func);
		}
		
		return null;
	},

	evalEx : function(src)
	{
		return eval(src);
	},

	ParseError : function(name,	line, message)
	{
		this.name	 = name;
		this.line	 = line;
		this.message = message;
	},

	toString : function()
	{		
		return "Tpl.Template	[" + this.name +	"]"; 

	}
};


var	emitStatement =	function(stmtStr, state, funcText, tmplName, etc)
{
	var	parts =	stmtStr.slice(1, -1).split(' ');
	var	stmt = etc.statementDef[parts[0]]; // Here,	parts[0] ==	for/if/else/...
	if (stmt ==	null) 
	{					   // Not a	real statement.
		emitSectionText(stmtStr, funcText);
		return;
	}

	if (stmt.delta < 0)	
	{
		if (state.stack.length <= 0)
		{
			throw new etc.ParseError(tmplName, state.line, "close tag does not match any previous statement: " + stmtStr);
		}
		state.stack.pop();
	} 
	if (stmt.delta > 0)
		state.stack.push(stmtStr);

	if (stmt.paramMin != null &&
		stmt.paramMin >= parts.length)
		throw new etc.ParseError(tmplName, state.line, "statement needs	more parameters: " + stmtStr);
	if (stmt.prefixFunc	!= null)
		funcText.push(stmt.prefixFunc(parts, state,	tmplName, etc));
	else 
		funcText.push(stmt.prefix);
	if (stmt.suffix	!= null) {
		if (parts.length <=	1) {
			if (stmt.paramDefault != null)
				funcText.push(stmt.paramDefault);
		} else {
			for	(var i = 1;	i <	parts.length; i++) {
				if (i >	1)
					funcText.push('	');
				funcText.push(parts[i]);
			}
		}
		funcText.push(stmt.suffix);
	}
};

var	emitSectionText	= function(text, funcText)
{
	if (text.length	<= 0)
		return;
	var	nlPrefix = 0;				// Index to	first non-newline in prefix.
	var	nlSuffix = text.length - 1;	// Index to	first non-space/tab	in suffix.
	while (nlPrefix	< text.length && (text.charAt(nlPrefix)	== '\n'))
		nlPrefix++;
	while (nlSuffix	>= 0 &&	(text.charAt(nlSuffix) == '	' || text.charAt(nlSuffix) == '\t'))
		nlSuffix--;
	if (nlSuffix < nlPrefix)
		nlSuffix = nlPrefix;
	if (nlPrefix > 0) {
		funcText.push('if (_FLAGS.keepWhitespace ==	true) _OUT.write("');
		var	s =	text.substring(0, nlPrefix).replace('\n', '\\n'); // A macro IE	fix	from BJessen.
		if (s.charAt(s.length -	1) == '\n')
			s =	s.substring(0, s.length	- 1);
		funcText.push(s);
		funcText.push('");');
	}
	var	lines =	text.substring(nlPrefix, nlSuffix +	1).split('\n');
	for	(var i = 0;	i <	lines.length; i++) {
		emitSectionTextLine(lines[i], funcText);
		if (i <	lines.length - 1)
			funcText.push('_OUT.write("\\n");\n');
	}
	if (nlSuffix + 1 < text.length)	{
		funcText.push('if (_FLAGS.keepWhitespace ==	true) _OUT.write("');
		var	s =	text.substring(nlSuffix	+ 1).replace('\n', '\\n');
		if (s.charAt(s.length -	1) == '\n')
			s =	s.substring(0, s.length	- 1);
		funcText.push(s);
		funcText.push('");');
	}
};

var	emitSectionTextLine	= function(line, funcText)
{
	var	endMarkPrev	= '}';
	var	endExprPrev	= -1;
	while (endExprPrev + endMarkPrev.length	< line.length) {
		var	begMark	= "${",	endMark	= "}";
		var	begExpr	= line.indexOf(begMark,	endExprPrev	+ endMarkPrev.length); // In "a${b}c", begExpr == 1
		if (begExpr	< 0)
			break;
		if (line.charAt(begExpr	+ 2) ==	'%') {
			begMark	= "${%";
			endMark	= "%}";
		}
		var	endExpr	= line.indexOf(endMark,	begExpr	+ begMark.length);		   // In "a${b}c", endExpr == 4;
		if (endExpr	< 0)
			break;
		emitText(line.substring(endExprPrev	+ endMarkPrev.length, begExpr),	funcText);				  
		// Example:	exprs == 'firstName|default:"John Doe"|capitalize'.split('|')
		var	exprArr	= line.substring(begExpr + begMark.length, endExpr).replace(/\|\|/g, "#@@#").split('|');
		for	(var k in exprArr) {
			if (exprArr[k].replace)	// IE 5.x fix from Igor	Poteryaev.
				exprArr[k] = exprArr[k].replace(/#@@#/g, '||');
		}
		funcText.push('_OUT.write(');
		emitExpression(exprArr,	exprArr.length - 1,	funcText); 
		funcText.push(');');
		endExprPrev	= endExpr;
		endMarkPrev	= endMark;
	}
	emitText(line.substring(endExprPrev	+ endMarkPrev.length), funcText); 
};

var	emitText = function(text, funcText)
{
	if (text ==	null ||
		text.length	<= 0)
		return;
	text = text.replace(/\\/g, '\\\\');
	text = text.replace(/\n/g, '\\n');
	text = text.replace(/"/g,  '\\"');
	funcText.push('_OUT.write("');
	funcText.push(text);
	funcText.push('");');
};

var	emitExpression = function(exprArr, index, funcText)
{
	// Ex: foo|a:x|b:y1,y2|c:z1,z2 is emitted as c(b(a(foo,x),y1,y2),z1,z2)
	var	expr = exprArr[index]; // Ex: exprArr == [firstName,capitalize,default:"John Doe"]
	if (index <= 0)	{		   // Ex: expr	  == 'default:"John	Doe"'
		funcText.push(expr);
		return;
	}
	var	parts =	expr.split(':');
	funcText.push('_MODIFIERS["');
	funcText.push(parts[0]); //	The	parts[0] is	a modifier function	name, like capitalize.
	funcText.push('"](');
	emitExpression(exprArr,	index -	1, funcText);
	if (parts.length > 1) {
		funcText.push(',');
		funcText.push(parts[1]);
	}
	funcText.push(')');
};

var	cleanWhiteSpace	= function(result)
{
	result = result.replace(/\t/g,	 "	  ");
	result = result.replace(/\r\n/g, "\n");
	result = result.replace(/\r/g,	 "\n");
	result = result.replace(/^(\s*\S*(\s+\S+)*)\s*$/, '$1'); //	Right trim by Igor Poteryaev.
	return result;
};

var	scrubWhiteSpace	= function(result)
{
	result = result.replace(/^\s+/g,   "");
	result = result.replace(/\s+$/g,   "");
	result = result.replace(/\s+/g,	  "	");
	result = result.replace(/^(\s*\S*(\s+\S+)*)\s*$/, '$1'); //	Right trim by Igor Poteryaev.
	return result;
};

var	Tpl	= Class.create();
Tpl.prototype	= 
{

	initialize : function()	
	{
		this.optEtc	= new TplParse();
	},

	process	: function(content,	context, elementId, optFlags) 
	{
		try 
		{
			var	template = this.optEtc.parseTemplate(content, elementId);
			return this.optEtc.process(context,	optFlags);
		}
		catch(e)
		{
			return ("Tpl ParseError in Element:'" + e.name + "'" + ", line:" + e.line + ", " + e.message);
		}
	},

	processDOMTemplate : function(elementId, context, optDocument, optFlags)
	{
		var c = this.parseDOMTemplate(elementId, optDocument);

		return this.process(c[0], context, c[1], optFlags);
	},

	parseDOMTemplate : function(elementId, optDocument)
	{
		if (optDocument	== null)
		{
			optDocument	= document;
		}

		var	element	= optDocument.getElementById(elementId);
		var	content	= element.value;

		if (content	== null)
		{
			content	= element.innerHTML;
		}
		
		content	= content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
		return [content, elementId];
	},



	removeTpl :	function()
	{
	}
};
/**
 * @Copyright (c) 2006, 豆窝网
 * @All rights reserved.
 *
 * JS分页类,根据我写的java改写成JS类, 原始处理方法见:DBConn.java文件DBConn:public String page() 
 *
 * @file_name   Page.js
 * @version     1.0
 * @author      黄新泽
 * @date        2007-10-10 16:02:04
 */

/**
 * Class and Function List:
 * Function list:
 * - initialize(obj, line, qs)  
 * - setPageNo(pageNo, start)   
 * - prompt(num, pageNo, start) 
 * - forward()                  
 * - back()                     
 * Classes list:
 * - .Page
 */
var Page = Class.create();
Page.prototype = 
{
	className : 'Page',

	/**
	 * 构造函数
	 *
	 * @param Object	obj			运行对象
	 * @param Int		qs			传递数据
	 * @param Int		line		每页显示记录数
	 *
	 * @access	public
	 */
    initialize: function(obj, line, qs) 
    {
		this.line =  4;		//每页显示的条数
		this.pageLine = 10;		//每页显示的可以连接翻页的条数 << 5 6 7 8 >>

		this.pageNo = 0; //起始页数
		this.start = 0;  //开始偏移量
		this.qs = '';
		this.search = '';

		if (obj)
		{
			this.obj = obj;
			this.obj.func = this.obj.func ? this.obj.func + '.page.execHandle' : this.obj.handle ;
		}
		
		if (line)
		{
			this.line = line;
		}
		
		if (qs)
		{
			this.qs = qs;
		}

		var offset = parseInt(this.pageNo*this.line + this.start);
		if (isNaN(offset))
		{
			offset = 0
		}

		this.fileName = '?' + this.qs + 'offset=' + offset + '&line=' + this.line;

    },


    setPageNo: function(pageNo, start) 
    {
		this.pageNo = pageNo;
		this.start = start;
		return false;

    },

    execHandle: function(pageNo, start) 
    {
		if ('string' == typeof(pageNo))
		{
			if (intVal($(pageNo).value)<1 || intVal($(pageNo).value)>this.total)
			{
				return false;
			}

			start = intVal((intVal($(pageNo).value)-1) / this.pageLine) * this.line *  this.pageLine;
			pageNo = intVal((intVal($(pageNo).value)-1) % (this.pageLine) );
		}

		this.pageNo = pageNo;
		this.start = start;

		eval(this.obj.handle + '(' + pageNo + ', ' + start + ')');
		return false;

    },

	/**
	 *  生成分页
	 *
	 * @param Int		num			总记录数
	 * @param Int		start		开始记录偏移量
	 * @param Array		pageNo		开始页偏移量
	 *
	 * @access	public
	 */
    prompt: function(num, pageNo, start)
    {
		if (num)
		{
			this.num = num;			
		}
		

		if (start)
		{
			this.start = start;				
		}

		if (pageNo)
		{
			this.pageNo = pageNo;
		}

		var offset = parseInt(this.pageNo*this.line + this.start);
		if (isNaN(offset))
		{
			offset = 0
		}

		this.fileName = '?' + this.qs + 'offset=' + offset + '&line=' + this.line;

		/***********************/
        this.pageTotal = this.line * this.pageLine;//所要显示的总条数
        this.pageStart;					//
        this.pageNum;					//
        this.total = parseInt(this.num/this.line) +1 ;	//取得总页数
        this.totalCurrent = parseInt((this.num -this.start+this.line-1) / this.line);	//取得当前总页数
		this.pageCurrent = this.start/this.line + this.pageNo + 1;
        this.totalStart = parseInt((this.num + this.pageTotal - 1) / this.pageTotal);//取得总偏移数
        this.lastStart  = this.num - (this.num % this.pageTotal);//最后一分页第一条记录
        this.returnStr  = '<div class="pagings"><div class="paging"><table border="0" cellspacing="0" cellpadding="0" class="new_page" align="center"><tr>';


        this.returnStr  +="<td><a class='total'>" + this.num + "</a><a class='pages'>" + this.pageCurrent + "/" + this.total +  "</a></td>";
		this.forward();

        this.pageStart = this.start / this.pageTotal * this.pageLine;//取得当前页数
        for(var i=0 ;i<this.totalCurrent&&i<this.pageLine; i++)
        {
            this.pageNum = this.pageStart + i + 1;

			if (this.pageCurrent == this.pageNum)
			{
			    this.returnStr += '<td><a class="pagenow">' + this.pageNum + '</a><td>';
			}
			else
			{
			    this.returnStr += ' <td><a class="page" href="' + this.fileName + '" onclick="return ' + this.obj.func + '(' + i + ', ' + this.start + ', \'' + this.qs + '\');"   title="第' + this.pageNum + '页">' + this.pageNum + '</a></td>';
			}
            
        }

		this.back();

		var paging_num = 'paging_num' + new	Date().getTime(); 

		this.returnStr += '<td><input class="news_p_i" type="text" name="paging_num" id="' + paging_num + '" value="' + this.pageCurrent + '" size="3" style="text-align:center;"> <input type="button" class="news_p_g" value="GO" onclick="return ' + this.obj.func + '(\'' + paging_num + '\', ' + this.start + ', \'' + this.qs + '\');"><td></tr></table></div></div>';

		return this.returnStr;
    },
	
    forward: function() 
    {
        if(this.start != 0)
        {
			
            var oldStart = this.start - this.pageTotal;

            this.returnStr += '<td><a  class="around" href="' + this.fileName + '" onclick="return ' + this.obj.func + '(0, 0, \'' + this.qs + '\');"  title="第一页面">|&lsaquo;</a></td>';
            this.returnStr += '<td><a class="around" href="' + this.fileName + '"  onclick="return ' + this.obj.func + '(0, ' + oldStart + ', \'' + this.qs + '\');"  title="上一页面">&lsaquo;&lsaquo;</a></td>';

            //一页一页向上翻
//            if (this.pageNo == 0)
//            {
//                this.returnStr += '&nbsp;&nbsp;<a href="' + this.fileName + '" onclick="return ' + this.obj.func + '(' + (this.pageLine-1) + ', ' + oldStart + ', \'' + this.qs + '\');"  title="上一页"><font face="webdings">7</font></a>';
//            }
//            else
//            {
//				
//                this.returnStr += '&nbsp;&nbsp;<a href="' + this.fileName + '" onclick="return ' + this.obj.func + '(' + (this.pageNo-1) + ', ' + this.start + ', \'' + this.qs + '\'); "  title="上一页"><font face="webdings">7</font></a>';
//            }
        }
    },
	
	back: function() 
    {
        if(this.totalStart != (this.start/this.pageTotal+1) && this.num!=0)
        {
            var newStart = this.start+this.pageTotal;


//            //一页一页向下翻
//            if (this.pageNo == this.pageLine-1)
//            {
//                this.returnStr += '&nbsp;&nbsp;<a href="' + this.fileName + '"  onclick="return '+this.obj.func+'(0, '+newStart+', \''+this.qs+'\');" title="下一页"><font face="webdings">8</font></a>';
//            }
//            else
//            {
//                this.returnStr+='&nbsp;&nbsp;<a href="' + this.fileName + '"onclick="return '+this.obj.func+'('+(this.pageNo+1)+', '+this.start+', \''+this.qs+'\');" title="下一页"><font face="webdings">8</font></a>';
//
//            }

            //一面一面向下翻
            this.returnStr+='<td><a class="around" href="' + this.fileName + '" onclick="return '+this.obj.func+'(0, '+newStart+', \''+this.qs+'\');"  title="下一页面">&rsaquo;&rsaquo;</a></td>';

            //最后一面
            this.returnStr+='<td><a class="around" href="' + this.fileName + '"  onclick="return '+this.obj.func+'(0, '+this.lastStart+', \''+this.qs+'\');"  title="最后一页面">&rsaquo;|</a></td>';
        }
    }
}


//<script language="JavaScript">
////<![CDATA[

///**
// * 构造函数
// *
// * @param Int		p		起始页数
// * @param Int		s		开始偏移量
// *
// * @access	public
// */
//var loadFronts = {};
//function loadFrontStart(p, s)
//{
//	loadFronts.num = 100;
//	loadFronts.line = 100;
//
//	offset = p * loadFronts.line + s;
//
//	loadFronts.page = function(obj)
//	{
//		return new Page(obj);
//	};
//	
//	$('nav').update(new Page({handle:'loadFrontStart'}).prompt(loadFronts.num, p, s));
//
//	return false;
//}
//
//loadFrontStart(0, 0);

//

//	var logic = {ajaxId:"user_data", act:"findUserImage",  type:"o", cla:"Image", operateType:"class"};
//	var ctl = [];
//
//	var user = new DAjax({url:"../admin/gateway.php", message:"读取用户信息...", page:{func:'user', handle:'getUser'} }, logic, {}, ctl);
//
//
//	user.onComplete   = function()
//	{
//		var s = new Tpl();
//		
//		var t_img = ' {for p in data}	 <div>${p.username|capitalize} ${p.total_chars}</div> {forelse}	 <div>No products in your cart.</div> {/for}';
//
//		//alert(Object.toJSON(this.responseData));
//		$('image_data').update(s.process(t_img, {data:this.responseData}));
//		//$('image_ori').update(Object.toJSON({data:this.responseData}));
//
//		var num = 100;
//
//		$('nav').update(this.page.prompt(num));
//
//	}
//	
//	user.onNoneGet   = function()
//	{
//		ctl.each(Field.clear);
//	}
//
//	function getUser(p, s)
//	{
//
//		//user.page.setPageNo(p, s);
//		//offset = p * user.page.line + s;
//
//		user.queryData['offset'] = p * user.page.line + s;
//		user.queryData['line'] = user.page.line;
//		user.sendRequest();
//
//		return false;
//	}
//
//	getUser(0 , 0)

////]]>>
//</script>

/**
 * @Copyright (c) 2007,上海晨路信息科技有限公司
 * @All rights reserved.
 *
 *
 *
 * @file_name   Tabs.js
 * @version     1.0
 * @author      黄新泽
 * @date        2007-12-03 09:36:09
 */

/**
 * Class and Function List:
 * Function list:
 * - initialize : function(element) 
 * - setupTab : function(elm)       
 * - activate :  function(ev)       
 * - hide : function(elm)           
 * - show : function(elm)           
 * - tabID : function(elm)          
 * - getInitialTab : function()     
 * - 
 * - 
 * Classes list:
 * - .Tabs
 */

var tabsInitFlag = false;
var currentTabId = false;	//当前显示item

var Tabs = Class.create();

Tabs.prototype = {
	initialize : function(element)
	{
		this.element = $(element);
		var options = Object.extend({}, arguments[1] || {});
		this.menu = $A(this.element.getElementsByTagName('a'));
		this.show(this.getInitialTab());
		this.menu.each(this.setupTab.bind(this));

//		if ($(this.tabID(this.getInitialTab())).tree)
//		{
//			
//		}

//		if (this.getInitialTab().getAttribute('init'))
//		{
//			alert(this.tabID(this.getInitialTab()));
//		}
	},

	empty : function(){return false;},

	setupTab : function(elm)
	{
		Event.observe(elm,'click',this.activate.bindAsEventListener(this),false);
		elm.onclick = this.empty;
	},

	activate :  function(ev)
	{
		var elm = Event.findElement(ev, "a");
		elm.blur();

		this.activateStart(elm);
		
		ev = null;
	},

	activateStart :  function(elm)
	{
		elm = $(elm);
		this.show(elm);
		this.menu.without(elm).each(this.hide.bind(this));

		try
		{
			//点击事件,加载数据
			var elm;

			var i = 0;
			while (i < 10)
			{
				elm = this.getChildActive(elm);

				if ('top' == elm.getAttribute('tree'))
				{
					break;
				}

				i++;
			}

		}
		catch(e)
		{
		}


		try
		{
			if ('top' == elm.getAttribute('tree'))
			{
				if ('undefined' != typeof(mask))
				{
					mask.deEvent(this.tabID(elm));
				}

				$(this.tabID(elm)).update('<table style="text-align:center;width:100%;height:380px;" ><tr><td  valign="middle"><img src="' + IMA_PATH + '/js/loading2.gif" border="0"></td></tr></table>');
				eval(this.tabID(elm) + '.sendRequest();');
				currentTabId = this.tabID(elm);
			}
		}
		catch(e)
		{
		}

		elm = null;
	},

	getChildActive :  function(elm)
	{
		//点击事件
		var menu = $(this.tabID(elm) + '_navi').getElementsByTagName('a');

		var return_elm = false;

		$A(menu).each(function(elm){
			if (elm.hasClassName('on'))
			{
				return_elm = elm;
			}
		});

		//解决丢失问题, 临时
		if (!return_elm)
		{
			return_elm = menu[0];
			return_elm.addClassName('on');
			this.show(return_elm)
		}

		menu = null;
		elm = null;

		return return_elm;
	},


	jump :  function(elm)
	{
		var item = elm.split('|');

		//alert(Object.toJSON(item));

		//根菜单处理
		var root = item[0];
		top_navi.showAndHideItem(root + '_a');

		var top = item.pop();

		var l = item.length - 1;

		for	(var i=0; i<l; i++)
		{
			var c = item[i] + '_navi';
			var a = item[i+1] + '_a';

			eval(c + '.showAndHideItem("' + a + '");');

			c = a = null;
		}

		//树梢菜单处理
		this.activateStart(top + '_a');

		item = null;
		root = null;
		top = i = c = a = null;
		return false;
	},


	showAndHideItem :  function(elm)
	{
		elm = $(elm);
		this.show(elm);
		this.menu.without(elm).each(this.hide.bind(this));
	},


	hide : function(elm)
	{
		$(elm).removeClassName('on');
		$(this.tabID(elm)).removeClassName('active-tab-body');

		try
		{
			if ('top' == $(elm).getAttribute('tree'))
			{
				if ('undefined' != typeof(mask))
				{
					mask.deEvent(this.tabID(elm));
				}

				$(this.tabID(elm)).update('<table style="text-align:center;width:100%;height:380px;" ><tr><td  valign="middle"><img src="' + IMA_PATH + '/js/loading2.gif" border="0"></td></tr></table>');
			}
		}
		catch(e)
		{
		}


	},

	show : function(elm)
	{

		try
		{
			if (!tabsInitFlag && 'on'==elm.getAttribute('init'))
			{
				tabsInitFlag = true;

				if ('undefined' != typeof(mask))
				{
					mask.deEvent(this.tabID(elm));
				}

				$(this.tabID(elm)).update('<table style="text-align:center;width:100%;height:380px;" ><tr><td  valign="middle"><img src="' + IMA_PATH + '/js/loading2.gif" border="0"></td></tr></table>');
				eval(this.tabID(elm) + '.sendRequest();');
				currentTabId = this.tabID(elm);
			}
		}
		catch(e)
		{
		}


		if ( $(elm) )
		{
			$(elm).addClassName('on');
		}
		$(this.tabID(elm)).addClassName('active-tab-body');

//		if (elm.id == 'military_soldiers_a' || elm.id == 'military_science_a')
//		{
//			rRecource(1);
//		}
//		else
//		{
//			rRecource(0);
//		}
	},

	tabID : function(elm)
	{
		return elm.href.match(/#(\w.+)/)[1];
	},

	getInitialTab : function()
	{
		if(document.location.href.match(/#(\w.+)/))
		{
			var loc = RegExp.$1;
			var elm = this.menu.find(function(value) { return value.href.match(/#(\w.+)/)[1] == loc; });
			return elm || this.menu.first();
		} 
		else
		{
			return this.menu.first();
		}
	}
}
/**
 * @Copyright (c) 2005, 上海鸿域信息科技有限公司 
 * @All rights reserved.
 *
 * DAjax cache 系统,雏形
 *
 * @file_name   Cache.js
 * @version     1.0
 * @author      黄新泽
 * @date        2005-10-08 16:09:40
 */

var	Cache = Class.create();
Cache.prototype	= 
{
	cData : {},

	initialize : function(prefix, life_time) 
	{
		if (!prefix)
		{
			prefix = 'd';
		}

		this.key    = false;

		this.prefix   = prefix;

		if (!life_time)
		{
			this.lifeTime = 0   ;
		}
		else
		{
			this.lifeTime = life_time;
		}
		

		this.cData[this.prefix] = {};
	},


	getCache : function(key)
	{
		if (this.cData[this.prefix][key])
		{
			if (this.lifeTime && ((new Date()-this.cData[this.prefix][key]['time']) / 1000) > this.lifeTime)
			{
				this.delCache(key);
				return false;
			}

			return this.cData[this.prefix][key]['value'];
		}
		else
		{
			return false;
		}
		
	},

	updateCache : function(key, value)
	{
		this.cData[this.prefix][key] = {};
		this.cData[this.prefix][key]['value'] = value;
		this.cData[this.prefix][key]['time'] = new Date();
	},

	delCache : function(key)
	{
		this.cData[this.prefix][key] = null;
	}
};

/**
 * @Copyright (c) 2006,东登信息网络有限公司
 * @All rights reserved.
 *
 * 用于Debug
 *
 * @file_name   Console.js
 * @version     1.0
 * @author      黄新泽
 * @date        2007-10-08 16:09:40
 */

/**
 * Class and Function List:
 * Function list:
 * - initialize: function()
 */

var Debug = Class.create();

Debug.prototype = {
	/**
	 * 构造函数
	 *
	 * @access	public
	 */
	initialize: function()
	{
	},

	debug: function(msg, obj)
	{
	},

	info: function(msg, obj)
	{
	},

	warn: function(msg, obj)
	{
	},

	error: function(msg, obj)
	{
	}
};


if (!window.console || !console.firebug)
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = new Debug();

    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}