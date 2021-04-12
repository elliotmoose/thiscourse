
export default function QuestionNode(props) {
	let node = props.item
	var width = node.width*65
    return <th style={{width:`${width}em`}} className="tree-node">
		<div className = "tree-node-container">
			<p>{node.question}</p>
			<p>“Intelligence is the ability to acquire and apply knowledge and skills.”</p>
		</div>
	</th>
}