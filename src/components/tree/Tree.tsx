import React, {useState} from "react";
import {DataNode, LooseObj} from "./interface";
import checkBg from "../../assets/checked.png";
import uncheckBg from "../../assets/unchecked.png";
import partialcheckBg from "../../assets/partialchecked.png";

export interface TreeProps {
    treeData: DataNode[];
}

export const formatTreeObj = (data: DataNode[]) => {
    let treeObj: LooseObj = {};
    const inner = (list: DataNode[]) => {
        list.forEach(item => {
            const id = item.value.toString();
            treeObj[id] = item;
            if (item.children && Array.isArray(item.children)) {
                inner(item.children);
            }
        });
    };
    inner(data);
    return treeObj;
};

const Tree: React.FC<TreeProps> = (props) => {

    const {treeData} = props;
    const [hiddenList, setHiddenList] = useState<string[] | number[]>([]);
    const [treeList, setTreeList] = useState<DataNode[]>(treeData);
    const treeObj = formatTreeObj(treeData);

    const setCurrentStatus = (node: DataNode, checked: boolean) => {
        setChildStatus(node, checked);
        setParentStatus(treeList, node, checked);
        setTreeList([...treeList]);
    };

    const setChildStatus = (node: DataNode, checked: boolean) => {
        node.checked = checked;
        if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => setChildStatus(child, checked));
        }
    };

    const setParentStatus = (treeList: DataNode[], node: DataNode, checked: boolean) => {
        for (let i = 0; i < treeList.length; i++) {
            let item = treeList[i];
            if (item.value === node.parentId) {
                item.checked = checked;
                setParentStatus(treeData, item, checked);
                break;
            } else {
                if (item.children && Array.isArray(item.children)) {
                    setParentStatus(item.children, node, checked);
                }
            }
        }
    };

    const renderCheckBg = (node: DataNode) => {
        if (!node.children) {
            return node.checked ? checkBg : uncheckBg;
        }
        const allCheckList: boolean[] = [];
        const someCheckList: boolean[] = [];
        const checkListStatus = (list: DataNode[]) => {
            const curCheckList = list.map(i => i.checked);
            allCheckList.push(curCheckList.every(i => i));
            someCheckList.push(curCheckList.some(i => i));
            list.forEach(i => i.children && checkListStatus(i.children));
            /*checkList.push(list.every(i => {
                if (i.children) {
                    checkListStatus(i.children);
                }
                return i.checked;
            }));*/
        };
        checkListStatus(node.children);
        const allChecked = allCheckList.every(i => i);
        const someChecked = someCheckList.some(i => !i);
        return allChecked ? checkBg : someChecked ? partialcheckBg : uncheckBg;
    };

    const renderTreeNode = (list: DataNode[]) => {
        return (
            <ul className="tree-list">
                {
                    list.map(item => (
                        <li key={item.value}>
                            <div>
                                <span 
                                    className="checkbox-span" 
                                    style={{
                                        display: "inline-block",
                                        cursor: "pointer",
                                        width: 20, 
                                        height: 20, 
                                        backgroundImage: `url(${renderCheckBg(item)})`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "100% 100%"
                                    }}
                                    onClick={() => setCurrentStatus(item, !item.checked)}
                                ></span>
                                {/* <input 
                                    type="checkbox" 
                                    value={item.value} 
                                    checked={item.checked}
                                    onChange={e => setCurrentStatus(item, !item.checked)} /> */}
                                {item.name}
                            </div>
                            {Array.isArray(item.children) && renderTreeNode(item.children)}
                        </li>
                    ))
                }
            </ul>
        );
    };

    return (
        <div className="tree-container">
            {renderTreeNode(treeList)}
        </div>
    );
};

export default Tree;
