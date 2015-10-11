'use strict';

var _ = require('underscore');

function InvalidSqlTypeError() {
  this.message = 'Invalid SQL type';
  this.toString = function() {
    return this.message;
  };
}

function expectArgLength(args, min, max) {
  if (!max) {
    max = min;
  }

  if (args.length < min || args.length > max) {
    throw new InvalidSqlTypeError();
  }
}

// function expectMaxArgLength(args, length) {
//   if (args.length === 0 || args.length > length) {
//     throw new InvalidSqlTypeError();
//   }
// }

function expectNoArgs(args) {
  expectArgLength(args, 0);

  // if (args.length > 0) {
  //   throw new InvalidSqlTypeError();
  // }
}

function sqlType(name, args) {
  return {
    typeString: function() {
      return args.length === 0
        ? name
        : name + '(' + args.join(', ') + ')';
    },

    valueFromString: function() {
      throw new 'Must implement valueFromString';
    },
  };
}

function intLike(name, args) {
  return _.create(sqlType(name, args), {
    valueFromString: function(value) {
      if (value === null || value === undefined || !/^(\-|\+)?[0-9]+$/.test(value.trim())) {
        return null;
      }

      return parseInt(value);
    },
  });
}

function realLike(name, args) {
  return _.create(sqlType(name, args), {
    valueFromString: function(value) {
      if (value === null || value === undefined) {
        return null;
      }

      var real = parseFloat(value);
      if (isNaN(real) || !isFinite(real)) {
        return null;
      }

      return real;
    },
  });
}

function textLike(name, args) {
  return _.create(sqlType(name, args), {
    valueFromString: function(value) {
      return value === null || value === undefined
        ? null
        : String(value);
    },
  });
}

function booleanLike(name, args) {
  return _.create(sqlType(name, args), {
    valueFromString: function(value) {
      if (value === null || value === undefined) {
        return null;
      }

      var trimmed = value.trim().toLowerCase();

      if (trimmed === 'true' || trimmed === '1' || trimmed == 't') {
        return true;
      } else if (trimmed === 'false' || trimmed === '0' || trimmed == 'f') {
        return false;
      } else {
        return null;
      }
    },
  });
}

function timestampLike(name, args) {
  return _.create(sqlType(name, args), {
    valueFromString: function(value) {
      if (value === null || value === undefined) {
        return null;
      }

      if (value.trim().toLowerCase() === 'now()') {
        return 'now()';
      }

      var parsed = new Date(value);
      if (isNaN(parsed.getMilliseconds())) {
        return null;
      }

      return parsed.toISOString();
    },
  });
}

var sqlTypeRegex = /^([a-zA-Z][a-zA-Z ]+)\s*(\(\s*(\d+)\s*(,\s*(\d+)\s*)?\))?$/;
var types = {
  integer: function(precision) {
    expectArgLength(arguments, 0, 1);

    if (!precision) {
      precision = 4;
    }

    return intLike('integer', [precision]);
  },

  smallint: function() {
    expectNoArgs(arguments);
    return intLike('smallint', []);
  },

  mediumint: function() {
    expectNoArgs(arguments);
    return intLike('mediumint', []);
  },

  bigint: function() {
    expectNoArgs(arguments);
    return intLike('bigint', []);
  },

  varchar: function(length) {
    expectArgLength(arguments, 1);
    return textLike('varchar', [length]);
  },

  text: function() {
    expectNoArgs(arguments);
    return textLike('text', []);
  },

  clob: function() {
    expectNoArgs(arguments);
    return textLike('clob', []);
  },

  real: function() {
    expectNoArgs(arguments);
    return realLike('real', []);
  },

  float: function() {
    expectNoArgs(arguments);
    return realLike('float', []);
  },

  double: function() {
    expectNoArgs(arguments);
    return realLike('double', []);
  },

  numeric: function() {
    expectNoArgs(arguments);
    return realLike('numeric', []);
  },

  decimal: function(precision, scale) {
    expectArgLength(arguments, 1, 2);
    var args = [precision];
    if (scale) {
      args.push(scale);
    }

    return realLike('decimal', args);
  },

  boolean: function() {
    expectNoArgs(arguments);
    return booleanLike('boolean', []);
  },

  date: function() {
    expectNoArgs(arguments);
    return timestampLike('date', []);
  },

  datetime: function() {
    expectNoArgs(arguments);
    return timestampLike('datetime', []);
  },

  timestamp: function() {
    expectNoArgs(arguments);
    return timestampLike('timestamp', []);
  },
};
types['int'] = types.integer;
types['varying character'] = types.varchar;
types['character varying'] = types.varchar;
types['character'] = types.varchar;
types['double precision'] = types.double;

var SqlTypes = {
  types: types,

  fromString: function(str) {
    var matches = sqlTypeRegex.exec(str.trim());
    if (!matches) {
      return null;
    }

    var func = this.types[matches[1].trim().toLowerCase()];
    if (!func) {
      return null;
    }

    var args = [];
    if (matches[3] !== undefined) args.push(matches[3]);
    if (matches[5] !== undefined) args.push(matches[5]);

    return func.apply(this, args);
  },

  InvalidSqlTypeError: InvalidSqlTypeError,
};

module.exports = SqlTypes;
