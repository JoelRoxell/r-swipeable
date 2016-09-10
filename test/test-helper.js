import jsdom from 'jsdom';
import TestUtils from 'react-addons-test-utils';
import { expect as _expect } from 'chai';

global.document = jsdom.jsdom('<html><body></body></html>');
global.window = global.document.defaultView;

function _renderComponent(Component) {
  const instance = TestUtils.renderIntoDocument(<Component />);
}

export const renderComponent = _renderComponent;
export const expect = _expect;
