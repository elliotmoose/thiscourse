import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import API from '../controllers/api';
import { useParams } from 'react-router';
import { Check } from '@material-ui/icons';
import Button from './Button';
import User from '../controllers/user';

export default function Answer(props) {
    let { nodeId, item, isAnswer, disabled} = props;
    let { sessionId } = useParams();
    let isHost = API.getIsHost(sessionId);
    
    function markAsCorrectAnswer() {
        let answerId = item.id;
        API.markAsCorrectAnswer(answerId, nodeId, sessionId);
    }

    async function vote(isUpVote) {
      let success = await User.registerIfNeeded(sessionId);
      if(success) {
        let username = User.getUsername();
        API.voteAnswer(isUpVote, username, item.id, nodeId, sessionId);
      }
    }

    return <div className = {`discussion-box ${isAnswer &&  'correct-answer-box'}`}>
    {isHost && <Button disabled={disabled} onClick={markAsCorrectAnswer} style={{position: 'absolute', top: 5, right: 5, borderRadius: 25, padding: 6}}>
        <Check style={{height: 25, width: 25, color: isAnswer ? '#87DEBF' : 'gray'}}/>
    </Button>}
    <div className ="box-content">"{item.content}"</div>
    <div className ="box-name">- {item.username}</div>
    <div className ="box-vote">
      <div disabled={disabled} onClick={()=>vote(true)} className="thumb"><ThumbUpIcon style={{color: '#87DEBF', width: 18, height: 18, cursor: 'pointer'}}/></div>
      <div style={{marginRight: 12, fontWeight: 500, color: '#87DEBF'}} >{item.thumbsUp?.length}</div>
      <div disabled={disabled} onClick={()=>vote(false)} className="thumb"><ThumbDownIcon style={{color: '#DE8787', width: 18, height: 18, cursor: 'pointer'}}/></div>
      <div style={{fontWeight: 500, color: '#DE8787'}}>{item.thumbsDown?.length}</div>
    </div>
  </div>  
}