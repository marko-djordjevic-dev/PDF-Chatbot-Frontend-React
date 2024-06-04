// Import React and necessary hooks
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useToast } from './toast';
import { useDispatch, useSelector } from 'react-redux';
import { Circles } from 'react-loader-spinner';
import apiClient from '../utils/apiClient';
import UserImage from '../assets/icon-user.png'
import { setUserData } from '../redux/auth/actions';


interface Props {
    open: boolean,
    handleCloseProfileModal: () => void,
}

const EditProfileModal: React.FC<Props> = ({open, handleCloseProfileModal}) => {
    const me = useSelector((state: any) => state.AuthReducer.user)
    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const { addToast } = useToast()
    const dispatch = useDispatch()
    const [imageSrc, setImageSrc] = useState('');
    const [file, setFile] = useState<File>();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        setFirstName(me.first_name);
        setLastName(me.last_name);
        setImageSrc(me.img_id ? `${import.meta.env.VITE_API_URL}/chatbot/avatar/${me.img_id}` : UserImage);
      }, [me, open]);


    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const f = event.target.files[0]
            setFile(f)
            const reader = new FileReader();

            reader.onloadend = () => {
                if (typeof reader.result == "string") setImageSrc(reader.result);
            };
            if (f) {
                reader.readAsDataURL(f);
            }
        }
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return
        try {
          const formData = new FormData();
          formData.append('first_name', firstName);
          formData.append('last_name', lastName);
          if (file) {
            formData.append('img_id', file);
          }
      
          setIsSubmitting(true);
          apiClient.post(`${import.meta.env.VITE_API_URL}/auth/update_profile`, formData,
              {
                  headers: {
                      "Content-Type": 'multipart/form-data'
                  }
              }).then((res) => {
                dispatch(setUserData(res.data))
                addToast("Profile updated successfully", 'success')
                handleCloseProfileModal();
                setIsSubmitting(false);
              }).catch(error => {
                addToast(error.response.data.message, 'error')
                setIsSubmitting(false);
              }).finally(() => {
                setIsSubmitting(false);
              })

        } catch (error) {
          addToast('Error updating profile', 'error');
          setIsSubmitting(false);
        }
      };

      
    return (
        <>
            <div className={`modal ${open? "modal-open": ""}`} role="dialog">
                <div className="modal-box relative">
                    <h3 className="font-bold text-lg">Edit your profile</h3>
                    <form id='profile_form' className="form-control pt-4 space-y-4" onSubmit={onSubmit}>
                        <label>First Name</label>
                        <input
                            type='text'
                            className='input input-bordered w-full'
                            placeholder=''
                            onChange={(e) => setFirstName(e.target.value)}
                            value={firstName}
                            required
                        />
                        <label>Last Name</label>
                        <input
                            type='text'
                            className='input input-bordered w-full'
                            placeholder=''
                            onChange={(e) => setLastName(e.target.value)}
                            value={lastName}
                            required
                        />
                         <label className="">Avatar</label>
                        <div className='avatar'>
                            <div className='rounded-full border border-primary' onClick={() => document.getElementById('avatarInput')?.click()}>
                                <img
                                    src={imageSrc ? imageSrc : UserImage}
                                    alt="Upload Preview"
                                    style={{ height: '70px', width: '70px', cursor: 'pointer' }} // Style as needed
                                />

                            </div>
                            <input
                                type="file"
                                id="avatarInput"
                                onChange={handleImageChange}
                                style={{ display: 'none' }} // Hide the file input
                                accept="image/*" // Accept images only
                            />
                        </div>
                        <div className="modal-action">
                            <button className='btn'>
                            {
                                isSubmitting ? 
                                <Circles
                                    height="30"
                                    width="30"
                                    color='white'
                                    ariaLabel="circles-loading"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                    visible={true}
                                />: "Save"
                            }
                            </button>
                            <button type='button' onClick={() => handleCloseProfileModal()} className="btn">Close</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditProfileModal;
