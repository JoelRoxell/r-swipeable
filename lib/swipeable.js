'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactMotion = require('react-motion');

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
      timeFromStart: 0,
      direction: 'NONE',
      clientX: 0,
      oldClientX: 0,
      clientStartX: 0,
      clientEndX: 0,
      clientY: 0,
      oldClientY: 0,
      leftLimit: 0,
      rightLimit: 0,
      viewportWidth: 0,
      viewportCenter: 0,
      totalWidth: 0,
      childWidth: 0,
      slack: 0,
      currentCenteredChildIndex: 0,
      contentWidth: 0
    };

    _this.onDown = _this.onDown.bind(_this);
    _this.onUp = _this.onUp.bind(_this);
    _this.onLeave = _this.onLeave.bind(_this);
    _this.onMove = _this.onMove.bind(_this);
    _this.setViewportNode = _this.setViewportNode.bind(_this);
    _this.setContentNode = _this.setContentNode.bind(_this);
    _this.determineChildrensMainAxisCenter = _this.determineChildrensMainAxisCenter.bind(_this);
    _this.setCarouselLayout = _this.setCarouselLayout.bind(_this);
    return _this;
  }

  _createClass(Swipeable, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.setCarouselLayout();

      window.addEventListener('resize', function carouselResize() {
        this.setCarouselLayout();
      }.bind(this));
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nProps) {
      // Index state was changed by a parent passing props to the `Swipeable`.
      if (this.props.currentIndex !== nProps.currentIndex) {
        this.positionViewByChildIndex(nProps.currentIndex);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (!this.childXCenterPosList) {
        return;
      }

      var currentIndex = this.props.currentIndex;
      var childLimitLength = this.childXCenterPosList.length - 1;

      // Prevent external index management to step out of bounds.
      if (currentIndex < 0) {
        this.props.onChange(0);
      } else if (currentIndex > childLimitLength) {
        this.props.onChange(childLimitLength);
      }

      if (prevState.currentCenteredChildIndex === this.state.currentCenteredChildIndex) {
        return;
      }

      // Trigger `onChange` cb if it's defined.
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(this.state.currentCenteredChildIndex);
      }
    }
  }, {
    key: 'setCarouselLayout',
    value: function setCarouselLayout() {
      var _this2 = this;

      this.updateViewMetrics().then(function () {
        var contentCenterChildIndex = Math.floor(_this2.childXCenterPosList.length / 2);

        // Center by props index or select the "most" centered child.
        if (!isNaN(_this2.props.currentIndex)) {
          contentCenterChildIndex = _this2.props.currentIndex;
        }

        var contentPos = _this2.state.viewportCenter - _this2.childXCenterPosList[contentCenterChildIndex].clientXCenter;

        _this2.setState({
          contentPos: contentPos,
          currentCenteredChildIndex: contentCenterChildIndex
        });

        _this2.applyDisplayRuleToChildNodes();
      });
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

      var childCenter = this.state.childWidth / 2;

      // Determine center x cordinate of each child.
      for (var i = 0, childStartXCoordinate = 0; i < childCount; i++) {
        var _clientXCenter = void 0;
        var currentChild = void 0;

        currentChild = this.content.childNodes[i];
        _clientXCenter = childStartXCoordinate + childCenter;
        childStartXCoordinate += this.state.childWidth;

        childXCenterPosList.push({
          node: currentChild,
          clientXCenter: _clientXCenter
        });
      }

      this.childXCenterPosList = childXCenterPosList;
    }
  }, {
    key: 'updateViewMetrics',
    value: function updateViewMetrics() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        requestAnimationFrame(function () {
          var childWidth = _this3.content.children[0].offsetWidth;
          var contentWidth = _this3.content.childWidth;
          var viewportWidth = _this3.viewport.offsetWidth;
          var viewportCenter = viewportWidth / 2;
          var slack = viewportWidth / 2;
          var leftLimit = slack;
          var totalWidth = -(childWidth * _this3.content.children.length);
          var rightLimit = totalWidth + slack;

          _this3.setState({
            childWidth: childWidth,
            viewportWidth: viewportWidth,
            viewportCenter: viewportCenter,
            leftLimit: leftLimit,
            rightLimit: rightLimit,
            totalWidth: totalWidth,
            slack: slack,
            contentWidth: contentWidth
          }, function () {
            _this3.determineChildrensMainAxisCenter();
            resolve();
          });
        });
      });
    }
  }, {
    key: 'getClosestViewportChild',
    value: function getClosestViewportChild() {
      // Get content center cordinate relative to viewport.
      var realativeContentCenterPos = this.state.viewportCenter - this.state.contentPos;

      var findClosestChild = function findClosestChild(preChild, curChild) {
        var prePos = preChild.clientXCenter;
        var curPos = curChild.clientXCenter;

        return Math.abs(realativeContentCenterPos - curPos) > Math.abs(realativeContentCenterPos - prePos) ? preChild : curChild;
      };

      return this.childXCenterPosList.reduce(findClosestChild);
    }
  }, {
    key: 'repositionToClosestChildCenter',
    value: function repositionToClosestChildCenter() {
      var nearestChild = this.getClosestViewportChild();

      this.setState({
        contentPos: this.state.viewportCenter - nearestChild.clientXCenter,
        currentCenteredChildIndex: this.childXCenterPosList.indexOf(nearestChild)
      });
    }
  }, {
    key: 'getDragVelocity',
    value: function getDragVelocity() {
      var _state = this.state,
          clientStartX = _state.clientStartX,
          clientEndX = _state.clientEndX,
          timeFromStart = _state.timeFromStart;

      var timeTraveled = Date.now() - timeFromStart;

      return Math.abs(clientEndX - clientStartX) / timeTraveled;
    }
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
        contentPos: this.state.viewportCenter - this.childXCenterPosList[targetIndex].clientXCenter,
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

      var clientX = void 0;
      var clientY = void 0;

      if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;

        var _state2 = this.state,
            _oldClientY = _state2.oldClientY,
            _oldClientX = _state2.oldClientX;

        // Compute inclination and decide if x-drag should be ignored.

        if (_oldClientX && _oldClientY) {
          var k = (_oldClientY - clientY) / (_oldClientX - clientX);
          var slopeDegree = Math.atan(k) * (180 / Math.PI);

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

      var nextState = {
        oldClientX: clientX,
        oldClientY: clientY,
        direction: direction,
        contentPos: 0
      };

      // Check that drag doesn't exceeds view limitations,
      // if so limit to specified right/left limits.
      if (this.state.contentPos >= this.state.leftLimit && direction === Swipeable.RIGHT) {
        nextState.contentPos = this.state.leftLimit;
      } else if (this.state.contentPos <= this.state.rightLimit && direction === Swipeable.LEFT) {
        nextState.contentPos = this.state.rightLimit;
      } else {
        nextState.contentPos = this.state.contentPos + distance;
      }

      this.setState(nextState);
    }
  }, {
    key: 'onUp',
    value: function onUp(e) {
      var clientEndX = e.type === 'touchend' ? this.state.oldClientX : e.clientX;

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

      // If velocity of a swipe is greater than the specified flick sensitivity
      // and the drag ditance is lesser or equal to the first child width.
      // A flick gesture has been initiated.
      if (this.getDragVelocity() > this.props.flickSensitivity && Math.abs(distance) <= this.state.childWidth) {
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
    key: 'setViewportNode',
    value: function setViewportNode(node) {
      this.viewport = node;
    }
  }, {
    key: 'setContentNode',
    value: function setContentNode(node) {
      this.content = node;
    }

    /**
     * This adds 'display: inline-block' to all childnodes to spare users the
     * trouble of doing it manually and, also, prevent them from setting it to
     * anything else
     */

  }, {
    key: 'applyDisplayRuleToChildNodes',
    value: function applyDisplayRuleToChildNodes() {
      for (var i = 0; i < this.content.childNodes.length; i++) {
        this.content.childNodes[i].style.display = 'inline-block';
      }
    }
  }, {
    key: 'setStyle',
    value: function setStyle(_ref) {
      var pos = _ref.pos;

      var style = _style2.default.swipeableContent;

      var translateStr = 'translate3d(' + pos + 'px, 0, 0)';

      return _extends({}, style, {
        transform: translateStr
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var _props = this.props,
          siffness = _props.siffness,
          damping = _props.damping;
      var _state3 = this.state,
          dragging = _state3.dragging,
          contentPos = _state3.contentPos;

      var style = void 0;

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
        function () {
          if (dragging) {
            style = {
              translateX: contentPos
            };
          } else {
            style = {
              translateX: (0, _reactMotion.spring)(contentPos, {
                siffness: siffness,
                damping: damping
              })
            };
          }

          return _react2.default.createElement(
            _reactMotion.Motion,
            {
              defaultStyle: { translateX: 0 },
              style: style
            },
            function (_ref2) {
              var translateX = _ref2.translateX;
              return _react2.default.createElement(
                'div',
                {
                  style: {
                    willChange: 'transform',
                    display: 'flex',
                    transform: 'translate3d(' + translateX + 'px, 0px, 0)',
                    position: 'relative'
                  },
                  ref: _this4.setContentNode
                },
                _this4.props.children
              );
            }
          );
        }()
      );
    }
  }]);

  return Swipeable;
}(_react.Component);

Swipeable.LEFT = 'LEFT';
Swipeable.RIGHT = 'RIGHT';
Swipeable.defaultProps = {
  flickSensitivity: 0.3,
  slopeLimit: 45,
  stiffness: 120,
  damping: 14
};

exports.default = Swipeable;