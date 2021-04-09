import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import API from '../controllers/api';
import Tree from '../controllers/tree';


const Main = () => {
	var question = "Can Artificial Intelligence ever have consciousness?"
    const location = useLocation();
	let roomId = location.pathname.split('/')[2];
    let [nodes, setNodes] = useState({});

    useEffect(()=>{
        API.apiEventEmitter.on('nodes-update', (data)=>{
            let nodeTree = Tree.buildTree(data);
            console.log(nodeTree);
            setNodes(nodeTree);
        });
        
        API.requestNodeData(roomId);
    }, [])

    return (
       <div className="Main container">
       <p>{question}</p>
       <div className="vl1"></div>
       <div className="vl1 vl2" style={{width:"500px"}}></div>

       </div>
    );
}
 
export default Main;