'use strict';

// require('sql.js') doesn't work
var SQL = window.SQL;
var _ = require('underscore');

function partition(arr, size) {
  var chunks = [];
  for (var i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }

  return chunks;
}

function createTableDdl(schema) {
  var ddl = 'CREATE TABLE ' + schema.tableName + '(';

  ddl += _.map(schema.columns, function(column) {
    return column.name + ' ' + column.sqlType.typeString() + ' ' + column.nullable;
  }).join(', ');
  ddl += ');';
  return ddl;
}

var SQLITE_MAX_VARIABLE_NUMBER = 999;

function Db() {
  var db = new SQL.Database();

  var schemas = {};

  this.createTable = function(schema) {
    var ddl = createTableDdl(schema);
    db.exec(ddl);
    schemas[schema.tableName] = schema;
  };

  this.dropTable = function(tableName) {
    db.exec('DROP TABLE ' + tableName);
    delete schemas[tableName];
  };

  this.tables = function() {
    return _.keys(schemas);
  };

  this.insertRows = function(tableName, rows) {
    var schema = schemas[tableName];

    // TODOs:
    // check tableName defined
    // check schema compatibility
    // ensure that row data is rectangular

    if (rows.length === 0) {
      return;
    }

    var baseSql = 'INSERT INTO ' + tableName;
    baseSql += '(' + _.map(schema.columns, function(columnSchema) {
      return columnSchema.name;
    }).join(', ') + ')';
    baseSql += ' values ';
    var rowSql = '(' + Array.apply(null, Array(schema.columns.length)).map(function() { return '?'; }).join(', ') + ')';

    // SQLite can't handle too many bounds variables, so insert rows in batches.
    var rowChunkCount = Math.floor(SQLITE_MAX_VARIABLE_NUMBER / schema.columns.length);
    var rowChunks = partition(rows, rowChunkCount);

    _.each(rowChunks, function(chunk) {
      var sql = baseSql + Array.apply(null, Array(chunk.length)).map(function() { return rowSql; }).join(', ');
      db.run(sql, _.flatten(chunk));
    });
  };

  this.execute = function(sql) {
    return db.exec(sql)[0];
  };
}

module.exports = Db;
