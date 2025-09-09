'use client';

import { useSidebar } from '@/app/(editing)/edit/_context/SidebarContext';
import { ArboristTree } from '@/components/tree/ArboristTree';
import { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TreeNode, FolderNode, DocumentNode } from '@/types/tree';
import { useEdit } from '@/app/(editing)/edit/_context/EditContext';
import { NodeApi } from 'react-arborist';

// 문서 타입 정의 (API에서 받는 실제 데이터 구조)
interface DocumentData {
  _id: string;
  title?: string;
  folderId?: string | null;
  order?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isLocked?: boolean;
  isDeleted?: boolean;
}

// 폴더 타입 정의 (API에서 받는 실제 데이터 구조)
interface FolderData {
  _id: string;
  name?: string;
  parentId?: string | null;
  order?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isLocked?: boolean;
  isDeleted?: boolean;
}

interface TreeViewModuleProps {
  documents: DocumentData[];
  folders: FolderData[];
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

  // 하드코딩된 테스트 데이터 (개발용)
  const treeData = useMemo((): TreeNode[] => {
    console.log('🌲 TreeView 하드코딩 데이터 사용');

    const hardcodedData: TreeNode[] = [
      // 하드코딩된 폴더
      {
        id: '68bfcf76345a021f12b1e69b', // 실제 MongoDB 폴더 ID
        name: 'Lumir Editor',
        type: 'folder' as const,
        parentId: null,
        folderId: null,
        order: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLocked: false,
        isDeleted: false,
        children: [
          // 폴더 안의 하드코딩된 문서
          {
            id: '68bfcf76345a021f12b1e69c', // 실제 MongoDB 문서 ID
            name: 'Lumir Editor',
            type: 'document' as const,
            parentId: '68bfcf76345a021f12b1e69b',
            folderId: '68bfcf76345a021f12b1e69b',
            order: 1000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isLocked: false,
            isDeleted: false,
            children: [],
          }
        ],
      }
    ];

    console.log('✅ TreeView 하드코딩 데이터 준비 완료:', {
      totalNodes: hardcodedData.length,
      sample: hardcodedData.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
      })),
    });

    return hardcodedData;
  }, []); // 의존성 제거로 항상 같은 데이터 반환

  // 노드 생성 핸들러 (비활성화됨 - 개발용)
  const handleCreate = useCallback(
    async (args: {
      parentId: string;
      parentNode: NodeApi<TreeNode>;
      index: number;
      type: 'internal' | 'leaf';
    }) => {
      console.log('🔒 생성 기능 비활성화됨 (개발용 하드코딩 모드)');
      alert('개발용 모드에서는 생성 기능이 비활성화되어 있습니다.');
      
      // 임시 ID 반환 (실제로는 생성된 노드의 ID를 반환해야 함)
      return { id: `temp-${Date.now()}` };
    },
    [], // 의존성 제거
  );

  // 노드 삭제 핸들러 (비활성화됨 - 개발용)
  const handleDelete = useCallback(
    (args: { ids: string[]; nodes: NodeApi<TreeNode>[] }) => {
      console.log('🔒 삭제 기능 비활성화됨 (개발용 하드코딩 모드)');
      alert('개발용 모드에서는 삭제 기능이 비활성화되어 있습니다.');
    },
    [], // 의존성 제거
  );

  // 노드 이동 핸들러 (비활성화됨 - 개발용)
  const handleMove = useCallback(
    (args: { dragIds: string[]; parentId: string | null; index: number }) => {
      console.log('🔒 이동 기능 비활성화됨 (개발용 하드코딩 모드)');
      alert('개발용 모드에서는 이동 기능이 비활성화되어 있습니다.');
    },
    [], // 의존성 제거
  );

  // 노드 이름 변경 핸들러 (비활성화됨 - 개발용)
  const handleRename = useCallback(
    (args: { id: string; name: string; node: NodeApi<TreeNode> }) => {
      console.log('🔒 이름 변경 기능 비활성화됨 (개발용 하드코딩 모드)');
      alert('개발용 모드에서는 이름 변경 기능이 비활성화되어 있습니다.');
    },
    [], // 의존성 제거
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

  // 빈 트리 데이터 처리
  if (!treeData || treeData.length === 0) {
    return (
      <div className='mb-4'>
        <div className='w-full p-4 text-center text-gray-500'>
          <div className='mb-2'>📄</div>
          <div className='text-sm'>문서가 없습니다</div>
          <div className='text-xs text-gray-400 mt-1'>
            새 문서를 만들어보세요
          </div>
        </div>
      </div>
    );
  }

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
