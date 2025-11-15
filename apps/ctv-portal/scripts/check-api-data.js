const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function checkApiData() {
  try {
    console.log('🔍 Checking API data structure...\n');

    // Simulate what the API returns
    const projects = await prisma.project.findMany({
      where: {
        status: 'OPEN'
      },
      include: {
        buildings: {
          include: {
            floorsData: {
              include: {
                units: {
                  take: 2, // Just get 2 units per floor for testing
                  include: {
                    reservations: {
                      where: {
                        status: 'ACTIVE'
                      },
                      take: 1
                    },
                    bookings: {
                      where: {
                        status: {
                          in: ['PENDING_APPROVAL', 'CONFIRMED', 'PENDING_PAYMENT']
                        }
                      },
                      take: 1
                    }
                  }
                }
              },
              take: 1 // Just get 1 floor for testing
            }
          },
          take: 1 // Just get 1 building for testing
        }
      },
      take: 1 // Just get 1 project for testing
    });

    if (projects.length > 0) {
      const project = projects[0];
      console.log(`📦 Project: ${project.name}`);
      
      if (project.buildings.length > 0) {
        const building = project.buildings[0];
        console.log(`🏢 Building: ${building.name}`);
        
        if (building.floorsData.length > 0) {
          const floor = building.floorsData[0];
          console.log(`🔢 Floor: ${floor.number}`);
          
          if (floor.units.length > 0) {
            console.log(`\n📋 Sample Units:`);
            floor.units.forEach(unit => {
              console.log(`\n   Unit: ${unit.code}`);
              console.log(`   houseCertificate: ${unit.houseCertificate || 'NULL'}`);
              console.log(`   Has field: ${unit.hasOwnProperty('houseCertificate')}`);
              console.log(`   All fields: ${Object.keys(unit).join(', ')}`);
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiData();
