# r-swipeable

r-swipeable provides `Swipeable` which makes its subcomponents horizontally swipeable.

* Repositions to nearest child center after a flick gesture.
* Uses `requestAnimationFrame` to manage translations changes.

## Usage

### Swipe and drag

```javascript
import React, { Component, PropTypes } from 'react';
import Swipeable from 'r-swipeable';

function renderTestItems() {
  return [1, 2, 3, 4, 5].map(i => (
    <div
      className={`child child-${i}`}
      key={ i }
    >
      { i }
    </div>
  ));
}

const SwipeableComponent = () => (
  <Swipeable>
    { renderTestItems() }
  </Swipeable>
);

export default SwipeableComponent;
```

#### Example

![example-gif](http://gropio.com/stek/file/d3gzts)

### Add button navigation
To manage the swiper state from a parent component us the following structure:

```javascript
class SwipeableComponent extends Component {
  constructor(props) {
    super(props);

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
        >
          { renderTestItems() }
        </Swipeable>

        <div onClick={ this.forward }>
          { `Go to forwards` }
        </div>

        <div onClick={ this.backward }>
          { `Go to backwards` }
        </div>
      </div>
    );
  }
}

export default SwipeableComponent;
```

## API

### `<Swipeable>`

#### Props

`children` (required) - Elements that will be wrapper and made swipeable. (horizontally)

`flickSensitivity` - Specifies a limit which decides when an actual flick gesture should be triggered.

`slopeLimit` - Indicates if a swipe should be considered x-drag or y-drag. It's only possible to swipe in on direction at the time.

#### Methods

`onChange(callback)`

Called with the new `index` as a parameter, every time a new index is set.

```javascript
function cb(index) {
  ...
}

<Swipeable onChange={ cb }>
  ...
</Swipeable>
```
