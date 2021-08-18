import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import Colors from '../constants/colors';
import Fonts from '../constants/fonts';
import API from '../controllers/api';
import User from '../controllers/user';
import Button from './Button';
 
const Dashboard = () => {
	let questionInput = useRef();
	let joinSessionInput = useRef();

	let history = useHistory()

	//test
	let session = {
		question: 'What is life?',
		roomId: 'testID'
	}
	let [ownedSessions, setOwnedSessions] = useState([session,session,session,session]);
	let [joinedSessions, setJOinedSessions] = useState([session,session,session,session]);
	
	async function onStartSession(e) {
		e.preventDefault();
		let username = User.getUsername();
		let discourse = questionInput.current.value;
		let { roomId } = await API.createSession(username, discourse);
		await API.socketConnect(roomId);
		history.push(`/session/${roomId}/`);									
	}
	
	function onJoinSession() {

	}

    return (
		<div className="fullscreen" style={{display: 'flex', flexDirection: 'column'}}>
		<div style={{flex: 1, maxHeight: 60, display: 'flex', flexDirection: 'row', margin: 20, boxSizing: 'border-box', alignItems: 'center'}}>
			<div style={{...Fonts.bold, color: Colors.purple, fontSize: '3rem'}}>Dialektikós</div>
			<div style={{flex: 1}}/>
			<div style={{...Fonts.bold, color: Colors.gray, fontSize: '1rem'}}>{User.getUsername()}</div>
			<div style={{height: 60, width: 60, backgroundColor: Colors.gray, borderRadius: 30, marginLeft: 20}}></div>
		</div>
		<div style={{display: 'flex', flexDirection: 'row', }}>			 
			<div style={{flex: 1}}>
				<div style={{width: 300, marginLeft: 40}}>
					<input style={{...Fonts.bold, marginTop: 20, boxSizing: 'border-box',outline: 0, border: 0, borderRadius: 8, backgroundColor: Colors.lightGray, height: 50, width: '100%', padding: 4, paddingLeft: 14, marginBottom: 8}} ref={questionInput} placeholder="Enter a Question"></input>
					<Button style={{...Fonts.bold, marginTop: 20, backgroundColor: Colors.green, height: 50, width: '100%', borderRadius: 8, color: 'white'}} onClick={onStartSession}><div>Start a new Session</div></Button>
					<div style={{...Fonts.bold, color: Colors.purple, marginTop: 20}}>Restart an old session:</div>
					{ownedSessions.map((eachSession) => <Button style={{backgroundColor: 'white', marginTop: 20, height: 60, borderRadius: 8, ...Fonts.bold, color: Colors.darkGray}}>{eachSession.question}</Button>)}
				</div>
			</div>
			<div style={{flex: 1}}>
				<div style={{width: 300, marginLeft: 40}}>
					<input style={{...Fonts.bold, marginTop: 20, boxSizing: 'border-box',outline: 0, border: 0, borderRadius: 8, backgroundColor: Colors.lightGray, height: 50, width: '100%', padding: 4, paddingLeft: 14, marginBottom: 8}} ref={questionInput} placeholder="Enter a Session ID"></input>
					<Button style={{...Fonts.bold, marginTop: 20, backgroundColor: Colors.green, height: 50, width: '100%', borderRadius: 8, color: 'white'}} onClick={onStartSession}><div>Join an active Session</div></Button>
					<div style={{...Fonts.bold, color: Colors.purple, marginTop: 20}}>You also joined these Sessions</div>
					{joinedSessions.map((eachSession) => <Button style={{backgroundColor: 'white', marginTop: 20, height: 60, borderRadius: 8, ...Fonts.bold, color: Colors.darkGray}}>{eachSession.question}</Button>)}
				</div>				
			</div>
		</div>
	</div> 
    );
}
 
export default Dashboard;