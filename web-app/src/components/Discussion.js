import logo from '../logo.svg';
import '../App.css';
import Answer from './Answer';
import { useParams } from 'react-router';
import API from '../controllers/api';
import { useEffect, useState } from 'react';

function Discussion(props) {
  const { sessionId, questionNodeId } = useParams();
  
  let [node, setNode] = useState(undefined);

  useEffect(()=>{
    if(!API.getNodeData()) {
      API.requestNodeData(sessionId);
    }
    else {
      let nodeData = API.getNodeData()[questionNodeId];
      setNode(nodeData);
    }
    // API.apiEventEmitter.on('nodes-update', (data)=>{
      
    // });
  },[])


  if(!API.getNodeData()) {      
    return <div>no node data yet</div>
  }

  if(!node) {
    return <div>invalid question id: {questionNodeId}</div>
  }


  // const data = [
  //   {content:"hello",name:"Elliot"},
  //   {content:"hello my name is",name:"Sean"},
  //   {content:"hello i love nick bostrom hello i love nick bostrom hello i love nick bostrom hello i love nick bostrom hello i love nick bostrom ",name:"Viet"},
  //   {content:"hello i m very smart <3",name:"Yong Chun"},
  //   {content:"hello i m very smart <3 hello i m very smart <3hello i m very smart <3hello i m very smart <3hello i m very smart <3hello i m very smart <3",name:"Yong Chun"},
  //   ]

  const data = node.answers;

  const InputTitle = () => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        console.log('do validate')
      }
    }
    return <input style={{fontWeight:"bold",fontSize:24,padding:10}} type="text" onKeyDown={handleKeyDown} />
  }

  function Box(props){
    let answer;
    let answers = Object.values(node?.answers) || []
    answer = answers.map((item) => <Answer item={item} />)
    return(<div className="discussion-body">{answer}</div>)
    // return(<div className="discussion-body">{answer}</div>)
  }
  
  return (
    <div className="discussion">
      <div className="discussion-title">
        <div style={{marginBottom:"20px"}}>Can Artificial Intelligence ever have consciousness?</div>
        <InputTitle type="text"></InputTitle>
      </div>
      <Box data={data}></Box>
      <form className="discussion-textbox">
        <textarea className="discussion-textarea"></textarea>
        <button className="discussion-submit"type="submit">submit</button>
      </form>
    </div>
  );
}


export default Discussion;
