const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function createTestDocument() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ MongoDB 연결 성공');

    const db = client.db();

    // 테스트 사용자 생성 또는 찾기
    let testUser = await db
      .collection('users')
      .findOne({ email: 'test@lumireditor.com' });

    if (!testUser) {
      const userResult = await db.collection('users').insertOne({
        email: 'test@lumireditor.com',
        name: 'Lumir Test User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      testUser = {
        _id: userResult.insertedId,
        email: 'test@lumireditor.com',
        name: 'Lumir Test User',
      };
      console.log('📝 테스트 사용자 생성:', testUser._id);
    } else {
      console.log('👤 기존 테스트 사용자 사용:', testUser._id);
    }

    // 테스트 폴더 생성 또는 찾기
    let testFolder = await db.collection('folders').findOne({
      user: testUser._id,
      name: 'Lumir Editor',
    });

    if (!testFolder) {
      const folderResult = await db.collection('folders').insertOne({
        name: 'Lumir Editor',
        user: testUser._id,
        parentId: null,
        order: 1000,
        isDeleted: false,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      testFolder = { _id: folderResult.insertedId, name: 'Lumir Editor' };
      console.log('📁 테스트 폴더 생성:', testFolder._id);
    } else {
      console.log('📂 기존 테스트 폴더 사용:', testFolder._id);
    }

    // 테스트 문서 생성 또는 찾기
    let testDocument = await db.collection('documents').findOne({
      user: testUser._id,
      title: 'Lumir Editor',
    });

    if (!testDocument) {
      const documentResult = await db.collection('documents').insertOne({
        title: 'Lumir Editor',
        content: JSON.stringify([
          {
            id: 'block-1',
            type: 'heading',
            props: { level: 1 },
            content: [
              { type: 'text', text: 'Welcome to Lumir Editor!', styles: {} },
            ],
            children: [],
          },
          {
            id: 'block-2',
            type: 'paragraph',
            props: {},
            content: [
              {
                type: 'text',
                text: 'This is a test document for the Lumir Editor. You can edit this content and see your changes in real-time.',
                styles: {},
              },
            ],
            children: [],
          },
          {
            id: 'block-3',
            type: 'paragraph',
            props: {},
            content: [
              {
                type: 'text',
                text: 'Features:',
                styles: { bold: true },
              },
            ],
            children: [],
          },
          {
            id: 'block-4',
            type: 'bulletListItem',
            props: {},
            content: [{ type: 'text', text: 'Rich text editing', styles: {} }],
            children: [],
          },
          {
            id: 'block-5',
            type: 'bulletListItem',
            props: {},
            content: [
              { type: 'text', text: 'Document management', styles: {} },
            ],
            children: [],
          },
          {
            id: 'block-6',
            type: 'bulletListItem',
            props: {},
            content: [
              { type: 'text', text: 'Folder organization', styles: {} },
            ],
            children: [],
          },
        ]),
        user: testUser._id,
        folderId: testFolder._id,
        order: 1000,
        isDeleted: false,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      testDocument = { _id: documentResult.insertedId, title: 'Lumir Editor' };
      console.log('📄 테스트 문서 생성:', testDocument._id);
    } else {
      console.log('📝 기존 테스트 문서 사용:', testDocument._id);
    }

    console.log('\n🎉 테스트 데이터 준비 완료!');
    console.log('문서 ID:', testDocument._id.toString());
    console.log('폴더 ID:', testFolder._id.toString());
    console.log('사용자 ID:', testUser._id.toString());

    return {
      documentId: testDocument._id.toString(),
      folderId: testFolder._id.toString(),
      userId: testUser._id.toString(),
    };
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await client.close();
  }
}

createTestDocument().then((result) => {
  if (result) {
    console.log('\n📋 하드코딩에 사용할 ID들:');
    console.log(`DOCUMENT_ID: "${result.documentId}"`);
    console.log(`FOLDER_ID: "${result.folderId}"`);
    console.log(`USER_ID: "${result.userId}"`);
  }
});
