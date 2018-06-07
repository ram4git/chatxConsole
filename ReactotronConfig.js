import Reactotron, { asyncStorage, networking, openInEditor, overlay, trackGlobalErrors } from 'reactotron-react-native';
  
    Reactotron
      .configure({
        name: 'React Native Demo'
      })
      .use(trackGlobalErrors())
      .use(openInEditor())
      .use(overlay())
      .use(asyncStorage())
      .use(networking())
      .connect();