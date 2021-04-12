import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import API from '../controllers/api';
import Tree from '../controllers/tree';


const Main = () => {
    const { sessionId } = useParams();
    
    let [rootNode, setRootNode] = useState({});
    let [nodesByLevel, setNodesByLevel] = useState([]);
    
    useEffect(()=>{
        API.apiEventEmitter.on('nodes-update', (data)=>{
            let treeRoot = Tree.buildTree(data);
            setRootNode(treeRoot);
            
            let _nodesByLevel = Tree.byLevel(treeRoot);
            setNodesByLevel(_nodesByLevel);
        });
        
        API.requestNodeData(sessionId);
    }, [])

    var question = "Can Artificial Intelligence ever have consciousness?"

	const branch_width = 25
	var number_child = 3

    return (
       <div className="Main container">
       <p>{question}</p>

       <table className="tree" style={{width: `${(number_child-1)*branch_width}em`}} >
		  <tr >
		  	<th className = "tree-top"></th>
		  </tr>
		  <tr>
		    <th style={{width:"65em"}} className = "tree-bot"></th>
		    <th style={{width:"65em"}} className = "tree-bot"></th>
		    <th className = "tree-top"></th>

		  </tr>
		</table>
    

		<table style={{width: `${(number_child)*branch_width}em`}} >
		  <tr>
		    <th style={{width:"65em"}} className="tree-node">
		    	<div className = "tree-node-container">
		    		<p>What is Intelligence?</p>
		    		<p>“Intelligence is the ability to acquire and apply knowledge and skills.”</p>
		    	</div>
		    </th>
		    <th style={{width:"65em"}} className="tree-node">
		    	<div className = "tree-node-container">
		    		<p>What is Intelligence?</p>
		    		<p>“Intelligence is the ability to acquire and apply knowledge and skills.”</p>
		    	</div>
		    </th>		    
		    <th style={{width:"65em"}} className="tree-node">
		    	<div className = "tree-node-container">
		    		<p>What is Intelligence?</p>
		    		<p>“Intelligence is the ability to acquire and apply knowledge and skills.”</p>
		    	</div>
		    </th>
		  </tr>
		</table>

       </div>
    );
}
 
export default Main;