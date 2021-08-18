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
    // let [treeProp, setTreeProp] = useState([]);

    // let [outArr, setOutArr] = useState([]);
    
    useEffect(()=>{
        API.apiEventEmitter.on('nodes-update', (data)=>{
            let treeRoot = Tree.buildTree(data);
            setRootNode(treeRoot);
            
      //       let out_arr = [];
		    // let visited = new Set();

		    // Tree.dfs(visited, treeRoot, out_arr, -1, 1);
            
            let _nodesByLevel = Tree.byLevel(treeRoot);
            setNodesByLevel(_nodesByLevel);
        });
        
        API.requestNodeData(sessionId);
    }, [])

    var question = nodesByLevel && nodesByLevel[0] && nodesByLevel[0][0] && nodesByLevel[0][0].question || 'loading question...';

	function addNode() {
		
        let question = prompt('Enter a question:');
        if(question && nodesByLevel && nodesByLevel[0] && nodesByLevel[0][0]) {
            API.addNode(User.getUsername(), question, nodesByLevel[0][0].id, sessionId);
        }
    }

	const branch_width = 25;
	// var prev_level = nodesByLevel[0];

    return (
		<div className="container">
		<p style={{fontWeight: 800, fontSize: 24}}>{question}</p>
		<div onClick={addNode} style={{width: 20, height: 20, backgroundColor: 'lightgray', alignSelf: 'flex-end', marginBottom: 8, marginLeft: 8, borderRadius: 10, cursor: 'pointer'}}><Add style={{width: 20, height: 20}}/></div>

		{/*Draw tree here*/}

		{nodesByLevel.slice(1).map((level, index) => 
			{
				var node_branches_bot = [];
				var node_branches_top = [];
				var nodes = [];
				var parent;
				{/*var level_width = level.reduce((a,b)=>a+b.width,0);*/}
				var dfs_level = level.map(x=>x.width)
				var level_width = Math.max(...dfs_level);
				var draw_roof = false;


				var ii = 0;
				for (var i = 0; i < level_width; i++){
					if(dfs_level.includes(i+1)){
						nodes.push(<QuestionNode key={`${ii}node`} item={level[ii]}/>);

						if(level[ii].parentId!=parent){
							parent = level[ii].parentId;
							node_branches_top.push(<th className = "tree-top"></th>);
						}else{
							node_branches_top.push(<th className = "tree-top-hide"></th>);
						}

						if(!level[ii+1] || level[ii+1].parentId != level[ii].parentId ){
							node_branches_bot.push(<th key={`${i}`} style={{width:`${branch_width}em`}} className = "tree-bot-single"></th>); 
							draw_roof = false;

						}else{
								node_branches_bot.push(<th key={`${i}`} style={{width:`${branch_width}em`}} className = "tree-bot-l"></th>);
							draw_roof = true;

						}
						ii +=1;
					}else{
						node_branches_top.push(<th className = "tree-top-hide"></th>);
						if (draw_roof){
							node_branches_bot.push(<th key={`${i}`} style={{width:`${branch_width}em`}} className = "tree-bot-roof"></th>);
						}else{
							node_branches_bot.push(<th key={`${i}`} style={{width:`${branch_width}em`}} className = "tree-bot-hide"></th>);
						}
						nodes.push(<th style={{width:`${branch_width}em`}} className="tree-node"></th>);
					}
			    }

			    

				return <div key={`${index}`}><table className="tree" style={{width: `${(level_width)*branch_width}em`}} >
				 <tbody>
				 <tr >
				 	{node_branches_top}
				 </tr>
				 <tr>
				    {node_branches_bot}
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