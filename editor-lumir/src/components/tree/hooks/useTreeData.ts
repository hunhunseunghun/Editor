import { useState, useCallback } from 'react';
import { TreeNode, isFolderNode, FolderNode, DocumentNode } from '@/types/tree';

export function useTreeData(initialData: TreeNode[] = []) {
  const [treeData, setTreeData] = useState<TreeNode[]>(initialData);

  // 노드 추가
  const addNode = useCallback((node: TreeNode) => {
    setTreeData((prev) => [...prev, node]);
  }, []);

  // 노드 제거
  const removeNode = useCallback((nodeId: string) => {
    setTreeData((prev) => {
      const removeNodeRecursive = (nodes: TreeNode[]): TreeNode[] => {
        return nodes
          .filter((node) => node.id !== nodeId)
          .map((node) => {
            if (isFolderNode(node)) {
              return {
                ...node,
                children: removeNodeRecursive(node.children),
              } as TreeNode;
            }
            return node; // DocumentNode는 children이 never[]이므로 변경하지 않음
          });
      };
      return removeNodeRecursive(prev);
    });
  }, []);

  // 노드 업데이트
  const updateNode = useCallback(
    (nodeId: string, updates: Partial<TreeNode>) => {
      setTreeData((prev) => {
        const updateNodeRecursive = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map((node) => {
            if (node.id === nodeId) {
              return { ...node, ...updates } as TreeNode;
            }
            if (isFolderNode(node)) {
              return {
                ...node,
                children: updateNodeRecursive(node.children),
              } as TreeNode;
            }
            return node; // DocumentNode는 children이 never[]이므로 변경하지 않음
          });
        };
        return updateNodeRecursive(prev);
      });
    },
    [],
  );

  // 노드 이동
  const moveNode = useCallback(
    (nodeId: string, newParentId: string | null, newIndex: number) => {
      setTreeData((prev) => {
        // 노드 찾기
        const findNode = (nodes: TreeNode[]): TreeNode | null => {
          for (const node of nodes) {
            if (node.id === nodeId) return node;
            if (isFolderNode(node)) {
              const found = findNode(node.children);
              if (found) return found;
            }
          }
          return null;
        };

        // 노드 제거
        const removeNodeRecursive = (nodes: TreeNode[]): TreeNode[] => {
          return nodes
            .filter((node) => node.id !== nodeId)
            .map((node) => {
              if (isFolderNode(node)) {
                return {
                  ...node,
                  children: removeNodeRecursive(node.children),
                } as TreeNode;
              }
              return node; // DocumentNode는 children이 never[]이므로 변경하지 않음
            });
        };

        const nodeToMove = findNode(prev);
        if (!nodeToMove) return prev;

        const dataWithoutNode = removeNodeRecursive(prev);

        // 새 위치에 노드 추가
        const addNodeToNewLocation = (nodes: TreeNode[]): TreeNode[] => {
          if (newParentId === null) {
            const newNodes = [...nodes];
            const movedNode: TreeNode = isFolderNode(nodeToMove)
              ? ({
                  ...nodeToMove,
                  parentId: null,
                  folderId: null,
                } as FolderNode)
              : ({
                  ...nodeToMove,
                  parentId: null,
                  folderId: null,
                } as DocumentNode);
            newNodes.splice(newIndex, 0, movedNode);
            return newNodes;
          }

          return nodes.map((node) => {
            if (node.id === newParentId && isFolderNode(node)) {
              const newChildren = [...node.children];
              const movedNode: TreeNode = isFolderNode(nodeToMove)
                ? ({
                    ...nodeToMove,
                    parentId: newParentId,
                    folderId: newParentId,
                  } as FolderNode)
                : ({
                    ...nodeToMove,
                    parentId: newParentId,
                    folderId: newParentId,
                  } as DocumentNode);
              newChildren.splice(newIndex, 0, movedNode);
              return { ...node, children: newChildren } as TreeNode;
            }
            if (isFolderNode(node)) {
              return {
                ...node,
                children: addNodeToNewLocation(node.children),
              } as TreeNode;
            }
            return node; // DocumentNode는 children이 never[]이므로 변경하지 않음
          });
        };

        return addNodeToNewLocation(dataWithoutNode);
      });
    },
    [],
  );

  return {
    treeData,
    setTreeData,
    addNode,
    removeNode,
    updateNode,
    moveNode,
  };
}
