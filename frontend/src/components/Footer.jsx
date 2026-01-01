import React from 'react';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer({ onSectionChange }) {
  return (
    <footer className="custom-beige-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-accent" />
              <span className="text-2xl font-bold custom-brown">AcadMate</span>
            </div>
            <p className="custom-brown opacity-80 mb-6 max-w-md">
              Empowering students with innovative tools and resources to excel in their academic journey. 
              Join thousands of students already transforming their learning experience.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-accent" />
                <span className="custom-brown">acadmate.jssstu@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-accent" />
                <span className="custom-brown">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-accent" />
                <span className="custom-brown">Mysuru</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold custom-brown mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSectionChange('Seniors')} className="custom-brown opacity-80 hover:opacity-100 hover:text-accent transition-colors">Seniors</button>
              </li>
              <li>
                <button onClick={() => onSectionChange('TaskManager')} className="custom-brown opacity-80 hover:opacity-100 hover:text-accent transition-colors">TaskManager</button>
              </li>
              <li>
                <button onClick={() => onSectionChange('Study Materials')} className="custom-brown opacity-80 hover:opacity-100 hover:text-accent transition-colors">Study Materials</button>
              </li>
              <li>
                <button onClick={() => onSectionChange('Chatbot')} className="custom-brown opacity-80 hover:opacity-100 hover:text-accent transition-colors">Chatbot</button>
              </li>
              <li>
                <button onClick={() => onSectionChange('EventBuddy')} className="custom-brown opacity-80 hover:opacity-100 hover:text-accent transition-colors">EventBuddy</button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold custom-brown mb-4">Support</h3>
            <ul className="space-y-2">
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="custom-brown opacity-80 hover:opacity-100 hover:text-accent transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-brown border-opacity-20 mt-12 pt-8 text-center">
          <p className="custom-brown opacity-60">
            © 2025 AcadMate. All rights reserved. Built with ❤️ for students everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
