import { Edit, Add } from '@material-ui/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import API from '../controllers/api';
import Tree from '../controllers/tree';
import User from '../controllers/user';
import Fonts from '../constants/fonts';
import Colors from '../constants/colors';
import Banner from 'react-js-banner';


import QuestionNode from './QuestionNode'

import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

// Be sure to include styles at some point, probably during your bootstraping
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import { useHistory } from 'react-router-dom';

const Main = () => {
    const { sessionId } = useParams();
	const history = useHistory();
    
    let [rootNode, setRootNode] = useState({});
    let [nodesByLevel, setNodesByLevel] = useState([]);
    let [sideBarExpand, setSideBarExpand] = useState(false);
    let [modalOpen, setModalOpen] = useState(false);
    let [isOnline, setIsOnline] = useState(true);
// TODO: SAMPLE RESOURCE OBJECT, PLEASE SEAN HELP ME ADD THIS TO THE ROOM FIREBAASE OBJECT THANK YOU#################
	let resource = {resourceTitle:"", resourceType:"article", resourceURL:""} 									//###
// ##################################################################################################################

	let [resources, setResources] = useState([{resourceTitle:"Life of Pi", resourceURL:"https://www.youtube.com/watch?v=dQw4w9WgXcQ", resourceType:"book"},{resourceTitle:"HowToWrite", resourceURL:"https://www.youtube.com/watch?v=dQw4w9WgXcQ", resourceType:"video"}]);
	let [coverImgURL, setCoverImgURL] = useState("https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2017/08/nostalgia_design.jpg");
	// let coverImgURL = "https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2017/08/nostalgia_design.jpg";
	async function onLoadSession() {
		let username = User.getUsername();
		let response = await API.joinOrRestartSession(username, sessionId);//join if not owner, restart if owner
		if(!response || response.error) {
			alert(response.error ? response.error : 'failed to enter session');
			history.push(`/`); //reset to main page on session fail
			return;
		}

		if(response.online === false) {
			//static data from response
			let treeRoot = Tree.buildTree(response.data);
			setRootNode(treeRoot);
			let _nodesByLevel = Tree.byLevel(treeRoot);
			setNodesByLevel(_nodesByLevel);
			return;
		}

		//IMPLEMENTATION NOTE: if session is validated to be online, connect to it
		await API.socketConnect(sessionId);
		
		API.apiEventEmitter.on('nodes-update', (data)=>{
			let treeRoot = Tree.buildTree(data);
			setRootNode(treeRoot);
			
		//       let out_arr = [];
			// let visited = new Set();

			// Tree.dfs(visited, treeRoot, out_arr, -1, 1);
			
			let _nodesByLevel = Tree.byLevel(treeRoot);
			setNodesByLevel(_nodesByLevel);
		});
		
		API.requestNodeData(sessionId); //socket request
	}

    useEffect(()=>{
		//check if session is online
		//if session offline, display static data
		//else, connect
		onLoadSession();
    }, []);

    var question = nodesByLevel && nodesByLevel[0] && nodesByLevel[0][0] && nodesByLevel[0][0].question || 'loading question...';

	function addNode() {
        let question = prompt('Enter a question:');
        if(question && nodesByLevel && nodesByLevel[0] && nodesByLevel[0][0]) {
            API.addNode(User.getUsername(), question, nodesByLevel[0][0].id, sessionId);
        }
    }

	function addResource() {
		setModalOpen(!modalOpen);
    }

	function handleSubmit(){
		if (resource.resourceTitle && resource.resourceType && resource.resourceURL){
			var curResList = resources;
			curResList.push(resource);
			setResources(curResList);
			setModalOpen(!modalOpen);
		}else{
			alert("One or more fields are empty");
		}
	}

	function handleBack(){
		setModalOpen(!modalOpen);
	}

	function handleResClick(){
		setModalOpen(!modalOpen);
	}

	function changeCoverURL(){
		var ans = prompt("Enter Image URL");
		if(ans){
			setCoverImgURL(ans);
		}
	}

	function handleChange(event) {
		resource[event.target.name] = event.target.value;
	}

	const branch_width = 25;

    return (
		
		<div className="container" style={{marginLeft: `${sideBarExpand ? 9 : 0}em`}}>
		<div className="addResModal" style={{display: `${modalOpen ? "block" : "none"}`, fontSize:"1.5em"}}>
			<div className="addResModalContent">
				<p style={{marginTop: "4.5em"}}>
					Add Resource
				</p>
				<div >
					<label>
						Resource Title: &nbsp; &nbsp;
						<input name="resourceTitle" onChange={handleChange} style={{fontSize: "0.9em"}} />
					</label>
					<br/><br/>
					<label>
						URL: &nbsp; &nbsp;
						<input name="resourceURL" onChange={handleChange} style={{fontSize: "0.9em"}} />
					</label>
					<br/><br/>
					Resource type: &nbsp; &nbsp;
					<select name="resourceType" onChange={handleChange} style={{fontSize: "0.9em"}} >
						<option selected value="article">Article</option>
						<option value="video">Video</option>
						<option value="book">Book</option>
					</select>
					<br/><br/>
					<button onClick={handleSubmit} style={{fontSize: "0.9em"}}>Submit</button> &nbsp; &nbsp;
					<button onClick={handleBack} style={{fontSize: "0.9em"}}>Back</button>
				</div>
			</div>
		</div>
		<SideNav  style={{ position:"fixed", background: "#ecf0f1", maxWidth:"280px", boxShadow:"#80808082 5px 0px 20px"}}
			onToggle={(selected) => {
				// Add your code here
				setSideBarExpand(!sideBarExpand);
			}}
		>
			<a href="http://localhost:3000/" className="main-logo" style={{display: `${sideBarExpand ? "inline-block" : "none"}`, ...Fonts.bold , color: Colors.purple, textDecoration: "none" }} >Dialektikós</a>
			<SideNav.Toggle style={{backgroundColor: Colors.purple}}/> 
			<SideNav.Nav >
				<p  className="sidebar-text" style={{display: `${sideBarExpand ? "inline-block" : "none"}`, }}>
					RESOURCES
				</p>
				<br/>

				<button type="button" disabled={isOnline ? false : true} onClick={addResource}  className="sidebar-text" style={{ background: Colors.purple, borderRadius: 20, width:"75%", height:"2em", marginBottom: "1em",  display: `${sideBarExpand ? "inline-block" : "none"}`, cursor: 'pointer'}}>
					<Add style={{width: 20, height: 20 , backgroundColor:"white", borderRadius: 10, marginRight:"0.5em"}}/> Add Resrouces
				</button>

				{resources.map((level, idnex)=>
					{
						let background_img = ""
						switch (level.resourceType) {
							case "book":
								background_img= "https://www.publicbooks.org/wp-content/uploads/2017/01/book-e1484158615982-810x327.jpg";
							  	break;
							case "article":
								background_img= "https://images.unsplash.com/photo-1585241936939-be4099591252?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80";
								break;
							case "video":
								background_img= "https://images.unsplash.com/photo-1567443024551-f3e3cc2be870?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
								break;
							default:
								background_img= "https://images.unsplash.com/photo-1585241936939-be4099591252?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80";
						  }
						return <a  target="_blank" href={level.resourceURL} style={{ textAlign:"center" , width:"100%", height:"7em", backgroundSize: "cover", backgroundImage:`url("${background_img}")`, marginBottom: "1em", display: `${sideBarExpand ? "inline-block" : "none"}`, ...Fonts.bold, cursor: 'pointer'}}>
							<p   style={{marginBlockStart: 0, marginBlockEnd: 0, lineHeight: "7em", color:"white", background: "rgba(0, 0, 0, 0.479)"}}>
								{level.resourceTitle}		
							</p>
						</a>

					}
				)}

				

				
				

			</SideNav.Nav>
		</SideNav>
		
		<div style={{top:0, left:0, position:"absolute" ,minWidth:"100%", minHeight:"12em", backgroundImage:`url("${coverImgURL}")`, backgroundSize: "cover" ,  backgroundPosition: "center"}}>
			<button disabled={isOnline ? false : true}  onClick={changeCoverURL} style={{  cursor: 'pointer', position:"absolute", top:"1em", right:"1em", border:0, backgroundColor:"transparent"}}>
				<Edit style={{ padding:"0.5em"  , width: 30, height: 30 , backgroundColor:"white", borderRadius: "1.3em", marginRight:"0.5em"}}/>
			</button>
			<Banner css={{ visibility:  `${isOnline ? "hidden" : "visible"}` , position:"relative", left:'15%', marginTop:'2%' ,  width:"70%",  borderRadius:10, background:"#95a5a6", color: "white"}} title="The session is currently offline, please contact session owner to restart session."  showBanner={true} />

		</div>


		<p style={{fontWeight: 800, fontSize: 24, marginTop: "7em"}}>{question}</p>

		<button  disabled={isOnline ? false : true}  onClick={addNode} style={{  padding:0 ,  width: 25, height: 24, backgroundColor: 'lightgray', alignSelf: 'flex-end', marginBottom: 8, marginLeft: 8, borderRadius: 20, cursor: 'pointer'}}><Add style={{width: 20, height: 20}}/></button>
		


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