import React, { Component } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableHighlight, View, YellowBox } from 'react-native';
import data from './data';
YellowBox.ignoreWarnings([
  'Encountered an error loading page',    // WebView uri: result.url and url failing to load - "bloomberg suneq" https://github.com/facebook/react-native/issues/7839#issuecomment-224111608
  'Deprecation warning: moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
  'Task orphaned for request ',
  'Remote debugger is in a background tab which may cause apps to perform slowly',
]);
console.disableYellowBox = true;


const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
		backgroundColor: 'white'
  },
	title: {
		marginTop: 50,
		alignItems: 'center'
	},
	titleText: {
		fontSize: 16,
		marginTop: 20,
		marginBottom: 20
	},

	listContainer: {
		flex: 1,
		alignItems:'center',
		justifyContent:'center',
		width: '100%'
	},

	flexRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginTop: 20
	},

	bottomTextStyle: {
		fontSize: 14,
		marginLeft: 25,
	},

	rightArrowimageStyle: {
		marginRight: 25,
		marginLeft: 'auto',
	},

	flatList: {
		width: '100%'
	},

	separator: {
		height: 1,
		width: "90%",
		backgroundColor: "#cccccc",
		flex:1,
		alignSelf: 'center',
		marginTop: 20
	}

});



export default class LandingScreen extends Component {

	static navigationOptions = ({navigation}) => (
		{
			title: `Baylor Scott & White Pharmacy`,
			headerTintColor: '#ffffff',
			headerStyle: {
				backgroundColor: '#00539d',
				borderBottomColor: '#ffffff',
			},
			headerTitleStyle: {
				fontSize: 18,
			},
		}
	);

	FlatListItemSeparator = () => {
    return (
      <View
        style={s.separator}
      />
    );
  }


	renderListItem(item) {
		return (
			<View>
				<TouchableHighlight
					onPress={() => this.props.navigation.navigate('Info', {data: item})}
					underlayColor='#ffffff'
					>
					<View style={s.flexRow}>
						<Text style={s.bottomTextStyle}>{item.title}</Text>
						<Image style={s.rightArrowimageStyle} source={require('./images/btnArrowRight.ios.png')} />
					</View>
				</TouchableHighlight>
			</View>
		);
	}


	render() {
		return(
			<View style={s.container}>
				<View style={s.title}>
					<Image
						source={require('./images/liveChatIconScreen.png')}
					/>
					<Text style={s.titleText}>Hello, Jennifer. How can I help?</Text>
				</View>
				<View style={s.listContainer}>
					<FlatList
						data={data}
						renderItem={({item}) => this.renderListItem(item) }
						keyExtractor={ (item, index) => item.title }
						style={s.flatList}
						ItemSeparatorComponent = {this.FlatListItemSeparator}
						ListFooterComponent = {this.FlatListItemSeparator}

						/>
				</View>
			</View>
		)
	}
}
