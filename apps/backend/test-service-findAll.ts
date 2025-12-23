import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const where: any = { deletedAt: null };
    const page = 1;
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

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
        skip,
        take,
      }),
      prisma.document.count({ where }),
    ]);

    console.log(`✅ Found ${total} documents, returning ${items.length}`);
    
    // Try the conversion like in service
    const itemsWithSerializedFileSize = items.map((item: any) => ({
      ...item,
      fileSize: typeof item.fileSize === 'bigint' ? Number(item.fileSize) : item.fileSize,
    }));
    
    const totalPages = Math.ceil(total / pageSize);
    const result = {
      items: itemsWithSerializedFileSize,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
    
    // Try JSON.stringify to see if it works
    const json = JSON.stringify(result);
    console.log(`✅ JSON.stringify successful (${json.length} bytes)`);
    console.log(`✅ First item fileSize: ${result.items[0]?.fileSize} (type: ${typeof result.items[0]?.fileSize})`);
  } catch (error: any) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();
