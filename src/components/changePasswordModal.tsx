// Import React and necessary hooks
import React, { useState } from 'react';
import { useToast } from './toast';
import { Circles } from 'react-loader-spinner';
import apiClient from '../utils/apiClient';
import { useForm } from 'react-hook-form';


interface Props {
    open: boolean,
    handleClosePasswordModal: () => void,
}

interface FormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}


const ChangePasswordModal: React.FC<Props> = ({ open, handleClosePasswordModal }) => {

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>();
    const { addToast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            apiClient.post(`${import.meta.env.VITE_API_URL}/auth/update_password`, data).then(
                () => {
                    addToast("Password updated successfully", 'success')
                    handleClosePasswordModal();
                    setIsSubmitting(false);
                    reset()
                }).catch(error => {
                    addToast(error.response.data.message, 'error')
                    setIsSubmitting(false);
                }).finally(() => {
                    setIsSubmitting(false);
                })

        } catch (error) {
            addToast('Error updating password', 'error');
        }
    };


    return (
        <>
            <div className={`modal ${open ? "modal-open" : ""}`} role="dialog">
                <div className="modal-box relative">
                    <h3 className="font-bold text-lg">Change Password</h3>
                    <form id='change_password_form' className="form-control pt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <label>Current Password</label>
                        <input
                            className={`input input-bordered w-full ${errors.currentPassword
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder=''
                            type="password"
                            id="currentPassword"
                            {...register('currentPassword', { required: 'Current password is required' })}
                        />
                        {errors.currentPassword && <p className="text-red-500 mt-2">{errors.currentPassword.message}</p>}

                        <label>New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            {...register('newPassword', {
                                required: 'New password is required',
                                minLength: { value: 6, message: 'Password must be at least 6 characters long' },
                            })}
                            className={`input input-bordered w-full ${errors.newPassword
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder=''
                        />
                        {errors.newPassword && <p className="text-red-500 mt-2">{errors.newPassword.message}</p>}

                        <label>Confirm Password</label>
                        <input
                            className={`input input-bordered w-full ${errors.confirmPassword
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder=''
                            type="password"
                            id="confirmPassword"
                            {...register('confirmPassword', {
                                required: 'Confirm password is required',
                                validate: (value) =>
                                    value === watch('newPassword') || 'Passwords do not match',
                            })}
                        />
                        {errors.confirmPassword && <p className="text-red-500 mt-2">{errors.confirmPassword.message}</p>}

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
                                        /> : "Save"
                                }
                            </button>
                            <button type='button' onClick={() => handleClosePasswordModal()} className="btn">Close</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ChangePasswordModal;
