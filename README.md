# r-swipeable
A react component making its child elements swipeable.

- Snaps nearest child center to swipe-container center.
- Child x-axis centers are currently based on the first child element.

## Usage
```js
import React, { Component, PropTypes } from 'react';
import Swipeable from 'r-swipeable';

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

```
## Example
![example-gif](http://gropio.com/stek/file/d3gzts)
