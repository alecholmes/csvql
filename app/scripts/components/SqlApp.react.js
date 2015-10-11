'use strict';

var Bootstrap = require('react-bootstrap');
var CsvSection = require('./CsvSection.react');
var CsvSectionActionCreators = require('../actions/CsvSectionActionCreators');
var CsvStore = require('../stores/CsvStore');
var QuerySection = require('./QuerySection.react');
var React = require('react');
var ResultsSection = require('./ResultsSection.react');

function getAppState() {
  return {
    csv: CsvStore.getImportState(),
    query: {
      sql: CsvStore.getQuerySql(),
      error: CsvStore.getResultState().error,
    },
    results: CsvStore.getResultState(),
    helpVisible: false,
  };
}

var SqlApp = React.createClass({

  getInitialState: function() {
    return getAppState();
  },

  componentDidMount: function() {
    CsvStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    CsvStore.removeChangeListener(this.onChange);
  },

  closeHelp: function() {
    this.setState({ helpVisible: false });
  },

  openHelp: function() {
    this.setState({ helpVisible: true });
  },

  setExample: function() {
    CsvSectionActionCreators.updateCsv('city,country,population<bigint>\n\
New York,United States,8406000\n\
San Francisco,United States,837442\n\
Los Angeles,United States,3884000\n\
Tokyo,Japan,13350000\n\
London,United Kingdom,8630000');
    CsvSectionActionCreators.importCsv();
    CsvSectionActionCreators.updateQuery('SELECT city, population\n\
FROM data\n\
GROUP BY country\n\
HAVING MAX(population)\n\
ORDER BY population DESC');
    CsvSectionActionCreators.executeQuery();
  },

  onChange: function() {
    this.setState(getAppState());
  },

  render: function() {
    return (
      <div>

        <Bootstrap.Navbar
          fixedTop
          fluid
          inverse
          toggleNavKey={0}>

          <Bootstrap.NavBrand>CSVQL</Bootstrap.NavBrand>

          <Bootstrap.CollapsibleNav eventKey={0}> {/* This is the eventKey referenced *//* This is the eventKey referenced */}
            <Bootstrap.Nav navbar>
              <Bootstrap.NavItem
                eventKey={0}
                href='#'>
                Query CSV in your browser with SQL
              </Bootstrap.NavItem>
            </Bootstrap.Nav>
            <Bootstrap.Nav
              navbar
              right>
              <Bootstrap.NavItem
                eventKey={0}
                onClick={this.setExample}>
                Example
              </Bootstrap.NavItem>
              <Bootstrap.NavItem
                eventKey={1}
                onClick={this.openHelp}>
                Help
              </Bootstrap.NavItem>
            </Bootstrap.Nav>
          </Bootstrap.CollapsibleNav>
        </Bootstrap.Navbar>

        <div className='container-fluid'>
          <Bootstrap.Row>
            <Bootstrap.Col md={12}>
              <CsvSection state={this.state.csv} />
            </Bootstrap.Col>
          </Bootstrap.Row>

          <Bootstrap.Row>
            <Bootstrap.Col md={12}>
              <QuerySection state={this.state.query} />
            </Bootstrap.Col>
          </Bootstrap.Row>

          <Bootstrap.Row>
            <Bootstrap.Col md={12}>
              <ResultsSection state={this.state.results} />
            </Bootstrap.Col>
          </Bootstrap.Row>
        </div>

        <Bootstrap.Modal
          onHide={this.closeHelp}
          show={this.state.helpVisible}>
          <Bootstrap.Modal.Header closeButton>
            <Bootstrap.Modal.Title>Using CSVQL</Bootstrap.Modal.Title>
          </Bootstrap.Modal.Header>
          <Bootstrap.Modal.Body>

            CSVQL parses CSV data into a table named <code>data</code> in a format queryable using SQL.

            <h5>CSV Format</h5>

            <p>
              <a href='https://en.wikipedia.org/wiki/Comma-separated_values'>CSV</a> is a plain text
              format representing storing tabular data. CSVQL supports standard comma-delimited
              CSV data with the additional capability of specifying the SQL expected for a column.
            </p>

            <p>
              The first line of the CSV is the header. These are translated into table columns.
              By default, the SQL type implied by each header is <code>text</code>.
            </p>

            <h5>CSV Header Types</h5>

            <p>
              To specify an alternative SQL type, add it next to the header name like so:
            </p>
            <pre>
              one,two&lt;bigint&gt;,three&lt;date&gt;
            </pre>
            <p>
              In this example, column <code>one</code> is implicitly <code>text</code>,
              column <code>two</code> is a <code>bigint</code>, and column <code>three</code>
              is a <code>date</code>.
            </p>

            <h5>Column Names</h5>

            <p>
              Column names are the same as header names, with two exceptions: any
              non-alphanumeric characters in a header are replaced with <code>_</code>,
              and headers that start with a number are prefixed with <code>_</code>.
            </p>

            <h5>CSV Data Quoting and Padding</h5>

            <p>
              CSV data may be quoted, e.g. <code>"column,one",column two,three</code>.
              Data is not trimmed, so the second column of <code>one,"  two ",three</code>
              is represented as <code>  two </code> in the database, not <code>two</code>.
            </p>

            <h5>Supported SQL Types</h5>

            <ul>
              <li>
                <code>text</code>, <code>clob</code>, <code>varchar(n)</code>: unbounded text column.
              </li>
              <li>
                <code>integer(n)</code>, <code>int</code>, <code>smallint</code>, <code>mediumint</code>, <code>bigint</code>:
                integers.
              </li>
              <li>
                <code>float</code>, <code>double</code>, <code>numeric</code>, <code>decimal(n)</code>:
                floating point numbers.
              </li>
              <li>
                <code>boolean</code>: boolean value (true, t, 1, false, f, 0).
              </li>
              <li>
                <code>date</code>, <code>datetime</code>, <code>timestamp</code>:
                timestamps represented as UTC values. Even <code>date</code> includes a time component.
                <code>now()</code> is a valid value to represent the current timestamp.
              </li>
            </ul>

            <h5>SQL Dialect</h5>

            <p>
              Data is stored in a <a href='https://www.sqlite.org/'>SQLite</a> database.
              Only queries and data types supported by SQLite will work.
            </p>

            <p>
              To see how CSV data maps to the underlying table, you may run query:
            </p>
            <pre>
              PRAGMA table_info(data);
            </pre>

          </Bootstrap.Modal.Body>
          <Bootstrap.Modal.Footer>
            <Bootstrap.Button onClick={this.closeHelp}>Close</Bootstrap.Button>
          </Bootstrap.Modal.Footer>
        </Bootstrap.Modal>

        <footer className='footer'>
          <div className='container-fluid'>
            <p className='text-muted'>
              © 2015 <a href='http://www.alecholmes.com'>Alec Holmes</a> |
              <a href='https://github.com/alecholmes/csvql'>Source</a>
            </p>
          </div>
        </footer>

      </div>
    );
  },

});

module.exports = SqlApp;
