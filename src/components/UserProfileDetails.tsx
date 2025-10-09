import React from 'react';
import type { UserProfile } from '../types/user';
import { FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaMicrophone } from 'react-icons/fa';


interface UserProfileDetailsProps { 
   user: UserProfile;
   onClose: () => void; 
}

function UserProfileDetails({ user, onClose }: UserProfileDetailsProps) {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md">
                <h2 className="text-2xl font-bold mb-4">{user.displayName}</h2>
                <p className="text-gray-600 mb-3">{user.description}</p>

               {/* Afiseaza locatia */}
                <div className="flex items-center text-gray-500 mb-2">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{user.location || 'Unknown'}</span>
                </div>

                 {/* Afiseaza genul muzical */}
                {user.genre && (
                    <div className="flex items-center text-gray-500 mb-2">
                        <FaMicrophone className="mr-1"/>
                        <span>{user.genre}</span>
                     </div>     
                )}

                {/* Afiseaza linkurile de social media */}
                <div className="mt-4">
                    {user.socialLinks?.facebook && (
                        <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 mr-2">
                            <FaFacebook className="inline mr-1" />
                            Facebook
                        </a>
                    )}
                    {user.socialLinks?.instagram && (
                        <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 mr-2">
                            <FaInstagram className="inline mr-1" />
                            Instagram
                        </a>
                    )}
                    {user.socialLinks?.youtube && (
                        <a href={user.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                            <FaYoutube className="inline mr-1" />
                            Youtube
                        </a>
                    )}
                </div>

                <button 
                    className="btn-primary bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4"
                    onClick={onClose}
                    >
                        Close     
                    </button>
                </div>
            </div>
    );
}

export default UserProfileDetails;






