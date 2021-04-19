import { useHistory, useParams } from "react-router";
import { Add, Fullscreen } from '@material-ui/icons';
import API from "../controllers/api";
import User from "../controllers/user";

export default function QuestionNode(props) {
	let node = props.item;
    console.log(node.width);
	var width = node.width*65;


    let history = useHistory();
    let { sessionId } = useParams();
    
    function viewDiscussion() {
        history.push(`discussion/${node.id}`);
    }

    function addNode() {
        let question = prompt('Enter a question:');
        if(question) {
            API.addNode(User.getUsername(), question, node.id, sessionId);
        }
    }

    let correctAnswer = node.answers && node.answers[node.correctAnswerId];

    return <th style={{width:`${width}em`}} className="tree-node">
		<div style={{display: 'flex'}}>
            <div className = "tree-node-container">            
                <p style={{color: '#8A99E7', fontWeight: 800}}>{node.question}</p>
                <div style={{display: 'flex', marginBottom: 12}}>
                    <div style={{backgroundColor: '#8A99E7', width: 7, borderRadius: 10, marginRight: 12}}/>
                    <p>{correctAnswer === undefined ? 'discussion in progress...' : `"${correctAnswer.content}"`}</p>                
                </div>
                {correctAnswer && <div style={{textAlign: 'end'}}>-{correctAnswer.username}</div>}
                <div onClick={viewDiscussion} style={{display: 'flex', marginBottom: 8, alignItems: 'center', cursor: 'pointer'}}>
                    <div style={{marginLeft: -5, height: 25, width: 25}}><Fullscreen style={{color: '#B0B0B0'}}/></div>                
                    <div style={{color: '#B0B0B0'}}>Click To View Discussion</div>
                </div>            
            </div>
            <div onClick={addNode} style={{width: 20, height: 20, backgroundColor: 'lightgray', alignSelf: 'flex-end', marginBottom: 8, marginLeft: 8, borderRadius: 10, cursor: 'pointer'}}><Add style={{width: 20, height: 20}}/></div>
        </div>
	</th>
}