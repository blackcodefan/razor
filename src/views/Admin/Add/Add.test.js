import React from 'react';
import AddUser from './Add';
import { shallow } from 'enzyme'

it('renders without crashing', () => {
  shallow(<AddUser />);
});
