'use strict';

// require('sql.js') doesn't work
var SQL = window.SQL;
var _ = require('underscore');

function createTableDdl(schema) {
  var ddl = 'CREATE TABLE ' + schema.tableName + '(';

  ddl += _.map(schema.columns, function(column) {
    return column.name + ' ' + column.sqlType.typeString() + ' ' + column.nullable;
  }).join(', ');
  ddl += ');';
  return ddl;
}

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

    var sql = 'INSERT INTO ' + tableName;
    sql += '(' + _.map(schema.columns, function(columnSchema) {
      return columnSchema.name;
    }).join(', ') + ')';
    sql += ' values ';

    var rowSql = '(' + Array.apply(null, Array(schema.columns.length)).map(function() { return '?'; }).join(', ') + ')';
    var rowsSql = Array.apply(null, Array(rows.length)).map(function() { return rowSql; }).join(', ');

    sql += rowsSql;

    db.run(sql, _.flatten(rows));
  };

  this.execute = function(sql) {
    return db.exec(sql)[0];
  };
}

module.exports = Db;
