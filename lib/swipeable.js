'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactPrefixer = require('react-prefixer');

var _reactPrefixer2 = _interopRequireDefault(_reactPrefixer);

var _style = require('./style');

var _style2 = _interopRequireDefault(_style);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Swipeable = function (_Component) {
  _inherits(Swipeable, _Component);

  function Swipeable(props) {
    _classCallCheck(this, Swipeable);

    var _this = _possibleConstructorReturn(this, (Swipeable.__proto__ || Object.getPrototypeOf(Swipeable)).call(this, props));

    _this.state = {
      contentPos: 0,
      dragging: false,
      clientX: 0,
      oldClientX: 0,
      clientStartX: 0,
      clientEndX: 0,
      direction: null,
      timeFromStart: 0
    };

    _this.onDown = _this.onDown.bind(_this);
    _this.onUp = _this.onUp.bind(_this);
    _this.onLeave = _this.onLeave.bind(_this);
    _this.onMove = _this.onMove.bind(_this);
    _this.setViewportNode = _this.setViewportNode.bind(_this);
    _this.setContentNode = _this.setContentNode.bind(_this);
    _this.animateDrag = _this.animateDrag.bind(_this);
    return _this;
  }

  _createClass(Swipeable, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.updateViewMetrics();
      requestAnimationFrame(this.animateDrag);

      var contentCenterChildIndex = Math.floor(this.childXCenterPosList.length / 2);

      // Center by props index or select the "most" centered child.
      if (!isNaN(this.props.currentIndex)) {
        contentCenterChildIndex = this.props.currentIndex;
      }

      var contentPos = this.viewportCenter - this.childXCenterPosList[contentCenterChildIndex].clientXCenter;

      this.setState({
        contentPos: contentPos,
        currentCenteredChildIndex: contentCenterChildIndex
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nProps) {
      // Index state was changed by a component containing the `Swipeable`.
      if (this.props.currentIndex !== nProps.currentIndex) {
        this.positionViewByChildIndex(nProps.currentIndex);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      this.updateViewMetrics();

      var currentIndex = this.props.currentIndex,
          childLimitLength = this.childXCenterPosList.length - 1;

      // Prevent external index management to step out of bounds.
      if (currentIndex < 0) {
        this.props.onChange(0);
      } else if (currentIndex > childLimitLength) {
        this.props.onChange(childLimitLength);
      }

      if (prevState.currentCenteredChildIndex === this.state.currentCenteredChildIndex) {
        return;
      }

      // Finally trigger `onChange` cb if it's defined.
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(this.state.currentCenteredChildIndex);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.cancelAnimationFrame = true;
    }

    /**
     * Update components properties to keep track of the DOM elements metrics used when swiping.
     */

  }, {
    key: 'updateViewMetrics',
    value: function updateViewMetrics() {
      this.leftLimit = 0;
      this.viewportWidth = this.viewport.offsetWidth;
      this.viewportCenter = this.viewportWidth / 2;
      this.rightLimit = this.viewportWidth - this.content.offsetWidth;

      // If last child is lesser than the viewport, allow it to be dragged a bit further.
      if (this.content.childNodes[0].offsetWidth < this.viewportWidth) {
        var slack = this.viewportWidth / 2;

        this.leftLimit = slack;
        this.rightLimit = this.viewportWidth - this.content.offsetWidth - slack;
      }

      this.determineChildrensMainAxisCenter();
    }

    /**
     * Calculate the center position for `content` children.
     */

  }, {
    key: 'determineChildrensMainAxisCenter',
    value: function determineChildrensMainAxisCenter() {
      if (!this.content.childNodes.length) {
        throw new Error('Child `node`(s) must be passed to the swipeable component.');
      }

      var childCount = this.content.childNodes.length;

      var childXCenterPosList = [];

      this.childLength = this.content.offsetWidth / childCount;

      // Determine center x cordinate of each child.
      for (var i = 0, childStartXCoordinate = 0; i < childCount; i++) {
        var clientXCenter = void 0,
            childCenter = void 0,
            currentChild = void 0;

        currentChild = this.content.childNodes[i];
        childCenter = currentChild.offsetWidth / 2;
        clientXCenter = childStartXCoordinate + childCenter;
        childStartXCoordinate += currentChild.offsetWidth;

        childXCenterPosList.push({
          node: currentChild,
          clientXCenter: clientXCenter
        });
      }

      this.childXCenterPosList = childXCenterPosList;
    }

    /**
     * Position nearest `content` child in `viewport` center.
     */

  }, {
    key: 'repositionToClosestChildCenter',
    value: function repositionToClosestChildCenter() {
      var nearestChild = this.getClosestViewportChild();

      this.setState({
        contentPos: this.viewportCenter - nearestChild.clientXCenter,
        currentCenteredChildIndex: this.childXCenterPosList.indexOf(nearestChild)
      });
    }

    /**
     * Finds the nearset child relative to `viewportCenter`.
     *
     * @return most centered child element in `content`.
     */

  }, {
    key: 'getClosestViewportChild',
    value: function getClosestViewportChild() {
      // Get content center cordinate relative to viewport.
      var realativeContentCenterPos = this.viewportCenter - this.state.contentPos;

      var findClosestChild = function findClosestChild(preChild, curChild) {
        var prePos = preChild.clientXCenter,
            curPos = curChild.clientXCenter;

        return Math.abs(realativeContentCenterPos - curPos) > Math.abs(realativeContentCenterPos - prePos) ? preChild : curChild;
      };

      return this.childXCenterPosList.reduce(findClosestChild);
    }

    /**
     * Calcualtes the drag velocity from start until end.
     *
     * @return Number pixels traveld by ms.
     */

  }, {
    key: 'getDragVelocity',
    value: function getDragVelocity() {
      var _state = this.state,
          clientStartX = _state.clientStartX,
          clientEndX = _state.clientEndX,
          timeFromStart = _state.timeFromStart,
          timeTraveled = Date.now() - timeFromStart;


      return Math.abs(clientEndX - clientStartX) / timeTraveled;
    }

    /**
     * Position view by child index.
     */

  }, {
    key: 'positionViewByChildIndex',
    value: function positionViewByChildIndex(targetIndex) {
      // Limit targetIndex bounds.
      if (targetIndex < 0) {
        targetIndex = 0;
      } else if (targetIndex === this.childXCenterPosList.length) {
        targetIndex = this.childXCenterPosList.length - 1;
      }

      this.setState({
        contentPos: this.viewportCenter - this.childXCenterPosList[targetIndex].clientXCenter,
        currentCenteredChildIndex: targetIndex
      });
    }
  }, {
    key: 'onDown',
    value: function onDown(e) {
      var newCordinates = {};

      if (e.type === 'touchstart') {
        newCordinates = {
          clientX: e.touches[0].clientX,
          oldClientX: e.touches[0].clientX,
          clientStartX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
          oldClientY: e.touches[0].clientY
        };
      } else {
        newCordinates = {
          clientX: e.clientX,
          oldClientX: e.clientX,
          clientStartX: e.clientX
        };
      }

      this.setState(_extends({}, newCordinates, {
        dragging: true,
        timeFromStart: Date.now()
      }));
    }
  }, {
    key: 'onMove',
    value: function onMove(e) {
      if (!this.state.dragging) {
        return;
      }

      var nextState = void 0,
          clientX = void 0,
          clientY = void 0;

      if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;

        var _state2 = this.state,
            oldClientY = _state2.oldClientY,
            oldClientX = _state2.oldClientX;

        // Compute inclination and decide if x-drag should be ignored.

        if (oldClientX && oldClientY) {
          var k = (oldClientY - clientY) / (oldClientX - clientX),
              slopeDegree = Math.atan(k) * (180 / Math.PI);

          if (Math.abs(slopeDegree) > this.props.slopeLimit) {
            this.setState({
              oldClientY: clientY,
              oldClientX: clientX
            });

            return;
          }
        }
      } else {
        clientX = e.clientX;
      }

      e.preventDefault();

      var distance = clientX - this.state.oldClientX,
          direction = distance > 0 ? Swipeable.RIGHT : Swipeable.LEFT;

      nextState = {
        oldClientX: clientX,
        oldClientY: clientY,
        direction: direction
      };

      // Check that drag doesn't exceeds view limitations,
      // if so limit to specified right/left limits.
      if (this.state.contentPos >= this.leftLimit && direction === Swipeable.RIGHT) {
        nextState.contentPos = this.leftLimit;
      } else if (this.state.contentPos <= this.rightLimit && direction === Swipeable.LEFT) {
        nextState.contentPos = this.rightLimit;
      } else {
        nextState.contentPos = this.state.contentPos + distance;
      }

      this.setState(nextState);
    }
  }, {
    key: 'onUp',
    value: function onUp(e) {
      var clientEndX = e.type === 'touchend' ? clientEndX = this.state.oldClientX : clientEndX = e.clientX;

      this.setState({
        dragging: false,
        clientEndX: clientEndX
      }, this.handleUp);
    }
  }, {
    key: 'handleUp',
    value: function handleUp() {
      var currentChildIndex = this.state.currentCenteredChildIndex;

      var distance = this.state.clientEndX - this.state.clientStartX;

      if (distance === 0) {
        return;
      }

      var nextTarget = this.state.direction === Swipeable.LEFT ? ++currentChildIndex : --currentChildIndex;

      if (nextTarget < 0) {
        nextTarget = 0;
      } else if (nextTarget === this.childXCenterPosList.length) {
        nextTarget = this.childXCenterPosList.length - 1;
      }

      // If velocity of a swipe is greater thatn the specified flick sensitivity
      // and the drag ditance is lesser or equal to the first child with.
      // A flick gesture has been initiated.
      if (this.getDragVelocity() > this.props.flickSensitivity && Math.abs(distance) <= this.content.childNodes[0].offsetWidth) {
        this.positionViewByChildIndex(nextTarget);
      } else {
        this.repositionToClosestChildCenter();
      }
    }
  }, {
    key: 'onLeave',
    value: function onLeave() {
      this.setState({ dragging: false }, this.repositionToClosestChildCenter());
    }
  }, {
    key: 'animateDrag',
    value: function animateDrag() {
      var translateStr = 'translate3d(' + this.state.contentPos + 'px, 0, 0)',
          style = {
        transform: translateStr
      },
          prefixStyles = (0, _reactPrefixer2.default)(style);

      for (var prefix in prefixStyles) {
        if (prefixStyles.hasOwnProperty(prefix)) {
          this.content.style[prefix] = prefixStyles[prefix];
        }
      }

      var rafId = requestAnimationFrame(this.animateDrag);

      if (this.cancelAnimationFrame) {
        cancelAnimationFrame(rafId);
      }
    }
  }, {
    key: 'setViewportNode',
    value: function setViewportNode(node) {
      this.viewport = node;
    }
  }, {
    key: 'setContentNode',
    value: function setContentNode(node) {
      this.content = node;
    }
  }, {
    key: 'setStyle',
    value: function setStyle() {
      var style = _style2.default.swipeableContent;

      if (!this.state.dragging) {
        style = _extends({}, style, _style2.default.animate);
      }

      return style;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        {
          style: _style2.default.swipeable,
          ref: this.setViewportNode,
          onMouseDown: this.onDown,
          onMouseMove: this.onMove,
          onMouseUp: this.onUp,
          onMouseLeave: this.onLeave,
          onTouchStart: this.onDown,
          onTouchMove: this.onMove,
          onTouchEnd: this.onUp,
          onTouchCancel: this.onLeave
        },
        _react2.default.createElement(
          'div',
          {
            style: this.setStyle(),
            ref: this.setContentNode
          },
          this.props.children
        )
      );
    }
  }]);

  return Swipeable;
}(_react.Component);

Swipeable.LEFT = 'LEFT';
Swipeable.RIGHT = 'RIGHT';
Swipeable.propTypes = {
  children: _react.PropTypes.arrayOf(_react.PropTypes.element).isRequired,
  className: _react.PropTypes.string,
  flickSensitivity: _react.PropTypes.number,
  slopeLimit: _react.PropTypes.number
};
Swipeable.defaultProps = {
  flickSensitivity: 0.3,
  slopeLimit: 45
};

exports.default = Swipeable;