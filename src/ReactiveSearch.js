import React, { Component, PropTypes } from 'react';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/switchMap';

import request from './request';

class ReactiveSearch extends Component {
  constructor() {
    super();
    this.state = { inputValue: '' };
    this.input$ = new Subject();
  }

  componentDidMount() {
    const { getUrlToRequest, onResponseHandler, onErrorHandler } = this.props;

    this.subscription = this.input$
      .subscribe(inputValue => this.setState({ inputValue }));

    const searchSubscription = this.input$
      .map(value => value.trim().toLowerCase().replace(/\s\s+/g, ' '))
      .filter(value => value.length)
      .delay(400)
      .throttleTime(150)
      .switchMap((searchTerm) => {
        const url = getUrlToRequest(searchTerm);
        return request(url);
      })
      .subscribe({
        // TODO It looks like when the Observable encounters an error it stop sending notifications.
        // Gotta investigate and see if that's a behaviour we want for a search input.
        // Can we recover from it?
        next: onResponseHandler,
        error: onErrorHandler,
      });

    this.subscription.add(searchSubscription);
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <input
        className={this.props.classes.join(' ')}
        value={this.state.inputValue}
        onChange={event => this.input$.next(event.target.value)}
      />
    );
  }
}

ReactiveSearch.propTypes = {
  classes: PropTypes.arrayOf(PropTypes.string),
  getUrlToRequest: PropTypes.func.isRequired,
  onResponseHandler: PropTypes.func.isRequired,
  onErrorHandler: PropTypes.func.isRequired,
};

ReactiveSearch.defaultProps = {
  classes: [],
};

export default ReactiveSearch;
