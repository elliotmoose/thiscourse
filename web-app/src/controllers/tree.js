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

function dfs(visited, rootNode, arr, l, i){
    let level = l + 1;
    let idx = i;
    let node = rootNode;
    let out_arr = arr; 
    // console.log(level,idx);
    // console.log(out_arr);


    if(!visited.has(node.id)){
        // console.log(visited);
        try{
            out_arr[level].push(idx);
        }
        catch(err){
            out_arr.push([idx]);
        }

        // if(idx==1){
        //     out_arr.push([1]);
        // }else{
        //     out_arr[level].push(idx);
        // }

        visited.add(node.id);
        // let children = node.children;
        // console.log(children);

        // console.log(node.children.length);
        if(node.children){
            for(var ii = 0; ii < node.children.length; ii++){
                // console.log( node.children[ii]);
                let out_idx = dfs(visited, node.children[ii], out_arr,level, idx);

                // level -= 1;
                if(ii<node.children.length-1){
                    idx = idx+out_idx;
                }
            }
            return idx;
        }
        else{
            return 1;
        }
        // console.log(idx);
        
    }
    
}



function byLevel(rootNode) {
    let levels = []

    let node = rootNode;
    let queue = [rootNode];
    while(queue.length != 0) {
        let tempQueue = [] 
        for(let node of queue) {
            let children = node.children;
            if(!children) {
                continue;
            }
            //append to temp queue
            tempQueue = [...tempQueue, ...children];
        }
        
        levels.push(queue);
        queue = tempQueue;
    }

    console.log(levels);
    return levels;
}
const Tree = { buildTree, byLevel, dfs};
export default Tree;