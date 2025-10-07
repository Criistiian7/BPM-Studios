import React from 'react';
import type { UserProfile } from '../types/user';

interface ProfileFormProps {
    tempProfile: UserProfile | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSaveClick: () => void;
    handleCancelClick: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = (
    { tempProfile, handleChange, handleSaveClick, handleCancelClick }
) => {
    return (
        <form onSubmit={handleSaveClick}>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" 
                htmlFor="displayName">
                   Nume
                </label>
                <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={tempProfile?.displayName || ""}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 
                    text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="description">
                            Descriere
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={tempProfile?.description || ""}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3
                            text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="phoneNumber">
                                Telefon
                            </label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={tempProfile?.phoneNumber || ""}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3
                                text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="facebook">
                                        Facebook
                                    </label>
                                    <input 
                                        type="text"
                                        id="facebook"
                                        name="facebook"
                                        value={tempProfile?.socialLinks?.facebook ?? ""}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3
                                        text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="instagram">
                                        </label>
                                        <input 
                                             type="text"
                                             id="instagram"
                                             name="instagram"
                                             value={tempProfile?.socialLinks?.instagram ?? ""}
                                             onChange={handleChange}
                                             className="shadow appearance-none border rounded w-full py-2 px-3
                                             text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                             />
                                             </div>
                                        
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="youtube">
                                            Youtube
                                            </label>
                                            <input
                                                type="text"
                                                id="youtube"
                                                name="youtube"
                                                value={tempProfile?.socialLinks?.youtube ?? ""}
                                                onChange={handleChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3
                                                text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                />
                                                </div>
                                    
                                                <div className="flex justify-between">
                                                    <button
                                                        type="submit"
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4
                                                        rounded focus:outline-none focus:shadow-outline"
                                                        >
                                                          Salvare
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4
                                                            rounded focus:outline-none focus:shadow-outline"
                                                            onClick={handleCancelClick}
                                                            >
                                                                Anulare
                                                            </button>
                                                            </div>
                                                            </form>
                                                        );
                                                    };

                                                    export default ProfileForm;