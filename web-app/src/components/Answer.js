import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import API from '../controllers/api';
import { useParams } from 'react-router';
import { Check } from '@material-ui/icons';
import Button from './Button';

export default function Answer(props) {
    let { nodeId, item, isAnswer } = props;
    let { sessionId } = useParams();
    let isHost = API.getIsHost(sessionId);
    
    function markAsCorrectAnswer() {
        let answerId = item.id;
        API.markAsCorrectAnswer(answerId, nodeId, sessionId);
    }

    return <div className = {`discussion-box ${isAnswer &&  'correct-answer-box'}`}>
    {isHost && <Button onClick={markAsCorrectAnswer} style={{position: 'absolute', top: 5, right: 5, borderRadius: 25, padding: 6}}>
        <Check style={{height: 25, width: 25, color: isAnswer ? '#87DEBF' : 'gray'}}/>
    </Button>}
    <div className ="box-content">"{item.content}"</div>
    <div className ="box-name">- {item.username}</div>
    <div className ="box-vote">
      <div className="thumb"><ThumbUpIcon style={{color: '#87DEBF', width: 18, height: 18}}/></div>
      <div style={{marginRight: 12, fontWeight: 500, color: '#87DEBF'}} >{item.thumbsUp}</div>
      <div className="thumb"><ThumbDownIcon style={{color: '#DE8787', width: 18, height: 18}}/></div>
      <div style={{fontWeight: 500, color: '#DE8787'}}>{item.thumbsDown}</div>
    </div>
  </div>  
}