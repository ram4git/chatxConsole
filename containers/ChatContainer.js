import React, { Component } from 'react';

class ChatContainer extends Component {
    state = {}

    render() {
        return this.props.children;
    }
}
 
export default ChatContainer;