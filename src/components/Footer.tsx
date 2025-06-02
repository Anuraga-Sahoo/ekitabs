
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const TestPrepAiLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15.08L6 12.58l1.41-1.41L10.5 15.25l6.09-6.09L18 10.58l-7.5 7.5zM12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Company</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* User Guidelines */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Legal</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          
          {/* Follow Us & App */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Follow Us</h5>
            <div className="flex space-x-4 mb-6">
              <Link href="#" aria-label="Facebook" className="hover:text-white transition-colors"><Facebook size={24} /></Link>
              <Link href="#" aria-label="Twitter" className="hover:text-white transition-colors"><Twitter size={24} /></Link>
              <Link href="#" aria-label="Instagram" className="hover:text-white transition-colors"><Instagram size={24} /></Link>
              <Link href="#" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin size={24} /></Link>
              <Link href="#" aria-label="YouTube" className="hover:text-white transition-colors"><Youtube size={24} /></Link>
            </div>
            {/* Placeholder for App Download Buttons if needed later */}
            {/* <h5 className="text-lg font-semibold text-white mb-4">Get the App</h5> */}
            {/* ... app download buttons ... */}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center mb-4 md:mb-0">
            <TestPrepAiLogo />
            <span className="ml-2 text-white font-semibold text-xl">TestPrep AI</span>
          </div>
          <p className="text-gray-400">&copy; {currentYear} TestPrep AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
