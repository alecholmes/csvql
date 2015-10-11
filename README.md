# CSVQL

## Introduction

CSVQL is a React Javascipt application for querying CSV data using SQL. It uses [sql.js](https://github.com/kripken/sql.js/), a Javascript SQLite port.

## Developing and Running

NPM is used for package management, and Gulp is used to run common tasks.

To prepare the environment, run `npm install`.

### Running in Development

To spin up the application locally, accessible at [http://localhost:3000](http://localhost:3000): `npm watch`

This will reload the site whenever changes are made to any files.

### Testing

Tests are written in Jest and can be run with `npm test`.

### Autoformatting and Linting

```
# Autoformat
jscs --fix app/scripts/**/*.js

# Lint
gulp lint
```

### Building

`gulp build` will prepare the project for production. `gulp` will do the same, but also clean and lint the project.

## Known Issues

* Dates and time parsing
* Validations in libraries
* Unit test coverage
* Build files and number of dev dependencies

## Feature Ideas

* Custom delimiters (i.e. not just comma)
* Option to strip padding from CSV columns
* Export query results as CSV

## License

[MIT License](http://opensource.org/licenses/MIT)