import React from 'react';
 
const CreateSession = () => {
    return (
       <div className="CreateSession container">
			<h2>Create Session</h2>
			<form>
			  <label>
			    <input className="input-box" type="text" name="name" placeholder="Name"/>
				<br></br>
				<br></br>
			    <input className="input-box" type="text" name="discourse" placeholder="Discourse"/>
			    <br></br>
				<br></br>
				or
				<br></br>
				<br></br>
			    <input className="input-box" type="text" name="restart" placeholder="Restart session with secret"/>
			    <br></br>
				<br></br>
				<br></br>
				<br></br>
				<input className="submit-button" type="submit" value="Go"/>

			  </label>
			</form>
       </div>
    );
}
 
export default CreateSession;