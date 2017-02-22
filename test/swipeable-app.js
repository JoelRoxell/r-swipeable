import React, { Component, PropTypes } from 'react';
import Swipeable from '../src';

function renderTestItems() {
  return [1, 2, 3, 4, 5].map(i => {
    return (
      <div
        className={ 'child' }
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

    this.state = { currentIndex: 0 };

    this.onChange = this.onChange.bind(this);
    this.forward = this.step.bind(this, true);
    this.backward = this.step.bind(this, false);
  }

  step(forward) {
    let currentIndex = this.state.currentIndex;

    if (forward) {
      this.setState({ currentIndex: ++this.state.currentIndex });
    } else {
      this.setState({ currentIndex: --this.state.currentIndex });
    }
  }

  onChange(index) {
    // Update container state if swipeable is updated internally by a drag.
    this.setState({ currentIndex: index });
  }

  render() {
    return (
      <div>
        <Swipeable
          onChange={ this.onChange }
          currentIndex={ this.state.currentIndex }
          stiffness={ 300 }
          damping={ 10 }
        >
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
