import logo from '../logo.svg';
import '../App.css';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';


function Discussion(props) {
  const data = [
    {content:"hello",name:"Elliot"},
    {content:"hello my name is",name:"Sean"},
    {content:"hello i love nick bostrom hello i love nick bostrom hello i love nick bostrom hello i love nick bostrom hello i love nick bostrom ",name:"Viet"},
    {content:"hello i m very smart <3",name:"Yong Chun"},
    {content:"hello i m very smart <3 hello i m very smart <3hello i m very smart <3hello i m very smart <3hello i m very smart <3hello i m very smart <3",name:"Yong Chun"},
    ]

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
    answer = props.data.map((item) => (
      <div className = "discussion-box">
        <div className ="box-content">{item.content}</div>
        <div className ="box-name">- {item.name}</div>
        {/* <div className ="box-vote"> */}
          {/* <div className="thumbup"><ThumbUpIcon/></div>
          <div className="thumbdown"><ThumbDownIcon/></div> */}
        {/* </div> */}
      </div>  
    ))
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
