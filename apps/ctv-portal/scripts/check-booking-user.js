const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

prisma.booking.findFirst({
  include: {
    ctv: true,
    unit: {
      include: {
        project: true,
        building: true,
        floor: true
      }
    }
  }
}).then(b => {
  if (!b) {
    console.log('No booking found');
    return;
  }
  console.log('User:', b.ctv.fullName, '(', b.ctv.phone, ')');
  console.log('Unit code:', b.unit.code);
  console.log('Unit has project:', !!b.unit.project);
  console.log('Unit has building:', !!b.unit.building);
  console.log('Unit has floor:', !!b.unit.floor);
  console.log('Project name:', b.unit.project?.name);
  console.log('Building name:', b.unit.building?.name);
  console.log('Floor number:', b.unit.floor?.number);
  console.log('Unit price:', b.unit.price);
  console.log('Unit area:', b.unit.area);
  console.log('Unit bedrooms:', b.unit.bedrooms);
}).finally(() => prisma.$disconnect());
