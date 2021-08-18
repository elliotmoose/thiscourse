import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Redirect } from 'react-router-dom';
import Colors from '../constants/colors';
import Fonts from '../constants/fonts';
import User from '../controllers/user';
import Button from './Button';
 
const Login = () => {

	const [isLoggedIn, setLoggedIn ] = useState(false);
	const usernameInput = useRef();
	const passwordInput = useRef();
	
	function onSubmitLogin() {
		User.login(usernameInput.current.value, passwordInput.current.value);
		setLoggedIn(User.isLoggedIn());
	}

    return (!isLoggedIn ? <div className="fullscreen" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		   <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: 300, width: 280}}>
				<div style={{...Fonts.bold, color: Colors.purple, fontSize: '4rem',}}>Dialektikós</div>
				<input style={{...Fonts.bold, boxSizing: 'border-box',outline: 0, border: 0, borderRadius: 8, backgroundColor: Colors.lightGray, height: 50, width: '100%', padding: 4, paddingLeft: 14, marginBottom: 8}} ref={usernameInput} placeholder="username"></input>
				<input onKeyPress={(e) => {if (e.key === 'Enter') onSubmitLogin()}} type='password' style={{...Fonts.bold, boxSizing: 'border-box',outline: 0, border: 0, borderRadius: 8, backgroundColor: Colors.lightGray, height: 50, width: '100%', padding: 4, paddingLeft: 14, marginBottom: 8}} ref={passwordInput} placeholder="password"></input>
				<Button style={{...Fonts.bold,backgroundColor: Colors.green, height: 50, width: '100%', borderRadius: 8, color: 'white'}} onClick={onSubmitLogin}><div>LOGIN</div></Button>
				<div style={{...Fonts.bold,color: Colors.gray, fontSize: 13}}>Don't have an account? <href style={{color: Colors.blue, textDecoration: 'underline', cursor: 'pointer'}}>Create an account</href></div>
		   </div>
       </div> : <Redirect to="/"/>);
}
 
export default Login;