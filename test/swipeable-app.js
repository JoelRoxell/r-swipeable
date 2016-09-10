import React, { Component, PropTypes } from 'react';
import Swipeable from '../src';

function renderTestItems() {
  return [1, 2, 3, 4, 5].map(i => {
    return (
      <div
        className={`child child-${i}`}
        key={ i }
      >
        { i }
      </div>
    );
  });
}

const SwipeableComponent = () => (
  <Swipeable>
    { renderTestItems() }
  </Swipeable>
);

export default SwipeableComponent;
