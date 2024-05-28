import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../../utils/apiClient';
import { useToast } from '../../components/toast';
import { Circles } from 'react-loader-spinner';

const Register = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data: any = e.currentTarget.elements
        if (data['password'].value != data['confirm'].value) {
            addToast('Password must match', 'error')
            //alert password not match
            return
        }
        setLoading(true);
        apiClient.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
            first_name: data['first_name'].value,
            last_name: data['last_name'].value,
            email: data['email'].value,
            password: data['password'].value
        })
            .then(() => {
                setLoading(false);
                navigate('/login')
            })
            .catch(reason => {
                setLoading(false);
                if (reason.response) {
                    addToast(reason.response.data.message, 'error')
                } else if (reason.request) {
                    addToast('Network error occurred. Please check your internet connection.', 'error')
                } else {
                    addToast('An unexpected error occurred. Please try again later.', 'error')
                }
            })
    }

    return (
        <div className='h-[100vh] flex flex-col items-center justify-center gap-10'>
            <div className='prose xl:prose-xl m-3'>
                <h1>Register your account</h1>
            </div>
            <form className='form-control gap-3' onSubmit={onSubmit}>
                <div className="input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
                    <input name='first_name' type="text" required className="grow" placeholder="First name" />
                </div>
                <div className="input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
                    <input name='last_name' type="text" required className="grow" placeholder="Last name" />
                </div>
                <div className="input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
                    <input name='email' type="email" required className="grow" placeholder="Email" />
                </div>
                <div className="input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
                    <input name='password' type="password" required className="grow" placeholder='Password' />
                </div>
                <div className="input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
                    <input name='confirm' type="password" required className="grow" placeholder='Confirm password' />
                </div>
                <button type='submit' className='btn btn-primary'>
                    
                    {
                        loading ? 
                        <Circles
                            height="30"
                            width="30"
                            color='white'
                            ariaLabel="circles-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />: "Register"
                    }
                </button>
                <span>
                    Alread have an account? <Link to='/login'>Login</Link>
                </span>
            </form>
        </div>
    )
}

export default Register