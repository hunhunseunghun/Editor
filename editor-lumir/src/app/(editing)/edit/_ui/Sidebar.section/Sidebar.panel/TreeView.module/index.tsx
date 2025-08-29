'use client';

import { useSidebar } from '@/app/(editing)/edit/_context/SidebarContext';
import { ArboristTree } from '@/components/tree/ArboristTree';
import { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TreeNode, FolderNode, DocumentNode } from '@/types/tree';
import { useEdit } from '@/app/(editing)/edit/_context/EditContext';
import { NodeApi } from 'react-arborist';

interface TreeViewModuleProps {
  documents: any[];
  folders: any[];
}

export default function TreeViewModule({
  documents,
  folders,
}: TreeViewModuleProps) {
  const {
    문서를_수정한다,
    폴더를_수정한다,
    문서를_만든다,
    폴더를_만든다,
    문서를_삭제한다,
    폴더를_삭제한다,
  } = useSidebar();
  const { 현재_문서를_수정한다 } = useEdit();
  const router = useRouter();
  const [opens, setOpens] = useState<Record<string, boolean>>({});

  // 문서와 폴더를 트리 구조로 변환
  const treeData = useMemo((): TreeNode[] => {
    // 폴더를 트리 노드로 변환
    const folderNodes: FolderNode[] = folders.map((folder) => ({
      id: folder._id,
      name: folder.name,
      type: 'folder',
      parentId: folder.parentId,
      folderId: null,
      order: folder.order || 0,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      isLocked: folder.isLocked || false,
      isDeleted: folder.isDeleted || false,
      children: documents
        .filter((doc) => doc.folderId === folder._id)
        .map((doc) => ({
          id: doc._id,
          name: doc.title,
          type: 'document' as const,
          parentId: folder._id,
          folderId: doc.folderId,
          order: doc.order || 0,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          isLocked: doc.isLocked || false,
          isDeleted: doc.isDeleted || false,
          children: [],
        })),
    }));

    // 루트 레벨 문서들
    const rootDocuments: DocumentNode[] = documents
      .filter((doc) => !doc.folderId)
      .map((doc) => ({
        id: doc._id,
        name: doc.title,
        type: 'document',
        parentId: null,
        folderId: doc.folderId,
        order: doc.order || 0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        isLocked: doc.isLocked || false,
        isDeleted: doc.isDeleted || false,
        children: [],
      }));

    return [...folderNodes, ...rootDocuments];
  }, [documents, folders]);

  // 노드 생성 핸들러
  const handleCreate = useCallback(
    (args: {
      parentId: string;
      parentNode: NodeApi<TreeNode>;
      index: number;
      type: 'internal' | 'leaf';
    }) => {
      const { type } = args;
      if (type === 'leaf') {
        문서를_만든다();
      } else {
        폴더를_만든다();
      }
      // 임시 ID 반환 (실제로는 생성된 노드의 ID를 반환해야 함)
      return { id: `temp-${Date.now()}` };
    },
    [문서를_만든다, 폴더를_만든다],
  );

  // 노드 삭제 핸들러
  const handleDelete = useCallback(
    (args: { ids: string[]; nodes: NodeApi<TreeNode>[] }) => {
      args.ids.forEach((id) => {
        const node = treeData.find((n) => n.id === id);
        if (node) {
          if (node.type === 'document') {
            문서를_삭제한다(id);
          } else {
            폴더를_삭제한다(id);
          }
        }
      });
    },
    [treeData, 문서를_삭제한다, 폴더를_삭제한다],
  );

  // 노드 이동 핸들러
  const handleMove = useCallback(
    (args: { dragIds: string[]; parentId: string | null; index: number }) => {
      const { dragIds, parentId } = args;
      dragIds.forEach((dragId) => {
        const node = treeData.find((n) => n.id === dragId);
        if (node) {
          if (node.type === 'document') {
            문서를_수정한다(dragId, { folderId: parentId });
          } else {
            폴더를_수정한다(dragId, { parentId });
          }
        }
      });
    },
    [treeData, 문서를_수정한다, 폴더를_수정한다],
  );

  // 노드 이름 변경 핸들러
  const handleRename = useCallback(
    (args: { id: string; name: string; node: NodeApi<TreeNode> }) => {
      const { id, name } = args;
      const node = treeData.find((n) => n.id === id);
      if (node) {
        if (node.type === 'document') {
          문서를_수정한다(id, { title: name });
        } else {
          폴더를_수정한다(id, { name });
        }
      }
    },
    [treeData, 문서를_수정한다, 폴더를_수정한다],
  );

  // 노드 선택 핸들러 - 클라이언트 사이드 네비게이션 사용
  const handleSelect = useCallback(
    (nodes: NodeApi<TreeNode>[]) => {
      if (nodes.length > 0) {
        const selectedNode = nodes[0];
        if (selectedNode.data.type === 'document') {
          // 클라이언트 사이드 네비게이션으로 변경
          router.push(`/edit/${selectedNode.id}`);
        }
      }
    },
    [router],
  );

  // 드래그 가능 여부 확인
  const canDrag = useCallback((node: NodeApi<TreeNode>) => {
    return true; // 모든 노드 드래그 가능
  }, []);

  // 드롭 가능 여부 확인
  const canDrop = useCallback(
    (args: {
      parentNode: NodeApi<TreeNode> | null;
      dragNodes: NodeApi<TreeNode>[];
      index: number;
    }) => {
      const { parentNode } = args;
      // 문서는 폴더에만 드롭 가능
      if (parentNode && parentNode.data.type === 'document') {
        return false;
      }
      return true;
    },
    [],
  );

  return (
    <div className='mb-4'>
      <div className='w-full overflow-hidden'>
        <ArboristTree
          data={treeData}
          opens={{ value: opens, onChange: setOpens }}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onMove={handleMove}
          onRename={handleRename}
          onSelect={handleSelect}
          canDrag={canDrag}
          canDrop={canDrop}
          height={700}
          width={240}
          rowHeight={32}
          indent={20}
          disableEdit={false}
          disableMultiSelection={false}
          selectionFollowsFocus={true}
        />
      </div>
    </div>
  );
}
