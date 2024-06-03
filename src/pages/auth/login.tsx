import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useToast } from '../../components/toast';
import apiClient from '../../utils/apiClient';
import { Circles } from 'react-loader-spinner';
import { setUserData } from '../../redux/auth/actions';
import { useDispatch } from 'react-redux';

const Login = () => {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data: any = e.currentTarget.elements;
        setLoading(true);
        apiClient.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
            email: data['email'].value,
            password: data['password'].value
        })
            .then(async response => {
                setLoading(false);
                const { token } = response.data
                dispatch(setUserData(response.data.user))
                localStorage.setItem('token', token)
                await axios.interceptors.request.use(config => {
                    config.headers['Authorization'] = `Bearer ${token}`
                    return config
                }, error => Promise.reject(error))
                navigate('/')
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
        <div className='h-[100vh] flex flex-col items-center justify-center gap-20'>
            <div className='prose lg:prose-xl'>
                <h1>Login to your account</h1>
            </div>
            <form className='form-control gap-3' onSubmit={onSubmit}>
                <div className="input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
                    <input type="email" name='email' required className="grow" placeholder="Email" />
                </div>
                <div className="input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
                    <input name='password' type="password" required className="grow" placeholder='Password' />
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
                        />: "Sign In"
                    }
                </button>
                <div>
                    Not registered yet? <Link to='/register'>Register</Link>
                </div>
            </form>
        </div>
    )
}

export default Login