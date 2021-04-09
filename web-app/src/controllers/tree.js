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

    recurseWidths(rootNode);
    return rootNode;
}


function recurseWidths(node) {
    let width = 0;
    
    if(node.children) {
        for (let child of node.children) {
            width += recurseWidths(child);
        }
    }

    let nodeWidth = Math.max(1, width);
    node.width = nodeWidth;
    return nodeWidth;
}

const Tree = { buildTree };
export default Tree;