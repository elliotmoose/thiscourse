import { useHistory } from "react-router";
import { Fullscreen } from '@material-ui/icons';

export default function QuestionNode(props) {
	let node = props.item
	var width = node.width*65

    let history = useHistory();
    function viewDiscussion() {
        history.push(`discussion/${node.id}`);
    }

    return <th style={{width:`${width}em`}} className="tree-node">
		<div className = "tree-node-container">
			<p style={{color: '#8A99E7', fontWeight: 800}}>{node.question}</p>
			<div style={{display: 'flex', marginBottom: 12}}>
                <div style={{backgroundColor: '#8A99E7', width: 7, borderRadius: 10, marginRight: 12}}/>
                <p>“{Object.values(node.answers || {})[0]?.content}”</p>
            </div>
            <div onClick={viewDiscussion} style={{display: 'flex', marginBottom: 8, alignItems: 'center', cursor: 'pointer'}}>
                <div style={{marginLeft: -5, height: 25, width: 25}}><Fullscreen style={{color: '#B0B0B0'}}/></div>                
                <div style={{color: '#B0B0B0'}}>Click To View Discussion</div>
            </div>
		</div>
	</th>
}