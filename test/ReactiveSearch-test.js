/* eslint-disable no-use-before-define */

import React from 'react';
import fetchMock from 'fetch-mock';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Subject } from 'rxjs/Subject';
import { Subscriber } from 'rxjs/Subscriber';
import { stub } from 'sinon';
import ReactiveSearch from '../src/ReactiveSearch';

const noop = () => {};

// Helper to generate a shallow input.
function generateInput({
  classes = [],
  getUrlToRequest = noop,
  onResponse = noop,
  onFatalError = noop,
  shouldRetryOnError = () => false,
} = {}) {
  return shallow(
    <ReactiveSearch
      classes={classes}
      getUrlToRequest={getUrlToRequest}
      onResponse={onResponse}
      onFatalError={onFatalError}
      shouldRetryOnError={shouldRetryOnError}
    />,
  );
}

const basicInput = generateInput();

describe('<ReactiveSearch />', () => {
  it('Should render without errors.', () => {
    expect(basicInput.length).to.be.equal(1);
  });

  it('Should have default props.', () => {
    const {
      classes,
      shouldRetryOnError,
      placeholder,
      focus,
    } = basicInput.instance().props;

    expect(classes).to.be.deep.equal([]);
    expect(shouldRetryOnError()).to.be.equal(false);
    expect(placeholder).to.be.equal('');
    expect(focus).to.be.equal(false);
  });

  it('Should have default state.', () => {
    const defaultState = basicInput.state();

    expect(defaultState).to.be.deep.equal({
      inputValue: '',
    });
  });

  it('Should render an input.', () => {
    const props = basicInput.props();

    expect(basicInput.type()).to.be.equal('input');
    expect(props.type).to.be.equal('text');
    expect(props.className).to.be.equal('');
    expect(props.value).to.be.equal('');
    expect(props.onChange).to.be.a('function');
    expect(props.placeholder).to.be.equal('');
    expect(props.autoFocus).to.be.equal(false);
  });

  it('Should have a Subject (observable) as property.', () => {
    expect(basicInput.instance().input$).to.be.instanceOf(Subject);
  });

  it('Mounting should create a subscription property.', () => {
    const instance = generateInput().instance();

    instance.componentDidMount();
    expect(instance.subscription).to.be.instanceOf(Subscriber);
  });

  it('Should unsubscribe when unmounting.', () => {
    const input = generateInput();
    const instance = input.instance();

    instance.componentDidMount();
    input.unmount();

    expect(instance.subscription.closed).to.be.equal(true);
  });

  it('Should dispatch an event from an obversable on user input.', () => {
    const input = generateInput();
    const instance = input.instance();
    const stubbed = stub(instance.input$, 'next');
    const mockEvent = { target: { value: 'Awesome text input' } };

    instance.forceUpdate();
    input.simulate('change', mockEvent);

    expect(stubbed.calledOnce).to.be.equal(true);
    expect(stubbed.alwaysCalledWithExactly('Awesome text input')).to.be.equal(true);
  });

  it('Should fetch the url returned by getUrlToRequest().', (complete) => {
    const urlMatcher = '/foo/bar';
    const getUrlToRequest = () => urlMatcher;
    fetchMock.get(urlMatcher, {});

    const instance = generateInput({ getUrlToRequest }).instance();

    instance.componentDidMount();
    instance.input$.next('new value');

    // TODO Once the debounce time will be set as a prop, we'll be able to lower this down.
    setTimeout(() => {
      const calls = fetchMock.calls();
      expect(calls.unmatched.length).to.be.equal(0);
      expect(calls.matched.length).to.be.equal(1);
      expect(fetchMock.lastUrl()).to.be.equal(urlMatcher);

      fetchMock.restore();
      complete();
    }, 150);
  });

  it('Should call onResponse handler after getting a successful response from the API call.', (complete) => {
    const urlMatcher = '/foo/bar';
    const getUrlToRequest = () => urlMatcher;

    // This is where we actually assert and finish the test.
    // This method is required to be called by the tested code.
    const onResponse = response => (
      response.json()
        .then((result) => {
          expect(result).to.be.deep.equal({ foo: 'bar' });
          complete();
        })
        .catch(complete)
    );

    fetchMock.get(urlMatcher, { foo: 'bar' });

    const instance = generateInput({ getUrlToRequest, onResponse }).instance();

    instance.componentDidMount();
    instance.input$.next('new value');

    // TODO use afterEach instead.
    setTimeout(fetchMock.restore, 150);
  });

  it('Should call shouldRetryOnError on error and should not call onFatalError.', (complete) => {
    const urlMatcher = '/foo/bar';
    const getUrlToRequest = status => `${urlMatcher}/${status}`;

    fetchMock.get(`${urlMatcher}/fail`, {
      throws: new Error('ignore me'),
    });

    fetchMock.get(`${urlMatcher}/success`, {});

    const instance = generateInput({
      getUrlToRequest,
      onFatalError,
      shouldRetryOnError,
      onResponse,
    }).instance();

    instance.componentDidMount();
    instance.input$.next('fail');

    setTimeout(() => {
      // Gotta send a new event later, so the debounce doesn't ignore it.
      // TODO Once the debounce time will be set as a prop, we'll be able to lower this down.
      instance.input$.next('success');
    }, 200);

    // If this is called, fail the test.
    function onFatalError() {
      complete(new Error('onFatalError() wasn\'t expected to be called.'));
    }

    function shouldRetryOnError() {
      return true;
    }

    function onResponse() {
      complete();
    }
  });

  it('Should call onFatalError if not skipped.', (complete) => {
    const urlMatcher = '/foo/bar';
    const getUrlToRequest = () => urlMatcher;

    const onFatalError = (error) => {
      expect(error.message).to.be.equal('testing fatal error');
      complete();
    };

    fetchMock.get(urlMatcher, {
      throws: new Error('testing fatal error'),
    });

    const instance = generateInput({ getUrlToRequest, onFatalError }).instance();

    instance.componentDidMount();
    instance.input$.next('new value');

    // TODO use afterEach instead.
    setTimeout(fetchMock.restore, 150);
  });

  it('Should join its classes.', () => {
    const input = generateInput({
      classes: ['foo', 'bar'],
    });

    expect(input.prop('className')).to.be.equal('foo bar');
  });

  it('Should have a value prop that is bound to the state.', () => {
    const input = generateInput();

    input.setState({
      inputValue: 'hello world',
    });

    expect(input.prop('value')).to.be.equal('hello world');
  });

  it.skip('Should set the inputValue state when receiving values from Obversables', () => {});
});
