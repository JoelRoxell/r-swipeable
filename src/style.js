import autoprefixer from 'react-prefixer';

export default autoprefixer({
  swipeable: {
    display: 'flex',
    width: '100%',
    overflow: 'hidden'
  },

  animate: {
    transition: 'transform .3s'
  },

  swipeableContent: {
     willChange: 'transform, transition',
     display: 'flex',
     flexDirection: 'row',
     flexShrink: '0'
  }
});
