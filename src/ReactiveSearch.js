import React, { Component, PropTypes } from 'react';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

const propTypes = {
  placeholder: PropTypes.string,
  focus: PropTypes.bool,
  classes: PropTypes.arrayOf(PropTypes.string),
  getUrlToRequest: PropTypes.func.isRequired,
  onResponse: PropTypes.func.isRequired,
  onFatalError: PropTypes.func.isRequired,
  shouldRetryOnError: PropTypes.func,
};

const defaultProps = {
  classes: [],
  focus: false,
  placeholder: '',
  shouldRetryOnError: () => false,
};

class ReactiveSearch extends Component {
  constructor() {
    super();
    this.state = { inputValue: '' };
    this.input$ = new Subject();
  }

  componentDidMount() {
    const {
      getUrlToRequest,
      onResponse,
      onFatalError,
      shouldRetryOnError,
    } = this.props;

    this.subscription = this.input$
      .subscribe(inputValue => this.setState({ inputValue }));

    const searchSubscription = this.input$
      .map(value => value.trim().toLowerCase().replace(/\s\s+/g, ' '))
      .filter(value => value.length)
      .debounceTime(150)
      .switchMap((searchTerm) => {
        const url = getUrlToRequest(searchTerm);
        return fetch(url);
      })
      .catch((error, source) => {
        if (shouldRetryOnError(error) === true) {
          return source;
        }

        throw error;
      })
      .subscribe({
        next: onResponse,
        error: onFatalError,
      });

    this.subscription.add(searchSubscription);
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <input
        type="text"
        placeholder={this.props.placeholder}
        autoFocus={this.props.focus}
        className={this.props.classes.join(' ')}
        value={this.state.inputValue}
        onChange={event => this.input$.next(event.target.value)}
      />
    );
  }
}

ReactiveSearch.propTypes = propTypes;
ReactiveSearch.defaultProps = defaultProps;

export default ReactiveSearch;
