/**
 * 휴지통 인덱스 생성 테스트 스크립트
 * 실행: node scripts/create-trash-indexes.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env.local'),
});

async function createTrashIndexes() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DATABASE || 'editor_lumir';

  if (!uri) {
    console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    console.error('   .env.local 파일에 MONGODB_URI를 설정해주세요.');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔄 MongoDB 연결 중...');
    await client.connect();
    console.log('✅ MongoDB 연결 성공');

    const db = client.db(dbName);

    console.log('🔄 휴지통 인덱스 생성 시작...');

    // Documents 컬렉션 인덱스
    await db
      .collection('documents')
      .createIndex(
        { isDeleted: 1, deletedAt: 1 },
        { background: true, name: 'isDeleted_1_deletedAt_1' },
      );
    console.log('✅ Documents isDeleted_1_deletedAt_1 인덱스 생성 완료');

    await db
      .collection('documents')
      .createIndex(
        { author: 1, isDeleted: 1, deletedAt: 1 },
        { background: true, name: 'author_1_isDeleted_1_deletedAt_1' },
      );
    console.log(
      '✅ Documents author_1_isDeleted_1_deletedAt_1 인덱스 생성 완료',
    );

    // Documents 휴지통 숨김 인덱스
    await db
      .collection('documents')
      .createIndex(
        { isDeleted: 1, isHiddenFromTrash: 1 },
        { background: true, name: 'isDeleted_1_isHiddenFromTrash_1' },
      );
    console.log(
      '✅ Documents isDeleted_1_isHiddenFromTrash_1 인덱스 생성 완료',
    );

    await db
      .collection('documents')
      .createIndex(
        { author: 1, isDeleted: 1, isHiddenFromTrash: 1 },
        { background: true, name: 'author_1_isDeleted_1_isHiddenFromTrash_1' },
      );
    console.log(
      '✅ Documents author_1_isDeleted_1_isHiddenFromTrash_1 인덱스 생성 완료',
    );

    // await db.collection('documents').createIndex(
    //   { deletedAt: 1 },
    //   {
    //     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
    //     partialFilterExpression: { isDeleted: true },
    //     name: 'deletedAt_1_ttl',
    //   },
    // );
    // console.log('✅ Documents TTL 인덱스 생성 완료');
    console.log('⏸️ Documents TTL 인덱스 생성 펜딩');

    // Folders 컬렉션 인덱스
    await db
      .collection('folders')
      .createIndex(
        { isDeleted: 1, deletedAt: 1 },
        { background: true, name: 'isDeleted_1_deletedAt_1' },
      );
    console.log('✅ Folders isDeleted_1_deletedAt_1 인덱스 생성 완료');

    await db
      .collection('folders')
      .createIndex(
        { user: 1, isDeleted: 1, deletedAt: 1 },
        { background: true, name: 'user_1_isDeleted_1_deletedAt_1' },
      );
    console.log('✅ Folders user_1_isDeleted_1_deletedAt_1 인덱스 생성 완료');

    // Folders 휴지통 숨김 인덱스
    await db
      .collection('folders')
      .createIndex(
        { isDeleted: 1, isHiddenFromTrash: 1 },
        { background: true, name: 'isDeleted_1_isHiddenFromTrash_1' },
      );
    console.log('✅ Folders isDeleted_1_isHiddenFromTrash_1 인덱스 생성 완료');

    await db
      .collection('folders')
      .createIndex(
        { user: 1, isDeleted: 1, isHiddenFromTrash: 1 },
        { background: true, name: 'user_1_isDeleted_1_isHiddenFromTrash_1' },
      );
    console.log(
      '✅ Folders user_1_isDeleted_1_isHiddenFromTrash_1 인덱스 생성 완료',
    );

    // await db.collection('folders').createIndex(
    //   { deletedAt: 1 },
    //   {
    //     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
    //     partialFilterExpression: { isDeleted: true },
    //     name: 'deletedAt_1_ttl',
    //   },
    // );
    // console.log('✅ Folders TTL 인덱스 생성 완료');
    console.log('⏸️ Folders TTL 인덱스 생성 펜딩');

    // 인덱스 목록 확인
    console.log('\n📋 생성된 인덱스 목록:');

    try {
      const [documentIndexes, folderIndexes] = await Promise.all([
        db.collection('documents').listIndexes().toArray(),
        db.collection('folders').listIndexes().toArray(),
      ]);

      console.log('\n📄 Documents 인덱스:');
      documentIndexes.forEach((index) => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });

      console.log('\n📁 Folders 인덱스:');
      folderIndexes.forEach((index) => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    } catch (error) {
      console.log('⚠️ 인덱스 목록 조회 중 오류 발생:', error.message);
      console.log('✅ 하지만 인덱스 생성은 성공적으로 완료되었습니다!');
    }

    console.log('\n✅ 모든 휴지통 인덱스 생성 완료!');
  } catch (error) {
    console.error('❌ 인덱스 생성 실패:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  createTrashIndexes();
}
