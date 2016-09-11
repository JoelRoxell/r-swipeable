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

class SwipeableComponent extends Component {
  constructor(props) {
    super(props);

    this.setSwipeNode = this.setSwipeNode.bind(this);
    this.forward = this.step.bind(this, true);
    this.backward = this.step.bind(this, false);
  }

  step(forwards) {
    let currentIndex = this.swiper.state.currentCenteredChildIndex;

    forwards === true ?
      this.swiper.positionViewByChildIndex(++currentIndex):
      this.swiper.positionViewByChildIndex(--currentIndex);
  }

  setSwipeNode(node) {
    this.swiper = node;
  }

  render() {
    return (
      <div>
        <Swipeable ref={ this.setSwipeNode }>
          { renderTestItems() }
        </Swipeable>

        <div onClick={ this.forward }>
          { `Go to forward` }
        </div>

        <div onClick={ this.backward }>
          { `Go to backward` }
        </div>
      </div>
    );
  }
}

export default SwipeableComponent;
