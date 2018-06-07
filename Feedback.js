import React, { Component } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/Ionicons';
import { getStats, submitFeedback } from './api';



const s = StyleSheet.create({
	labelHeader: {
        justifyContent: 'center',
        alignItems: 'center',
        color: '#34495e',
        fontSize: 20,
        marginBottom: 10
    },
    container: {
		flex: 1,
		paddingLeft: 20,
		paddingRight: 20,
		backgroundColor: '#ecf0f1'
	},
	view: {
		marginTop: 20
    },
    textInput: {
        paddingLeft: 10,
        fontSize: 17,
        flex: 1,
        backgroundColor: 'white',
        borderWidth: 0,
        borderRadius: 4,
    },
    info: {
        color: 'orange'
    }
});



export default class InfoForm extends Component {

    static navigationOptions = ({navigation}) => (
		{
			title: `How did we help you?`,
			headerTintColor: '#ffffff',
			headerStyle: {
				backgroundColor: '#00539d',
				borderBottomColor: '#ffffff',
				borderBottomWidth: 3,
			},
			headerTitleStyle: {
				fontSize: 18,
            },
            headerLeft: <Icon name='md-chatbubbles' size={28} style={{marginLeft: 10}} onPress={() => navigation.navigate('Home', {data: {...this.state}})} color='white' />
		}
    );
    
    constructor(props) {
        super(props);
        this.state = {
          starCount: 2.5,
          endTime: new Date()
        };
      }
    
    onStarRatingPress(rating, context) {
        this.setState({
            [`${context}StarCount`]: rating
        });
    }
    onFeedbackTextChange(text) {
        this.setState({
            feedback: text || ''
        });
    }

    getStarColor(id) {
        const count = this.state[`${id}StarCount`];
        let color = '#16a085';
        switch(count) { 
            case 1: { 
               color = '#e74c3c'; 
               break; 
            }
            case 2: { 
                color = '#f39c12';
                break; 
            }
            case 3: { 
                color = '#2980b9'; 
                break; 
            }
            case 4: { 
                color = '#2ecc71';
                break; 
            } 
            case 5: { 
                color = '#16a085'; 
                break; 
            } 
        }
        return color;
    }

    render() {
        const { sessionTime, waitTime } = getStats();
        return (
            <ScrollView style={s.container}>
                <View style={s.view}>
                    <Text style={s.labelHeader}>How do you rate your experience with customer care executive?</Text>
                    <StarRating
                        disabled={false}
                        emptyStar={'ios-star-outline'}
                        fullStar={'ios-star'}
                        halfStar={'ios-star-half'}
                        iconSet={'Ionicons'}
                        maxStars={5}
                        rating={this.state.firstStarCount}
                        selectedStar={(rating) => this.onStarRatingPress(rating, 'first')}
                        fullStarColor={this.getStarColor('first')}
                        containerStyle={{
                            justifyContent: 'center',
                            alignItems: 'center'}}
                    />
                </View>
                <View style={s.view}>
                    <Text style={s.labelHeader}>How easy it is to use chat client?</Text>
                    <StarRating
                        disabled={false}
                        emptyStar={'ios-star-outline'}
                        fullStar={'ios-star'}
                        halfStar={'ios-star-half'}
                        iconSet={'Ionicons'}
                        maxStars={5}
                        rating={this.state.secondStarCount}
                        selectedStar={(rating) => this.onStarRatingPress(rating, 'second')}
                        fullStarColor={this.getStarColor('second')}
                        containerStyle={{
                            justifyContent: 'center',
                            alignItems: 'center'}}
                    />
                </View>
                <View style={s.view}>
                    <Text style={s.labelHeader}>How do you rate Agent's ability to understand your concern?</Text>
                    <StarRating
                        disabled={false}
                        emptyStar={'ios-star-outline'}
                        fullStar={'ios-star'}
                        halfStar={'ios-star-half'}
                        iconSet={'Ionicons'}
                        maxStars={5}
                        rating={this.state.thirdStarCount}
                        selectedStar={(rating) => this.onStarRatingPress(rating, 'third')}
                        fullStarColor={this.getStarColor('third')}
                        containerStyle={{
                            justifyContent: 'center',
                            alignItems: 'center'}}
                    />
                </View>
                <View style={s.view}>
                    <Text style={s.labelHeader}>Feedback</Text>
                    <AutoGrowingTextInput
                        style={s.textInput}
                        placeholder={'type here ...'}
                        maxHeight={200}
                        minHeight={100}
                        enableScrollToCaret
                        onChangeText={(event) => this.onFeedbackTextChange(event)}
                    />
                </View>
                <Button
					style={s.button}
					onPress={() => {
                        submitFeedback({
                            rating1: this.state.firstStarCount,
                            rating2: this.state.secondStarCount,
                            rating3: this.state.thirdStarCount,
                            msg: this.state.feedback
                        });
                        this.props.navigation.navigate('Home', {data: {...this.state}})
                        
                    }}
                    title='Submit'
                    disabled={!(this.state.firstStarCount || this.state.secondStarCount || this.state.thirdStarCount || this.state.feedback)}
				/>

                <View>
                    <Text style={s.info}>{`Total Session: ${sessionTime}`}</Text>
                    <Text style={s.info}>{`Total Waiting: ${waitTime}`}</Text>
                </View>
            </ScrollView>
        )
    }
}