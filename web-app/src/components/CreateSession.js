import React from 'react';
import { useHistory, useLocation } from 'react-router';
import API from '../controllers/api';
 
const CreateSession = () => {
	let nameTextInput = React.createRef();
	let discourseTextInput = React.createRef();
	let restartTextInput = React.createRef();
	let history = useHistory()
	
	async function onStart(e) {
		e.preventDefault();
		let username = nameTextInput.current.value;
		let discourse = discourseTextInput.current.value;
		let restart = restartTextInput.current.value;
		let { roomId, secret } = await API.createSession(username, discourse);
		history.push(`/${roomId}`);				
		API.requestNodeData(roomId);

	// 	const location = useLocation();
	// location.pathname.slice(1)
	}

    return (
       <div className="CreateSession">
			<h2>Create Session</h2>
			<form>
			  <label>
			    <input ref={nameTextInput} className="input-box" type="text" name="name" placeholder="Name" value='Paolo'/>
				<br></br>
				<br></br>
			    <input ref={discourseTextInput} className="input-box" type="text" name="discourse" placeholder="Discourse" value='Can Artificial Intelligence Have Consciousness?'/>
			    <br></br>
				<br></br>
				or
				<br></br>
				<br></br>
			    <input ref={restartTextInput} className="input-box" type="text" name="restart" placeholder="Restart session with secret"/>
				
			    <br></br>
				<br></br>
				<br></br>
				<br></br>
				<input className="submit-button" value="Begin Discourse" style={{cursor: 'pointer', textAlign: 'center'}} onClick={onStart}/>

			  </label>
			</form>
       </div>
    );
}
 
export default CreateSession;