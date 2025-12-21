/**
 * Script to create Winland project with units
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_ID = '8c3656b0-411d-4c45-bab4-6f3229b4da72'; // Admin user ID

interface UnitData {
  code: string;
  kichThuoc?: string;
  dienTichDat?: number;
  dienTichSan?: number;
  huong?: string;
  soPhongNgu?: string;
  soPhongWC?: string;
  banCong?: boolean;
  thongTin?: string;
  ghiChu?: string;
  price?: number;
}

const unitsData: UnitData[] = [
  // Building LK01
  {
    code: 'LK01-01',
    kichThuoc: '20.355x10',
    dienTichDat: 203.6,
    dienTichSan: 427.9,
    huong: 'Đông Bắc',
    soPhongNgu: '4PN',
    soPhongWC: '4WC',
    banCong: true,
    thongTin: 'Vát góc trái, Có tiền sảnh, Không gara',
    ghiChu: 'Vát góc trái',
    price: 0,
  },
  {
    code: 'LK01-02',
    kichThuoc: 'Dài 20.4, Dài 16.4+5.7, Rộng 10:06',
    dienTichDat: 195.5,
    dienTichSan: 427.9,
    huong: 'Đông, Đông Bắc, Đông Nam',
    soPhongNgu: '4PN',
    soPhongWC: '4WC',
    banCong: true,
    thongTin: 'Vát góc phải, Có tiền sảnh, Phòng đa năng, Kinh Doanh, Mặt trước',
    ghiChu: 'Vát góc phải',
    price: 0,
  },
  {
    code: 'LK01-03',
    kichThuoc: '20x10',
    dienTichDat: 200,
    dienTichSan: 482.9,
    huong: 'Đông Nam',
    soPhongNgu: '4PN',
    soPhongWC: '4WC',
    banCong: true,
    thongTin: '3,5 tầng(tum), Có sân sau, Kinh Doanh, Mặt sau',
    ghiChu: 'Căn mặt sau',
    price: 0,
  },
  // Building LK02
  {
    code: 'LK02-04',
    kichThuoc: 'Dài 16.5, Rộng 10:14, Dài 5.7:12.5',
    dienTichDat: 223,
    dienTichSan: 438.4,
    huong: 'Tây Nam, Tây, Tây Bắc',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: '2 mặt tiền, Gara trong (3520x5510), Kinh doanh',
    ghiChu: 'Vát góc phải, Mặt sau',
    price: 0,
  },
  {
    code: 'LK02-05',
    kichThuoc: 'Dài 16.5, Rộng 10:14, Dài 5.7:12.5',
    dienTichDat: 223,
    dienTichSan: 528.0,
    huong: 'Tây Bắc, Bắc, Đông Bắc',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: '2 mặt tiền, Gara trong (3520x5510), Kinh doanh',
    ghiChu: 'Vát góc trái, Mặt trước',
    price: 0,
  },
  {
    code: 'LK02-06',
    kichThuoc: '16.5x9.0',
    dienTichDat: 148.5,
    dienTichSan: 324.0,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara ngoài (3700x6480)',
    ghiChu: 'Mặt sau',
    price: 0,
  },
  {
    code: 'LK02-07',
    kichThuoc: '16.5x9.0',
    dienTichDat: 148.5,
    dienTichSan: 384.0,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara trong (4870x2875), Phòng Đa năng (5500x5500)',
    ghiChu: 'Mặt trước',
    price: 0,
  },
  {
    code: 'LK02-08',
    kichThuoc: '16.5x9.0',
    dienTichDat: 148.5,
    dienTichSan: 324.0,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara ngoài (3700x6480)',
    ghiChu: 'Mặt sau',
    price: 0,
  },
  {
    code: 'LK02-09',
    kichThuoc: '16.5x9.0',
    dienTichDat: 148.5,
    dienTichSan: 384.0,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '1+3+1',
    banCong: true,
    thongTin: 'Gara trong (4870x2875), Phòng Đa năng (5500x5500)',
    ghiChu: 'Mặt trước',
    price: 0,
  },
  {
    code: 'LK02-10',
    kichThuoc: '16.5x9.0',
    dienTichDat: 148.5,
    dienTichSan: 324.0,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara ngoài (3700x6480)',
    ghiChu: 'Mặt sau',
    price: 0,
  },
  {
    code: 'LK02-11',
    kichThuoc: '16.5x9.0',
    dienTichDat: 148.5,
    dienTichSan: 384.0,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara trong (4870x2875), Phòng Đa năng (5500x5500)',
    ghiChu: 'Mặt trước',
    price: 0,
  },
  {
    code: 'LK02-12',
    kichThuoc: '16.5x9.0',
    dienTichDat: 148.5,
    dienTichSan: 300,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara ngoài (3700x6480)',
    ghiChu: 'Mặt sau',
    price: 0,
  },
  {
    code: 'LK02-13',
    kichThuoc: '16.5x9.0',
    dienTichDat: 148.5,
    dienTichSan: 384.0,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '1+3+1',
    banCong: true,
    thongTin: 'Gara trong (4870x2875), Phòng Đa năng (5500x5500)',
    ghiChu: 'Mặt trước',
    price: 0,
  },
  {
    code: 'LK02-14',
    kichThuoc: '16.5x12',
    dienTichDat: 198,
    dienTichSan: 405.0,
    huong: 'Đông Nam, Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Tiền sảnh trước, Gara ngoài (5890x3250), Sân sau',
    ghiChu: 'Mặt trong',
    price: 0,
  },
  {
    code: 'LK02-15',
    kichThuoc: '16.5x12',
    dienTichDat: 198,
    dienTichSan: 470.7,
    huong: 'Đông, Đông Nam, Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Phòng Đa năng, Thư phòng, Gara trong (5170x3580), Sân sau',
    ghiChu: 'Mặt trước',
    price: 0,
  },
  // Building LK03
  {
    code: 'LK03-16',
    kichThuoc: '16.5x12',
    dienTichDat: 198,
    dienTichSan: 405,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5870x3500), Có sân vườn trước và sau, Thư phòng',
    ghiChu: 'Mặt sau',
    price: 0,
  },
  {
    code: 'LK03-17',
    kichThuoc: '16.5x12',
    dienTichDat: 198,
    dienTichSan: 470.7,
    huong: 'Bắc, Đông Bắc, Tây Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Gara trong (4860x3580), Phòng Đa năng (56m2), Thư phòng',
    ghiChu: 'Mặt trước',
    price: 0,
  },
  {
    code: 'LK03-18',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 301,
    huong: 'Tây nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara ngoài (6340x2990), Tiền sảnh trước',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'LK03-19',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 344,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara trong (4870x2890), Phòng Đa năng (4500x4470)',
    ghiChu: 'Sân sau, Mặt trước',
    price: 0,
  },
  {
    code: 'LK03-20',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 301,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara ngoài (6250x2990), Tiền sảnh trước',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'LK03-21',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 344,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara trong (4870x2870), Phòng Đa năng (4500x4470)',
    ghiChu: 'Sân sau, Mặt trước',
    price: 0,
  },
  {
    code: 'LK03-22',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 301,
    huong: 'Tây nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara ngoài (6340x2990), Tiền sảnh trước',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'LK03-23',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 344,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara trong (4870x2890), Phòng Đa năng (4500x4470)',
    ghiChu: 'Sân sau, Mặt trước',
    price: 0,
  },
  {
    code: 'LK03-24',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 301,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara ngoài (6250x2990), Tiền sảnh trước',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'LK03-25',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 344,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara trong (4870x2870), Phòng Đa năng (4500x4470)',
    ghiChu: 'Sân sau, Mặt trước',
    price: 0,
  },
  {
    code: 'LK03-26',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 301,
    huong: 'Tây nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara ngoài (6340x2990), Tiền sảnh trước',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'LK03-27',
    kichThuoc: '16.5x08',
    dienTichDat: 132,
    dienTichSan: 344,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '1+2+1',
    banCong: true,
    thongTin: 'Gara trong (4870x2890), Phòng Đa năng (4500x4470)',
    ghiChu: 'Sân sau, Mặt trước',
    price: 0,
  },
  {
    code: 'LK03-28',
    kichThuoc: '16.5x12',
    dienTichDat: 198,
    dienTichSan: 405.0,
    huong: 'Đông Nam, Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Tiền sảnh trước, Gara ngoài (5890x3250)',
    ghiChu: 'Sân sau, Mặt trong',
    price: 0,
  },
  {
    code: 'LK03-29',
    kichThuoc: '16.5x12',
    dienTichDat: 198,
    dienTichSan: 470.7,
    huong: 'Đông, Đông Nam, Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Phòng Đa năng, Thư phòng, Gara trong (5170x3580)',
    ghiChu: 'Sân sau, Mặt trước',
    price: 0,
  },
  // Building BT01
  {
    code: 'BT01-30',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-31',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Đông Bắc',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-32',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-33',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Đông Bắc',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-34',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-35',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Đông Bắc',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-36',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-37',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Đông Bắc',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-38',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Tây Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-39',
    kichThuoc: '16.5x13',
    dienTichDat: 214.5,
    dienTichSan: 406.5,
    huong: 'Đông Bắc',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara ngoài (5650x5290), Tiền sảnh, lối hông, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-40',
    kichThuoc: 'Dài 16.5, Dài 12.5:5.7, Rộng 14.4:10.4',
    dienTichDat: 230.4,
    dienTichSan: 426,
    huong: 'Tây Nam, Nam, Đông Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara trong (6660x2570), Vát góc trái, Tiền sảnh, sân+lối hông rộng, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  {
    code: 'BT01-41',
    kichThuoc: 'Dài 16.5, Dài 12.5:5.7, Rộng 14.4:10.4',
    dienTichDat: 230.4,
    dienTichSan: 426,
    huong: 'Đông Bắc, Đông, Đông Nam',
    soPhongNgu: '1+2+1',
    soPhongWC: '1+2+2',
    banCong: true,
    thongTin: 'Gara trong (6480x2570), Vát góc phải, Tiền sảnh, sân+lối hông rộng, Phòng giải trí+sảnh T2 lớn',
    ghiChu: 'Sân sau, Mặt sau',
    price: 0,
  },
  // Building BT02
  {
    code: 'BT02-42',
    kichThuoc: 'Dài 24.7:20.7, Rộng 17.4:5.7, Rộng 21.5',
    dienTichDat: 522.3,
    dienTichSan: 682.1,
    huong: 'Đông Bắc, Bắc, Tây Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara trong (5670x5480), Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, >180m2',
    price: 0,
  },
  {
    code: 'BT02-43',
    kichThuoc: 'Dài 24.7:20.7, Rộng 17.6:5.7, Rộng 21.5',
    dienTichDat: 522.3,
    dienTichSan: 718.1,
    huong: 'Tây Nam, Tây Bắc, Tây',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara trong (5670x5480), Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, >180m2',
    price: 0,
  },
  {
    code: 'BT02-44',
    kichThuoc: '24x21.5',
    dienTichDat: 516,
    dienTichSan: 645.8,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên phải, >150m2',
    price: 0,
  },
  {
    code: 'BT02-45',
    kichThuoc: '24x21.5',
    dienTichDat: 516,
    dienTichSan: 645.8,
    huong: 'Tây Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên trái, >150m2',
    price: 0,
  },
  {
    code: 'BT02-46',
    kichThuoc: '24x21.5',
    dienTichDat: 516,
    dienTichSan: 645.8,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên trái, >150m2',
    price: 0,
  },
  {
    code: 'BT02-47',
    kichThuoc: '24x21.5',
    dienTichDat: 516,
    dienTichSan: 645.8,
    huong: 'Tây Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên phải, >150m2',
    price: 0,
  },
  {
    code: 'BT02-48',
    kichThuoc: '24x21.5',
    dienTichDat: 516,
    dienTichSan: 645.8,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên phải, >150m2',
    price: 0,
  },
  {
    code: 'BT02-49',
    kichThuoc: '24x21.5',
    dienTichDat: 516,
    dienTichSan: 645.8,
    huong: 'Tây Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên trái, >150m2',
    price: 0,
  },
  {
    code: 'BT02-50',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên trái, >90m2',
    price: 0,
  },
  {
    code: 'BT02-51',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Tây Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4000), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên phải, >90m2',
    price: 0,
  },
  {
    code: 'BT02-52',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4000), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên phải, >90m2',
    price: 0,
  },
  {
    code: 'BT02-53',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Tây Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên trái, >90m2',
    price: 0,
  },
  {
    code: 'BT02-54',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên trái, >90m2',
    price: 0,
  },
  {
    code: 'BT02-55',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Tây Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4000), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên phải, >90m2',
    price: 0,
  },
  {
    code: 'BT02-56',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4000), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên phải, >90m2',
    price: 0,
  },
  {
    code: 'BT02-57',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Tây Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên trái, >90m2',
    price: 0,
  },
  {
    code: 'BT02-58',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Đông Bắc',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên trái, >90m2',
    price: 0,
  },
  {
    code: 'BT02-59',
    kichThuoc: '21.5x21',
    dienTichDat: 451.5,
    dienTichSan: 645.8,
    huong: 'Tây Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara ngoài (5770x4000), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, bên phải, >90m2',
    price: 0,
  },
  {
    code: 'BT02-60',
    kichThuoc: 'Dài 28.7:27.1, Rộng 18.1:4.9, Rộng 21.5',
    dienTichDat: 507.7,
    dienTichSan: 718.1,
    huong: 'Đông Bắc, Đông, Đông Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara trong (5670x5480), Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh, sảnh nhà rộng, >160m2',
    price: 0,
  },
  {
    code: 'BT02-61',
    kichThuoc: 'Dài 27.1:16.3, Rộng 17:8.2, Rộng 21.5',
    dienTichDat: 635.7,
    dienTichSan: 682.1,
    huong: 'Tây Nam, Nam, Đông Nam',
    soPhongNgu: '1+3+1',
    soPhongWC: '2+3+1',
    banCong: true,
    thongTin: 'Thông 2 tầng, Gara trong (5670x5480), Gara ngoài (5770x4720), Phòng giải trí >21m2, Không gian đa năng >21m2, Sân vườn rộng (bể bơi, tiểu cảnh, hồ cá)',
    ghiChu: 'Tầng tum có phòng máy, Tiền sảnh rộng, ~300m2',
    price: 0,
  },
];

async function main() {
  console.log('🏗️  Creating Winland Project...\n');

  try {
    // 1. Create or get project
    const project = await prisma.project.upsert({
      where: { code: 'WINLAND-2025' },
      update: {},
      create: {
        name: 'Winland',
        code: 'WINLAND-2025',
        status: 'OPEN',
        developer: 'Winland Developer',
        location: 'Việt Nam',
        address: 'Chưa xác định',
        district: 'Chưa xác định',
        city: 'Chưa xác định',
        totalBuildings: 5,
        totalUnits: unitsData.length,
        description: 'Dự án Winland - Liền kề cao cấp',
        createdBy: ADMIN_ID,
      },
    });
    console.log(`✅ Project created: ${project.name} (${project.code})`);

    // 2. Create buildings LK01, LK02, LK03, BT01, and BT02
    const buildingLK01 = await prisma.building.upsert({
      where: {
        projectId_code: {
          projectId: project.id,
          code: 'LK01',
        },
      },
      update: {},
      create: {
        projectId: project.id,
        code: 'LK01',
        name: 'LK01 - Liền kề',
        floors: 4, // T1, T2, T3, T4
        description: 'Tòa nhà liền kề',
      },
    });
    console.log(`✅ Building created: ${buildingLK01.name}`);

    const buildingLK02 = await prisma.building.upsert({
      where: {
        projectId_code: {
          projectId: project.id,
          code: 'LK02',
        },
      },
      update: {},
      create: {
        projectId: project.id,
        code: 'LK02',
        name: 'LK02 - Liền kề',
        floors: 4, // T1, T2, T3, T4
        description: 'Tòa nhà liền kề 02',
      },
    });
    console.log(`✅ Building created: ${buildingLK02.name}`);

    const buildingLK03 = await prisma.building.upsert({
      where: {
        projectId_code: {
          projectId: project.id,
          code: 'LK03',
        },
      },
      update: {},
      create: {
        projectId: project.id,
        code: 'LK03',
        name: 'LK03 - Liền kề',
        floors: 4, // T1, T2, T3, T4
        description: 'Tòa nhà liền kề 03',
      },
    });
    console.log(`✅ Building created: ${buildingLK03.name}`);

    const buildingBT01 = await prisma.building.upsert({
      where: {
        projectId_code: {
          projectId: project.id,
          code: 'BT01',
        },
      },
      update: {},
      create: {
        projectId: project.id,
        code: 'BT01',
        name: 'BT01 - Biệt thự',
        floors: 4, // T1, T2, T3, T4
        description: 'Tòa nhà biệt thự',
      },
    });
    console.log(`✅ Building created: ${buildingBT01.name}`);

    const buildingBT02 = await prisma.building.upsert({
      where: {
        projectId_code: {
          projectId: project.id,
          code: 'BT02',
        },
      },
      update: {},
      create: {
        projectId: project.id,
        code: 'BT02',
        name: 'BT02 - Biệt thự',
        floors: 4, // T1, T2, T3, T4
        description: 'Tòa nhà biệt thự 02',
      },
    });
    console.log(`✅ Building created: ${buildingBT02.name}`);

    // 3. Create floors for all buildings (T1, T2, T3, T4)
    const buildings = [buildingLK01, buildingLK02, buildingLK03, buildingBT01, buildingBT02];
    const buildingFloors: { [key: string]: any[] } = {};

    for (const building of buildings) {
      const floors = [];
      for (let i = 1; i <= 4; i++) {
        const floor = await prisma.floor.upsert({
          where: {
            buildingId_number: {
              buildingId: building.id,
              number: i,
            },
          },
          update: {},
          create: {
            buildingId: building.id,
            number: i,
          },
        });
        floors.push(floor);
      }
      buildingFloors[building.code] = floors;
    }
    console.log(`✅ Created floors for ${buildings.length} buildings`);

    // 4. Get or create unit type (if needed)
    let unitType = await prisma.unitType.findFirst({
      where: { code: 'LINKED' },
    });

    if (!unitType) {
      unitType = await prisma.unitType.create({
        data: {
          name: 'Liền kề',
          code: 'LINKED',
          description: 'Căn liền kề',
        },
      });
      console.log(`✅ Unit type created: ${unitType.name}`);
    }

    // 5. Create units
    console.log('\n🏘️  Creating Units...');
    let createdCount = 0;

    for (const unitData of unitsData) {
      // Parse bedrooms and bathrooms from string (handle format like "1+2+1" or "4PN")
      let bedrooms = 4;
      if (unitData.soPhongNgu) {
        if (unitData.soPhongNgu.includes('+')) {
          // Format: "1+2+1" - sum all numbers
          const numbers = unitData.soPhongNgu.match(/\d+/g);
          bedrooms = numbers ? numbers.reduce((sum, n) => sum + parseInt(n), 0) : 4;
        } else {
          // Format: "4PN" or just number
          const match = unitData.soPhongNgu.match(/(\d+)/);
          bedrooms = match ? parseInt(match[1]) : 4;
        }
      }

      let bathrooms = 4;
      if (unitData.soPhongWC) {
        if (unitData.soPhongWC.includes('+')) {
          // Format: "1+2+1" - sum all numbers
          const numbers = unitData.soPhongWC.match(/\d+/g);
          bathrooms = numbers ? numbers.reduce((sum, n) => sum + parseInt(n), 0) : 4;
        } else {
          // Format: "4WC" or just number
          const match = unitData.soPhongWC.match(/(\d+)/);
          bathrooms = match ? parseInt(match[1]) : 4;
        }
      }

      // Extract direction (take first one if multiple)
      const direction = unitData.huong?.split(',')[0]?.trim() || 'Đông';

      // Create description from multiple fields
      const description = [
        unitData.thongTin,
        unitData.ghiChu,
        unitData.kichThuoc ? `Kích thước: ${unitData.kichThuoc}` : '',
        unitData.dienTichDat ? `Diện tích đất: ${unitData.dienTichDat}m²` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      // Determine which building based on unit code
      let buildingCode = 'LK01';
      if (unitData.code.startsWith('BT02')) {
        buildingCode = 'BT02';
      } else if (unitData.code.startsWith('BT01')) {
        buildingCode = 'BT01';
      } else if (unitData.code.startsWith('LK03')) {
        buildingCode = 'LK03';
      } else if (unitData.code.startsWith('LK02')) {
        buildingCode = 'LK02';
      } else if (unitData.code.startsWith('LK01')) {
        buildingCode = 'LK01';
      }
      const building = buildings.find(b => b.code === buildingCode) || buildingLK01;
      const floors = buildingFloors[buildingCode];
      
      // Use floor 1 (T1) for now, or can be adjusted
      const floor = floors[0];

      const unit = await prisma.unit.upsert({
        where: { code: unitData.code },
        update: {
          area: unitData.dienTichSan || 400,
          bedrooms,
          bathrooms,
          direction,
          balcony: unitData.banCong || false,
          description,
        },
        create: {
          projectId: project.id,
          buildingId: building.id,
          floorId: floor.id,
          unitTypeId: unitType.id,
          code: unitData.code,
          unitNumber: unitData.code,
          status: 'AVAILABLE',
          price: unitData.price || 0, // Should be set manually later
          area: unitData.dienTichSan || 400,
          bedrooms,
          bathrooms,
          direction,
          balcony: unitData.banCong || false,
          description,
        },
      });

      console.log(`  ✅ ${unit.code} - ${unit.area}m² - ${bedrooms}PN/${bathrooms}WC - ${direction}`);
      createdCount++;
    }

    console.log(`\n✅ Created ${createdCount} units`);

    // Update project totals
    const actualBuildingCount = await prisma.building.count({
      where: { projectId: project.id, deletedAt: null },
    });
    const actualUnitCount = await prisma.unit.count({
      where: { projectId: project.id, deletedAt: null },
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        totalBuildings: actualBuildingCount,
        totalUnits: actualUnitCount,
      },
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Winland Project Setup Completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Summary:`);
    console.log(`   - Project: ${project.name}`);
    console.log(`   - Buildings: ${buildings.length} (LK01, LK02, LK03, BT01, BT02)`);
    console.log(`   - Floors: 4 per building`);
    console.log(`   - Units: ${createdCount}`);
    console.log(`\n⚠️  Note: Prices need to be set manually for each unit`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
