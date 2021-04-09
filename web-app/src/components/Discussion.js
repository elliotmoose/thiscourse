import logo from '../logo.svg';
import '../App.css';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';


function Discussion(props) {
  const data = [
    {content:"hello",name:"elliot"},
    {content:"hello my name is",name:"sean"},
    {content:"hello i love nick bostrom",name:"viet"},
    {content:"hello i m very smart <3",name:"yong chun"},
    ]

  const InputTitle = () => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        console.log('do validate')
      }
    }
    return <input type="text" onKeyDown={handleKeyDown} />
  }

  function Box(props){
    let answer;
    answer = props.data.map((item) => (
      <div className = "discussion-box">
        <div className ="box-content">{item.content}</div>
        <div className ="box-name">{item.name}</div>
        <div className ="box-vote">
          <div className="thumbup"><ThumbUpIcon/></div>
          <div className="thumbdown"><ThumbDownIcon/></div>
        </div>
      </div>  
    ))
    return(<div className="discussion-body">{answer}</div>)
  }
  
  return (
    <div className="discussion">
      <div className="discussion-title">
        <InputTitle type="text"></InputTitle>
      </div>
      <Box data={data}></Box>
      <form className="discussion-textbox">
        <textarea className="discussion-textarea"></textarea>
        <button className="discussion-submit"type="submit"></button>
      </form>
    </div>
  );
}


export default Discussion;
