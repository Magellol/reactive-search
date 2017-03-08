import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ReactiveSearch from '../src/ReactiveSearch';

describe('ReactiveSearch', () => {
  it('Should render without errors', () => {
    const input = shallow(<ReactiveSearch />);
  });
});
