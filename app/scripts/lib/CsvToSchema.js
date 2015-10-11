'use strict';

var Papa = require('papaparse');
var SqlTypes = require('./SqlTypes');
var _ = require('underscore');

var headerRegex = /^((\w|\s)+)(<(.+)>)?$/;

function InvalidCsvError(message, value, row, column) {
  this.message = message;
  this.value = value;
  this.row = row;
  this.column = column;

  this.toString = function() {
    var str = this.message;
    if (this.value) {
      str += ' (' + this.value + ')';
    }

    return str + ' (row ' + this.row + ' column ' + this.column + ')';
  };
}

function columnName(str) {
  var columnName = str.replace(/[^a-zA-Z0-9]/g, '_');
  if (/^[0-9]/.test(columnName)) {
    columnName = '_' + columnName;
  }

  return columnName;
}

function fixRowLength(row, length) {
  var oldLength = row.length;
  row.length = length;
  row.fill('', oldLength);
}

var CsvToSchema = {
  // Janky export?
  InvalidCsvError: InvalidCsvError,

  schemaWithData: function(csvText) {
    var parsed = Papa.parse(csvText, { delimiter: ',', skipEmptyLines: true });

    if (parsed.errors.length > 0) {
      throw new InvalidCsvError(parsed.errors[0].message, null, parsed.errors[0].row || 0, 0);

      // return {
      //   errors: parsed.errors
      // };
    }

    // if(parsed.data.length == 0) {
    //   return {
    //     errors: "no data"
    //   };
    // }

    var columnsSchemas = _.map(parsed.data[0], function(header, index) {
      var parts = headerRegex.exec(header.trim());
      if (parts === null) {
        throw new InvalidCsvError('Invalid header', header, 1, index + 1);
      }

      var sqlTypeStr = (parts[4] || 'text').trim();
      var sqlType = SqlTypes.fromString(sqlTypeStr);
      if (!sqlType) {
        throw new InvalidCsvError('Invalid SQL type', sqlTypeStr, 1, index + 1);
      }

      return {
        name: columnName(parts[1].trim()),
        sqlType: sqlType,
        nullable: 'NULL',
      };
    });

    // TODO: test for duplicate column names

    var rows = parsed.data.slice(1);
    _.each(rows, function(row) { fixRowLength(row, columnsSchemas.length); });

    return {
      columns: columnsSchemas,
      data: parsed.data.slice(1),
    };
  },

};

module.exports = CsvToSchema;
