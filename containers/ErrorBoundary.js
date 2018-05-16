import React, { Component } from 'react';


export default class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }


  
    componentDidCatch(error, info) {
        console.log('ERROR CATCH ', JSON.stringify(error, null, 2) + JSON.stringify(info, null,2));
      // Display fallback UI
      // this.setState({ hasError: true });
      // You can also log the error to an error reporting service
      //logErrorToMyService(error, info);
    }
  
    render() {
      // if (this.state.hasError) {
      //   // You can render any custom fallback UI
      //   return (
      //       <View style={{backgroundColor: '#c0392b', flex: 1, flexDirection: 'column',
      //       justifyContent: 'center',
      //       alignItems: 'center'}}>
      //           <Text>This means we caught an exception somewhere! Improvise this screen later!!</Text>
      //       </View>
      //   );
      // }
      return this.props.children;
    }
  }