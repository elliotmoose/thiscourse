import logo from '../logo.svg';
import '../App.css';
import Answer from './Answer';
import { useHistory, useParams } from 'react-router';
import API from '../controllers/api';
import { useEffect, useRef, useState } from 'react';
import { FullscreenExit } from '@material-ui/icons';
import User from '../controllers/user';

function Discussion(props) {
  const { sessionId, questionNodeId } = useParams();
  
  const history = useHistory()
  let [node, setNode] = useState(undefined);
  let textAreaRef = useRef();

  useEffect(()=>{
    if(!API.getNodeData()) {
      API.requestNodeData(sessionId);
    }
    else {
      let nodeData = API.getNodeData()[questionNodeId];
      setNode(nodeData);
    }
    API.apiEventEmitter.on('nodes-update', (data)=>{
      let nodeData = data[questionNodeId];
      setNode(nodeData);
    });
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

  let answers = Object.values(node?.answers) || []
  let question = node.question;

  const InputTitle = () => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        console.log('do validate')
      }
    }
    return <input style={{fontWeight:"bold",fontSize:24,padding:10}} type="text" onKeyDown={handleKeyDown} />
  }


  function exitDiscussion() {
    history.goBack();
  }

  async function submitAnswer() {
    let success = await User.registerIfNeeded(sessionId);
    if(success) {
      API.addAnswer(User.getUsername(), textAreaRef.current.value, node.id, sessionId);
      textAreaRef.current.value = "";
    }
  }
  
  return (
    <div className="discussion">
      <div onClick={exitDiscussion} style={{display: 'flex', justifyContent: 'flex-end', position: 'static', top: 12, right: 12, alignItems: 'center', cursor: 'pointer'}}>
          <div style={{marginLeft: -5, height: 25, width: 25}}><FullscreenExit style={{color: '#B0B0B0'}}/></div>                
          <div style={{color: '#B0B0B0', fontSize: 18}}>Click To Close Discussion</div>
      </div>
      
      <div className="discussion-title">
        <div style={{marginBottom:"20px"}}>{question}</div>
        {/* <InputTitle type="text"></InputTitle> */}
      </div>
      <div className="discussion-body">
        {answers.map((item) => {
          let isAnswer = (item.id == node.correctAnswerId && item.id !== undefined)
          return <Answer nodeId={node.id} item={item} isAnswer={isAnswer}/>;
        })}
      </div>
      <div className="discussion-textbox">
        <textarea className="discussion-textarea" ref={textAreaRef}></textarea>
        <div className="discussion-submit" onClick={submitAnswer}>submit</div>
      </div>
    </div>
  );
}


export default Discussion;
