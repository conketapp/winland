const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Test query giống như service.findAll
    const where = { deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      }),
      prisma.document.count({ where }),
    ]);
    
    console.log(`✅ Found ${total} documents`);
    console.log(`✅ Returning ${items.length} items`);
    
    // Check BigInt issue
    const firstDoc = items[0];
    console.log(`\nFirst document fileSize type: ${typeof firstDoc.fileSize}`);
    console.log(`First document fileSize value: ${firstDoc.fileSize}`);
    
    // Try to convert
    const converted = {
      ...firstDoc,
      fileSize: typeof firstDoc.fileSize === 'bigint' ? Number(firstDoc.fileSize) : firstDoc.fileSize,
    };
    console.log(`\nAfter conversion fileSize type: ${typeof converted.fileSize}`);
    console.log(`After conversion fileSize value: ${converted.fileSize}`);
    
    // Try JSON.stringify
    try {
      const json = JSON.stringify(converted);
      console.log(`\n✅ JSON.stringify successful (length: ${json.length})`);
    } catch (e) {
      console.error(`\n❌ JSON.stringify failed:`, e.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
