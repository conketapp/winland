import Link from 'next/link';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  company: [
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Liên hệ', href: '/contact' },
    { name: 'Điều khoản sử dụng', href: '/terms' },
    { name: 'Chính sách bảo mật', href: '/privacy' },
  ],
  services: [
    { name: 'Mua bán nhà đất', href: '/properties?type=SALE' },
    { name: 'Cho thuê nhà đất', href: '/properties?type=RENT' },
    { name: 'Tin tức', href: '/news' },
    { name: 'Hướng dẫn', href: '/guide' },
  ],
  contact: [
    { icon: Phone, text: '1900 1234' },
    { icon: Mail, text: 'info@batdongsan.vn' },
    { icon: MapPin, text: 'Hà Nội, Việt Nam' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Batdongsan</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Nền tảng bất động sản hàng đầu Việt Nam. Kết nối người mua, người bán và nhà môi giới.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Dịch vụ</h3>
            <ul className="space-y-2">
              {footerLinks.services.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Liên hệ</h3>
            <ul className="space-y-2">
              {footerLinks.contact.map((item, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <item.icon className="h-4 w-4" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Batdongsan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

