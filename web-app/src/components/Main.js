import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import API from '../controllers/api';


const Main = () => {
	var question = "Can Artificial Intelligence ever have consciousness?"
    const location = useLocation();
	let roomId = location.pathname.slice(1);
    useEffect(()=>{
        API.apiEventEmitter.on('nodes-update', (data)=>{
            console.log(data);
        });
        
        API.requestNodeData(roomId);
    }, [])

    return (
       <div className="Main container">
       <p>{question}</p>
       <div class="vl1"></div>
       <div class="vl1 vl2" style={{width:"500px"}}></div>

       </div>
    );
}
 
export default Main;