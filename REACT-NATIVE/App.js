
import RNRestart from 'react-native-restart'; 

import React,{isValidElement, useState} from 'react';
import uuid from 'react-native-uuid';
import {View, StyleSheet,Text,Switch,Button } from 'react-native';
import {
    AppState
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import init from 'react_native_mqtt';
import  {AsyncStorage}  from '@react-native-async-storage/async-storage';

	init({
	  size: 10000,
	  storageBackend: AsyncStorage,
	  defaultExpires: 1000 * 3600 * 24,
	  enableCache: true,
	  reconnect: true,
	  sync : {
	  }
	});
	

export default class HumidityScreen extends React.Component {
	



	static navigationOptions = {
	    header: null,
	  };


  constructor(props) {
    super(props);
	let currentTime = +new Date();
	let clientID = currentTime + uuid.v1();
	clientID = clientID.slice(0, 23);
	console.log('clientID: ', clientID) 
    const client = new Paho.MQTT.Client('',8884,clientID);
    client.onConnectionLost = this.onConnectionLost;
    client.onMessageArrived = this.onMessageArrived;



    this.state = {
		checked:null,
      humidity: '...',
      client,
	  appState: AppState.currentState,
      loading: "Conectando...",
      showError: false,
	  switch: true
    };
	this.Off=this.Off.bind(this);
  }


  componentDidMount() {
	const { client } = this.state;
	

	client.connect({
		onSuccess: this.onConnect, 
		onFailure: this.onConnectionLost,
		userName: '',
		password : '',
		useSSL : true
	  });

	AppState.addEventListener('change', this._handleAppStateChange);
	
    	// do stuff while splash screen is shown
        // After having done stuff (such as async tasks) hide the splash screen
     
			// do stuff while splash screen is shown
			// After having done stuff (such as async tasks) hide the splash screen
		
		
 
  }
 
	
	
		




  
  _handleAppStateChange = (nextAppState) => {
    if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
			console.log("AppState", nextAppState);
        } 
		if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active'&&this.state.switch==true
        ) {
			
			console.log("reconectando al broker");
			RNRestart.Restart();

        } 
        this.setState({ appState: nextAppState });
};

	onConnectionLost = (responseObject) => 
	{
	  if (responseObject.errorCode !== 0) 
	  {
	    console.log("onConnectionLost:"+responseObject.errorMessage);
	 
	 
	  }
	  this.setState({switch: true})
	}

  	onConnect = () => 
	{
	    const { client } = this.state;
	 
		client.subscribe('mcu');
	    console.log("Conectado al broker")
		this.setState({switch: false})
	
		SplashScreen.hide();
 	}
 Off() 
	{  const { client } = this.state;
	    this.setState({checked:!this.state.checked})
		if(this.state.checked==false){
			client.send('app','0',0,true)
		}else{
			client.send('app','1',0,true)
		}
	  
 	}
	
	onMessageArrived = (message) => 
	{  
		
		console.log(message.payloadString)
		try{

		let json = message.payloadString

		if( json == '1' )
		{
		
			this.setState({ checked: false ,
				loading:"apagada"
			
			})

		}else{
			this.setState({ checked: true ,
				loading:"encendida"
			
			})
		}

		}catch(e)
		{
			console.log("La informacion no es relevante")
		}
	}




	

  render() 
  { 
   
		return(
			<View style={styles.container}>
				 <View style={styles.cardContainer}>
					 <View  style={styles.HeaderContainer}>
				            <Text style={{fontSize: 30 , color: '#B3B3B3'}}>Terma</Text> 
                          </View>
		                     <Text style={{ fontSize: 40, color: '#FFFFFF',marginTop: 20 }}
                                         >{this.state.loading}</Text>
		                <View  style={styles.SwitchContainer}>
		<Switch
		disabled={this.state.switch}
		style={{  marginTop: 80, transform: [{ scaleX: 4 }, { scaleY: 4}] }}
		  trackColor={{ false: "#767577", true: "#4DFB38" }}
		    thumbColor={this.state.checked? "#FFFFFF" : "#f4f3f4"}
		onValueChange={this.Off}
		value={this.state.checked}
		
		/>
		</View>
			</View>
			
		</View>
		)  

  }
}

const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  alignItems: "center",
	  justifyContent: "center",
	  backgroundColor: '#181818',
	
	},
	HeaderContainer: {

	
	  
	  },
	  SwitchContainer: {
		
		
	
	  
	  },
	cardContainer: {
		alignItems: "center",
		justifyContent: "center",
         borderRadius: 40,
        backgroundColor: '#404040',
        width: 300,
        height: 400,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.1,
		shadowRadius: 100,
		elevation: 15
    }
  });