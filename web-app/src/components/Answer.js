import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';

export default function Answer(props) {
    let { item } = props;
    return <div className = "discussion-box">
    <div className ="box-content">{item.content}</div>
    <div className ="box-name">- {item.name}</div>
    <div className ="box-vote">
      <div className="thumbup"><ThumbUpIcon/>{item.thumbsUp}</div>
      <div className="thumbdown"><ThumbDownIcon/>{item.thumbsDown}</div>
    </div>
  </div>  
}