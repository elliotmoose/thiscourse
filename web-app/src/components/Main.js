import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import API from '../controllers/api';
import Tree from '../controllers/tree';


const Main = () => {
	var question = "Can Artificial Intelligence ever have consciousness?"
    const location = useLocation();
	let roomId = location.pathname.split('/')[2];
    
    let [rootNode, setRootNode] = useState({});
    let latestRoot = useRef();

    useEffect(()=>{
        API.apiEventEmitter.on('nodes-update', (data)=>{
            let treeRoot = Tree.buildTree(data);
            console.log(treeRoot);
            latestRoot.current = treeRoot;
            setRootNode(treeRoot);
        });
        
        API.requestNodeData(roomId);

        //test
        setTimeout(()=>{
            API.addNode('elliot', 'What is Intelligence?', latestRoot.current.id, roomId);            
        }, 1000);
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