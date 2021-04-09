function buildTree(_nodes) {
    let nodes = JSON.parse(JSON.stringify(_nodes));
    let nodesArray = Object.values(nodes);
    for (let node of nodesArray) {
        if(!nodes[node.parentId]) {
            continue;
        }
        
        if(nodes[node.parentId].children) {
            nodes[node.parentId].children.push(node);            
        }
        else {
            nodes[node.parentId].children = [node];            
        }
    }
    
    let rootNode = Object.values(nodes).find((node)=>node.parentId==null);    
    return rootNode;
}


const Tree = { buildTree };
export default Tree;