import { useEffect, useState } from 'react'
import ChatComponent from '../../components/chatComponent'
import Leftsidebar from '../../components/leftSideBar'
import { useToast } from '../../components/toast'
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import apiClient from '../../utils/apiClient'
import ChatbotInterface from '../../components/chatbotInterface'
import ChatbotModel from '../../components/chatbotModel'
import { RotatingLines } from "react-loader-spinner"
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../../redux/auth/actions';
import UserImage from '../../assets/icon-user.png'
import axios from "axios"
import EditProfileModal from '../../components/editProfileModal';
import ChangePasswordModal from '../../components/changePasswordModal';
import { changeTheme } from '../../redux/settings/actions';

const Dashboard = () => {
    const { addToast } = useToast();
    const [session_id, setSessionId] = useState<string>();  
    const [bot_id, setBotId] = useState<string>('');
    const [mode, setMode] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [selectedBot, setSelectedBot] = useState<any>(null);
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const { theme } = useSelector((state: any) => state.SettingsReducer.settings);
    
    const dispatch = useDispatch();
    const me = useSelector((state: any) => state.AuthReducer.user)

    const isEmpty = (obj: Object) => {
        return Object.entries(obj).length === 0;
    }

    const onSelectChatbot = (botItem: any) => {
        setSelectedBot({...botItem});
        apiClient.post(`${import.meta.env.VITE_API_URL}/chatbot/create_session`, {
            chatbot_id: botItem.id,
            user_id: me && Object.entries(me).length !== 0 ? me.id: null
        })
            .then(response => {
                setMode(0)
                setSessionId(response.data)
            })
            .catch(reason => {
                addToast(reason.response.data.message, 'error')
            })
    }

    const deleteBotClicked = async () => {
        try {

            setIsDeleting(true);
            const res = await apiClient.post(`${import.meta.env.VITE_API_URL}/chatbot/delete_chatbot`, {
                id: bot_id
            });
            
            if(res.status != 200) {
                addToast(res.data.message, 'error');
                setIsDeleting(false);
                return;
            }

            addToast("Successfully deleted!", "success");

            setRefresh((prev) => !prev);
            setSessionId("");
            setBotId("");
            setIsModalOpen(false);
        }
        catch (ex) {
            console.log(ex);

            addToast("Something went wrong, please try again", 'error');
        }
        finally {
            
            setIsDeleting(false);
        }
    }

    const onChatbotInterface = (id: string) => {
        setMode(1);
        setBotId(id);
    }

    const onChatbotModel = (id: string) => {
        setMode(2);
        setBotId(id);
    }

    const onChatbotDelete = async (id: string) => {
        setIsModalOpen(true);
        setBotId(id);
    }

    useEffect(() => {
    }, [bot_id]);

    useEffect(() => {

    }, [refresh]);

    const logout = () => {
        localStorage.removeItem('token')
        dispatch(setUserData({}))
        axios.interceptors.request.use(config => {
            config.headers['Authorization'] = ""
            return config
        }, error => Promise.reject(error))
    }

    return (
        <>
            <div className="flex h-[100vh]">
                
                <Leftsidebar
                    onSelectChatbot={onSelectChatbot}
                    onChatbotInterface={onChatbotInterface}
                    onChatbotDelete={onChatbotDelete}
                    onChatbotModel={onChatbotModel}
                    refresh={refresh}
                    activeBot={selectedBot}
                />
                {
                    mode == 0 && session_id &&
                    <ChatComponent session_id={session_id} activeBot={selectedBot}/>
                }
                {
                    mode == 1 && bot_id &&
                    <ChatbotInterface bot_id={bot_id} />
                }
                {
                    mode == 2 && bot_id &&
                    <ChatbotModel bot_id={bot_id} />
                }
                {
                    isModalOpen && bot_id &&
                    
                    <Modal
                        open={isModalOpen}
                        onClose={() => { setIsModalOpen(false); }}
                        classNames={{ modal: "customModal" }}
                        center
                    >
                        <h2 className='text-2xl'>Confirm chatbot deletion</h2>
                        <p className='mb-5 mt-2'>Are you sure you want to delete this chatbot?<br></br>This action cannot be undone.<br></br>Deleting the chatbot will permanently remove it from your account. Any associated data or configurations will also be lost.</p>
                        <div className=' flex justify-end items-center gap-4'>
                            <button className='btn btn-error' onClick={deleteBotClicked}>
                            { isDeleting
                                ? <RotatingLines
                                    visible={true}
                                    width="24"
                                    strokeWidth="5"
                                    animationDuration="0.75"
                                    ariaLabel="rotating-lines-loading"
                                />
                                : "Delete"
                            }
                            </button>
                            <button className='btn' onClick={() => { setIsModalOpen(false); }}>Cancel</button>
                        </div>
                    </Modal>
                }
            </div>
            <div className='fixed right-1 top-4 flex pr-12'>
                <label className="flex cursor-pointer gap-2 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
                    <input type="checkbox"
                        className="toggle"
                        onChange={() => {
                            const savedTheme = localStorage.getItem('theme');
                            let newTheme = savedTheme === 'light'? 'dark': 'light'
                            localStorage.setItem('theme', newTheme);
                            dispatch(changeTheme(newTheme));
                        }}
                        checked={theme === 'dark'}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </label>
                {
                    me && !isEmpty(me) &&
                    <>
                        <div className="dropdown dropdown-bottom ml-5 flex">
                            <div tabIndex={0}
                                role="button"
                                className="flex items-center gap-2 justify-start shadow-none my-auto"
                            >
                                <div className="avatar">
                                    <div className="w-10 rounded-full border border-gray-500">
                                        <img src={me.img_id ? `${import.meta.env.VITE_API_URL}/chatbot/avatar/${me.img_id}` : UserImage} />
                                    </div>
                                </div>
                                <p className="text-lg">
                                    {me.first_name} {me.last_name}
                                </p>
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44 mr-5">
                                <li onClick={() => setShowProfileModal(true)}><a>Profile</a></li>
                                <li onClick={() => setShowPasswordModal(true)}><a>Change Password</a></li>
                                <li onClick={logout}><a>Logout</a></li>
                            </ul>
                        </div>
                    </>
                }
                { 
                    me && !isEmpty(me) && 
                    <EditProfileModal 
                        open={showProfileModal}
                        handleCloseProfileModal={() => setShowProfileModal(false)}
                    />
                }
                { 
                    me && !isEmpty(me) && 
                    <ChangePasswordModal 
                        open={showPasswordModal}
                        handleClosePasswordModal={() => setShowPasswordModal(false)}
                    />
                }
            </div>
        </>
    )
}

export default Dashboard