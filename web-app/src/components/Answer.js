import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';

export default function Answer(props) {
    let { item } = props;
    return <div className = "discussion-box">
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