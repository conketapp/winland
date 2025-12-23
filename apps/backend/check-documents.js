const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.document.count();
  console.log(`Total documents in database: ${count}`);
  
  if (count === 0) {
    console.log('No documents found. Running seed...');
    process.exit(1);
  } else {
    const sample = await prisma.document.findMany({ take: 5 });
    console.log('Sample documents:');
    sample.forEach(doc => {
      console.log(`- ${doc.fileName} (${doc.entityType}/${doc.entityId}) - ${doc.documentType}`);
    });
  }
  
  await prisma.$disconnect();
}

check().catch(console.error);
