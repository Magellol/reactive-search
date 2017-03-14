[![Build Status](https://travis-ci.org/Magellol/reactive-search.svg?branch=master)](https://travis-ci.org/Magellol/reactive-search)

# Reactive search
React component allowing you to query some api "as-you-type".
Out of the box, it takes care of debouncing input events for you, so you don't over query your api.

## Table of Contents
- [Demo](#demo)
- [Installation](#installation)
- [Quickstart](#quickstart)
- [Configure](#configure)
- [Contribute](#contribute)
- [Disclaimer](#disclaimer)
- [License](#license)

## Demo
[Check out the demo](http://twobugsonecommit.com/).
_Please keep in mind that the component doesn't do any caching whatsoever, everything is up to you. In this demo, I've implemented a really basic redis caching to speed things up._

## Installation
```javascript
yarn add reactive-search

// Or via npm
npm i --save reactive-search
```

## Quickstart
Here's a quick example of what it would look like if you were to use the component.

```javascript
import ReactiveSearch from 'reactive-search';

export default function App() {
  return (
    <ReactiveSearch
      classes={['input', 'rounded-corner']}
      getUrlToRequest={searchTerm => `/search/${searchTerm}`}
      onResponse={response => console.log('Got response', response)}
      shouldRetryOnError={error => false}
      onFatalError={error => console.error('Big Bad Bug', error)}
    />
  );
}
```

## Configure
The component offers a few props (some required) to allow you to customized some behaviours.

### `classes`

| **Accepted Types:** | **Default Value** |   **Required**    |
|---------------------|-------------------|-------------------|
|  `Array` | `[]` | `false` |

The `classes` prop takes an array of strings and will join them to build the `className` string.
```javascript
// Produces `className="input rounded-corner"`
<ReactiveSearch classes={['input', 'rounded-corner']} />
```

### `getUrlToRequest`

| **Accepted Types:** | **Default Value** |   **Required**    |
|---------------------|-------------------|-------------------|
|  `Function` | `None` | `true`  |

`getUrlToRequest` is a function that'll be called whenever an API call is about to be made.
Your callback will receive the search term (after any filtering the component does).

```javascript
function buildUrl(searchTerm) {
  return `http://fastest-api-in-the-world.com/search?s=${searchTerm}`;
}

<ReactiveSearch getUrlToRequest={buildUrl} />
```

**Note:** Your function _will not_ be called if the value has been filtered out.
ReactiveSearch trims and removes extraneous spaces before letting the input going through.
If the output results in empty string, your callback will not be called.

Here's what it does under the hood:
```javascript
this.input$
  .map(value => value.trim().toLowerCase().replace(/\s\s+/g, ' '))
  .filter(value => value.length) // Will not let through empty strings
  ...
  .switchMap((searchTerm) => {
    const url = getUrlToRequest(searchTerm);
    ...
  });
```

### `onResponse`

| **Accepted Types:** | **Default Value** |   **Required**    |
|---------------------|-------------------|-------------------|
|  `Function` | `None` | `true`  |

`onResponse` is a callback that'll be called whenever the API sent back a response. It'll receive whatever your `fetch`
implementation returns from that call. Please keep in mind that this component uses by default the native fetch browser implementation. So still by default, a response with a **status that is not 200** is still considered successful by the native `fetch` spec. This behaviour may differ if you're using a custom polyfill.

```javascript
function handleResponse(response) {
  response.json().then((content) => {
    this.setState({ content });
  });
}

<ReactiveSearch onResponse={handleResponse} />
```

### `shouldRetryOnError`

| **Accepted Types:** | **Default Value** |   **Required**    |
|---------------------|-------------------|-------------------|
|  `Function` | `() => false` | `false`  |

Optional function you can pass to evaluate if an error you encountered somewhere in the pipeline of doing a request should be ignored. If your function returns `true`, the error is ignored and we subscribe again to events. If your function returns `false`, `onFatalError` will be called and no more further events will be dispatched.

```javascript
function shouldRetryOnError(error) {
  return error.status < 500;
}

<ReactiveSearch shouldRetryOnError={shouldRetryOnError} />
```

_The reason this exists is because this component uses the [RxJS](http://reactivex.io/rxjs/) library and by default when an observable receives an error, it will unsubscribe and will not receive any further events. Think of `shouldRetryOnError` as a retry behaviour._

### `onFatalError`

| **Accepted Types:** | **Default Value** |   **Required**    |
|---------------------|-------------------|-------------------|
|  `Function` | `None` | `true`  |

`onFatalError` is the final callback that will be called when an unhandled error bubbles up. After this callback has been called, no more events will be dispatched and no more API requests will be made. You should use this to produce any warning for you and your users.

```javascript
function fatalErrorHandler(error) {
  showErrorMessageToUser(error.message);
  log(error);
}

<ReactiveSearch onFatalError={fatalErrorHandler} />
```

## Disclaimer
- It's a BYOP (bring your own Promise) and BYOF (bring your own fetch) library.
- This component doesn't perform any caching whatsoever. Client side/server side caching should be your responsibility.

## Contribute
Contributions are welcome! Please open issues when you found a bug.
If you wish to fix a bug, a pull request is necessary. The PR is required to pass the tests and the linter before being merged.
If you wish to work on a new feature, open an issue and we'll talk about it.

```bash
# Run the test
- yarn run test

# Run the linter
- yarn run lint

# Watch changes
- yarn run watch
```

## License
[MIT](LICENSE.md)
