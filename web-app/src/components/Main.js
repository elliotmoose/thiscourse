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

    let [outArr, setOutArr] = useState([]);
    
    useEffect(()=>{
        API.apiEventEmitter.on('nodes-update', (data)=>{
            let treeRoot = Tree.buildTree(data);
            setRootNode(treeRoot);
            
            let _nodesByLevel = Tree.byLevel(treeRoot);
            setNodesByLevel(_nodesByLevel);

            let out_arr = [];
		    let visited = new Set();

		    Tree.dfs(visited, treeRoot, out_arr, -1, 1);
		    setOutArr(out_arr);

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
    console.log(rootNode);




    // let out_arr = [];
    // let visited = new Set();


    // Tree.dfs(visited, rootNode, out_arr, -1, 1);

    console.log(nodesByLevel)
    console.log(outArr)

	const branch_width = 25
	var number_child = 3

    return (
		<div className="Main">
		<p style={{fontWeight: 800, fontSize: 24}}>{question}</p>
		<div onClick={addNode} style={{width: 20, height: 20, backgroundColor: 'lightgray', alignSelf: 'flex-end', marginBottom: 8, marginLeft: 8, borderRadius: 10, cursor: 'pointer'}}><Add style={{width: 20, height: 20}}/></div>

		{/*Draw tree here*/}

		{nodesByLevel.slice(1).map((level, index) => 
			{
				var node_branches_bot = [];
				var node_branches_top = [];
				var nodes = [];
				var parent;
				var level_width = level.reduce((a,b)=>a+b.width,0);
				console.log(level_width);


				for (var i = 0; i < level.length; i++){
					{/*if(i<level.length-1){
						node_branches_bot.push(<th key={`${i}`} style={{width:`${level[i].width*65}em`}} className = "tree-bot"></th>);
					}*/}


					nodes.push(<QuestionNode key={`${i}node`} item={level[i]}/>)


					if(level[i].parentId!=parent){
						parent = level[i].parentId;
						node_branches_top.push(<th className = "tree-top"></th>);
						if(i>0){
							node_branches_bot.push(<th key={`${i}`} style={{width:`${level[i-1].width*65}em`}} className = "tree-bot-hide"></th>);
						}

					}else{
						node_branches_top.push(<th className = "tree-top-hide"></th>);
						if(i>0){
							node_branches_bot.push(<th key={`${i}`} style={{width:`${level[i-1].width*65}em`}} className = "tree-bot"></th>);
						}
					}

					if(level[i].parentId!=parent){

					}

					{/*if(i==1){
						node_branches_top.push(<th className = "tree-top"></th>);
					}else if(i>1){
						console.log(level[i]);
						for(let child of level[i]){
							if(child.parentId != parent){
								parent = child.parentId;
								node_branches_top.push(<th className = "tree-top"></th>);
							}else{
								node_branches_top.push(<th className = "tree-top-hide"></th>);
							}
						}
					}*/}

			    }

			    {/*for (var i = 0; i < level.length; i++){
					if(i<level.length-1){
						node_branches_bot.push(<th key={`${i}`} style={{width:`${level[i].width*65}em`}} className = "tree-bot"></th>);
					}
					nodes.push(<QuestionNode key={`${i}node`} item={level[i]}/>)
			    }*/}



				return <div key={`${index}`}><table className="tree" style={{width: `${(level_width-1)*branch_width}em`}} >
				 <tbody>
				 <tr >
				 	{node_branches_top}
				  	{/*<th className = "tree-top"></th>*/}
				  	{/*<th className = "tree-top"></th>*/}
				 </tr>
				 <tr>
				    {node_branches_bot}
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