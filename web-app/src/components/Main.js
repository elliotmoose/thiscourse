import { Add } from '@material-ui/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import API from '../controllers/api';
import Tree from '../controllers/tree';
import User from '../controllers/user';

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

    var question = nodesByLevel && nodesByLevel[0] && nodesByLevel[0][0] && nodesByLevel[0][0].question || 'loading question...';

	function addNode() {
		
        let question = prompt('Enter a question:');
        if(question) {
            API.addNode(User.getUsername(), question, nodesByLevel[0][0].id, sessionId);
        }
    }

    console.log(nodesByLevel)

	const branch_width = 25
	var number_child = 3

    return (
		<div className="Main">
		<p style={{fontWeight: 800, fontSize: 24}}>{question}</p>
		<div onClick={addNode} style={{width: 20, height: 20, backgroundColor: 'lightgray', alignSelf: 'flex-end', marginBottom: 8, marginLeft: 8, borderRadius: 10, cursor: 'pointer'}}><Add style={{width: 20, height: 20}}/></div>

		{/*Draw tree here*/}

		{nodesByLevel.slice(1).map((level, index) => 
			{
				var node_branches = [];
				var nodes = [];
				var level_width = level.reduce((a,b)=>a+b.width,0)
				for (var i = 0; i < level.length; i++){
					if(i<level.length-1){
						node_branches.push(<th key={`${i}`} style={{width:`${level[i].width*65}em`}} className = "tree-bot"></th>);
					}
					nodes.push(<QuestionNode key={`${i}node`} item={level[i]}/>)
			    }
				return <div key={`${index}`}><table className="tree" style={{width: `${(level_width-1)*branch_width}em`}} >
				 <tbody>
				 <tr >
				  	<th className = "tree-top"></th>
				  </tr>
				  <tr>
				    {node_branches}
				    <th className = "tree-top"></th>
				  </tr>
				  {/*<QuestionNode item={node}/>*/}
				 </tbody>
				</table>
				<table style={{width: `${(level_width)*branch_width}em`}} >
				  <tbody>
					<tr>
						{nodes}
					</tr>
				  </tbody>
				</table>
				</div>
			}
		)}	

       </div>
    );
}
 
export default Main;