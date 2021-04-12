import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import API from '../controllers/api';
import Tree from '../controllers/tree';

import QuestionNode from './QuestionNode'

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

    console.log(nodesByLevel)

	const branch_width = 25
	var number_child = 3

    return (
		<div className="Main container">
		<p>{question}</p>

		{/*Draw tree here*/}

		{nodesByLevel.map((level, index) => 
			{
				var node_branches = [];
				var nodes = [];
				var level_width = level.reduce((a,b)=>a+b.width,0)
				for (var i = 0; i < level.length; i++){
					if(i<level.length-1){
						node_branches.push(<th style={{width:`${level[i].width*65}em`}} className = "tree-bot"></th>);
					}
					nodes.push(<QuestionNode item={level[i]}/>)
			    }
				return <div><table className="tree" style={{width: `${(level_width-1)*branch_width}em`}} >
				  <tr >
				  	<th className = "tree-top"></th>
				  </tr>
				  <tr>
				    {node_branches}
				    <th className = "tree-top"></th>
				  </tr>
				  {/*<QuestionNode item={node}/>*/}
				</table>
				<table style={{width: `${(level_width)*branch_width}em`}} >
				  <tr>
				    {nodes}
				  </tr>
				</table>
				</div>
			}
		)}	

       </div>
    );
}
 
export default Main;