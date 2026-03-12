/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UploadCloud, CheckCircle, ChevronDown } from 'lucide-react';

export default function App() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    website: '',
    instagram: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    companyType: '',
    taxId: '',
    sampleSet: '',
    additionalInfo: '',
    marketingOptIn: false,
    termsAccepted: false,
  });

  const companyTypes = [
    "Interior Design Solopreneur", "Design w/ Retail", "Interior Design Firm (2-5 people)",
    "Interior Design Firm (5+ people)", "Architecture Firm (A&D)", "Receiver",
    "Specialty Retail - Rugs", "Specialty Retail - Furniture", "E-Comm",
    "Home Staging", "To-The-Trade-Multiline Showroom", "Vendor", "Personal Use"
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call to the Cloud Run Middleware
    setTimeout(() => setIsSubmitted(true), 800);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f3f1e9] flex items-center justify-center p-4 font-['Vazirmatn']">
        <style dangerouslySetInnerHTML={{__html: "@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;900&family=Vazirmatn:wght@300;400;500;600;700&display=swap');"}} />
        <div className="max-w-xl w-full bg-white border-2 border-[#F2633A] rounded-[16px] p-8 animate-in fade-in slide-in-from-top-4 shadow-xl">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-[#F2633A] mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-['Archivo'] mb-3 text-[#212227]">Application Submitted</h2>
            <p className="text-base text-[#696A6D] mb-8">
              Thank you for applying to our trade program. We'll review your application and get back to you within 2-3 business days.
            </p>
            
            <div className="space-y-6 text-left max-w-md mx-auto">
              <div className="flex items-start gap-4">
                <div className="bg-[#F2633A] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</div>
                <div>
                  <h4 className="font-semibold font-['Archivo'] text-[#212227] text-base">Application Review</h4>
                  <p className="text-sm text-[#696A6D] mt-1">Our team will verify your credentials</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#F2633A] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</div>
                <div>
                  <h4 className="font-semibold font-['Archivo'] text-[#212227] text-base">Email Confirmation</h4>
                  <p className="text-sm text-[#696A6D] mt-1">You'll receive approval via email</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#F2633A] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-sm">3</div>
                <div>
                  <h4 className="font-semibold font-['Archivo'] text-[#212227] text-base">Start Ordering</h4>
                  <p className="text-sm text-[#696A6D] mt-1">Access wholesale pricing and custom orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputStyles = "w-full bg-[#e1e0da] text-[#212227] border border-[#869880] rounded-[5px] px-[15px] py-[8px] text-[12px] font-light placeholder-[#696A6D] focus:border-[#f2633a] focus:ring-1 focus:ring-[#f2633a] outline-none transition-colors";
  const labelStyles = "block text-[#212227] text-[14px] font-medium mb-1";
  const sectionHeaderStyles = "text-[18px] font-bold font-['Archivo'] text-[#212227] border-b border-[#869880]/30 pb-2 mb-4 mt-8";

  return (
    <div className="min-h-screen bg-[#f3f1e9] py-12 px-4 sm:px-6 lg:px-8 font-['Vazirmatn']">
      {!isSubmitted && (
        <style dangerouslySetInnerHTML={{__html: "@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;900&family=Vazirmatn:wght@300;400;500;600;700&display=swap');"}} />
      )}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-white px-8 pt-10 pb-6 border-b border-gray-100 text-center flex flex-col items-center">
          <img 
            src="https://images.leadconnectorhq.com/image/f_webp/q_85/r_1000/u_https://storage.googleapis.com/highlevel-backend.appspot.com/location/G3HF4z9DuWL3asaPQRIY/form/6OQGhlBRRFRwesLU3f72/fb3a3747-c691-417c-b4dc-a33875e8ab6d.png" 
            alt="UNDERITALL" 
            className="h-12 md:h-16 mb-6 object-contain"
          />
          <h2 className="text-2xl font-bold font-['Archivo'] text-[#212227] mb-4">Wholesale Registration</h2>
          <p className="text-[#696A6D] text-sm leading-relaxed max-w-2xl mx-auto">
            Becoming a trade member takes less than one minute and opens the door to exclusive pricing, custom rug pad options, and resources built for design professionals.
            <br/><br/>
            We're trade only, which means all accounts require verified business details before purchasing. Registration is quick, easy and absolutely worth it. Enter your info, upload your resale certificate and start shopping.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          
          {/* Business Information */}
          <div>
            <h3 className={sectionHeaderStyles}>Business Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelStyles}>Company Name *</label>
                <input required type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className={inputStyles} placeholder="Organization" />
              </div>
              
              <div>
                <label className={labelStyles}>First Name *</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputStyles} placeholder="First Name" />
              </div>
              <div>
                <label className={labelStyles}>Last Name *</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputStyles} placeholder="Last Name" />
              </div>

              <div>
                <label className={labelStyles}>Title *</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputStyles} placeholder="e.g. CEO, Sales Director" />
              </div>
              <div>
                <label className={labelStyles}>Email *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputStyles} placeholder="Email address" />
              </div>

              <div>
                <label className={labelStyles}>Phone *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputStyles} placeholder="Phone number" />
              </div>
              <div>
                <label className={labelStyles}>Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange} className={inputStyles} placeholder="https://www.yourwebsite.com" />
              </div>

              <div className="sm:col-span-2">
                <label className={labelStyles}>Instagram</label>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleInputChange} className={inputStyles} placeholder="@yourighandle" />
              </div>

              {/* Address Block */}
              <div className="sm:col-span-2 mt-4 space-y-4 border border-[#e1e0da] p-4 rounded-md bg-gray-50">
                <h4 className="text-sm font-semibold text-[#212227]">Business Address</h4>
                <div>
                  <label className="sr-only">Street Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className={inputStyles} placeholder="Street Address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputStyles} placeholder="City" />
                  <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputStyles} placeholder="State / Province" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className={inputStyles} placeholder="Postal Code" />
                  <div className="relative">
                    <select required name="country" value={formData.country} onChange={handleInputChange} className={`${inputStyles} appearance-none w-full`}>
                      <option value="" disabled>Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-[#696A6D] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Credentials */}
          <div>
            <h3 className={sectionHeaderStyles}>Trade Credentials</h3>
            <div className="space-y-5">
              
              <div>
                <label className={labelStyles}>Type of Company *</label>
                <div className="relative">
                  <select required name="companyType" value={formData.companyType} onChange={handleInputChange} className={`${inputStyles} appearance-none w-full`}>
                    <option value="" disabled>Please Choose...</option>
                    {companyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-[#696A6D] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelStyles}>Tax Identifier *</label>
                <p className="text-xs text-[#696A6D] mb-2">VAT / Tax ID (EIN)</p>
                <input required type="text" name="taxId" value={formData.taxId} onChange={handleInputChange} className={inputStyles} placeholder="Enter your EIN or VAT ID, or type 'NA' if not applicable" />
              </div>

              <div>
                <label className={labelStyles}>Tax Documentation *</label>
                <p className="text-xs text-[#696A6D] mb-2">Upload a copy of your state issued resale certificate (PDF, JPG, or PNG) 50MB Max</p>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#869880] border-dashed rounded-md bg-[#e1e0da]/30 hover:bg-[#e1e0da]/60 transition-colors cursor-pointer group">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-10 w-10 text-[#869880] group-hover:text-[#f2633a] transition-colors" />
                    <div className="flex text-sm text-[#696A6D]">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#f2633a] hover:text-[#f29f87] px-2 py-1 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#f2633a]">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                      <p className="pl-1 pt-1">or drag and drop</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className={sectionHeaderStyles}>Additional Information</h3>
            <div className="space-y-5">
              
              <div>
                <label className={labelStyles}>Did you receive a sample set from your representative?</label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="sampleSet" value="Yes" onChange={handleInputChange} className="w-4 h-4 text-[#f2633a] border-[#869880] focus:ring-[#f2633a] accent-[#f2633a]" />
                    <span className="text-sm text-[#212227]">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="sampleSet" value="No" onChange={handleInputChange} className="w-4 h-4 text-[#f2633a] border-[#869880] focus:ring-[#f2633a] accent-[#f2633a]" />
                    <span className="text-sm text-[#212227]">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelStyles}>Who whispered the secret of scissorless installs? We'd love to thank them!</label>
                <textarea 
                  name="additionalInfo" 
                  value={formData.additionalInfo} 
                  onChange={handleInputChange} 
                  rows="3" 
                  className={inputStyles} 
                  placeholder="Tell us how you discovered UnderItAll... Sales Rep, Online Search, Social Media, etc."
                ></textarea>
              </div>

            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-5 mt-1">
                <input required type="checkbox" name="marketingOptIn" checked={formData.marketingOptIn} onChange={handleInputChange} className="w-4 h-4 text-[#f2633a] border-[#869880] rounded focus:ring-[#f2633a] cursor-pointer accent-[#f2633a]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-[#212227] block">Marketing Opt-In & SMS Consent</span>
                <span className="text-xs text-[#696A6D] block mt-1">Yes, I'd like to receive updates, promotions, and product news from UnderItAll Holdings LLC. (You can opt out anytime.) I agree to receive text messages from UnderItAll Holdings LLC regarding my account and exclusive offers. Message and data rates may apply. Reply STOP to unsubscribe.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-5 mt-1">
                <input required type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} className="w-4 h-4 text-[#f2633a] border-[#869880] rounded focus:ring-[#f2633a] cursor-pointer accent-[#f2633a]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-[#212227] block">Terms of Service & Privacy</span>
                <span className="text-xs text-[#696A6D] block mt-1">
                  By creating an account, you agree to our <a href="#" className="text-[#F2633A] hover:underline">Terms of Service</a> and acknowledge that you've read our <a href="#" className="text-[#F2633A] hover:underline">Privacy Policy</a>.
                </span>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button 
              type="submit" 
              className="w-full bg-[#f2633a] text-white rounded-[10px] py-4 text-center font-bold font-['Archivo'] tracking-wide hover:bg-[#d9552e] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f2633a] shadow-md"
            >
              SUBMIT APPLICATION
            </button>
          </div>
          
          <div className="text-center mt-6">
             <p className="text-xs text-[#696A6D]">
                <a href="#" className="hover:text-[#f2633a] transition-colors">Privacy Policy</a> | <a href="#" className="hover:text-[#f2633a] transition-colors">Terms of Service</a>
             </p>
          </div>

        </form>
      </div>
    </div>
  );
}
