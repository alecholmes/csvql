jest.dontMock('../SqlTypes');
jest.dontMock('underscore');

var _ = require('underscore');

describe('SqlTypes', function() {
  var SqlTypes = require('../SqlTypes');

  describe('fromString', function() {
    it('cleans input', function() {
      expect(SqlTypes.fromString('varchar(123)').typeString()).toBe('varchar(123)');
      expect(SqlTypes.fromString('VARCHAR(123)').typeString()).toBe('varchar(123)');
      expect(SqlTypes.fromString('  varchar  (  123  )  ').typeString()).toBe('varchar(123)');

      expect(SqlTypes.fromString('  varying character  (  123  )  ').typeString()).toBe('varchar(123)');

      expect(SqlTypes.fromString('integer(1)').typeString()).toBe('integer(1)');
      expect(SqlTypes.fromString('integer').typeString()).toBe('integer(4)');

      expect(SqlTypes.fromString('decimal(1)').typeString()).toBe('decimal(1)');
      expect(SqlTypes.fromString('decimal(1,   2)').typeString()).toBe('decimal(1, 2)');
    });
  });

  describe('valueFromString', function() {
    function testTypes(fixture) {
      _.each(fixture.sqlTypes, function(sqlType) {
        describe(sqlType, function() {
          var type = SqlTypes.fromString(sqlType);
          expect(type).not.toBeNull();

          _.each(fixture.valid, function(validValue) {
            it("converts '" + validValue[0] + "' to '" + validValue[1] + "'", function() {
              expect(type.valueFromString(validValue[0])).toBe(validValue[1]);
            });
          });

          _.each(fixture.invalid, function(invalidValue) {
            it("does not convert '" + invalidValue + "'", function() {
              expect(type.valueFromString(invalidValue)).toBeNull();
            });
          });
        });
      });
    }

    var textLike = {
      sqlTypes: ['varchar(255)', 'varying character(255)', 'character varying(255)', 'character(255)', 'text', 'clob'],
      valid: [['hi', 'hi'], [' hello ', ' hello '], ['123', '123'], ['1.23', '1.23'], ['true', 'true']],
      invalid: []
    };
    testTypes(textLike);

    var intLike = {
      sqlTypes: ['integer', 'integer(8)', 'int', 'smallint', 'mediumint', 'bigint'],
      valid: [['123', 123], ['-123', -123], ['0', 0], ['-0', 0], ['  1  ', 1], ['012', 12]],
      invalid: ['foo', '1.23', '-1.23', 'true']
    };
    testTypes(intLike);

    var realLike = {
      sqlTypes: ['real', 'float', 'double', 'double precision', 'numeric', 'decimal(1)', 'decimal(2,3)'],
      valid: [['3.14', 3.14], ['0', 0], ['-0', 0], ['1', 1], ['-3.14', -3.14], ['1.23e4', 1.23e4], ['1.23e-4', 1.23e-4]],
      invalid: ['foo', 'true']
    };
    testTypes(realLike);

    var booleanLike = {
      sqlTypes: ['boolean'],
      valid: [['true', true], ['  tRuE  ', true], ['false', false], ['  fAlSe ', false], ['1', true],
        ['0', false], ['t', true], ['f', false]],
      invalid: ['truthy', 'falsey', '123', '-1', '-0', '1.23']
    };
    testTypes(booleanLike);

    // TODO: figure out timezone issues
    // var timestampLike = {
    //   sqlTypes: ['date', 'datetime', 'timestamp'],
    //   valid: [['2015-01-02', new Date(2015, 1, 2).toISOString()],
    //     ['2015-01-02T03:44Z', new Date('2015-01-02T03:44Z').toISOString()],
    //     ["123", new Date(123).toISOString()],
    //     ['1.23', new Date(1.23).toISOString()],
    //     [' nOw() ', 'now()'],
    //     // TODO: disallow the following
    //     ['true', new Date(0).toISOString()],
    //     ['false', new Date(0).toISOString()]],
    //   invalid: ['foo']
    // };
    // testTypes(timestampLike);
  });
});
